import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star, ArrowLeft } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAlerts } from '@/hooks/useAlerts'
import { AlertList } from '@/components/AlertList'
import { LineBadge } from '@/components/LineBadge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Header } from '@/components/Header'
import { ALL_LINES } from '@/utils/transitLines'
import type { AlertFilters } from '@/types'

const BASE_FILTERS: Omit<AlertFilters, 'lineIds'> = {
  severity: 'ALL',
  status: 'ALL',
  transitType: 'ALL',
  query: '',
}

export function FavoritesPage() {
  const { favoriteIds } = useFavorites()
  const favoriteLines = ALL_LINES.filter((l) => favoriteIds.includes(l.id))

  // Local line filter — tapping a chip narrows alerts to that subset
  const [activeLineIds, setActiveLineIds] = useState<string[]>([])

  const toggleLine = (lineId: string) => {
    setActiveLineIds((prev) =>
      prev.includes(lineId) ? prev.filter((id) => id !== lineId) : [...prev, lineId]
    )
  }

  // Derive the filter object — use active chip selection, else all favorites.
  // If there are no favorites at all, pass a sentinel that matches nothing
  // so the empty state renders instead of all alerts.
  const filters = useMemo<AlertFilters>(() => {
    if (favoriteIds.length === 0) {
      return { ...BASE_FILTERS, lineIds: ['__no_match__'] }
    }
    return {
      ...BASE_FILTERS,
      lineIds: activeLineIds.length > 0 ? activeLineIds : favoriteIds,
    }
  }, [favoriteIds, activeLineIds])

  const { alerts, isLoading, error, lastUpdated, refresh } = useAlerts(filters)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header lastUpdated={lastUpdated} onRefresh={refresh} />

      <div style={{ maxWidth: 800, width: '100%', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            <ArrowLeft size={16} />
            All alerts
          </Link>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Star size={22} fill="var(--mta-yellow)" color="var(--mta-yellow)" />
            My Favorite Lines
          </h1>
        </div>

        {favoriteLines.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <>
            {/* Favorite line chips */}
            <section aria-label="Saved lines" style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 10,
                }}
              >
                Saved lines — tap to filter alerts
              </h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {favoriteLines.map((line) => {
                  const isActive = activeLineIds.includes(line.id)
                  return (
                    <div
                      key={line.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        border: isActive
                          ? '1px solid var(--mta-blue)'
                          : '1px solid var(--border)',
                        backgroundColor: isActive
                          ? 'rgba(0,57,166,0.06)'
                          : 'var(--bg-card)',
                        transition: 'all var(--transition)',
                      }}
                    >
                      <button
                        onClick={() => toggleLine(line.id)}
                        aria-pressed={isActive}
                        aria-label={`${isActive ? 'Remove' : 'Filter by'} ${line.name} line`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: isActive ? 600 : 400,
                          fontSize: 14,
                          color: isActive ? 'var(--mta-blue)' : 'var(--text-primary)',
                        }}
                      >
                        <LineBadge line={line} size="sm" />
                        {line.name}
                      </button>
                      <FavoriteButton line={line} size="sm" />
                    </div>
                  )
                })}
              </div>

              {activeLineIds.length > 0 && (
                <button
                  onClick={() => setActiveLineIds([])}
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Show all favorites
                </button>
              )}
            </section>

            <section>
              <h2
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  marginBottom: 14,
                }}
              >
                Alerts for your lines
              </h2>
              <AlertList alerts={alerts} isLoading={isLoading} error={error} />
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyFavorites() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '64px 24px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">⭐</div>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No favorites yet</h2>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-muted)',
          maxWidth: 320,
          margin: '0 auto 20px',
        }}
      >
        Browse the alerts page and tap the star icon next to any line to save it here.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          backgroundColor: 'var(--mta-blue)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          fontWeight: 500,
          textDecoration: 'none',
        }}
      >
        Browse alerts
      </Link>
    </div>
  )
}
