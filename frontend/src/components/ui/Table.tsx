import React, { type ReactNode } from 'react'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TableSkeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { PageError } from '@/components/common/ErrorMessage'

export type SortDirection = 'asc' | 'desc' | null

export interface TableColumn<T> {
  key: string
  header: string
  width?: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (row: T) => ReactNode
}

export interface SortState {
  key: string | null
  direction: SortDirection
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  emptyIcon?: ReactNode
  sortState?: SortState
  onSort?: (key: string) => void
  onRowClick?: (row: T) => void
  className?: string
}

export function Table<T>({
  columns, data, keyExtractor,
  isLoading = false, isError = false, onRetry,
  emptyTitle = 'Sin resultados',
  emptyDescription = 'No hay registros que mostrar.',
  emptyAction, emptyIcon, sortState, onSort, onRowClick, className,
}: TableProps<T>) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-[10px] border border-[rgba(255,255,255,.08)]', className)}
      style={{ background: '#111827' }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          {/* Header */}
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              {columns.map(col => (
                <TableHeaderCell
                  key={col.key}
                  column={col}
                  sortState={sortState}
                  onSort={onSort}
                />
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={columns.length} />
            ) : isError ? (
              <tr>
                <td colSpan={columns.length}>
                  <PageError onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr
                  key={keyExtractor(row)}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,.06)',
                    transition: 'background .12s',
                    cursor: onRowClick ? 'pointer' : undefined,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '12px 16px',
                        color: '#e5e7eb',
                        textAlign:
                          col.align === 'center'
                            ? 'center'
                            : col.align === 'right'
                              ? 'right'
                              : 'left',
                        ...(col.width ? { width: col.width } : {}),
                      }}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TableHeaderCell<T>({
  column,
  sortState,
  onSort,
}: {
  column: TableColumn<T>
  sortState?: SortState
  onSort?: (key: string) => void
}) {
  const isSorted = sortState?.key === column.key
  const direction = isSorted ? sortState.direction : null
  const clickable = column.sortable && !!onSort

  return (
    <th
      style={{
        padding: '10px 16px',
        textAlign:
          column.align === 'center'
            ? 'center'
            : column.align === 'right'
              ? 'right'
              : 'left',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '.07em',
        color: '#6b7280',
        background: 'rgba(255,255,255,.02)',
        cursor: clickable ? 'pointer' : undefined,
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'color .12s',
        ...(column.width ? { width: column.width } : {}),
      }}
      onClick={() => clickable && onSort?.(column.key)}
      onMouseEnter={e => {
        if (clickable) (e.currentTarget as HTMLElement).style.color = '#9ca3af'
      }}
      onMouseLeave={e => {
        if (clickable) (e.currentTarget as HTMLElement).style.color = isSorted ? '#818cf8' : '#6b7280'
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {column.header}
        {clickable && <SortIcon direction={direction} />}
      </span>
    </th>
  )
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc')
    return <ArrowUp style={{ width: '11px', height: '11px', color: '#6366f1' }} />
  if (direction === 'desc')
    return <ArrowDown style={{ width: '11px', height: '11px', color: '#6366f1' }} />
  return <ChevronsUpDown style={{ width: '11px', height: '11px', color: '#374151' }} />
}

/* ── useSortState hook ─────────────────────────────────────── */
export function useSortState(defaultKey: string | null = null) {
  const [sortState, setSortState] = React.useState<SortState>({
    key: defaultKey,
    direction: defaultKey ? 'asc' : null,
  })

  const handleSort = (key: string) => {
    setSortState(prev => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: null }
    })
  }

  return { sortState, handleSort }
}

/* ── TablePagination ───────────────────────────────────────── */
interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function TablePagination({
  page, totalPages, total, limit, onPageChange,
}: PaginationProps) {
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(255,255,255,.07)',
      background: '#111827',
      padding: '10px 16px',
      borderRadius: '0 0 10px 10px',
      flexWrap: 'wrap',
      gap: '8px',
    }}>
      <p style={{ fontSize: '12px', color: '#4b5563' }}>
        <span style={{ color: '#9ca3af', fontWeight: 500 }}>{from}–{to}</span>
        {' '}de{' '}
        <span style={{ color: '#9ca3af', fontWeight: 500 }}>{total}</span>
      </p>
      <div style={{ display: 'flex', gap: '3px' }}>
        <PaginationButton
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          label="Anterior"
        >‹</PaginationButton>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1
          return (
            <PaginationButton
              key={p}
              onClick={() => onPageChange(p)}
              active={p === page}
              label={`Página ${p}`}
            >
              {p}
            </PaginationButton>
          )
        })}

        <PaginationButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          label="Siguiente"
        >›</PaginationButton>
      </div>
    </div>
  )
}

function PaginationButton({
  children, onClick, disabled, active, label,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '26px',
        minWidth: '26px',
        padding: '0 6px',
        borderRadius: '5px',
        fontSize: '12px',
        border: active ? '1px solid rgba(99,102,241,.4)' : '1px solid transparent',
        background: active ? 'rgba(99,102,241,.15)' : 'transparent',
        color: active ? '#818cf8' : '#9ca3af',
        fontWeight: active ? 600 : 400,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        transition: 'background .1s, color .1s',
      }}
      onMouseEnter={e => {
        if (!active && !disabled) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'
          ;(e.currentTarget as HTMLElement).style.color = '#e5e7eb'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = '#9ca3af'
        }
      }}
    >
      {children}
    </button>
  )
}
