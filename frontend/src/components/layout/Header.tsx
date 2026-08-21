import { LogOut, ChevronDown, Bell } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  title?: string
}

export function Header({ title: _title }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header style={{
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      background: '#0d1117',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      flexShrink: 0,
      gap: '8px',
    }}>

      {/* Usuario */}
      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,.07)',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background .15s',
              outline: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: '26px', height: '26px',
                borderRadius: '6px',
                background: 'rgba(37,99,235,.25)',
                border: '1px solid rgba(37,99,235,.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#58a6ff',
                flexShrink: 0,
              }}>
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#c9d1d9', whiteSpace: 'nowrap' }}>
                  {user.nombre.split(' ').slice(0, 2).join(' ')}
                </div>
                <div style={{ fontSize: '10px', color: '#484f58', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {user.rol === 'ADMIN' ? 'Administrador' : 'Supervisor'}
                </div>
              </div>
              <ChevronDown style={{ width: '11px', height: '11px', color: '#484f58' }} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              style={{
                minWidth: '210px',
                background: '#161b27',
                border: '1px solid rgba(255,255,255,.09)',
                borderRadius: '10px',
                boxShadow: '0 16px 40px rgba(0,0,0,.6)',
                padding: '4px',
                zIndex: 50,
              }}
            >
              <div style={{
                padding: '10px 12px 9px',
                borderBottom: '1px solid rgba(255,255,255,.06)',
                marginBottom: '4px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f6fc' }}>{user.nombre}</div>
                <div style={{ fontSize: '11px', color: '#484f58', marginTop: '2px' }}>{user.email}</div>
              </div>

              <DropdownMenu.Item
                onSelect={logout}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 10px',
                  fontSize: '13px', color: '#f85149',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(248,81,73,.1)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                <LogOut style={{ width: '13px', height: '13px' }} />
                Cerrar sesión
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </header>
  )
}
