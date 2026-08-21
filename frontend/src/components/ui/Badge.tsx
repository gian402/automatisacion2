import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { EstadoCotizacion } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:  'bg-[rgba(255,255,255,.07)] text-[#8b949e]',
        primary:  'bg-[rgba(37,99,235,.15)] text-[#58a6ff]',
        success:  'bg-[rgba(63,185,80,.12)] text-[#3fb950]',
        warning:  'bg-[rgba(210,153,34,.12)] text-[#d29922]',
        danger:   'bg-[rgba(248,81,73,.12)] text-[#f85149]',
        info:     'bg-[rgba(88,166,255,.12)] text-[#58a6ff]',
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

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {dot && (
        <span className={cn(
          'inline-block w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-[#3fb950]',
          variant === 'warning' && 'bg-[#d29922]',
          variant === 'danger'  && 'bg-[#f85149]',
          variant === 'info'    && 'bg-[#58a6ff]',
          variant === 'primary' && 'bg-[#2563eb]',
          (!variant || variant === 'default') && 'bg-[#8b949e]',
        )} />
      )}
      {children}
    </span>
  )
}

const ESTADO_BADGE: Record<EstadoCotizacion, { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }> = {
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
