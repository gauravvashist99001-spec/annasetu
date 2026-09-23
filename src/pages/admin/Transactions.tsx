import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import type { Delivery } from '@/types'
import { Button, Card, Chip, DataTable, PageHeader, StatusBadge, useToast, type Column } from '@/components/ui'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'
import { fmtDateTime, fmtKm } from '@/utils/format'

export default function Transactions() {
  const { state } = useData()
  const toast = useToast()
  const navigate = useNavigate()
  const [f, setF] = useState<'all' | 'active' | 'delivered'>('all')
  const rows = state.deliveries.filter((d) => f === 'all' || (f === 'delivered' ? d.status === 'delivered' : d.status !== 'delivered'))
  const org = (id: string) => state.organizations.find((o) => o.id === id)?.name
  const columns: Column<Delivery>[] = [
    { key: 'id', header: 'Tracking ID', cell: (d) => <span className="num font-mono text-[13px] font-semibold">{d.tracking_id}</span> },
    { key: 'src', header: 'Source', cell: (d) => org(d.source_id) },
    { key: 'dst', header: 'Recipient', cell: (d) => org(d.recipient_id) },
    { key: 'vol', header: 'Volunteer', hideOnMobile: true, cell: (d) => <span className="text-ink-muted">{volunteers.find((v) => v.id === d.volunteer_id)?.name ?? '—'}</span> },
    { key: 'meals', header: 'Meals', cell: (d) => <span className="num">{d.meals}</span> },
    { key: 'dist', header: 'Distance', hideOnMobile: true, cell: (d) => <span className="num text-ink-muted">{fmtKm(d.distance_km)}</span> },
    { key: 'at', header: 'Created', hideOnMobile: true, cell: (d) => <span className="text-ink-muted">{fmtDateTime(d.created_at)}</span> },
    { key: 'st', header: 'Status', cell: (d) => <StatusBadge status={d.status} /> },
  ]

  function exportCsv() {
    const head = 'tracking_id,source,recipient,meals,distance_km,status,created_at'
    const body = rows.map((d) => [d.tracking_id, org(d.source_id), org(d.recipient_id), d.meals, d.distance_km.toFixed(1), d.status, d.created_at].map((v) => `"${v}"`).join(','))
    const blob = new Blob([[head, ...body].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'annasetu-transactions-demo.csv'
    a.click()
    URL.revokeObjectURL(a.href)
    toast({ title: 'Export ready', body: `${rows.length} transactions exported.` })
  }

  return (
    <>
      <PageHeader title="Redistribution Transactions" description="Audit trail of every match and delivery." actions={<Button variant="outline" icon={<Download className="size-4" />} onClick={exportCsv}>Export CSV</Button>} />
      <Card>
        <div className="flex gap-2 p-4">
          {(['all', 'active', 'delivered'] as const).map((s) => <Chip key={s} active={f === s} onClick={() => setF(s)}><span className="capitalize">{s}</span></Chip>)}
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(d) => d.id} onRowClick={(d) => navigate(`/app/track/${d.tracking_id}`)} caption="Transactions" />
      </Card>
    </>
  )
}
