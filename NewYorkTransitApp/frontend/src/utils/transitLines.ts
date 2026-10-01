import type { TransitLine, AlertSeverity } from '@/types'

// MTA official line colors
export const SUBWAY_LINES: TransitLine[] = [
  // IND Eighth Avenue Line
  { id: 'A', name: 'A', type: 'SUBWAY', color: '#0039A6', textColor: '#FFFFFF', group: '8th Ave / Fulton' },
  { id: 'C', name: 'C', type: 'SUBWAY', color: '#0039A6', textColor: '#FFFFFF', group: '8th Ave / Fulton' },
  { id: 'E', name: 'E', type: 'SUBWAY', color: '#0039A6', textColor: '#FFFFFF', group: '8th Ave / Fulton' },
  // IND Sixth Avenue Line
  { id: 'B', name: 'B', type: 'SUBWAY', color: '#FF6319', textColor: '#FFFFFF', group: '6th Ave / Rockaway' },
  { id: 'D', name: 'D', type: 'SUBWAY', color: '#FF6319', textColor: '#FFFFFF', group: '6th Ave / Rockaway' },
  { id: 'F', name: 'F', type: 'SUBWAY', color: '#FF6319', textColor: '#FFFFFF', group: '6th Ave / Rockaway' },
  { id: 'M', name: 'M', type: 'SUBWAY', color: '#FF6319', textColor: '#FFFFFF', group: '6th Ave / Rockaway' },
  // IRT Lexington Avenue Line
  { id: '4', name: '4', type: 'SUBWAY', color: '#00933C', textColor: '#FFFFFF', group: 'Lexington Ave' },
  { id: '5', name: '5', type: 'SUBWAY', color: '#00933C', textColor: '#FFFFFF', group: 'Lexington Ave' },
  { id: '6', name: '6', type: 'SUBWAY', color: '#00933C', textColor: '#FFFFFF', group: 'Lexington Ave' },
  // IRT Broadway–Seventh Avenue Line
  { id: '1', name: '1', type: 'SUBWAY', color: '#EE352E', textColor: '#FFFFFF', group: 'Broadway-7th Ave' },
  { id: '2', name: '2', type: 'SUBWAY', color: '#EE352E', textColor: '#FFFFFF', group: 'Broadway-7th Ave' },
  { id: '3', name: '3', type: 'SUBWAY', color: '#EE352E', textColor: '#FFFFFF', group: 'Broadway-7th Ave' },
  // BMT Broadway Line
  { id: 'N', name: 'N', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000', group: 'Broadway (BMT)' },
  { id: 'Q', name: 'Q', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000', group: 'Broadway (BMT)' },
  { id: 'R', name: 'R', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000', group: 'Broadway (BMT)' },
  { id: 'W', name: 'W', type: 'SUBWAY', color: '#FCCC0A', textColor: '#000000', group: 'Broadway (BMT)' },
  // IND Crosstown Line
  { id: 'G', name: 'G', type: 'SUBWAY', color: '#6CBE45', textColor: '#000000', group: 'Crosstown' },
  // BMT Canarsie Line
  { id: 'L', name: 'L', type: 'SUBWAY', color: '#A7A9AC', textColor: '#000000', group: 'Canarsie (BMT)' },
  // IRT Flushing Line
  { id: '7', name: '7', type: 'SUBWAY', color: '#B933AD', textColor: '#FFFFFF', group: 'Flushing' },
  // Shuttles
  { id: 'S', name: 'S', type: 'SUBWAY', color: '#808183', textColor: '#FFFFFF', group: 'Shuttles' },
  // SIR
  { id: 'SIR', name: 'SIR', type: 'STATEN_ISLAND_RAILWAY', color: '#1D6AB2', textColor: '#FFFFFF', group: 'Staten Island Rwy' },
  // LIRR
  { id: 'LIRR', name: 'LIRR', type: 'LIRR', color: '#009B77', textColor: '#FFFFFF', group: 'LIRR' },
  // Metro-North
  { id: 'MNR', name: 'Metro-North', type: 'METRO_NORTH', color: '#009B77', textColor: '#FFFFFF', group: 'Metro-North' },
]

export const BUS_LINES: TransitLine[] = [
  { id: 'M15', name: 'M15', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF', group: 'Manhattan' },
  { id: 'M86', name: 'M86', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF', group: 'Manhattan' },
  { id: 'Bx12', name: 'Bx12', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF', group: 'Bronx' },
  { id: 'B44', name: 'B44', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF', group: 'Brooklyn' },
  { id: 'Q58', name: 'Q58', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF', group: 'Queens' },
  { id: 'S79', name: 'S79', type: 'BUS', color: '#6B7280', textColor: '#FFFFFF', group: 'Staten Island' },
]

export const ALL_LINES: TransitLine[] = [...SUBWAY_LINES, ...BUS_LINES]

export const LINE_MAP: Record<string, TransitLine> = Object.fromEntries(
  ALL_LINES.map((l) => [l.id, l])
)

// ─── Severity helpers ─────────────────────────────────────────────────────────

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  NO_SERVICE: 'No Service',
  REDUCED_SERVICE: 'Reduced Service',
  SIGNIFICANT_DELAYS: 'Significant Delays',
  PLANNED_WORK: 'Planned Work',
  SERVICE_CHANGE: 'Service Change',
  INFORMATION: 'Information',
}

export const SEVERITY_COLORS: Record<AlertSeverity, { bg: string; text: string; border: string }> = {
  NO_SERVICE:          { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  REDUCED_SERVICE:     { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  SIGNIFICANT_DELAYS:  { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  PLANNED_WORK:        { bg: '#EFF6FF', text: '#1E40AF', border: '#93C5FD' },
  SERVICE_CHANGE:      { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
  INFORMATION:         { bg: '#F0FDF4', text: '#166534', border: '#86EFAC' },
}

export function getLineById(id: string): TransitLine | undefined {
  return LINE_MAP[id]
}

export function formatAlertTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
