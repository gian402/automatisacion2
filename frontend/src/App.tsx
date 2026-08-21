// ============================================================
// HYTICON — App root
// Proveedores globales: QueryClient, AuthContext, Toaster
// ============================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppRouter } from '@/router/AppRouter'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

// ── Configuración global de TanStack Query ────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reintentar 1 vez en caso de error (por defecto son 3)
      retry: 1,
      // Refetch automático al volver a la ventana
      refetchOnWindowFocus: false,
      // Tiempo que los datos se consideran frescos: 30 segundos
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
          {/* Notificaciones toast — posición superior derecha */}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13px',
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
