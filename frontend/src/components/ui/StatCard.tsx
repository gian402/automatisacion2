import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/common/Skeleton'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  iconVariant?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'
  description?: string
  trend?: number
  trendLabel?: string
  isLoading?: boolean
  className?: string
}

const ICON_STYLES: Record<NonNullable<StatCardProps['iconVariant']>, { bg: string; color: string }> = {
  blue:   { bg: 'rgba(37,99,235,.15)',   color: '#58a6ff' },
  green:  { bg: 'rgba(63,185,80,.12)',   color: '#3fb950' },
  amber:  { bg: 'rgba(210,153,34,.12)',  color: '#d29922' },
  red:    { bg: 'rgba(248,81,73,.12)',   color: '#f85149' },
  purple: { bg: 'rgba(139,92,246,.12)',  color: '#a78bfa' },
  slate:  { bg: 'rgba(255,255,255,.06)', color: '#8b949e' },
}

export function StatCard({
  label, value, icon, iconVariant = 'blue',
  description, trend, trendLabel = 'vs mes anterior',
  isLoading = false, className,
}: StatCardProps) {
  const colors = ICON_STYLES[iconVariant]

  return (
    <div className={cn(
      'rounded-lg border border-[rgba(255,255,255,.07)] bg-[#161b27] p-5',
      className,
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#484f58' }}>
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#f0f6fc', lineHeight: 1, letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </p>
          )}
          {description && !isLoading && (
            <p style={{ fontSize: '12px', color: '#484f58' }}>{description}</p>
          )}
        </div>

        <div style={{
          width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0,
          background: colors.bg, color: colors.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>

      {trend !== undefined && !isLoading && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIndicator value={trend} />
          <span style={{ fontSize: '11px', color: '#484f58' }}>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-[#3fb950]">
      <TrendingUp className="h-3 w-3" />+{value}%
    </span>
  )
  if (value < 0) return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-[#f85149]">
      <TrendingDown className="h-3 w-3" />{value}%
    </span>
  )
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-[#484f58]">
      <Minus className="h-3 w-3" />Sin cambio
    </span>
  )
}
