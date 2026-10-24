import { describe, expect, it, vi } from 'vitest'
import { ApiError, API_BASE_URL, request, setToken } from './client'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('API_BASE_URL', () => {
  it('points to the FastAPI server instead of the n8n webhook', () => {
    expect(API_BASE_URL).toBe('http://localhost:8000')
    expect(API_BASE_URL).not.toContain('webhook')
  })
})

describe('request', () => {
  it('adds query params and the bearer token', async () => {
    setToken('abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await request('/cases/', { params: { limit: 2, offset: 10, empty: undefined } })

    const url = fetchMock.mock.calls[0]?.[0] as URL
    expect(url.toString()).toBe(`${API_BASE_URL}/cases/?limit=2&offset=10`)
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc')
  })

  it('uses the backend detail for API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ detail: 'Caso inválido' }, 400)),
    )

    await expect(request('/cases/')).rejects.toThrow('Caso inválido')
    await expect(request('/cases/')).rejects.toBeInstanceOf(ApiError)
  })

  it('uses the first msg of a 422 detail array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            detail: [
              {
                type: 'string_too_short',
                loc: ['body', 'password'],
                msg: 'String should have at least 8 characters',
                input: 'abc',
              },
            ],
          },
          422,
        ),
      ),
    )

    await expect(
      request('/auth/register', { method: 'POST', body: { password: 'abc' } }),
    ).rejects.toThrow('String should have at least 8 characters')
  })

  it('returns null for 204 responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    await expect(request('/cases/1', { method: 'DELETE' })).resolves.toBeNull()
  })
})
