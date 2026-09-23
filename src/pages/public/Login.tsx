import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FlaskConical, Lock, Mail } from 'lucide-react'
import { Button, Field, Input } from '@/components/ui'
import { DemoRolePicker } from '@/components/landing/DemoRolePicker'
import { useAuth } from '@/context/AuthContext'
import { DEMO_MODE } from '@/services/api'
import { AuthShell } from './AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address'
    if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    try {
      await login(email, password)
      navigate((location.state as { from?: string } | null)?.from ?? '/app')
    } catch (err) {
      setErrors({ form: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      aside={
        <>
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-200">From Surplus to Smiles</p>
            <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight">Predict less waste. Redistribute more.</h2>
          </div>
          <div className="relative">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-500"><FlaskConical className="size-3.5" aria-hidden /> Explore Demo</p>
            <DemoRolePicker layout="list" dark />
          </div>
        </>
      }
    >
      <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Sign in to your AnnaSetu account.</p>

      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        {errors.form && <p className="rounded-lg border border-red-200 bg-danger-50 px-3 py-2 text-sm text-red-700" role="alert">{errors.form}</p>}
        <Field label="Email" error={errors.email}>
          {(p) => (
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <Input {...p} type="email" autoComplete="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organisation.org" />
            </div>
          )}
        </Field>
        <Field label="Password" error={errors.password}>
          {(p) => (
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <Input {...p} type="password" autoComplete="current-password" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
        </Field>
        <div className="flex items-center justify-between text-[13px]">
          <label className="flex items-center gap-2 text-ink-muted"><input type="checkbox" className="accent-brand-700" /> Remember me</label>
          <a href="#" className="font-medium text-tech-700 hover:underline">Forgot password?</a>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={loading}>Sign in</Button>
      </form>
      {DEMO_MODE && <p className="mt-3 text-center text-xs text-ink-subtle">Demo: <code>institution.demo@annasetu.in</code> with any 6+ character password.</p>}

      <div id="demo" className="mt-10 lg:hidden">
        <div className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle"><span className="h-px flex-1 bg-line" />or explore the demo<span className="h-px flex-1 bg-line" /></div>
        <DemoRolePicker layout="list" />
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">New to AnnaSetu? <Link to="/register" className="font-semibold text-brand-800 hover:underline">Create an account</Link></p>
    </AuthShell>
  )
}
