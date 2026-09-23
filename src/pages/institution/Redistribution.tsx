import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackagePlus, Search, Truck } from 'lucide-react'
import type { FoodListing, MatchCandidate } from '@/types'
import { Button, ButtonLink, Card, CardHeader, Chip, DataTable, Input, ListingBadge, Modal, PageHeader, Skeleton, StatusBadge, useToast, type Column } from '@/components/ui'
import { MatchList, MatchingMethodNote } from '@/components/dashboard/MatchList'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useNow } from '@/hooks/useNow'
import { api } from '@/services/api'
import type { Delivery } from '@/types'
import { fmtDateTime, fmtKm, timeRemaining } from '@/utils/format'

export default function Redistribution() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const now = useNow()
  const orgId = session!.user.organization_id!
  const [tab, setTab] = useState<'active' | 'completed'>('active')
  const [q, setQ] = useState('')
  const [matching, setMatching] = useState<FoodListing | null>(null)
  const [cands, setCands] = useState<MatchCandidate[] | null>(null)
  const [sel, setSel] = useState<string>()

  const listings = state.listings.filter((l) => l.organization_id === orgId && l.status === 'available')
  const deliveries = useMemo(
    () =>
      state.deliveries
        .filter((d) => d.source_id === orgId)
        .filter((d) => (tab === 'active' ? d.status !== 'delivered' : d.status === 'delivered'))
        .filter((d) => d.tracking_id.toLowerCase().includes(q.toLowerCase()) || state.organizations.find((o) => o.id === d.recipient_id)?.name.toLowerCase().includes(q.toLowerCase())),
    [state, orgId, tab, q],
  )
  const org = (id: string) => state.organizations.find((o) => o.id === id)

  async function openMatch(l: FoodListing) {
    setMatching(l)
    setCands(null)
    const c = await api.findMatches(l, state.organizations)
    setCands(c)
    setSel(c[0]?.recipient.id)
  }

  const columns: Column<Delivery>[] = [
    { key: 'id', header: 'Tracking ID', cell: (d) => <span className="num font-mono text-[13px] font-semibold">{d.tracking_id}</span> },
    { key: 'to', header: 'Recipient', cell: (d) => org(d.recipient_id)?.name },
    { key: 'meals', header: 'Meals', cell: (d) => <span className="num">{d.meals}</span> },
    { key: 'dist', header: 'Distance', hideOnMobile: true, cell: (d) => <span className="num text-ink-muted">{fmtKm(d.distance_km)}</span> },
    { key: 'created', header: 'Created', hideOnMobile: true, cell: (d) => <span className="text-ink-muted">{fmtDateTime(d.created_at)}</span> },
    { key: 'status', header: 'Status', cell: (d) => <StatusBadge status={d.status} /> },
  ]

  return (
    <>
      <PageHeader title="Redistribution" description="Open surplus, confirmed matches and every delivery from your kitchen." actions={<ButtonLink to="/app/surplus/new" icon={<PackagePlus className="size-4" />}>Register surplus</ButtonLink>} />

      <Card>
        <CardHeader title="Awaiting a recipient" subtitle="Surplus registered but not yet matched" />
        {listings.length ? (
          <ul className="mt-3 divide-y divide-line">
            {listings.map((l) => (
              <li key={l.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">{l.food_name} <span className="font-normal text-ink-subtle">· {l.servings} meals · {l.quantity_kg} kg</span></p>
                  <p className="text-xs text-ink-subtle">{l.storage_condition} · {timeRemaining(l.available_until, now)} left</p>
                </div>
                <div className="flex items-center gap-2">
                  <ListingBadge status={l.status} />
                  <Button size="sm" icon={<Search className="size-3.5" />} onClick={() => openMatch(l)}>Find recipient</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-subtle">Nothing waiting — every registered surplus has a recipient.</p>
        )}
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <Chip active={tab === 'active'} onClick={() => setTab('active')}>Active</Chip>
              <Chip active={tab === 'completed'} onClick={() => setTab('completed')}>Completed</Chip>
            </div>
            <Input placeholder="Search tracking ID or recipient" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-64" aria-label="Search deliveries" />
          </div>
          <DataTable columns={columns} rows={deliveries} rowKey={(d) => d.id} onRowClick={(d) => navigate(`/app/track/${d.tracking_id}`)} caption="Deliveries" empty={<span className="inline-flex items-center gap-2"><Truck className="size-4" /> No deliveries in this view.</span>} />
        </Card>
        <Card className="p-4">
          <p className="mb-3 text-[15px] font-semibold text-ink">Delivery routes</p>
          <NetworkMap
            height={340}
            organizations={state.organizations.filter((o) => o.id === orgId || state.deliveries.some((d) => d.source_id === orgId && d.recipient_id === o.id))}
            routes={state.deliveries.filter((d) => d.source_id === orgId).map((d) => ({ id: d.id, from: d.source_id, to: d.recipient_id, active: d.status !== 'delivered' }))}
            highlight={[orgId]}
          />
        </Card>
      </div>

      <Modal
        open={!!matching}
        onClose={() => setMatching(null)}
        size="lg"
        title={matching ? `Find recipient · ${matching.food_name}` : ''}
        description={matching ? `${matching.servings} meals · ${timeRemaining(matching.available_until, now)} left` : undefined}
        footer={
          <>
            <Button variant="outline" onClick={() => setMatching(null)}>Cancel</Button>
            <Button
              disabled={!sel || !cands?.length}
              onClick={() => {
                const c = cands!.find((x) => x.recipient.id === sel)!
                dispatch({ type: 'confirmMatch', listingId: matching!.id, candidate: c })
                toast({ title: 'Recipient confirmed', body: `${c.recipient.name} notified; pickup posted to volunteers.` })
                setMatching(null)
              }}
            >
              Confirm recipient
            </Button>
          </>
        }
      >
        {!cands ? (
          <div className="space-y-3" aria-busy="true"><p className="text-sm text-ink-muted">Searching for verified recipients…</p><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
        ) : (
          <div className="space-y-4"><MatchList candidates={cands} selected={sel} onSelect={setSel} /><MatchingMethodNote /></div>
        )}
      </Modal>
    </>
  )
}
