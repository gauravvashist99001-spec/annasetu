import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, FlaskConical, LogOut, Menu, RotateCcw, Search, Settings, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/brand/Logo'
import { Avatar, VerifiedBadge } from '@/components/ui'
import { NotificationList } from '@/components/dashboard/NotificationList'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { DEMO_MODE } from '@/services/api'
import type { Role } from '@/types'
import { cn } from '@/utils/cn'
import { NAV, ROLE_LABEL } from './nav'

function Sidebar({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const { state } = useData()
  const { session } = useAuth()
  const org = state.organizations.find((o) => o.id === session?.user.organization_id)
  const badges = {
    notifications: state.notifications.filter((n) => !n.read && (n.user_role === role || n.user_role === 'all')).length,
    verification: state.organizations.filter((o) => o.verification_status === 'pending').length,
    pickups: state.pickups.length,
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo to="/app" />
      </div>
      <div className="mx-3 mb-3 rounded-xl border border-line bg-canvas px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">{ROLE_LABEL[role]}</p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] font-semibold text-ink">
          <span className="truncate">{org?.name ?? session?.user.name}</span>
          <VerifiedBadge status="verified" compact />
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin" aria-label="Dashboard">
        <ul className="space-y-0.5">
          {NAV[role].map((item) => {
            const count = item.badgeKey ? badges[item.badgeKey] : 0
            return (
              <li key={item.to + item.label}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-muted hover:bg-slate-100 hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn('size-[18px] shrink-0', isActive ? 'text-brand-700' : 'text-ink-subtle group-hover:text-ink-muted')} aria-hidden />
                      <span className="flex-1 truncate">{item.label}</span>
                      {count > 0 && <span className="num rounded-full bg-accent-500 px-1.5 text-[11px] font-semibold text-ink">{count}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
      {DEMO_MODE && (
        <div className="m-3 rounded-xl border border-dashed border-accent-500/50 bg-accent-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-700"><FlaskConical className="size-3.5" aria-hidden /> Demo Mode</p>
          <p className="mt-1 text-[12px] leading-snug text-ink-muted">All data is fictional. Reset any time from your profile menu.</p>
        </div>
      )}
    </div>
  )
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOut()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onOut()
    document.addEventListener('mousedown', h)
    document.addEventListener('keydown', k)
    return () => {
      document.removeEventListener('mousedown', h)
      document.removeEventListener('keydown', k)
    }
  }, [ref, onOut, active])
}

function GlobalSearch() {
  const { state } = useData()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  useClickOutside(box, () => setOpen(false), open)
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const orgs = state.organizations.filter((o) => o.name.toLowerCase().includes(s)).slice(0, 4).map((o) => ({ label: o.name, sub: `${o.kind} · ${o.area}`, to: '/app/map' }))
    const food = state.listings.filter((l) => l.food_name.toLowerCase().includes(s)).slice(0, 4).map((l) => ({ label: l.food_name, sub: `${l.servings} meals · ${l.status}`, to: '/app/available' }))
    const track = state.deliveries.filter((d) => d.tracking_id.toLowerCase().includes(s)).slice(0, 4).map((d) => ({ label: d.tracking_id, sub: `Tracking · ${d.meals} meals`, to: `/app/track/${d.tracking_id}` }))
    return [...track, ...food, ...orgs]
  }, [q, state])

  return (
    <div ref={box} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search food, organisations, tracking ID…"
        aria-label="Search"
        className="h-10 w-full rounded-[10px] border border-line bg-canvas pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-tech-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-tech-100"
      />
      {open && q.length >= 2 && (
        <div className="absolute inset-x-0 top-12 z-30 overflow-hidden rounded-xl border border-line bg-white shadow-[var(--shadow-pop)]">
          {results.length ? (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((r) => (
                <li key={r.label + r.to}>
                  <button
                    className="flex w-full flex-col px-4 py-2 text-left hover:bg-slate-50"
                    onClick={() => {
                      navigate(r.to)
                      setOpen(false)
                      setQ('')
                    }}
                  >
                    <span className="text-sm font-medium text-ink">{r.label}</span>
                    <span className="text-xs capitalize text-ink-subtle">{r.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-ink-subtle">No results for “{q}”. Try “rice” or “AS-2026”.</p>
          )}
        </div>
      )}
    </div>
  )
}

function Topbar({ role, onMenu }: { role: Role; onMenu: () => void }) {
  const { session, logout, loginAsDemo } = useAuth()
  const { state, dispatch } = useData()
  const navigate = useNavigate()
  const [menu, setMenu] = useState<'none' | 'notif' | 'profile'>('none')
  const notifRef = useRef<HTMLDivElement>(null)
  const profRef = useRef<HTMLDivElement>(null)
  useClickOutside(notifRef, () => setMenu((m) => (m === 'notif' ? 'none' : m)), menu === 'notif')
  useClickOutside(profRef, () => setMenu((m) => (m === 'profile' ? 'none' : m)), menu === 'profile')
  const mine = state.notifications.filter((n) => n.user_role === role || n.user_role === 'all')
  const unread = mine.filter((n) => !n.read).length
  const user = session!.user

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <button className="-ml-1 rounded-lg p-2 text-ink lg:hidden" onClick={onMenu} aria-label="Open navigation">
        <Menu className="size-5" />
      </button>
      <div className="hidden flex-1 sm:block">
        <GlobalSearch />
      </div>
      <div className="flex-1 sm:hidden" />

      <div ref={notifRef} className="relative">
        <button
          onClick={() => setMenu((m) => (m === 'notif' ? 'none' : 'notif'))}
          className="relative rounded-lg p-2 text-ink-muted hover:bg-slate-100 hover:text-ink"
          aria-label={`Notifications, ${unread} unread`}
          aria-expanded={menu === 'notif'}
        >
          <Bell className="size-5" />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent-500 ring-2 ring-white" aria-hidden />}
        </button>
        {menu === 'notif' && (
          <div className="fixed inset-x-3 top-16 z-40 overflow-hidden rounded-xl border border-line bg-white shadow-[var(--shadow-pop)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <button className="text-xs font-medium text-tech-700 hover:underline" onClick={() => dispatch({ type: 'readAll' })}>Mark all read</button>
            </div>
            <div className="max-h-96 overflow-auto">
              <NotificationList items={mine.slice(0, 5)} compact onOpen={() => setMenu('none')} />
            </div>
            <Link to="/app/notifications" onClick={() => setMenu('none')} className="block border-t border-line px-4 py-2.5 text-center text-[13px] font-medium text-brand-800 hover:bg-slate-50">
              View all notifications
            </Link>
          </div>
        )}
      </div>

      <div ref={profRef} className="relative">
        <button onClick={() => setMenu((m) => (m === 'profile' ? 'none' : 'profile'))} className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-slate-100" aria-expanded={menu === 'profile'} aria-haspopup="menu">
          <Avatar name={user.name} size="sm" />
          <span className="hidden text-left md:block">
            <span className="block text-[13px] font-semibold leading-4 text-ink">{user.name}</span>
            <span className="block text-[11px] text-ink-subtle">{user.title ?? ROLE_LABEL[role]}</span>
          </span>
          <ChevronDown className="hidden size-4 text-ink-subtle md:block" aria-hidden />
        </button>
        {menu === 'profile' && (
          <div role="menu" className="absolute right-0 top-12 z-40 w-64 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-[var(--shadow-pop)]">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">{user.name}</p>
              <p className="truncate text-xs text-ink-subtle">{user.email}</p>
            </div>
            {DEMO_MODE && (
              <div className="border-b border-line px-2 py-2">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">Switch demo role</p>
                {(['institution', 'ngo', 'volunteer', 'admin'] as Role[]).map((r) => (
                  <button
                    key={r}
                    role="menuitem"
                    onClick={async () => {
                      setMenu('none')
                      await loginAsDemo(r)
                      navigate('/app')
                    }}
                    className={cn('flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-slate-50', r === role ? 'font-semibold text-brand-800' : 'text-ink-muted')}
                  >
                    {ROLE_LABEL[r]} {r === role && <span className="size-1.5 rounded-full bg-brand-600" />}
                  </button>
                ))}
              </div>
            )}
            {DEMO_MODE && (
              <button
                role="menuitem"
                onClick={() => {
                  dispatch({ type: 'reset' })
                  setMenu('none')
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-slate-50 hover:text-ink"
              >
                <RotateCcw className="size-4" aria-hidden /> Reset demo data
              </button>
            )}
            <Link role="menuitem" to="/app/settings" onClick={() => setMenu('none')} className="flex items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-slate-50 hover:text-ink">
              <Settings className="size-4" aria-hidden /> Settings
            </Link>
            <button
              role="menuitem"
              onClick={() => {
                logout()
                navigate('/')
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-slate-50 hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export function DashboardLayout() {
  const { session } = useAuth()
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()
  useEffect(() => setDrawer(false), [location.pathname])
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  const role = session.user.role

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white lg:block">
        <Sidebar role={role} />
      </aside>
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <motion.div className="absolute inset-0 bg-slate-900/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
            <motion.aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'tween', duration: 0.2 }}>
              <button className="absolute right-3 top-4 rounded-lg p-2 text-ink-muted hover:bg-slate-100" onClick={() => setDrawer(false)} aria-label="Close navigation">
                <X className="size-5" />
              </button>
              <Sidebar role={role} onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
      <div className="lg:pl-64">
        <Topbar role={role} onMenu={() => setDrawer(true)} />
        <main id="main" className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
