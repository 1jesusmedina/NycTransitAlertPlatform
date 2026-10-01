import { Star, X } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { LineBadge } from './LineBadge'
import { ALL_LINES } from '@/utils/transitLines'

interface FavoriteLinesProps {
  activeLineFilters: string[]
  onToggleLine: (lineId: string) => void
}

export function FavoriteLines({ activeLineFilters, onToggleLine }: FavoriteLinesProps) {
  const { favoriteIds, toggleFavorite, syncError } = useFavorites()

  const favoriteLines = ALL_LINES.filter((l) => favoriteIds.includes(l.id))

  if (favoriteLines.length === 0) {
    return (
      <section aria-label="Favorite lines">
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
          Favorites
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Star a line to pin it here for quick filtering.
        </p>
      </section>
    )
  }

  return (
    <section aria-label="Favorite lines">
      <h2
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Star size={12} fill="currentColor" />
        Favorites
      </h2>

      {syncError && (
        <p
          role="alert"
          style={{
            fontSize: 12,
            color: '#B45309',
            backgroundColor: '#FEF3C7',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 8,
          }}
        >
        {syncError}
        </p>
      )}

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {favoriteLines.map((line) => {
          const isActive = activeLineFilters.includes(line.id)
          return (
            <li key={line.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(0,57,166,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(0,57,166,0.2)' : '1px solid transparent',
                }}
              >
                {/* Filter toggle */}
                <button
                  onClick={() => onToggleLine(line.id)}
                  aria-label={`${isActive ? 'Remove' : 'Add'} ${line.name} line filter`}
                  aria-pressed={isActive}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <LineBadge line={line} size="sm" />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--mta-blue)' : 'var(--text-primary)',
                    }}
                  >
                    {line.type === 'BUS' ? `Bus ${line.name}` : `${line.name} train`}
                  </span>
                </button>

                {/* Remove from favorites */}
                <button
                  onClick={() => void toggleFavorite(line)}
                  aria-label={`Remove ${line.name} from favorites`}
                  style={{
                    display: 'flex',
                    padding: 4,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
