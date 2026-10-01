interface LoaderProps {
  label?: string
  size?: number
}

export function Loader({ label = 'Loading…', size = 32 }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
    >
      <div
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          border: `3px solid var(--border)`,
          borderTopColor: 'var(--mta-blue)',
          borderRadius: '50%',
          animation: 'spin 700ms linear infinite',
        }}
      />
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
