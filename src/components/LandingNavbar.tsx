import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { Brand } from './Brand'

export function LandingNavbar() {
  const { session, logout, login, register } = useAuth()
  const navigate = useNavigate()
  const [demoLoading, setDemoLoading] = useState(false)
  const firstName = session?.name.trim().split(/\s+/)[0]

  async function handleDemo() {
    if (demoLoading) return
    setDemoLoading(true)
    try {
      const demoEmail = 'demo@bid.local'
      const demoPassword = 'demo1234'
      try {
        await login(demoEmail, demoPassword)
      } catch {
        await register({ name: 'Usuario Demo', email: demoEmail, password: demoPassword })
      }
      navigate('/casos')
    } catch {
      navigate('/login')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Brand />
        <div className="navbar-actions">
          {session ? (
            <div className="navbar-actions">
              <span className="navbar-greeting">Hola, {firstName || session.email}</span>
              <button type="button" className="btn btn-ghost navbar-btn" onClick={logout}>
                Salir
              </button>
            </div>
          ) : (
            <div className="navbar-actions">
              <button
                type="button"
                className="btn btn-ghost navbar-btn"
                onClick={() => void handleDemo()}
                disabled={demoLoading}
              >
                {demoLoading ? 'Entrando…' : 'Entrar como demo'}
              </button>
              <Link to="/login" className="btn btn-ghost navbar-btn">
                Iniciar sesión
              </Link>
              <Link to="/login" className="btn btn-primary navbar-btn">
                Comenzar gratis
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
