import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Mail, Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { GithubIcon, LinkedinIcon, XIcon } from '@/components/brand/Social'
import { ButtonLink } from '@/components/ui'
import { cn } from '@/utils/cn'

const LINKS = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'AI Platform', to: '/#ai' },
  { label: 'Impact', to: '/impact' },
  { label: 'For Institutions', to: '/#who' },
  { label: 'For NGOs', to: '/#who' },
  { label: 'About', to: '/about' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => setOpen(false), [pathname, hash])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={cn('sticky top-0 z-40 border-b transition-colors', scrolled || open ? 'border-line bg-white/90 backdrop-blur-md' : 'border-transparent bg-canvas/0')}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow">Skip to content</a>
      <nav className="container-page flex h-16 items-center justify-between gap-6" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <NavLink to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-ink', isActive && !l.to.includes('#') ? 'text-brand-800' : 'text-ink-muted')}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink to="/login" variant="ghost">Login</ButtonLink>
          <ButtonLink to="/register">Get Started</ButtonLink>
        </div>
        <button className="rounded-lg p-2 text-ink lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>
      {open && (
        <div id="mobile-nav" className="border-t border-line bg-white lg:hidden">
          <ul className="container-page flex flex-col py-3">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="block rounded-lg px-2 py-3 text-[15px] font-medium text-ink hover:bg-slate-50">{l.label}</Link>
              </li>
            ))}
            <li className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <ButtonLink to="/login" variant="outline">Login</ButtonLink>
              <ButtonLink to="/register">Get Started</ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

function Footer() {
  const cols = [
    { title: 'Platform', links: [['How It Works', '/how-it-works'], ['AI Platform', '/#ai'], ['Impact', '/impact'], ['Track a delivery', '/track/AS-2026-001284']] },
    { title: 'Organisation', links: [['About', '/about'], ['Partners', '/partners'], ['Food Safety', '/food-safety'], ['Contact', '/contact']] },
    { title: 'Get started', links: [['Explore Demo', '/login#demo'], ['Register', '/register'], ['Login', '/login']] },
  ]
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-[15px] font-semibold text-ink">From Surplus to Smiles</p>
          <p className="mt-2 text-sm text-ink-muted">Predict less waste. Redistribute more. Build a sustainable food ecosystem.</p>
          <div className="mt-5 flex gap-2">
            {[
              [GithubIcon, 'GitHub'],
              [LinkedinIcon, 'LinkedIn'],
              [XIcon, 'X (Twitter)'],
            ].map(([Icon, label]) => {
              const I = Icon as typeof GithubIcon
              return (
                <a key={label as string} href="#" aria-label={label as string} className="grid size-9 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
                  <I className="size-4" />
                </a>
              )
            })}
            <a href="mailto:hello@annasetu.example" aria-label="Email" className="grid size-9 place-items-center rounded-lg border border-line text-ink-muted transition-colors hover:border-line-strong hover:text-ink">
              <Mail className="size-4" />
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">{c.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-sm text-ink-muted hover:text-brand-800">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AnnaSetu. Prototype for Smart India Hackathon.</p>
          {/* <p>Figures shown across the site are demo data unless stated otherwise.</p> */}
        </div>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
