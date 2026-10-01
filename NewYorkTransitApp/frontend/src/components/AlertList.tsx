import type { Alert } from '@/types'
import { AlertCard } from './AlertCard'
import { Loader } from './Loader'

interface AlertListProps {
  alerts: Alert[]
  isLoading: boolean
  error: string | null
}

export function AlertList({ alerts, isLoading, error }: AlertListProps) {
  if (isLoading) {
    return (
      <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
        <Loader label="Loading alerts…" />
      </div>
    )
  }

  if (error) {
    return (
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
        <p style={{ fontWeight: 600, marginBottom: 4 }}>Failed to load alerts</p>
        <p style={{ fontSize: 13 }}>{error}</p>
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <div
        style={{
          padding: '64px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden="true">🚇</div>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'var(--text-secondary)' }}>
          No alerts found
        </p>
        <p style={{ fontSize: 14 }}>Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {alerts.map((alert) => (
        <li key={alert.id}>
          <AlertCard alert={alert} />
        </li>
      ))}
    </ol>
  )
}
