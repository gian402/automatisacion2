// ============================================================
// HYTICON — DashboardService (frontend)
// ============================================================

import httpClient from './http'

// ── Tipos ─────────────────────────────────────────────────────
export interface CotizacionResumen {
  id: string
  numeroCotizacion: string
  estado: string
  total: number
  moneda: 'PEN' | 'USD'
  createdAt: string
  cliente: { id: string; nombre: string } | null
  responsable: { id: string; nombre: string } | null
}

// Stats para ADMIN
export interface StatsAdmin {
  cotizaciones: {
    total: number
    mes: number
    enviadas: number
    aprobadas: number
    rechazadas: number
    pendientes: number
  }
  montos: {
    cotizadoMes: number
    aprobadoTotal: number
  }
  clientes: {
    total: number
    activos: number
  }
  catalogo: {
    itemsActivos: number
  }
  usuarios: {
    activos: number
  }
  actividadReciente: CotizacionResumen[]
}

// Stats para SUPERVISOR
export interface StatsSupervisor {
  cotizaciones: {
    total: number
    mes: number
    aprobadas: number
    enviadas: number
    pendientes: number
  }
  montos: {
    cotizadoMes: number
  }
  actividadReciente: CotizacionResumen[]
}

export type DashboardStats = StatsAdmin | StatsSupervisor

export function isAdminStats(stats: DashboardStats): stats is StatsAdmin {
  return 'clientes' in stats
}

// ── Service ───────────────────────────────────────────────────
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await httpClient.get<DashboardStats>('/dashboard/stats')
    return data
  },
}
