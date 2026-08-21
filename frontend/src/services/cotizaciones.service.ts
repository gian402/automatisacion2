// ============================================================
// HYTICON — CotizacionesService (frontend)
// ============================================================

import httpClient from './http'
import type {
  Cotizacion,
  CreateCotizacionPayload,
  UpdateCotizacionPayload,
  CambiarEstadoPayload,
  CotizacionesListResponse,
  CotizacionesFiltros,
  HistorialEstado,
} from '@/types/cotizacion'

export const cotizacionesService = {
  // ── Listar ────────────────────────────────────────────────
  async findAll(filtros: CotizacionesFiltros = {}): Promise<CotizacionesListResponse> {
    const { data } = await httpClient.get<CotizacionesListResponse>('/cotizaciones', {
      params: {
        page:  filtros.page  ?? 1,
        limit: filtros.limit ?? 15,
        ...(filtros.search        && { search:        filtros.search }),
        ...(filtros.estado        && { estado:        filtros.estado }),
        ...(filtros.clienteId     && { clienteId:     filtros.clienteId }),
        ...(filtros.responsableId && { responsableId: filtros.responsableId }),
      },
    })
    return data
  },

  // ── Detalle ───────────────────────────────────────────────
  async findOne(id: string): Promise<Cotizacion> {
    const { data } = await httpClient.get<Cotizacion>(`/cotizaciones/${id}`)
    return data
  },

  // ── Historial de estados ──────────────────────────────────
  async getHistorial(id: string): Promise<HistorialEstado[]> {
    const { data } = await httpClient.get<HistorialEstado[]>(`/cotizaciones/${id}/historial`)
    return data
  },

  // ── Crear ─────────────────────────────────────────────────
  async create(payload: CreateCotizacionPayload): Promise<Cotizacion> {
    const { data } = await httpClient.post<Cotizacion>('/cotizaciones', payload)
    return data
  },

  // ── Actualizar ────────────────────────────────────────────
  async update(id: string, payload: UpdateCotizacionPayload): Promise<Cotizacion> {
    const { data } = await httpClient.patch<Cotizacion>(`/cotizaciones/${id}`, payload)
    return data
  },

  // ── Cambiar estado ────────────────────────────────────────
  async cambiarEstado(id: string, payload: CambiarEstadoPayload): Promise<Cotizacion> {
    const { data } = await httpClient.patch<Cotizacion>(`/cotizaciones/${id}/estado`, payload)
    return data
  },

  // ── Enviar cotización ─────────────────────────────────────
  async enviar(id: string): Promise<{ ok: boolean; numeroCotizacion: string; estado: string; n8nEnviado: boolean }> {
    const { data } = await httpClient.post(`/cotizaciones/${id}/enviar`)
    return data
  },
}
