import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1117] disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary:   'bg-[#2563eb] text-white hover:bg-[#1d4ed8] active:bg-[#1e40af] shadow-[0_4px_16px_rgba(37,99,235,.3)]',
        secondary: 'bg-[rgba(255,255,255,.06)] text-[#c9d1d9] border border-[rgba(255,255,255,.08)] hover:bg-[rgba(255,255,255,.1)] hover:border-[rgba(255,255,255,.14)]',
        outline:   'border border-[rgba(255,255,255,.08)] bg-transparent text-[#8b949e] hover:bg-[rgba(255,255,255,.05)] hover:text-[#c9d1d9]',
        ghost:     'text-[#8b949e] hover:bg-[rgba(255,255,255,.05)] hover:text-[#c9d1d9]',
        danger:    'bg-[rgba(248,81,73,.15)] text-[#f85149] border border-[rgba(248,81,73,.2)] hover:bg-[rgba(248,81,73,.25)]',
        link:      'text-[#58a6ff] underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-7 px-3 text-xs rounded',
        md:   'h-8 px-4',
        lg:   'h-9 px-5',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
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
          <><span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />{children}</>
        ) : children}
      </Comp>
    )
  },
)

Button.displayName = 'Button'
export { Button, buttonVariants }
