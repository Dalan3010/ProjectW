import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from './auth'
import { getToken } from '../api/client'
import { storage } from './storage'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('authService', () => {
  beforeEach(() => {
    storage.remove('session')
    storage.remove('token')
  })

  it('stores the session and token after login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        user: { name: 'Ana Pérez', email: 'ana@example.com' },
        tokens: { accessToken: 'token-123' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const session = await authService.login(' ANA@Example.com ', 'secret')

    expect(session.email).toBe('ana@example.com')
    expect(authService.currentUser()?.name).toBe('Ana Pérez')
    expect(getToken()).toBe('token-123')
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(requestInit.body).toBe(
      JSON.stringify({ email: 'ana@example.com', password: 'secret' }),
    )
  })

  it('validates the name when registering', async () => {
    await expect(
      authService.register({ name: '  ', email: 'a@b.c', password: 'x' }),
    ).rejects.toThrow('Ingresa tu nombre para registrarte.')
  })

  it('clears the session and token on logout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
    authService.saveSession(
      { name: 'Ana', email: 'ana@example.com' },
      'token-123',
    )

    authService.logout()

    expect(authService.currentUser()).toBeNull()
    expect(getToken()).toBeNull()
  })
})
