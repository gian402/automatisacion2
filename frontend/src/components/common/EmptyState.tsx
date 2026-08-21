import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 24px',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          marginBottom: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,.04)',
          border: '1px solid rgba(255,255,255,.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4b5563',
        }}>
          {icon}
        </div>
      )}

      <p style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#9ca3af',
        margin: 0,
      }}>
        {title}
      </p>

      {description && (
        <p style={{
          marginTop: '4px',
          fontSize: '13px',
          color: '#4b5563',
        }}>
          {description}
        </p>
      )}

      {action && (
        <div style={{ marginTop: '20px' }}>
          {action}
        </div>
      )}
    </div>
  )
}
