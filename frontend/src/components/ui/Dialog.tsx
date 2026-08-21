import { forwardRef, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

/* ── Overlay ───────────────────────────────────────────────── */
const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50',
      'bg-[rgba(0,0,0,.7)] backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/* ── Content ───────────────────────────────────────────────── */
interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideClose?: boolean
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, size = 'md', hideClose = false, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
        'rounded-xl border border-[rgba(255,255,255,.1)] bg-[#111827]',
        'shadow-[0_32px_80px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.05)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        'focus:outline-none mx-4',
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogClose
          className={cn(
            'absolute right-4 top-4 rounded-md p-1.5',
            'text-[#4b5563] hover:text-[#e5e7eb]',
            'hover:bg-[rgba(255,255,255,.07)]',
            'focus:outline-none focus:ring-2 focus:ring-[rgba(99,102,241,.4)]',
            'transition-all duration-150',
          )}
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </DialogClose>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

/* ── DialogHeader ──────────────────────────────────────────── */
function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b border-[rgba(255,255,255,.08)] px-6 py-4', className)}
      {...props}
    />
  )
}

/* ── DialogTitle ───────────────────────────────────────────── */
const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-[14px] font-semibold text-[#f9fafb] pr-6 leading-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/* ── DialogDescription ─────────────────────────────────────── */
const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('mt-1 text-[13px] text-[#6b7280]', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

/* ── DialogBody ────────────────────────────────────────────── */
function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-5', className)} {...props} />
}

/* ── DialogFooter ──────────────────────────────────────────── */
function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2',
        'border-t border-[rgba(255,255,255,.08)] px-6 py-4',
        className,
      )}
      {...props}
    />
  )
}

/* ── ConfirmDialog ─────────────────────────────────────────── */
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  isLoading?: boolean
  onConfirm: () => void
  children?: ReactNode
}

export function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <DialogBody>{children}</DialogBody>}

        <DialogFooter>
          {/* Cancel */}
          <DialogClose asChild>
            <button
              disabled={isLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '32px',
                padding: '0 14px',
                borderRadius: '7px',
                border: '1px solid rgba(255,255,255,.1)',
                background: 'transparent',
                color: '#9ca3af',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'
                ;(e.currentTarget as HTMLElement).style.color = '#e5e7eb'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent'
                ;(e.currentTarget as HTMLElement).style.color = '#9ca3af'
              }}
            >
              {cancelLabel}
            </button>
          </DialogClose>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              borderRadius: '7px',
              border: variant === 'danger'
                ? '1px solid rgba(239,68,68,.3)'
                : '1px solid rgba(99,102,241,.4)',
              background: variant === 'danger'
                ? 'rgba(239,68,68,.12)'
                : '#6366f1',
              color: variant === 'danger' ? '#f87171' : '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: isLoading ? 0.5 : 1,
              pointerEvents: isLoading ? 'none' : 'auto',
              transition: 'background .15s, box-shadow .15s',
              boxShadow: variant === 'danger'
                ? 'none'
                : '0 4px 14px rgba(99,102,241,.35)',
            }}
            onMouseEnter={e => {
              if (variant !== 'danger') {
                (e.currentTarget as HTMLElement).style.background = '#4f46e5'
              } else {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.2)'
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = variant === 'danger'
                ? 'rgba(239,68,68,.12)'
                : '#6366f1'
            }}
          >
            {isLoading && (
              <span style={{
                display: 'inline-block',
                width: '13px',
                height: '13px',
                border: '2px solid currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin .65s linear infinite',
              }} />
            )}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
}
