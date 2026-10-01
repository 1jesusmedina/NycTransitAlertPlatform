import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Alert, AlertFilters } from '@/types'
import { alertsApi } from '@/services/api'

const POLL_INTERVAL_MS = 60_000

export function useAlerts(filters: AlertFilters) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Stable serialized key — prevents new object reference on every render
  // from triggering infinite fetchAlerts → useEffect → fetchAlerts loops
  const filtersKey = useMemo(
    () => JSON.stringify(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filters.severity,
      filters.status,
      filters.transitType,
      filters.query,
      // Sort lineIds so ["A","C"] and ["C","A"] produce the same key
      [...filters.lineIds].sort().join(','),
    ]
  )

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertsApi.list(JSON.parse(filtersKey) as AlertFilters)
      setAlerts(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alerts')
    } finally {
      setIsLoading(false)
    }
  }, [filtersKey])

  useEffect(() => {
    setIsLoading(true)
    void fetchAlerts()

    intervalRef.current = setInterval(() => void fetchAlerts(), POLL_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchAlerts])

  return { alerts, isLoading, error, lastUpdated, refresh: fetchAlerts }
}

export function useAlert(id: string | undefined) {
  const [alert, setAlert] = useState<Alert | null>(null)
  const [isLoading, setIsLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    alertsApi
      .get(id)
      .then((data) => {
        setAlert(data)
        setError(null)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Alert not found')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  return { alert, isLoading, error }
}
