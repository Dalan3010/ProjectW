import { createContext, useContext } from 'react'
import type { Session } from '../types/api'

export interface AuthContextValue {
  session: Session | null
  login: (email: string, password: string) => Promise<Session>
  register: (input: { name: string; email: string; password: string }) => Promise<Session>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
