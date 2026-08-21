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
          'flex h-[32px] w-full rounded-md border px-3 text-[13px] text-[#c9d1d9]',
          'bg-[#0d1117] border-[rgba(255,255,255,.12)] placeholder:text-[#484f58]',
          'focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'transition-colors duration-150',
          '[color-scheme:dark]',
          error && 'border-[rgba(248,81,73,.5)] focus:border-[#f85149] focus:ring-[#f85149]',
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
