import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-[13px] text-[#e5e7eb]',
          'bg-[#0a0e1a] border-[rgba(255,255,255,.12)] placeholder:text-[#4b5563]',
          'focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[rgba(99,102,241,.2)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'resize-y transition-[border-color,box-shadow] duration-150',
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

Textarea.displayName = 'Textarea'
export { Textarea }
