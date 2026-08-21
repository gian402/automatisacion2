// ============================================================
// HYTICON — Select
// Select nativo estilizado. Para selects complejos con búsqueda
// usar Combobox (se implementa cuando sea necesario).
// ============================================================

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-9 w-full appearance-none rounded-[6px] border border-[#e2e8f0] bg-white',
            'pl-3 pr-8 text-sm text-[#0f172a]',
            'focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 focus:border-[#2563eb]',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8fafc]',
            'transition-colors cursor-pointer',
            error && 'border-[#dc2626] focus:ring-[#dc2626]',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94a3b8]"
          aria-hidden
        />
      </div>
    )
  },
)

Select.displayName = 'Select'

export { Select }
