// ============================================================
// HYTICON — Breadcrumb
// Navegación de migas de pan para páginas de detalle
// ============================================================

import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function Breadcrumb({ items, showHome = false, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Ruta de navegación" className={cn('mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[#94a3b8]">
        {showHome && (
          <>
            <li>
              <Link
                to="/"
                className="flex items-center gap-1 hover:text-[#475569] transition-colors"
                aria-label="Inicio"
              >
                <Home className="h-3 w-3" />
              </Link>
            </li>
            {items.length > 0 && (
              <li aria-hidden>
                <ChevronRight className="h-3 w-3" />
              </li>
            )}
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={index} className="flex items-center gap-1">
              {!isLast && item.href ? (
                <Link
                  to={item.href}
                  className="hover:text-[#475569] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'font-medium text-[#475569]' : ''}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3 w-3" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
