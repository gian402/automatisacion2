// ============================================================
// HYTICON — Componente de ruta protegida
// Redirige al login si no hay sesión.
// Redirige a 403 si el rol no tiene acceso.
// ============================================================

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from './routes'
import type { Rol } from '@/types'
import { PageLoading } from '@/components/common/PageLoading'

interface ProtectedRouteProps {
  /** Si se especifica, solo esos roles pueden acceder */
  allowedRoles?: Rol[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // Mientras verifica la sesión (refresh en curso), muestra loading
  if (isLoading) {
    return <PageLoading />
  }

  // Sin sesión → redirige al login guardando el destino original
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Verifica si el rol tiene permiso para esta sección
  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
