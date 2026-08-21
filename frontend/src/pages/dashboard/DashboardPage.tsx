import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FileText, Users, Package, CheckCircle2, Clock,
  XCircle, Send, TrendingUp, UserCog, AlertCircle, Plus,
} from 'lucide-react'
import {
  dashboardService, isAdminStats, type CotizacionResumen,
} from '@/services/dashboard.service'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routes'
import { ESTADO_LABEL, ESTADO_VARIANT, type EstadoCotizacion } from '@/types/cotizacion'

function fmt(valor: number, moneda: 'PEN' | 'USD' = 'PEN') {
  return `${moneda === 'USD' ? '$' : 'S/'} ${valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ── Tarjeta de métrica ─────────────────────────────────────────
const ICON_COLORS: Record<string, { bg: string; color: string }> = {
  blue:   { bg: 'rgba(37,99,235,.15)',  color: '#58a6ff' },
  green:  { bg: 'rgba(63,185,80,.12)',  color: '#3fb950' },
  amber:  { bg: 'rgba(210,153,34,.12)', color: '#d29922' },
  red:    { bg: 'rgba(248,81,73,.12)',  color: '#f85149' },
  purple: { bg: 'rgba(139,92,246,.12)', color: '#a78bfa' },
  slate:  { bg: 'rgba(255,255,255,.07)',color: '#8b949e' },
}

function Metrica({ icon: Icon, label, value, sublabel, color }: {
  icon: React.ElementType; label: string; value: string | number; sublabel?: string; color: string
}) {
  const c = ICON_COLORS[color] ?? ICON_COLORS.slate
  return (
    <div style={{
      background: '#161b27',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex', alignItems: 'center', gap: '14px',
      transition: 'border-color .15s',
    }}
    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.12)')}
    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)')}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '9px', flexShrink: 0,
        background: c.bg, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ width: '16px', height: '16px' }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#484f58', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </p>
        <p style={{ fontSize: '22px', fontWeight: 700, color: '#f0f6fc', lineHeight: 1.1, letterSpacing: '-1px', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </p>
        {sublabel && (
          <p style={{ fontSize: '11px', color: '#484f58', marginTop: '2px' }}>{sublabel}</p>
        )}
      </div>
    </div>
  )
}

// ── Tabla de actividad reciente ────────────────────────────────
function ActividadReciente({ items, onNavigate }: { items: CotizacionResumen[]; onNavigate: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <FileText style={{ width: '28px', height: '28px', color: '#2d3748', marginBottom: '10px' }} />
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#8b949e' }}>Aún no hay cotizaciones</p>
        <p style={{ fontSize: '12px', color: '#484f58', marginTop: '4px' }}>Crea tu primera cotización con el botón superior.</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {['N° Cotización', 'Cliente', 'Responsable', 'Fecha', 'Total', 'Estado', 'Acción'].map((h, i) => (
              <th key={h} style={{
                padding: '10px 16px', textAlign: i >= 3 ? (i === 3 ? 'center' : i === 4 ? 'right' : i === 5 ? 'center' : 'right') : 'left',
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: '#484f58',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(c => (
            <tr
              key={c.id}
              onClick={() => onNavigate(c.id)}
              style={{ borderBottom: '1px solid rgba(255,255,255,.04)', cursor: 'pointer', transition: 'background .1s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1c2333')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
            >
              <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, color: '#58a6ff' }}>
                {c.numeroCotizacion}
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 500, color: '#c9d1d9', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.cliente?.nombre ?? '—'}
              </td>
              <td style={{ padding: '12px 16px', color: '#8b949e' }}>
                {c.responsable?.nombre ?? '—'}
              </td>
              <td style={{ padding: '12px 16px', color: '#8b949e', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {fmtDate(c.createdAt)}
              </td>
              <td style={{ padding: '12px 16px', fontWeight: 600, color: '#c9d1d9', textAlign: 'right', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '12px' }}>
                {fmt(c.total, c.moneda)}
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                <Badge variant={ESTADO_VARIANT[c.estado as EstadoCotizacion] ?? 'default'} dot>
                  {ESTADO_LABEL[c.estado as EstadoCotizacion] ?? c.estado}
                </Badge>
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onNavigate(c.id) }}
                  style={{ fontSize: '12px', fontWeight: 500, color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer' }}
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

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ height: '20px', width: '180px', borderRadius: '6px', background: 'rgba(255,255,255,.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <div style={{ height: '240px', borderRadius: '10px', background: 'rgba(255,255,255,.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
    </div>
  )
}

// ── Card contenedor para tabla ─────────────────────────────────
function TableCard({ title, subtitle, linkLabel, onLink, children }: {
  title: string; subtitle?: string; linkLabel?: string; onLink?: () => void; children: React.ReactNode
}) {
  return (
    <div style={{
      background: '#161b27',
      border: '1px solid rgba(255,255,255,.07)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#f0f6fc' }}>{title}</p>
          {subtitle && <p style={{ fontSize: '11px', color: '#484f58', marginTop: '2px' }}>{subtitle}</p>}
        </div>
        {linkLabel && onLink && (
          <button onClick={onLink} style={{ fontSize: '12px', fontWeight: 500, color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer' }}>
            {linkLabel} →
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const navigate    = useNavigate()
  const { user }    = useAuth()
  const { isAdmin } = usePermissions()
  const esAdmin     = isAdmin()

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  () => dashboardService.getStats(),
    staleTime: 30_000,
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: '12px', textAlign: 'center' }}>
        <AlertCircle style={{ width: '28px', height: '28px', color: '#f85149' }} />
        <p style={{ fontSize: '13px', color: '#8b949e' }}>No se pudieron cargar las métricas.</p>
        <button onClick={() => refetch()} style={{ fontSize: '12px', color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    )
  }

  const fechaHoy = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ── Admin ─────────────────────────────────────────────────
  if (esAdmin && stats && isAdminStats(stats)) {
    const s = stats
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f6fc', letterSpacing: '-.4px' }}>Panel de Control</h1>
            <p style={{ fontSize: '12px', color: '#484f58', marginTop: '4px' }}>
              Bienvenido, <span style={{ color: '#8b949e', fontWeight: 500 }}>{user?.nombre}</span> · {fechaHoy}
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.COTIZACION_NUEVA)} size="md">
            <Plus style={{ width: '14px', height: '14px' }} />
            Nueva cotización
          </Button>
        </div>

        {/* Métricas principales */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: '#2d3748', marginBottom: '10px' }}>
            Cotizaciones
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <Metrica icon={FileText}    label="Total"     value={s.cotizaciones.total}    color="blue" />
            <Metrica icon={Clock}       label="Este mes"  value={s.cotizaciones.mes}       sublabel={fmt(s.montos.cotizadoMes)} color="slate" />
            <Metrica icon={Send}        label="Enviadas"  value={s.cotizaciones.enviadas}  sublabel="Esperando respuesta" color="amber" />
            <Metrica icon={CheckCircle2} label="Aprobadas" value={s.cotizaciones.aprobadas} color="green" />
          </div>
        </div>

        {/* Métricas secundarias */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <Metrica icon={XCircle}    label="Rechazadas"     value={s.cotizaciones.rechazadas}  color="red" />
          <Metrica icon={TrendingUp} label="Monto aprobado" value={fmt(s.montos.aprobadoTotal)} color="green" />
          <Metrica icon={Users}      label="Clientes activos" value={s.clientes.activos} sublabel={`${s.clientes.total} total`} color="purple" />
          <Metrica icon={Package}    label="Ítems catálogo"  value={s.catalogo.itemsActivos} sublabel="Activos" color="blue" />
        </div>

        {/* Actividad reciente */}
        <TableCard
          title="Actividad reciente"
          subtitle="Últimas cotizaciones registradas en el sistema"
          linkLabel="Ver todas"
          onLink={() => navigate(ROUTES.COTIZACIONES)}
        >
          <ActividadReciente items={s.actividadReciente} onNavigate={id => navigate(ROUTES.COTIZACION_DETALLE(id))} />
        </TableCard>

        {/* Footer info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#2d3748' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <UserCog style={{ width: '12px', height: '12px' }} />
            {s.usuarios.activos} usuario{s.usuarios.activos !== 1 ? 's' : ''} activo{s.usuarios.activos !== 1 ? 's' : ''}
          </span>
          <span>·</span>
          <span>{s.cotizaciones.pendientes} cotización{s.cotizaciones.pendientes !== 1 ? 'es' : ''} pendiente{s.cotizaciones.pendientes !== 1 ? 's' : ''}</span>
        </div>
      </div>
    )
  }

  // ── Supervisor ────────────────────────────────────────────
  if (!esAdmin && stats && !isAdminStats(stats)) {
    const s = stats
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f6fc', letterSpacing: '-.4px' }}>Panel de Control</h1>
            <p style={{ fontSize: '12px', color: '#484f58', marginTop: '4px' }}>
              Bienvenido, <span style={{ color: '#8b949e', fontWeight: 500 }}>{user?.nombre}</span> · {fechaHoy}
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.COTIZACION_NUEVA)} size="md">
            <Plus style={{ width: '14px', height: '14px' }} />
            Nueva cotización
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <Metrica icon={FileText}    label="Mis cotizaciones" value={s.cotizaciones.total}   color="blue" />
          <Metrica icon={Clock}       label="Este mes"         value={s.cotizaciones.mes}      sublabel={fmt(s.montos.cotizadoMes)} color="slate" />
          <Metrica icon={CheckCircle2} label="Aprobadas"       value={s.cotizaciones.aprobadas} color="green" />
          <Metrica icon={Send}        label="Enviadas"         value={s.cotizaciones.enviadas} sublabel="Esperando respuesta" color="amber" />
        </div>

        <TableCard
          title="Mis cotizaciones recientes"
          subtitle="Tus últimas cotizaciones elaboradas"
          linkLabel="Ver todas"
          onLink={() => navigate(ROUTES.COTIZACIONES)}
        >
          <ActividadReciente items={s.actividadReciente} onNavigate={id => navigate(ROUTES.COTIZACION_DETALLE(id))} />
        </TableCard>

        {s.cotizaciones.pendientes > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(210,153,34,.1)',
            border: '1px solid rgba(210,153,34,.2)',
            fontSize: '12px', color: '#d29922',
          }}>
            <Clock style={{ width: '13px', height: '13px', flexShrink: 0 }} />
            Tienes {s.cotizaciones.pendientes} cotización{s.cotizaciones.pendientes !== 1 ? 'es' : ''} pendiente{s.cotizaciones.pendientes !== 1 ? 's' : ''} de atención.
          </div>
        )}
      </div>
    )
  }

  return <DashboardSkeleton />
}
