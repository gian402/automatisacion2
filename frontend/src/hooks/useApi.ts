// ============================================================
// HYTICON — useApi
// Wrapper sobre TanStack Query con manejo de errores HTTP
// estandarizado y notificaciones automáticas via sonner
// ============================================================

import { useCallback } from 'react'
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type QueryKey,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import type { ApiError } from '@/types'

// ── Extraer mensaje legible de un error HTTP ──────────────────
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message
    }
    const status = error.response?.status
    if (status === 401) return 'Sesión expirada. Inicia sesión de nuevo.'
    if (status === 403) return 'No tienes permisos para esta acción.'
    if (status === 404) return 'El recurso solicitado no existe.'
    if (status === 409) return 'Ya existe un registro con esos datos.'
    if (status === 422) return 'Los datos enviados no son válidos.'
    if (status !== undefined && status >= 500) return 'Error del servidor. Intenta de nuevo.'
  }
  if (error instanceof Error) return error.message
  return 'Ocurrió un error inesperado.'
}

// ── Hook de query ────────────────────────────────────────────
export function useApiQuery<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useQuery<TQueryFnData, TError, TData, TQueryKey>(options)
}

// ── Hook de mutación con toast automático ─────────────────────
interface UseApiMutationOptions<TData, TError, TVariables, TContext>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'onSuccess' | 'onError'> {
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
  onSuccess?: (data: TData) => void
  onError?: (error: TError) => void
}

export function useApiMutation<
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>(options: UseApiMutationOptions<TData, TError, TVariables, TContext>) {
  const {
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
    onSuccess,
    onError,
    ...rest
  } = options

  return useMutation<TData, TError, TVariables, TContext>({
    ...rest,
    onSuccess: (data) => {
      if (showSuccessToast && successMessage) {
        toast.success(successMessage)
      }
      onSuccess?.(data)
    },
    onError: (error) => {
      if (showErrorToast) {
        const msg = errorMessage ?? getApiErrorMessage(error)
        toast.error(msg)
      }
      onError?.(error)
    },
  })
}

// ── Helper para usar en callbacks manuales ──────────────────
export function useApiErrorHandler() {
  const handleError = useCallback((error: unknown, fallback?: string) => {
    const msg = fallback ?? getApiErrorMessage(error)
    toast.error(msg)
  }, [])

  return { handleError }
}
