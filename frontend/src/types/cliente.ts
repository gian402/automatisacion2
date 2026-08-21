// ============================================================
// HYTICON — Tipos de Cliente
// ============================================================

export interface Cliente {
  id: string
  nombre: string
  ruc: string | null
  direccion: string | null
  email: string | null
  telefono: string | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateClientePayload {
  nombre: string
  ruc?: string
  direccion?: string
  email?: string
  telefono?: string
}

export type UpdateClientePayload = Partial<CreateClientePayload>

export interface ClientesListResponse {
  data: Cliente[]
  total: number
  page: number
  limit: number
}

export interface ClientesFiltros {
  page?: number
  limit?: number
  search?: string
  soloActivos?: boolean
}
