// ============================================================
// HYTICON — Textarea
// ============================================================

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-2 text-sm',
          'placeholder:text-[#94a3b8] text-[#0f172a]',
          'focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-0 focus:border-[#2563eb]',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f8fafc]',
          'resize-y transition-colors',
          error && 'border-[#dc2626] focus:ring-[#dc2626]',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
