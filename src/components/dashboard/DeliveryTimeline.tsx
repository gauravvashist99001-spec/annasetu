import { Check } from 'lucide-react'
import type { Delivery, DeliveryStatus } from '@/types'
import { cn } from '@/utils/cn'
import { fmtDateTime } from '@/utils/format'

const STEPS: { status: DeliveryStatus; label: string; hint: string }[] = [
  { status: 'registered', label: 'Food registered', hint: 'Surplus logged with prep time, storage & window' },
  { status: 'matched', label: 'Matched', hint: 'Recipient selected by matching engine & confirmed' },
  { status: 'assigned', label: 'Volunteer assigned', hint: 'Verified volunteer accepted the pickup' },
  { status: 'picked_up', label: 'Picked up', hint: 'Handover confirmed at source' },
  { status: 'in_transit', label: 'In transit', hint: 'On the way to recipient' },
  { status: 'delivered', label: 'Delivered', hint: 'Recipient confirmed receipt · impact recorded' },
]
const ORDER = STEPS.map((s) => s.status)

/** Vertical traceability timeline (default) or compact horizontal tracker. */
export function DeliveryTimeline({ delivery, orientation = 'vertical', subset }: { delivery: Pick<Delivery, 'status' | 'events'>; orientation?: 'vertical' | 'horizontal'; subset?: DeliveryStatus[] }) {
  const steps = subset ? STEPS.filter((s) => subset.includes(s.status)) : STEPS
  const current = ORDER.indexOf(delivery.status)
  const at = (s: DeliveryStatus) => delivery.events.find((e) => e.status === s)?.at

  if (orientation === 'horizontal') {
    return (
      <ol className="flex w-full items-start" aria-label="Delivery progress">
        {steps.map((s, i) => {
          const idx = ORDER.indexOf(s.status)
          const done = idx <= current
          const active = idx === current
          return (
            <li key={s.status} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 && <span className={cn('absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2', done ? 'bg-brand-600' : 'bg-line')} aria-hidden />}
              <span className={cn('relative z-10 grid size-7 place-items-center rounded-full border-2 text-[11px] font-bold transition-colors', done ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-ink-subtle', active && 'ring-4 ring-brand-100')}>
                {done && !active ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('mt-2 px-1 text-[11px] font-medium leading-tight sm:text-xs', done ? 'text-ink' : 'text-ink-subtle')}>{s.label}</span>
              <span className="sr-only">{done ? (active ? '(current)' : '(complete)') : '(pending)'}</span>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol className="relative" aria-label="Delivery journey">
      {steps.map((s, i) => {
        const idx = ORDER.indexOf(s.status)
        const done = idx <= current
        const active = idx === current && delivery.status !== 'delivered'
        const time = at(s.status)
        return (
          <li key={s.status} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className={cn('absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-0.5', idx < current ? 'bg-brand-600' : 'bg-line')} aria-hidden />}
            <span className="relative">
              {active && <span className="absolute inset-0 rounded-full bg-brand-500 animate-pulse-ring" aria-hidden />}
              <span className={cn('relative grid size-7 place-items-center rounded-full border-2', done ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white')}>
                {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <span className="size-1.5 rounded-full bg-line-strong" />}
              </span>
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn('text-sm font-semibold', done ? 'text-ink' : 'text-ink-subtle')}>
                {s.label} {active && <span className="ml-1 text-xs font-medium text-brand-700">· Current</span>}
              </p>
              <p className="text-[13px] text-ink-subtle">{time ? fmtDateTime(time) : s.hint}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
