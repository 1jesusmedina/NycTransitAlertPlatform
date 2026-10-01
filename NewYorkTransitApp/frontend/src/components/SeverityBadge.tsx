import type { AlertSeverity } from '@/types'
import { SEVERITY_COLORS, SEVERITY_LABELS } from '@/utils/transitLines'

interface SeverityBadgeProps {
  severity: AlertSeverity
  className?: string
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const colors = SEVERITY_COLORS[severity]

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {SEVERITY_LABELS[severity]}
    </span>
  )
}
