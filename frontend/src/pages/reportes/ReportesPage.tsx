// ============================================================
// HYTICON — ReportesPage (Prompt 17)
// Solo ADMIN — análisis de cotizaciones con filtros y tablas
// ============================================================

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  X,
  TrendingUp,
  CheckCircle2,
  Users,
  AlertCircle,
} from 'lucide-react'

import { reportesService, type FiltrosReporte } from '@/services/reportes.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Table, type TableColumn } from '@/components/ui/Table'
import { ROUTES } from '@/router/routes'
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  type EstadoCotizacion,
} from '@/types/cotizacion'
import type { CotizacionReporte as CotizacionFila } from '@/services/reportes.service'

// ── Utilidades ────────────────────────────────────────────────
function fmt(n: number): string {
  return `S/ ${n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtFecha(s: string): string {
  return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtMes(yyyymm: string): string {
  const [y, m] = yyyymm.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })
}

// ── Tarjeta de resumen ────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sublabel, color,
}: {
  icon: React.ElementType; label: string; value: string | number
  sublabel?: string; color: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4 px-5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-[#484f58]">{label}</p>
          <p className="text-lg font-semibold text-[#c9d1d9] leading-tight">{value}</p>
          {sublabel && <p className="text-xs text-[#484f58]">{sublabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Columnas de la tabla principal ────────────────────────────
const columns: TableColumn<CotizacionFila>[] = [
  {
    key: 'numero',
    header: 'Número',
    width: '160px',
    render: (c) => (
      <span className="font-mono text-xs font-semibold text-[#58a6ff]">
        {c.numeroCotizacion}
      </span>
    ),
  },
  {
    key: 'cliente',
    header: 'Cliente',
    render: (c) => (
      <div>
        <p className="font-medium text-sm text-[#c9d1d9]">{c.cliente?.nombre ?? '—'}</p>
        {c.cliente?.ruc && <p className="text-xs text-[#484f58]">RUC {c.cliente.ruc}</p>}
      </div>
    ),
  },
  {
    key: 'responsable',
    header: 'Responsable',
    width: '150px',
    render: (c) => (
      <span className="text-sm text-[#8b949e]">{c.responsable?.nombre ?? '—'}</span>
    ),
  },
  {
    key: 'fecha',
    header: 'Fecha',
    width: '100px',
    render: (c) => (
      <span className="text-sm text-[#8b949e]">{fmtFecha(c.fechaEmision)}</span>
    ),
  },
  {
    key: 'total',
    header: 'Total',
    width: '120px',
    align: 'right',
    render: (c) => (
      <span className="text-sm font-semibold text-[#c9d1d9]">{fmt(c.total)}</span>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    width: '110px',
    render: (c) => (
      <Badge variant={ESTADO_VARIANT[c.estado] ?? 'default'}>
        {ESTADO_LABEL[c.estado] ?? c.estado}
      </Badge>
    ),
  },
]

// ── ReportesPage ──────────────────────────────────────────────
const ESTADOS: EstadoCotizacion[] = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA']

export default function ReportesPage() {
  const navigate = useNavigate()

  const [filtros, setFiltros] = useState<FiltrosReporte>({})
  const [filtrosAplicados, setFiltrosAplicados] = useState<FiltrosReporte>({})

  // Carga de datos para los selects de filtro
  const { data: responsables } = useQuery({
    queryKey: ['reportes-responsables'],
    queryFn:  () => reportesService.getResponsables(),
    staleTime: 60_000,
  })

  const { data: clientes } = useQuery({
    queryKey: ['reportes-clientes'],
    queryFn:  () => reportesService.getClientes(),
    staleTime: 60_000,
  })

  // Datos del reporte
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reportes-resumen', filtrosAplicados],
    queryFn:  () => reportesService.getResumen(filtrosAplicados),
  })

  function aplicarFiltros() {
    setFiltrosAplicados({ ...filtros })
  }

  function limpiarFiltros() {
    setFiltros({})
    setFiltrosAplicados({})
  }

  const hayFiltros = Object.values(filtrosAplicados).some(Boolean)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Reportes"
        description="Análisis del proceso de cotizaciones"
      />

      {/* ── Filtros ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[rgba(255,255,255,.07)] bg-[#1c2333] p-4">
        <div className="flex items-center gap-1">
          <label className="text-xs text-[#484f58] whitespace-nowrap">Desde</label>
          <Input
            type="date"
            value={filtros.fechaDesde ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, fechaDesde: e.target.value || undefined }))}
            className="w-36 text-sm"
          />
        </div>

        <div className="flex items-center gap-1">
          <label className="text-xs text-[#484f58] whitespace-nowrap">Hasta</label>
          <Input
            type="date"
            value={filtros.fechaHasta ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, fechaHasta: e.target.value || undefined }))}
            className="w-36 text-sm"
          />
        </div>

        <div className="w-40">
          <Select
            value={filtros.estado ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, estado: (e.target.value || undefined) as EstadoCotizacion | undefined }))}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
            ))}
          </Select>
        </div>

        <div className="w-44">
          <Select
            value={filtros.responsableId ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, responsableId: e.target.value || undefined }))}
          >
            <option value="">Todos los responsables</option>
            {responsables?.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </Select>
        </div>

        <div className="w-44">
          <Select
            value={filtros.clienteId ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, clienteId: e.target.value || undefined }))}
          >
            <option value="">Todos los clientes</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </Select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={aplicarFiltros}
            className="px-4 py-2 rounded-md bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#1e3a5f]/90 transition-colors"
          >
            Aplicar
          </button>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-[rgba(255,255,255,.07)] bg-[#161b27] text-sm text-[#484f58] hover:bg-[rgba(255,255,255,.06)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────── */}
      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#dc2626]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          No se pudieron cargar los datos.{' '}
          <button onClick={() => refetch()} className="underline">Reintentar</button>
        </div>
      )}

      {/* ── Métricas resumen ─────────────────────────────── */}
      {!isLoading && data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={BarChart3}
              label="Total cotizaciones"
              value={data.resumen.totalCotizaciones}
              color="bg-[#dbeafe] text-[#1e40af]"
            />
            <StatCard
              icon={TrendingUp}
              label="Monto total cotizado"
              value={fmt(data.resumen.montoTotal)}
              color="bg-[#dcfce7] text-[#15803d]"
            />
            <StatCard
              icon={CheckCircle2}
              label="Monto aprobado"
              value={fmt(data.resumen.montoAprobado)}
              color="bg-[#dcfce7] text-[#15803d]"
            />
            <StatCard
              icon={TrendingUp}
              label="Tasa de conversión"
              value={data.resumen.tasaConversion !== null ? `${data.resumen.tasaConversion}%` : '—'}
              sublabel="Aprobadas / cerradas"
              color="bg-[#f3e8ff] text-[#6b21a8]"
            />
          </div>

          {/* ── Distribución por estado ───────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <div className="border-b border-[#f1f5f9] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#c9d1d9]">Distribución por estado</h3>
              </div>
              <CardContent className="p-0">
                {data.porEstado.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[#484f58]">Sin datos</p>
                ) : (
                  <div className="divide-y divide-[#f1f5f9]">
                    {data.porEstado.map((e) => (
                      <div key={e.estado} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-28 shrink-0">
                          <Badge variant={ESTADO_VARIANT[e.estado as EstadoCotizacion] ?? 'default'}>
                            {ESTADO_LABEL[e.estado as EstadoCotizacion] ?? e.estado}
                          </Badge>
                        </div>
                        <span className="text-sm font-semibold text-[#c9d1d9] w-8 shrink-0">
                          {e.cantidad}
                        </span>
                        <div className="flex-1 bg-[rgba(255,255,255,.06)] rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-[#1e3a5f]"
                            style={{
                              width: data.resumen.totalCotizaciones > 0
                                ? `${Math.round((e.cantidad / data.resumen.totalCotizaciones) * 100)}%`
                                : '0%',
                            }}
                          />
                        </div>
                        <span className="text-sm text-[#8b949e] w-28 text-right shrink-0">
                          {fmt(e.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Top responsables ──────────────────────── */}
            <Card>
              <div className="border-b border-[#f1f5f9] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#c9d1d9]">Top responsables</h3>
              </div>
              <CardContent className="p-0">
                {data.topResponsables.length === 0 ? (
                  <p className="py-6 text-center text-sm text-[#484f58]">Sin datos</p>
                ) : (
                  <div className="divide-y divide-[#f1f5f9]">
                    {data.topResponsables.map((r, i) => (
                      <div key={r.responsableId ?? i} className="flex items-center gap-3 px-4 py-3">
                        <span className="text-xs font-bold text-[#484f58] w-4 shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbeafe]">
                          <Users className="h-3.5 w-3.5 text-[#1e40af]" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-[#c9d1d9] truncate">{r.nombre}</span>
                        <span className="text-xs text-[#484f58] shrink-0">{r.cantidad} cot.</span>
                        <span className="text-sm font-semibold text-[#c9d1d9] w-28 text-right shrink-0">
                          {fmt(r.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Evolución mensual ─────────────────────────── */}
          {data.evolucion.length > 0 && (
            <Card>
              <div className="border-b border-[#f1f5f9] px-4 py-3">
                <h3 className="text-sm font-semibold text-[#c9d1d9]">Evolución mensual</h3>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f1f5f9] bg-[#1c2333]">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-[#484f58] uppercase tracking-wide">Mes</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-[#484f58] uppercase tracking-wide">Cotizaciones</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-[#484f58] uppercase tracking-wide">Aprobadas</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-[#484f58] uppercase tracking-wide">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f8fafc]">
                      {data.evolucion.map((e) => (
                        <tr key={e.mes} className="hover:bg-[#1c2333] transition-colors">
                          <td className="px-4 py-2.5 font-medium text-[#c9d1d9]">{fmtMes(e.mes)}</td>
                          <td className="px-4 py-2.5 text-center text-[#8b949e]">{e.cantidad}</td>
                          <td className="px-4 py-2.5 text-center">
                            {e.aprobadas > 0
                              ? <span className="text-[#16a34a] font-medium">{e.aprobadas}</span>
                              : <span className="text-[#2d3748]">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-sm text-[#c9d1d9]">
                            {fmt(e.monto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Tabla detalle ─────────────────────────────── */}
          <Card>
            <div className="flex items-center justify-between border-b border-[#f1f5f9] px-4 py-3">
              <h3 className="text-sm font-semibold text-[#c9d1d9]">
                Detalle — {data.cotizaciones.length} cotizaciones
              </h3>
            </div>
            <Table
              columns={columns}
              data={data.cotizaciones}
              keyExtractor={(c) => c.id}
              isLoading={isLoading}
              isError={false}
              onRowClick={(c) => navigate(ROUTES.COTIZACION_DETALLE(c.id))}
              emptyIcon={<BarChart3 className="h-6 w-6" />}
              emptyTitle="Sin cotizaciones en el período"
              emptyDescription="Ajusta los filtros para ver resultados."
            />
          </Card>
        </>
      )}

      {/* ── Cargando ─────────────────────────────────────── */}
      {isLoading && (
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-[rgba(255,255,255,.06)]" />
          ))}
        </div>
      )}
    </div>
  )
}
