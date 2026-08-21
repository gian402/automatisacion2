import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            'flex h-9 w-full appearance-none rounded-md border px-3 pr-8 text-[13px] text-[#e5e7eb]',
            'bg-[#0a0e1a] border-[rgba(255,255,255,.12)]',
            'focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[rgba(99,102,241,.2)]',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-[border-color,box-shadow] duration-150 cursor-pointer',
            '[color-scheme:dark]',
            error && 'border-[rgba(239,68,68,.5)] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,.2)]',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4b5563]"
          style={{ width: '13px', height: '13px' }}
          aria-hidden
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
export { Select }
