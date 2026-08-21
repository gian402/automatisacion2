import React, { type ReactNode } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
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
  emptyTitle = 'Sin resultados', emptyDescription = 'No hay registros que mostrar.',
  emptyAction, emptyIcon, sortState, onSort, onRowClick, className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-lg border border-[rgba(255,255,255,.07)] bg-[#161b27]', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,.06)]">
              {columns.map(col => (
                <TableHeaderCell key={col.key} column={col} sortState={sortState} onSort={onSort} />
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={columns.length} />
            ) : isError ? (
              <tr><td colSpan={columns.length}><PageError onRetry={onRetry} /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length}><EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} /></td></tr>
            ) : (
              data.map(row => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'border-b border-[rgba(255,255,255,.04)] last:border-0 transition-colors duration-75',
                    onRowClick ? 'cursor-pointer hover:bg-[#1c2333]' : 'hover:bg-[rgba(255,255,255,.02)]',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-[#c9d1d9]',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                      )}
                      style={col.width ? { width: col.width } : undefined}
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
  column, sortState, onSort,
}: { column: TableColumn<T>; sortState?: SortState; onSort?: (key: string) => void }) {
  const isSorted = sortState?.key === column.key
  const direction = isSorted ? sortState.direction : null

  return (
    <th
      className={cn(
        'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#484f58]',
        column.align === 'center' && 'text-center',
        column.align === 'right' && 'text-right',
        column.sortable && onSort && 'cursor-pointer select-none hover:text-[#8b949e]',
      )}
      style={column.width ? { width: column.width } : undefined}
      onClick={() => column.sortable && onSort?.(column.key)}
    >
      <span className="inline-flex items-center gap-1">
        {column.header}
        {column.sortable && onSort && <SortIcon direction={direction} />}
      </span>
    </th>
  )
}

function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc')  return <ArrowUp className="h-3 w-3 text-[#2563eb]" />
  if (direction === 'desc') return <ArrowDown className="h-3 w-3 text-[#2563eb]" />
  return <ArrowUpDown className="h-3 w-3 text-[#2d3748]" />
}

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

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function TablePagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between border-t border-[rgba(255,255,255,.06)] bg-[#161b27] px-4 py-3">
      <p className="text-xs text-[#484f58]">
        Mostrando <span className="text-[#8b949e] font-medium">{from}–{to}</span> de{' '}
        <span className="text-[#8b949e] font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <PaginationButton onClick={() => onPageChange(page - 1)} disabled={page <= 1} label="Anterior">‹</PaginationButton>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1
          return <PaginationButton key={p} onClick={() => onPageChange(p)} active={p === page} label={`Página ${p}`}>{p}</PaginationButton>
        })}
        <PaginationButton onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} label="Siguiente">›</PaginationButton>
      </div>
    </div>
  )
}

function PaginationButton({ children, onClick, disabled, active, label }: {
  children: ReactNode; onClick: () => void; disabled?: boolean; active?: boolean; label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex h-6 min-w-6 items-center justify-center rounded px-2 text-xs transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-30',
        active
          ? 'bg-[#2563eb] text-white font-medium'
          : 'text-[#8b949e] hover:bg-[rgba(255,255,255,.07)] hover:text-[#c9d1d9]',
      )}
    >
      {children}
    </button>
  )
}
