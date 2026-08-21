// ============================================================
// HYTICON — Tipos globales del dominio
// ============================================================

// ── Roles ────────────────────────────────────────────────────
export type Rol = 'ADMIN' | 'SUPERVISOR'

// ── Usuario autenticado (sesión) ──────────────────────────────
export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  activo?: boolean
  createdAt?: string
  updatedAt?: string
}

// ── Moneda ───────────────────────────────────────────────────
export type Moneda = 'PEN' | 'USD'

// ── Estado cotización ─────────────────────────────────────────
export type EstadoCotizacion = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA' | 'VENCIDA'

// ── Tipo ítem ─────────────────────────────────────────────────
export type TipoItem = 'PRODUCTO' | 'MATERIAL' | 'SERVICIO'

// ── Categoría catálogo ────────────────────────────────────────
export type CategoriaCatalogo = 'HARDWARE' | 'MATERIALES' | 'MANO_OBRA' | 'SERVICIOS'

// ── Respuesta paginada de la API ──────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ── Respuesta genérica de la API ──────────────────────────────
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

// ── Error de la API ───────────────────────────────────────────
export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}

// ── Parámetros de búsqueda/paginación ─────────────────────────
export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  [key: string]: unknown
}
