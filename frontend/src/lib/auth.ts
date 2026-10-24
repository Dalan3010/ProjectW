// BID — authentication against the FastAPI backend.
// The access token lives in storage so the HTTP client can attach it as Bearer.

import { authApi } from '../api/auth'
import { ApiError, clearToken, setToken } from '../api/client'
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

    const email = input.email.trim().toLowerCase()

    try {
      const response = await authApi.register({
        name: input.name.trim(),
        email,
        password: input.password,
      })
      return saveSession(response.user, response.accessToken)
    } catch (cause) {
      if (cause instanceof ApiError) throw cause
      throw new Error('No se pudo conectar con el servidor. Verificá tu conexión.')
    }
  },

  async login(email: string, password: string): Promise<Session> {
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const response = await authApi.login({
        email: normalizedEmail,
        password,
      })
      return saveSession(response.user, response.accessToken)
    } catch (cause) {
      if (cause instanceof ApiError) throw cause
      throw new Error('No se pudo conectar con el servidor. Verificá tu conexión.')
    }
  },

  logout(): void {
    // Stateless JWT: logout is purely local, there is no endpoint to call.
    storage.remove(SESSION_KEY)
    clearToken()
  },

  currentUser(): Session | null {
    const session = storage.get<Session | null>(SESSION_KEY, null)
    if (!session || !session.accessToken) return null
    return session
  },
}
