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
          'flex h-9 w-full rounded-md border px-3 text-[13px] text-[#e5e7eb]',
          'bg-[#0a0e1a] border-[rgba(255,255,255,.12)] placeholder:text-[#4b5563]',
          'focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[rgba(99,102,241,.2)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-[border-color,box-shadow] duration-150',
          '[color-scheme:dark]',
          error && 'border-[rgba(239,68,68,.5)] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,.2)]',
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
