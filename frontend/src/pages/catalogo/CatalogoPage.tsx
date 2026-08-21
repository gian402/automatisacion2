// ============================================================
// HYTICON — CatalogoPage (Prompt 11)
// Accesible por todos los roles. Crear/editar/toggle solo ADMIN.
// ============================================================

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Package, Search, X, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'

import { catalogoService } from '@/services/catalogo.service'
import { useApiMutation } from '@/hooks/useApi'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Table, TablePagination, type TableColumn } from '@/components/ui/Table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  ConfirmDialog,
} from '@/components/ui/Dialog'
import { FormField } from '@/components/ui/FormField'
import { Textarea } from '@/components/ui/Textarea'
import {
  CATEGORIAS_CATALOGO,
  labelCategoria,
  type CatalogoItem,
  type CategoriaCatalogo,
} from '@/types/catalogo'

// ── Schema ────────────────────────────────────────────────────
const itemSchema = z.object({
  codigo:            z.string().min(2, 'Mínimo 2 caracteres').max(50),
  nombre:            z.string().min(2, 'Mínimo 2 caracteres').max(200),
  descripcion:       z.string().max(500).optional().or(z.literal('')),
  categoria:         z.enum(['HARDWARE', 'MATERIALES', 'MANO_OBRA', 'SERVICIOS'], {
                       required_error: 'Selecciona una categoría',
                     }),
  unidad:            z.string().max(20).optional().or(z.literal('')),
  precioReferencial: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((v) => (v === '' || v === undefined ? undefined : parseFloat(v)))
    .pipe(
      z.number({ invalid_type_error: 'Precio inválido' })
        .min(0, 'El precio no puede ser negativo')
        .optional(),
    ),
})
type ItemForm = z.infer<typeof itemSchema>

// ── Badge de categoría ────────────────────────────────────────
const CATEGORIA_VARIANT: Record<CategoriaCatalogo, 'primary' | 'warning' | 'info' | 'success'> = {
  HARDWARE:   'primary',
  MATERIALES: 'warning',
  MANO_OBRA:  'info',
  SERVICIOS:  'success',
}

type ModalMode = 'crear' | 'editar'

