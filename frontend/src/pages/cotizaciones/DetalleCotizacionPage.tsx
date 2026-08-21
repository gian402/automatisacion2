// ============================================================
// HYTICON — DetalleCotizacionPage — Vista detalle + cambio de estado
// ============================================================

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, ArrowRight,
  User, Calendar, Building2, Hash, FileDown, Send,
} from 'lucide-react'

import { cotizacionesService } from '@/services/cotizaciones.service'
import { useApiMutation }      from '@/hooks/useApi'
import { PageHeader }          from '@/components/common/PageHeader'
import { Button }              from '@/components/ui/Button'
import { Badge }               from '@/components/ui/Badge'
import { Card }                from '@/components/ui/Card'
import { Separator }           from '@/components/ui/Separator'
import { FormField }           from '@/components/ui/FormField'
import { Select }              from '@/components/ui/Select'
import { Textarea }            from '@/components/ui/Textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from '@/components/ui/Dialog'
import { PageLoading }         from '@/components/common/PageLoading'
import { PageError }           from '@/components/common/ErrorMessage'
import { ROUTES }              from '@/router/routes'
import httpClient              from '@/services/http'
import { toast }               from 'sonner'
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  TIPO_ITEM_LABEL,
  TRANSICIONES_ESTADO,
  formatMonto,
  type EstadoCotizacion,
} from '@/types/cotizacion'

const cambioEstadoSchema = z.object({
  estado: z.enum(['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA', 'VENCIDA']),
  nota:   z.string().max(500).optional().or(z.literal('')),
})
type CambioEstadoForm = z.infer<typeof cambioEstadoSchema>

