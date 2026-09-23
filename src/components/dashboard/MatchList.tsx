import { Award, Clock, MapPin, Users } from 'lucide-react'
import type { MatchCandidate } from '@/types'
import { VerifiedBadge } from '@/components/ui'
import { WEIGHTS } from '@/services/matching'
import { cn } from '@/utils/cn'
import { fmtKm } from '@/utils/format'

const FACTORS: { key: keyof MatchCandidate['breakdown']; label: string; weight: number }[] = [
  { key: 'distance', label: 'Distance', weight: WEIGHTS.distance },
  { key: 'quantity', label: 'Quantity fit', weight: WEIGHTS.quantity },
  { key: 'requirement', label: 'Requirement', weight: WEIGHTS.requirement },
  { key: 'time', label: 'Time margin', weight: WEIGHTS.time },
]

export function MatchList({ candidates, selected, onSelect, limit = 4 }: { candidates: MatchCandidate[]; selected?: string; onSelect?: (id: string) => void; limit?: number }) {
  return (
    <ul className="space-y-3" role={onSelect ? 'radiogroup' : undefined} aria-label="Potential recipients">
      {candidates.slice(0, limit).map((c, i) => {
        const best = i === 0
        const isSel = selected === c.recipient.id
        return (
          <li key={c.recipient.id}>
            <button
              type="button"
              role={onSelect ? 'radio' : undefined}
              aria-checked={onSelect ? isSel : undefined}
              disabled={!onSelect}
              onClick={() => onSelect?.(c.recipient.id)}
              className={cn(
                'w-full rounded-xl border bg-white p-4 text-left transition-[border-color,box-shadow] disabled:cursor-default',
                isSel ? 'border-brand-600 ring-3 ring-brand-100' : best ? 'border-brand-200' : 'border-line',
                onSelect && !isSel && 'hover:border-line-strong',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-ink">{c.recipient.name}</p>
                    <VerifiedBadge status={c.recipient.verification_status} compact />
                    {best && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-brand-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                        <Award className="size-3" aria-hidden /> Best match
                      </span>
                    )}
                  </div>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-muted">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden /> {fmtKm(c.distance_km)}</span>
                    <span className="inline-flex items-center gap-1"><Users className="size-3.5" aria-hidden /> Needs {c.need_meals} meals</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden /> ETA ~{c.eta_min} min</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="num text-2xl font-bold leading-none text-ink">{c.score}</p>
                  <p className="text-[11px] text-ink-subtle">match score</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {FACTORS.map((f) => (
                  <div key={f.key}>
                    <div className="flex justify-between text-[11px] text-ink-subtle">
                      <span>{f.label}</span>
                      <span className="num">{Math.round(c.breakdown[f.key] * 100)}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-tech-600" style={{ width: `${c.breakdown[f.key] * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function MatchingMethodNote() {
  return (
    <p className="text-xs leading-relaxed text-ink-subtle">
      Score = distance {WEIGHTS.distance * 100}% · quantity fit {WEIGHTS.quantity * 100}% · stated requirement {WEIGHTS.requirement * 100}% · time margin {WEIGHTS.time * 100}%.
      Only verified recipients reachable within the safe-use window (plus a 30-min buffer) are shown. Matching supports coordination — it does not assess food safety.
    </p>
  )
}
