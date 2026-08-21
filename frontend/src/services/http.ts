// ============================================================
// HYTICON — Cliente HTTP
// Instancia axios con interceptores JWT + refresh token
// ============================================================

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'

// Instancia principal
const httpClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15_000,
  withCredentials: true, // necesario para enviar/recibir refresh token en cookie
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Referencia al access token en memoria (no en localStorage) ──
// Se inicializa desde AuthContext al montar la app
let _accessToken: string | null = null
let _isRefreshing = false
let _pendingRequests: Array<(token: string) => void> = []

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getAccessToken(): string | null {
  return _accessToken
}

// ── Interceptor de request: adjunta el access token ──────────
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Interceptor de response: maneja 401 y renueva el token ───
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Si la petición que falló ya era login o refresh, o no es 401 o ya fue reintentada, rechaza directamente
    if (
      !originalRequest ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login') ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, encola el request
    if (_isRefreshing) {
      return new Promise((resolve) => {
        _pendingRequests.push((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          resolve(httpClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    _isRefreshing = true

    try {
      // Solicita un nuevo access token usando la cookie de refresh
      const { data } = await axios.post<{ accessToken: string }>(
        `${env.API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      )

      const newToken = data.accessToken
      setAccessToken(newToken)

      // Notifica a los requests encolados
      _pendingRequests.forEach((cb) => cb(newToken))
      _pendingRequests = []

      // Reintenta el request original
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return httpClient(originalRequest)
    } catch {
      // Refresh falló — limpiar sesión
      setAccessToken(null)
      _pendingRequests = []

      // Disparar evento para que AuthContext fuerce logout
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(error)
    } finally {
      _isRefreshing = false
    }
  },
)

export default httpClient
