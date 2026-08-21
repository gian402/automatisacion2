import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { EstadoCotizacion } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none',
  {
    variants: {
      variant: {
        default: 'bg-[#374151] text-[#9ca3af]',
        primary: 'bg-[rgba(99,102,241,.15)] text-[#818cf8] border border-[rgba(99,102,241,.2)]',
        info:    'bg-[rgba(99,102,241,.15)] text-[#818cf8] border border-[rgba(99,102,241,.2)]',
        success: 'bg-[rgba(16,185,129,.12)] text-[#34d399] border border-[rgba(16,185,129,.2)]',
        warning: 'bg-[rgba(245,158,11,.12)] text-[#fbbf24] border border-[rgba(245,158,11,.2)]',
        danger:  'bg-[rgba(239,68,68,.12)]  text-[#f87171] border border-[rgba(239,68,68,.2)]',
        cyan:    'bg-[rgba(6,182,212,.12)]  text-[#22d3ee] border border-[rgba(6,182,212,.2)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const DOT_COLOR: Record<string, string> = {
  default: '#9ca3af',
  primary: '#818cf8',
  info:    '#818cf8',
  success: '#34d399',
  warning: '#fbbf24',
  danger:  '#f87171',
  cyan:    '#22d3ee',
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const variantKey = variant ?? 'default'
  const dotColor = DOT_COLOR[variantKey] ?? '#9ca3af'

  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {dot && (
        <span style={{
          display: 'inline-block',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
          animation: 'dotPulse 2.2s ease-in-out infinite',
          boxShadow: `0 0 5px ${dotColor}90`,
        }} />
      )}
      {children}
    </span>
  )
}

const ESTADO_BADGE: Record<EstadoCotizacion, {
  label: string
  variant: VariantProps<typeof badgeVariants>['variant']
}> = {
  BORRADOR:  { label: 'Borrador',  variant: 'default' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  RECHAZADA: { label: 'Rechazada', variant: 'danger' },
  VENCIDA:   { label: 'Vencida',   variant: 'warning' },
}

export function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  const { label, variant } = ESTADO_BADGE[estado]
  return <Badge variant={variant} dot>{label}</Badge>
}
