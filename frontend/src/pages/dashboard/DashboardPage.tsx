// ============================================================
// HYTICON — DashboardPage (Prompt 16)
// Métricas reales según rol: ADMIN o SUPERVISOR
// ============================================================

import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  Users,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  TrendingUp,
  UserCog,
  AlertCircle,
  Plus,
} from 'lucide-react'

import {
  dashboardService,
  isAdminStats,
  type CotizacionResumen,
} from '@/services/dashboard.service'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ROUTES } from '@/router/routes'
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  type EstadoCotizacion,
} from '@/types/cotizacion'

// ── Formateadores ─────────────────────────────────────────────
function formatMonto(valor: number, moneda: 'PEN' | 'USD' = 'PEN'): string {
  const symbol = moneda === 'USD' ? '$' : 'S/'
  return `${symbol} ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ── Tarjeta de métrica ────────────────────────────────────────
interface MetricaProps {
  icon: React.ElementType
  label: string
  value: string | number
  sublabel?: string
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'slate'
}

const COLOR_ICON: Record<MetricaProps['color'], { bg: string; text: string }> = {
  blue:   { bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]' },
  green:  { bg: 'bg-[#dcfce7]', text: 'text-[#15803d]' },
  amber:  { bg: 'bg-[#fef9c3]', text: 'text-[#92400e]' },
  red:    { bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]' },
  purple: { bg: 'bg-[#f3e8ff]', text: 'text-[#6b21a8]' },
  slate:  { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]' },
}

function Metrica({ icon: Icon, label, value, sublabel, color }: MetricaProps) {
  const { bg, text } = COLOR_ICON[color]
  return (
    <Card className="hover:border-[#cbd5e1] hover:shadow transition-all">
      <CardContent className="flex items-center gap-3.5 py-3.5 px-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#64748b] truncate">{label}</p>
          <p className="text-lg font-bold text-[#0f172a] leading-tight tracking-tight mt-0.5">{value}</p>
          {sublabel && (
            <p className="text-[11px] text-[#94a3b8] truncate mt-0.5">{sublabel}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Sección de actividad reciente ─────────────────────────────
function ActividadReciente({
  items,
  onNavigate,
}: {
  items: CotizacionResumen[]
  onNavigate: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-8 w-8 text-[#cbd5e1] mb-2" />
        <p className="text-sm font-medium text-[#475569]">Aún no hay cotizaciones registradas</p>
        <p className="text-xs text-[#94a3b8] mt-0.5">Crea tu primera cotización con el botón superior.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-[#f1f5f9] bg-[#f8fafc] text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
          <tr>
            <th className="py-3 px-4">N° Cotización</th>
            <th className="py-3 px-4">Cliente</th>
            <th className="py-3 px-4">Responsable</th>
            <th className="py-3 px-4 text-center">Fecha</th>
            <th className="py-3 px-4 text-right">Total</th>
            <th className="py-3 px-4 text-center">Estado</th>
            <th className="py-3 px-4 text-right">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">
          {items.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-[#f8fafc] transition-colors cursor-pointer"
              onClick={() => onNavigate(c.id)}
            >
              {/* Número */}
              <td className="py-3 px-4 font-mono font-semibold text-[#2563eb]">
                {c.numeroCotizacion}
              </td>

              {/* Cliente */}
              <td className="py-3 px-4 font-medium text-[#0f172a] max-w-[220px] truncate">
                {c.cliente?.nombre ?? '—'}
              </td>

              {/* Responsable */}
              <td className="py-3 px-4 text-[#64748b]">
                {c.responsable?.nombre ?? '—'}
              </td>

              {/* Fecha */}
              <td className="py-3 px-4 text-[#64748b] text-center whitespace-nowrap">
                {formatFecha(c.createdAt)}
              </td>

              {/* Total */}
              <td className="py-3 px-4 font-semibold text-[#0f172a] text-right whitespace-nowrap">
                {formatMonto(c.total, c.moneda)}
              </td>

              {/* Estado */}
              <td className="py-3 px-4 text-center whitespace-nowrap">
                <Badge variant={ESTADO_VARIANT[c.estado as EstadoCotizacion] ?? 'default'}>
                  {ESTADO_LABEL[c.estado as EstadoCotizacion] ?? c.estado}
                </Badge>
              </td>

              {/* Acción */}
              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onNavigate(c.id)
                  }}
                  className="font-medium text-[#2563eb] hover:underline"
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Skeleton de carga ─────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-6 w-48 rounded bg-[#e2e8f0]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-[#e2e8f0]" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-[#e2e8f0]" />
    </div>
  )
}

// ── DashboardPage ─────────────────────────────────────────────
export default function DashboardPage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { isAdmin } = usePermissions()
  const esAdmin     = isAdmin()

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => dashboardService.getStats(),
    staleTime: 30_000, // 30 segundos — datos no cambian tan rápido
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertCircle className="h-8 w-8 text-[#dc2626]" />
        <p className="text-sm text-[#475569]">No se pudieron cargar las métricas.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-xs text-[#2563eb] hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ── Vista ADMIN ──────────────────────────────────────────
  if (esAdmin && stats && isAdminStats(stats)) {
    const s = stats
    return (
      <div className="flex flex-col gap-6">
        {/* Saludo y Acción Rápida */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
              Panel de Control
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Bienvenido de nuevo, <span className="font-semibold text-[#0f172a]">{user?.nombre}</span> · {fechaHoy}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(ROUTES.COTIZACION_NUEVA)}
            className="flex items-center gap-2 shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nueva cotización
          </Button>
        </div>

        {/* ── Métricas principales ────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
            Cotizaciones
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metrica
              icon={FileText}
              label="Total cotizaciones"
              value={s.cotizaciones.total}
              color="blue"
            />
            <Metrica
              icon={Clock}
              label="Este mes"
              value={s.cotizaciones.mes}
              sublabel={`S/ ${s.montos.cotizadoMes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              color="slate"
            />
            <Metrica
              icon={Send}
              label="Enviadas"
              value={s.cotizaciones.enviadas}
              sublabel="Esperando respuesta"
              color="amber"
            />
            <Metrica
              icon={CheckCircle2}
              label="Aprobadas"
              value={s.cotizaciones.aprobadas}
              color="green"
            />
          </div>
        </div>

        {/* ── Métricas secundarias ────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metrica
            icon={XCircle}
            label="Rechazadas"
            value={s.cotizaciones.rechazadas}
            color="red"
          />
          <Metrica
            icon={TrendingUp}
            label="Monto aprobado"
            value={`S/ ${s.montos.aprobadoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            color="green"
          />
          <Metrica
            icon={Users}
            label="Clientes activos"
            value={s.clientes.activos}
            sublabel={`${s.clientes.total} total`}
            color="purple"
          />
          <Metrica
            icon={Package}
            label="Ítems catálogo"
            value={s.catalogo.itemsActivos}
            sublabel="Activos"
            color="blue"
          />
        </div>

        {/* ── Actividad reciente ───────────────────────────── */}
        <Card className="overflow-hidden border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#fafafa]">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Actividad reciente</h3>
              <p className="text-[11px] text-[#64748b] mt-0.5">Últimas cotizaciones registradas en el sistema</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.COTIZACIONES)}
              className="text-xs font-semibold text-[#2563eb] hover:underline"
            >
              Ver todas las cotizaciones →
            </button>
          </div>
          <ActividadReciente
            items={s.actividadReciente}
            onNavigate={(id) => navigate(ROUTES.COTIZACION_DETALLE(id))}
          />
        </Card>

        {/* ── Info sistema ─────────────────────────────────── */}
        <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <UserCog className="h-3.5 w-3.5" />
            {s.usuarios.activos} usuario{s.usuarios.activos !== 1 ? 's' : ''} activo{s.usuarios.activos !== 1 ? 's' : ''}
          </span>
          <span className="text-[#e2e8f0]">·</span>
          <span>
            {s.cotizaciones.pendientes} cotización{s.cotizaciones.pendientes !== 1 ? 'es' : ''} pendiente{s.cotizaciones.pendientes !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    )
  }

  // ── Vista SUPERVISOR ──────────────────────────────────────
  if (!esAdmin && stats && !isAdminStats(stats)) {
    const s = stats
    return (
      <div className="flex flex-col gap-6">
        {/* Saludo y Acción Rápida */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">
              Panel de Control
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Bienvenido de nuevo, <span className="font-semibold text-[#0f172a]">{user?.nombre}</span> · {fechaHoy}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(ROUTES.COTIZACION_NUEVA)}
            className="flex items-center gap-2 shadow-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nueva cotización
          </Button>
        </div>

        {/* ── Métricas ───────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metrica
            icon={FileText}
            label="Mis cotizaciones"
            value={s.cotizaciones.total}
            color="blue"
          />
          <Metrica
            icon={Clock}
            label="Este mes"
            value={s.cotizaciones.mes}
            sublabel={`S/ ${s.montos.cotizadoMes.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
            color="slate"
          />
          <Metrica
            icon={CheckCircle2}
            label="Aprobadas"
            value={s.cotizaciones.aprobadas}
            color="green"
          />
          <Metrica
            icon={Send}
            label="Enviadas"
            value={s.cotizaciones.enviadas}
            sublabel="Esperando respuesta"
            color="amber"
          />
        </div>

        {/* ── Actividad reciente ───────────────────────────── */}
        <Card className="overflow-hidden border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-[#fafafa]">
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Mis cotizaciones recientes</h3>
              <p className="text-[11px] text-[#64748b] mt-0.5">Tus últimas cotizaciones elaboradas</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(ROUTES.COTIZACIONES)}
              className="text-xs font-semibold text-[#2563eb] hover:underline"
            >
              Ver todas mis cotizaciones →
            </button>
          </div>
          <ActividadReciente
            items={s.actividadReciente}
            onNavigate={(id) => navigate(ROUTES.COTIZACION_DETALLE(id))}
          />
        </Card>

        {/* ── Info pendientes ──────────────────────────────── */}
        {s.cotizaciones.pendientes > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#fef9c3] border border-[#fde68a] text-xs text-[#92400e]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Tienes {s.cotizaciones.pendientes} cotización{s.cotizaciones.pendientes !== 1 ? 'es' : ''} pendiente{s.cotizaciones.pendientes !== 1 ? 's' : ''} de atención.
          </div>
        )}
      </div>
    )
  }

  // Fallback mientras carga el rol
  return <DashboardSkeleton />
}
