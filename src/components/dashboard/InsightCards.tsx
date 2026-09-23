import { ArrowUpRight, Lightbulb, PieChart, Repeat, Sparkles, TrendingUp } from 'lucide-react'
import type { Insight } from '@/types'
import { Badge, ButtonLink } from '@/components/ui'
import { cn } from '@/utils/cn'

const KIND = {
  trend: { icon: TrendingUp, label: 'Trend' },
  pattern: { icon: Repeat, label: 'Pattern' },
  composition: { icon: PieChart, label: 'Composition' },
  recommendation: { icon: Lightbulb, label: 'Recommendation' },
}

export function ModelLabel({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium text-tech-700', className)}>
      <Sparkles className="size-3" aria-hidden /> Model-generated · verify before acting
    </span>
  )
}

export function InsightCards({ insights, columns = 2 }: { insights: Insight[]; columns?: 2 | 4 }) {
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2', columns === 4 && 'xl:grid-cols-4')}>
      {insights.map((ins) => {
        const K = KIND[ins.kind]
        return (
          <li key={ins.id} className="flex flex-col rounded-xl border border-line bg-white p-4 transition-shadow hover:shadow-[var(--shadow-raised)]">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                <K.icon className="size-3.5 text-tech-600" aria-hidden /> {K.label}
              </span>
              {ins.metric && <span className="num text-sm font-bold text-ink">{ins.metric}</span>}
            </div>
            <p className="mt-2 text-[14px] font-semibold leading-snug text-ink">{ins.title}</p>
            <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-muted">{ins.detail}</p>
            <div className="mt-3 flex flex-col items-start gap-2 border-t border-line pt-3">
              <ModelLabel />
              <Badge tone={ins.confidence === 'high' ? 'green' : ins.confidence === 'medium' ? 'blue' : 'gray'}>{ins.confidence} confidence</Badge>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** The large "AI INSIGHT" hero card on the institution overview. */
export function AIInsightHero({ insight, to = '/app/prediction' }: { insight: Insight; to?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-tech-100 bg-gradient-to-br from-tech-50 via-white to-white p-5 sm:p-6">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-tech-100/60 blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 rounded-md bg-tech-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            <Sparkles className="size-3" aria-hidden /> AI Insight
          </p>
          <p className="mt-3 text-lg font-semibold leading-snug text-ink sm:text-xl">{insight.detail}</p>
          <p className="mt-2 text-[13px] text-ink-muted">{insight.title} <ModelLabel className="ml-1" /></p>
        </div>
        <ButtonLink to={to} variant="primary" className="bg-tech-600 hover:bg-tech-700" iconRight={<ArrowUpRight className="size-4" />}>
          View Recommendation
        </ButtonLink>
      </div>
    </div>
  )
}
