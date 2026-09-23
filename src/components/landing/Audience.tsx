import { ArrowRight, Building2, Check, CheckCircle2, HandHeart, Home, ShieldAlert, Truck } from 'lucide-react'
import { ButtonLink } from '@/components/ui'
import { cn } from '@/utils/cn'
import { Reveal, SectionHeading } from './Reveal'

const AUDIENCES = [
  {
    icon: Building2, title: 'Institutions', who: 'Hostels · hospitals · hotels · canteens · food processors', cta: 'Register your kitchen', to: '/register?role=institution',
    points: ['Next-day demand forecasts per meal', 'Register surplus in under a minute', 'Waste & impact analytics for reporting'],
  },
  {
    icon: HandHeart, title: 'NGOs', who: 'Community kitchens · shelters · foundations', cta: 'Join as a recipient', to: '/register?role=ngo',
    points: ['See verified surplus nearby, live', 'Post requirements & get matched', 'Track every incoming delivery'],
  },
  {
    icon: Truck, title: 'Volunteers', who: 'Individuals · student groups · logistics partners', cta: 'Become a volunteer', to: '/register?role=volunteer',
    points: ['Pickups near you with time remaining', 'One-tap accept & status updates', 'Your personal impact record'],
  },
  {
    icon: Home, title: 'Communities', who: 'The people the food finally reaches', cta: 'See our impact', to: '/impact',
    points: ['More good meals, closer to home', 'Transparent, accountable sourcing', 'Less food in landfills'],
  },
]

export function AudienceSection() {
  return (
    <section id="who" className="border-t border-line bg-white py-20 sm:py-28" aria-labelledby="who-title">
      <div className="container-page">
        <SectionHeading align="center" eyebrow="Who can use AnnaSetu" title={<span id="who-title">Built for every link in the chain.</span>} />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <li key={a.title}>
              <Reveal delay={i * 0.06} className="flex h-full flex-col rounded-2xl border border-line p-6 transition-[border-color,box-shadow] hover:border-brand-200 hover:shadow-[var(--shadow-raised)]">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-800"><a.icon className="size-5" aria-hidden /></span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{a.title}</h3>
                <p className="mt-1 text-[13px] text-ink-subtle">{a.who}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {a.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-ink-muted"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden />{p}</li>
                  ))}
                </ul>
                <ButtonLink to={a.to} variant="ghost" size="sm" className="-ml-3 mt-5 self-start text-brand-800 hover:bg-brand-50 hover:text-brand-900" iconRight={<ArrowRight className="size-3.5" />}>
                  {a.cta}
                </ButtonLink>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export const SAFETY_CHECKS = [
  { label: 'Preparation time recorded', detail: 'Captured at registration; used to compute the remaining window.' },
  { label: 'Storage condition recorded', detail: 'Hot holding, refrigerated, room temperature or frozen.' },
  { label: 'Available-until time recorded', detail: 'Set by the food handler; the platform never extends it.' },
  { label: 'Recipient confirmed', detail: 'A verified organisation accepts before any pickup is dispatched.' },
]

export function SafetyChecklist({ className, interactive }: { className?: string; interactive?: boolean }) {
  return (
    <ul className={cn('divide-y divide-line rounded-2xl border border-line bg-white', className)}>
      {SAFETY_CHECKS.map((c) => (
        <li key={c.label} className="flex gap-3 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink">{c.label}</p>
            <p className="mt-0.5 text-[13px] text-ink-muted">{c.detail}</p>
          </div>
          {interactive && <span className="ml-auto self-center text-xs font-medium text-brand-700">Required</span>}
        </li>
      ))}
    </ul>
  )
}

export function SafetySection() {
  return (
    <section className="container-page py-20 sm:py-28" aria-labelledby="safety-title">
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Food safety" title={<span id="safety-title">Coordination you can audit. Responsibility that stays clear.</span>}>
            AnnaSetu records the information food handlers need to make safe decisions — and makes sure nothing moves without it.
          </SectionHeading>
          <Reveal delay={0.1}>
            <div className="mt-8 flex gap-3 rounded-xl border border-accent-100 bg-accent-50 p-4">
              <ShieldAlert className="mt-0.5 size-5 shrink-0 text-accent-700" aria-hidden />
              <p className="text-sm leading-relaxed text-ink-muted">
                <span className="font-semibold text-ink">AnnaSetu does not independently certify food as safe.</span> Donors and recipients remain responsible for
                following applicable food-safety regulations (e.g. FSSAI guidance) and for redistributing food only within an appropriate safe-use window.
              </p>
            </div>
            <ButtonLink to="/food-safety" variant="outline" className="mt-6" iconRight={<ArrowRight className="size-4" />}>Read our food safety approach</ButtonLink>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-subtle">Every listing must pass</p>
          <SafetyChecklist />
        </Reveal>
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="container-page pb-20 sm:pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-14 text-center sm:px-12 sm:py-20">
          <svg className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-brand-800" viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden>
            <path d="M0 200 Q600 -60 1200 200" fill="none" stroke="currentColor" strokeWidth="3" />
            {Array.from({ length: 13 }, (_, i) => {
              const t = (i + 1) / 14
              const x = t * 1200
              const y = (1 - t) ** 2 * 200 + 2 * (1 - t) * t * -60 + t ** 2 * 200
              return <line key={i} x1={x} y1={y} x2={x} y2={200} stroke="currentColor" strokeWidth="2" />
            })}
          </svg>
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-[40px]">Every Meal Saved Is a Step Toward a Better Future.</h2>
            <p className="mt-4 text-base text-brand-100 sm:text-lg">Join the network helping institutions reduce food waste and redirect surplus toward communities.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/register" size="lg" variant="accent">Join AnnaSetu</ButtonLink>
              <ButtonLink to="/login#demo" size="lg" variant="inverse" className="bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">Explore the Platform</ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
