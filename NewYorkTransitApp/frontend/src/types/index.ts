// ─── Alert Types ──────────────────────────────────────────────────────────────

export type AlertSeverity = 'NO_SERVICE' | 'REDUCED_SERVICE' | 'SIGNIFICANT_DELAYS' | 'PLANNED_WORK' | 'SERVICE_CHANGE' | 'INFORMATION';

export type AlertStatus = 'ACTIVE' | 'UPCOMING' | 'PAST';

export type TransitType = 'SUBWAY' | 'BUS' | 'LIRR' | 'METRO_NORTH' | 'STATEN_ISLAND_RAILWAY';

export interface AlertPeriod {
  start: string; // ISO 8601
  end: string | null;
}

export interface AlertAffectedLine {
  id: string;       // e.g. "A", "1", "B46", "LIRR"
  name: string;
  type: TransitType;
  color: string;    // hex
  textColor: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  affectedLines: AlertAffectedLine[];
  activePeriods: AlertPeriod[];
  updatedAt: string;
  createdAt: string;
  url?: string;
}

// ─── Line Types ───────────────────────────────────────────────────────────────

export interface TransitLine {
  id: string;
  name: string;
  type: TransitType;
  color: string;
  textColor: string;
  group: string;    // e.g. "IND Eighth Avenue Line"
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export interface FavoriteLine {
  lineId: string;
  userId: string;
  savedAt: string;
  line: TransitLine;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    updatedAt: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// ─── Filter / Search State ────────────────────────────────────────────────────

export type SeverityFilter = AlertSeverity | 'ALL';
export type StatusFilter = AlertStatus | 'ALL';
export type TransitTypeFilter = TransitType | 'ALL';

export interface AlertFilters {
  severity: SeverityFilter;
  status: StatusFilter;
  transitType: TransitTypeFilter;
  lineIds: string[];
  query: string;
}
