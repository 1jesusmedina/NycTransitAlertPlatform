/**
 * GET /alerts
 *
 * Query parameters (all optional):
 *   q           – full-text search across title + description + line IDs
 *   severity    – AlertSeverity enum value
 *   status      – AlertStatus enum value
 *   transitType – TransitType enum value
 *   lineIds     – comma-separated line IDs (e.g. "A,C,E")
 *   limit       – max results to return (default 50, max 200)
 *
 * GET /alerts/{id}
 *   Returns a single alert by ID.
 *
 * Strategy:
 *   1. Query DynamoDB GSI1 (STATUS#<status>) for status-filtered results.
 *   2. Apply remaining filters in memory.
 *   3. On cache miss for the whole table, trigger a background MTA fetch
 *      and write results into DynamoDB before responding.
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { QueryCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE_NAME } from '/opt/nodejs/db'
import { ok, notFound, serverError, corsOptions, badRequest } from '/opt/nodejs/response'
import type { Alert, AlertItem, AlertSeverity, AlertStatus, TransitType } from '/opt/nodejs/types'
import { fetchMtaAlerts } from '/opt/nodejs/mtaClient'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

// ── Handler ───────────────────────────────────────────────────────────────────

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') return corsOptions()

  try {
    // Single alert by ID
    const alertId = event.pathParameters?.id
    if (alertId) {
      return await getAlertById(alertId)
    }

    // List with filters
    return await listAlerts(event)
  } catch (err) {
    console.error('[getAlerts] Unhandled error:', err)
    return serverError()
  }
}

// ── Single alert ──────────────────────────────────────────────────────────────

async function getAlertById(id: string): Promise<APIGatewayProxyResult> {
  const result = await ddb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ALERT#${id}`, SK: `ALERT#${id}` },
    })
  )

  if (!result.Item) {
    // Try fetching from MTA directly as a fallback
    return notFound(`Alert ${id} not found`)
  }

  const item = result.Item as AlertItem
  return ok<Alert>(itemToAlert(item))
}

// ── List alerts ───────────────────────────────────────────────────────────────

async function listAlerts(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const qs = event.queryStringParameters ?? {}

  const status = (qs.status as AlertStatus | undefined) ?? 'ACTIVE'
  const severity = qs.severity as AlertSeverity | undefined
  const transitType = qs.transitType as TransitType | undefined
  const lineIds = qs.lineIds ? qs.lineIds.split(',').map((s) => s.trim().toUpperCase()) : []
  const query = qs.q?.trim().toLowerCase() ?? ''
  const limit = Math.min(parseInt(qs.limit ?? String(DEFAULT_LIMIT), 10), MAX_LIMIT)

  if (isNaN(limit) || limit < 1) {
    return badRequest('limit must be a positive integer')
  }

  // Query by status using GSI1
  let items: AlertItem[]
  if (status === 'ALL') {
    const scan = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: { ':prefix': 'ALERT#' },
      })
    )
    items = (scan.Items ?? []) as AlertItem[]
  } else {
    const queryResult = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeValues: { ':gsi1pk': `STATUS#${status}` },
        ScanIndexForward: false, // newest first
      })
    )
    items = (queryResult.Items ?? []) as AlertItem[]
  }

  // If DynamoDB is empty, prime it from MTA
  if (items.length === 0) {
    console.info('[getAlerts] DynamoDB empty — fetching from MTA')
    const { alerts } = await fetchMtaAlerts()
    if (alerts.length > 0) {
      await writeAlertsToDynamo(alerts)
      items = alerts.map(alertToItem)
    }
  }

  // In-memory filters
  let alerts: Alert[] = items.map(itemToAlert)

  if (severity) {
    alerts = alerts.filter((a) => a.severity === severity)
  }

  if (transitType) {
    alerts = alerts.filter((a) =>
      a.affectedLines.some((l) => l.type === transitType)
    )
  }

  if (lineIds.length > 0) {
    alerts = alerts.filter((a) =>
      a.affectedLines.some((l) => lineIds.includes(l.id))
    )
  }

  if (query) {
    alerts = alerts.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.affectedLines.some(
          (l) =>
            l.id.toLowerCase().includes(query) ||
            l.name.toLowerCase().includes(query)
        )
    )
  }

  // Sort by updatedAt desc, then apply limit
  alerts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  const paged = alerts.slice(0, limit)

  return ok({
    data: paged,
    meta: {
      total: alerts.length,
      returned: paged.length,
      updatedAt: new Date().toISOString(),
    },
  })
}

// ── DynamoDB ↔ Alert transforms ───────────────────────────────────────────────

function itemToAlert(item: AlertItem): Alert {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    severity: item.severity,
    status: item.status,
    affectedLines: item.affectedLines,
    activePeriods: item.activePeriods,
    updatedAt: item.updatedAt,
    createdAt: item.createdAt,
    url: item.url,
  }
}

function alertToItem(alert: Alert): AlertItem {
  return {
    PK: `ALERT#${alert.id}`,
    SK: `ALERT#${alert.id}`,
    GSI1PK: `STATUS#${alert.status}`,
    GSI1SK: `UPDATED#${alert.updatedAt}`,
    ...alert,
  }
}

async function writeAlertsToDynamo(alerts: Alert[]): Promise<void> {
  // Write in batches — DynamoDB BatchWrite max is 25 items
  const BATCH_SIZE = 25
  for (let i = 0; i < alerts.length; i += BATCH_SIZE) {
    const batch = alerts.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map((alert) =>
        ddb.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: alertToItem(alert),
          })
        )
      )
    )
  }
}
