import { useState } from 'react'
import { Inbox, Plus } from 'lucide-react'
import type { FoodCategory, FoodRequest, Urgency } from '@/types'
import { Badge, Button, Card, Chip, DataTable, Field, Input, Modal, PageHeader, Select, Textarea, UrgencyBadge, useToast, type Column } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { fmtDateTime } from '@/utils/format'

const CATS: (FoodCategory | 'Any')[] = ['Any', 'Cooked Meals', 'Rice & Grains', 'Dal & Curries', 'Breads & Bakery', 'Fruits & Vegetables', 'Packaged', 'Dairy']

export default function FoodRequests() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const toast = useToast()
  const orgId = session!.user.organization_id!
  const [filter, setFilter] = useState<'open' | 'all'>('open')
  const [open, setOpen] = useState(false)
  const [f, setF] = useState({ category: 'Any' as FoodCategory | 'Any', qty: '', urgency: 'medium' as Urgency, hours: '4', note: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const rows = state.requests.filter((r) => r.organization_id === orgId && (filter === 'all' || r.status === 'open'))

  const columns: Column<FoodRequest>[] = [
    { key: 'what', header: 'Requirement', cell: (r) => <div><p className="font-medium">{r.quantity_required} meals · {r.food_category}</p><p className="text-xs text-ink-subtle">{r.note ?? '—'}</p></div> },
    { key: 'urg', header: 'Urgency', cell: (r) => <UrgencyBadge urgency={r.urgency} /> },
    { key: 'by', header: 'Needed by', cell: (r) => <span className="text-ink-muted">{fmtDateTime(r.needed_by)}</span> },
    { key: 'st', header: 'Status', cell: (r) => <Badge tone={r.status === 'open' ? 'blue' : r.status === 'fulfilled' ? 'green' : 'gray'} dot className="capitalize">{r.status}</Badge> },
  ]

  async function submit() {
    const e: Record<string, string> = {}
    const q = Number(f.qty)
    if (!(q >= 10)) e.qty = 'Enter at least 10 meals'
    else if (q > 2000) e.qty = 'Split very large requirements into several requests'
    if (!(Number(f.hours) >= 1)) e.hours = 'At least 1 hour'
    setErr(e)
    if (Object.keys(e).length) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    dispatch({ type: 'addRequest', request: { id: `rq-${Date.now()}`, organization_id: orgId, food_category: f.category, quantity_required: q, urgency: f.urgency, status: 'open', needed_by: new Date(Date.now() + Number(f.hours) * 3600000).toISOString(), note: f.note || undefined } })
    setSaving(false)
    setOpen(false)
    setF({ category: 'Any', qty: '', urgency: 'medium', hours: '4', note: '' })
    toast({ title: 'Request published', body: 'Institutions and the matching engine can now see your requirement.' })
  }

  return (
    <>
      <PageHeader title="Food Requests" description="Tell the network what you need. Open requests raise your match score for relevant surplus." actions={<Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>New request</Button>} />
      <Card>
        <div className="flex gap-2 p-4">
          <Chip active={filter === 'open'} onClick={() => setFilter('open')}>Open</Chip>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>All</Chip>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Food requests" empty={<span className="inline-flex items-center gap-2"><Inbox className="size-4" /> No requests yet.</span>} />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="New food request" description="Visible to verified institutions and used by the matching engine." footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} loading={saving}>Publish request</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Food category">{(p) => <Select {...p} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as typeof f.category })}>{CATS.map((c) => <option key={c}>{c}</option>)}</Select>}</Field>
          <Field label="Meals required" required error={err.qty}>{(p) => <Input {...p} data-autofocus type="number" min={0} value={f.qty} onChange={(e) => setF({ ...f, qty: e.target.value })} />}</Field>
          <Field label="Urgency">{(p) => <Select {...p} value={f.urgency} onChange={(e) => setF({ ...f, urgency: e.target.value as Urgency })}>{['critical', 'high', 'medium', 'low'].map((u) => <option key={u} value={u} className="capitalize">{u[0].toUpperCase() + u.slice(1)}</option>)}</Select>}</Field>
          <Field label="Needed within (hours)" required error={err.hours}>{(p) => <Input {...p} type="number" min={1} value={f.hours} onChange={(e) => setF({ ...f, hours: e.target.value })} />}</Field>
          <Field label="Note" hint="Optional — e.g. dietary needs, serving time" className="sm:col-span-2">{(p) => <Textarea {...p} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />}</Field>
        </div>
      </Modal>
    </>
  )
}
