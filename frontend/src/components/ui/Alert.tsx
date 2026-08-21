import type { ReactNode } from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        info:    'border-[rgba(88,166,255,.2)]  bg-[rgba(88,166,255,.08)]  text-[#58a6ff]',
        success: 'border-[rgba(63,185,80,.2)]   bg-[rgba(63,185,80,.08)]   text-[#3fb950]',
        warning: 'border-[rgba(210,153,34,.2)]  bg-[rgba(210,153,34,.08)]  text-[#d29922]',
        error:   'border-[rgba(248,81,73,.2)]   bg-[rgba(248,81,73,.08)]   text-[#f85149]',
      },
    },
    defaultVariants: { variant: 'info' },
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
        {title && <p className="font-semibold leading-tight">{title}</p>}
        {children && (
          <div className={cn('text-sm opacity-85', title && 'mt-1')}>{children}</div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
