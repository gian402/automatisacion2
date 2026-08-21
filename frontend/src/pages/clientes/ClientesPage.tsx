// ============================================================
// HYTICON — ClientesPage (Prompt 10)
// Accesible por ADMINISTRADOR y SUPERVISOR
// ============================================================

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Building2, Search, X, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'

import { clientesService } from '@/services/clientes.service'
import { useApiMutation } from '@/hooks/useApi'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
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
import type { Cliente } from '@/types/cliente'

// ── Schemas ───────────────────────────────────────────────────
const clienteSchema = z.object({
  nombre:   z.string().min(2, 'Mínimo 2 caracteres').max(200, 'Máximo 200 caracteres'),
  ruc:      z
    .string()
    .regex(/^\d{11}$/, 'El RUC debe tener exactamente 11 dígitos')
    .optional()
    .or(z.literal('')),
  direccion: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
  email:    z.string().email('Ingresa un correo válido').optional().or(z.literal('')),
  telefono: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
})
type ClienteForm = z.infer<typeof clienteSchema>

// ── Helpers ───────────────────────────────────────────────────
function cleanPayload(values: ClienteForm) {
  return {
    nombre:    values.nombre,
    ruc:       values.ruc       || undefined,
    direccion: values.direccion || undefined,
    email:     values.email     || undefined,
    telefono:  values.telefono  || undefined,
  }
}

// ── Tipo de modal ─────────────────────────────────────────────
type ModalMode = 'crear' | 'editar'

