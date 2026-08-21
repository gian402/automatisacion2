import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-8 w-full rounded-md border bg-[rgba(255,255,255,.04)] px-3 text-sm text-[#c9d1d9]',
          'border-[rgba(255,255,255,.08)] placeholder:text-[#484f58]',
          'focus:outline-none focus:border-[#2563eb] focus:bg-[rgba(37,99,235,.05)] focus:ring-2 focus:ring-[rgba(37,99,235,.15)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-all duration-150',
          error && 'border-[rgba(248,81,73,.4)] focus:border-[#f85149] focus:ring-[rgba(248,81,73,.15)]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
export { Input }
