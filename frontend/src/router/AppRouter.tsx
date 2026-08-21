// ============================================================
// HYTICON — Router principal
// ============================================================

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { ROUTES } from './routes'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageLoading } from '@/components/common/PageLoading'

// ── Lazy loading de páginas ──────────────────────────────────
const LoginPage         = lazy(() => import('@/pages/auth/LoginPage'))
const DashboardPage     = lazy(() => import('@/pages/dashboard/DashboardPage'))
const ClientesPage      = lazy(() => import('@/pages/clientes/ClientesPage'))
const CatalogoPage      = lazy(() => import('@/pages/catalogo/CatalogoPage'))
const CotizacionesPage  = lazy(() => import('@/pages/cotizaciones/CotizacionesPage'))
const NuevaCotizacionPage   = lazy(() => import('@/pages/cotizaciones/NuevaCotizacionPage'))
const DetalleCotizacionPage = lazy(() => import('@/pages/cotizaciones/DetalleCotizacionPage'))
const ReportesPage      = lazy(() => import('@/pages/reportes/ReportesPage'))
const AuditoriaPage     = lazy(() => import('@/pages/auditoria/AuditoriaPage'))
const UsuariosPage      = lazy(() => import('@/pages/usuarios/UsuariosPage'))
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <SuspenseWrapper>
        <Routes>
          {/* ── Rutas públicas ── */}
          <Route element={<PublicRoute />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          {/* ── Rutas privadas — acceso a todos los roles autenticados ── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path={ROUTES.DASHBOARD}      element={<DashboardPage />} />
              <Route path={ROUTES.CLIENTES}        element={<ClientesPage />} />
              <Route path={ROUTES.CATALOGO}        element={<CatalogoPage />} />
              <Route path={ROUTES.COTIZACIONES}    element={<CotizacionesPage />} />
              <Route path={ROUTES.COTIZACION_NUEVA}    element={<NuevaCotizacionPage />} />
              <Route path={ROUTES.COTIZACION_DETALLE(':id')} element={<DetalleCotizacionPage />} />
              <Route path={ROUTES.REPORTES}        element={<ReportesPage />} />
              <Route path={ROUTES.AUDITORIA}       element={<AuditoriaPage />} />

              {/* ── Solo ADMIN ── */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path={ROUTES.USUARIOS} element={<UsuariosPage />} />
              </Route>
            </Route>
          </Route>

          {/* ── 404 ── */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </SuspenseWrapper>
    </BrowserRouter>
  )
}
