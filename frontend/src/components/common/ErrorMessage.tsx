import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ── ErrorMessage — inline field error ────────────────────── */
interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null
  return (
    <p className={cn('flex items-center gap-1.5 text-[11px] font-medium text-[#f87171]', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}

/* ── PageError — centered error with retry ─────────────────── */
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 24px',
      textAlign: 'center',
    }}>
      {/* Icon box */}
      <div style={{
        marginBottom: '16px',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'rgba(239,68,68,.1)',
        border: '1px solid rgba(239,68,68,.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
      }}>
        <AlertCircle style={{ width: '22px', height: '22px' }} />
      </div>

      <p style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#9ca3af',
        margin: 0,
      }}>
        {title}
      </p>
      <p style={{
        marginTop: '4px',
        fontSize: '13px',
        color: '#4b5563',
      }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '16px',
            padding: '6px 16px',
            borderRadius: '7px',
            border: '1px solid rgba(239,68,68,.25)',
            background: 'rgba(239,68,68,.08)',
            color: '#f87171',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.15)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.08)')}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
