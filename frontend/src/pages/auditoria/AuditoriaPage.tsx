// ============================================================
// HYTICON — AuditoriaPage (Prompt 15)
// Historial de auditoría — solo ADMIN
// ============================================================

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, Search, X, ChevronDown, ChevronRight } from 'lucide-react'

import {
  auditoriaService,
  labelAccion,
  labelEntidad,
  type RegistroAuditoria,
} from '@/services/auditoria.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TablePagination, type TableColumn } from '@/components/ui/Table'

// ── Entidades disponibles para filtro ─────────────────────────
const ENTIDADES = [
  { value: 'users',          label: 'Usuarios' },
  { value: 'clientes',       label: 'Clientes' },
  { value: 'catalogo_items', label: 'Catálogo' },
  { value: 'cotizaciones',   label: 'Cotizaciones' },
]

// ── Colores por tipo de acción ────────────────────────────────
function variantAccion(accion: string): 'success' | 'primary' | 'warning' | 'danger' | 'default' {
  if (accion.startsWith('CREAR_'))       return 'success'
  if (accion.startsWith('ACTUALIZAR_')) return 'primary'
  if (accion.startsWith('DESACTIVAR_') || accion.startsWith('ELIMINAR_')) return 'danger'
  if (accion.startsWith('ACTIVAR_'))    return 'warning'
  if (accion === 'LOGIN')               return 'primary'
  if (accion === 'LOGOUT')              return 'default'
  if (accion === 'GENERAR_PDF')         return 'info' as 'primary'
  if (accion === 'CAMBIAR_ESTADO_COTIZACION') return 'warning'
  return 'default'
}

// ── Fila expandible con detalle JSON ──────────────────────────
function DetalleRow({ registro }: { registro: RegistroAuditoria }) {
  const [open, setOpen] = useState(false)
  const tieneDetalle = registro.detalle && Object.keys(registro.detalle).length > 0

  if (!tieneDetalle) return null

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-[#484f58] hover:text-[#c9d1d9] transition-colors"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {open ? 'Ocultar detalle' : 'Ver detalle'}
      </button>
      {open && (
        <pre className="mt-2 rounded bg-[#1c2333] border border-[rgba(255,255,255,.07)] p-2 text-xs text-[#8b949e] overflow-auto max-h-32 font-mono">
          {JSON.stringify(registro.detalle, null, 2)}
        </pre>
      )}
    </div>
  )
}

const LIMIT = 50

export default function AuditoriaPage() {
  // ── Filtros ───────────────────────────────────────────────
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [entidad, setEntidad]       = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')

  // Debounce búsqueda → accion
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset de página al cambiar filtros
  useEffect(() => { setPage(1) }, [entidad, fechaDesde, fechaHasta])

  // ── Query ─────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auditoria', page, search, entidad, fechaDesde, fechaHasta],
    queryFn: () =>
      auditoriaService.findAll({
        page,
        limit: LIMIT,
        accion:     search     || undefined,
        entidad:    entidad    || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      }),
  })

  // ── Columnas ──────────────────────────────────────────────
  const columns: TableColumn<RegistroAuditoria>[] = [
    {
      key: 'fecha',
      header: 'Fecha / Hora',
      width: '155px',
      render: (r) => {
        const d = new Date(r.createdAt)
        return (
          <div className="leading-tight">
            <p className="text-xs font-medium text-[#c9d1d9]">
              {d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            <p className="text-xs text-[#484f58]">
              {d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        )
      },
    },
    {
      key: 'usuario',
      header: 'Usuario',
      width: '180px',
      render: (r) =>
        r.usuario ? (
          <div className="leading-tight">
            <p className="text-sm font-medium text-[#c9d1d9]">{r.usuario.nombre}</p>
            <p className="text-xs text-[#484f58]">{r.usuario.email}</p>
          </div>
        ) : (
          <span className="text-xs text-[#2d3748]">Sistema</span>
        ),
    },
    {
      key: 'accion',
      header: 'Acción',
      width: '200px',
      render: (r) => (
        <Badge variant={variantAccion(r.accion)} className="text-xs">
          {labelAccion(r.accion)}
        </Badge>
      ),
    },
    {
      key: 'entidad',
      header: 'Módulo',
      width: '120px',
      render: (r) => (
        <span className="text-sm text-[#8b949e]">{labelEntidad(r.entidad)}</span>
      ),
    },
    {
      key: 'detalle',
      header: 'Detalle',
      render: (r) => (
        <div>
          {r.entidadId && (
            <p className="text-xs font-mono text-[#484f58] truncate max-w-[180px]">
              ID: {r.entidadId}
            </p>
          )}
          <DetalleRow registro={r} />
        </div>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      width: '110px',
      render: (r) => (
        <span className="text-xs font-mono text-[#484f58]">{r.ip ?? '—'}</span>
      ),
    },
  ]

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1
  const hasFilters = !!(search || entidad || fechaDesde || fechaHasta)

  function limpiarFiltros() {
    setSearchInput('')
    setSearch('')
    setEntidad('')
    setFechaDesde('')
    setFechaHasta('')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Cabecera ─────────────────────────────────────── */}
      <PageHeader
        title="Auditoría"
        description="Historial completo de acciones del sistema"
      />

      {/* ── Filtros ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda por acción */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58] pointer-events-none" />
          <Input
            placeholder="Buscar por acción..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
              onClick={() => { setSearchInput(''); setSearch('') }}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtro entidad */}
        <div className="w-44">
          <Select
            value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
          >
            <option value="">Todos los módulos</option>
            {ENTIDADES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </Select>
        </div>

        {/* Fecha desde */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-[#484f58] whitespace-nowrap">Desde</label>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-36 text-sm"
          />
        </div>

        {/* Fecha hasta */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-[#484f58] whitespace-nowrap">Hasta</label>
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-36 text-sm"
          />
        </div>

        {/* Limpiar filtros */}
        {hasFilters && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="flex items-center gap-1 text-xs text-[#484f58] hover:text-[#c9d1d9] transition-colors px-2 py-1 rounded border border-[rgba(255,255,255,.07)] bg-[#161b27] hover:bg-[#1c2333]"
          >
            <X className="h-3 w-3" />
            Limpiar
          </button>
        )}

        {/* Contador */}
        {!isLoading && data && (
          <span className="text-sm text-[#484f58] ml-auto">
            {data.total === 0
              ? 'Sin registros'
              : `${data.total.toLocaleString()} registro${data.total !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>

      {/* ── Tabla ────────────────────────────────────────── */}
      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyIcon={<ShieldCheck className="h-6 w-6" />}
        emptyTitle="Sin registros de auditoría"
        emptyDescription={
          hasFilters
            ? 'No se encontraron registros con ese criterio.'
            : 'Las acciones del sistema aparecerán aquí.'
        }
      />

      {/* ── Paginación ───────────────────────────────────── */}
      {!isLoading && data && totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          total={data.total}
          limit={LIMIT}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
