import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Cpu, MapPin, PackageCheck, Search, ShieldCheck } from 'lucide-react'
import type { FoodCategory, FoodListing, MatchCandidate, StorageCondition } from '@/types'
import { Button, ButtonLink, Card, Field, Input, PageHeader, Select, Textarea, useToast } from '@/components/ui'
import { MatchList, MatchingMethodNote } from '@/components/dashboard/MatchList'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { api } from '@/services/api'
import { cn } from '@/utils/cn'
import { fmtDateTime, timeRemaining } from '@/utils/format'

const CATEGORIES: FoodCategory[] = ['Cooked Meals', 'Rice & Grains', 'Dal & Curries', 'Breads & Bakery', 'Fruits & Vegetables', 'Packaged', 'Dairy']
const STORAGE: StorageCondition[] = ['Hot holding (>60°C)', 'Refrigerated (<5°C)', 'Room temperature', 'Frozen']
const STEPS = ['Food details', 'Preparation', 'Location', 'Confirm']

const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

type Form = { food_name: string; category: FoodCategory; quantity_kg: string; servings: string; prepared_at: string; available_until: string; storage_condition: StorageCondition; pickup_location: string; contact_person: string; phone: string; notes: string; ack: boolean }

function validate(step: number, f: Form): Record<string, string> {
  const e: Record<string, string> = {}
  if (step === 0) {
    if (f.food_name.trim().length < 3) e.food_name = 'Describe the food (at least 3 characters)'
    if (!(Number(f.quantity_kg) > 0)) e.quantity_kg = 'Enter the quantity in kg'
    else if (Number(f.quantity_kg) > 2000) e.quantity_kg = 'For more than 2 tonnes, contact the admin team'
    if (!(Number(f.servings) >= 5)) e.servings = 'Minimum 5 servings for redistribution'
  }
  if (step === 1) {
    const prep = new Date(f.prepared_at).getTime()
    const until = new Date(f.available_until).getTime()
    if (!f.prepared_at) e.prepared_at = 'Required'
    else if (prep > Date.now() + 5 * 60000) e.prepared_at = 'Preparation time can’t be in the future'
    if (!f.available_until) e.available_until = 'Required'
    else if (until <= prep) e.available_until = 'Must be after preparation time'
    else if (until < Date.now() + 45 * 60000) e.available_until = 'Needs at least 45 minutes remaining for pickup & delivery'
  }
  if (step === 2) {
    if (f.pickup_location.trim().length < 5) e.pickup_location = 'Enter a pickup point volunteers can find'
    if (f.contact_person.trim().length < 2) e.contact_person = 'Required'
    if (!/^[+\d][\d\s-]{8,}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number'
  }
  if (step === 3 && !f.ack) e.ack = 'Please confirm to continue'
  return e
}

export default function RegisterSurplus() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const toast = useToast()
  const orgId = session!.user.organization_id!
  const org = state.organizations.find((o) => o.id === orgId)!

  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'form' | 'searching' | 'results' | 'done'>('form')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [candidates, setCandidates] = useState<MatchCandidate[]>([])
  const [selected, setSelected] = useState<string>()
  const [listingId, setListingId] = useState<string>()
  const [confirming, setConfirming] = useState(false)
  const [f, setF] = useState<Form>(() => ({
    food_name: '', category: 'Cooked Meals', quantity_kg: '', servings: '',
    prepared_at: toLocal(new Date(Date.now() - 30 * 60000)), available_until: toLocal(new Date(Date.now() + 3 * 3600000)),
    storage_condition: 'Hot holding (>60°C)', pickup_location: 'Hostel Mess Block B, North Campus', contact_person: session!.user.name, phone: session!.user.phone, notes: '', ack: false,
  }))
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }))

  const windowHours = (new Date(f.available_until).getTime() - new Date(f.prepared_at).getTime()) / 3600000
  const longWindowWarning = f.storage_condition === 'Room temperature' && ['Cooked Meals', 'Rice & Grains', 'Dal & Curries'].includes(f.category) && windowHours > 4

  const delivery = useMemo(() => state.deliveries.find((d) => d.food_listing_id === listingId), [state.deliveries, listingId])

  function next() {
    const e = validate(step, f)
    setErrors(e)
    if (Object.keys(e).length) return
    setStep((s) => Math.min(3, s + 1))
  }

  async function findRecipient() {
    const e = validate(3, f)
    setErrors(e)
    if (Object.keys(e).length) return
    const listing: FoodListing = {
      id: `fl-${Date.now()}`, organization_id: orgId, food_name: f.food_name.trim(), category: f.category, quantity_kg: Number(f.quantity_kg), servings: Number(f.servings),
      prepared_at: new Date(f.prepared_at).toISOString(), available_until: new Date(f.available_until).toISOString(), storage_condition: f.storage_condition,
      status: 'available', contact_person: f.contact_person, pickup_location: f.pickup_location, created_at: new Date().toISOString(),
    }
    dispatch({ type: 'addListing', listing })
    setListingId(listing.id)
    setPhase('searching')
    const res = await api.findMatches(listing, state.organizations)
    setCandidates(res)
    setSelected(res[0]?.recipient.id)
    setPhase('results')
  }

  async function confirm() {
    const c = candidates.find((x) => x.recipient.id === selected)
    if (!c || !listingId) return
    setConfirming(true)
    await new Promise((r) => setTimeout(r, 700))
    dispatch({ type: 'confirmMatch', listingId, candidate: c })
    setConfirming(false)
    setPhase('done')
    toast({ title: 'Recipient confirmed', body: `${c.recipient.name} notified. Nearby volunteers can now accept the pickup.` })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Register Surplus" description="Log safe, surplus food. AnnaSetu finds verified recipients who can use it within its window." />

      {phase === 'form' && (
        <>
          {/* Stepper */}
          <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Progress">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-col gap-2">
                <div className={cn('h-1 rounded-full transition-colors', i <= step ? 'bg-brand-600' : 'bg-line')} />
                <span className={cn('flex items-center gap-1.5 text-xs font-medium', i === step ? 'text-ink' : i < step ? 'text-brand-700' : 'text-ink-subtle')} aria-current={i === step ? 'step' : undefined}>
                  <span className={cn('grid size-5 place-items-center rounded-full text-[10px] font-bold', i < step ? 'bg-brand-600 text-white' : i === step ? 'bg-ink text-white' : 'bg-slate-100 text-ink-subtle')}>
                    {i < step ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </span>
              </li>
            ))}
          </ol>

          <Card className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <h2 className="mb-5 text-lg font-semibold text-ink">Step {step + 1}: {STEPS[step]}</h2>

                {step === 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Food name" required error={errors.food_name} className="sm:col-span-2">{(p) => <Input {...p} autoFocus value={f.food_name} onChange={(e) => set('food_name', e.target.value)} placeholder="e.g. Veg biryani with raita" />}</Field>
                    <Field label="Category" required>{(p) => <Select {...p} value={f.category} onChange={(e) => set('category', e.target.value as FoodCategory)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>}</Field>
                    <Field label="Quantity (kg)" required error={errors.quantity_kg}>{(p) => <Input {...p} type="number" inputMode="decimal" min={0} step="0.5" value={f.quantity_kg} onChange={(e) => set('quantity_kg', e.target.value)} placeholder="48" />}</Field>
                    <Field label="Number of servings" required error={errors.servings} hint="Approximate meals this will provide" className="sm:col-span-2">{(p) => <Input {...p} type="number" inputMode="numeric" min={0} value={f.servings} onChange={(e) => set('servings', e.target.value)} placeholder="120" />}</Field>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Preparation date & time" required error={errors.prepared_at}>{(p) => <Input {...p} type="datetime-local" value={f.prepared_at} onChange={(e) => set('prepared_at', e.target.value)} />}</Field>
                    <Field label="Available until" required error={errors.available_until} hint="Set by the food handler; never extended by the platform">{(p) => <Input {...p} type="datetime-local" value={f.available_until} onChange={(e) => set('available_until', e.target.value)} />}</Field>
                    <Field label="Storage condition" required className="sm:col-span-2">{(p) => <Select {...p} value={f.storage_condition} onChange={(e) => set('storage_condition', e.target.value as StorageCondition)}>{STORAGE.map((s) => <option key={s}>{s}</option>)}</Select>}</Field>
                    {longWindowWarning && (
                      <p className="flex gap-2 rounded-lg border border-accent-100 bg-accent-50 p-3 text-[13px] text-ink-muted sm:col-span-2" role="status">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-700" aria-hidden />
                        Cooked food at room temperature with a {windowHours.toFixed(1)}-hour window will be flagged for recipient review. Please check this against applicable food-safety guidance.
                      </p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Pickup location" required error={errors.pickup_location} className="sm:col-span-2">{(p) => <Input {...p} value={f.pickup_location} onChange={(e) => set('pickup_location', e.target.value)} />}</Field>
                    <Field label="Contact person" required error={errors.contact_person}>{(p) => <Input {...p} value={f.contact_person} onChange={(e) => set('contact_person', e.target.value)} autoComplete="name" />}</Field>
                    <Field label="Phone" required error={errors.phone}>{(p) => <Input {...p} type="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />}</Field>
                    <Field label="Handover notes" hint="Optional — gate, dock, containers to return, etc." className="sm:col-span-2">{(p) => <Textarea {...p} value={f.notes} onChange={(e) => set('notes', e.target.value)} />}</Field>
                    <p className="flex items-center gap-1.5 text-xs text-ink-subtle sm:col-span-2"><MapPin className="size-3.5" aria-hidden /> Registered address: {org.address}</p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                      {[
                        ['Food', f.food_name],
                        ['Category', f.category],
                        ['Quantity', `${f.quantity_kg} kg · ${f.servings} servings`],
                        ['Storage', f.storage_condition],
                        ['Prepared', fmtDateTime(new Date(f.prepared_at).toISOString())],
                        ['Available until', `${fmtDateTime(new Date(f.available_until).toISOString())} (${timeRemaining(new Date(f.available_until).toISOString())} left)`],
                        ['Pickup', f.pickup_location],
                        ['Contact', `${f.contact_person} · ${f.phone}`],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-white p-3">
                          <dt className="text-xs text-ink-subtle">{k}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="rounded-xl border border-line p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink"><ShieldCheck className="size-4 text-brand-700" aria-hidden /> Food safety checklist</p>
                      <ul className="mt-3 grid gap-2 text-[13px] text-ink-muted sm:grid-cols-2">
                        {['Preparation time recorded', 'Storage condition recorded', 'Available-until time recorded', 'Recipient confirmed (next step)'].map((c, i) => (
                          <li key={c} className="flex items-center gap-2">
                            {i < 3 ? <CheckCircle2 className="size-4 text-brand-600" aria-hidden /> : <span className="size-4 rounded-full border-2 border-dashed border-line-strong" aria-hidden />}
                            {c}
                          </li>
                        ))}
                      </ul>
                      <label className="mt-4 flex items-start gap-2.5 text-[13px] text-ink">
                        <input type="checkbox" className="mt-0.5 size-4 accent-brand-700" checked={f.ack} onChange={(e) => set('ack', e.target.checked)} aria-invalid={!!errors.ack} />
                        <span>I confirm this food has been handled per applicable food-safety requirements and is suitable for redistribution within the stated window. I understand AnnaSetu coordinates but does not certify food safety.</span>
                      </label>
                      {errors.ack && <p className="mt-1.5 text-xs font-medium text-danger" role="alert">{errors.ack}</p>}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <Button variant="ghost" onClick={() => { setErrors({}); setStep((s) => Math.max(0, s - 1)) }} disabled={step === 0} icon={<ArrowLeft className="size-4" />}>Back</Button>
              {step < 3 ? (
                <Button onClick={next} iconRight={<ArrowRight className="size-4" />}>Continue</Button>
              ) : (
                <Button onClick={findRecipient} icon={<Search className="size-4" />}>Find Recipient</Button>
              )}
            </div>
          </Card>
        </>
      )}

      {phase === 'searching' && (
        <Card className="flex flex-col items-center px-6 py-16 text-center" aria-live="polite">
          <div className="relative grid size-20 place-items-center rounded-2xl bg-tech-600 text-white">
            <span className="absolute inset-0 rounded-2xl bg-tech-500 animate-pulse-ring" aria-hidden />
            <Cpu className="relative size-9" aria-hidden />
          </div>
          <p className="mt-6 text-lg font-semibold text-ink">Searching for verified recipients…</p>
          <ul className="mt-4 space-y-1.5 text-[13px] text-ink-muted">
            {['Checking safe-use window & travel time', 'Filtering to verified organisations', 'Scoring distance, quantity and requirement'].map((t, i) => (
              <motion.li key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.45 }} className="flex items-center justify-center gap-2">
                <Check className="size-3.5 text-brand-600" aria-hidden /> {t}
              </motion.li>
            ))}
          </ul>
        </Card>
      )}

      {phase === 'results' && (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">{candidates.length} suitable recipients found</h2>
              <p className="text-[13px] text-ink-subtle">{f.food_name} · {f.servings} servings · {timeRemaining(new Date(f.available_until).toISOString())} left</p>
            </div>
          </div>
          <div className="mt-5">
            {candidates.length ? (
              <MatchList candidates={candidates} selected={selected} onSelect={setSelected} />
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-ink-muted">No verified recipient can be reached within the window. Consider extending only if food-safety guidance allows, or contact an admin.</p>
            )}
          </div>
          <div className="mt-4"><MatchingMethodNote /></div>
          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <ButtonLink to="/app/redistribution" variant="outline">Decide later</ButtonLink>
            <Button onClick={confirm} loading={confirming} disabled={!selected}>Confirm recipient</Button>
          </div>
        </Card>
      )}

      {phase === 'done' && (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-700">
            <PackageCheck className="size-8" aria-hidden />
          </motion.div>
          <h2 className="mt-5 text-xl font-bold text-ink">Match confirmed</h2>
          <p className="mt-1 max-w-md text-sm text-ink-muted">{candidates.find((c) => c.recipient.id === selected)?.recipient.name} has been notified and the pickup is visible to nearby verified volunteers.</p>
          {delivery && (
            <p className="mt-5 rounded-lg border border-line bg-slate-50 px-4 py-2">
              <span className="text-xs text-ink-subtle">Tracking ID</span>
              <span className="num ml-2 font-mono font-bold text-ink">{delivery.tracking_id}</span>
            </p>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {delivery && <ButtonLink to={`/app/track/${delivery.tracking_id}`}>Track delivery</ButtonLink>}
            <Button variant="outline" onClick={() => { setPhase('form'); setStep(0); setF((s) => ({ ...s, food_name: '', quantity_kg: '', servings: '', ack: false })) }}>Register another</Button>
          </div>
          <Link to="/app" className="mt-4 text-[13px] font-medium text-ink-subtle hover:text-ink">Back to overview</Link>
        </Card>
      )}
    </div>
  )
}
