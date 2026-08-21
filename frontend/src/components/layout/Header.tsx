import { LogOut, ChevronDown, Menu } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title: _title }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header style={{
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#0a0e1a',
      borderBottom: '1px solid rgba(255,255,255,.07)',
      flexShrink: 0,
      gap: '8px',
    }}>
      {/* Hamburger — mobile only */}
      <HamburgerButton onClick={onMenuClick} />

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        {user && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 8px 5px 5px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,.08)',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'background .15s, border-color .15s',
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.05)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.12)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.08)'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: 'rgba(99,102,241,.2)',
                  border: '1px solid rgba(99,102,241,.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#818cf8',
                  flexShrink: 0,
                }}>
                  {user.nombre.charAt(0).toUpperCase()}
                </div>

                {/* Name + role */}
                <div style={{ textAlign: 'left', lineHeight: 1 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#e5e7eb',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.nombre.split(' ').slice(0, 2).join(' ')}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#4b5563',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                  }}>
                    {user.rol === 'ADMIN' ? 'Administrador' : 'Supervisor'}
                  </div>
                </div>

                <ChevronDown style={{ width: '11px', height: '11px', color: '#4b5563' }} />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                style={{
                  minWidth: '220px',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 50px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.05)',
                  padding: '4px',
                  zIndex: 100,
                  animation: 'slideDown .18s ease both',
                }}
              >
                {/* User info */}
                <div style={{
                  padding: '10px 12px 10px',
                  borderBottom: '1px solid rgba(255,255,255,.07)',
                  marginBottom: '4px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,.3) 0%, rgba(79,70,229,.2) 100%)',
                      border: '1px solid rgba(99,102,241,.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#818cf8',
                      flexShrink: 0,
                    }}>
                      {user.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>
                        {user.nombre}
                      </div>
                      <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '1px' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '99px',
                    background: 'rgba(99,102,241,.12)',
                    border: '1px solid rgba(99,102,241,.2)',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#818cf8',
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                  }}>
                    {user.rol === 'ADMIN' ? 'Administrador' : 'Supervisor'}
                  </div>
                </div>

                {/* Logout */}
                <DropdownMenu.Item
                  onSelect={logout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    color: '#ef4444',
                    borderRadius: '7px',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.1)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <LogOut style={{ width: '13px', height: '13px' }} />
                  Cerrar sesión
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  )
}

/** Hamburger button — hidden on desktop via media query */
function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <>
      <style>{`
        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,.08);
          background: transparent;
          color: #9ca3af;
          cursor: pointer;
          transition: background .15s, color .15s;
        }
        .hamburger-btn:hover {
          background: rgba(255,255,255,.06);
          color: #e5e7eb;
        }
        @media (min-width: 768px) {
          .hamburger-btn {
            display: none;
          }
        }
      `}</style>
      <button
        className="hamburger-btn"
        onClick={onClick}
        aria-label="Abrir menú"
      >
        <Menu style={{ width: '18px', height: '18px' }} />
      </button>
    </>
  )
}
