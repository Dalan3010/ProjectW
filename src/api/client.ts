// BID — HTTP client for the backend (n8n webhook).
// JSON in/out, automatic Bearer token, timeout, and a global 401 handler.

import { storage } from '../lib/storage'
import type { RequestOptions } from '../types/api'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5678/webhook'
).replace(/\/$/, '')

const TIMEOUT_MS = 30_000
const TOKEN_KEY = 'token'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function getToken(): string | null {
  return storage.get<string | null>(TOKEN_KEY, null)
}

export function setToken(token: string): void {
  storage.set(TOKEN_KEY, token)
}

export function clearToken(): void {
  storage.remove(TOKEN_KEY)
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options
  const url = new URL(API_BASE_URL + path)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Intenta de nuevo.')
    }
    throw new Error('No se pudo conectar con el servidor. Verificá tu conexión.')
  } finally {
    clearTimeout(timer)
  }

  // A 401 on a credential endpoint means bad credentials, not an expired
  // session: let the login form show the server message instead of reloading.
  const isCredentialRequest = path === '/auth/login' || path === '/auth/register'
  if (response.status === 401 && !isCredentialRequest) {
    clearToken()
    window.location.assign('/login')
    throw new ApiError('Tu sesión expiró. Inicia sesión de nuevo.', 401)
  }

  if (response.status === 204) return null as T

  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    // Non-JSON response: keep data null and fall back to a status message.
  }

  if (!response.ok) {
    throw new ApiError(getApiError(data, response), response.status)
  }

  return data as T
}

function getApiError(data: unknown, response: Response): string {
  if (
    data !== null &&
    typeof data === 'object' &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  ) {
    return (data as { message: string }).message
  }
  return `Error del servidor (${response.status}).`
}
