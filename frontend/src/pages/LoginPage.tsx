import { useState, useEffect, type FormEvent } from 'react'
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

  // Estados para las animaciones del personaje
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 })

  usePageMeta(
    session ? 'Sesión iniciada — BID' : 'Iniciar sesión — BID',
    'Inicia sesión en BID para continuar con tus ideas de negocio.',
  )

  const isRegister = mode === 'register'

  function switchMode() {
    setMode(isRegister ? 'login' : 'register')
    setError('')
  }

  // Efecto para que los ojos sigan el mouse
  useEffect(() => {
    // Si los ojos están tapados, no seguimos el mouse
    if (isPasswordFocused) return

    const handleMouseMove = (event: MouseEvent) => {
      // Calculamos la posición del mouse relativa a la ventana para mover las pupilas (rango de -6px a 6px)
      const x = (event.clientX / window.innerWidth) * 12 - 6
      const y = (event.clientY / window.innerHeight) * 12 - 6
      setPupilPosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isPasswordFocused])

  // Funciones para tapar/destapar ojos
  function coverEyes() {
    setIsPasswordFocused(true)
    // Centramos las pupilas cuando se tapan los ojos
    setPupilPosition({ x: 0, y: 0 })
  }

  function uncoverEyes() {
    setIsPasswordFocused(false)
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
                : ''}
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
              {/* Personaje animado con React States y CSS inline */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                <svg viewBox="0 0 200 150" width="140" height="105" style={{ overflow: 'visible' }}>
                  {/* Cuerpo del personaje principal */}
                  <rect x="40" y="20" width="120" height="130" rx="40" fill="#5b21b6" />
                  
                  {/* Fondo blanco de los Ojos */}
                  <circle cx="80" cy="70" r="12" fill="#ffffff" />
                  <circle cx="120" cy="70" r="12" fill="#ffffff" />
                  
                  {/* Pupilas dinámicas (Siguen el mouse) */}
                  <g style={{
                    transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}>
                    <circle cx="80" cy="70" r="5" fill="#000000" />
                    <circle cx="120" cy="70" r="5" fill="#000000" />
                  </g>
                  
                  {/* Boca */}
                  <path 
                    d={isPasswordFocused ? "M 95 100 Q 100 95 105 100" : "M 90 95 Q 100 105 110 95"} 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    style={{ transition: 'd 0.3s ease' }}
                  />
                  
                  {/* Brazos dinámicos (Suben más y se expanden para cubrir mejor) */}
                  <g>
                    <rect 
                      x="60" 
                      y="130" 
                      width="25" 
                      height="40" 
                      rx="12.5" 
                      fill="#3b0764" 
                      style={{ 
                        transformOrigin: '72px 150px',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isPasswordFocused ? 'translateY(-65px) rotate(35deg) scale(1.3)' : 'translateY(0) rotate(0) scale(1)'
                      }} 
                    />
                    <rect 
                      x="115" 
                      y="130" 
                      width="25" 
                      height="40" 
                      rx="12.5" 
                      fill="#3b0764" 
                      style={{ 
                        transformOrigin: '127px 150px',
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isPasswordFocused ? 'translateY(-65px) rotate(-35deg) scale(1.3)' : 'translateY(0) rotate(0) scale(1)'
                      }} 
                    />
                  </g>
                </svg>
              </div>

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
                    onFocus={coverEyes}
                    onBlur={uncoverEyes}
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