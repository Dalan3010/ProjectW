import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthProvider'
import { storage } from '../lib/storage'
import { CasesPage } from './CasesPage'

const cases = [
  {
    id: 'c1',
    title: 'Marketplace de artesanos',
    summary: 'Conectar artesanos con compradores.',
    messageCount: 4,
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'c2',
    title: 'App de reciclaje',
    summary: 'Recompensas por reciclar.',
    messageCount: 2,
    updatedAt: new Date().toISOString(),
  },
]

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderCases() {
  storage.set('session', {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    accessToken: 'token-123',
    loginAt: new Date().toISOString(),
  })
  storage.set('token', 'token-123')

  return render(
    <MemoryRouter initialEntries={['/casos']}>
      <AuthProvider>
        <CasesPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('CasesPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: cases })))
  })

  it('renders cases and filters them by search', async () => {
    const user = userEvent.setup()
    renderCases()

    expect(await screen.findByText('Marketplace de artesanos')).toBeInTheDocument()
    expect(screen.getByText('App de reciclaje')).toBeInTheDocument()
    expect(screen.getByText('2 casos · Ordenados por actividad reciente')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Buscar por título o etiqueta...'), 'reciclaje')

    expect(screen.queryByText('Marketplace de artesanos')).not.toBeInTheDocument()
    expect(screen.getByText('App de reciclaje')).toBeInTheDocument()
    expect(screen.getByText('1 caso · Ordenados por actividad reciente')).toBeInTheDocument()
  })

  it('selects cases and deletes them after confirmation', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const url = String(input)
      if (init?.method === 'DELETE') return new Response(null, { status: 204 })
      if (url.includes('/cases')) return jsonResponse({ data: cases })
      return jsonResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderCases()

    await screen.findByText('Marketplace de artesanos')
    await user.click(screen.getByRole('button', { name: 'Seleccionar' }))
    await user.click(screen.getByText('Marketplace de artesanos'))
    expect(screen.getByText('1 seleccionado')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }),
    )

    await waitFor(() => {
      const deleteCall = fetchMock.mock.calls.find(
        ([, init]) => (init as RequestInit | undefined)?.method === 'DELETE',
      )
      expect(deleteCall).toBeDefined()
    })
  })

  it('shows an error state when the API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Servicio no disponible' }, 500)),
    )

    renderCases()

    expect(await screen.findByText('Servicio no disponible')).toBeInTheDocument()
  })
})
