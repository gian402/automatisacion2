import { cn } from '@/lib/utils'

/* ── Skeleton ──────────────────────────────────────────────── */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('rounded-md', className)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(255,255,255,.06)',
        ...style,
      }}
      {...props}
    >
      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.07) 50%, transparent 100%)',
        animation: 'shimmer 1.6s ease-in-out infinite',
      }} />
    </div>
  )
}

/* ── SkeletonRow ───────────────────────────────────────────── */
export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <Skeleton style={{ height: '14px', width: '100%' }} />
        </td>
      ))}
    </tr>
  )
}

/* ── TableSkeleton ─────────────────────────────────────────── */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  )
}
