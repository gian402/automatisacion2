// ============================================================
// HYTICON — Alert
// Mensajes de sistema: info, success, warning, error
// ============================================================

import type { ReactNode } from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        info:    'border-[#bae6fd] bg-[#f0f9ff] text-[#0369a1]',
        success: 'border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]',
        warning: 'border-[#fde68a] bg-[#fffbeb] text-[#a16207]',
        error:   'border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  },
)

const ICONS = {
  info:    Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   XCircle,
}

interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string
  children?: ReactNode
  onClose?: () => void
  className?: string
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const Icon = ICONS[variant ?? 'info']

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />

      <div className="flex-1 text-sm">
        {title && <p className="font-medium leading-tight">{title}</p>}
        {children && (
          <div className={cn('text-sm opacity-90', title && 'mt-1')}>
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar alerta"
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
