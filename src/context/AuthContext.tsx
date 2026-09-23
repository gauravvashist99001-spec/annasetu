import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role } from '@/types'
import { api, setToken, type Session } from '@/services/api'

interface AuthState {
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  loginAsDemo: (role: Role) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)
const KEY = 'annasetu.session'

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const s = readSession()
    if (s) setToken(s.token)
    return s
  })

  const persist = useCallback((s: Session | null) => {
    setSession(s)
    setToken(s?.token ?? null)
    try {
      if (s) sessionStorage.setItem(KEY, JSON.stringify(s))
      else sessionStorage.removeItem(KEY)
    } catch {
      /* storage unavailable — session stays in memory */
    }
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      session,
      login: async (email, password) => persist(await api.login(email, password)),
      loginAsDemo: async (role) => persist(await api.demoLogin(role)),
      logout: () => persist(null),
    }),
    [session, persist],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
