import { Link } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { Brand } from './Brand'
import { UserMenu } from './UserMenu'

interface AppNavbarProps {
  active: 'casos' | 'chat'
}

export function AppNavbar({ active }: AppNavbarProps) {
  const { session } = useAuth()

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
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}