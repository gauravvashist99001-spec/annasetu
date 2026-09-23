import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BadgeCheck, Building2, CheckCircle2, HandHeart, Truck } from 'lucide-react'
import type { Role } from '@/types'
import { Button, ButtonLink, Field, Input } from '@/components/ui'
import { api } from '@/services/api'
import { cn } from '@/utils/cn'
import { AuthShell } from './AuthShell'

const ROLES: { role: Role; label: string; icon: typeof Building2 }[] = [
  { role: 'institution', label: 'Institution', icon: Building2 },
  { role: 'ngo', label: 'NGO / Recipient', icon: HandHeart },
  { role: 'volunteer', label: 'Volunteer', icon: Truck },
]

function strength(pw: string) {
  let s = 0
  if (pw.length >= 10) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function Register() {
  const [params] = useSearchParams()
  const initial = (['institution', 'ngo', 'volunteer'].includes(params.get('role') ?? '') ? params.get('role') : 'institution') as Role
  const [role, setRole] = useState<Role>(initial)
  const [f, setF] = useState({ name: '', org: '', email: '', phone: '', password: '', terms: false })
  const [err, setErr] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const s = strength(f.password)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const x: Record<string, string> = {}
    if (f.name.trim().length < 2) x.name = 'Enter your full name'
    if (role !== 'volunteer' && f.org.trim().length < 3) x.org = 'Enter your organisation’s registered name'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email'
    if (!/^[+\d][\d\s-]{8,}$/.test(f.phone)) x.phone = 'Enter a valid phone number'
    if (s < 3) x.password = 'Use 10+ characters with upper & lower case and a number'
    if (!f.terms) x.terms = 'Please accept to continue'
    setErr(x)
    if (Object.keys(x).length) return
    setLoading(true)
    await api.register({ name: f.name, email: f.email, role, organization: f.org })
    setLoading(false)
    setDone(true)
  }

  const aside = (
    <div className="relative space-y-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">Verified network</p>
      <h2 className="max-w-md text-3xl font-bold leading-tight">Every participant is verified before they can transact.</h2>
      <ul className="space-y-3 text-[15px] text-brand-100">
        {['Submit your details and documents', 'Our team reviews within 2 working days', 'Get your verified badge and start'].map((t) => (
          <li key={t} className="flex gap-2"><BadgeCheck className="mt-0.5 size-5 shrink-0 text-brand-200" aria-hidden />{t}</li>
        ))}
      </ul>
    </div>
  )

  if (done)
    return (
      <AuthShell aside={aside}>
        <div className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700"><CheckCircle2 className="size-7" aria-hidden /></div>
          <h1 className="mt-5 text-2xl font-bold">Application received</h1>
          <p className="mt-2 text-sm text-ink-muted">We’ve sent a confirmation to <span className="font-medium text-ink">{f.email}</span>. Your account will be activated after verification.</p>
          <div className="mt-8 flex flex-col gap-2">
            <ButtonLink to="/login#demo">Explore the demo meanwhile</ButtonLink>
            <ButtonLink to="/" variant="ghost">Back to home</ButtonLink>
          </div>
        </div>
      </AuthShell>
    )

  return (
    <AuthShell aside={aside}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Join AnnaSetu</h1>
      <p className="mt-1 text-sm text-ink-muted">Create an account for your organisation or as a volunteer.</p>

      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <fieldset>
          <legend className="text-[13px] font-medium text-ink">I am joining as</legend>
          <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup">
            {ROLES.map((r) => (
              <button key={r.role} type="button" role="radio" aria-checked={role === r.role} onClick={() => setRole(r.role)} className={cn('flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors', role === r.role ? 'border-brand-700 bg-brand-50 text-brand-800 ring-2 ring-brand-100' : 'border-line text-ink-muted hover:border-line-strong')}>
                <r.icon className="size-5" aria-hidden />{r.label}
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Full name" required error={err.name}>{(p) => <Input {...p} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
        {role !== 'volunteer' && <Field label="Organisation name" required error={err.org}>{(p) => <Input {...p} autoComplete="organization" value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} />}</Field>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" required error={err.email}>{(p) => <Input {...p} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}</Field>
          <Field label="Phone" required error={err.phone}>{(p) => <Input {...p} type="tel" autoComplete="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91" />}</Field>
        </div>
        <Field label="Password" required error={err.password}>
          {(p) => (
            <div>
              <Input {...p} type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              <div className="mt-2 flex gap-1" aria-hidden>{[0, 1, 2, 3].map((i) => <span key={i} className={cn('h-1 flex-1 rounded-full', i < s ? (s >= 3 ? 'bg-brand-600' : 'bg-accent-500') : 'bg-line')} />)}</div>
              <p className="sr-only" aria-live="polite">Password strength {s} of 4</p>
            </div>
          )}
        </Field>
        <label className="flex items-start gap-2.5 text-[13px] text-ink-muted">
          <input type="checkbox" className="mt-0.5 size-4 accent-brand-700" checked={f.terms} onChange={(e) => setF({ ...f, terms: e.target.checked })} aria-invalid={!!err.terms} />
          <span>I agree to the terms, and understand that participants remain responsible for complying with applicable food-safety requirements.</span>
        </label>
        {err.terms && <p className="-mt-2 text-xs font-medium text-danger" role="alert">{err.terms}</p>}
        <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
      </form>
      <p className="mt-8 text-center text-sm text-ink-muted">Already registered? <Link to="/login" className="font-semibold text-brand-800 hover:underline">Sign in</Link></p>
    </AuthShell>
  )
}
