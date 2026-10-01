/**
 * MTA Service Alerts Client
 *
 * Fetches live service alerts from the MTA GTFS-RT all-alerts feed:
 *   https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fall-alerts
 *
 * The endpoint returns a binary protobuf (GTFS-RT FeedMessage).
 * We decode it with `gtfs-realtime-bindings@2.x` and extract only the
 * `alert` entities — ignoring any trip_update or vehicle entities.
 *
 * Auth: x-api-key request header (set MTA_API_KEY env var).
 */

import { transit_realtime } from 'gtfs-realtime-bindings'
import Long from 'long'
import type {
  Alert,
  AlertAffectedLine,
  AlertPeriod,
  AlertSeverity,
  AlertStatus,
  TransitType,
} from './types'

const MTA_ALERTS_URL =
  'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fall-alerts'

const MTA_API_KEY = process.env.MTA_API_KEY ?? ''

// ── Line metadata ──────────────────────────────────────────────────────────────

const LINE_META: Record<string, { color: string; textColor: string; type: TransitType }> = {
  '1':    { color: '#EE352E', textColor: '#FFFFFF', type: 'SUBWAY' },
  '2':    { color: '#EE352E', textColor: '#FFFFFF', type: 'SUBWAY' },
  '3':    { color: '#EE352E', textColor: '#FFFFFF', type: 'SUBWAY' },
  '4':    { color: '#00933C', textColor: '#FFFFFF', type: 'SUBWAY' },
  '5':    { color: '#00933C', textColor: '#FFFFFF', type: 'SUBWAY' },
  '6':    { color: '#00933C', textColor: '#FFFFFF', type: 'SUBWAY' },
  '7':    { color: '#B933AD', textColor: '#FFFFFF', type: 'SUBWAY' },
  'A':    { color: '#0039A6', textColor: '#FFFFFF', type: 'SUBWAY' },
  'C':    { color: '#0039A6', textColor: '#FFFFFF', type: 'SUBWAY' },
  'E':    { color: '#0039A6', textColor: '#FFFFFF', type: 'SUBWAY' },
  'B':    { color: '#FF6319', textColor: '#FFFFFF', type: 'SUBWAY' },
  'D':    { color: '#FF6319', textColor: '#FFFFFF', type: 'SUBWAY' },
  'F':    { color: '#FF6319', textColor: '#FFFFFF', type: 'SUBWAY' },
  'M':    { color: '#FF6319', textColor: '#FFFFFF', type: 'SUBWAY' },
  'G':    { color: '#6CBE45', textColor: '#000000', type: 'SUBWAY' },
  'J':    { color: '#996633', textColor: '#FFFFFF', type: 'SUBWAY' },
  'Z':    { color: '#996633', textColor: '#FFFFFF', type: 'SUBWAY' },
  'L':    { color: '#A7A9AC', textColor: '#000000', type: 'SUBWAY' },
  'N':    { color: '#FCCC0A', textColor: '#000000', type: 'SUBWAY' },
  'Q':    { color: '#FCCC0A', textColor: '#000000', type: 'SUBWAY' },
  'R':    { color: '#FCCC0A', textColor: '#000000', type: 'SUBWAY' },
  'W':    { color: '#FCCC0A', textColor: '#000000', type: 'SUBWAY' },
  'S':    { color: '#808183', textColor: '#FFFFFF', type: 'SUBWAY' },
  'SI':   { color: '#1D6AB2', textColor: '#FFFFFF', type: 'STATEN_ISLAND_RAILWAY' },
  'SIR':  { color: '#1D6AB2', textColor: '#FFFFFF', type: 'STATEN_ISLAND_RAILWAY' },
  'LIRR': { color: '#009B77', textColor: '#FFFFFF', type: 'LIRR' },
  'MNR':  { color: '#009B77', textColor: '#FFFFFF', type: 'METRO_NORTH' },
}

