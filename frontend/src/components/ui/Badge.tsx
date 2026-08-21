// ============================================================
// HYTICON — Badge
// Indicadores de estado con colores semánticos
// ============================================================

import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { EstadoCotizacion } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center rounded-[4px] px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default:   'bg-[#f1f5f9] text-[#475569]',
        primary:   'bg-[#dbeafe] text-[#1e40af]',
        success:   'bg-[#dcfce7] text-[#15803d]',
        warning:   'bg-[#fef9c3] text-[#854d0e]',
        danger:    'bg-[#fee2e2] text-[#991b1b]',
        info:      'bg-[#e0f2fe] text-[#0369a1]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

// ── Badge específico para estados de cotización ───────────────
const ESTADO_BADGE: Record<EstadoCotizacion, { label: string; variant: VariantProps<typeof badgeVariants>['variant'] }> = {
  BORRADOR:  { label: 'Borrador',  variant: 'default' },
  ENVIADA:   { label: 'Enviada',   variant: 'info' },
  APROBADA:  { label: 'Aprobada',  variant: 'success' },
  RECHAZADA: { label: 'Rechazada', variant: 'danger' },
  VENCIDA:   { label: 'Vencida',   variant: 'warning' },
}

export function EstadoBadge({ estado }: { estado: EstadoCotizacion }) {
  const { label, variant } = ESTADO_BADGE[estado]
  return <Badge variant={variant}>{label}</Badge>
}
