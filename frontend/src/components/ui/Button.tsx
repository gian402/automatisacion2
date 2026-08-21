// ============================================================
// HYTICON — Button
// Componente base con variantes corporativas
// ============================================================

import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af]',
        secondary: 'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] active:bg-[#cbd5e1]',
        outline:   'border border-[#e2e8f0] bg-white text-[#0f172a] hover:bg-[#f8fafc]',
        ghost:     'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
        danger:    'bg-[#dc2626] text-white hover:bg-[#b91c1c] active:bg-[#991b1b]',
        link:      'text-[#2563eb] underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-7 px-3 text-xs',
        md:   'h-9 px-4',
        lg:   'h-10 px-5 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
