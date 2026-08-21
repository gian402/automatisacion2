import { forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* ── Card ──────────────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, noPadding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[10px] border border-[rgba(255,255,255,.08)] bg-[#111827]',
        'shadow-[0_1px_4px_rgba(0,0,0,.4)]',
        !noPadding && 'p-5',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

/* ── CardHeader ────────────────────────────────────────────── */
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-1 border-b border-[rgba(255,255,255,.07)] px-5 py-4',
        className,
      )}
      {...props}
    />
  ),
)
CardHeader.displayName = 'CardHeader'

/* ── CardTitle ─────────────────────────────────────────────── */
const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-sm font-semibold leading-none text-[#f9fafb] tracking-tight',
        className,
      )}
      {...props}
    />
  ),
)
CardTitle.displayName = 'CardTitle'

/* ── CardDescription ───────────────────────────────────────── */
const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-xs text-[#6b7280]', className)}
      {...props}
    />
  ),
)
CardDescription.displayName = 'CardDescription'

/* ── CardContent ───────────────────────────────────────────── */
const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-5 py-4', className)}
      {...props}
    />
  ),
)
CardContent.displayName = 'CardContent'

/* ── CardFooter ────────────────────────────────────────────── */
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center border-t border-[rgba(255,255,255,.07)] px-5 py-3',
        className,
      )}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
