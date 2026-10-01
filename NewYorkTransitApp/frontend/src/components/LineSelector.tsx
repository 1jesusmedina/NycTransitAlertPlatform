import { LineBadge } from './LineBadge'
import { FavoriteButton } from './FavoriteButton'
import { SUBWAY_LINES, BUS_LINES } from '@/utils/transitLines'
import type { TransitLine } from '@/types'

interface LineSelectorProps {
  activeLineIds: string[]
  onToggleLine: (lineId: string) => void
}

export function LineSelector({ activeLineIds, onToggleLine }: LineSelectorProps) {
  return (
    <section aria-label="Filter by line">
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
        Subway Lines
      </h2>
      <LineGroup
        lines={SUBWAY_LINES.filter((l) => l.type === 'SUBWAY')}
        activeLineIds={activeLineIds}
        onToggleLine={onToggleLine}
      />

      <h2
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: 18,
          marginBottom: 10,
        }}
      >
        Bus Lines
      </h2>
      <LineGroup
        lines={BUS_LINES}
        activeLineIds={activeLineIds}
        onToggleLine={onToggleLine}
      />
    </section>
  )
}

function LineGroup({
  lines,
  activeLineIds,
  onToggleLine,
}: {
  lines: TransitLine[]
  activeLineIds: string[]
  onToggleLine: (id: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {lines.map((line) => {
        const isActive = activeLineIds.includes(line.id)
        return (
          <div
            key={line.id}
            style={{
              position: 'relative',
              display: 'inline-flex',
            }}
          >
            <button
              onClick={() => onToggleLine(line.id)}
              aria-label={`Filter by ${line.name} line`}
              aria-pressed={isActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                border: 'none',
                background: 'none',
                padding: 2,
                cursor: 'pointer',
                borderRadius: '50%',
                outline: isActive ? '2px solid var(--mta-blue)' : 'none',
                outlineOffset: 2,
                opacity: isActive ? 1 : 0.75,
                transition: 'opacity var(--transition)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.opacity = '0.75'
                }
              }}
            >
              <LineBadge line={line} size="sm" />
            </button>
            <div
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                transform: 'scale(0.85)',
                transformOrigin: 'top right',
              }}
            >
              <FavoriteButton line={line} size="sm" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
