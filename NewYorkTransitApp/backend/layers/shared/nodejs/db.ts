import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

// Single shared DynamoDB Document client — reused across warm Lambda invocations
const raw = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' })

export const ddb = DynamoDBDocumentClient.from(raw, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
})

export const TABLE_NAME = process.env.DYNAMODB_TABLE ?? 'nyc-transit-alerts'
