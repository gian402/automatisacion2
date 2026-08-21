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
          'flex min-h-[80px] w-full rounded-md border bg-[rgba(255,255,255,.04)] px-3 py-2 text-sm text-[#c9d1d9]',
          'border-[rgba(255,255,255,.08)] placeholder:text-[#484f58]',
          'focus:outline-none focus:border-[#2563eb] focus:bg-[rgba(37,99,235,.05)] focus:ring-2 focus:ring-[rgba(37,99,235,.15)]',
          'disabled:cursor-not-allowed disabled:opacity-40',
          'resize-y transition-all duration-150',
          error && 'border-[rgba(248,81,73,.4)] focus:border-[#f85149] focus:ring-[rgba(248,81,73,.15)]',
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
