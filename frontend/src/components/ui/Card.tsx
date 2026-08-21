import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg border bg-[#161b27] border-[rgba(255,255,255,.07)]', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col gap-1 border-b border-[rgba(255,255,255,.06)] px-5 py-4', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-[#f0f6fc]', className)} {...props} />
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-[#8b949e]', className)} {...props} />
  )
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex items-center border-t border-[rgba(255,255,255,.06)] px-5 py-3', className)}
      {...props}
    />
  )
}
