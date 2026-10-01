import { useAlerts } from '@/hooks/useAlerts'
import { useFilters } from '@/hooks/useFilters'
import { AlertList } from '@/components/AlertList'
import { SearchBar } from '@/components/SearchBar'
import { FilterBar } from '@/components/FilterBar'
import { FavoriteLines } from '@/components/FavoriteLines'
import { LineSelector } from '@/components/LineSelector'
import { Header } from '@/components/Header'

export function AlertsPage() {
  const {
    filters,
    setQuery,
    setSeverity,
    setStatus,
    setTransitType,
    toggleLineFilter,
    clearLineFilters,
    resetFilters,
  } = useFilters()

  const { alerts, isLoading, error, lastUpdated, refresh } = useAlerts(filters)

  const activeCount = alerts.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header lastUpdated={lastUpdated} onRefresh={refresh} />

      <div
        style={{
          display: 'flex',
          flex: 1,
          maxWidth: 1200,
          width: '100%',
          margin: '0 auto',
          padding: '24px 16px',
          gap: 24,
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside
          aria-label="Filters and favorites"
          style={{
            width: 240,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <FavoriteLines
            activeLineFilters={filters.lineIds}
            onToggleLine={toggleLineFilter}
          />
          <div
            style={{
              height: 1,
              backgroundColor: 'var(--border)',
            }}
          />
          <LineSelector
            activeLineIds={filters.lineIds}
            onToggleLine={toggleLineFilter}
          />
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <SearchBar value={filters.query} onChange={setQuery} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <FilterBar
                filters={filters}
                onSeverityChange={setSeverity}
                onStatusChange={setStatus}
                onTransitTypeChange={setTransitType}
                onReset={resetFilters}
              />
              {!isLoading && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {activeCount} alert{activeCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Active line chips */}
            {filters.lineIds.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing:</span>
                {filters.lineIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => toggleLineFilter(id)}
                    aria-label={`Remove ${id} filter`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--mta-blue)',
                      backgroundColor: 'rgba(0,57,166,0.08)',
                      color: 'var(--mta-blue)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {id} ×
                  </button>
                ))}
                <button
                  onClick={clearLineFilters}
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          <AlertList alerts={alerts} isLoading={isLoading} error={error} />
        </main>
      </div>
    </div>
  )
}
