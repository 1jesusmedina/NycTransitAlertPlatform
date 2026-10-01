import type { APIGatewayProxyResult } from 'aws-lambda'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN ?? '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
}

export function ok<T>(body: T, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify(body),
  }
}

export function created<T>(body: T): APIGatewayProxyResult {
  return ok(body, 201)
}

export function noContent(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  }
}

export function badRequest(message: string): APIGatewayProxyResult {
  return error(400, 'BAD_REQUEST', message)
}

export function notFound(message = 'Not found'): APIGatewayProxyResult {
  return error(404, 'NOT_FOUND', message)
}

export function serverError(message = 'Internal server error'): APIGatewayProxyResult {
  return error(500, 'INTERNAL_ERROR', message)
}

export function corsOptions(): APIGatewayProxyResult {
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  }
}

function error(statusCode: number, code: string, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    body: JSON.stringify({ message, code, statusCode }),
  }
}
