import type { Usuario } from './index'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
}

export interface AuthResponse {
  accessToken: string
  user: Usuario
}

export interface AuthState {
  user: Usuario | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
