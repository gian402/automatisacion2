// ============================================================
// HYTICON — Variables de entorno tipadas
// Todas las vars deben tener prefijo VITE_ para ser expuestas
// ============================================================

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'HYTICON',
  APP_VERSION: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  ENV: import.meta.env.MODE ?? 'development',
} as const

export type Env = typeof env
