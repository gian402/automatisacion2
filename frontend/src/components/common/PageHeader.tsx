// ============================================================
// HYTICON — PageHeader
// Encabezado de página con título, descripción y acciones
// ============================================================

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Acciones en la derecha (botones, filtros, etc.) */
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div>
        <h1 className="text-lg font-semibold text-[#0f172a] leading-tight">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-[#475569]">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
