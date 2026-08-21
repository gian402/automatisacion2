import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, FileText,
  BarChart2, ClipboardList, UserCog, X,
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { ROUTES } from '@/router/routes'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin } = usePermissions()
  const location = useLocation()

  // Close drawer on route change
  useEffect(() => {
    onClose()
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      <style>{`
        /* Desktop: sidebar always visible, no overlay */
        @media (min-width: 768px) {
          .sidebar-panel {
            transform: translateX(0) !important;
            position: fixed !important;
          }
          .sidebar-overlay {
            display: none !important;
          }
          .sidebar-close-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile overlay backdrop */}
      <div
        className="sidebar-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity .25s ease',
        }}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className="sidebar-panel"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          width: '240px',
          height: '100vh',
          background: '#0d1221',
          borderRight: '1px solid rgba(255,255,255,.07)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Logo header */}
        <div style={{
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 14px 0 16px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          flexShrink: 0,
        }}>
          {/* H icon */}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 800,
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(99,102,241,.45)',
            userSelect: 'none',
          }}>H</div>

          {/* Brand text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#f9fafb',
              letterSpacing: '.02em',
            }}>HYTICON</div>
            <div style={{
              fontSize: '10px',
              color: '#374151',
              marginTop: '1px',
            }}>TI & Seguridad</div>
          </div>

          {/* Mobile close button */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '5px',
              border: 'none',
              background: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'
              ;(e.currentTarget as HTMLElement).style.color = '#e5e7eb'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = '#6b7280'
            }}
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 8px',
        }}>
          <NavSection label="Principal" items={NAV_ITEMS} />
          {isAdmin() && (
            <NavSection label="Administración" items={ADMIN_NAV_ITEMS} />
          )}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '10px 16px 12px',
          borderTop: '1px solid rgba(255,255,255,.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 6px rgba(16,185,129,.5)',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: '10px',
            color: '#374151',
            letterSpacing: '.02em',
          }}>v1.0 · Sistema activo</span>
        </div>
      </aside>
    </>
  )
}

/* ── NavSection ────────────────────────────────────────────── */
function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: '#374151',
        padding: '0 10px',
        marginBottom: '4px',
      }}>
        {label}
      </div>
      {items.map(item => (
        <SidebarLink key={item.path} item={item} />
      ))}
    </div>
  )
}

/* ── SidebarLink ───────────────────────────────────────────── */
function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {({ isActive }) => (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '7px',
            padding: '8px 10px',
            marginBottom: '1px',
            background: isActive ? 'rgba(99,102,241,.12)' : 'transparent',
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
            }
          }}
        >
          {/* Active indicator bar */}
          {isActive && (
            <span style={{
              position: 'absolute',
              left: 0,
              top: '18%',
              bottom: '18%',
              width: '2.5px',
              borderRadius: '0 3px 3px 0',
              background: '#6366f1',
              boxShadow: '0 0 8px rgba(99,102,241,.6)',
            }} />
          )}

          {/* Icon */}
          <Icon style={{
            width: '15px',
            height: '15px',
            flexShrink: 0,
            color: isActive ? '#818cf8' : '#6b7280',
            transition: 'color .15s',
          }} />

          {/* Label */}
          <span style={{
            fontSize: '13px',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? '#f9fafb' : '#6b7280',
            transition: 'color .15s',
          }}>
            {item.label}
          </span>
        </div>
      )}
    </NavLink>
  )
}
