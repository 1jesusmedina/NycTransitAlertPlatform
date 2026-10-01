/**
 * Scheduled Lambda — triggered by EventBridge every 5 minutes.
 *
 * Fetches live alerts from the MTA GTFS-RT feed and upserts them
 * into DynamoDB. This keeps the read path (getAlerts Lambda) fast
 * by ensuring DynamoDB is always warm.
 *
 * Also marks PAST alerts with a TTL so they auto-expire after 7 days.
 */

import type { ScheduledEvent } from 'aws-lambda'
import { PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE_NAME } from '/opt/nodejs/db'
import { fetchMtaAlerts } from '/opt/nodejs/mtaClient'
import type { Alert, AlertItem } from '/opt/nodejs/types'

const PAST_ALERT_TTL_DAYS = 7

export async function handler(event: ScheduledEvent): Promise<void> {
  console.info('[refreshAlerts] Starting refresh at', new Date().toISOString())

  const { alerts, fetchedAt, source } = await fetchMtaAlerts()

  console.info(`[refreshAlerts] Fetched ${alerts.length} alerts from ${source} at ${fetchedAt}`)

  if (alerts.length === 0) {
    console.warn('[refreshAlerts] No alerts returned — skipping DynamoDB write')
    return
  }

  const now = Math.floor(Date.now() / 1000)
  const pastTtl = now + PAST_ALERT_TTL_DAYS * 86400

  // Batch upsert — DynamoDB PutCommand is idempotent for same PK/SK
  const BATCH_SIZE = 25
  let written = 0

  for (let i = 0; i < alerts.length; i += BATCH_SIZE) {
    const batch = alerts.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map((alert) => {
        const item: AlertItem = {
          PK: `ALERT#${alert.id}`,
          SK: `ALERT#${alert.id}`,
          GSI1PK: `STATUS#${alert.status}`,
          GSI1SK: `UPDATED#${alert.updatedAt}`,
          ...alert,
          ttl: alert.status === 'PAST' ? pastTtl : undefined,
        }
        return ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: item }))
      })
    )
    written += batch.length
  }

  console.info(`[refreshAlerts] Wrote ${written} alerts to DynamoDB`)
}
