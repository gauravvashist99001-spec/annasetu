import { useMemo, useState } from 'react'
import { Soup, X } from 'lucide-react'
import type { FoodCategory } from '@/types'
import { Button, Card, Chip, DemoTag, EmptyState, PageHeader, Segmented, Select } from '@/components/ui'
import { FoodCard, urgencyOf } from '@/components/dashboard/FoodCard'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useNow } from '@/hooks/useNow'
import { useRequestFood } from '@/hooks/useRequestFood'
import { haversineKm } from '@/utils/geo'

const TYPES: (FoodCategory | 'All')[] = ['All', 'Cooked Meals', 'Rice & Grains', 'Dal & Curries', 'Breads & Bakery', 'Fruits & Vegetables', 'Packaged']

export function useNearbyListings(maxKm = 99) {
  const { session } = useAuth()
  const { state } = useData()
  const me = state.organizations.find((o) => o.id === session?.user.organization_id)
  const now = useNow()
  const items = useMemo(
    () =>
      state.listings
        .filter((l) => l.status === 'available' && new Date(l.available_until).getTime() > now)
        .map((l) => {
          const src = state.organizations.find((o) => o.id === l.organization_id)!
          return { listing: l, source: src, distance: me ? haversineKm(src, me) * 1.3 : 0 }
        })
        .filter((x) => x.distance <= maxKm)
        .sort((a, b) => a.distance - b.distance),
    [state, me, now, maxKm],
  )
  return { items, me, now }
}

export default function AvailableSurplus() {
  const { items, me, now } = useNearbyListings()
  const { state } = useData()
  const request = useRequestFood(me)
  const [maxKm, setMaxKm] = useState(25)
  const [type, setType] = useState<(typeof TYPES)[number]>('All')
  const [minQty, setMinQty] = useState(0)
  const [urgency, setUrgency] = useState<'all' | 'urgent'>('all')
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [requested, setRequested] = useState<string[]>([])

  const filtered = items.filter(
    (x) => x.distance <= maxKm && (type === 'All' || x.listing.category === type) && x.listing.servings >= minQty && (urgency === 'all' || ['critical', 'high'].includes(urgencyOf(x.listing.available_until, now))),
  )
  const active = maxKm !== 25 || type !== 'All' || minQty !== 0 || urgency !== 'all'

  return (
    <>
      <PageHeader eyebrow={<DemoTag />} title="Available Surplus" description="Verified surplus near your organisation, sorted by distance. Request only what you can serve within the window." actions={<Segmented label="View" value={view} onChange={setView} options={[{ value: 'grid', label: 'Cards' }, { value: 'map', label: 'Map' }]} />} />

      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="f-dist" className="text-xs font-medium text-ink-muted">Distance · within {maxKm} km</label>
            <input id="f-dist" type="range" min={2} max={25} value={maxKm} onChange={(e) => setMaxKm(Number(e.target.value))} className="mt-2 w-full accent-brand-700" />
          </div>
          <div>
            <label htmlFor="f-type" className="text-xs font-medium text-ink-muted">Food type</label>
            <div className="mt-1"><Select id="f-type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></div>
          </div>
          <div>
            <label htmlFor="f-qty" className="text-xs font-medium text-ink-muted">Minimum quantity</label>
            <div className="mt-1"><Select id="f-qty" value={minQty} onChange={(e) => setMinQty(Number(e.target.value))}>{[0, 25, 50, 100].map((q) => <option key={q} value={q}>{q ? `${q}+ meals` : 'Any quantity'}</option>)}</Select></div>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Urgency</p>
            <div className="mt-1.5 flex gap-2">
              <Chip active={urgency === 'all'} onClick={() => setUrgency('all')}>All</Chip>
              <Chip active={urgency === 'urgent'} onClick={() => setUrgency('urgent')}>Closing soon</Chip>
            </div>
          </div>
        </div>
        {active && (
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-xs text-ink-subtle">
            {filtered.length} of {items.length} listings
            <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={() => { setMaxKm(25); setType('All'); setMinQty(0); setUrgency('all') }}>Clear filters</Button>
          </div>
        )}
      </Card>

      {view === 'map' ? (
        <NetworkMap height={520} organizations={[...(me ? [me] : []), ...new Map(filtered.map((x) => [x.source.id, x.source])).values()]} highlight={me ? [me.id] : []} routes={[]} />
      ) : filtered.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((x) => (
            <li key={x.listing.id}>
              <FoodCard
                listing={x.listing}
                source={x.source}
                distanceKm={x.distance}
                now={now}
                requested={requested.includes(x.listing.id) || state.listings.find((l) => l.id === x.listing.id)?.status !== 'available'}
                onRequest={() => { request(x.listing); setRequested((r) => [...r, x.listing.id]) }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <Card><EmptyState icon={<Soup className="size-5" />} title="No surplus matches these filters">Widen the distance or clear filters. You’ll get a notification when new surplus appears nearby.</EmptyState></Card>
      )}
    </>
  )
}
