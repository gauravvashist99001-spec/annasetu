import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Button, Card, CardBody, CardHeader, DemoTag, Input, PageHeader, Segmented, StatCard, useToast } from '@/components/ui'
import { BarSeriesChart, TimeSeriesChart } from '@/components/charts/Charts'
import { useDemandModel } from '@/hooks/useDemandModel'
import { categoryDistribution, monthlyRescued, surplusByTimeOfDay, weeklyRedistribution } from '@/data/impact'
import { fmtDateShort, fmtNum } from '@/utils/format'

type Range = '7' | '30' | '90' | 'custom'

export default function Analytics() {
  const model = useDemandModel()
  const toast = useToast()
  const h = model.history
  const allDays = useMemo(() => [...new Set(h.map((r) => r.date))], [h])
  const [range, setRange] = useState<Range>('30')
  const [from, setFrom] = useState(allDays[allDays.length - 30])
  const [to, setTo] = useState(allDays[allDays.length - 1])

  const days = useMemo(() => (range === 'custom' ? allDays.filter((d) => d >= from && d <= to) : allDays.slice(-Number(range))), [range, allDays, from, to])

  const daily = useMemo(
    () =>
      days.map((d) => {
        const rs = h.filter((r) => r.date === d)
        const prepared = rs.reduce((s, r) => s + r.prepared, 0)
        const consumed = rs.reduce((s, r) => s + r.consumed, 0)
        return { date: d, surplus: prepared - consumed, prepared, consumed }
      }),
    [days, h],
  )
  const weekly = useMemo(() => {
    // Full 7-day weeks only, counted back from the latest day, so no partial week looks like a drop.
    const out: { week: string; surplus: number }[] = []
    for (let end = daily.length; end - 7 >= 0; end -= 7) {
      const chunk = daily.slice(end - 7, end)
      out.unshift({ week: `w/c ${fmtDateShort(chunk[0].date)}`, surplus: chunk.reduce((s, d) => s + d.surplus, 0) })
    }
    return out
  }, [daily])
  const predVsActual = useMemo(() => {
    const bt = new Map(['breakfast', 'lunch', 'dinner'].flatMap((m) => model.meals[m as 'lunch'].backtest.map((b) => [`${b.date}-${m}`, b])))
    return days
      .map((d) => {
        const rows = ['breakfast', 'lunch', 'dinner'].map((m) => bt.get(`${d}-${m}`)).filter(Boolean)
        if (rows.length < 3) return null
        return { date: d, actual: rows.reduce((s, r) => s + r!.actual, 0), predicted: rows.reduce((s, r) => s + r!.predicted, 0) }
      })
      .filter(Boolean) as { date: string; actual: number; predicted: number }[]
  }, [days, model])
  const rate = weeklyRedistribution.map((w) => ({ week: w.week, rate: Math.round((w.redistributed / w.surplus) * 100) }))

  const totalSurplus = daily.reduce((s, d) => s + d.surplus, 0)
  const totalPrepared = daily.reduce((s, d) => s + d.prepared, 0)

  return (
    <>
      <PageHeader
        eyebrow={<DemoTag />}
        title="Analytics"
        description="Where surplus comes from, when it happens, and how much of it is being redistributed."
        actions={<Button variant="outline" icon={<Download className="size-4" />} onClick={() => toast({ title: 'Report queued', body: 'PDF report generation runs server-side in production.', tone: 'info' })}>Export report</Button>}
      />

      <Card className="mb-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <Segmented label="Date range" value={range} onChange={setRange} options={[{ value: '7', label: 'Last 7 days' }, { value: '30', label: 'Last 30 days' }, { value: '90', label: 'Last 3 months' }, { value: 'custom', label: 'Custom' }]} />
        {range === 'custom' && (
          <div className="flex items-center gap-2">
            <Input type="date" aria-label="From" value={from} min={allDays[0]} max={to} onChange={(e) => setFrom(e.target.value)} className="w-40" />
            <span className="text-ink-subtle">–</span>
            <Input type="date" aria-label="To" value={to} min={from} max={allDays[allDays.length - 1]} onChange={(e) => setTo(e.target.value)} className="w-40" />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Surplus servings" value={fmtNum(totalSurplus)} footnote={`${days.length} days`} tone="amber" />
        <StatCard label="Surplus rate" value={`${((totalSurplus / Math.max(1, totalPrepared)) * 100).toFixed(1)}%`} footnote="of prepared" tone="amber" />
        <StatCard label="Redistribution rate" value={`${rate[rate.length - 1].rate}%`} footnote="latest week" />
        <StatCard label="Avg daily surplus" value={fmtNum(totalSurplus / Math.max(1, days.length))} unit="meals" tone="gray" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card><CardHeader title="Daily waste trend" subtitle="Surplus servings per day" /><CardBody><TimeSeriesChart data={daily} xKey="date" xFormatter={fmtDateShort} unit=" meals" height={240} caption="Daily surplus" series={[{ key: 'surplus', label: 'Surplus', color: '#d97706', area: true }]} /></CardBody></Card>
        <Card><CardHeader title="Weekly waste trend" subtitle="Surplus servings per full week" /><CardBody><BarSeriesChart data={weekly} xKey="week" unit=" meals" height={240} caption="Weekly surplus" series={[{ key: 'surplus', label: 'Surplus', color: '#d97706' }]} /></CardBody></Card>
        <Card><CardHeader title="Predicted vs actual consumption" subtitle="All meals · hold-out period within range" /><CardBody>{predVsActual.length ? <TimeSeriesChart data={predVsActual} xKey="date" xFormatter={fmtDateShort} unit=" meals" height={240} caption="Predicted vs actual" series={[{ key: 'actual', label: 'Actual (recorded)', color: '#16a34a' }, { key: 'predicted', label: 'Predicted (model)', color: '#2563eb', dashed: true }]} /> : <p className="py-16 text-center text-sm text-ink-subtle">Hold-out predictions cover the last {model.holdoutDays} days — widen the range to include them.</p>}</CardBody></Card>
        <Card><CardHeader title="Monthly food saved" subtitle="kg redistributed (platform)" /><CardBody><BarSeriesChart data={monthlyRescued} xKey="month" unit=" kg" height={240} caption="Monthly food saved" series={[{ key: 'kg', label: 'Food saved' }]} /></CardBody></Card>
        <Card><CardHeader title="Redistribution rate" subtitle="% of registered surplus redistributed" /><CardBody><TimeSeriesChart data={rate} xKey="week" unit="%" height={220} caption="Weekly redistribution rate" series={[{ key: 'rate', label: 'Redistribution rate' }]} /></CardBody></Card>
        <Card><CardHeader title="Surplus by time of day" subtitle="Average servings registered" /><CardBody><BarSeriesChart data={surplusByTimeOfDay} xKey="slot" unit=" meals" height={220} caption="Surplus by time of day" highlightMax series={[{ key: 'servings', label: 'Servings', color: '#94a3b8' }]} /></CardBody></Card>
      </div>
      <Card className="mt-4">
        <CardHeader title="Top wasted food categories" subtitle="Share of recorded surplus" />
        <CardBody><BarSeriesChart data={categoryDistribution} xKey="name" horizontal unit="%" height={260} caption="Top wasted categories" highlightMax series={[{ key: 'value', label: 'Share', color: '#94a3b8' }]} /></CardBody>
      </Card>
    </>
  )
}
