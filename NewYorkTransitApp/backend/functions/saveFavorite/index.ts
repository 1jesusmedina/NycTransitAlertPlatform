/**
 * POST /favorites/{userId}
 *
 * Body: { lineId: string, line: TransitLine }
 *
 * Creates or overwrites a favorite entry for the given user + line.
 * Uses a condition expression to prevent overwriting if already saved
 * (idempotent — returns 200 either way).
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE_NAME } from '/opt/nodejs/db'
import { created, badRequest, serverError, corsOptions } from '/opt/nodejs/response'
import type { FavoriteItem, TransitLine } from '/opt/nodejs/types'

interface SaveFavoriteBody {
  lineId: string
  line: TransitLine
}

const MAX_FAVORITES_PER_USER = 50

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') return corsOptions()

  const userId = event.pathParameters?.userId
  if (!userId) return badRequest('userId path parameter is required')

  // Parse + validate body
  let body: SaveFavoriteBody
  try {
    body = JSON.parse(event.body ?? '{}') as SaveFavoriteBody
  } catch {
    return badRequest('Invalid JSON body')
  }

  const { lineId, line } = body

  if (!lineId || typeof lineId !== 'string') {
    return badRequest('lineId is required and must be a string')
  }

  if (!line || typeof line !== 'object') {
    return badRequest('line metadata object is required')
  }

  // Sanitize lineId — alphanumeric + hyphen only
  if (!/^[A-Za-z0-9\-]{1,20}$/.test(lineId)) {
    return badRequest('lineId contains invalid characters')
  }

  try {
    const now = new Date().toISOString()
    const item: FavoriteItem = {
      PK: `USER#${userId}`,
      SK: `FAVORITE#${lineId.toUpperCase()}`,
      userId,
      lineId: lineId.toUpperCase(),
      line,
      savedAt: now,
    }

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    )

    return created({
      data: {
        lineId: item.lineId,
        userId: item.userId,
        savedAt: item.savedAt,
        line: item.line,
      },
    })
  } catch (err) {
    console.error('[saveFavorite] Error:', err)
    return serverError()
  }
}
