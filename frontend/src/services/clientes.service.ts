// ============================================================
// HYTICON — ClientesService (frontend)
// Conectado a la API real: /clientes
// ============================================================

import httpClient from './http'
import type {
  Cliente,
  CreateClientePayload,
  UpdateClientePayload,
  ClientesListResponse,
  ClientesFiltros,
} from '@/types/cliente'

export const clientesService = {
  // ── Listar con búsqueda y paginación ─────────────────────
  async findAll(filtros: ClientesFiltros = {}): Promise<ClientesListResponse> {
    const { data } = await httpClient.get<ClientesListResponse>('/clientes', {
      params: {
        page:        filtros.page        ?? 1,
        limit:       filtros.limit       ?? 20,
        ...(filtros.search     !== undefined && filtros.search !== '' && { search: filtros.search }),
        ...(filtros.soloActivos !== undefined && { soloActivos: filtros.soloActivos }),
      },
    })
    return data
  },

  // ── Detalle de un cliente ─────────────────────────────────
  async findOne(id: string): Promise<Cliente> {
    const { data } = await httpClient.get<Cliente>(`/clientes/${id}`)
    return data
  },

  // ── Crear cliente ─────────────────────────────────────────
  async create(payload: CreateClientePayload): Promise<Cliente> {
    const { data } = await httpClient.post<Cliente>('/clientes', payload)
    return data
  },

  // ── Actualizar cliente ────────────────────────────────────
  async update(id: string, payload: UpdateClientePayload): Promise<Cliente> {
    const { data } = await httpClient.patch<Cliente>(`/clientes/${id}`, payload)
    return data
  },

  // ── Activar / desactivar cliente ──────────────────────────
  async toggle(id: string, activo: boolean): Promise<Cliente> {
    const { data } = await httpClient.patch<Cliente>(`/clientes/${id}/toggle`, { activo })
    return data
  },
}
