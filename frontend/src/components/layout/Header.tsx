import { LogOut, ChevronDown } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/hooks/useAuth'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth()

  return (
    <header style={{
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: '#0d1117',
      borderBottom: '1px solid rgba(255,255,255,.06)',
      flexShrink: 0,
    }}>
      {/* Título */}
      <span style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#f0f6fc',
        letterSpacing: '-.1px',
      }}>
        {title}
      </span>

      {/* Usuario */}
      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 10px 5px 5px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,.07)',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.05)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Avatar */}
              <div style={{
                width: '28px', height: '28px',
                borderRadius: '7px',
                background: 'rgba(37,99,235,.2)',
                border: '1px solid rgba(37,99,235,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: '#58a6ff',
                flexShrink: 0,
              }}>
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#c9d1d9' }}>
                  {user.nombre.split(' ')[0]}
                </div>
                <div style={{ fontSize: '10px', color: '#484f58', marginTop: '2px' }}>
                  {user.rol === 'ADMIN' ? 'Administrador' : 'Supervisor'}
                </div>
              </div>
              <ChevronDown style={{ width: '12px', height: '12px', color: '#484f58', marginLeft: '2px' }} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              style={{
                minWidth: '200px',
                background: '#161b27',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: '10px',
                boxShadow: '0 8px 24px rgba(0,0,0,.5)',
                padding: '4px',
                zIndex: 50,
              }}
            >
              {/* Info */}
              <div style={{
                padding: '10px 12px 8px',
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
                  padding: '7px 12px',
                  fontSize: '13px', color: '#f85149',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background .1s',
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
