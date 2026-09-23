import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, BrainCircuit, Building2, CalendarDays, Clock, Cpu, Database, Filter, Layers, Lightbulb, MapPin, PackageOpen, RefreshCw, Repeat, Soup,
  Sparkles, Thermometer, TrendingUp, Users,
} from 'lucide-react'
import { Badge, Button, ButtonLink, DemoTag, RiskBadge } from '@/components/ui'
import { BacktestChart, TomorrowForecast, overallRisk } from '@/components/dashboard/Forecast'
import { MatchList, MatchingMethodNote } from '@/components/dashboard/MatchList'
import { DeliveryTimeline } from '@/components/dashboard/DeliveryTimeline'
import { ModelLabel } from '@/components/dashboard/InsightCards'
import { TimeSeriesChart } from '@/components/charts/Charts'
import { useDemandModel } from '@/hooks/useDemandModel'
import { forecast, isoDate } from '@/services/prediction'
import { scoreCandidates } from '@/services/matching'
import { organizations, orgById } from '@/data/organizations'
import { deliveries, listings, requests } from '@/data/operations'
import { monthlyRescued, platformStats } from '@/data/impact'
import { fmtNum, fmtTime, timeRemaining } from '@/utils/format'
import { Reveal, SectionHeading } from './Reveal'

/* ------------------------------ AI Demand Prediction ------------------------------ */

const INPUTS = [
  { icon: Database, label: 'Historical consumption' },
  { icon: Users, label: 'Expected headcount' },
  { icon: CalendarDays, label: 'Day of week' },
  { icon: Sparkles, label: 'Events' },
  { icon: TrendingUp, label: 'Seasonal patterns' },
  { icon: PackageOpen, label: 'Inventory' },
  { icon: Repeat, label: 'Previous surplus' },
  { icon: Layers, label: 'Food category' },
]
const PIPELINE = ['Historical data', 'Preprocessing', 'Feature engineering', 'ML model', 'Demand prediction', 'Surplus risk', 'Recommendation']

