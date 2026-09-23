import { Link } from 'react-router-dom'
import { ArrowRight, Navigation, PackageCheck, Phone, Truck } from 'lucide-react'
import type { DeliveryStatus } from '@/types'
import { Button, ButtonLink, Card, EmptyState, PageHeader, StatusBadge, useToast } from '@/components/ui'
import { DeliveryTimeline } from '@/components/dashboard/DeliveryTimeline'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'
import { fmtDateTime, fmtKm } from '@/utils/format'

const NEXT: Partial<Record<DeliveryStatus, string>> = { assigned: 'Mark picked up', picked_up: 'Start transit', in_transit: 'Mark delivered' }

export default function MyPickups() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const toast = useToast()
  const me = volunteers.find((v) => v.id === session!.user.id) ?? volunteers[0]
  const mine = state.deliveries.filter((d) => d.volunteer_id === me.id)
  const active = mine.filter((d) => d.status !== 'delivered')
  const done = mine.filter((d) => d.status === 'delivered')
  const org = (id: string) => state.organizations.find((o) => o.id === id)!

  return (
    <>
      <PageHeader title="My Pickups" description="Update status at each hand-off — institutions and recipients see it instantly." />
      {active.length === 0 ? (
        <Card><EmptyState icon={<Truck className="size-5" />} title="No active pickups" action={<ButtonLink to="/app">Find a pickup</ButtonLink>}>Accept a pickup to see it here.</EmptyState></Card>
      ) : (
        <ul className="space-y-4">
          {active.map((d) => (
            <li key={d.id}>
              <Card className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="num font-mono text-sm font-bold text-ink">{d.tracking_id}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{d.meals} meals · {fmtKm(d.distance_km)}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Pickup', org(d.source_id)],
                    ['Drop-off', org(d.recipient_id)],
                  ].map(([k, o]) => {
                    const oo = o as ReturnType<typeof org>
                    return (
                      <div key={k as string} className="rounded-xl border border-line p-3">
                        <p className="text-xs text-ink-subtle">{k as string}</p>
                        <p className="text-sm font-semibold text-ink">{oo.name}</p>
                        <p className="text-xs text-ink-muted">{oo.address}</p>
                        <a href={`tel:${oo.contact.replace(/\s/g, '')}`} className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-tech-700 hover:underline"><Phone className="size-3" aria-hidden /> {oo.contact}</a>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">Status tracker</p>
                  <DeliveryTimeline delivery={d} orientation="horizontal" subset={['assigned', 'picked_up', 'in_transit', 'delivered']} />
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-between">
                  <Button variant="outline" icon={<Navigation className="size-4" />} onClick={() => toast({ title: 'Opening navigation', body: 'Directions open in your maps app in production.', tone: 'info' })}>Navigate</Button>
                  {NEXT[d.status] && (
                    <Button
                      icon={<PackageCheck className="size-4" />}
                      onClick={() => {
                        dispatch({ type: 'advance', deliveryId: d.id })
                        toast({ title: 'Status updated', body: `${d.tracking_id}: ${NEXT[d.status]!.replace('Mark ', '').replace('Start ', 'in ')}.` })
                      }}
                    >
                      {NEXT[d.status]}
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-3 mt-8 text-lg font-semibold text-ink">History</h2>
      <Card>
        <ul className="divide-y divide-line">
          {done.map((d) => (
            <li key={d.id}>
              <Link to={`/app/track/${d.tracking_id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{org(d.source_id).name} → {org(d.recipient_id).name}</p>
                  <p className="text-xs text-ink-subtle">{d.meals} meals · {fmtDateTime(d.created_at)}</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-ink-subtle" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
