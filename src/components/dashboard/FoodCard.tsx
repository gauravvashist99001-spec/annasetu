import { Clock, MapPin, Thermometer, Utensils } from 'lucide-react'
import type { FoodListing, Organization } from '@/types'
import { Badge, Button, Card, VerifiedBadge } from '@/components/ui'
import { cn } from '@/utils/cn'
import { fmtKm, minutesRemaining, timeRemaining } from '@/utils/format'

export function urgencyOf(untilIso: string, now = Date.now()) {
  const m = minutesRemaining(untilIso, now)
  return m < 90 ? 'critical' : m < 180 ? 'high' : m < 360 ? 'medium' : 'low'
}

export function FoodCard({ listing, source, distanceKm, now, onRequest, requested }: { listing: FoodListing; source?: Organization; distanceKm?: number; now: number; onRequest?: () => void; requested?: boolean }) {
  const u = urgencyOf(listing.available_until, now)
  const mins = minutesRemaining(listing.available_until, now)
  return (
    <Card interactive className="flex flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink">{listing.food_name}</p>
          <p className="mt-0.5 text-[13px] text-ink-subtle">{listing.category}</p>
        </div>
        <Badge tone={u === 'critical' ? 'red' : u === 'high' ? 'amber' : u === 'medium' ? 'blue' : 'gray'} className="capitalize">{u === 'critical' ? 'Urgent' : u}</Badge>
      </div>
      <p className="num mt-3 text-2xl font-bold text-ink">
        {listing.servings} <span className="text-sm font-semibold text-ink-subtle">meals · {listing.quantity_kg} kg</span>
      </p>
      <dl className="mt-3 space-y-1.5 text-[13px] text-ink-muted">
        {distanceKm !== undefined && (
          <div className="flex items-center gap-2"><MapPin className="size-3.5 shrink-0" aria-hidden /><dt className="sr-only">Distance</dt><dd>{fmtKm(distanceKm)} away</dd></div>
        )}
        <div className="flex items-center gap-2">
          <Clock className={cn('size-3.5 shrink-0', u === 'critical' && 'text-danger')} aria-hidden />
          <dt className="sr-only">Available for</dt>
          <dd className={cn(u === 'critical' && 'font-semibold text-red-700')}>Available for {timeRemaining(listing.available_until, now)}</dd>
        </div>
        <div className="flex items-center gap-2"><Thermometer className="size-3.5 shrink-0" aria-hidden /><dt className="sr-only">Storage</dt><dd>{listing.storage_condition}</dd></div>
        {source && (
          <div className="flex items-center gap-2"><Utensils className="size-3.5 shrink-0" aria-hidden /><dt className="sr-only">Source</dt><dd className="flex items-center gap-1 truncate">{source.name} <VerifiedBadge status={source.verification_status} compact /></dd></div>
        )}
      </dl>
      <div className="mt-2 h-1 rounded-full bg-slate-100" aria-hidden>
        <div className={cn('h-full rounded-full', u === 'critical' ? 'bg-danger' : u === 'high' ? 'bg-accent-500' : 'bg-brand-600')} style={{ width: `${Math.min(100, (mins / 360) * 100)}%` }} />
      </div>
      {onRequest && (
        <Button className="mt-4 w-full" variant={requested ? 'secondary' : 'primary'} onClick={onRequest} disabled={requested || mins === 0}>
          {requested ? 'Requested ✓' : 'Request Food'}
        </Button>
      )}
    </Card>
  )
}
