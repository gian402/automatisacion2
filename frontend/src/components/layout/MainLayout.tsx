// ============================================================
// HYTICON — MainLayout
// Estructura principal: sidebar fijo + header + contenido
// ============================================================

import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

// Mapa de rutas a títulos de página
const PAGE_TITLES: Record<string, string> = {
  '/':             'Dashboard',
  '/cotizaciones': 'Cotizaciones',
  '/clientes':     'Clientes',
  '/catalogo':     'Catálogo',
  '/reportes':     'Reportes',
  '/auditoria':    'Auditoría',
  '/usuarios':     'Usuarios',
}

export function MainLayout() {
  const location = useLocation()
  const currentPath = location.pathname
  // Normaliza /clientes/nuevo → /clientes
  const firstSegment = currentPath.split('/').filter(Boolean)[0]
  const basePath = firstSegment ? `/${firstSegment}` : '/'
  const title = PAGE_TITLES[basePath] ?? 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Contenido principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