function lineMetaFor(routeId: string): { color: string; textColor: string; type: TransitType } {
  return (
    LINE_META[routeId.toUpperCase()] ??
    { color: '#6B7280', textColor: '#FFFFFF', type: 'BUS' }
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a protobuf Long or number (Unix seconds) to a JS number.
 * GTFS-RT timestamps are always Unix epoch seconds.
 */
function toSeconds(v: number | Long | null | undefined): number {
  if (v == null) return 0
  if (typeof v === 'number') return v
  // Long.toNumber() is safe here — Unix timestamps fit in 53-bit mantissa
  return (v as Long).toNumber()
}

/** Extract the first English (or first available) string from a TranslatedString. */
function getText(
  ts: transit_realtime.ITranslatedString | null | undefined
): string {
  const translations = ts?.translation
  if (!translations?.length) return ''
  const en = translations.find(
    (t: transit_realtime.TranslatedString.ITranslation) =>
      t.language === 'en' || !t.language
  )
  return ((en ?? translations[0]).text) ?? ''
}

// ── Effect enum → AlertSeverity ───────────────────────────────────────────────

const { Effect } = transit_realtime.Alert

function effectToSeverity(
  effect: transit_realtime.Alert.Effect | null | undefined
): AlertSeverity {
  switch (effect) {
    case Effect.NO_SERVICE:         return 'NO_SERVICE'
    case Effect.REDUCED_SERVICE:    return 'REDUCED_SERVICE'
    case Effect.SIGNIFICANT_DELAYS: return 'SIGNIFICANT_DELAYS'
    case Effect.DETOUR:
    case Effect.MODIFIED_SERVICE:   return 'SERVICE_CHANGE'
    case Effect.ADDITIONAL_SERVICE: return 'PLANNED_WORK'
    default:                        return 'INFORMATION'
  }
}

// ── Active periods → AlertStatus ──────────────────────────────────────────────

function periodsToStatus(
  periods: transit_realtime.ITimeRange[]
): AlertStatus {
  const nowSec = Date.now() / 1000
  const isActive = periods.some((p) => {
    const start = toSeconds(p.start)
    const end   = toSeconds(p.end)
    return start <= nowSec && (end === 0 || end > nowSec)
  })
  if (isActive) return 'ACTIVE'
  const isUpcoming = periods.some((p) => toSeconds(p.start) > nowSec)
  return isUpcoming ? 'UPCOMING' : 'PAST'
}

// ── Transform a single FeedEntity into our Alert shape ────────────────────────

function transformEntity(
  entity: transit_realtime.IFeedEntity,
  feedTimestampSec: number
): Alert | null {
  const a = entity.alert
  if (!a) return null // skip trip_update / vehicle entities

  // Collect unique affected lines
  const seen = new Set<string>()
  const affectedLines: AlertAffectedLine[] = []

  for (const ie of a.informedEntity ?? []) {
    const routeId = ie.routeId
    if (routeId && !seen.has(routeId)) {
      seen.add(routeId)
      affectedLines.push({
        id:   routeId.toUpperCase(),
        name: routeId.toUpperCase(),
        ...lineMetaFor(routeId),
      })
    }
  }

  // Build typed active periods
  const activePeriods: AlertPeriod[] = (a.activePeriod ?? []).map(
    (p: transit_realtime.ITimeRange) => {
      const endSec = toSeconds(p.end)
      return {
        start: new Date(toSeconds(p.start) * 1000).toISOString(),
        end:   endSec > 0 ? new Date(endSec * 1000).toISOString() : null,
      }
    }
  )

  // MTA extends GTFS-RT with mercury: fields. The bindings surface unknown
  // fields as raw bytes, so we fall back to the feed header timestamp.
  const updatedAt = new Date(feedTimestampSec * 1000).toISOString()
  const createdAt = updatedAt

  return {
    id:          entity.id,
    title:       getText(a.headerText),
    description: getText(a.descriptionText),
    severity:    effectToSeverity(a.effect),
    status:      periodsToStatus(a.activePeriod ?? []),
    affectedLines,
    activePeriods,
    updatedAt,
    createdAt,
    url:         getText(a.url) || undefined,
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export interface FetchAlertsResult {
  alerts: Alert[]
  fetchedAt: string
  source: 'mta' | 'fallback'
}

export async function fetchMtaAlerts(): Promise<FetchAlertsResult> {
  if (!MTA_API_KEY) {
    console.warn('[mtaClient] MTA_API_KEY not set — returning empty alerts')
    return { alerts: [], fetchedAt: new Date().toISOString(), source: 'fallback' }
  }

  try {
    const res = await fetch(MTA_ALERTS_URL, {
      headers: { 'x-api-key': MTA_API_KEY },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      throw new Error(`MTA API HTTP ${res.status}: ${res.statusText}`)
    }

    // Decode binary protobuf
    const buffer = await res.arrayBuffer()
    const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer))

    // Feed header timestamp (seconds) — used as fallback for updatedAt/createdAt
    const feedTimestampSec = toSeconds(feed.header.timestamp)

    const alerts: Alert[] = []
    for (const entity of feed.entity) {
      const alert = transformEntity(entity, feedTimestampSec)
      if (alert) alerts.push(alert)
    }

    console.info(
      `[mtaClient] Decoded ${feed.entity.length} entities → ${alerts.length} alerts`
    )

    return {
      alerts,
      fetchedAt: new Date().toISOString(),
      source: 'mta',
    }
  } catch (err) {
    console.error('[mtaClient] Failed to fetch/decode MTA alerts:', err)
    return { alerts: [], fetchedAt: new Date().toISOString(), source: 'fallback' }
  }
}
