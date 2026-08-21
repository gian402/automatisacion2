// ============================================================
// HYTICON — Definición central de rutas
// ============================================================

export const ROUTES = {
  // Públicas
  LOGIN: '/login',

  // Privadas — raíz
  DASHBOARD: '/',

  // Clientes
  CLIENTES: '/clientes',
  CLIENTE_NUEVO: '/clientes/nuevo',
  CLIENTE_DETALLE: (id: string) => `/clientes/${id}`,
  CLIENTE_EDITAR: (id: string) => `/clientes/${id}/editar`,

  // Catálogo
  CATALOGO: '/catalogo',
  CATALOGO_NUEVO: '/catalogo/nuevo',
  CATALOGO_EDITAR: (id: string) => `/catalogo/${id}/editar`,

  // Cotizaciones
  COTIZACIONES: '/cotizaciones',
  COTIZACION_NUEVA: '/cotizaciones/nueva',
  COTIZACION_DETALLE: (id: string) => `/cotizaciones/${id}`,
  COTIZACION_EDITAR: (id: string) => `/cotizaciones/${id}/editar`,

  // Reportes
  REPORTES: '/reportes',

  // Auditoría
  AUDITORIA: '/auditoria',

  // Usuarios (solo ADMIN)
  USUARIOS: '/usuarios',
  USUARIO_NUEVO: '/usuarios/nuevo',
  USUARIO_EDITAR: (id: string) => `/usuarios/${id}/editar`,

  // Error
  NOT_FOUND: '/404',
} as const
