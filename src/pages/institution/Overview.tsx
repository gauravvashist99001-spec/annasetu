import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BrainCircuit, ChefHat, HandPlatter, Leaf, PackagePlus, Scale, Soup, UtensilsCrossed } from 'lucide-react'
import { ButtonLink, Card, CardBody, CardHeader, DemoTag, ListingBadge, PageHeader, StatCard, StatusBadge } from '@/components/ui'
import { AIInsightHero } from '@/components/dashboard/InsightCards'
import { BacktestChart, TomorrowForecast } from '@/components/dashboard/Forecast'
import { BarSeriesChart, DonutChart, TimeSeriesChart } from '@/components/charts/Charts'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useDemandModel } from '@/hooks/useDemandModel'
import { useNow } from '@/hooks/useNow'
import { forecast, generateInsights, isoDate, mealsToKg } from '@/services/prediction'
import { categoryDistribution, weeklyRedistribution } from '@/data/impact'
import { fmtDateShort, fmtNum, timeRemaining } from '@/utils/format'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export default function InstitutionOverview() {
  const { session } = useAuth()
  const { state } = useData()
  const model = useDemandModel()
  const now = useNow()
  const orgId = session!.user.organization_id!
  const insights = useMemo(() => generateInsights(model), [model])
  const preds = useMemo(() => forecast(model, isoDate(1)), [model])

  const h = model.history
  const lastDate = h[h.length - 1].date
  const today = h.filter((r) => r.date === lastDate)
  const prepared = today.reduce((s, r) => s + r.prepared, 0)
  const consumed = today.reduce((s, r) => s + r.consumed, 0)
  const surplus = prepared - consumed

  const days = [...new Set(h.map((r) => r.date))].slice(-30)
  const wasteTrend = days.map((d) => {
    const rs = h.filter((r) => r.date === d)
    return { date: d, surplus: rs.reduce((s, r) => s + r.prepared - r.consumed, 0) }
  })
  const prevWeek = wasteTrend.slice(-14, -7).reduce((s, d) => s + d.surplus, 0)
  const thisWeek = wasteTrend.slice(-7).reduce((s, d) => s + d.surplus, 0)
  const wasteDelta = ((thisWeek - prevWeek) / prevWeek) * 100

  const myDeliveries = state.deliveries.filter((d) => d.source_id === orgId)
  const delivered = myDeliveries.filter((d) => d.status === 'delivered')
  const mealsRedistributed = 3920 + delivered.reduce((s, d) => s + d.meals, 0) - 155 // demo baseline + live
  const myListings = state.listings.filter((l) => l.organization_id === orgId)

  return (
    <>
      <PageHeader
        eyebrow={<DemoTag />}
        title={`${greeting()}, ${session!.user.name.split(' ')[0]}`}
        description="Here’s what’s happening in your kitchen today, and what the model expects tomorrow."
        actions={
          <>
            <ButtonLink to="/app/prediction" variant="outline" icon={<BrainCircuit className="size-4" />}>View prediction</ButtonLink>
            <ButtonLink to="/app/surplus/new" icon={<PackagePlus className="size-4" />}>Register surplus</ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatCard label="Today’s Food Prepared" value={fmtNum(prepared)} unit="meals" icon={<ChefHat className="size-4" />} tone="gray" footnote={`≈ ${fmtNum(mealsToKg(prepared))} kg · ${fmtDateShort(lastDate)}`} />
        <StatCard label="Today’s Consumption" value={fmtNum(consumed)} unit="meals" icon={<UtensilsCrossed className="size-4" />} tone="blue" footnote={`${((consumed / prepared) * 100).toFixed(1)}% of prepared`} />
        <StatCard label="Potential Surplus" value={fmtNum(surplus)} unit="meals" icon={<Soup className="size-4" />} tone="amber" delta={{ value: `${Math.abs(wasteDelta).toFixed(0)}%`, direction: wasteDelta > 0 ? 'up' : 'down', good: wasteDelta <= 0 }} />
        <StatCard label="Food Saved" value={fmtNum(mealsToKg(mealsRedistributed))} unit="kg" icon={<Scale className="size-4" />} footnote="Since joining · confirmed deliveries" />
        <div className="col-span-2 lg:col-span-1">
          <StatCard label="Meals Redistributed" value={fmtNum(mealsRedistributed)} icon={<HandPlatter className="size-4" />} delta={{ value: '12%', direction: 'up', good: true, label: 'vs last month' }} />
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <AIInsightHero insight={insights[1]} />
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Consumption vs prediction" subtitle={`Lunch · ${model.holdoutDays}-day hold-out · recorded vs model`} />
          <CardBody><BacktestChart model={model} height={260} /></CardBody>
        </Card>
        <Card>
          <CardHeader title="Tomorrow’s forecast" subtitle={fmtDateShort(isoDate(1))} action={<Link to="/app/prediction" className="text-[13px] font-medium text-tech-700 hover:underline">Details</Link>} />
          <CardBody><TomorrowForecast predictions={preds} /></CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Food waste trend" subtitle="Surplus servings per day (prepared − consumed), last 30 days" />
          <CardBody>
            <TimeSeriesChart data={wasteTrend} xKey="date" xFormatter={fmtDateShort} unit=" meals" height={230} caption="Daily surplus servings, last 30 days" series={[{ key: 'surplus', label: 'Surplus', color: '#d97706', area: true }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Food category waste" subtitle="Share of registered surplus" />
          <CardBody><DonutChart data={categoryDistribution} height={170} caption="Share of registered surplus by food category" /></CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Weekly redistribution" subtitle="Surplus registered vs redistributed (meals)" />
          <CardBody>
            <BarSeriesChart data={weeklyRedistribution} xKey="week" height={240} unit=" meals" caption="Weekly surplus vs redistributed" series={[{ key: 'surplus', label: 'Surplus registered', color: '#cbd5e1' }, { key: 'redistributed', label: 'Redistributed', color: '#16a34a' }]} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Active listings & deliveries" subtitle="Live from your kitchen" action={<Link to="/app/redistribution" className="inline-flex items-center gap-1 text-[13px] font-medium text-brand-800 hover:underline">All <ArrowRight className="size-3.5" /></Link>} />
          <ul className="mt-3 divide-y divide-line">
            {myListings.slice(0, 3).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{l.food_name}</p>
                  <p className="text-xs text-ink-subtle">{l.servings} meals · {l.status === 'available' ? `${timeRemaining(l.available_until, now)} left` : l.category}</p>
                </div>
                <ListingBadge status={l.status} />
              </li>
            ))}
            {myDeliveries.slice(0, 3).map((d) => (
              <li key={d.id}>
                <Link to={`/app/track/${d.tracking_id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="num font-mono text-[13px] font-semibold text-ink">{d.tracking_id}</p>
                    <p className="truncate text-xs text-ink-subtle">{state.organizations.find((o) => o.id === d.recipient_id)?.name} · {d.meals} meals</p>
                  </div>
                  <StatusBadge status={d.status} />
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 border-t border-line px-5 py-3 text-xs text-ink-subtle">
            <Leaf className="size-3.5 text-brand-600" aria-hidden /> Est. {fmtNum(mealsToKg(mealsRedistributed) * 2.5)} kg CO₂e avoided since joining (estimate)
          </div>
        </Card>
      </div>
    </>
  )
}
