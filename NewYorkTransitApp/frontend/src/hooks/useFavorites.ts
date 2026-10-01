import { useState, useEffect, useCallback } from 'react'
import type { FavoriteLine, TransitLine } from '@/types'
import { favoritesApi } from '@/services/api'

const STORAGE_KEY = 'nyc-transit-favorites'
const GUEST_USER_ID = 'guest'

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function saveToStorage(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // storage quota exceeded — ignore
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFromStorage)
  const [syncError, setSyncError] = useState<string | null>(null)

  // On mount: try to pull saved favorites from the API.
  // On any failure (mock mode, offline, etc.) keep localStorage as-is.
  useEffect(() => {
    let cancelled = false
    favoritesApi
      .list(GUEST_USER_ID)
      .then((favs: FavoriteLine[]) => {
        if (cancelled) return
        const ids = favs.map((f) => f.lineId)
        setFavoriteIds(ids)
        saveToStorage(ids)
      })
      .catch(() => {
        // Expected in mock/offline mode — localStorage is the source of truth
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isFavorite = useCallback(
    (lineId: string) => favoriteIds.includes(lineId),
    [favoriteIds]
  )

  const toggleFavorite = useCallback(
    async (line: TransitLine) => {
      const already = favoriteIds.includes(line.id)
      const next = already
        ? favoriteIds.filter((id) => id !== line.id)
        : [...favoriteIds, line.id]

      // Always apply locally first — localStorage is source of truth
      setFavoriteIds(next)
      saveToStorage(next)
      setSyncError(null)

      // Best-effort API sync — failure is non-fatal
      try {
        if (already) {
          await favoritesApi.remove(GUEST_USER_ID, line.id)
        } else {
          await favoritesApi.add(GUEST_USER_ID, line)
        }
      } catch {
        // In mock mode or when API is unavailable, keep the local change.
        // Show a subtle notice only in live mode (when BASE_URL is set).
        const isLive = Boolean(import.meta.env.VITE_API_BASE_URL)
        if (isLive) {
          setSyncError('Saved locally — could not sync to server.')
        }
      }
    },
    [favoriteIds]
  )

  return { favoriteIds, isFavorite, toggleFavorite, syncError }
}
