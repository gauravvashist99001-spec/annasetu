import { useMemo, useState } from 'react'
import { AlertTriangle, PackagePlus, Plus, Search, Warehouse } from 'lucide-react'
import { Badge, Button, Card, Chip, DataTable, DemoTag, Field, Input, Modal, PageHeader, Progress, Select, StatCard, useToast, type Column } from '@/components/ui'
import { ButtonLink } from '@/components/ui'

interface Item { id: string; name: string; category: string; stock: number; unit: string; par: number; expiresInDays: number; dailyUse: number }

/** DEMO DATA — raw-material inventory for the demo kitchen. */
const SEED: Item[] = [
  { id: 'i1', name: 'Basmati rice', category: 'Grains', stock: 420, unit: 'kg', par: 350, expiresInDays: 120, dailyUse: 62 },
  { id: 'i2', name: 'Toor dal', category: 'Pulses', stock: 96, unit: 'kg', par: 120, expiresInDays: 90, dailyUse: 18 },
  { id: 'i3', name: 'Wheat flour (atta)', category: 'Grains', stock: 310, unit: 'kg', par: 250, expiresInDays: 45, dailyUse: 55 },
  { id: 'i4', name: 'Paneer', category: 'Dairy', stock: 38, unit: 'kg', par: 20, expiresInDays: 2, dailyUse: 8 },
  { id: 'i5', name: 'Milk', category: 'Dairy', stock: 180, unit: 'L', par: 160, expiresInDays: 1, dailyUse: 150 },
  { id: 'i6', name: 'Potatoes', category: 'Vegetables', stock: 140, unit: 'kg', par: 120, expiresInDays: 14, dailyUse: 30 },
  { id: 'i7', name: 'Tomatoes', category: 'Vegetables', stock: 72, unit: 'kg', par: 50, expiresInDays: 3, dailyUse: 22 },
  { id: 'i8', name: 'Leafy greens', category: 'Vegetables', stock: 26, unit: 'kg', par: 20, expiresInDays: 1, dailyUse: 12 },
  { id: 'i9', name: 'Cooking oil', category: 'Staples', stock: 85, unit: 'L', par: 60, expiresInDays: 200, dailyUse: 9 },
  { id: 'i10', name: 'Bread loaves', category: 'Bakery', stock: 140, unit: 'packs', par: 80, expiresInDays: 2, dailyUse: 60 },
]

function status(i: Item) {
  const daysCover = i.stock / i.dailyUse
  if (daysCover > i.expiresInDays) return { label: 'Surplus risk', tone: 'amber' as const, note: `${Math.round(i.stock - i.dailyUse * i.expiresInDays)} ${i.unit} may expire unused` }
  if (i.stock < i.par * 0.8) return { label: 'Low stock', tone: 'blue' as const, note: `Below par (${i.par} ${i.unit})` }
  return { label: 'Healthy', tone: 'green' as const, note: `${daysCover.toFixed(1)} days of cover` }
}

