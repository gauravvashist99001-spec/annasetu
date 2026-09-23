import { Building2, HandPlatter, Info, Leaf, Scale, Target } from 'lucide-react'
import { Card, CardBody, CardHeader, DemoTag, StatCard } from '@/components/ui'
import { BarSeriesChart, DonutChart, TimeSeriesChart } from '@/components/charts/Charts'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useData } from '@/context/DataContext'
import { categoryDistribution, institutionComparison, monthlyRescued, platformStats } from '@/data/impact'
import { CO2E_PER_KG } from '@/services/prediction'
import { fmtNum } from '@/utils/format'

/** Platform impact. `anonymized` hides exact partner locations (public page). */
export function ImpactDashboard({ anonymized }: { anonymized?: boolean }) {
  const { state } = useData()
  const s = platformStats
  const co2 = s.food_diverted_kg * CO2E_PER_KG
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"> <span className="text-xs text-ink-subtle">Prototype figures — computed from confirmed deliveries in production.</span></div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Meals Rescued" value={fmtNum(s.meals_rescued)} icon={<HandPlatter className="size-4" />} delta={{ value: '25%', direction: 'up', good: true, label: 'vs last month' }} />
        <StatCard label="Food Saved" value={fmtNum(s.food_diverted_kg)} unit="kg" icon={<Scale className="size-4" />} />
        <StatCard label="Redistribution Success" value={`${s.success_rate}%`} icon={<Target className="size-4" />} tone="blue" footnote="Delivered ÷ matched" />
        <StatCard label="Organizations Helped" value={s.organizations_helped} icon={<Building2 className="size-4" />} tone="amber" />
        <div className="col-span-2 lg:col-span-1">
          <StatCard label="CO₂e avoided (estimate)*" value={`~${(co2 / 1000).toFixed(1)}`} unit="t" icon={<Leaf className="size-4" />} footnote="Estimate — see methodology" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card><CardHeader title="Monthly food rescued" subtitle="Meals delivered per month" /><CardBody><TimeSeriesChart data={monthlyRescued} xKey="month" unit=" meals" height={260} caption="Monthly meals rescued" series={[{ key: 'meals', label: 'Meals', area: true }]} /></CardBody></Card>
        <Card><CardHeader title="Food category distribution" subtitle="Share of rescued food" /><CardBody><DonutChart data={categoryDistribution} height={180} caption="Rescued food by category" /></CardBody></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Card><CardHeader title="Institution comparison" subtitle="Meals redistributed" /><CardBody><BarSeriesChart data={institutionComparison} xKey="short" horizontal unit=" meals" height={260} caption="Meals redistributed by institution" series={[{ key: 'meals', label: 'Meals' }]} /></CardBody></Card>
        <Card className="p-4">
          <p className="text-[15px] font-semibold text-ink">Redistribution locations</p>
          <p className="mb-3 text-[13px] text-ink-subtle">{anonymized ? 'Partner locations are approximate and anonymised.' : 'Partners and delivery routes.'}</p>
          <NetworkMap height={300} anonymized={anonymized} organizations={state.organizations.filter((o) => o.verification_status === 'verified')} routes={anonymized ? [] : state.deliveries.map((d) => ({ id: d.id, from: d.source_id, to: d.recipient_id, active: d.status !== 'delivered' }))} />
        </Card>
      </div>

      <Card id="methodology" className="p-5">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Info className="size-4 text-tech-600" aria-hidden /> Methodology</p>
        <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-ink-muted">
          <li><span className="font-medium text-ink">Meals rescued</span> — servings on deliveries the recipient confirmed as received. Unconfirmed deliveries are excluded.</li>
          <li><span className="font-medium text-ink">Food saved (kg)</span> — weight declared by the donor at registration.</li>
          <li><span className="font-medium text-ink">*CO₂e avoided</span> — kg food saved × {CO2E_PER_KG} kg CO₂e/kg, an illustrative factor within the range reported by food-waste lifecycle studies. Actual values vary widely by food type, sourcing and the disposal route avoided; treat this as an order-of-magnitude estimate, not a verified carbon figure.</li>
          <li><span className="font-medium text-ink">Success rate</span> — delivered ÷ matched listings in the period.</li>
        </ul>
      </Card>
    </div>
  )
}
