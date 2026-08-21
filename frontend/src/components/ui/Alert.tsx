import type { ReactNode } from 'react'
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative flex w-full gap-3 rounded-lg border p-4',
  {
    variants: {
      variant: {
        info: [
          'border-[rgba(99,102,241,.25)]',
          'bg-[rgba(99,102,241,.08)]',
          'text-[#818cf8]',
        ].join(' '),
        success: [
          'border-[rgba(16,185,129,.25)]',
          'bg-[rgba(16,185,129,.08)]',
          'text-[#34d399]',
        ].join(' '),
        warning: [
          'border-[rgba(245,158,11,.25)]',
          'bg-[rgba(245,158,11,.08)]',
          'text-[#fbbf24]',
        ].join(' '),
        error: [
          'border-[rgba(239,68,68,.25)]',
          'bg-[rgba(239,68,68,.08)]',
          'text-[#f87171]',
        ].join(' '),
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
        {title && (
          <p className="font-semibold leading-tight">{title}</p>
        )}
        {children && (
          <div className={cn('text-sm opacity-80', title && 'mt-1')}>
            {children}
          </div>
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