export default function Inventory() {
  const toast = useToast()
  const [items, setItems] = useState(SEED)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Grains', stock: '', unit: 'kg', expires: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const cats = ['All', ...new Set(SEED.map((i) => i.category))]
  const rows = useMemo(() => items.filter((i) => (cat === 'All' || i.category === cat) && i.name.toLowerCase().includes(q.toLowerCase())), [items, q, cat])
  const atRisk = items.filter((i) => status(i).label === 'Surplus risk')

  const columns: Column<Item>[] = [
    { key: 'name', header: 'Item', cell: (i) => <div><p className="font-medium text-ink">{i.name}</p><p className="text-xs text-ink-subtle">{i.category}</p></div> },
    { key: 'stock', header: 'Stock', cell: (i) => <span className="num font-semibold">{i.stock} <span className="font-normal text-ink-subtle">{i.unit}</span></span> },
    { key: 'use', header: 'Daily use', hideOnMobile: true, cell: (i) => <span className="num text-ink-muted">{i.dailyUse} {i.unit}</span> },
    { key: 'cover', header: 'Cover vs shelf life', hideOnMobile: true, className: 'w-48', cell: (i) => {
      const cover = i.stock / i.dailyUse
      return <div className="w-40"><Progress value={(Math.min(cover, i.expiresInDays) / Math.max(cover, i.expiresInDays)) * 100} tone={cover > i.expiresInDays ? 'amber' : 'green'} label={`${i.name} cover`} /><p className="num mt-1 text-[11px] text-ink-subtle">{cover.toFixed(1)}d cover · {i.expiresInDays}d life</p></div>
    } },
    { key: 'status', header: 'Status', cell: (i) => { const s = status(i); return <div className="flex flex-col items-end gap-0.5 md:items-start"><Badge tone={s.tone} dot>{s.label}</Badge><span className="text-[11px] text-ink-subtle">{s.note}</span></div> } },
  ]

  function submit() {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Enter an item name'
    if (!(Number(form.stock) > 0)) e.stock = 'Enter a quantity greater than 0'
    if (!(Number(form.expires) >= 0) || form.expires === '') e.expires = 'Enter days until expiry'
    setErrors(e)
    if (Object.keys(e).length) return
    setItems((s) => [{ id: `i${Date.now()}`, name: form.name.trim(), category: form.category, stock: Number(form.stock), unit: form.unit, par: Number(form.stock), expiresInDays: Number(form.expires), dailyUse: Math.max(1, Number(form.stock) / 7) }, ...s])
    setOpen(false)
    setForm({ name: '', category: 'Grains', stock: '', unit: 'kg', expires: '' })
    toast({ title: 'Item added', body: `${form.name} added to inventory.` })
  }

  return (
    <>
      <PageHeader eyebrow={<DemoTag />} title="Food Inventory" description="Track raw materials against usage and shelf life to catch overstock before it becomes waste." actions={<Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>Add item</Button>} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Items tracked" value={items.length} icon={<Warehouse className="size-4" />} tone="gray" />
        <StatCard label="Surplus risk" value={atRisk.length} icon={<AlertTriangle className="size-4" />} tone="amber" footnote="Stock outlasts shelf life" />
        <StatCard label="Low stock" value={items.filter((i) => status(i).label === 'Low stock').length} tone="blue" />
        <StatCard label="Healthy" value={items.filter((i) => status(i).label === 'Healthy').length} />
      </div>

      {atRisk.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-[14px] border border-accent-100 bg-accent-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex gap-2 text-sm text-ink-muted">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-700" aria-hidden />
            <span><span className="font-semibold text-ink">{atRisk.map((i) => i.name).join(', ')}</span> may expire before use. Plan them into menus or register as surplus.</span>
          </p>
          <ButtonLink to="/app/surplus/new" size="sm" variant="outline" icon={<PackagePlus className="size-4" />}>Register surplus</ButtonLink>
        </div>
      )}

      <Card className="mt-4">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <Input placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" aria-label="Search inventory" />
          </div>
          <div className="flex flex-wrap gap-2">{cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} caption="Inventory items" empty="No items match your filters." />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add inventory item" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit}>Add item</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item name" required error={errors.name} className="sm:col-span-2">{(p) => <Input {...p} data-autofocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chana dal" />}</Field>
          <Field label="Category">{(p) => <Select {...p} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{cats.slice(1).map((c) => <option key={c}>{c}</option>)}</Select>}</Field>
          <div className="grid grid-cols-[1fr_90px] gap-2">
            <Field label="Quantity" required error={errors.stock}>{(p) => <Input {...p} type="number" min={0} inputMode="decimal" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />}</Field>
            <Field label="Unit">{(p) => <Select {...p} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>{['kg', 'L', 'packs', 'pcs'].map((u) => <option key={u}>{u}</option>)}</Select>}</Field>
          </div>
          <Field label="Days until expiry" required error={errors.expires} hint="Best-before or use-by" className="sm:col-span-2">{(p) => <Input {...p} type="number" min={0} value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} />}</Field>
        </div>
      </Modal>
    </>
  )
}
