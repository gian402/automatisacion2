// ============================================================
// HYTICON — UsersService (frontend)
// ============================================================

import httpClient from './http'
import type { Usuario } from '@/types'

export interface CreateUserPayload {
  nombre: string
  email: string
  password: string
  rol: 'ADMIN' | 'SUPERVISOR'
}

export interface UpdateUserPayload {
  nombre?: string
  email?: string
  password?: string
  rol?: 'ADMIN' | 'SUPERVISOR'
}

export interface UsersListResponse {
  data: Usuario[]
  total: number
  page: number
  limit: number
}

export const usersService = {
  async findAll(page = 1, limit = 20): Promise<UsersListResponse> {
    const { data } = await httpClient.get<UsersListResponse>('/users', {
      params: { page, limit },
    })
    return data
  },

  async findOne(id: string): Promise<Usuario> {
    const { data } = await httpClient.get<Usuario>(`/users/${id}`)
    return data
  },

  async create(payload: CreateUserPayload): Promise<Usuario> {
    const { data } = await httpClient.post<Usuario>('/users', payload)
    return data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<Usuario> {
    const { data } = await httpClient.patch<Usuario>(`/users/${id}`, payload)
    return data
  },

  async toggle(id: string, activo: boolean): Promise<Usuario> {
    const { data } = await httpClient.patch<Usuario>(`/users/${id}/toggle`, { activo })
    return data
  },
}
