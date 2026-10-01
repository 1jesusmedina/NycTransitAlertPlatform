import { Link, useLocation } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'

interface HeaderProps {
  lastUpdated: Date | null
  onRefresh: () => void
  isRefreshing?: boolean
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  const location = useLocation()

  return (
    <header
      style={{
        backgroundColor: 'var(--mta-blue)',
        color: '#fff',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo + Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link
          to="/"
          style={{
            color: '#fff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {/* MTA-style bullet */}
          <div
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--mta-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 14,
              color: '#000',
              flexShrink: 0,
            }}
          >
            NYC
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>
            Transit Alerts
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <ul
            style={{
              display: 'flex',
              gap: 4,
              listStyle: 'none',
            }}
          >
            <NavLink to="/" current={location.pathname === '/'}>
              Alerts
            </NavLink>
            <NavLink to="/favorites" current={location.pathname === '/favorites'}>
              Favorites
            </NavLink>
          </ul>
        </nav>
      </div>

      {/* Refresh control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {lastUpdated && (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
            Updated {lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh alerts"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            color: '#fff',
            fontSize: 13,
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.6 : 1,
            transition: 'all var(--transition)',
          }}
          onMouseEnter={(e) => {
            if (!isRefreshing) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)'
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          }}
        >
          <RefreshCw
            size={13}
            style={{
              animation: isRefreshing ? 'spin 700ms linear infinite' : 'none',
            }}
          />
          Refresh
        </button>
      </div>
    </header>
  )
}

function NavLink({
  to,
  current,
  children,
}: {
  to: string
  current: boolean
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        to={to}
        aria-current={current ? 'page' : undefined}
        style={{
          display: 'block',
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          color: current ? '#fff' : 'rgba(255,255,255,0.7)',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: current ? 600 : 400,
          backgroundColor: current ? 'rgba(255,255,255,0.15)' : 'transparent',
          transition: 'all var(--transition)',
        }}
      >
        {children}
      </Link>
    </li>
  )
}
