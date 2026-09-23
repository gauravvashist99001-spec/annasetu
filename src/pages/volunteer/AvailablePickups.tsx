import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowDown, Award, Building2, Clock, HandHeart, MapPin, Route, Soup, Star, Truck } from 'lucide-react'
import { Badge, Button, Card, DemoTag, EmptyState, Modal, PageHeader, StatCard, useToast } from '@/components/ui'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useAuth } from '@/context/AuthContext'
import { useData, type Pickup } from '@/context/DataContext'
import { useNow } from '@/hooks/useNow'
import { volunteers } from '@/data/organizations'
import { cn } from '@/utils/cn'
import { fmtKm, minutesRemaining, timeRemaining } from '@/utils/format'

export default function AvailablePickups() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const now = useNow()
  const me = volunteers.find((v) => v.id === session!.user.id) ?? volunteers[0]
  const [route, setRoute] = useState<Pickup | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const org = (id: string) => state.organizations.find((o) => o.id === id)!
  const pickups = [...state.pickups].sort((a, b) => minutesRemaining(a.window_until, now) - minutesRemaining(b.window_until, now))
  const mine = state.deliveries.filter((d) => d.volunteer_id === me.id)

  async function accept(p: Pickup) {
    setAccepting(p.id)
    await new Promise((r) => setTimeout(r, 600))
    dispatch({ type: 'acceptPickup', pickupId: p.id, volunteerId: me.id })
    setAccepting(null)
    setRoute(null)
    toast({ title: 'Pickup accepted', body: `Head to ${org(p.source_id).name}. Update status as you go.` })
    navigate('/app/pickups')
  }

  return (
    <>
      <PageHeader eyebrow={<DemoTag />} title="Available Pickups" description={`Verified food waiting to move near ${me.area}. Most urgent first.`} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Open pickups" value={pickups.length} icon={<HandHeart className="size-4" />} tone="amber" />
        <StatCard label="My active" value={mine.filter((d) => d.status !== 'delivered').length} icon={<Truck className="size-4" />} tone="blue" />
        <StatCard label="Completed" value={me.completed + mine.filter((d) => d.status === 'delivered').length} icon={<Award className="size-4" />} />
        <StatCard label="Rating" value={me.rating.toFixed(1)} unit="/ 5" icon={<Star className="size-4" />} tone="gray" />
      </div>

      {pickups.length === 0 ? (
        <Card className="mt-6"><EmptyState icon={<HandHeart className="size-5" />} title="No open pickups right now">We’ll notify you when surplus near you is matched.</EmptyState></Card>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {pickups.map((p) => {
            const mins = minutesRemaining(p.window_until, now)
            const urgent = mins < 90
            return (
              <li key={p.id}>
                <Card interactive className={cn('p-5', urgent && 'border-red-200')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('grid size-9 place-items-center rounded-lg', urgent ? 'bg-danger-50 text-red-700' : 'bg-accent-50 text-accent-700')}><Soup className="size-4" aria-hidden /></span>
                      <div>
                        <p className="text-[15px] font-semibold text-ink">{p.food}</p>
                        <p className="num text-[13px] text-ink-subtle">{p.meals} meals</p>
                      </div>
                    </div>
                    <Badge tone={urgent ? 'red' : mins < 180 ? 'amber' : 'gray'} icon={<Clock className="size-3" aria-hidden />}>{timeRemaining(p.window_until, now)}</Badge>
                  </div>
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                    <p className="flex items-center gap-2"><Building2 className="size-4 shrink-0 text-brand-700" aria-hidden /><span className="text-xs text-ink-subtle">Pickup</span><span className="truncate font-medium text-ink">{org(p.source_id).name}</span></p>
                    <ArrowDown className="my-1 ml-0.5 size-3.5 text-ink-subtle" aria-hidden />
                    <p className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-accent-600" aria-hidden /><span className="text-xs text-ink-subtle">Destination</span><span className="truncate font-medium text-ink">{org(p.recipient_id).name}</span></p>
                  </div>
                  <p className="mt-3 flex items-center gap-4 text-[13px] text-ink-muted">
                    <span className="inline-flex items-center gap-1"><Route className="size-3.5" aria-hidden /> {fmtKm(p.distance_km)}</span>
                    <span>~{Math.round((p.distance_km / 18) * 60 + 10)} min ride</span>
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" icon={<Route className="size-4" />} onClick={() => setRoute(p)}>View Route</Button>
                    <Button onClick={() => accept(p)} loading={accepting === p.id}>Accept Pickup</Button>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={!!route}
        onClose={() => setRoute(null)}
        size="lg"
        title={route ? `Route · ${route.food}` : ''}
        description={route ? `${org(route.source_id).name} → ${org(route.recipient_id).name} · ${fmtKm(route.distance_km)}` : undefined}
        footer={route && <><Button variant="outline" onClick={() => setRoute(null)}>Close</Button><Button onClick={() => accept(route)} loading={accepting === route.id}>Accept Pickup</Button></>}
      >
        {route && (
          <>
            <NetworkMap height={340} organizations={[org(route.source_id), org(route.recipient_id)]} routes={[{ id: route.id, from: route.source_id, to: route.recipient_id, active: true }]} highlight={[route.source_id, route.recipient_id]} showLegend={false} />
            <p className="mt-3 text-xs text-ink-subtle">Schematic route. In production this opens turn-by-turn directions via the configured map provider (OpenStreetMap / Mapbox / Google Maps).</p>
          </>
        )}
      </Modal>
    </>
  )
}
