import type { AuthSession, AuthUser, WireTokenResponse, WireUser } from '../types/api'
import { request } from './client'

export function mapUser(wire: WireUser): AuthUser {
  return {
    id: wire.id,
    name: wire.full_name,
    email: wire.email,
  }
}

function mapTokenResponse(wire: WireTokenResponse): AuthSession {
  return {
    accessToken: wire.access_token,
    user: mapUser(wire.user),
  }
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<AuthSession> =>
    mapTokenResponse(
      await request<WireTokenResponse>('/auth/login', { method: 'POST', body: credentials }),
    ),

  register: async (data: {
    name: string
    email: string
    password: string
  }): Promise<AuthSession> =>
    mapTokenResponse(
      await request<WireTokenResponse>('/auth/register', { method: 'POST', body: data }),
    ),

  me: async (): Promise<AuthUser> => mapUser(await request<WireUser>('/auth/me')),
}
