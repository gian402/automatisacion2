// ============================================================
// HYTICON — Tipos de Cotizaciones
// ============================================================

import type { Cliente } from './cliente'

export type EstadoCotizacion = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA'
export type Moneda            = 'PEN' | 'USD'
export type TipoItem          = 'PRODUCTO' | 'MATERIAL' | 'SERVICIO'

// ── Labels / variantes ────────────────────────────────────────
export const ESTADO_LABEL: Record<EstadoCotizacion, string> = {
  BORRADOR:  'Borrador',
  ENVIADA:   'Enviada',
  APROBADA:  'Aprobada',
  RECHAZADA: 'Rechazada',
  VENCIDA:   'Vencida',
}

export const ESTADO_VARIANT: Record<EstadoCotizacion, 'default' | 'primary' | 'success' | 'danger' | 'warning'> = {
  BORRADOR:  'default',
  ENVIADA:   'primary',
  APROBADA:  'success',
  RECHAZADA: 'danger',
  VENCIDA:   'warning',
}

export const TIPO_ITEM_LABEL: Record<TipoItem, string> = {
  PRODUCTO: 'Producto',
  MATERIAL: 'Material',
  SERVICIO: 'Servicio',
}

export const MONEDA_LABEL: Record<Moneda, string> = {
  PEN: 'Soles (S/)',
  USD: 'Dólares (USD)',
}

// ── Transiciones permitidas ───────────────────────────────────
export const TRANSICIONES_ESTADO: Record<EstadoCotizacion, EstadoCotizacion[]> = {
  BORRADOR:  ['ENVIADA'],
  ENVIADA:   ['APROBADA', 'RECHAZADA', 'VENCIDA'],
  APROBADA:  ['VENCIDA'],
  RECHAZADA: [],
  VENCIDA:   [],
}

// ── Entidades ─────────────────────────────────────────────────
export interface CotizacionItem {
  id: string
  cotizacionId: string
  catalogoItemId: string | null
  tipoItem: TipoItem
  descripcion: string
  cantidad: string       // Decimal llega como string desde Prisma
  precioUnitario: string
  subtotal: string
  orden: number
  createdAt: string
  catalogoItem?: { id: string; codigo: string; nombre: string } | null
}

export interface HistorialEstado {
  id: string
  cotizacionId: string
  estadoAnterior: EstadoCotizacion | null
  estadoNuevo: EstadoCotizacion
  cambiadoPorId: string
  nota: string | null
  createdAt: string
  cambiadoPor: { id: string; nombre: string }
}

export interface Cotizacion {
  id: string
  numeroCotizacion: string
  clienteId: string
  proyecto: string | null
  fechaEmision: string
  fechaVencimiento: string
  tipoDocumento: string
  responsableId: string
  moneda: Moneda
  estado: EstadoCotizacion
  terminosCondiciones: string | null
  valorVenta: string
  igv: string
  total: string
  pdfUrl: string | null
  creadoPorId: string
  createdAt: string
  updatedAt: string
  // Relaciones incluidas
  cliente?: Pick<Cliente, 'id' | 'nombre' | 'ruc'>
  responsable?: { id: string; nombre: string; email?: string }
  creadoPor?: { id: string; nombre: string }
  items?: CotizacionItem[]
  historialEstados?: HistorialEstado[]
  _count?: { items: number }
}

// ── Payloads ──────────────────────────────────────────────────
export interface CotizacionItemPayload {
  catalogoItemId?: string
  tipoItem: TipoItem
  descripcion: string
  cantidad: number
  precioUnitario: number
  orden?: number
}

export interface CreateCotizacionPayload {
  clienteId: string
  proyecto?: string
  fechaEmision: string
  fechaVencimiento: string
  tipoDocumento?: string
  responsableId: string
  moneda: Moneda
  terminosCondiciones?: string
  items: CotizacionItemPayload[]
}

export type UpdateCotizacionPayload = Partial<CreateCotizacionPayload>

export interface CambiarEstadoPayload {
  estado: EstadoCotizacion
  nota?: string
}

// ── Respuesta paginada ────────────────────────────────────────
export interface CotizacionesListResponse {
  data: Cotizacion[]
  total: number
  page: number
  limit: number
}

export interface CotizacionesFiltros {
  page?: number
  limit?: number
  search?: string
  estado?: EstadoCotizacion
  clienteId?: string
  responsableId?: string
}

// ── Cálculo en frontend ───────────────────────────────────────
export const IGV_PORCENTAJE = 0.18

export function calcularSubtotalItem(cantidad: number, precioUnitario: number): number {
  return Math.round(cantidad * precioUnitario * 100) / 100
}

export function calcularTotales(subtotales: number[]): {
  valorVenta: number
  igv: number
  total: number
} {
  const valorVenta = Math.round(subtotales.reduce((a, b) => a + b, 0) * 100) / 100
  const igv        = Math.round(valorVenta * IGV_PORCENTAJE * 100) / 100
  const total      = Math.round((valorVenta + igv) * 100) / 100
  return { valorVenta, igv, total }
}

export function formatMonto(monto: string | number, moneda: Moneda = 'PEN'): string {
  const num = typeof monto === 'string' ? parseFloat(monto) : monto
  const symbol = moneda === 'PEN' ? 'S/' : '$'
  return `${symbol} ${num.toFixed(2)}`
}
