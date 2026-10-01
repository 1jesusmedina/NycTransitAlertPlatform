// ─── Shared domain types (mirrors frontend types) ─────────────────────────────

export type AlertSeverity =
  | 'NO_SERVICE'
  | 'REDUCED_SERVICE'
  | 'SIGNIFICANT_DELAYS'
  | 'PLANNED_WORK'
  | 'SERVICE_CHANGE'
  | 'INFORMATION'

export type AlertStatus = 'ACTIVE' | 'UPCOMING' | 'PAST'

export type TransitType =
  | 'SUBWAY'
  | 'BUS'
  | 'LIRR'
  | 'METRO_NORTH'
  | 'STATEN_ISLAND_RAILWAY'

export interface AlertPeriod {
  start: string // ISO 8601
  end: string | null
}

export interface AlertAffectedLine {
  id: string
  name: string
  type: TransitType
  color: string
  textColor: string
}

export interface Alert {
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  affectedLines: AlertAffectedLine[]
  activePeriods: AlertPeriod[]
  updatedAt: string
  createdAt: string
  url?: string
}

export interface TransitLine {
  id: string
  name: string
  type: TransitType
  color: string
  textColor: string
  group: string
}

// ─── DynamoDB item shapes ──────────────────────────────────────────────────────

export interface AlertItem {
  PK: string          // ALERT#<id>
  SK: string          // ALERT#<id>
  GSI1PK: string      // STATUS#<status>
  GSI1SK: string      // UPDATED#<updatedAt>
  id: string
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  affectedLines: AlertAffectedLine[]
  activePeriods: AlertPeriod[]
  updatedAt: string
  createdAt: string
  url?: string
  ttl?: number        // Unix epoch — used to auto-expire PAST alerts
}

export interface FavoriteItem {
  PK: string          // USER#<userId>
  SK: string          // FAVORITE#<lineId>
  userId: string
  lineId: string
  line: TransitLine
  savedAt: string
}

// ─── Lambda response types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    updatedAt: string
  }
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
}

// ─── MTA feed types ────────────────────────────────────────────────────────────

export interface MtaAlert {
  id: string
  headerText: string
  descriptionText: string
  activePeriods: { start: number; end?: number }[]
  informedEntities: { routeId?: string; agencyId?: string }[]
  cause: string
  effect: string
  url?: string
  updatedAt: number
  createdAt: number
}
