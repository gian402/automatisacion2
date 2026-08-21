import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', textAlign: 'center' }}>
      {icon && (
        <div style={{
          marginBottom: '16px',
          width: '44px', height: '44px', borderRadius: '10px',
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#484f58',
        }}>
          {icon}
        </div>
      )}
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#8b949e' }}>{title}</p>
      {description && (
        <p style={{ marginTop: '4px', fontSize: '13px', color: '#484f58' }}>{description}</p>
      )}
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  )
}