export default function CatalogoPage() {
  const queryClient = useQueryClient()
  const { isAdmin } = usePermissions()
  const esAdmin = isAdmin()

  // ── Filtros ───────────────────────────────────────────────
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoria, setCategoria]   = useState<CategoriaCatalogo | ''>('')
  const LIMIT = 15

  // ── Modales ───────────────────────────────────────────────
  const [modalOpen, setModalOpen]   = useState(false)
  const [modalMode, setModalMode]   = useState<ModalMode>('crear')
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null)
  const [toggleTarget, setToggleTarget] = useState<{ item: CatalogoItem; activo: boolean } | null>(null)

  // ── Query ─────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['catalogo', page, search, categoria],
    queryFn: () =>
      catalogoService.findAll({
        page,
        limit: LIMIT,
        search: search || undefined,
        categoria: categoria || undefined,
      }),
  })

  // ── Mutación crear ────────────────────────────────────────
  const { mutate: crearItem, isPending: creando } = useApiMutation({
    mutationFn: (payload: ItemForm) =>
      catalogoService.create({
        codigo:            payload.codigo,
        nombre:            payload.nombre,
        descripcion:       payload.descripcion || undefined,
        categoria:         payload.categoria,
        unidad:            payload.unidad || undefined,
        precioReferencial: payload.precioReferencial,
      }),
    successMessage: 'Ítem creado correctamente',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo'] })
      cerrarModal()
    },
  })

  // ── Mutación editar ───────────────────────────────────────
  const { mutate: actualizarItem, isPending: actualizando } = useApiMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ItemForm }) =>
      catalogoService.update(id, {
        codigo:            payload.codigo,
        nombre:            payload.nombre,
        descripcion:       payload.descripcion || undefined,
        categoria:         payload.categoria,
        unidad:            payload.unidad || undefined,
        precioReferencial: payload.precioReferencial,
      }),
    successMessage: 'Ítem actualizado correctamente',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo'] })
      cerrarModal()
    },
  })

  // ── Mutación toggle ───────────────────────────────────────
  const { mutate: toggleItem, isPending: toggling } = useApiMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      catalogoService.toggle(id, activo),
    successMessage: 'Estado actualizado',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo'] })
      setToggleTarget(null)
    },
  })

  // ── Formulario ────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      codigo: '', nombre: '', descripcion: '',
      categoria: 'HARDWARE', unidad: '', precioReferencial: undefined,
    },
  })

  // ── Helpers de modal ──────────────────────────────────────
  function abrirCrear() {
    setModalMode('crear')
    setEditingItem(null)
    reset({
      codigo: '', nombre: '', descripcion: '',
      categoria: 'HARDWARE', unidad: '', precioReferencial: undefined,
    })
    setModalOpen(true)
  }

  function abrirEditar(item: CatalogoItem) {
    setModalMode('editar')
    setEditingItem(item)
    reset({
      codigo:            item.codigo,
      nombre:            item.nombre,
      descripcion:       item.descripcion ?? '',
      categoria:         item.categoria,
      unidad:            item.unidad ?? '',
      precioReferencial: item.precioReferencial ? parseFloat(item.precioReferencial) : undefined,
    })
    setModalOpen(true)
  }

  function cerrarModal() {
    setModalOpen(false)
    setEditingItem(null)
    reset()
  }

  function onSubmit(values: ItemForm) {
    if (modalMode === 'crear') {
      crearItem(values)
    } else if (editingItem) {
      actualizarItem({ id: editingItem.id, payload: values })
    }
  }

  // ── Debounce búsqueda ─────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1) }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  // ── Columnas ──────────────────────────────────────────────
  const columns: TableColumn<CatalogoItem>[] = [
    {
      key: 'codigo',
      header: 'Código',
      width: '130px',
      render: (i) => (
        <span className="font-mono text-xs font-semibold text-[#8b949e] bg-[rgba(255,255,255,.06)] px-2 py-0.5 rounded">
          {i.codigo}
        </span>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre / Descripción',
      render: (i) => (
        <div>
          <p className="font-medium text-[#c9d1d9]">{i.nombre}</p>
          {i.descripcion && (
            <p className="text-xs text-[#484f58] line-clamp-1">{i.descripcion}</p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      width: '140px',
      render: (i) => (
        <Badge variant={CATEGORIA_VARIANT[i.categoria]}>
          {labelCategoria(i.categoria)}
        </Badge>
      ),
    },
    {
      key: 'unidad',
      header: 'Unidad',
      width: '80px',
      align: 'center',
      render: (i) => (
        <span className="text-sm text-[#484f58]">{i.unidad ?? '—'}</span>
      ),
    },
    {
      key: 'precio',
      header: 'Precio ref.',
      width: '120px',
      align: 'right',
      render: (i) => (
        <span className="text-sm font-medium text-[#c9d1d9]">
          {i.precioReferencial
            ? `S/ ${parseFloat(i.precioReferencial).toFixed(2)}`
            : <span className="text-[#2d3748]">—</span>}
        </span>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      width: '100px',
      align: 'center',
      render: (i) => (
        <div className="flex justify-center">
          <Badge variant={i.activo ? 'success' : 'default'}>
            {i.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      ),
    },
    ...(esAdmin
      ? [{
          key: 'acciones',
          header: 'Acción',
          width: '100px',
          align: 'right' as const,
          render: (i: CatalogoItem) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                title="Editar ítem"
                onClick={(e) => { e.stopPropagation(); abrirEditar(i) }}
              >
                <Pencil className="h-4 w-4 text-[#484f58]" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                title={i.activo ? 'Desactivar' : 'Activar'}
                onClick={(e) => { e.stopPropagation(); setToggleTarget({ item: i, activo: !i.activo }) }}
              >
                {i.activo
                  ? <ToggleRight className="h-4 w-4 text-[#16a34a]" />
                  : <ToggleLeft  className="h-4 w-4 text-[#484f58]" />}
              </Button>
            </div>
          ),
        }]
      : []),
  ]

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="flex flex-col gap-5">
      {/* ── Cabecera ─────────────────────────────────────── */}
      <PageHeader
        title="Catálogo"
        description="Productos y servicios disponibles para cotizaciones"
        actions={
          esAdmin ? (
            <Button variant="primary" size="md" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nuevo ítem
            </Button>
          ) : undefined
        }
      />

      {/* ── Filtros ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#484f58] pointer-events-none" />
          <Input
            placeholder="Buscar por código, nombre..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#484f58] hover:text-[#8b949e] transition-colors"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filtro por categoría */}
        <div className="w-44">
          <Select
            value={categoria}
            onChange={(e) => { setCategoria(e.target.value as CategoriaCatalogo | ''); setPage(1) }}
          >
            <option value="">Todas las categorías</option>
            {CATEGORIAS_CATALOGO.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
        </div>

        {/* Contador */}
        {!isLoading && data && (
          <span className="text-sm text-[#484f58]">
            {data.total === 0
              ? 'Sin resultados'
              : `${data.total} ítem${data.total !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>

      {/* ── Tabla ────────────────────────────────────────── */}
      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(i) => i.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyIcon={<Package className="h-6 w-6" />}
        emptyTitle="Sin ítems en el catálogo"
        emptyDescription={
          search || categoria
            ? 'No se encontraron ítems con ese criterio.'
            : esAdmin
              ? 'Agrega productos y servicios para usarlos en cotizaciones.'
              : 'El catálogo está vacío. Contacta al administrador.'
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

      {/* ── Modal crear / editar (solo ADMIN) ────────────── */}
      {esAdmin && (
        <Dialog open={modalOpen} onOpenChange={(open) => !open && cerrarModal()}>
          <DialogContent size="md">
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'crear' ? 'Nuevo ítem' : 'Editar ítem'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogBody className="flex flex-col gap-4">
                {/* Código + Categoría */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField id="codigo" label="Código" required error={errors.codigo?.message}>
                    <Input
                      id="codigo"
                      placeholder="CAM-IP-001"
                      {...register('codigo')}
                      error={!!errors.codigo}
                    />
                  </FormField>

                  <FormField id="categoria" label="Categoría" required error={errors.categoria?.message}>
                    <Select id="categoria" {...register('categoria')} >
                      {CATEGORIAS_CATALOGO.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                {/* Nombre */}
                <FormField id="nombre" label="Nombre" required error={errors.nombre?.message}>
                  <Input
                    id="nombre"
                    placeholder="Cámara IP Hikvision 2MP"
                    {...register('nombre')}
                    error={!!errors.nombre}
                  />
                </FormField>

                {/* Descripción */}
                <FormField id="descripcion" label="Descripción" error={errors.descripcion?.message}>
                  <Textarea
                    id="descripcion"
                    placeholder="Descripción breve del producto o servicio..."
                    rows={2}
                    {...register('descripcion')}
                  />
                </FormField>

                {/* Unidad + Precio */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    id="unidad"
                    label="Unidad"
                    error={errors.unidad?.message}
                    hint='Ej: "und", "m", "hr", "gl"'
                  >
                    <Input
                      id="unidad"
                      placeholder="und"
                      {...register('unidad')}
                      error={!!errors.unidad}
                    />
                  </FormField>

                  <FormField
                    id="precioReferencial"
                    label="Precio referencial (S/)"
                    error={errors.precioReferencial?.message}
                    hint="Se puede modificar en cada cotización"
                  >
                    <Input
                      id="precioReferencial"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register('precioReferencial')}
                      error={!!errors.precioReferencial}
                    />
                  </FormField>
                </div>
              </DialogBody>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={cerrarModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={creando || actualizando}>
                  {modalMode === 'crear' ? 'Crear ítem' : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Confirmación toggle (solo ADMIN) ─────────────── */}
      {esAdmin && (
        <ConfirmDialog
          open={!!toggleTarget}
          onOpenChange={(open) => !open && setToggleTarget(null)}
          title={toggleTarget?.activo ? 'Activar ítem' : 'Desactivar ítem'}
          description={
            toggleTarget?.activo
              ? `¿Activar "${toggleTarget.item.nombre}"?`
              : `¿Desactivar "${toggleTarget?.item.nombre}"? No estará disponible en nuevas cotizaciones.`
          }
          variant={toggleTarget?.activo ? 'primary' : 'danger'}
          confirmLabel={toggleTarget?.activo ? 'Activar' : 'Desactivar'}
          isLoading={toggling}
          onConfirm={() =>
            toggleTarget &&
            toggleItem({ id: toggleTarget.item.id, activo: toggleTarget.activo })
          }
        />
      )}
    </div>
  )
}
