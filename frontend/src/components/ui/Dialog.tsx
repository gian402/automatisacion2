import { forwardRef, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-[3px]',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideClose?: boolean
}

const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, size = 'md', hideClose = false, children, ...props }, ref) => {
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border border-[rgba(255,255,255,.09)] bg-[#161b27] shadow-[0_24px_48px_rgba(0,0,0,.6)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-1/2',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-1/2',
          'focus:outline-none mx-4',
          sizeClass,
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogClose
            className={cn(
              'absolute right-4 top-4 rounded-md p-1.5 text-[#484f58]',
              'hover:bg-[rgba(255,255,255,.07)] hover:text-[#c9d1d9]',
              'focus:outline-none focus:ring-2 focus:ring-[#2563eb]',
              'transition-colors',
            )}
            aria-label="Cerrar"
          >
            <X className="h-3.5 w-3.5" />
          </DialogClose>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-[rgba(255,255,255,.06)] px-6 py-4', className)} {...props} />
  )
}

const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold text-[#f0f6fc] pr-6', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('mt-1 text-sm text-[#8b949e]', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-6 py-4', className)} {...props} />
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 border-t border-[rgba(255,255,255,.06)] px-6 py-4', className)}
      {...props}
    />
  )
}

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
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  variant = 'primary', isLoading = false, onConfirm, children,
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
          <DialogClose asChild>
            <button
              className="inline-flex h-8 items-center justify-center rounded-md border border-[rgba(255,255,255,.08)] bg-transparent px-4 text-sm font-medium text-[#8b949e] hover:bg-[rgba(255,255,255,.05)] hover:text-[#c9d1d9] transition-colors"
              disabled={isLoading}
            >
              {cancelLabel}
            </button>
          </DialogClose>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'inline-flex h-8 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-white transition-colors',
              'disabled:opacity-50 disabled:pointer-events-none',
              variant === 'danger'
                ? 'bg-[rgba(248,81,73,.15)] text-[#f85149] border border-[rgba(248,81,73,.25)] hover:bg-[rgba(248,81,73,.25)]'
                : 'bg-[#2563eb] hover:bg-[#1d4ed8] shadow-[0_4px_16px_rgba(37,99,235,.3)]',
            )}
          >
            {isLoading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog, DialogTrigger, DialogClose, DialogPortal, DialogOverlay,
  DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter,
}
