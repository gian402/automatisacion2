// ============================================================
// HYTICON — CotizacionesPage — Listado de cotizaciones
// ============================================================

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Search, X } from 'lucide-react'

import { cotizacionesService } from '@/services/cotizaciones.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TablePagination, type TableColumn } from '@/components/ui/Table'
import { ROUTES } from '@/router/routes'
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  type Cotizacion,
  type EstadoCotizacion,
  formatMonto,
} from '@/types/cotizacion'

const ESTADOS: EstadoCotizacion[] = ['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA']
const LIMIT = 15

export default function CotizacionesPage() {
  const navigate = useNavigate()

  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [estado, setEstado]           = useState<EstadoCotizacion | ''>('')

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cotizaciones', page, search, estado],
    queryFn: () =>
      cotizacionesService.findAll({
        page,
        limit: LIMIT,
        search:  search  || undefined,
        estado:  estado  || undefined,
      }),
  })

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  const columns: TableColumn<Cotizacion>[] = [
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
      header: 'Cliente / Proyecto',
      render: (c) => (
        <div>
          <p className="font-medium text-[#c9d1d9]">{c.cliente?.nombre ?? '—'}</p>
          {c.proyecto && (
            <p className="text-xs text-[#484f58] line-clamp-1">{c.proyecto}</p>
          )}
        </div>
      ),
    },
    {
      key: 'responsable',
      header: 'Responsable',
      width: '160px',
      render: (c) => (
        <span className="text-sm text-[#8b949e]">{c.responsable?.nombre ?? '—'}</span>
      ),
    },
    {
      key: 'fecha',
      header: 'Emisión',
      width: '110px',
      render: (c) => (
        <span className="text-sm text-[#8b949e]">
          {new Date(c.fechaEmision).toLocaleDateString('es-PE')}
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      width: '140px',
      align: 'right',
      render: (c) => (
        <span className="text-sm font-semibold text-[#c9d1d9]">
          {formatMonto(c.total, c.moneda)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '140px',
      align: 'center',
      render: (c) => (
        <div className="flex justify-center">
          <Badge variant={ESTADO_VARIANT[c.estado]}>
            {ESTADO_LABEL[c.estado]}
          </Badge>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Cotizaciones"
        description="Gestión de cotizaciones de HYTICON"
        actions={
          <Button variant="primary" size="md" onClick={() => navigate(ROUTES.COTIZACION_NUEVA)}>
            <Plus className="h-4 w-4" />
            Nueva cotización
          </Button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58] pointer-events-none" />
          <Input
            placeholder="Buscar número, cliente, proyecto..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="w-44">
          <Select
            value={estado}
            onChange={(e) => { setEstado(e.target.value as EstadoCotizacion | ''); setPage(1) }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
            ))}
          </Select>
        </div>

        {!isLoading && data && (
          <span className="text-sm text-[#484f58]">
            {data.total === 0
              ? 'Sin resultados'
              : `${data.total} cotización${data.total !== 1 ? 'es' : ''}`}
          </span>
        )}
      </div>

      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        onRowClick={(c) => navigate(ROUTES.COTIZACION_DETALLE(c.id))}
        emptyIcon={<FileText className="h-6 w-6" />}
        emptyTitle="Sin cotizaciones"
        emptyDescription={
          search || estado
            ? 'No se encontraron cotizaciones con ese criterio.'
            : 'Crea la primera cotización del sistema.'
        }
      />

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
