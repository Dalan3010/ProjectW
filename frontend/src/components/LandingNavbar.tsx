import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { Brand } from './Brand'

export function LandingNavbar() {
  const { session, logout } = useAuth()
  const firstName = session?.name.trim().split(/\s+/)[0]

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
