import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { Brand } from './Brand'
import { UserChip } from './UserChip'

interface AppNavbarProps {
  active: 'casos' | 'chat'
}

export function AppNavbar({ active }: AppNavbarProps) {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  if (!session) return null

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Brand />
        <div className="navbar-actions">
          <Link to="/casos" className={`nav-link${active === 'casos' ? ' active' : ''}`}>
            Mis casos
          </Link>
          <Link to="/chat" className={`nav-link${active === 'chat' ? ' active' : ''}`}>
            Nueva conversación
          </Link>
          <UserChip session={session} />
          <button
            type="button"
            className="btn btn-ghost navbar-btn"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
