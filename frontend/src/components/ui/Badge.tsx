import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { EstadoCotizacion } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
  {
    variants: {
      variant: {
        default:  'bg-[rgba(255,255,255,.06)] text-[#656d76]',
        primary:  'bg-[rgba(37,99,235,.15)] text-[#58a6ff]',
        success:  'bg-[rgba(63,185,80,.12)] text-[#3fb950]',
        warning:  'bg-[rgba(210,153,34,.12)] text-[#d29922]',
        danger:   'bg-[rgba(248,81,73,.12)] text-[#f85149]',
        info:     'bg-[rgba(88,166,255,.12)] text-[#79c0ff]',
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
  success: '#3fb950',
  warning: '#d29922',
  danger:  '#f85149',
  info:    '#79c0ff',
  primary: '#2563eb',
  default: '#656d76',
}

export function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props}>
      {dot && (
        <span style={{
          display: 'inline-block',
          width: '5px', height: '5px',
          borderRadius: '50%',
          background: DOT_COLOR[variant ?? 'default'] ?? '#656d76',
          flexShrink: 0,
        }} />
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
