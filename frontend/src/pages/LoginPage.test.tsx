import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthProvider'
import { LoginPage } from './LoginPage'

const wireUser = {
  id: 'user-1',
  full_name: 'Ana Pérez',
  email: 'ana@example.com',
  role: 'user',
  is_active: true,
  created_at: '2026-10-24T15:00:00+00:00',
}

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('switches to register mode and creates an account', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: 'token-123',
          token_type: 'bearer',
          user: wireUser,
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderLogin()

    expect(screen.getByRole('heading', { name: 'Bienvenido de vuelta' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Entrar como demo' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Regístrate gratis' }))
    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Nombre'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta gratis' }))

    expect(await screen.findByText('¡Sesión iniciada!')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mis casos' })).toBeInTheDocument()

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit
    expect(requestInit.body).toBe(
      JSON.stringify({ name: 'Ana Pérez', email: 'ana@example.com', password: 'secret' }),
    )
  })

  it('shows the backend error message when login fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Credenciales inválidas' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument()
    })
  })
})
