import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/common/Skeleton'

type ColorVariant = 'indigo' | 'emerald' | 'amber' | 'red' | 'cyan' | 'purple'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  /**
   * @deprecated use `colorVariant` instead — kept for backward compat
   */
  iconVariant?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'
  colorVariant?: ColorVariant
  description?: string
  trend?: number
  trendLabel?: string
  isLoading?: boolean
  className?: string
}

/* Map old iconVariant names → new colorVariant */
const LEGACY_MAP: Record<NonNullable<StatCardProps['iconVariant']>, ColorVariant> = {
  blue:   'indigo',
  green:  'emerald',
  amber:  'amber',
  red:    'red',
  purple: 'purple',
  slate:  'indigo',
}

const COLOR_STYLES: Record<ColorVariant, { bg: string; color: string; shadow: string }> = {
  indigo:  {
    bg: 'rgba(99,102,241,.15)',
    color: '#818cf8',
    shadow: '0 0 12px rgba(99,102,241,.25)',
  },
  emerald: {
    bg: 'rgba(16,185,129,.12)',
    color: '#34d399',
    shadow: '0 0 12px rgba(16,185,129,.2)',
  },
  amber:   {
    bg: 'rgba(245,158,11,.12)',
    color: '#fbbf24',
    shadow: '0 0 12px rgba(245,158,11,.2)',
  },
  red:     {
    bg: 'rgba(239,68,68,.12)',
    color: '#f87171',
    shadow: '0 0 12px rgba(239,68,68,.2)',
  },
  cyan:    {
    bg: 'rgba(6,182,212,.12)',
    color: '#22d3ee',
    shadow: '0 0 12px rgba(6,182,212,.2)',
  },
  purple:  {
    bg: 'rgba(139,92,246,.12)',
    color: '#a78bfa',
    shadow: '0 0 12px rgba(139,92,246,.2)',
  },
}

export function StatCard({
  label, value, icon,
  iconVariant, colorVariant,
  description, trend, trendLabel = 'vs mes anterior',
  isLoading = false, className,
}: StatCardProps) {
  // Resolve variant: prefer colorVariant, fallback to iconVariant mapping
  const resolvedVariant: ColorVariant =
    colorVariant ??
    (iconVariant ? LEGACY_MAP[iconVariant] : 'indigo')

  const colors = COLOR_STYLES[resolvedVariant]

  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,.08)',
        background: '#111827',
        padding: '20px',
        transition: 'border-color .2s, box-shadow .2s',
      }}
      className={cn(className)}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,.2)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.4)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        {/* Text side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <p style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '.07em',
            color: '#6b7280',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </p>

          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#f9fafb',
              lineHeight: 1,
              letterSpacing: '-1px',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {value}
            </p>
          )}

          {description && !isLoading && (
            <p style={{ fontSize: '12px', color: '#4b5563' }}>{description}</p>
          )}
        </div>

        {/* Icon */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '9px',
          flexShrink: 0,
          background: colors.bg,
          color: colors.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: colors.shadow,
        }}>
          {icon}
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && !isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,.06)',
        }}>
          <TrendIndicator value={trend} />
          <span style={{ fontSize: '11px', color: '#4b5563' }}>{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#34d399' }}>
        <TrendingUp style={{ width: '12px', height: '12px' }} />
        +{value}%
      </span>
    )
  }
  if (value < 0) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#f87171' }}>
        <TrendingDown style={{ width: '12px', height: '12px' }} />
        {value}%
      </span>
    )
  }
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>
      <Minus style={{ width: '12px', height: '12px' }} />
      Sin cambio
    </span>
  )
}
