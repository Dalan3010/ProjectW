// BID — authentication against the real backend (n8n webhook).
// The access token lives in storage so the HTTP client can attach it as Bearer.

import { authApi } from '../api/auth'
import { clearToken, setToken } from '../api/client'
import type { AuthUser, Session } from '../types/api'
import { storage } from './storage'

const SESSION_KEY = 'session'

function saveSession(user: AuthUser, accessToken: string): Session {
  const session: Session = {
    name: user.name,
    email: user.email,
    accessToken,
    loginAt: new Date().toISOString(),
  }
  storage.set(SESSION_KEY, session)
  setToken(accessToken)
  return session
}

export const authService = {
  saveSession,

  async register(input: { name: string; email: string; password: string }): Promise<Session> {
    if (!input.name || !input.name.trim()) {
      throw new Error('Ingresa tu nombre para registrarte.')
    }
    if (!input.email || !input.email.trim()) {
      throw new Error('Ingresa un correo electrónico.')
    }
    if (!input.password) {
      throw new Error('Ingresa una contraseña.')
    }

    const response = await authApi.register({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    })
    return saveSession(response.user, response.tokens.accessToken)
  },

  async login(email: string, password: string): Promise<Session> {
    const response = await authApi.login({
      email: email.trim().toLowerCase(),
      password,
    })
    return saveSession(response.user, response.tokens.accessToken)
  },

  logout(): void {
    // Best effort: the local session closes even when the backend is down.
    void authApi.logout().catch(() => {})
    storage.remove(SESSION_KEY)
    clearToken()
  },

  currentUser(): Session | null {
    const session = storage.get<Session | null>(SESSION_KEY, null)
    if (!session || !session.accessToken) return null
    return session
  },
}
