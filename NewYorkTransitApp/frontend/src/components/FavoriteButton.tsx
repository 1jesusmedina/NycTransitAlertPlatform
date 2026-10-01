import { Star } from 'lucide-react'
import type { TransitLine } from '@/types'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  line: TransitLine
  size?: 'sm' | 'md'
}

export function FavoriteButton({ line, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const active = isFavorite(line.id)
  const px = size === 'sm' ? 6 : 8
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggleFavorite(line)
      }}
      aria-label={active ? `Remove ${line.name} from favorites` : `Add ${line.name} to favorites`}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: px,
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: active ? '#FEF3C7' : 'transparent',
        color: active ? '#D97706' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-sidebar)'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
          ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
        }
      }}
    >
      <Star
        size={iconSize}
        fill={active ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  )
}
