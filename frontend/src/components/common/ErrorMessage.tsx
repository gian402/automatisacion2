import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null
  return (
    <p className={cn('flex items-center gap-1.5 text-xs text-[#f85149]', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}

interface PageErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function PageError({
  title = 'Error al cargar',
  message = 'Ocurrió un problema al obtener la información.',
  onRetry,
}: PageErrorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 24px', textAlign: 'center' }}>
      <div style={{
        marginBottom: '16px',
        width: '44px', height: '44px', borderRadius: '10px',
        background: 'rgba(248,81,73,.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#f85149',
      }}>
        <AlertCircle style={{ width: '20px', height: '20px' }} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#8b949e' }}>{title}</p>
      <p style={{ marginTop: '4px', fontSize: '13px', color: '#484f58' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{ marginTop: '16px', fontSize: '13px', fontWeight: 500, color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'underline')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.textDecoration = 'none')}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
