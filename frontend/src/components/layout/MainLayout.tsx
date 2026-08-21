import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

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
  const firstSegment = location.pathname.split('/').filter(Boolean)[0]
  const basePath = firstSegment ? `/${firstSegment}` : '/'
  const title = PAGE_TITLES[basePath] ?? 'Dashboard'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0d1117' }}>
      <Sidebar />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
        <Header title={title} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 36px',
          background: '#0d1117',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
