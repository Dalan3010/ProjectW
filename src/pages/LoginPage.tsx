import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { Footer } from '../components/Footer'
import { useAuth } from '../context/auth-context'
import { usePageMeta } from '../hooks/usePageMeta'

type Mode = 'login' | 'register'

export function LoginPage() {
  const { session, login, register, logout } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  usePageMeta(
    session ? 'Sesión iniciada — BID' : 'Iniciar sesión — BID',
    'Inicia sesión en BID para continuar con tus ideas de negocio.',
  )

  const isRegister = mode === 'register'

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.checkValidity()) {
      form.reportValidity?.()
      return
    }

    setError('')
    setSubmitting(true)
    try {
      if (isRegister) {
        await register({ name, email, password })
      } else {
        await login(email, password)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo completar la operación.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDemoLogin() {
    setError('')
    setSubmitting(true)
    try {
      const demoEmail = 'demo@bid.local'
      const demoPassword = 'demo1234'
      try {
        await login(demoEmail, demoPassword)
      } catch {
        await register({ name: 'Usuario Demo', email: demoEmail, password: demoPassword })
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión demo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Brand size="lg" />
      </header>

      <main className="login-main">
        <div className="card login-card">
          <h1 className="login-title">
            {session ? 'Bienvenido de vuelta' : isRegister ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
          </h1>
          <p className="login-subtitle">
            {session
              ? 'Inicia sesión para continuar con tus ideas de negocio.'
              : isRegister
                ? 'Regístrate gratis y empieza a trabajar en tus ideas.'
                : 'Inicia sesión para continuar con tus ideas de negocio.'}
          </p>

          {session ? (
            <div className="success-state">
              <svg
                className="success-icon"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--success)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m8.5 12.5 2.5 2.5 4.5-5" />
              </svg>
              <h3 className="success-title">¡Sesión iniciada!</h3>
              <p className="success-text">Bienvenido de vuelta a BID.</p>
              <Link to="/casos" className="btn btn-primary">
                Ir a mis casos
              </Link>
              <p className="success-logout">
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    logout()
                  }}
                >
                  Cerrar sesión
                </a>
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} noValidate>
                <div className={`auth-field${isRegister ? '' : ' hidden'}`}>
                  <label className="auth-label" htmlFor="name">
                    Nombre
                  </label>
                  <input
                    className="auth-input"
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required={isRegister}
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Correo electrónico
                  </label>
                  <input
                    className="auth-input"
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    className="auth-input"
                    type="password"
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-block auth-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Procesando…'
                    : isRegister
                      ? 'Crear cuenta gratis'
                      : 'Iniciar sesión'}
                </button>
              </form>
              <button
                type="button"
                className="btn btn-ghost btn-block"
                style={{ marginTop: 12 }}
                disabled={submitting}
                onClick={() => void handleDemoLogin()}
              >
                Entrar como demo
              </button>
              <p className="auth-error" hidden={!error}>
                {error}
              </p>
              <p className="login-switch">
                <span>{isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}</span>{' '}
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    switchMode()
                  }}
                >
                  {isRegister ? 'Inicia sesión' : 'Regístrate gratis'}
                </a>
              </p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
