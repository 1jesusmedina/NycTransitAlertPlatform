import { useRef } from 'react'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search alerts, lines…' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Search
        size={16}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 12,
          color: 'var(--text-muted)',
          pointerEvents: 'none',
          flexShrink: 0,
        }}
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search alerts"
        style={{
          width: '100%',
          height: 40,
          paddingLeft: 36,
          paddingRight: value ? 36 : 12,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 14,
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'border-color var(--transition)',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      />
      {value && (
        <button
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--border)',
            color: 'var(--text-secondary)',
            padding: 0,
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}
