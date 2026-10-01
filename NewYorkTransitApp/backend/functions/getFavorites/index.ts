/**
 * GET /favorites/{userId}
 *
 * Returns all favorite lines saved by the given user.
 * userId is extracted from the path parameter.
 *
 * In production, replace userId with a value from the Cognito authorizer
 * context (event.requestContext.authorizer.claims.sub) rather than
 * accepting it directly from the path to prevent user-level data leakage.
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE_NAME } from '/opt/nodejs/db'
import { ok, badRequest, serverError, corsOptions } from '/opt/nodejs/response'
import type { FavoriteItem } from '/opt/nodejs/types'

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') return corsOptions()

  const userId = event.pathParameters?.userId
  if (!userId) return badRequest('userId path parameter is required')

  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'FAVORITE#',
        },
        // Return newest saved first
        ScanIndexForward: false,
      })
    )

    const favorites = (result.Items ?? []) as FavoriteItem[]

    return ok({
      data: favorites.map((f) => ({
        lineId: f.lineId,
        userId: f.userId,
        savedAt: f.savedAt,
        line: f.line,
      })),
      meta: {
        total: favorites.length,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[getFavorites] Error:', err)
    return serverError()
  }
}
