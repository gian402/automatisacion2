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
    <div
      className={cn('flex items-center justify-between gap-4 mb-6 flex-wrap', className)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#f9fafb',
          letterSpacing: '-.4px',
          lineHeight: 1.2,
          margin: 0,
        }}>
          {title}
        </h1>
        {description && (
          <p style={{
            margin: 0,
            fontSize: '13px',
            color: '#6b7280',
            fontWeight: 400,
          }}>
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          {actions}
        </div>
      )}
    </div>
  )
}
