import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card, Chip, Input, PageHeader } from '@/components/ui'
import { useData } from '@/context/DataContext'
import { OrgTable } from './OrgTable'

export default function Organizations() {
  const { state } = useData()
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all' | 'institution' | 'ngo'>('all')
  const rows = state.organizations.filter((o) => (type === 'all' || o.type === type) && (o.name + o.area).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <PageHeader title="Organizations" description="Institutions and recipient organisations on the network." />
      <Card>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Chip active={type === 'all'} onClick={() => setType('all')}>All</Chip>
            <Chip active={type === 'institution'} onClick={() => setType('institution')}>Institutions</Chip>
            <Chip active={type === 'ngo'} onClick={() => setType('ngo')}>NGOs</Chip>
          </div>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
            <Input className="pl-9" placeholder="Search name or area" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search organisations" />
          </div>
        </div>
        <OrgTable rows={rows} caption="Organisations" />
      </Card>
    </>
  )
}
