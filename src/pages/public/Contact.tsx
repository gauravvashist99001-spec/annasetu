import { useState, type FormEvent } from 'react'
import { CheckCircle2, Mail, MapPin, MessageSquare } from 'lucide-react'
import { Button, Card, Field, Input, Select, Textarea } from '@/components/ui'
import { PublicHero } from './PublicHero'

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', topic: 'Join as an institution', message: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function submit(e: FormEvent) {
    e.preventDefault()
    const x: Record<string, string> = {}
    if (f.name.trim().length < 2) x.name = 'Enter your name'
    if (!/^\S+@\S+\.\S+$/.test(f.email)) x.email = 'Enter a valid email'
    if (f.message.trim().length < 10) x.message = 'Tell us a little more (10+ characters)'
    setErr(x)
    if (Object.keys(x).length) return
    setState('sending')
    await new Promise((r) => setTimeout(r, 900))
    setState('sent')
  }

  return (
    <>
      <PublicHero eyebrow="Contact" title="Let’s talk about your kitchen, your community or your city.">We usually reply within two working days.</PublicHero>
      <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-6">
          {[
            [Mail, 'Email', 'hello@annasetu.example'],
            [MapPin, 'Based in', 'New Delhi, India'],
            [MessageSquare, 'For judges & mentors', 'Use “Explore Demo” for a full walkthrough with demo data.'],
          ].map(([I, k, v]) => {
            const Icon = I as typeof Mail
            return (
              <li key={k as string} className="flex gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800"><Icon className="size-5" aria-hidden /></span><div><p className="text-sm font-semibold">{k as string}</p><p className="text-sm text-ink-muted">{v as string}</p></div></li>
            )
          })}
        </ul>
        <Card className="p-6">
          {state === 'sent' ? (
            <div className="py-10 text-center" role="status">
              <CheckCircle2 className="mx-auto size-10 text-brand-600" aria-hidden />
              <p className="mt-3 text-lg font-semibold">Message sent</p>
              <p className="mt-1 text-sm text-ink-muted">Thanks, {f.name.split(' ')[0]}. We’ll get back to you at {f.email}.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
              <Field label="Name" required error={err.name}>{(p) => <Input {...p} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}</Field>
              <Field label="Email" required error={err.email}>{(p) => <Input {...p} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />}</Field>
              <Field label="Topic" className="sm:col-span-2">{(p) => <Select {...p} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>{['Join as an institution', 'Join as an NGO', 'Volunteer', 'Partnership / CSR', 'Press', 'Other'].map((t) => <option key={t}>{t}</option>)}</Select>}</Field>
              <Field label="Message" required error={err.message} className="sm:col-span-2">{(p) => <Textarea {...p} rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />}</Field>
              <div className="sm:col-span-2"><Button type="submit" loading={state === 'sending'}>Send message</Button></div>
            </form>
          )}
        </Card>
      </section>
    </>
  )
}
