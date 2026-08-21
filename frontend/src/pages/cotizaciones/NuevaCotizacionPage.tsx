// ============================================================
// HYTICON — NuevaCotizacionPage — Formulario multi-step
// Paso 1: Datos generales  (cliente, proyecto, fechas, moneda)
// Paso 2: Ítems            (agregar productos/servicios)
// Paso 3: Términos + resumen
// ============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Trash2, ChevronRight, ChevronLeft,
  CheckCircle2, Package,
} from 'lucide-react'

import { cotizacionesService } from '@/services/cotizaciones.service'
import { clientesService }     from '@/services/clientes.service'
import { catalogoService }     from '@/services/catalogo.service'
import { useApiMutation }      from '@/hooks/useApi'
import { useAuth }             from '@/hooks/useAuth'
import { PageHeader }          from '@/components/common/PageHeader'
import { Button }              from '@/components/ui/Button'
import { Input }               from '@/components/ui/Input'
import { Select }              from '@/components/ui/Select'
import { FormField }           from '@/components/ui/FormField'
import { Textarea }            from '@/components/ui/Textarea'
import { Card }                from '@/components/ui/Card'
import { Badge }               from '@/components/ui/Badge'
import { Separator }           from '@/components/ui/Separator'
import { ROUTES }              from '@/router/routes'
import {
  TIPO_ITEM_LABEL,
  calcularSubtotalItem,
  calcularTotales,
  formatMonto,
  type TipoItem,
  type Moneda,
} from '@/types/cotizacion'

// ── Schemas ───────────────────────────────────────────────────
const itemSchema = z.object({
  catalogoItemId: z.string().optional(),
  tipoItem:       z.enum(['PRODUCTO', 'MATERIAL', 'SERVICIO']),
  descripcion:    z.string().min(2, 'Mínimo 2 caracteres').max(500),
  cantidad:       z.coerce.number().min(0.01, 'Mínimo 0.01'),
  precioUnitario: z.coerce.number().min(0, 'No puede ser negativo'),
})

const paso1Schema = z.object({
  clienteId:       z.string().uuid('Selecciona un cliente'),
  proyecto:        z.string().max(300).optional().or(z.literal('')),
  fechaEmision:    z.string().min(1, 'Requerido'),
  fechaVencimiento:z.string().min(1, 'Requerido'),
  tipoDocumento:   z.string().max(50).optional().or(z.literal('')),
  responsableId:   z.string().uuid('Selecciona un responsable'),
  moneda:          z.enum(['PEN', 'USD']),
})

const paso3Schema = z.object({
  terminosCondiciones: z.string().max(2000).optional().or(z.literal('')),
})

type Paso1Form = z.infer<typeof paso1Schema>
type ItemForm  = z.infer<typeof itemSchema>
type Paso3Form = z.infer<typeof paso3Schema>

const PASOS = ['Datos generales', 'Ítems', 'Términos y resumen']

