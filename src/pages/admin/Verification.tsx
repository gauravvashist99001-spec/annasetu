import { useState } from 'react'
import { BadgeCheck, Clock, ShieldCheck, XCircle } from 'lucide-react'
import { Card, Chip, PageHeader, StatCard, VerifiedBadge, Avatar } from '@/components/ui'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'
import { OrgTable } from './OrgTable'

export default function Verification() {
  const { state } = useData()
  const [tab, setTab] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const rows = state.organizations.filter((o) => o.verification_status === tab)
  const count = (s: string) => state.organizations.filter((o) => o.verification_status === s).length

  return (
    <>
      <PageHeader title="Verification" description="Only verified organisations and volunteers can transact. Review documents before approving." />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="Pending" value={count('pending')} icon={<Clock className="size-4" />} tone="amber" />
        <StatCard label="Verified" value={count('verified')} icon={<BadgeCheck className="size-4" />} />
        <StatCard label="Rejected" value={count('rejected')} icon={<XCircle className="size-4" />} tone="gray" />
      </div>
      <Card className="mt-6">
        <div className="flex flex-wrap gap-2 p-4">
          {(['pending', 'verified', 'rejected'] as const).map((t) => (
            <Chip key={t} active={tab === t} onClick={() => setTab(t)} count={count(t)}><span className="capitalize">{t}</span></Chip>
          ))}
        </div>
        <OrgTable rows={rows} caption={`${tab} organisations`} />
      </Card>
      <Card className="mt-6">
        <div className="flex items-center gap-2 px-5 pt-5"><ShieldCheck className="size-4 text-brand-700" aria-hidden /><h2 className="text-[15px] font-semibold">Volunteers</h2></div>
        <ul className="mt-3 divide-y divide-line">
          {volunteers.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3"><Avatar name={v.name} size="sm" /><div><p className="text-sm font-medium">{v.name}</p><p className="text-xs text-ink-subtle">{v.vehicle} · {v.area}</p></div></div>
              <VerifiedBadge status={v.verification_status} label="Verified Volunteer" />
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
