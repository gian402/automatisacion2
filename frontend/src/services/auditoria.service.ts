// ============================================================
// HYTICON — AuditoriaService (frontend)
// ============================================================

import httpClient from './http'

// ── Tipos ─────────────────────────────────────────────────────
export interface UsuarioResumen {
  id: string
  nombre: string
  email: string
  rol: 'ADMIN' | 'SUPERVISOR'
}

export interface RegistroAuditoria {
  id: string
  accion: string
  entidad: string
  entidadId: string | null
  detalle: Record<string, unknown> | null
  ip: string | null
  createdAt: string
  usuario: UsuarioResumen | null
}

export interface AuditoriaListResponse {
  data: RegistroAuditoria[]
  total: number
  page: number
  limit: number
}

export interface AuditoriaFiltros {
  page?: number
  limit?: number
  accion?: string
  entidad?: string
  usuarioId?: string
  fechaDesde?: string
  fechaHasta?: string
}

// ── Etiquetas legibles por acción ─────────────────────────────
const ACCION_LABEL: Record<string, string> = {
  LOGIN:                      'Inicio de sesión',
  LOGOUT:                     'Cierre de sesión',
  CREAR_USUARIO:              'Creó usuario',
  ACTUALIZAR_USUARIO:         'Actualizó usuario',
  ACTIVAR_USUARIO:            'Activó usuario',
  DESACTIVAR_USUARIO:         'Desactivó usuario',
  CREAR_CLIENTE:              'Creó cliente',
  ACTUALIZAR_CLIENTE:         'Actualizó cliente',
  ACTIVAR_CLIENTE:            'Activó cliente',
  DESACTIVAR_CLIENTE:         'Desactivó cliente',
  CREAR_CATALOGO_ITEM:        'Creó ítem del catálogo',
  ACTUALIZAR_CATALOGO_ITEM:   'Actualizó ítem del catálogo',
  ACTIVAR_CATALOGO_ITEM:      'Activó ítem del catálogo',
  DESACTIVAR_CATALOGO_ITEM:   'Desactivó ítem del catálogo',
  CREAR_COTIZACION:           'Creó cotización',
  ACTUALIZAR_COTIZACION:      'Actualizó cotización',
  CAMBIAR_ESTADO_COTIZACION:  'Cambió estado de cotización',
  GENERAR_PDF:                'Generó PDF',
}

export function labelAccion(accion: string): string {
  return ACCION_LABEL[accion] ?? accion
}

// ── Entidades legibles ────────────────────────────────────────
const ENTIDAD_LABEL: Record<string, string> = {
  users:          'Usuarios',
  clientes:       'Clientes',
  catalogo_items: 'Catálogo',
  cotizaciones:   'Cotizaciones',
}

export function labelEntidad(entidad: string): string {
  return ENTIDAD_LABEL[entidad] ?? entidad
}

// ── Service ───────────────────────────────────────────────────
export const auditoriaService = {
  async findAll(filtros: AuditoriaFiltros = {}): Promise<AuditoriaListResponse> {
    const { data } = await httpClient.get<AuditoriaListResponse>('/auditoria', {
      params: {
        page:  filtros.page  ?? 1,
        limit: filtros.limit ?? 50,
        ...(filtros.accion     && { accion:     filtros.accion }),
        ...(filtros.entidad    && { entidad:    filtros.entidad }),
        ...(filtros.usuarioId  && { usuarioId:  filtros.usuarioId }),
        ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
        ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
      },
    })
    return data
  },

  async getAcciones(): Promise<string[]> {
    const { data } = await httpClient.get<string[]>('/auditoria/acciones')
    return data
  },
}
