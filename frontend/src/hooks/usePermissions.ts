// ============================================================
// HYTICON — Hook de permisos
// Verifica qué puede hacer el usuario según su rol
// ============================================================

import { useAuth } from './useAuth'
import type { Rol } from '@/types'

// ── Matriz de permisos ────────────────────────────────────────
// Define qué acciones puede ejecutar cada rol.
// El backend siempre es la fuente de verdad; esto es solo UI.

type Permiso =
  // Usuarios
  | 'usuarios.ver'
  | 'usuarios.crear'
  | 'usuarios.editar'
  | 'usuarios.activar'
  // Clientes
  | 'clientes.ver'
  | 'clientes.crear'
  | 'clientes.editar'
  | 'clientes.activar'
  // Catálogo
  | 'catalogo.ver'
  | 'catalogo.crear'
  | 'catalogo.editar'
  | 'catalogo.activar'
  // Cotizaciones
  | 'cotizaciones.ver'
  | 'cotizaciones.crear'
  | 'cotizaciones.editar'
  | 'cotizaciones.cambiarEstado'
  | 'cotizaciones.eliminar'
  | 'cotizaciones.generarPdf'
  | 'cotizaciones.enviar'
  // Reportes
  | 'reportes.ver'
  // Auditoría
  | 'auditoria.ver'
  | 'auditoria.verTodo'

const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  ADMIN: [
    // Acceso completo
    'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.activar',
    'clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.activar',
    'catalogo.ver', 'catalogo.crear', 'catalogo.editar', 'catalogo.activar',
    'cotizaciones.ver', 'cotizaciones.crear', 'cotizaciones.editar',
    'cotizaciones.cambiarEstado', 'cotizaciones.eliminar',
    'cotizaciones.generarPdf', 'cotizaciones.enviar',
    'reportes.ver',
    'auditoria.ver', 'auditoria.verTodo',
  ],
  SUPERVISOR: [
    // Acceso operativo
    'clientes.ver', 'clientes.crear', 'clientes.editar',
    'catalogo.ver',
    'cotizaciones.ver', 'cotizaciones.crear', 'cotizaciones.editar',
    'cotizaciones.cambiarEstado', 'cotizaciones.generarPdf', 'cotizaciones.enviar',
    'auditoria.ver', // solo sus propias cotizaciones
  ],
}

export function usePermissions() {
  const { user } = useAuth()

  const can = (permiso: Permiso): boolean => {
    if (!user) return false
    return PERMISOS_POR_ROL[user.rol]?.includes(permiso) ?? false
  }

  const isAdmin = (): boolean => user?.rol === 'ADMIN'
  const isSupervisor = (): boolean => user?.rol === 'SUPERVISOR'

  return { can, isAdmin, isSupervisor }
}
