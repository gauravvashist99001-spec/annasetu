import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, PlayCircle, Sparkles } from 'lucide-react'
import { ButtonLink, DemoTag } from '@/components/ui'
import { useCountUp } from '@/hooks/useCountUp'
import { useInView } from '@/hooks/useInView'
import { platformStats } from '@/data/impact'
import { EcosystemVisual } from './EcosystemVisual'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(60%_60%_at_70%_20%,rgb(220_252_231/0.7),transparent_70%)]" aria-hidden />
      <div className="container-page relative grid items-center gap-12 pb-12 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-20 lg:pt-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-800 shadow-sm"
          >
            <Sparkles className="size-3.5 text-tech-600" aria-hidden /> AI-Powered Food Redistribution
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="mt-5 text-[34px] font-extrabold leading-[1.06] tracking-[-0.025em] text-ink sm:text-[44px] lg:text-[60px]"
          >
            Turn Surplus Food Into <span className="relative whitespace-nowrap text-brand-800">Social Impact.<svg viewBox="0 0 300 12" className="absolute -bottom-1.5 left-0 w-full" aria-hidden><path d="M2 9C80 3 200 2 298 7" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5 }} className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            AnnaSetu uses AI to help institutions predict food demand, reduce waste, redistribute safe surplus, and connect with verified community organizations.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/register" size="lg" iconRight={<ArrowRight className="size-4" />}>Start Saving Food</ButtonLink>
            <ButtonLink to="/how-it-works" size="lg" variant="outline" icon={<PlayCircle className="size-4" />}>See How It Works</ButtonLink>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink-muted">
            {['Verified recipients only', 'Traceable end-to-end', 'Explore without signing up'].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-brand-600" aria-hidden />{t}</li>
            ))}
          </motion.ul>
        </div>
        <EcosystemVisual />
      </div>
    </section>
  )
}

function Counter({ value, decimals = 0, suffix = '', label, start }: { value: number; decimals?: number; suffix?: string; label: string; start: boolean }) {
  const v = useCountUp(value, start)
  return (
    <div className="px-4 py-6 sm:px-6">
      <p className="num text-[28px] font-bold tracking-tight text-ink sm:text-4xl">
        {v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        <span className="text-brand-700">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-ink-muted">{label}</p>
    </div>
  )
}

/** Values come from data/impact.ts → swap for GET /api/impact/summary. */
export function ImpactNumbers({ stats = platformStats }: { stats?: typeof platformStats }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <section aria-label="Platform impact" className="container-page">
      <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4 [&>*]:bg-white">
          <Counter value={stats.meals_rescued} suffix="+" label="Meals Rescued" start={inView} />
          <Counter value={stats.food_diverted_kg / 1000} decimals={1} suffix=" Tons" label="Food Diverted" start={inView} />
          <Counter value={stats.verified_partners} label="Verified Partners" start={inView} />
          <Counter value={stats.success_rate} suffix="%" label="Successful Redistribution" start={inView} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 sm:px-6">
          <DemoTag />
          <p className="text-right text-xs text-ink-subtle">Illustrative prototype figures — replaced by live platform data in production.</p>
        </div>
      </div>
    </section>
  )
}
