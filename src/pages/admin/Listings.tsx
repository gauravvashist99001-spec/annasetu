import { useState } from 'react'
import type { FoodListing, ListingStatus } from '@/types'
import { Card, Chip, DataTable, ListingBadge, PageHeader, type Column } from '@/components/ui'
import { useData } from '@/context/DataContext'
import { useNow } from '@/hooks/useNow'
import { fmtDateTime, timeRemaining } from '@/utils/format'

export default function Listings() {
  const { state } = useData()
  const now = useNow()
  const [status, setStatus] = useState<ListingStatus | 'all'>('all')
  const rows = state.listings.filter((l) => status === 'all' || l.status === status)
  const columns: Column<FoodListing>[] = [
    { key: 'food', header: 'Food', cell: (l) => <div><p className="font-medium">{l.food_name}</p><p className="text-xs text-ink-subtle">{l.category}</p></div> },
    { key: 'src', header: 'Institution', cell: (l) => state.organizations.find((o) => o.id === l.organization_id)?.name },
    { key: 'qty', header: 'Quantity', cell: (l) => <span className="num">{l.servings} meals · {l.quantity_kg} kg</span> },
    { key: 'storage', header: 'Storage', hideOnMobile: true, cell: (l) => <span className="text-ink-muted">{l.storage_condition}</span> },
    { key: 'win', header: 'Window', hideOnMobile: true, cell: (l) => <span className="text-ink-muted">{l.status === 'available' ? `${timeRemaining(l.available_until, now)} left` : fmtDateTime(l.available_until)}</span> },
    { key: 'st', header: 'Status', cell: (l) => <ListingBadge status={l.status} /> },
  ]
  return (
    <>
      <PageHeader title="Food Listings" description="Every surplus registration across the network." />
      <Card>
        <div className="flex flex-wrap gap-2 p-4">
          {(['all', 'available', 'matched', 'in_transit', 'delivered'] as const).map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)} count={s === 'all' ? state.listings.length : state.listings.filter((l) => l.status === s).length}>
              <span className="capitalize">{s.replace('_', ' ')}</span>
            </Chip>
          ))}
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(l) => l.id} caption="Food listings" />
      </Card>
    </>
  )
}
