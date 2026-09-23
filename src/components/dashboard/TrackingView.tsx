import { ArrowRight, Building2, CheckCircle2, Clock, HandHeart, PackageSearch, Truck } from 'lucide-react'
import { Avatar, Card, EmptyState, StatusBadge, VerifiedBadge } from '@/components/ui'
import { DeliveryTimeline } from './DeliveryTimeline'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'
import { listings as seedListings } from '@/data/operations'
import { fmtDateTime, fmtKm } from '@/utils/format'

export function TrackingView({ trackingId, publicView }: { trackingId: string; publicView?: boolean }) {
  const { state } = useData()
  const d = state.deliveries.find((x) => x.tracking_id.toLowerCase() === trackingId.toLowerCase())
  if (!d)
    return (
      <Card><EmptyState icon={<PackageSearch className="size-5" />} title={`No journey found for “${trackingId}”`}>Check the tracking ID — it looks like AS-2026-001284.</EmptyState></Card>
    )
  const src = state.organizations.find((o) => o.id === d.source_id)!
  const dst = state.organizations.find((o) => o.id === d.recipient_id)!
  const vol = volunteers.find((v) => v.id === d.volunteer_id)
  const listing = state.listings.find((l) => l.id === d.food_listing_id) ?? seedListings.find((l) => l.id === d.food_listing_id)

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-ink-subtle">Tracking ID</p>
            <p className="num font-mono text-2xl font-bold tracking-tight text-ink sm:text-3xl">{d.tracking_id}</p>
            <p className="mt-1 text-sm text-ink-muted">{listing?.food_name ?? 'Surplus meals'} · {d.meals} meals{listing ? ` · ${listing.quantity_kg} kg` : ''}</p>
          </div>
          <StatusBadge status={d.status} />
        </div>
        <div className="mt-5 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-800"><Building2 className="size-4" aria-hidden /></span>
            <div className="min-w-0"><p className="text-[11px] text-ink-subtle">Source</p><p className="flex items-center gap-1 truncate text-sm font-semibold">{src.name} <VerifiedBadge status={src.verification_status} compact /></p><p className="truncate text-xs text-ink-subtle">{src.area}</p></div>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-ink-subtle"><ArrowRight className="size-4 rotate-90 sm:rotate-0" aria-hidden /> {fmtKm(d.distance_km)}</div>
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-50 text-accent-700"><HandHeart className="size-4" aria-hidden /></span>
            <div className="min-w-0"><p className="text-[11px] text-ink-subtle">Recipient</p><p className="flex items-center gap-1 truncate text-sm font-semibold">{dst.name} <VerifiedBadge status={dst.verification_status} compact /></p><p className="truncate text-xs text-ink-subtle">{dst.area}</p></div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="p-5 sm:p-6">
          <p className="mb-5 text-[15px] font-semibold text-ink">Journey</p>
          <DeliveryTimeline delivery={d} />
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <NetworkMap height={260} organizations={[src, dst]} routes={[{ id: d.id, from: src.id, to: dst.id, active: d.status !== 'delivered' }]} highlight={[src.id, dst.id]} showLegend={false} anonymized={publicView} />
          </Card>
          <Card className="p-5">
            <p className="text-[15px] font-semibold text-ink">Handling record</p>
            <ul className="mt-3 grid gap-2 text-[13px] sm:grid-cols-2">
              {[
                ['Preparation time', listing ? fmtDateTime(listing.prepared_at) : 'Recorded'],
                ['Storage', listing?.storage_condition ?? 'Recorded'],
                ['Available until', listing ? fmtDateTime(listing.available_until) : 'Recorded'],
                ['Recipient confirmed', d.events.some((e) => e.status === 'matched') ? 'Yes' : 'Pending'],
              ].map(([k, v]) => (
                <li key={k} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden /><span><span className="block text-ink-subtle">{k}</span><span className="font-medium text-ink">{v}</span></span></li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-4 text-[13px]">
              {vol ? (
                <><Avatar name={vol.name} size="sm" /><span><span className="font-medium text-ink">{publicView ? `${vol.name.split(' ')[0]} ${vol.name.split(' ')[1]?.[0] ?? ''}.` : vol.name}</span> <span className="text-ink-subtle">· Verified volunteer · {vol.vehicle}</span></span></>
              ) : (
                <span className="flex items-center gap-2 text-ink-subtle"><Truck className="size-4" aria-hidden /> Awaiting volunteer</span>
              )}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-subtle"><Clock className="size-3.5" aria-hidden /> Created {fmtDateTime(d.created_at)}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
