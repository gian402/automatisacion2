// ============================================================
// HYTICON — Header
// Barra superior con título de página, usuario y logout
// ============================================================

import { LogOut, ChevronDown, User } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#e2e8f0] bg-white px-6">
      {/* Título de la sección */}
      <div>
        {title && (
          <h1 className="text-sm font-semibold text-[#0f172a]">{title}</h1>
        )}
      </div>

      {/* Info del usuario */}
      {user && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-sm transition-colors hover:bg-[#f1f5f9] focus:outline-none">
              {/* Avatar */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dbeafe] text-[#1e40af]">
                <span className="text-xs font-semibold">
                  {user.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Nombre */}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-[#0f172a] leading-none">{user.nombre}</p>
                <p className="text-[10px] text-[#94a3b8] leading-none mt-0.5">
                  {user.rol === 'ADMIN' ? 'Administrador' : 'Supervisor'}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8]" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className={cn(
                'z-50 min-w-[180px] overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-md',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              )}
            >
              {/* Info del usuario en menú */}
              <div className="border-b border-[#e2e8f0] px-3 py-2.5">
                <p className="text-xs font-medium text-[#0f172a]">{user.nombre}</p>
                <p className="text-xs text-[#94a3b8]">{user.email}</p>
              </div>

              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a] focus:outline-none"
              >
                <User className="h-3.5 w-3.5" />
                Mi perfil
              </DropdownMenu.Item>

              <div className="border-t border-[#e2e8f0]" />

              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs text-[#dc2626] hover:bg-[#fee2e2] focus:outline-none"
                onSelect={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Cerrar sesión
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </header>
  )
}