export default function NuevaCotizacionPage() {
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const { user }     = useAuth()
  const [paso, setPaso] = useState(0)
  const [items, setItems] = useState<ItemForm[]>([])
  const [itemError, setItemError] = useState('')

  // ── Datos para selects ────────────────────────────────────
  const { data: clientes }   = useQuery({ queryKey: ['clientes-select'],   queryFn: () => clientesService.findAll({ soloActivos: true, limit: 200 }) })
  const { data: responsables } = useQuery({ queryKey: ['users-select'],    queryFn: async () => {
    const { data } = await import('@/services/users.service').then(m => m.usersService.findAll(1, 100))
    return data
  }})
  const { data: catalogo }   = useQuery({ queryKey: ['catalogo-select'],   queryFn: () => catalogoService.findAll({ soloActivos: true, limit: 500 }) })

  // ── Formulario paso 1 ─────────────────────────────────────
  const hoy    = new Date().toISOString().split('T')[0]
  const en30   = new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]

  const {
    register: r1, handleSubmit: hs1, watch: w1,
    formState: { errors: e1 },
  } = useForm<Paso1Form>({
    resolver: zodResolver(paso1Schema),
    defaultValues: {
      fechaEmision:     hoy,
      fechaVencimiento: en30,
      tipoDocumento:    'COTIZACIÓN',
      moneda:           'PEN',
      responsableId:    user?.id ?? '',
    },
  })

  const monedaActual = w1('moneda') as Moneda

  // ── Formulario de ítem ────────────────────────────────────
  const {
    register: ri, handleSubmit: hsi, reset: resetItem,
    setValue: svItem, watch: wi,
    formState: { errors: ei },
  } = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: { tipoItem: 'PRODUCTO', descripcion: '', cantidad: 1, precioUnitario: 0 },
  })

  const cantidadActual = wi('cantidad') ?? 1
  const precioActual   = wi('precioUnitario') ?? 0
  const subtotalPreview = calcularSubtotalItem(Number(cantidadActual), Number(precioActual))

  // ── Formulario paso 3 ─────────────────────────────────────
  const {
    register: r3, handleSubmit: hs3,
    formState: { errors: e3 },
  } = useForm<Paso3Form>({
    defaultValues: { terminosCondiciones: 'Validez de la oferta: 30 días calendario.\nPrecios incluyen IGV.\nForma de pago: 50% adelantado, 50% contra entrega.' },
  })

  // ── Cálculos en tiempo real ───────────────────────────────
  const subtotales = items.map((i) => calcularSubtotalItem(i.cantidad, i.precioUnitario))
  const totales    = calcularTotales(subtotales)

  // ── Mutación crear ────────────────────────────────────────
  const { mutate: crear, isPending: creando } = useApiMutation({
    mutationFn: (payload: Parameters<typeof cotizacionesService.create>[0]) =>
      cotizacionesService.create(payload),
    successMessage: 'Cotización creada correctamente',
    onSuccess: (cot) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      navigate(ROUTES.COTIZACION_DETALLE(cot.id))
    },
  })

  // ── Handlers de ítems ─────────────────────────────────────
  function onAgregarItem(values: ItemForm) {
    setItems((prev) => [...prev, values])
    setItemError('')
    resetItem({ tipoItem: 'PRODUCTO', descripcion: '', cantidad: 1, precioUnitario: 0 })
  }

  function onEliminarItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function onSeleccionarCatalogo(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    if (!id) return
    const item = catalogo?.data.find((c) => c.id === id)
    if (!item) return
    svItem('catalogoItemId',  item.id)
    svItem('descripcion',     item.nombre)
    svItem('tipoItem',        item.categoria === 'SERVICIOS' || item.categoria === 'MANO_OBRA' ? 'SERVICIO' : 'PRODUCTO')
    svItem('precioUnitario',  item.precioReferencial ? parseFloat(item.precioReferencial) : 0)
  }

  // ── Submit final ──────────────────────────────────────────
  function onSubmitFinal(paso1: Paso1Form, terminos: Paso3Form) {
    if (items.length === 0) { setItemError('Agrega al menos un ítem'); return }
    crear({
      clienteId:          paso1.clienteId,
      proyecto:           paso1.proyecto   || undefined,
      fechaEmision:       paso1.fechaEmision,
      fechaVencimiento:   paso1.fechaVencimiento,
      tipoDocumento:      paso1.tipoDocumento || undefined,
      responsableId:      paso1.responsableId,
      moneda:             paso1.moneda,
      terminosCondiciones: terminos.terminosCondiciones || undefined,
      items: items.map((item, idx) => ({
        catalogoItemId: item.catalogoItemId || undefined,
        tipoItem:       item.tipoItem,
        descripcion:    item.descripcion,
        cantidad:       item.cantidad,
        precioUnitario: item.precioUnitario,
        orden:          idx,
      })),
    })
  }

  // ── Paso 1 → 2 ───────────────────────────────────────────
  const irAPaso2 = hs1(() => setPaso(1))
  // ── Paso 2 → 3 ───────────────────────────────────────────
  function irAPaso3() {
    if (items.length === 0) { setItemError('Agrega al menos un ítem'); return }
    setItemError('')
    setPaso(2)
  }
  // ── Paso 3 → enviar ───────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      <PageHeader
        title="Nueva cotización"
        description="Completa los datos para crear una cotización"
      />

      {/* ── Indicador de pasos ────────────────────────────── */}
      <div className="flex items-center gap-2">
        {PASOS.map((nombre, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-sm ${
              i < paso  ? 'text-[#16a34a]' :
              i === paso ? 'text-[#58a6ff] font-semibold' :
              'text-[#484f58]'
            }`}>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                i < paso  ? 'bg-[rgba(63,185,80,.12)] text-[#3fb950]' :
                i === paso ? 'bg-[#2563eb] text-white' :
                'bg-[rgba(255,255,255,.06)] text-[#484f58]'
              }`}>
                {i < paso ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              {nombre}
            </div>
            {i < PASOS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-[#2d3748]" />
            )}
          </div>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          PASO 1 — Datos generales
      ════════════════════════════════════════════════════ */}
      {paso === 0 && (
        <Card className="p-6">
          <form onSubmit={irAPaso2} className="flex flex-col gap-5">
            {/* Cliente */}
            <FormField id="clienteId" label="Cliente" required error={e1.clienteId?.message}>
              <Select id="clienteId" {...r1('clienteId')}>
                <option value="">— Selecciona un cliente —</option>
                {clientes?.data.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}{c.ruc ? ` — RUC ${c.ruc}` : ''}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Proyecto */}
            <FormField id="proyecto" label="Proyecto / Descripción" error={e1.proyecto?.message}>
              <Input id="proyecto" placeholder="Instalación de sistema CCTV en almacén" {...r1('proyecto')} />
            </FormField>

            {/* Tipo documento + Moneda */}
            <div className="grid grid-cols-2 gap-4">
              <FormField id="tipoDocumento" label="Tipo de documento" error={e1.tipoDocumento?.message}>
                <Select id="tipoDocumento" {...r1('tipoDocumento')}>
                  <option value="COTIZACIÓN">Cotización</option>
                  <option value="PROPUESTA">Propuesta técnica</option>
                  <option value="PRESUPUESTO">Presupuesto</option>
                </Select>
              </FormField>
              <FormField id="moneda" label="Moneda" required error={e1.moneda?.message}>
                <Select id="moneda" {...r1('moneda')}>
                  <option value="PEN">Soles (S/)</option>
                  <option value="USD">Dólares (USD)</option>
                </Select>
              </FormField>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4">
              <FormField id="fechaEmision" label="Fecha de emisión" required error={e1.fechaEmision?.message}>
                <Input id="fechaEmision" type="date" {...r1('fechaEmision')} />
              </FormField>
              <FormField id="fechaVencimiento" label="Fecha de vencimiento" required error={e1.fechaVencimiento?.message}>
                <Input id="fechaVencimiento" type="date" {...r1('fechaVencimiento')} />
              </FormField>
            </div>

            {/* Responsable */}
            <FormField id="responsableId" label="Responsable" required error={e1.responsableId?.message}>
              <Select id="responsableId" {...r1('responsableId')}>
                <option value="">— Selecciona un responsable —</option>
                {responsables?.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </Select>
            </FormField>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ════════════════════════════════════════════════════
          PASO 2 — Ítems
      ════════════════════════════════════════════════════ */}
      {paso === 1 && (
        <div className="flex flex-col gap-4">
          {/* Formulario para agregar ítem */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-[#c9d1d9] mb-4">Agregar ítem</p>
            <form onSubmit={hsi(onAgregarItem)} className="flex flex-col gap-4">
              {/* Selector de catálogo */}
              <FormField id="catSelect" label="Seleccionar del catálogo (opcional)">
                <Select id="catSelect" onChange={onSeleccionarCatalogo} defaultValue="">
                  <option value="">— Buscar en catálogo —</option>
                  {catalogo?.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.codigo}] {c.nombre}
                      {c.precioReferencial ? ` — S/ ${parseFloat(c.precioReferencial).toFixed(2)}` : ''}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="grid grid-cols-4 gap-3">
                <FormField id="tipoItem" label="Tipo" required error={ei.tipoItem?.message} className="col-span-1">
                  <Select id="tipoItem" {...ri('tipoItem')}>
                    {(Object.keys(TIPO_ITEM_LABEL) as TipoItem[]).map((t) => (
                      <option key={t} value={t}>{TIPO_ITEM_LABEL[t]}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField id="descripcion" label="Descripción" required error={ei.descripcion?.message} className="col-span-3">
                  <Input id="descripcion" placeholder="Descripción del ítem" {...ri('descripcion')} error={!!ei.descripcion} />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-3 items-end">
                <FormField id="cantidad" label="Cantidad" required error={ei.cantidad?.message}>
                  <Input id="cantidad" type="number" step="0.01" min="0.01" {...ri('cantidad')} error={!!ei.cantidad} />
                </FormField>
                <FormField id="precioUnitario" label={`P. unitario (${monedaActual === 'PEN' ? 'S/' : '$'})`} required error={ei.precioUnitario?.message}>
                  <Input id="precioUnitario" type="number" step="0.01" min="0" {...ri('precioUnitario')} error={!!ei.precioUnitario} />
                </FormField>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[#8b949e]">Subtotal</span>
                  <div className="flex h-9 items-center rounded-md border border-[rgba(255,255,255,.07)] bg-[#1c2333] px-3 text-sm font-semibold text-[#c9d1d9]">
                    {formatMonto(subtotalPreview, monedaActual)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Agregar ítem
                </Button>
              </div>
            </form>
          </Card>

          {/* Lista de ítems agregados */}
          {items.length > 0 ? (
            <Card className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,.07)] bg-[#1c2333]">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#8b949e]">Tipo</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#8b949e]">Descripción</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#8b949e] w-20">Cant.</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#8b949e] w-28">P. Unit.</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#8b949e] w-28">Subtotal</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-[rgba(255,255,255,.07)] last:border-0 hover:bg-[#1c2333]/60">
                      <td className="px-4 py-3">
                        <Badge variant="default">{TIPO_ITEM_LABEL[item.tipoItem]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#c9d1d9]">{item.descripcion}</td>
                      <td className="px-4 py-3 text-right text-[#8b949e]">{item.cantidad}</td>
                      <td className="px-4 py-3 text-right text-[#8b949e]">{formatMonto(item.precioUnitario, monedaActual)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-[#c9d1d9]">
                        {formatMonto(calcularSubtotalItem(item.cantidad, item.precioUnitario), monedaActual)}
                      </td>
                      <td className="px-2 py-3">
                        <Button variant="ghost" size="sm" onClick={() => onEliminarItem(idx)}>
                          <Trash2 className="h-4 w-4 text-[#f85149]" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,.07)] py-10 text-[#484f58]">
              <div className="flex flex-col items-center gap-2">
                <Package className="h-8 w-8" />
                <p className="text-sm">Agrega al menos un ítem a la cotización</p>
              </div>
            </div>
          )}

          {itemError && (
            <p className="text-sm text-[#f85149]">{itemError}</p>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setPaso(0)}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button variant="primary" onClick={irAPaso3}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PASO 3 — Términos y resumen
      ════════════════════════════════════════════════════ */}
      {paso === 2 && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <FormField id="terminos" label="Términos y condiciones" error={e3.terminosCondiciones?.message}>
              <Textarea
                id="terminos"
                rows={5}
                placeholder="Validez de la oferta, forma de pago, etc."
                {...r3('terminosCondiciones')}
              />
            </FormField>
          </Card>

          {/* Resumen de totales */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-[#c9d1d9] mb-4">Resumen</p>
            <div className="flex flex-col gap-2 text-sm">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[#8b949e]">
                  <span className="flex-1 truncate pr-4">{item.descripcion}</span>
                  <span className="font-medium text-[#c9d1d9]">
                    {formatMonto(calcularSubtotalItem(item.cantidad, item.precioUnitario), monedaActual)}
                  </span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-[#8b949e]">
                <span>Valor de venta</span>
                <span className="font-medium">{formatMonto(totales.valorVenta, monedaActual)}</span>
              </div>
              <div className="flex justify-between text-[#8b949e]">
                <span>IGV (18%)</span>
                <span className="font-medium">{formatMonto(totales.igv, monedaActual)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-base font-bold text-[#c9d1d9]">
                <span>Total</span>
                <span>{formatMonto(totales.total, monedaActual)}</span>
              </div>
            </div>
          </Card>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setPaso(1)}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="primary"
              loading={creando}
              onClick={hs3((terminos) => {
                hs1((paso1) => {
                  onSubmitFinal(paso1, terminos)
                })()
              })}
            >
              Crear cotización
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
