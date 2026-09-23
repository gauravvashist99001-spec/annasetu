import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, PackageCheck } from 'lucide-react'
import { Avatar, Button, Card, Chip, EmptyState, PageHeader, StatusBadge, useToast } from '@/components/ui'
import { DeliveryTimeline } from '@/components/dashboard/DeliveryTimeline'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'
import { fmtDateTime, fmtKm } from '@/utils/format'

export default function NgoDeliveries() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const toast = useToast()
  const orgId = session!.user.organization_id!
  const [tab, setTab] = useState<'active' | 'delivered'>('active')
  const list = state.deliveries.filter((d) => d.recipient_id === orgId && (tab === 'active' ? d.status !== 'delivered' : d.status === 'delivered'))

  return (
    <>
      <PageHeader title="My Deliveries" description="Track incoming food and confirm receipt to close the loop." />
      <div className="mb-4 flex gap-2">
        <Chip active={tab === 'active'} onClick={() => setTab('active')}>Active</Chip>
        <Chip active={tab === 'delivered'} onClick={() => setTab('delivered')}>Delivered</Chip>
      </div>
      {list.length === 0 ? (
        <Card><EmptyState icon={<PackageCheck className="size-5" />} title="Nothing here yet">Requested food will appear here once matched.</EmptyState></Card>
      ) : (
        <ul className="space-y-4">
          {list.map((d) => {
            const src = state.organizations.find((o) => o.id === d.source_id)
            const vol = volunteers.find((v) => v.id === d.volunteer_id)
            return (
              <li key={d.id}>
                <Card className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link to={`/app/track/${d.tracking_id}`} className="num font-mono text-sm font-bold text-ink hover:underline">{d.tracking_id}</Link>
                      <p className="mt-0.5 text-sm text-ink-muted">{src?.name} · {d.meals} meals · {fmtKm(d.distance_km)}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-5"><DeliveryTimeline delivery={d} orientation="horizontal" /></div>
                  <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-2 text-[13px] text-ink-muted">
                      {vol ? <><Avatar name={vol.name} size="sm" /> {vol.name} · {vol.vehicle}</> : 'Awaiting volunteer'}
                      <span className="text-ink-subtle">· created {fmtDateTime(d.created_at)}</span>
                    </p>
                    {d.status === 'in_transit' && (
                      <Button size="sm" icon={<CheckCircle2 className="size-4" />} onClick={() => { dispatch({ type: 'advance', deliveryId: d.id }); toast({ title: 'Receipt confirmed', body: `${d.meals} meals recorded in your impact ledger.` }) }}>
                        Confirm receipt
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
