/**
 * DELETE /favorites/{userId}/{lineId}
 *
 * Removes a single favorite line for the given user.
 * Returns 204 No Content on success, or 204 even if the item didn't exist
 * (delete is idempotent).
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { ddb, TABLE_NAME } from '/opt/nodejs/db'
import { noContent, badRequest, serverError, corsOptions } from '/opt/nodejs/response'

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === 'OPTIONS') return corsOptions()

  const userId = event.pathParameters?.userId
  const lineId = event.pathParameters?.lineId

  if (!userId) return badRequest('userId path parameter is required')
  if (!lineId) return badRequest('lineId path parameter is required')

  // Sanitize
  if (!/^[A-Za-z0-9\-]{1,20}$/.test(lineId)) {
    return badRequest('lineId contains invalid characters')
  }

  try {
    await ddb.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `FAVORITE#${lineId.toUpperCase()}`,
        },
      })
    )

    return noContent()
  } catch (err) {
    console.error('[deleteFavorite] Error:', err)
    return serverError()
  }
}
