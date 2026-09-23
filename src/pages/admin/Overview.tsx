import { Link } from 'react-router-dom'
import { ArrowRight, Building2, HandHeart, ListChecks, PackageCheck, Truck } from 'lucide-react'
import { Card, CardBody, CardHeader, DemoTag, PageHeader, StatCard, StatusBadge } from '@/components/ui'
import { TimeSeriesChart, BarSeriesChart } from '@/components/charts/Charts'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'
import { institutionComparison, monthlyRescued } from '@/data/impact'
import { OrgTable } from './OrgTable'

export default function AdminOverview() {
  const { state } = useData()
  const orgs = state.organizations
  const pending = orgs.filter((o) => o.verification_status === 'pending')
  const success = state.deliveries.filter((d) => d.status === 'delivered').length

  return (
    <>
      <PageHeader eyebrow={<DemoTag />} title="Platform Overview" description="Network health, verification queue and redistribution activity across AnnaSetu." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Total Institutions" value={orgs.filter((o) => o.type === 'institution').length} icon={<Building2 className="size-4" />} tone="gray" />
        <StatCard label="Verified NGOs" value={orgs.filter((o) => o.type === 'ngo' && o.verification_status === 'verified').length} icon={<HandHeart className="size-4" />} tone="amber" />
        <StatCard label="Active Volunteers" value={volunteers.filter((v) => v.verification_status === 'verified').length} icon={<Truck className="size-4" />} tone="blue" />
        <StatCard label="Food Listings" value={state.listings.length} icon={<ListChecks className="size-4" />} tone="gray" footnote={`${state.listings.filter((l) => l.status === 'available').length} available now`} />
        <div className="col-span-2 lg:col-span-1">
          <StatCard label="Successful Redistributions" value={success} icon={<PackageCheck className="size-4" />} footnote="In this demo dataset" />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader title="Verification requests" subtitle={`${pending.length} awaiting review`} action={<Link to="/app/verification" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-800 hover:underline">Queue <ArrowRight className="size-3.5" /></Link>} />
        <div className="mt-3"><OrgTable rows={[...pending, ...orgs.filter((o) => o.verification_status !== 'pending')].slice(0, 6)} caption="Organisations" /></div>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Meals rescued per month" subtitle="Platform-wide" />
          <CardBody><TimeSeriesChart data={monthlyRescued} xKey="month" height={240} unit=" meals" caption="Meals rescued per month" series={[{ key: 'meals', label: 'Meals', area: true }]} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Institution comparison" subtitle="Meals redistributed since joining" />
          <CardBody><BarSeriesChart data={institutionComparison} xKey="short" horizontal height={240} unit=" meals" caption="Meals redistributed by institution" series={[{ key: 'meals', label: 'Meals' }]} /></CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-4">
          <p className="mb-3 text-[15px] font-semibold text-ink">Network map</p>
          <NetworkMap height={360} organizations={orgs} routes={state.deliveries.map((d) => ({ id: d.id, from: d.source_id, to: d.recipient_id, active: d.status !== 'delivered' }))} />
        </Card>
        <Card>
          <CardHeader title="Recent transactions" action={<Link to="/app/transactions" className="text-[13px] font-medium text-brand-800 hover:underline">All</Link>} />
          <ul className="mt-3 divide-y divide-line">
            {state.deliveries.slice(0, 6).map((d) => (
              <li key={d.id}>
                <Link to={`/app/track/${d.tracking_id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="num font-mono text-[13px] font-semibold">{d.tracking_id}</p>
                    <p className="truncate text-xs text-ink-subtle">{orgs.find((o) => o.id === d.source_id)?.name} → {orgs.find((o) => o.id === d.recipient_id)?.name}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
