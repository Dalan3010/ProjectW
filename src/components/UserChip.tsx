import type { Session } from '../types/api'

export function UserChip({ session }: { session: Session }) {
  const firstName = session.name.trim().split(/\s+/)[0]

  return (
    <div className="user-chip">
      <div className="user-avatar">{(firstName || 'U').charAt(0).toUpperCase()}</div>
      <div className="user-info">
        <div className="user-name">{session.name.trim() || 'Demo'}</div>
        <div className="user-email">{session.email}</div>
      </div>
    </div>
  )
}
