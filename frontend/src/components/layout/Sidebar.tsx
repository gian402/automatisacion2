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
      width: '220px',
      flexShrink: 0,
      height: '100vh',
      background: '#0d1117',
      borderRight: '1px solid rgba(255,255,255,.06)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        flexShrink: 0,
      }}>
        <div style={{
          width: '28px', height: '28px',
          borderRadius: '7px',
          background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '12px', fontWeight: 800, color: '#fff',
          boxShadow: '0 0 12px rgba(37,99,235,.4)',
          flexShrink: 0,
        }}>H</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f6fc', letterSpacing: '.04em' }}>
            HYTICON
          </div>
          <div style={{ fontSize: '10px', color: '#484f58', marginTop: '1px' }}>
            TI & Seguridad Electrónica
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <NavSection label="Principal" items={NAV_ITEMS} />
        {isAdmin() && (
          <NavSection label="Administración" items={ADMIN_NAV_ITEMS} />
        )}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,.06)',
        fontSize: '11px',
        color: '#2d3748',
      }}>
        Sistema de Cotizaciones v1.0
      </div>
    </aside>
  )
}

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        color: '#484f58',
        padding: '0 8px',
        marginBottom: '4px',
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
        'group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-all duration-100',
        isActive
          ? 'bg-[rgba(37,99,235,.15)] text-[#58a6ff] font-medium'
          : 'text-[#8b949e] hover:bg-[rgba(255,255,255,.05)] hover:text-[#c9d1d9]',
      )}
    >
      {({ isActive }) => (
        <>
          <Icon className={cn(
            'h-[15px] w-[15px] shrink-0 transition-colors',
            isActive ? 'text-[#58a6ff]' : 'text-[#484f58] group-hover:text-[#8b949e]'
          )} />
          <span style={{ fontSize: '13px' }}>{item.label}</span>
          {isActive && (
            <span style={{
              marginLeft: 'auto',
              width: '4px', height: '4px',
              borderRadius: '50%',
              background: '#2563eb',
              boxShadow: '0 0 6px rgba(37,99,235,.8)',
            }} />
          )}
        </>
      )}
    </NavLink>
  )
}
