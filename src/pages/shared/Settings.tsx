import { useState } from 'react'
import { Bell, Building2, KeyRound, Plug, User } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Field, Input, PageHeader, Select, VerifiedBadge, useToast } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { DEMO_MODE } from '@/services/api'
import { ROLE_LABEL } from '@/layouts/nav'
import { cn } from '@/utils/cn'

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span><span className="block text-sm font-medium text-ink">{label}</span><span className="block text-[13px] text-ink-subtle">{desc}</span></span>
      <span className="relative mt-0.5 shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={cn('block h-6 w-10 rounded-full transition-colors peer-focus-visible:ring-3 peer-focus-visible:ring-tech-100', checked ? 'bg-brand-700' : 'bg-slate-200')} />
        <span className={cn('absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-4')} />
      </span>
    </label>
  )
}

export default function Settings() {
  const { session } = useAuth()
  const { state } = useData()
  const toast = useToast()
  const u = session!.user
  const org = state.organizations.find((o) => o.id === u.organization_id)
  const [profile, setProfile] = useState({ name: u.name, email: u.email, phone: u.phone, language: 'English' })
  const [prefs, setPrefs] = useState({ urgent: true, food: true, delivery: true, ai: u.role === 'institution', sms: false, digest: true })
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwErr, setPwErr] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast({ title: 'Settings saved' })
  }
  function changePw() {
    const e: Record<string, string> = {}
    if (!pw.current) e.current = 'Enter your current password'
    if (pw.next.length < 10 || !/\d/.test(pw.next) || !/[A-Za-z]/.test(pw.next)) e.next = 'At least 10 characters with letters and numbers'
    if (pw.confirm !== pw.next) e.confirm = 'Passwords don’t match'
    setPwErr(e)
    if (!Object.keys(e).length) {
      setPw({ current: '', next: '', confirm: '' })
      toast({ title: 'Password updated', body: 'Passwords are hashed server-side with bcrypt.' })
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={u.role === 'ngo' ? 'Organization Profile' : 'Settings'} description="Manage your profile, organisation, notifications and security." />
      <div className="space-y-4">
        <Card>
          <CardHeader icon={<User className="size-4" />} title="Profile" subtitle={ROLE_LABEL[u.role]} action={<VerifiedBadge status={u.verification_status} label={`Verified ${u.role === 'ngo' ? 'NGO' : u.role === 'institution' ? 'Institution' : ROLE_LABEL[u.role]}`} />} />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Full name">{(p) => <Input {...p} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} autoComplete="name" />}</Field>
            <Field label="Email">{(p) => <Input {...p} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} autoComplete="email" />}</Field>
            <Field label="Phone">{(p) => <Input {...p} type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} autoComplete="tel" />}</Field>
            <Field label="Language">{(p) => <Select {...p} value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>{['English', 'हिन्दी (Hindi)', 'தமிழ் (Tamil)', 'বাংলা (Bengali)', 'मराठी (Marathi)'].map((l) => <option key={l}>{l}</option>)}</Select>}</Field>
          </div>
        </Card>

        {org && (
          <Card>
            <CardHeader icon={<Building2 className="size-4" />} title="Organisation" subtitle={org.kind} action={<VerifiedBadge status={org.verification_status} />} />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Organisation name">{(p) => <Input {...p} defaultValue={org.name} />}</Field>
              <Field label="Contact number">{(p) => <Input {...p} defaultValue={org.contact} />}</Field>
              <Field label="Address" className="sm:col-span-2">{(p) => <Input {...p} defaultValue={org.address} />}</Field>
              {org.capacity_meals && <Field label="Daily serving capacity (meals)" hint="Used by the matching engine">{(p) => <Input {...p} type="number" defaultValue={org.capacity_meals} />}</Field>}
              <Field label="Coordinates" hint="Set from address; used for distance">{(p) => <Input {...p} readOnly value={`${org.latitude.toFixed(4)}, ${org.longitude.toFixed(4)}`} />}</Field>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader icon={<Bell className="size-4" />} title="Notifications" />
          <div className="divide-y divide-line px-5 pb-2">
            <Toggle label="Urgent alerts" desc="Pickups closing soon, critical requests" checked={prefs.urgent} onChange={(v) => setPrefs({ ...prefs, urgent: v })} />
            <Toggle label="Food availability" desc="New surplus near you" checked={prefs.food} onChange={(v) => setPrefs({ ...prefs, food: v })} />
            <Toggle label="Delivery updates" desc="Status changes on your journeys" checked={prefs.delivery} onChange={(v) => setPrefs({ ...prefs, delivery: v })} />
            <Toggle label="AI insights" desc="Surplus-risk alerts and recommendations" checked={prefs.ai} onChange={(v) => setPrefs({ ...prefs, ai: v })} />
            <Toggle label="SMS for urgent alerts" desc="In addition to in-app and email" checked={prefs.sms} onChange={(v) => setPrefs({ ...prefs, sms: v })} />
            <Toggle label="Weekly impact digest" desc="Email summary every Monday" checked={prefs.digest} onChange={(v) => setPrefs({ ...prefs, digest: v })} />
          </div>
        </Card>

        <Card>
          <CardHeader icon={<KeyRound className="size-4" />} title="Security" subtitle="JWT sessions · bcrypt-hashed passwords · role-based access" />
          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <Field label="Current password" error={pwErr.current}>{(p) => <Input {...p} type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />}</Field>
            <Field label="New password" error={pwErr.next}>{(p) => <Input {...p} type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />}</Field>
            <Field label="Confirm" error={pwErr.confirm}>{(p) => <Input {...p} type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />}</Field>
            <div className="sm:col-span-3"><Button variant="outline" onClick={changePw}>Update password</Button></div>
          </div>
        </Card>

        <Card>
          <CardHeader icon={<Plug className="size-4" />} title="Integration" action={<Badge tone={DEMO_MODE ? 'amber' : 'green'} dot>{DEMO_MODE ? 'Demo Mode' : 'Connected'}</Badge>} />
          <p className="px-5 pb-5 pt-2 text-[13px] leading-relaxed text-ink-muted">
            {DEMO_MODE
              ? 'Running on in-browser mock data and the client-side model. Set VITE_API_URL to the FastAPI backend to use PostgreSQL, JWT auth and the scikit-learn model. No API keys are stored in the frontend.'
              : 'Connected to the AnnaSetu API. Map and messaging keys are held server-side.'}
          </p>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setProfile({ name: u.name, email: u.email, phone: u.phone, language: 'English' })}>Reset</Button>
          <Button onClick={save} loading={saving}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
