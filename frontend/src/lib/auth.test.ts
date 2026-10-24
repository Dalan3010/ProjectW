import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authService } from './auth'
import { getToken } from '../api/client'
import { storage } from './storage'

const wireUser = {
  id: 'user-1',
  full_name: 'Ana Pérez',
  email: 'ana@example.com',
  role: 'user',
  is_active: true,
  created_at: '2026-10-24T15:00:00+00:00',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('authService', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    storage.remove('session')
    storage.remove('token')
  })

  it('stores the session and token after login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        access_token: 'token-123',
        token_type: 'bearer',
        user: wireUser,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const session = await authService.login(' ANA@Example.com ', 'secret')

    expect(session.email).toBe('ana@example.com')
    expect(session.name).toBe('Ana Pérez')
    expect(authService.currentUser()?.name).toBe('Ana Pérez')
    expect(getToken()).toBe('token-123')
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(requestInit.body).toBe(
      JSON.stringify({ email: 'ana@example.com', password: 'secret' }),
    )
  })

  it('stores the session and token after registering', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          access_token: 'token-456',
          token_type: 'bearer',
          user: wireUser,
        },
        201,
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const session = await authService.register({
      name: '  Ana Pérez  ',
      email: ' ANA@Example.com ',
      password: 'secret123',
    })

    expect(session.name).toBe('Ana Pérez')
    expect(session.email).toBe('ana@example.com')
    expect(getToken()).toBe('token-456')
    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(requestInit.body).toBe(
      JSON.stringify({
        name: 'Ana Pérez',
        email: 'ana@example.com',
        password: 'secret123',
      }),
    )
  })

  it('validates the name when registering', async () => {
    await expect(
      authService.register({ name: '  ', email: 'a@b.c', password: 'x' }),
    ).rejects.toThrow('Ingresa tu nombre para registrarte.')
  })

  it('clears the session and token on logout without calling the server', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    authService.saveSession({ name: 'Ana', email: 'ana@example.com' }, 'token-123')

    authService.logout()

    expect(authService.currentUser()).toBeNull()
    expect(getToken()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
