import type { ReactNode } from 'react'
import { Label } from './Label'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id?: string
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({
  id, label, required, error, hint, children, className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[#4b5563] leading-relaxed">{hint}</p>
      )}
      <ErrorMessage message={error} />
    </div>
  )
}
