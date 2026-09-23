import { Link } from 'react-router-dom'
import { ArrowRight, HandPlatter, Inbox, PackageCheck, Soup, Truck } from 'lucide-react'
import { ButtonLink, Card, CardHeader, DemoTag, PageHeader, StatCard, StatusBadge, UrgencyBadge } from '@/components/ui'
import { FoodCard } from '@/components/dashboard/FoodCard'
import { DeliveryTimeline } from '@/components/dashboard/DeliveryTimeline'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useRequestFood } from '@/hooks/useRequestFood'
import { fmtNum } from '@/utils/format'
import { useNearbyListings } from './AvailableSurplus'

export default function NgoOverview() {
  const { session } = useAuth()
  const { state } = useData()
  const { items, me, now } = useNearbyListings(12)
  const request = useRequestFood(me)
  const orgId = session!.user.organization_id!
  const incoming = state.deliveries.filter((d) => d.recipient_id === orgId)
  const active = incoming.filter((d) => d.status !== 'delivered')
  const received = incoming.filter((d) => d.status === 'delivered').reduce((s, d) => s + d.meals, 0) + 2840
  const myRequests = state.requests.filter((r) => r.organization_id === orgId && r.status === 'open')

  return (
    <>
      <PageHeader
        eyebrow={<DemoTag />}
        title={me?.name ?? 'Overview'}
        description="Food available nearby, your open requests and incoming deliveries."
        actions={<><ButtonLink to="/app/requests" variant="outline" icon={<Inbox className="size-4" />}>New request</ButtonLink><ButtonLink to="/app/available" icon={<Soup className="size-4" />}>Browse surplus</ButtonLink></>}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Food available nearby" value={items.length} unit="listings" icon={<Soup className="size-4" />} tone="amber" footnote={`${fmtNum(items.reduce((s, x) => s + x.listing.servings, 0))} meals within 12 km`} />
        <StatCard label="Incoming deliveries" value={active.length} icon={<Truck className="size-4" />} tone="blue" />
        <StatCard label="Open requests" value={myRequests.length} icon={<Inbox className="size-4" />} tone="gray" />
        <StatCard label="Meals received" value={fmtNum(received)} icon={<HandPlatter className="size-4" />} delta={{ value: '9%', direction: 'up', good: true, label: 'vs last month' }} />
      </div>

      <div className="mt-6 flex items-end justify-between">
        <h2 className="text-lg font-semibold text-ink">Food available nearby</h2>
        <Link to="/app/available" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-800 hover:underline">View all & filter <ArrowRight className="size-3.5" /></Link>
      </div>
      <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.slice(0, 3).map((x) => (
          <li key={x.listing.id}><FoodCard listing={x.listing} source={x.source} distanceKm={x.distance} now={now} onRequest={() => request(x.listing)} /></li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Incoming deliveries" icon={<PackageCheck className="size-4" />} action={<Link to="/app/deliveries" className="text-[13px] font-medium text-brand-800 hover:underline">All</Link>} />
          <ul className="mt-3 divide-y divide-line">
            {active.length === 0 && <li className="px-5 py-6 text-sm text-ink-subtle">No active deliveries. Request food to get started.</li>}
            {active.slice(0, 3).map((d) => (
              <li key={d.id} className="px-5 py-4">
                <Link to={`/app/track/${d.tracking_id}`} className="block">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{state.organizations.find((o) => o.id === d.source_id)?.name} <span className="font-normal text-ink-subtle">· {d.meals} meals</span></p>
                    <StatusBadge status={d.status} />
                  </div>
                  <DeliveryTimeline delivery={d} orientation="horizontal" subset={['matched', 'assigned', 'picked_up', 'in_transit', 'delivered']} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Your open requests" icon={<Inbox className="size-4" />} action={<Link to="/app/requests" className="text-[13px] font-medium text-brand-800 hover:underline">Manage</Link>} />
          <ul className="mt-3 divide-y divide-line">
            {myRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{r.quantity_required} meals · {r.food_category}</p>
                  <p className="text-xs text-ink-subtle">{r.note ?? 'General requirement'}</p>
                </div>
                <UrgencyBadge urgency={r.urgency} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
