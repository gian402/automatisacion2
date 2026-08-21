// ============================================================
// HYTICON — ErrorMessage
// Mensaje de error para formularios y estados de error de API
// ============================================================

import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null
  return (
    <p className={cn('flex items-center gap-1.5 text-xs text-[#dc2626]', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}

// ── Estado de error de página completa ────────────────────────
interface PageErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function PageError({
  title = 'Error al cargar',
  message = 'Ocurrió un problema al obtener la información. Intenta de nuevo.',
  onRetry,
}: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fee2e2]">
        <AlertCircle className="h-6 w-6 text-[#dc2626]" />
      </div>
      <p className="text-sm font-medium text-[#0f172a]">{title}</p>
      <p className="mt-1 text-sm text-[#475569]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm font-medium text-[#2563eb] hover:underline"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
