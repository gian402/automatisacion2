// ============================================================
// HYTICON — Servicio de autenticación
// ============================================================

import axios from 'axios'
import httpClient from './http'
import { env } from '@/config/env'
import type { AuthResponse, LoginCredentials } from '@/types/auth'

export const authService = {
  /**
   * Inicia sesión — devuelve access token y datos del usuario.
   * El refresh token llega en una cookie HttpOnly (manejado por el backend).
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', credentials)
    return data
  },

  /**
   * Cierra sesión — el backend invalida el refresh token.
   */
  async logout(): Promise<void> {
    await httpClient.post('/auth/logout')
  },

  /**
   * Recupera la sesión activa usando el refresh token en cookie.
   * Se llama al montar la app para restaurar la sesión sin pedir login de nuevo.
   */
  async refreshSession(): Promise<AuthResponse> {
    const { data } = await axios.post<AuthResponse>(
      `${env.API_URL}/auth/refresh`,
      {},
      { withCredentials: true, timeout: 3000 },
    )
    return data
  },

  /**
   * Retorna el perfil del usuario autenticado.
   */
  async getMe(): Promise<AuthResponse['user']> {
    const { data } = await httpClient.get<AuthResponse['user']>('/auth/me')
    return data
  },
}
