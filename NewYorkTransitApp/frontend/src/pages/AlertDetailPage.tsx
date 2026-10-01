import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Clock, AlertCircle } from 'lucide-react'
import { useAlert } from '@/hooks/useAlerts'
import { LineBadge } from '@/components/LineBadge'
import { SeverityBadge } from '@/components/SeverityBadge'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Loader } from '@/components/Loader'
import { Header } from '@/components/Header'
import { formatAlertTime, getRelativeTime, LINE_MAP } from '@/utils/transitLines'

export function AlertDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { alert, isLoading, error } = useAlert(id)

  const refresh = () => window.location.reload()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header lastUpdated={null} onRefresh={refresh} />

      <div
        style={{
          maxWidth: 720,
          width: '100%',
          margin: '0 auto',
          padding: '24px 16px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={16} />
          Back to alerts
        </Link>

        {isLoading && (
          <div style={{ padding: '64px 0', display: 'flex', justifyContent: 'center' }}>
            <Loader label="Loading alert…" />
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
            }}
          >
            <AlertCircle size={32} style={{ marginBottom: 8 }} />
            <p style={{ fontWeight: 600 }}>{error}</p>
          </div>
        )}

        {alert && (
          <article
            className="fade-in"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Status bar */}
            <div
              style={{
                height: 4,
                backgroundColor:
                  alert.status === 'ACTIVE' ? 'var(--mta-red)' :
                  alert.status === 'UPCOMING' ? 'var(--mta-blue)' :
                  'var(--border)',
              }}
            />

            <div style={{ padding: 28 }}>
              {/* Affected lines */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {alert.affectedLines.map((line) => {
                  const full = LINE_MAP[line.id]
                  return (
                    <div
                      key={line.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <LineBadge line={line} size="lg" />
                      {full && <FavoriteButton line={full} size="sm" />}
                    </div>
                  )
                })}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                {alert.title}
              </h1>

              {/* Badges row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <SeverityBadge severity={alert.severity} />
                <StatusBadge status={alert.status} />
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: 'var(--text-secondary)',
                  marginBottom: 24,
                  whiteSpace: 'pre-line',
                }}
              >
                {alert.description}
              </p>

              {/* Active periods */}
              {alert.activePeriods.length > 0 && (
                <section style={{ marginBottom: 24 }}>
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
                    <Clock size={12} />
                    Active Periods
                  </h2>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {alert.activePeriods.map((period, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 14,
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          gap: 8,
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>From:</span>
                        {formatAlertTime(period.start)}
                        {period.end && (
                          <>
                            <span style={{ color: 'var(--text-muted)' }}>to</span>
                            {formatAlertTime(period.end)}
                          </>
                        )}
                        {!period.end && (
                          <span style={{ color: '#DC2626', fontWeight: 500 }}>Ongoing</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Meta */}
              <div
                style={{
                  paddingTop: 16,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Last updated {getRelativeTime(alert.updatedAt)} &nbsp;·&nbsp;{' '}
                  {formatAlertTime(alert.updatedAt)}
                </span>
                {alert.url && (
                  <a
                    href={alert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 13,
                      color: 'var(--mta-blue)',
                    }}
                  >
                    MTA website
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    ACTIVE:   { bg: '#FEF2F2', text: '#991B1B' },
    UPCOMING: { bg: '#EFF6FF', text: '#1E40AF' },
    PAST:     { bg: '#F3F4F6', text: '#6B7280' },
  }
  const s = styles[status] ?? styles.PAST
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.bg}`,
      }}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}
