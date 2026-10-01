import { RotateCcw } from 'lucide-react'
import type { AlertFilters, SeverityFilter, StatusFilter, TransitTypeFilter } from '@/types'
import { SEVERITY_LABELS } from '@/utils/transitLines'

interface FilterBarProps {
  filters: AlertFilters
  onSeverityChange: (v: SeverityFilter) => void
  onStatusChange: (v: StatusFilter) => void
  onTransitTypeChange: (v: TransitTypeFilter) => void
  onReset: () => void
}

const SEVERITY_OPTIONS: SeverityFilter[] = [
  'ALL', 'NO_SERVICE', 'SIGNIFICANT_DELAYS', 'REDUCED_SERVICE',
  'PLANNED_WORK', 'SERVICE_CHANGE', 'INFORMATION',
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'PAST', label: 'Past' },
]

const TYPE_OPTIONS: { value: TransitTypeFilter; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SUBWAY', label: 'Subway' },
  { value: 'BUS', label: 'Bus' },
  { value: 'LIRR', label: 'LIRR' },
  { value: 'METRO_NORTH', label: 'Metro-North' },
  { value: 'STATEN_ISLAND_RAILWAY', label: 'SIR' },
]

const hasActiveFilters = (f: AlertFilters) =>
  f.severity !== 'ALL' || f.status !== 'ACTIVE' || f.transitType !== 'ALL'

export function FilterBar({ filters, onSeverityChange, onStatusChange, onTransitTypeChange, onReset }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {/* Severity */}
      <Select
        label="Severity"
        value={filters.severity}
        onChange={(v) => onSeverityChange(v as SeverityFilter)}
        options={SEVERITY_OPTIONS.map((v) => ({
          value: v,
          label: v === 'ALL' ? 'All Severities' : SEVERITY_LABELS[v],
        }))}
      />

      {/* Status */}
      <Select
        label="Status"
        value={filters.status}
        onChange={(v) => onStatusChange(v as StatusFilter)}
        options={STATUS_OPTIONS}
      />

      {/* Transit type */}
      <Select
        label="Type"
        value={filters.transitType}
        onChange={(v) => onTransitTypeChange(v as TransitTypeFilter)}
        options={TYPE_OPTIONS}
      />

      {/* Reset */}
      {hasActiveFilters(filters) && (
        <button
          onClick={onReset}
          aria-label="Reset filters"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            height: 36,
            padding: '0 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={13} />
          Reset
        </button>
      )}
    </div>
  )
}

// ── Internal Select ────────────────────────────────────────────────────────────

interface SelectProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}

function Select({ label, value, onChange, options }: SelectProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          height: 36,
          paddingLeft: 10,
          paddingRight: 28,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 13,
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          appearance: 'auto',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
