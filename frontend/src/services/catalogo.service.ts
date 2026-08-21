// ============================================================
// HYTICON — CatalogoService (frontend)
// Conectado a la API real: /catalogo
// ============================================================

import httpClient from './http'
import type {
  CatalogoItem,
  CreateCatalogoPayload,
  UpdateCatalogoPayload,
  CatalogoListResponse,
  CatalogoFiltros,
} from '@/types/catalogo'

export const catalogoService = {
  // ── Listar con búsqueda, filtro y paginación ──────────────
  async findAll(filtros: CatalogoFiltros = {}): Promise<CatalogoListResponse> {
    const { data } = await httpClient.get<CatalogoListResponse>('/catalogo', {
      params: {
        page:  filtros.page  ?? 1,
        limit: filtros.limit ?? 20,
        ...(filtros.search     && { search:      filtros.search }),
        ...(filtros.categoria  && { categoria:   filtros.categoria }),
        ...(filtros.soloActivos !== undefined && { soloActivos: filtros.soloActivos }),
      },
    })
    return data
  },

  // ── Detalle de un ítem ────────────────────────────────────
  async findOne(id: string): Promise<CatalogoItem> {
    const { data } = await httpClient.get<CatalogoItem>(`/catalogo/${id}`)
    return data
  },

  // ── Crear ítem (solo ADMIN) ───────────────────────────────
  async create(payload: CreateCatalogoPayload): Promise<CatalogoItem> {
    const { data } = await httpClient.post<CatalogoItem>('/catalogo', payload)
    return data
  },

  // ── Actualizar ítem (solo ADMIN) ──────────────────────────
  async update(id: string, payload: UpdateCatalogoPayload): Promise<CatalogoItem> {
    const { data } = await httpClient.patch<CatalogoItem>(`/catalogo/${id}`, payload)
    return data
  },

  // ── Activar / desactivar (solo ADMIN) ────────────────────
  async toggle(id: string, activo: boolean): Promise<CatalogoItem> {
    const { data } = await httpClient.patch<CatalogoItem>(`/catalogo/${id}/toggle`, { activo })
    return data
  },
}
