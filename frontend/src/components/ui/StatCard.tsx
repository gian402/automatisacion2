// ============================================================
// HYTICON — StatCard
// Tarjeta de métrica para el Dashboard. Diseño compacto
// y profesional. Sin gradientes ni decoración excesiva.
// ============================================================

import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/common/Skeleton'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  /** Variante de color del ícono */
  iconVariant?: 'blue' | 'green' | 'amber' | 'red' | 'slate'
  /** Cambio porcentual respecto al período anterior */
  trend?: number
  /** Texto descriptivo del trend (ej: "vs mes anterior") */
  trendLabel?: string
  isLoading?: boolean
  className?: string
}

const ICON_STYLES: Record<NonNullable<StatCardProps['iconVariant']>, string> = {
  blue:  'bg-[#dbeafe] text-[#1e40af]',
  green: 'bg-[#dcfce7] text-[#15803d]',
  amber: 'bg-[#fef9c3] text-[#854d0e]',
  red:   'bg-[#fee2e2] text-[#b91c1c]',
  slate: 'bg-[#f1f5f9] text-[#475569]',
}

export function StatCard({
  label,
  value,
  icon,
  iconVariant = 'blue',
  trend,
  trendLabel = 'vs mes anterior',
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#e2e8f0] bg-white p-5',
        'shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Texto */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <p className="text-2xl font-semibold text-[#0f172a] leading-none tabular-nums">
              {value}
            </p>
          )}
        </div>

        {/* Ícono */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            ICON_STYLES[iconVariant],
          )}
        >
          {icon}
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && !isLoading && (
        <div className="mt-3 flex items-center gap-1.5">
          <TrendIndicator value={trend} />
          <span className="text-xs text-[#94a3b8]">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

// ── Indicador de tendencia ────────────────────────────────────
function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-[#15803d]">
        <TrendingUp className="h-3 w-3" />
        +{value}%
      </span>
    )
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-[#b91c1c]">
        <TrendingDown className="h-3 w-3" />
        {value}%
      </span>
    )
  }
  return (
    <span className="flex items-center gap-0.5 text-xs font-medium text-[#94a3b8]">
      <Minus className="h-3 w-3" />
      Sin cambio
    </span>
  )
}
