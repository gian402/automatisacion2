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
            'flex h-8 w-full appearance-none rounded-md border bg-[rgba(255,255,255,.04)]',
            'pl-3 pr-8 text-sm text-[#c9d1d9]',
            'border-[rgba(255,255,255,.08)]',
            'focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[rgba(37,99,235,.15)]',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-all duration-150 cursor-pointer',
            '[color-scheme:dark]',
            error && 'border-[rgba(248,81,73,.4)]',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#484f58]"
          aria-hidden
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
export { Select }
