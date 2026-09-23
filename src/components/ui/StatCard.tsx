import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from './Card'

interface StatCardProps {
  label: string
  value: ReactNode
  unit?: string
  icon?: ReactNode
  delta?: { value: string; direction: 'up' | 'down'; good: boolean; label?: string }
  tone?: 'green' | 'amber' | 'blue' | 'gray'
  footnote?: ReactNode
}

const iconTone = { green: 'bg-brand-50 text-brand-800', amber: 'bg-accent-50 text-accent-700', blue: 'bg-tech-50 text-tech-700', gray: 'bg-slate-100 text-ink-muted' }

export function StatCard({ label, value, unit, icon, delta, tone = 'green', footnote }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-ink-muted">{label}</p>
        {icon && <span className={cn('grid size-8 place-items-center rounded-lg', iconTone[tone])} aria-hidden>{icon}</span>}
      </div>
      <p className="num mt-2 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-ink-subtle">{unit}</span>}
      </p>
      {delta && (
        <p className="mt-1.5 flex items-center gap-1 text-xs">
          <span className={cn('inline-flex items-center gap-0.5 font-semibold', delta.good ? 'text-brand-700' : 'text-red-700')}>
            {delta.direction === 'up' ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
            {delta.value}
          </span>
          <span className="text-ink-subtle">{delta.label ?? 'vs last week'}</span>
        </p>
      )}
      {footnote && <p className="mt-1.5 text-xs text-ink-subtle">{footnote}</p>}
    </Card>
  )
}
