import type { AlertAffectedLine, TransitLine } from '@/types'

interface LineBadgeProps {
  line: AlertAffectedLine | TransitLine
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_STYLES = {
  sm: { width: 22, height: 22, fontSize: 11, fontWeight: 700 },
  md: { width: 28, height: 28, fontSize: 13, fontWeight: 700 },
  lg: { width: 36, height: 36, fontSize: 16, fontWeight: 700 },
}

export function LineBadge({ line, size = 'md', className = '' }: LineBadgeProps) {
  const { width, height, fontSize, fontWeight } = SIZE_STYLES[size]
  const isBus = line.type === 'BUS'
  const borderRadius = isBus ? 4 : '50%'

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        borderRadius,
        backgroundColor: line.color,
        color: line.textColor,
        fontSize,
        fontWeight,
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: line.name.length > 2 ? '-0.5px' : undefined,
      }}
      aria-label={`${line.type === 'BUS' ? 'Bus' : 'Subway'} line ${line.name}`}
    >
      {line.name.length > 3 ? line.name.slice(0, 3) : line.name}
    </span>
  )
}
