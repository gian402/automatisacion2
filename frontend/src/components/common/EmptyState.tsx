// ============================================================
// HYTICON — EmptyState
// Pantalla de estado vacío para tablas y listas
// ============================================================

import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-[#0f172a]">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-[#475569]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
