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
            'flex h-[32px] w-full appearance-none rounded-md border px-3 pr-8 text-[13px] text-[#c9d1d9]',
            'bg-[#0d1117] border-[rgba(255,255,255,.12)]',
            'focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',
            'disabled:cursor-not-allowed disabled:opacity-40',
            'transition-colors duration-150 cursor-pointer',
            '[color-scheme:dark]',
            error && 'border-[rgba(248,81,73,.5)]',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#484f58]"
          style={{ width: '12px', height: '12px' }}
          aria-hidden
        />
      </div>
    )
  },
)

Select.displayName = 'Select'
export { Select }
