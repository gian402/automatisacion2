// ============================================================
// HYTICON — Input
// ============================================================

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
          'flex h-9 w-full rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-1 text-sm',
          'placeholder:text-[#94a3b8] text-[#0f172a]',
          'focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 focus:border-[#2563eb]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8fafc]',
          'transition-colors',
          error && 'border-[#dc2626] focus:ring-[#dc2626]',
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