export function AISection() {
  const model = useDemandModel()
  const preds = useMemo(() => forecast(model, isoDate(1)), [model])
  const lunch = preds.find((p) => p.meal_type === 'lunch')!
  const m = model.meals.lunch

  return (
    <section id="ai" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28" aria-labelledby="ai-title">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
      <div className="container-page relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-200">AI demand prediction</p>
            <h2 id="ai-title" className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight sm:text-4xl">AI That Helps Prevent Waste Before It Happens.</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-[17px]">
              The cheapest meal to redistribute is the one that was never over-cooked. AnnaSetu learns each kitchen’s demand pattern and flags likely surplus a day ahead.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">What the model analyses</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {INPUTS.map((i) => (
                <li key={i.label} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[13px] text-slate-200">
                  <i.icon className="size-3.5 text-brand-200" aria-hidden /> {i.label}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-slate-400">Pipeline</p>
            <ol className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px]">
              {PIPELINE.map((p, i) => (
                <li key={p} className="flex items-center gap-1.5">
                  <span className={i >= 4 ? 'rounded-md bg-tech-600/20 px-2 py-1 font-medium text-blue-200' : 'rounded-md bg-white/5 px-2 py-1 text-slate-300'}>{p}</span>
                  {i < PIPELINE.length - 1 && <ArrowRight className="size-3 text-slate-500" aria-hidden />}
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[13px] leading-relaxed text-slate-400">
              The prototype trains a ridge-regression model per meal on {model.history.length / 3} days of demo kitchen logs, right in your browser.
              On a {model.holdoutDays}-day hold-out it reached ~{m.mape.toFixed(1)}% mean error for lunch, versus ~{m.baselineMape.toFixed(1)}% gap between what was cooked and what was eaten.
              It is a demonstration model — not production-accurate.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-white/10 bg-white p-4 text-ink shadow-2xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-[15px] font-semibold"><BrainCircuit className="size-4 text-tech-600" aria-hidden /> Tomorrow’s Expected Meals</p>
                <p className="text-xs text-ink-subtle">Delhi University Hostel · live model output</p>
              </div>
              <DemoTag />
            </div>
            <div className="mt-4">
              <TomorrowForecast predictions={preds} compact />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded-xl border border-line bg-slate-50 p-3">
                <p className="text-xs text-ink-muted">Predicted surplus risk</p>
                <div className="mt-1.5"><RiskBadge risk={overallRisk(preds)} /></div>
              </div>
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
                <p className="flex items-center gap-1 text-xs text-brand-800"><Lightbulb className="size-3.5" aria-hidden /> Recommended preparation</p>
                <p className="num mt-1 text-lg font-bold text-brand-800">Lunch {lunch.recommendation_pct < 0 ? `↓ ${Math.abs(lunch.recommendation_pct)}%` : 'as planned'}</p>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[13px] font-semibold text-ink">Lunch — actual vs predicted (hold-out)</p>
              <BacktestChart model={model} height={190} />
            </div>
            <ModelLabel className="mt-3" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------ Smart matching ------------------------------ */

export function MatchingSection() {
  const listing = listings[0]
  const source = orgById(listing.organization_id)
  const candidates = useMemo(() => scoreCandidates(listing, source, organizations, requests), [listing, source])
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!started) return
    setPhase('scanning')
    const t = setTimeout(() => setPhase('done'), 1500)
    return () => clearTimeout(t)
  }, [started])

  return (
    <section className="container-page py-20 sm:py-28" aria-labelledby="match-title">
      <SectionHeading eyebrow="Smart surplus matching" title={<span id="match-title">The right food, to the right place, in time.</span>}>
        Matching weighs distance, quantity, the recipient’s stated requirement and the time left in the safe-use window — and shows its working.
      </SectionHeading>

      <Reveal className="mt-12">
        <motion.div onViewportEnter={() => setStarted(true)} viewport={{ once: true, margin: '-120px' }} className="grid items-start gap-4 lg:grid-cols-[0.9fr_auto_1.3fr] lg:gap-6">
          {/* Surplus */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-700">Available surplus</p>
              <DemoTag />
            </div>
            <p className="mt-3 text-xl font-bold text-ink">{listing.food_name}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                [Soup, 'Quantity', `${listing.servings} meals`],
                [Clock, 'Prepared', fmtTime(listing.prepared_at)],
                [Thermometer, 'Safe-use window', timeRemaining(listing.available_until)],
                [MapPin, 'Location', source.name],
              ].map(([Icon, k, v]) => {
                const I = Icon as typeof Soup
                return (
                  <div key={k as string} className="rounded-lg bg-slate-50 p-2.5">
                    <dt className="flex items-center gap-1 text-[11px] text-ink-subtle"><I className="size-3" aria-hidden />{k as string}</dt>
                    <dd className="mt-0.5 truncate font-semibold text-ink">{v as string}</dd>
                  </div>
                )
              })}
            </dl>
          </div>

          {/* Engine */}
          <div className="flex items-center justify-center lg:h-full lg:flex-col">
            <div className="relative grid size-20 place-items-center rounded-2xl bg-tech-600 text-white shadow-[0_10px_30px_-10px_rgb(37_99_235/0.6)]">
              {phase === 'scanning' && <span className="absolute inset-0 rounded-2xl bg-tech-500 animate-pulse-ring" aria-hidden />}
              <Cpu className="relative size-8" aria-hidden />
            </div>
            <p className="ml-3 text-sm font-semibold text-ink lg:ml-0 lg:mt-3">AnnaSetu AI</p>
            <p className="sr-only" aria-live="polite">{phase === 'scanning' ? 'Scanning recipients' : phase === 'done' ? `${candidates.length} matches found` : ''}</p>
          </div>

          {/* Results */}
          <div className="min-h-[300px] rounded-2xl border border-line bg-slate-50/60 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-subtle">Potential matches</p>
              <Button size="sm" variant="ghost" icon={<RefreshCw className="size-3.5" />} onClick={() => { setPhase('scanning'); setTimeout(() => setPhase('done'), 1400) }}>
                Re-run
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {phase !== 'done' ? (
                <motion.div key="scan" exit={{ opacity: 0 }} className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-[104px] animate-pulse rounded-xl border border-line bg-white" />
                  ))}
                  <p className="flex items-center justify-center gap-2 pt-1 text-[13px] text-ink-subtle"><Filter className="size-3.5" aria-hidden /> Filtering verified recipients within the safe-use window…</p>
                </motion.div>
              ) : (
                <motion.div key="res" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <MatchList candidates={candidates} limit={3} />
                  <div className="mt-4"><MatchingMethodNote /></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Reveal>
    </section>
  )
}

