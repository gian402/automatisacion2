import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0d1117] disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[#2563eb] text-white text-[13px] hover:bg-[#1d4ed8] active:scale-[.98] shadow-[0_1px_0_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.08)]',
        secondary:
          'bg-[rgba(255,255,255,.06)] text-[#c9d1d9] text-[13px] border border-[rgba(255,255,255,.1)] hover:bg-[rgba(255,255,255,.1)] hover:border-[rgba(255,255,255,.16)] active:scale-[.98]',
        outline:
          'border border-[rgba(255,255,255,.1)] bg-transparent text-[#8b949e] text-[13px] hover:bg-[rgba(255,255,255,.06)] hover:text-[#c9d1d9] active:scale-[.98]',
        ghost:
          'text-[#656d76] text-[13px] hover:bg-[rgba(255,255,255,.06)] hover:text-[#c9d1d9]',
        danger:
          'bg-[rgba(248,81,73,.12)] text-[#f85149] text-[13px] border border-[rgba(248,81,73,.2)] hover:bg-[rgba(248,81,73,.2)] active:scale-[.98]',
        link:
          'text-[#58a6ff] text-[13px] underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-7 px-3 text-[12px] rounded',
        md:   'h-[32px] px-3.5',
        lg:   'h-9 px-5 text-sm',
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
        {loading
          ? <><span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />{children}</>
          : children}
      </Comp>
    )
  },
)

Button.displayName = 'Button'
export { Button, buttonVariants }
