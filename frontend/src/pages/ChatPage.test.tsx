import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthProvider'
import { storage } from '../lib/storage'
import { ChatPage } from './ChatPage'

const wireCase = {
  id: 'case-1',
  owner_id: 'user-1',
  title: 'Quiero digitalizar ferias',
  description: 'Quiero digitalizar ferias',
  category: null,
  status: 'new',
  created_at: '2026-10-24T15:00:00+00:00',
  updated_at: '2026-10-24T15:00:00+00:00',
  metadata: null,
}

function wireMessage(
  role: 'user' | 'assistant',
  content: string,
  metadata: Record<string, unknown> | null = null,
) {
  return {
    id: `${role}-1`,
    case_id: 'case-1',
    role,
    content,
    metadata,
    created_at: '2026-10-24T15:00:00+00:00',
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function renderChat(path = '/chat') {
  storage.set('session', {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    accessToken: 'token-123',
    loginAt: new Date().toISOString(),
  })
  storage.set('token', 'token-123')

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <ChatPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ChatPage', () => {
  it('creates a case and sends the first message through the case chat endpoint', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const url = String(input)
      if (init?.method === 'POST' && url.includes('/messages')) {
        return jsonResponse(
          {
            user_message: wireMessage('user', 'Quiero digitalizar ferias'),
            assistant_message: wireMessage('assistant', 'Contame más sobre el problema.'),
          },
          201,
        )
      }
      if (init?.method === 'POST' && url.endsWith('/cases/')) {
        return jsonResponse(wireCase, 201)
      }
      return jsonResponse({ data: [], total: 0, limit: 50, offset: 0 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderChat()

    expect(
      screen.getByRole('heading', { name: '¿Qué problema quieres resolver hoy?' }),
    ).toBeInTheDocument()

    await user.type(
      screen.getByPlaceholderText('Describe tu idea de negocio...'),
      'Quiero digitalizar ferias',
    )
    await user.click(screen.getByRole('button', { name: 'Enviar' }))

    expect(await screen.findByText('Contame más sobre el problema.')).toBeInTheDocument()
    expect(screen.getByText('Quiero digitalizar ferias')).toBeInTheDocument()

    const createCall = fetchMock.mock.calls[0]
    expect(String(createCall?.[0])).toContain('/cases/')
    const createInit = createCall?.[1] as RequestInit
    expect(createInit.body).toBe(
      JSON.stringify({
        title: 'Quiero digitalizar ferias',
        description: 'Quiero digitalizar ferias',
      }),
    )

    const sendCall = fetchMock.mock.calls[1]
    expect(String(sendCall?.[0])).toContain('/cases/case-1/messages')
    const sendInit = sendCall?.[1] as RequestInit
    expect(sendInit.body).toBe(JSON.stringify({ content: 'Quiero digitalizar ferias' }))

    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/chat'))).toBe(false)
  })

  it('renders assistant metadata cards and history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          data: [
            wireMessage('user', 'Una idea'),
            wireMessage('assistant', '## Diagnóstico\nTodo bien', {
              analysis: {
                targetSegment: 'PYMEs',
                urgency: 4,
                frequency: 3,
                severity: 2,
                willingnessToPay: 5,
                mainRisks: ['Competencia'],
                overallScore: 80,
              },
              ideas: [
                {
                  title: 'SaaS de prueba',
                  description: 'Una plataforma',
                  revenueModel: 'Suscripción',
                  entryDifficulty: 'low',
                  implementationSpeed: 'weeks',
                  potentialScore: 90,
                  tags: ['SaaS'],
                },
              ],
              nextSteps: ['Validar con clientes'],
              confidence: 0.8,
            }),
          ],
          total: 2,
          limit: 50,
          offset: 0,
        }),
      ),
    )

    renderChat('/chat?caso=case-1')

    expect(await screen.findByText('PYMEs')).toBeInTheDocument()
    expect(screen.getByText('SaaS de prueba')).toBeInTheDocument()
    expect(screen.getByText('Validar con clientes')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })
})
