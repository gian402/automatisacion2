// ============================================================
// HYTICON — FormField
// Wrapper para Label + campo + mensaje de error.
// Compatible con React Hook Form via Controller o register.
// ============================================================

import type { ReactNode } from 'react'
import { Label } from './Label'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  /** ID del input asociado */
  id?: string
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}

      {children}

      {/* Hint (descripción opcional) */}
      {hint && !error && (
        <p className="text-xs text-[#94a3b8]">{hint}</p>
      )}

      {/* Error */}
      <ErrorMessage message={error} />
    </div>
  )
}
