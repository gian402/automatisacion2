// ============================================================
// HYTICON — ErrorBoundary
// Captura cualquier error de render en React y muestra feedback
// ============================================================

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
          <div className="max-w-md rounded-xl border border-[#fee2e2] bg-white p-8 shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fee2e2] text-[#dc2626]">
              <span className="text-xl font-bold">!</span>
            </div>
            <h2 className="text-lg font-semibold text-[#0f172a]">
              Ocurrió un problema en la interfaz
            </h2>
            <p className="mt-2 text-xs text-[#64748b]">
              {this.state.error?.message || 'Error inesperado al renderizar la vista.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-[#2563eb] px-4 text-xs font-medium text-white hover:bg-[#1d4ed8]"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