export default function ClientesPage() {
  const queryClient = useQueryClient()

  // ── Filtros y paginación ──────────────────────────────────
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [searchInput, setSearchInput] = useState('')
  const LIMIT = 15

  // ── Estado de modales ─────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('crear')
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [toggleTarget, setToggleTarget] = useState<{ cliente: Cliente; activo: boolean } | null>(null)

  // ── Query ─────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientes', page, search],
    queryFn: () => clientesService.findAll({ page, limit: LIMIT, search: search || undefined }),
  })

  // ── Mutación crear ────────────────────────────────────────
  const { mutate: crearCliente, isPending: creando } = useApiMutation({
    mutationFn: (payload: ReturnType<typeof cleanPayload>) =>
      clientesService.create(payload),
    successMessage: 'Cliente creado correctamente',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      cerrarModal()
    },
  })

  // ── Mutación editar ───────────────────────────────────────
  const { mutate: actualizarCliente, isPending: actualizando } = useApiMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReturnType<typeof cleanPayload> }) =>
      clientesService.update(id, payload),
    successMessage: 'Cliente actualizado correctamente',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      cerrarModal()
    },
  })

  // ── Mutación toggle ───────────────────────────────────────
  const { mutate: toggleCliente, isPending: toggling } = useApiMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      clientesService.toggle(id, activo),
    successMessage: 'Estado del cliente actualizado',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      setToggleTarget(null)
    },
  })

  // ── Formulario ────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { nombre: '', ruc: '', direccion: '', email: '', telefono: '' },
  })

  // ── Helpers de modal ──────────────────────────────────────
  function abrirCrear() {
    setModalMode('crear')
    setEditingCliente(null)
    reset({ nombre: '', ruc: '', direccion: '', email: '', telefono: '' })
    setModalOpen(true)
  }

  function abrirEditar(cliente: Cliente) {
    setModalMode('editar')
    setEditingCliente(cliente)
    reset({
      nombre:    cliente.nombre,
      ruc:       cliente.ruc       ?? '',
      direccion: cliente.direccion ?? '',
      email:     cliente.email     ?? '',
      telefono:  cliente.telefono  ?? '',
    })
    setModalOpen(true)
  }

  function cerrarModal() {
    setModalOpen(false)
    setEditingCliente(null)
    reset()
  }

  // ── Submit ────────────────────────────────────────────────
  function onSubmit(values: ClienteForm) {
    const payload = cleanPayload(values)
    if (modalMode === 'crear') {
      crearCliente(payload)
    } else if (editingCliente) {
      actualizarCliente({ id: editingCliente.id, payload })
    }
  }

  // ── Búsqueda con debounce ─────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput])

  // ── Columnas ──────────────────────────────────────────────
  const columns: TableColumn<Cliente>[] = [
    {
      key: 'nombre',
      header: 'Razón social / Nombre',
      render: (c) => (
        <div>
          <p className="font-medium text-[#0f172a]">{c.nombre}</p>
          {c.ruc && <p className="text-xs text-[#94a3b8]">RUC {c.ruc}</p>}
        </div>
      ),
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (c) => (
        <div className="flex flex-col gap-0.5">
          {c.email && <span className="text-sm text-[#334155]">{c.email}</span>}
          {c.telefono && <span className="text-xs text-[#94a3b8]">{c.telefono}</span>}
          {!c.email && !c.telefono && <span className="text-xs text-[#cbd5e1]">—</span>}
        </div>
      ),
    },
    {
      key: 'direccion',
      header: 'Dirección',
      render: (c) => (
        <span className="text-sm text-[#475569]">
          {c.direccion ?? <span className="text-[#cbd5e1]">—</span>}
        </span>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      width: '120px',
      align: 'center',
      render: (c) => (
        <div className="flex justify-center">
          <Badge variant={c.activo ? 'success' : 'default'}>
            {c.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'acciones',
      header: 'Acción',
      width: '100px',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          {/* Editar */}
          <Button
            variant="ghost"
            size="sm"
            title="Editar cliente"
            onClick={(e) => { e.stopPropagation(); abrirEditar(c) }}
          >
            <Pencil className="h-4 w-4 text-[#64748b]" />
          </Button>
          {/* Toggle activo */}
          <Button
            variant="ghost"
            size="sm"
            title={c.activo ? 'Desactivar cliente' : 'Activar cliente'}
            onClick={(e) => { e.stopPropagation(); setToggleTarget({ cliente: c, activo: !c.activo }) }}
          >
            {c.activo
              ? <ToggleRight className="h-4 w-4 text-[#16a34a]" />
              : <ToggleLeft  className="h-4 w-4 text-[#94a3b8]" />}
          </Button>
        </div>
      ),
    },
  ]

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1

  return (
    <div className="flex flex-col gap-5">
      {/* ── Cabecera ─────────────────────────────────────── */}
      <PageHeader
        title="Clientes"
        description="Gestión de clientes del sistema"
        actions={
          <Button variant="primary" size="md" onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </Button>
        }
      />

      {/* ── Barra de búsqueda ────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, RUC, correo..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Contador de resultados */}
        {!isLoading && data && (
          <span className="text-sm text-[#64748b]">
            {data.total === 0
              ? 'Sin resultados'
              : `${data.total} cliente${data.total !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>

      {/* ── Tabla ────────────────────────────────────────── */}
      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyIcon={<Building2 className="h-6 w-6" />}
        emptyTitle="Sin clientes"
        emptyDescription={
          search
            ? 'No se encontraron clientes con ese criterio de búsqueda.'
            : 'Aún no hay clientes registrados. Crea el primero.'
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

      {/* ── Modal crear / editar ─────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => !open && cerrarModal()}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'crear' ? 'Nuevo cliente' : 'Editar cliente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              {/* Razón social */}
              <FormField
                id="nombre"
                label="Razón social / Nombre"
                required
                error={errors.nombre?.message}
              >
                <Input
                  id="nombre"
                  placeholder="Empresa Ejemplo S.A.C."
                  {...register('nombre')}
                  error={!!errors.nombre}
                />
              </FormField>

              {/* RUC */}
              <FormField
                id="ruc"
                label="RUC"
                error={errors.ruc?.message}
                hint="11 dígitos exactos"
              >
                <Input
                  id="ruc"
                  placeholder="20123456789"
                  maxLength={11}
                  {...register('ruc')}
                  error={!!errors.ruc}
                />
              </FormField>

              {/* Email y Teléfono en fila */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="email"
                  label="Correo electrónico"
                  error={errors.email?.message}
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@empresa.com"
                    {...register('email')}
                    error={!!errors.email}
                  />
                </FormField>

                <FormField
                  id="telefono"
                  label="Teléfono"
                  error={errors.telefono?.message}
                >
                  <Input
                    id="telefono"
                    placeholder="999 888 777"
                    {...register('telefono')}
                    error={!!errors.telefono}
                  />
                </FormField>
              </div>

              {/* Dirección */}
              <FormField
                id="direccion"
                label="Dirección"
                error={errors.direccion?.message}
              >
                <Input
                  id="direccion"
                  placeholder="Av. Lima 123, Lima"
                  {...register('direccion')}
                  error={!!errors.direccion}
                />
              </FormField>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={cerrarModal}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={creando || actualizando}
              >
                {modalMode === 'crear' ? 'Crear cliente' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Confirmación toggle estado ────────────────────── */}
      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.activo ? 'Activar cliente' : 'Desactivar cliente'}
        description={
          toggleTarget?.activo
            ? `¿Activar al cliente "${toggleTarget.cliente.nombre}"?`
            : `¿Desactivar al cliente "${toggleTarget?.cliente.nombre}"? No podrá ser seleccionado en nuevas cotizaciones.`
        }
        variant={toggleTarget?.activo ? 'primary' : 'danger'}
        confirmLabel={toggleTarget?.activo ? 'Activar' : 'Desactivar'}
        isLoading={toggling}
        onConfirm={() =>
          toggleTarget &&
          toggleCliente({ id: toggleTarget.cliente.id, activo: toggleTarget.activo })
        }
      />
    </div>
  )
}
