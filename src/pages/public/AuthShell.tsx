import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

export function AuthShell({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1 text-[13px] font-medium text-ink-muted hover:text-ink"><ArrowLeft className="size-4" /> Home</Link>
        </div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</main>
        <p className="text-center text-xs text-ink-subtle">© 2026 AnnaSetu · Prototype for Smart India Hackathon</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <svg className="pointer-events-none absolute -bottom-10 left-0 w-full text-brand-800" viewBox="0 0 600 300" aria-hidden>
          <path d="M0 300 Q300 -40 600 300" fill="none" stroke="currentColor" strokeWidth="3" />
          {Array.from({ length: 11 }, (_, i) => {
            const t = (i + 1) / 12
            const x = t * 600
            const y = (1 - t) ** 2 * 300 + 2 * (1 - t) * t * -40 + t ** 2 * 300
            return <line key={i} x1={x} y1={y} x2={x} y2={300} stroke="currentColor" strokeWidth="2" />
          })}
        </svg>
        {aside}
      </aside>
    </div>
  )
}
