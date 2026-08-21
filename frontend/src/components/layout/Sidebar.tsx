// ============================================================
// HYTICON — Sidebar
// Navegación lateral corporativa
// ============================================================

import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  BarChart2,
  ClipboardList,
  UserCog,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'
import { ROUTES } from '@/router/routes'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  requiredPermission?: string
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
    <aside className="flex h-full w-60 flex-col bg-[#0f172a]">
      {/* Logo Corporativo */}
      <div className="flex h-16 items-center gap-3 border-b border-[#1e293b] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] shadow-sm">
          <span className="text-sm font-black tracking-wider text-white">H</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider text-white leading-none">HYTICON</span>
          <span className="text-[10px] text-[#64748b] leading-tight mt-1 font-medium">TI & Seguridad Electrónica</span>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 px-2">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#475569]">
          Principal
        </p>
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.path} item={item} />
        ))}

        {/* Sección exclusiva de administrador */}
        {isAdmin() && (
          <>
            <div className="my-2 border-t border-[#1e293b]" />
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[#475569]">
              Administración
            </p>
            {ADMIN_NAV_ITEMS.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Versión */}
      <div className="border-t border-[#1e293b] px-5 py-3">
        <p className="text-[10px] text-[#334155]">Sistema de Cotizaciones v1.0</p>
      </div>
    </aside>
  )
}

// ── Link individual del sidebar ───────────────────────────────
function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-[#1e3a8a] text-white font-medium'
            : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-[#64748b] group-hover:text-white')} />
          <span className="flex-1">{item.label}</span>
          {isActive && <ChevronRight className="h-3 w-3 text-[#93c5fd]" />}
        </>
      )}
    </NavLink>
  )
}
