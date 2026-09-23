import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowDown, ArrowRight, BarChart3, BrainCircuit, CalendarClock, ChefHat, Cpu, Handshake, HeartHandshake, Hourglass, PackageSearch, Recycle,
  ScanSearch, ShieldCheck, Trash2, Truck, Unplug, Users, Warehouse, XCircle,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Reveal, SectionHeading } from './Reveal'

/* ------------------------------ Problem ------------------------------ */

const CAUSES = [
  { icon: ChefHat, title: 'Overproduction', text: 'Kitchens cook for a “normal day” — not for the day that actually happens.' },
  { icon: CalendarClock, title: 'Poor demand forecasting', text: 'Attendance swings with weekdays, exams, events and holidays.' },
  { icon: Warehouse, title: 'Inventory inefficiency', text: 'Stock isn’t tracked against consumption, so excess goes unnoticed.' },
  { icon: Hourglass, title: 'Short shelf life', text: 'Cooked food has a narrow safe-use window measured in hours.' },
  { icon: Unplug, title: 'Lack of coordination', text: 'Kitchens rarely know which verified organisation needs food right now.' },
  { icon: Truck, title: 'Delayed redistribution', text: 'By the time a pickup is arranged, the window has often closed.' },
]

function Flow({ steps, tone }: { steps: { label: string; icon: typeof ChefHat }[]; tone: 'bad' | 'good' }) {
  return (
    <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        const cls =
          tone === 'bad'
            ? last ? 'border-red-200 bg-danger-50 text-red-700' : 'border-line bg-white text-ink-muted'
            : s.label === 'AnnaSetu' ? 'border-brand-800 bg-brand-800 text-white' : s.label === 'AI Matching' ? 'border-tech-100 bg-tech-50 text-tech-700' : last ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-line bg-white text-ink'
        return (
          <li key={s.label} className="flex items-center gap-2 sm:flex-1">
            <Reveal delay={i * 0.08} className="w-full">
              <div className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-semibold sm:min-h-[96px] sm:flex-col sm:justify-center sm:gap-2 sm:px-2 sm:py-4 sm:text-center', cls)}>
                <s.icon className="size-5 shrink-0" aria-hidden />
                <span className="leading-tight">{s.label}</span>
              </div>
            </Reveal>
            {!last && (
              <>
                <ArrowRight className={cn('hidden size-4 shrink-0 sm:block', tone === 'bad' ? 'text-slate-300' : 'text-brand-600')} aria-hidden />
                <ArrowDown className={cn('mx-auto size-4 shrink-0 sm:hidden', tone === 'bad' ? 'text-slate-300' : 'text-brand-600')} aria-hidden />
              </>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function ProblemSection() {
  return (
    <section className="container-page py-20 sm:py-28" aria-labelledby="problem">
      <SectionHeading eyebrow="The problem" title={<span id="problem">The Problem Is Bigger Than Waste.</span>}>
        Edible food is thrown away in hostels, hospitals, hotels and canteens every day — not because nobody needs it, but because the system between the kitchen and the community is missing.
      </SectionHeading>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {CAUSES.map((c, i) => (
            <li key={c.title}>
              <Reveal delay={i * 0.05} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-50 text-accent-700"><c.icon className="size-[18px]" aria-hidden /></span>
                <div>
                  <p className="text-[15px] font-semibold text-ink">{c.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{c.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <div className="space-y-5">
          <div className="rounded-2xl border border-line bg-slate-50/80 p-5 sm:p-6">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-subtle"><XCircle className="size-4 text-danger" aria-hidden /> Today</p>
            <Flow tone="bad" steps={[{ label: 'Kitchen', icon: ChefHat }, { label: 'Excess Food', icon: PackageSearch }, { label: 'No Immediate Recipient', icon: Unplug }, { label: 'Food Waste', icon: Trash2 }]} />
          </div>
          <div className="rounded-2xl border border-brand-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-800"><Recycle className="size-4" aria-hidden /> With AnnaSetu</p>
            <Flow tone="good" steps={[{ label: 'Kitchen', icon: ChefHat }, { label: 'AnnaSetu', icon: Handshake }, { label: 'AI Matching', icon: Cpu }, { label: 'Verified Organization', icon: ShieldCheck }, { label: 'Community', icon: Users }]} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------ Solution ------------------------------ */

const FEATURES = [
  { n: '01', title: 'Predict', icon: BrainCircuit, text: 'AI estimates food demand using historical consumption and contextual data.', color: 'text-tech-600 bg-tech-50' },
  { n: '02', title: 'Prevent', icon: ShieldCheck, text: 'Institutions identify potential overproduction before it becomes waste.', color: 'text-tech-600 bg-tech-50' },
  { n: '03', title: 'Detect', icon: ScanSearch, text: 'Surplus food is registered digitally — quantity, prep time, storage and window.', color: 'text-accent-700 bg-accent-50' },
  { n: '04', title: 'Match', icon: Cpu, text: 'AI matches surplus with suitable verified organizations nearby.', color: 'text-tech-600 bg-tech-50' },
  { n: '05', title: 'Redistribute', icon: Truck, text: 'Volunteers and logistics partners coordinate pickup and delivery.', color: 'text-brand-800 bg-brand-50' },
  { n: '06', title: 'Measure', icon: BarChart3, text: 'Institutions track food saved and estimated social & environmental impact.', color: 'text-brand-800 bg-brand-50' },
]

export function SolutionSection() {
  return (
    <section className="border-y border-line bg-white py-20 sm:py-28" aria-labelledby="solution">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading eyebrow="The solution" title={<span id="solution">One Platform. The Complete Food Rescue Journey.</span>} />
          <Reveal>
            <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-ink-muted" aria-label="Predict, prevent, detect, match, redistribute, track, measure, improve">
              {['Predict', 'Prevent', 'Detect', 'Match', 'Redistribute', 'Track', 'Measure', 'Improve'].map((s, i, a) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn(i === a.length - 1 && 'text-brand-800')}>{s}</span>
                  {i < a.length - 1 && <span className="text-line-strong">→</span>}
                </span>
              ))}
            </p>
          </Reveal>
        </div>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <li key={f.n} className="group bg-white p-6 transition-colors hover:bg-slate-50/60 sm:p-7">
              <Reveal delay={i * 0.05}>
                <div className="flex items-center justify-between">
                  <span className={cn('grid size-11 place-items-center rounded-xl transition-transform group-hover:-translate-y-0.5', f.color)}><f.icon className="size-5" aria-hidden /></span>
                  <span className="num text-sm font-bold text-line-strong">{f.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{f.text}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------ How it works ------------------------------ */

export const STEPS = [
  { title: 'Institution registers surplus', text: 'Kitchen staff log food name, quantity, preparation time, storage condition and how long it remains usable.', icon: ChefHat, detail: 'Takes under a minute on mobile. Every field is timestamped for traceability.' },
  { title: 'AnnaSetu evaluates quantity, location and usable time', text: 'The platform checks the safe-use window, distance and quantity to decide who can realistically receive it.', icon: ScanSearch, detail: 'Listings with too little remaining time are flagged instead of matched.' },
  { title: 'Matching engine identifies suitable recipients', text: 'Verified NGOs are ranked by distance, requirement, quantity fit and time margin — with the score shown transparently.', icon: Cpu, detail: 'The institution confirms the recipient; the engine never auto-dispatches.' },
  { title: 'Volunteer accepts pickup', text: 'Nearby verified volunteers see the job with route, food and time remaining, and accept with one tap.', icon: HeartHandshake, detail: 'Status updates — picked up, in transit — stream back to both parties.' },
  { title: 'Food is delivered and impact is recorded', text: 'The recipient confirms receipt. Meals, kilograms and an estimated CO₂e figure are added to the impact ledger.', icon: BarChart3, detail: 'Each journey keeps a unique tracking ID, e.g. AS-2026-001284.' },
]

export function HowItWorksTimeline({ detailed }: { detailed?: boolean }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 60%'] })
  const height = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  return (
    <ol ref={ref} className="relative mx-auto max-w-3xl">
      <span className="absolute left-[23px] top-2 h-[calc(100%-2rem)] w-0.5 bg-line sm:left-[27px]" aria-hidden />
      <motion.span style={{ height }} className="absolute left-[23px] top-2 w-0.5 max-h-[calc(100%-2rem)] bg-brand-600 sm:left-[27px]" aria-hidden />
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 pb-10 last:pb-0 sm:gap-7">
          <Reveal delay={0.05} className="relative z-10">
            <span className="grid size-12 place-items-center rounded-2xl border border-line bg-white text-brand-800 shadow-[var(--shadow-card)] sm:size-14">
              <s.icon className="size-5 sm:size-6" aria-hidden />
            </span>
          </Reveal>
          <Reveal delay={0.1} className="pt-1">
            <p className="num text-xs font-bold tracking-wider text-brand-700">STEP {String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-1 text-lg font-semibold text-ink sm:text-xl">{s.title}</h3>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">{s.text}</p>
            {detailed && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[13px] text-ink-muted">{s.detail}</p>}
          </Reveal>
        </li>
      ))}
    </ol>
  )
}

export function HowItWorksSection() {
  return (
    <section id="how" className="container-page py-20 sm:py-28" aria-labelledby="how-title">
      <SectionHeading align="center" eyebrow="How AnnaSetu works" title={<span id="how-title">From kitchen to community in five steps.</span>}>
        Every step is logged, so institutions, recipients and volunteers see the same journey.
      </SectionHeading>
      <div className="mt-14">
        <HowItWorksTimeline />
      </div>
    </section>
  )
}
