import { describe, expect, it, vi } from 'vitest'
import { ApiError, API_BASE_URL, request, setToken } from './client'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('request', () => {
  it('adds query params and the bearer token', async () => {
    setToken('abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await request('/cases', { params: { page: 2, pageSize: 10, empty: undefined } })

    const url = fetchMock.mock.calls[0]?.[0] as URL
    expect(url.toString()).toBe(`${API_BASE_URL}/cases?page=2&pageSize=10`)
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc')
  })

  it('uses the backend message for API errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Caso inválido' }, 400)))

    await expect(request('/cases')).rejects.toThrow('Caso inválido')
    await expect(request('/cases')).rejects.toBeInstanceOf(ApiError)
  })

  it('returns null for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(request('/cases/1', { method: 'DELETE' })).resolves.toBeNull()
  })
})
