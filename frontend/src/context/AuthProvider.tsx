import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../lib/auth'
import type { Session } from '../types/api'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => authService.currentUser())

  const login = useCallback(async (email: string, password: string) => {
    const next = await authService.login(email, password)
    setSession(next)
    return next
  }, [])

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const next = await authService.register(input)
      setSession(next)
      return next
    },
    [],
  )

  const logout = useCallback(() => {
    authService.logout()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ session, login, register, logout }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
