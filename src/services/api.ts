/**
 * API client.
 *
 * Demo Mode (default, VITE_API_URL empty): every call resolves against in-memory mock data with a
 * small artificial latency, so the UI exercises real loading states.
 *
 * Connected mode (VITE_API_URL set): calls go to the FastAPI backend in /backend. Endpoint paths
 * below match backend/app/routers/*. No secrets live in the frontend — the JWT is issued by the
 * backend and kept in memory/sessionStorage only.
 */
import type { FoodListing, MatchCandidate, Organization, Role, User } from '@/types'
import { demoUsers, organizations } from '@/data/organizations'
import { requests } from '@/data/operations'
import { scoreCandidates } from './matching'

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''
export const DEMO_MODE = !BASE

let token: string | null = null
export const setToken = (t: string | null) => {
  token = t
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

const delay = <T,>(value: T, ms = 450) => new Promise<T>((r) => setTimeout(() => r(value), ms))

export interface Session {
  user: User & { title?: string }
  token: string
}

export const api = {
  async login(email: string, password: string): Promise<Session> {
    if (!DEMO_MODE) {
      const form = new URLSearchParams({ username: email, password })
      const res = await fetch(`${BASE}/auth/token`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Invalid email or password')
      const { access_token } = await res.json()
      setToken(access_token)
      const user = await http<User>('/auth/me')
      return { user, token: access_token }
    }
    const match = Object.values(demoUsers).find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!match || password.length < 6) {
      await delay(null, 500)
      throw new Error('Invalid email or password. Try a demo account below.')
    }
    return delay({ user: match, token: `demo.${match.role}` }, 600)
  },

  async demoLogin(role: Role): Promise<Session> {
    const user = demoUsers[role]
    return delay({ user, token: `demo.${role}` }, 350)
  },

  async register(payload: { name: string; email: string; role: Role; organization?: string }): Promise<{ status: 'pending_verification' }> {
    if (!DEMO_MODE) return http('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
    return delay({ status: 'pending_verification' as const }, 900)
  },

  async findMatches(listing: Pick<FoodListing, 'servings' | 'available_until' | 'category' | 'organization_id'>, orgs: Organization[] = organizations): Promise<MatchCandidate[]> {
    if (!DEMO_MODE) return http('/matching/candidates', { method: 'POST', body: JSON.stringify(listing) })
    const source = orgs.find((o) => o.id === listing.organization_id)!
    return delay(scoreCandidates(listing, source, orgs, requests), 1600)
  },
}
