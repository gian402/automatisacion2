// ============================================================
// HYTICON — AuthContext
// Manejo de sesión, access token en memoria y restauración
// ============================================================

import { createContext, useCallback, useEffect, useReducer, type ReactNode } from 'react'
import { authService } from '@/services/auth.service'
import { setAccessToken } from '@/services/http'
import type { AuthState } from '@/types/auth'
import type { LoginCredentials } from '@/types/auth'
import type { Usuario } from '@/types'

// ── Estado inicial ────────────────────────────────────────────
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true mientras verifica la sesión al iniciar
}

// ── Acciones del reducer ──────────────────────────────────────
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: Usuario; accessToken: string } }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_RESTORED'; payload: { user: Usuario; accessToken: string } }
  | { type: 'SESSION_CHECK_DONE' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'SESSION_RESTORED':
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'SESSION_CHECK_DONE':
      return { ...state, isLoading: false }
    default:
      return state
  }
}

// ── Interfaz del contexto ─────────────────────────────────────
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

// ── Contexto ──────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Al montar: intenta recuperar la sesión via refresh token (cookie HttpOnly)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { accessToken, user } = await authService.refreshSession()
        setAccessToken(accessToken)
        dispatch({ type: 'SESSION_RESTORED', payload: { user, accessToken } })
      } catch {
        // No había sesión activa — no es un error, simplemente no hay sesión
        dispatch({ type: 'SESSION_CHECK_DONE' })
      }
    }

    restoreSession()
  }, [])

  // Escucha el evento que lanza el interceptor HTTP cuando el refresh falla
  useEffect(() => {
    const handleForceLogout = () => {
      setAccessToken(null)
      dispatch({ type: 'LOGOUT' })
    }

    window.addEventListener('auth:logout', handleForceLogout)
    return () => window.removeEventListener('auth:logout', handleForceLogout)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { accessToken, user } = await authService.login(credentials)
    setAccessToken(accessToken)
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken } })
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setAccessToken(null)
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
