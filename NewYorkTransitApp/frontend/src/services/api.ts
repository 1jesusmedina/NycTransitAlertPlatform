import type { Alert, AlertFilters, FavoriteLine, TransitLine } from '@/types'
import { MOCK_ALERTS } from './mockData'

// Base URL is set via environment variable injected at build time.
// Vite exposes VITE_* env vars to the client bundle.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
const USE_MOCK = !BASE_URL || import.meta.env.VITE_USE_MOCK === 'true'

// ── Generic fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg = (body as { message?: string }).message ?? res.statusText
    throw new Error(msg)
  }
  // Unwrap { data: T } envelope if present, otherwise return raw body
  const json = (await res.json()) as unknown
  if (
    json !== null &&
    typeof json === 'object' &&
    'data' in (json as object)
  ) {
    return (json as { data: T }).data
  }
  return json as T
}

// ── Alerts API ─────────────────────────────────────────────────────────────────

export const alertsApi = {
  async list(filters: AlertFilters): Promise<Alert[]> {
    if (USE_MOCK) return filterMockAlerts(filters)

    const params = new URLSearchParams()
    if (filters.severity !== 'ALL') params.set('severity', filters.severity)
    if (filters.status !== 'ALL') params.set('status', filters.status)
    if (filters.transitType !== 'ALL') params.set('transitType', filters.transitType)
    if (filters.lineIds.length) params.set('lineIds', filters.lineIds.join(','))
    if (filters.query) params.set('q', filters.query)

    return apiFetch<Alert[]>(`/alerts?${params.toString()}`)
  },

  async get(id: string): Promise<Alert> {
    if (USE_MOCK) {
      const found = MOCK_ALERTS.find((a) => a.id === id)
      if (!found) throw new Error('Alert not found')
      return found
    }
    return apiFetch<Alert>(`/alerts/${id}`)
  },
}

// ── Favorites API ──────────────────────────────────────────────────────────────

export const favoritesApi = {
  async list(userId: string): Promise<FavoriteLine[]> {
    if (USE_MOCK) throw new Error('mock')
    return apiFetch<FavoriteLine[]>(`/favorites/${userId}`)
  },

  async add(userId: string, line: TransitLine): Promise<FavoriteLine> {
    if (USE_MOCK) throw new Error('mock')
    return apiFetch<FavoriteLine>(`/favorites/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ lineId: line.id, line }),
    })
  },

  async remove(userId: string, lineId: string): Promise<void> {
    if (USE_MOCK) throw new Error('mock')
    await apiFetch<void>(`/favorites/${userId}/${lineId}`, { method: 'DELETE' })
  },
}

// ── Mock data filtering ────────────────────────────────────────────────────────

function filterMockAlerts(filters: AlertFilters): Alert[] {
  return MOCK_ALERTS.filter((alert) => {
    if (filters.severity !== 'ALL' && alert.severity !== filters.severity) return false
    if (filters.status !== 'ALL' && alert.status !== filters.status) return false
    if (
      filters.transitType !== 'ALL' &&
      !alert.affectedLines.some((l) => l.type === filters.transitType)
    )
      return false
    if (
      filters.lineIds.length > 0 &&
      !alert.affectedLines.some((l) => filters.lineIds.includes(l.id))
    )
      return false
    if (filters.query) {
      const q = filters.query.toLowerCase()
      const matchTitle = alert.title.toLowerCase().includes(q)
      const matchDesc = alert.description.toLowerCase().includes(q)
      const matchLine = alert.affectedLines.some(
        (l) => l.id.toLowerCase().includes(q) || l.name.toLowerCase().includes(q)
      )
      if (!matchTitle && !matchDesc && !matchLine) return false
    }
    return true
  })
}
