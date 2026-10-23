import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthProvider'
import { storage } from '../lib/storage'
import { ChatPage } from './ChatPage'

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
  it('shows welcome prompts and starts a case with the first message', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        caseId: 'case-1',
        message: { role: 'assistant', content: 'Contame más sobre el problema.' },
      }),
    )
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

    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]
    expect(url.toString()).toContain('/chat/start')
    expect(init.body).toBe(JSON.stringify({ message: 'Quiero digitalizar ferias' }))
  })

  it('renders assistant metadata cards and history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse([
          { role: 'user', content: 'Una idea', timestamp: new Date().toISOString() },
          {
            role: 'assistant',
            content: '## Diagnóstico\nTodo bien',
            metadata: {
              type: 'analysis',
              confidence: 80,
              analysis: {
                targetSegment: 'PYMEs',
                urgency: 4,
                frequency: 3,
                severity: 2,
                willingnessToPlay: 5,
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
            },
          },
        ]),
      ),
    )

    renderChat('/chat?caso=case-1')

    expect(await screen.findByText('PYMEs')).toBeInTheDocument()
    expect(screen.getByText('SaaS de prueba')).toBeInTheDocument()
    expect(screen.getByText('Validar con clientes')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })
})
