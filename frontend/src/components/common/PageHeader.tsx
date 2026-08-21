import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f6fc', letterSpacing: '-.3px', lineHeight: 1.2 }}>
          {title}
        </h1>
        {description && (
          <p style={{ marginTop: '4px', fontSize: '13px', color: '#484f58' }}>{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
