import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, HandHeart, Loader2, ShieldCheck, Truck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import type { Role } from '@/types'
import { cn } from '@/utils/cn'

const ROLES: { role: Role; label: string; desc: string; icon: typeof Building2 }[] = [
  { role: 'institution', label: 'Institution Demo', desc: 'Forecasts, register surplus, analytics', icon: Building2 },
  { role: 'ngo', label: 'NGO Demo', desc: 'Browse nearby food, request, track', icon: HandHeart },
  { role: 'volunteer', label: 'Volunteer Demo', desc: 'Accept pickups, update delivery', icon: Truck },
  { role: 'admin', label: 'Admin Demo', desc: 'Verify orgs, monitor transactions', icon: ShieldCheck },
]

export function DemoRolePicker({ layout = 'grid', dark }: { layout?: 'grid' | 'list'; dark?: boolean }) {
  const { loginAsDemo } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<Role | null>(null)
  return (
    <ul className={cn('grid gap-2.5', layout === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2')}>
      {ROLES.map((r) => (
        <li key={r.role}>
          <button
            type="button"
            disabled={!!busy}
            onClick={async () => {
              setBusy(r.role)
              await loginAsDemo(r.role)
              navigate('/app')
            }}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-[border-color,box-shadow,background] disabled:opacity-60',
              dark ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-line bg-white hover:border-brand-200 hover:shadow-[var(--shadow-raised)]',
            )}
          >
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-lg', dark ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand-800')}>
              {busy === r.role ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <r.icon className="size-5" aria-hidden />}
            </span>
            <span className="min-w-0 flex-1">
              <span className={cn('block text-sm font-semibold', dark ? 'text-white' : 'text-ink')}>{r.label}</span>
              <span className={cn('mt-0.5 block text-xs leading-snug', dark ? 'text-slate-300' : 'text-ink-subtle')}>{r.desc}</span>
            </span>
            <ArrowRight className={cn('size-4 shrink-0 transition-transform group-hover:translate-x-0.5', dark ? 'text-slate-300' : 'text-ink-subtle')} aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  )
}