/* ------------------------------ Track every journey ------------------------------ */

export function TrackSection() {
  const d = deliveries[0]
  return (
    <section className="border-y border-line bg-white py-20 sm:py-28" aria-labelledby="track-title">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading eyebrow="Track every journey" title={<span id="track-title">Every meal has a tracking ID.</span>}>
          From the moment surplus is registered to the moment it’s received, each hand-off is timestamped. Institutions, recipients and volunteers see one shared, auditable record.
        </SectionHeading>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-line bg-canvas p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-ink-subtle">Tracking ID</p>
                <p className="num font-mono text-lg font-bold tracking-tight text-ink">{d.tracking_id}</p>
              </div>
              <Badge tone="amber" dot>In transit</Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white p-3 text-[13px]">
              <Building2 className="size-4 shrink-0 text-brand-700" aria-hidden />
              <span className="truncate font-medium">{orgById(d.source_id).name}</span>
              <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              <span className="truncate font-medium">{orgById(d.recipient_id).name}</span>
              <span className="num ml-auto shrink-0 text-ink-subtle">{d.meals} meals</span>
            </div>
            <div className="mt-6">
              <DeliveryTimeline delivery={d} orientation="horizontal" />
            </div>
            <ButtonLink to={`/track/${d.tracking_id}`} variant="outline" className="mt-6 w-full sm:w-auto" iconRight={<ArrowRight className="size-4" />}>
              Open traceability page
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------ Impact preview ------------------------------ */

export function ImpactPreview() {
  const kg = platformStats.food_diverted_kg
  return (
    <section className="container-page py-20 sm:py-28" aria-labelledby="impact-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="Impact dashboard" title={<span id="impact-title">Measured, not claimed.</span>}>
          Impact is computed from confirmed deliveries only. Environmental figures are estimates with the method shown.
        </SectionHeading>
        <Reveal><ButtonLink to="/impact" variant="outline" iconRight={<ArrowRight className="size-4" />}>Full impact dashboard</ButtonLink></Reveal>
      </div>
      <Reveal delay={0.1} className="mt-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {[
              ['Meals rescued', fmtNum(platformStats.meals_rescued)],
              ['Food saved', `${fmtNum(kg)} kg`],
              ['Organisations helped', String(platformStats.organizations_helped)],
              ['Est. CO₂e avoided*', `~${(kg * 2.5 / 1000).toFixed(1)} t`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line bg-white p-4">
                <p className="text-[13px] text-ink-muted">{k}</p>
                <p className="num mt-1 text-2xl font-bold text-ink">{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-ink">Monthly meals rescued</p>
              <DemoTag />
            </div>
            <TimeSeriesChart data={monthlyRescued} xKey="month" series={[{ key: 'meals', label: 'Meals rescued', area: true }]} height={250} unit=" meals" caption="Monthly meals rescued" />
            <p className="mt-2 text-xs text-ink-subtle">*Estimate: kg food × 2.5 kg CO₂e/kg (illustrative lifecycle factor). See methodology on the Impact page.</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
