// ============================================================
// HYTICON — Tipos de Catálogo
// ============================================================

export type CategoriaCatalogo = 'HARDWARE' | 'MATERIALES' | 'MANO_OBRA' | 'SERVICIOS'

export const CATEGORIAS_CATALOGO: { value: CategoriaCatalogo; label: string }[] = [
  { value: 'HARDWARE',   label: 'Hardware' },
  { value: 'MATERIALES', label: 'Materiales' },
  { value: 'MANO_OBRA',  label: 'Mano de obra' },
  { value: 'SERVICIOS',  label: 'Servicios' },
]

export function labelCategoria(c: CategoriaCatalogo): string {
  return CATEGORIAS_CATALOGO.find((x) => x.value === c)?.label ?? c
}

export interface CatalogoItem {
  id: string
  codigo: string
  nombre: string
  descripcion: string | null
  categoria: CategoriaCatalogo
  unidad: string | null
  precioReferencial: string | null  // Decimal llega como string desde Prisma
  activo: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCatalogoPayload {
  codigo: string
  nombre: string
  descripcion?: string
  categoria: CategoriaCatalogo
  unidad?: string
  precioReferencial?: number
}

export type UpdateCatalogoPayload = Partial<CreateCatalogoPayload>

export interface CatalogoListResponse {
  data: CatalogoItem[]
  total: number
  page: number
  limit: number
}

export interface CatalogoFiltros {
  page?: number
  limit?: number
  search?: string
  categoria?: CategoriaCatalogo
  soloActivos?: boolean
}