export default function DetalleCotizacionPage() {
  const { id }          = useParams<{ id: string }>()
  const navigate        = useNavigate()
  const queryClient     = useQueryClient()
  const [modalEstado, setModalEstado] = useState(false)
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function handleEnviar() {
    if (!id) return
    setEnviando(true)
    try {
      const result = await cotizacionesService.enviar(id)
      toast.success(
        result.n8nEnviado
          ? `Cotización ${result.numeroCotizacion} enviada correctamente`
          : `Cotización ${result.numeroCotizacion} marcada como enviada`,
      )
      queryClient.invalidateQueries({ queryKey: ['cotizacion', id] })
      queryClient.invalidateQueries({ queryKey: ['cotizacion-historial', id] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
    } catch {
      toast.error('Error al enviar la cotización. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  async function handleGenerarPdf() {
    if (!id) return
    setGenerandoPdf(true)
    try {
      const response = await httpClient.get(`/pdf/cotizacion/${id}`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url  = URL.createObjectURL(blob)
      window.open(url, '_blank')
      // Liberar la URL del objeto después de un momento
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      toast.success('PDF generado correctamente')
    } catch {
      toast.error('No se pudo generar el PDF. Intenta de nuevo.')
    } finally {
      setGenerandoPdf(false)
    }
  }

  const { data: cot, isLoading, isError, refetch } = useQuery({
    queryKey: ['cotizacion', id],
    queryFn:  () => cotizacionesService.findOne(id!),
    enabled:  !!id,
  })

  const { data: historial } = useQuery({
    queryKey: ['cotizacion-historial', id],
    queryFn:  () => cotizacionesService.getHistorial(id!),
    enabled:  !!id,
  })

  const { mutate: cambiarEstado, isPending: cambiando } = useApiMutation({
    mutationFn: ({ estado, nota }: { estado: EstadoCotizacion; nota?: string }) =>
      cotizacionesService.cambiarEstado(id!, { estado, nota }),
    successMessage: 'Estado actualizado correctamente',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizacion', id] })
      queryClient.invalidateQueries({ queryKey: ['cotizacion-historial', id] })
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] })
      setModalEstado(false)
      reset()
    },
  })

  const transiciones = cot ? TRANSICIONES_ESTADO[cot.estado] : []

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CambioEstadoForm>({
    resolver: zodResolver(cambioEstadoSchema),
    defaultValues: { estado: transiciones[0] ?? 'ENVIADA', nota: '' },
  })

  if (isLoading) return <PageLoading />
  if (isError || !cot) return <PageError onRetry={refetch} message="No se pudo cargar la cotización." />

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Cabecera */}
      <PageHeader
        title={cot.numeroCotizacion}
        description={cot.proyecto ?? 'Sin descripción de proyecto'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.COTIZACIONES)}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button
              variant="outline"
              size="sm"
              loading={generandoPdf}
              onClick={handleGenerarPdf}
            >
              <FileDown className="h-4 w-4" />
              Generar PDF
            </Button>
            {/* Botón enviar — solo visible en BORRADOR */}
            {cot && cot.estado === 'BORRADOR' && (
              <Button
                variant="primary"
                size="sm"
                loading={enviando}
                onClick={handleEnviar}
              >
                <Send className="h-4 w-4" />
                {enviando ? 'Enviando...' : 'Enviar'}
              </Button>
            )}
            {transiciones.length > 0 && cot?.estado !== 'BORRADOR' && (
              <Button variant="primary" size="sm" onClick={() => setModalEstado(true)}>
                <ArrowRight className="h-4 w-4" />
                Cambiar estado
              </Button>
            )}
          </div>
        }
      />

      {/* Estado actual */}
      <div className="flex items-center gap-3">
        <Badge variant={ESTADO_VARIANT[cot.estado]} className="text-sm px-3 py-1">
          {ESTADO_LABEL[cot.estado]}
        </Badge>
        <span className="text-xs text-[#94a3b8]">
          Creada el {new Date(cot.createdAt).toLocaleDateString('es-PE')}
        </span>
      </div>

      {/* Datos principales */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Cliente */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-[#64748b] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Cliente</p>
              <p className="font-semibold text-[#0f172a]">{cot.cliente?.nombre}</p>
              {cot.cliente?.ruc && (
                <p className="text-xs text-[#64748b]">RUC {cot.cliente.ruc}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Responsable */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-[#64748b] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Responsable</p>
              <p className="font-semibold text-[#0f172a]">{cot.responsable?.nombre}</p>
              {cot.responsable?.email && (
                <p className="text-xs text-[#64748b]">{cot.responsable.email}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Fechas */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-[#64748b] mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Fechas</p>
              <p className="text-sm text-[#475569]">
                <span className="font-medium">Emisión:</span>{' '}
                {new Date(cot.fechaEmision).toLocaleDateString('es-PE')}
              </p>
              <p className="text-sm text-[#475569]">
                <span className="font-medium">Vencimiento:</span>{' '}
                {new Date(cot.fechaVencimiento).toLocaleDateString('es-PE')}
              </p>
            </div>
          </div>
        </Card>

        {/* Documento + Moneda */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Hash className="h-5 w-5 text-[#64748b] mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">Documento</p>
              <p className="text-sm text-[#475569]">
                <span className="font-medium">Tipo:</span> {cot.tipoDocumento}
              </p>
              <p className="text-sm text-[#475569]">
                <span className="font-medium">Moneda:</span>{' '}
                {cot.moneda === 'PEN' ? 'Soles (S/)' : 'Dólares (USD)'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de ítems */}
      <Card className="overflow-hidden">
        <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
          <p className="text-sm font-semibold text-[#0f172a]">Ítems</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">Tipo</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#475569]">Descripción</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#475569] w-20">Cant.</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#475569] w-28">P. Unit.</th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#475569] w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(cot.items ?? []).map((item) => (
              <tr key={item.id} className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc]/60">
                <td className="px-4 py-3">
                  <Badge variant="default">{TIPO_ITEM_LABEL[item.tipoItem]}</Badge>
                </td>
                <td className="px-4 py-3 text-[#0f172a]">
                  {item.descripcion}
                  {item.catalogoItem && (
                    <p className="text-xs text-[#94a3b8]">{item.catalogoItem.codigo}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-[#475569]">
                  {parseFloat(item.cantidad).toLocaleString('es-PE')}
                </td>
                <td className="px-4 py-3 text-right text-[#475569]">
                  {formatMonto(item.precioUnitario, cot.moneda)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#0f172a]">
                  {formatMonto(item.subtotal, cot.moneda)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-4">
          <div className="ml-auto flex w-64 flex-col gap-2 text-sm">
            <div className="flex justify-between text-[#475569]">
              <span>Valor de venta</span>
              <span className="font-medium">{formatMonto(cot.valorVenta, cot.moneda)}</span>
            </div>
            <div className="flex justify-between text-[#475569]">
              <span>IGV (18%)</span>
              <span className="font-medium">{formatMonto(cot.igv, cot.moneda)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold text-[#0f172a]">
              <span>Total</span>
              <span>{formatMonto(cot.total, cot.moneda)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Términos */}
      {cot.terminosCondiciones && (
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8] mb-2">
            Términos y condiciones
          </p>
          <p className="text-sm text-[#475569] whitespace-pre-line">{cot.terminosCondiciones}</p>
        </Card>
      )}

      {/* Historial de estados */}
      {historial && historial.length > 0 && (
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8] mb-3">
            Historial de estados
          </p>
          <div className="flex flex-col gap-3">
            {historial.map((h, idx) => (
              <div key={h.id} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f1f5f9] text-xs font-bold text-[#64748b]">
                  {idx + 1}
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {h.estadoAnterior && (
                      <>
                        <Badge variant={ESTADO_VARIANT[h.estadoAnterior]} className="text-xs">
                          {ESTADO_LABEL[h.estadoAnterior]}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-[#94a3b8]" />
                      </>
                    )}
                    <Badge variant={ESTADO_VARIANT[h.estadoNuevo]} className="text-xs">
                      {ESTADO_LABEL[h.estadoNuevo]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                    <span>{h.cambiadoPor.nombre}</span>
                    <span>·</span>
                    <span>{new Date(h.createdAt).toLocaleString('es-PE')}</span>
                  </div>
                  {h.nota && (
                    <p className="text-xs text-[#64748b] italic">"{h.nota}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Modal cambiar estado ─────────────────────────────── */}
      <Dialog open={modalEstado} onOpenChange={(open) => !open && setModalEstado(false)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Cambiar estado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((v) => cambiarEstado({ estado: v.estado, nota: v.nota || undefined }))}>
            <DialogBody className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#475569]">Estado actual:</span>
                <Badge variant={ESTADO_VARIANT[cot.estado]}>{ESTADO_LABEL[cot.estado]}</Badge>
              </div>

              <FormField id="estado" label="Nuevo estado" required error={errors.estado?.message}>
                <Select id="estado" {...register('estado')}>
                  {transiciones.map((e) => (
                    <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
                  ))}
                </Select>
              </FormField>

              <FormField id="nota" label="Nota (opcional)" error={errors.nota?.message}>
                <Textarea
                  id="nota"
                  rows={2}
                  placeholder="Motivo del cambio de estado..."
                  {...register('nota')}
                />
              </FormField>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalEstado(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={cambiando}>
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
