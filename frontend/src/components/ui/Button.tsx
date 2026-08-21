import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium',
    'transition-all duration-150 focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[rgba(99,102,241,.5)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0e1a]',
    'disabled:pointer-events-none disabled:opacity-40 select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-[#6366f1] text-white text-[13px] font-semibold',
          'hover:bg-[#4f46e5] active:bg-[#4338ca] active:scale-[.98]',
          'shadow-[0_1px_0_rgba(0,0,0,.3),inset_0_1px_0_rgba(255,255,255,.1),0_4px_14px_rgba(99,102,241,.3)]',
          'hover:shadow-[0_4px_20px_rgba(99,102,241,.45)]',
        ].join(' '),

        secondary: [
          'bg-[rgba(99,102,241,.1)] text-[#818cf8] text-[13px]',
          'border border-[rgba(99,102,241,.25)]',
          'hover:bg-[rgba(99,102,241,.18)] hover:border-[rgba(99,102,241,.4)]',
          'active:scale-[.98]',
        ].join(' '),

        outline: [
          'border border-[rgba(255,255,255,.12)] bg-transparent text-[#9ca3af] text-[13px]',
          'hover:bg-[rgba(255,255,255,.06)] hover:text-[#e5e7eb] hover:border-[rgba(255,255,255,.2)]',
          'active:scale-[.98]',
        ].join(' '),

        ghost: [
          'text-[#6b7280] text-[13px]',
          'hover:bg-[rgba(255,255,255,.06)] hover:text-[#e5e7eb]',
        ].join(' '),

        danger: [
          'bg-[rgba(239,68,68,.1)] text-[#ef4444] text-[13px]',
          'border border-[rgba(239,68,68,.2)]',
          'hover:bg-[rgba(239,68,68,.18)] hover:border-[rgba(239,68,68,.35)]',
          'active:scale-[.98]',
        ].join(' '),

        link: [
          'text-[#818cf8] text-[13px]',
          'underline-offset-4 hover:underline hover:text-[#a5b4fc]',
        ].join(' '),
      },
      size: {
        sm:   'h-7 px-3 text-[12px] rounded',
        md:   'h-8 px-3.5',
        lg:   'h-9 px-5 text-sm',
        icon: 'h-8 w-8 p-0',
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
          <>
            <span
              style={{
                display: 'inline-block',
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                animation: 'spin .65s linear infinite',
                flexShrink: 0,
              }}
            />
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
