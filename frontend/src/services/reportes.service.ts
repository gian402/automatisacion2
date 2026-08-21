// ============================================================
// HYTICON — ReportesService (frontend)
// ============================================================

import httpClient from './http'
import type { EstadoCotizacion } from '@/types/cotizacion'

// ── Tipos ─────────────────────────────────────────────────────
export interface ResumenEstado {
  estado: EstadoCotizacion
  cantidad: number
  monto: number
}

export interface EvolucionMes {
  mes: string // YYYY-MM
  cantidad: number
  monto: number
  aprobadas: number
}

export interface TopItem {
  clienteId?: string
  responsableId?: string
  nombre: string
  cantidad: number
  monto: number
}

export interface CotizacionReporte {
  id: string
  numeroCotizacion: string
  estado: EstadoCotizacion
  moneda: 'PEN' | 'USD'
  total: number
  valorVenta: number
  igv: number
  fechaEmision: string
  createdAt: string
  cliente: { id: string; nombre: string; ruc: string | null } | null
  responsable: { id: string; nombre: string } | null
}

export interface ReporteResumen {
  resumen: {
    totalCotizaciones: number
    montoTotal: number
    montoAprobado: number
    tasaConversion: number | null
  }
  porEstado: ResumenEstado[]
  evolucion: EvolucionMes[]
  topClientes: TopItem[]
  topResponsables: TopItem[]
  cotizaciones: CotizacionReporte[]
}

export interface FiltrosReporte {
  fechaDesde?: string
  fechaHasta?: string
  estado?: EstadoCotizacion | ''
  responsableId?: string
  clienteId?: string
}

export interface ResponsableFiltro {
  id: string
  nombre: string
  rol: 'ADMIN' | 'SUPERVISOR'
}

export interface ClienteFiltro {
  id: string
  nombre: string
}

export const reportesService = {
  async getResumen(filtros: FiltrosReporte = {}): Promise<ReporteResumen> {
    const { data } = await httpClient.get<ReporteResumen>('/reportes/resumen', {
      params: {
        ...(filtros.fechaDesde    && { fechaDesde:    filtros.fechaDesde }),
        ...(filtros.fechaHasta    && { fechaHasta:    filtros.fechaHasta }),
        ...(filtros.estado        && { estado:        filtros.estado }),
        ...(filtros.responsableId && { responsableId: filtros.responsableId }),
        ...(filtros.clienteId     && { clienteId:     filtros.clienteId }),
      },
    })
    return data
  },

  async getResponsables(): Promise<ResponsableFiltro[]> {
    const { data } = await httpClient.get<ResponsableFiltro[]>('/reportes/responsables')
    return data
  },

  async getClientes(): Promise<ClienteFiltro[]> {
    const { data } = await httpClient.get<ClienteFiltro[]>('/reportes/clientes')
    return data
  },
}
