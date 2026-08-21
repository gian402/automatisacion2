// ============================================================
// HYTICON — UsuariosPage (Prompt 09 — Roles)
// Solo accesible por ADMINISTRADOR
// ============================================================

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, UserCog, UserCheck, UserX } from 'lucide-react'

import { usersService } from '@/services/users.service'
import { useApiMutation } from '@/hooks/useApi'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, type TableColumn } from '@/components/ui/Table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Usuario } from '@/types'

// ── Schema de creación ────────────────────────────────────────
const crearSchema = z.object({
  nombre:   z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email:    z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rol:      z.enum(['ADMIN', 'SUPERVISOR']),
})
type CrearForm = z.infer<typeof crearSchema>

export default function UsuariosPage() {
  const queryClient = useQueryClient()
  const [page] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [toggleTarget, setToggleTarget] = useState<{ user: Usuario; activo: boolean } | null>(null)

  // ── Consulta ──────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', page],
    queryFn: () => usersService.findAll(page),
  })

  // ── Mutación crear ────────────────────────────────────────
  const { mutate: crearUsuario, isPending: creando } = useApiMutation({
    mutationFn: (payload: CrearForm) => usersService.create(payload),
    successMessage: 'Usuario creado correctamente',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
      reset()
    },
  })

  // ── Mutación toggle ───────────────────────────────────────
  const { mutate: toggleUser, isPending: toggling } = useApiMutation({
    mutationFn: ({ id, activo }: { id: string; activo: boolean }) =>
      usersService.toggle(id, activo),
    successMessage: 'Estado actualizado',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setToggleTarget(null)
    },
  })

  // ── Formulario ────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CrearForm>({
    resolver: zodResolver(crearSchema),
    defaultValues: { rol: 'SUPERVISOR' },
  })

  const onSubmit = (values: CrearForm) => crearUsuario(values)

  // ── Columnas de la tabla ──────────────────────────────────
  const columns: TableColumn<Usuario>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (u) => (
        <div>
          <p className="font-medium text-[#0f172a]">{u.nombre}</p>
          <p className="text-xs text-[#94a3b8]">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      width: '120px',
      render: (u) => (
        <Badge variant={u.rol === 'ADMIN' ? 'primary' : 'default'}>
          {u.rol === 'ADMIN' ? 'Administrador' : 'Supervisor'}
        </Badge>
      ),
    },
    {
      key: 'activo',
      header: 'Estado',
      width: '120px',
      align: 'center',
      render: (u) => (
        <div className="flex justify-center">
          <Badge variant={u.activo ? 'success' : 'default'}>
            {u.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'acciones',
      header: 'Acción',
      width: '90px',
      align: 'right',
      render: (u) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => { e.stopPropagation(); setToggleTarget({ user: u, activo: !u.activo }) }}
        >
          {u.activo
            ? <UserX className="h-4 w-4 text-[#dc2626]" />
            : <UserCheck className="h-4 w-4 text-[#16a34a]" />}
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Usuarios"
        description="Gestión de usuarios del sistema"
        actions={
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      <Table
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyIcon={<UserCog className="h-6 w-6" />}
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados."
      />

      {/* Modal — crear usuario */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormField id="nombre" label="Nombre completo" required error={errors.nombre?.message}>
                <Input id="nombre" placeholder="Juan Pérez" {...register('nombre')} error={!!errors.nombre} />
              </FormField>
              <FormField id="email" label="Correo electrónico" required error={errors.email?.message}>
                <Input id="email" type="email" placeholder="juan@hyticon.com" {...register('email')} error={!!errors.email} />
              </FormField>
              <FormField id="password" label="Contraseña" required error={errors.password?.message}>
                <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register('password')} error={!!errors.password} />
              </FormField>
              <FormField id="rol" label="Rol" required error={errors.rol?.message}>
                <Select id="rol" {...register('rol')}>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Administrador</option>
                </Select>
              </FormField>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset() }}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={creando}>
                Crear usuario
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmación toggle estado */}
      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.activo ? 'Activar usuario' : 'Desactivar usuario'}
        description={
          toggleTarget?.activo
            ? `¿Activar a ${toggleTarget.user.nombre}?`
            : `¿Desactivar a ${toggleTarget?.user.nombre}? Se cerrarán todas sus sesiones activas.`
        }
        variant={toggleTarget?.activo ? 'primary' : 'danger'}
        confirmLabel={toggleTarget?.activo ? 'Activar' : 'Desactivar'}
        isLoading={toggling}
        onConfirm={() =>
          toggleTarget && toggleUser({ id: toggleTarget.user.id, activo: toggleTarget.activo })
        }
      />
    </div>
  )
}
