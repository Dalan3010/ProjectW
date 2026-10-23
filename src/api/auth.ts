import type { AuthResponse } from '../types/api'
import { request } from './client'

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: credentials }),

  register: (data: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: data }),

  logout: () => request<null>('/auth/logout', { method: 'POST' }),

  me: () => request<AuthResponse>('/auth/me'),
}
