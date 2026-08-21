// ============================================================
// HYTICON — Ruta pública
// Si el usuario ya está autenticado, lo redirige al dashboard
// ============================================================

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from './routes'
import { PageLoading } from '@/components/common/PageLoading'

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoading />
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
