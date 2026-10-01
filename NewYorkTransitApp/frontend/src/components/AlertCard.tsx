import { Link } from 'react-router-dom'
import type { Alert } from '@/types'
import { LineBadge } from './LineBadge'
import { SeverityBadge } from './SeverityBadge'
import { getRelativeTime } from '@/utils/transitLines'

interface AlertCardProps {
  alert: Alert
}

export function AlertCard({ alert }: AlertCardProps) {
  const isActive = alert.status === 'ACTIVE'

  return (
    <Link
      to={`/alerts/${alert.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
      aria-label={`Alert: ${alert.title}`}
    >
      <article
        className="fade-in"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderLeft: isActive ? '4px solid var(--mta-red)' : '4px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          cursor: 'pointer',
          transition: 'box-shadow var(--transition), transform var(--transition)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = 'var(--shadow-md)'
          el.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement
          el.style.boxShadow = ''
          el.style.transform = ''
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          {/* Line badges */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0, paddingTop: 2 }}>
            {alert.affectedLines.slice(0, 6).map((line) => (
              <LineBadge key={line.id} line={line} size="sm" />
            ))}
            {alert.affectedLines.length > 6 && (
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  alignSelf: 'center',
                }}
              >
                +{alert.affectedLines.length - 6}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              flex: 1,
            }}
          >
            {alert.title}
          </h3>
        </div>

        {/* Description preview */}
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {alert.description}
        </p>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <SeverityBadge severity={alert.severity} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Updated {getRelativeTime(alert.updatedAt)}
          </span>
        </div>
      </article>
    </Link>
  )
}
