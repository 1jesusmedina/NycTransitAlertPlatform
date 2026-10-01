import { useState, useCallback } from 'react'
import type { AlertFilters } from '@/types'

const DEFAULT_FILTERS: AlertFilters = {
  severity: 'ALL',
  status: 'ACTIVE',
  transitType: 'ALL',
  lineIds: [],
  query: '',
}

export function useFilters(initial: Partial<AlertFilters> = {}) {
  const [filters, setFilters] = useState<AlertFilters>({ ...DEFAULT_FILTERS, ...initial })

  const setQuery = useCallback((query: string) => {
    setFilters((f) => ({ ...f, query }))
  }, [])

  const setSeverity = useCallback((severity: AlertFilters['severity']) => {
    setFilters((f) => ({ ...f, severity }))
  }, [])

  const setStatus = useCallback((status: AlertFilters['status']) => {
    setFilters((f) => ({ ...f, status }))
  }, [])

  const setTransitType = useCallback((transitType: AlertFilters['transitType']) => {
    setFilters((f) => ({ ...f, transitType }))
  }, [])

  const toggleLineFilter = useCallback((lineId: string) => {
    setFilters((f) => ({
      ...f,
      lineIds: f.lineIds.includes(lineId)
        ? f.lineIds.filter((id) => id !== lineId)
        : [...f.lineIds, lineId],
    }))
  }, [])

  const clearLineFilters = useCallback(() => {
    setFilters((f) => ({ ...f, lineIds: [] }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  return {
    filters,
    setQuery,
    setSeverity,
    setStatus,
    setTransitType,
    toggleLineFilter,
    clearLineFilters,
    resetFilters,
  }
}
