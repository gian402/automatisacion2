import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, FileText,
  BarChart2, ClipboardList, UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'
import { ROUTES } from '@/router/routes'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',    path: ROUTES.DASHBOARD,    icon: LayoutDashboard },
  { label: 'Cotizaciones', path: ROUTES.COTIZACIONES, icon: FileText },
  { label: 'Clientes',     path: ROUTES.CLIENTES,     icon: Users },
  { label: 'Catálogo',     path: ROUTES.CATALOGO,     icon: Package },
  { label: 'Reportes',     path: ROUTES.REPORTES,     icon: BarChart2 },
  { label: 'Auditoría',    path: ROUTES.AUDITORIA,    icon: ClipboardList },
]

const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Usuarios', path: ROUTES.USUARIOS, icon: UserCog },
]

export function Sidebar() {
  const { isAdmin } = usePermissions()

  return (
    <aside style={{
      width: '200px',
      flexShrink: 0,
      height: '100vh',
      background: '#0d1117',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Logo */}
      <div style={{
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '0 14px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '26px', height: '26px',
          borderRadius: '6px',
          background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 800, color: '#fff',
          flexShrink: 0,
          boxShadow: '0 0 10px rgba(37,99,235,.35)',
        }}>H</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f6fc', letterSpacing: '.02em' }}>
            HYTICON
          </div>
          <div style={{ fontSize: '10px', color: '#484f58', marginTop: '1px', letterSpacing: '.01em' }}>
            TI & Seguridad
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 6px' }}>
        <NavSection label="Principal" items={NAV_ITEMS} />
        {isAdmin() && (
          <NavSection label="Administración" items={ADMIN_NAV_ITEMS} />
        )}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '10px 14px',
        borderTop: '1px solid rgba(255,255,255,.04)',
        fontSize: '10px',
        color: '#2d3748',
        letterSpacing: '.01em',
      }}>
        v1.0
      </div>
    </aside>
  )
}

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#2d3748',
        padding: '0 8px',
        marginBottom: '3px',
      }}>{label}</div>
      {items.map(item => <SidebarLink key={item.path} item={item} />)}
    </div>
  )
}

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) => cn(
        'group relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] transition-all duration-100',
        isActive
          ? 'text-[#e6edf3] font-medium bg-[rgba(255,255,255,.06)]'
          : 'text-[#656d76] hover:bg-[rgba(255,255,255,.04)] hover:text-[#c9d1d9]',
      )}
    >
      {({ isActive }) => (
        <>
          {/* Barra activa izquierda */}
          {isActive && (
            <span style={{
              position: 'absolute',
              left: 0, top: '20%', bottom: '20%',
              width: '2px',
              borderRadius: '0 2px 2px 0',
              background: '#2563eb',
            }} />
          )}
          <Icon style={{
            width: '14px', height: '14px', flexShrink: 0,
            color: isActive ? '#58a6ff' : 'currentColor',
            transition: 'color .1s',
          }} />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}
