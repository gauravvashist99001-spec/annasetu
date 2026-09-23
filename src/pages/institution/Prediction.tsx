import { useMemo, useState } from 'react'
import { ArrowRight, BrainCircuit, CalendarDays, ClipboardList, Database, FlaskConical, Info, Lightbulb, Sparkles } from 'lucide-react'
import type { MealType } from '@/types'
import { Badge, Button, Card, CardBody, CardHeader, DemoTag, PageHeader, RiskBadge, Segmented, Select, useToast } from '@/components/ui'
import { BacktestChart, TomorrowForecast, overallRisk } from '@/components/dashboard/Forecast'
import { InsightCards, ModelLabel } from '@/components/dashboard/InsightCards'
import { TimeSeriesChart } from '@/components/charts/Charts'
import { useDemandModel } from '@/hooks/useDemandModel'
import { FEATURES, forecast, generateInsights, isoDate, weekOutlook } from '@/services/prediction'
import { RESIDENTS } from '@/data/history'
import { fmtDate, fmtDateShort } from '@/utils/format'
import { cn } from '@/utils/cn'

const PIPE = [
  { label: 'Historical data', sub: 'Kitchen logs' },
  { label: 'Preprocessing', sub: 'Clean · sort · align' },
  { label: 'Feature engineering', sub: 'DOW · events · lags' },
  { label: 'ML model', sub: 'Ridge regression' },
  { label: 'Demand prediction', sub: '+ 90% interval' },
  { label: 'Surplus risk', sub: 'Plan vs prediction' },
  { label: 'Recommendation', sub: 'Human decides' },
]

export default function Prediction() {
  const model = useDemandModel()
  const toast = useToast()
  const [offset, setOffset] = useState(1)
  const date = isoDate(offset)
  const dow = new Date(date + 'T12:00:00').getDay()
  const defaultHead = Math.round(RESIDENTS * (dow === 0 || dow === 6 ? 0.86 : dow === 5 ? 0.93 : 1))
  const [headcount, setHeadcount] = useState<number | null>(null)
  const [event, setEvent] = useState(false)
  const [holiday, setHoliday] = useState(false)
  const [meal, setMeal] = useState<MealType>('lunch')

  const head = headcount ?? defaultHead
  const preds = useMemo(() => forecast(model, date, { expected_people: head, event, holiday }), [model, date, head, event, holiday])
  const outlook = useMemo(() => weekOutlook(model), [model])
  const insights = useMemo(() => generateInsights(model), [model])
  const m = model.meals[meal]
  const risk = overallRisk(preds)

  return (
    <>
      <PageHeader
        eyebrow={<DemoTag />}
        title="Demand Prediction"
        description="Forecast servings per meal, see where your usual plan is likely to over-produce, and adjust before cooking."
      />

      {/* ----- Scenario controls ----- */}
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[180px_1fr_auto] md:items-end">
          <div>
            <label htmlFor="pdate" className="text-[13px] font-medium text-ink">Forecast date</label>
            <div className="mt-1.5">
              <Select id="pdate" value={offset} onChange={(e) => { setOffset(Number(e.target.value)); setHeadcount(null) }}>
                {Array.from({ length: 7 }, (_, i) => i + 1).map((o) => (
                  <option key={o} value={o}>{o === 1 ? 'Tomorrow' : new Date(isoDate(o) + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'long' })} · {fmtDateShort(isoDate(o))}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="head" className="text-[13px] font-medium text-ink">Expected headcount</label>
              <span className="num text-[13px] font-semibold text-ink">{head} residents</span>
            </div>
            <input id="head" type="range" min={400} max={1000} step={10} value={head} onChange={(e) => setHeadcount(Number(e.target.value))} className="mt-3 w-full accent-brand-700" />
          </div>
          <fieldset className="flex gap-2">
            <legend className="sr-only">Context</legend>
            {[
              ['Campus event', event, setEvent],
              ['Holiday', holiday, setHoliday],
            ].map(([label, val, set]) => (
              <label key={label as string} className={cn('flex h-10 cursor-pointer items-center gap-2 rounded-[10px] border px-3 text-[13px] font-medium transition-colors', val ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line bg-white text-ink-muted hover:border-line-strong')}>
                <input type="checkbox" className="accent-brand-700" checked={val as boolean} onChange={(e) => (set as (v: boolean) => void)(e.target.checked)} />
                {label as string}
              </label>
            ))}
          </fieldset>
        </div>
      </Card>

      {/* ----- Prediction + recommendation ----- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader
            icon={<BrainCircuit className="size-4" />}
            title={<span className="flex flex-wrap items-center gap-2">Prediction <Badge tone="blue">Model output</Badge></span>}
            subtitle={`${fmtDate(date)} · servings per meal with 90% interval`}
            action={<RiskBadge risk={risk} />}
          />
          <CardBody><TomorrowForecast predictions={preds} /></CardBody>
        </Card>
        <Card className="flex flex-col">
          <CardHeader icon={<Lightbulb className="size-4" />} title={<span className="flex flex-wrap items-center gap-2">Recommendation <Badge tone="purple">Suggested action</Badge></span>} subtitle="Derived from prediction vs your habitual plan" />
          <CardBody className="flex flex-1 flex-col">
            <ul className="space-y-2.5">
              {preds.map((p) => (
                <li key={p.meal_type} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                  <span className="capitalize text-ink-muted">{p.meal_type}</span>
                  {p.recommendation_pct < 0 ? (
                    <span className="font-semibold text-brand-800">Prepare ~{Math.abs(p.recommendation_pct)}% less <span className="num font-normal text-ink-subtle">({p.planned_quantity} → {Math.round(p.planned_quantity * (1 + p.recommendation_pct / 100))})</span></span>
                  ) : (
                    <span className="font-medium text-ink">Keep usual plan</span>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex gap-2 text-xs leading-relaxed text-ink-subtle">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Suggestions keep a buffer of half the model’s uncertainty band. Kitchen staff make the final call.
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <Button size="sm" onClick={() => toast({ title: 'Plan updated', body: 'Adjusted quantities shared with the kitchen team (demo).' })}>
                Apply to kitchen plan
              </Button>
              <ModelLabel className="self-center" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ----- Outlook ----- */}
      <Card className="mt-4">
        <CardHeader icon={<CalendarDays className="size-4" />} title="7-day outlook" subtitle="Total daily servings: predicted (with range) vs habitual plan" />
        <CardBody>
          <TimeSeriesChart
            data={outlook}
            xKey="date"
            xFormatter={(d) => new Date(d + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}
            unit=" meals"
            caption="7-day predicted total servings vs habitual plan"
            band={{ low: 'low', high: 'high', label: 'Prediction range' }}
            zeroBaseline={false}
            series={[
              { key: 'predicted', label: 'Predicted', color: '#2563eb' },
              { key: 'planned', label: 'Habitual plan', color: '#d97706', dashed: true },
            ]}
          />
        </CardBody>
      </Card>

      {/* ----- Actual recorded vs model ----- */}
      <Card className="mt-4">
        <CardHeader
          icon={<ClipboardList className="size-4" />}
          title={<span className="flex flex-wrap items-center gap-2">Actual recorded data vs model <Badge tone="green">Recorded</Badge></span>}
          subtitle={`${model.holdoutDays}-day hold-out the model never saw during training`}
          action={<Segmented label="Meal" value={meal} onChange={setMeal} options={[{ value: 'breakfast', label: 'Breakfast' }, { value: 'lunch', label: 'Lunch' }, { value: 'dinner', label: 'Dinner' }]} />}
        />
        <CardBody>
          <BacktestChart model={model} meal={meal} height={280} />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Model error (MAPE)', `${m.mape.toFixed(1)}%`, 'prediction vs actual'],
              ['Planning gap', `${m.baselineMape.toFixed(1)}%`, 'prepared vs actual'],
              ['Potential reduction', `${Math.max(0, m.baselineMape - m.mape).toFixed(1)} pts`, 'in mismatch'],
              ['Residual σ', `±${m.residualStd.toFixed(0)}`, 'servings'],
            ].map(([k, v, s]) => (
              <div key={k} className="rounded-lg border border-line p-3">
                <p className="text-xs text-ink-subtle">{k}</p>
                <p className="num mt-0.5 text-lg font-bold text-ink">{v}</p>
                <p className="text-[11px] text-ink-subtle">{s}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ----- Model card ----- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader icon={<Database className="size-4" />} title="Model card" subtitle="How this prediction is made" />
          <CardBody className="space-y-4">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs">
              {PIPE.map((p, i) => (
                <li key={p.label} className="flex items-center gap-1.5">
                  <span className={cn('rounded-lg border px-2 py-1.5', i === 3 ? 'border-tech-100 bg-tech-50' : 'border-line bg-white')}>
                    <span className="block font-semibold text-ink">{p.label}</span>
                    <span className="block text-[10px] text-ink-subtle">{p.sub}</span>
                  </span>
                  {i < PIPE.length - 1 && <ArrowRight className="size-3 text-ink-subtle" aria-hidden />}
                </li>
              ))}
            </ol>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              <dt className="text-ink-subtle">Algorithm</dt><dd className="font-medium text-ink">Ridge regression (λ = 0.5), one per meal</dd>
              <dt className="text-ink-subtle">Training rows</dt><dd className="num font-medium text-ink">{(model.trainedOn / 3 - 7 - model.holdoutDays) * 3} meal-days</dd>
              <dt className="text-ink-subtle">Features</dt><dd className="font-medium text-ink">{FEATURES.length - 1} ({FEATURES.slice(1).join(', ')})</dd>
              <dt className="text-ink-subtle">Data</dt><dd className="font-medium text-ink">Synthetic demo kitchen log</dd>
              <dt className="text-ink-subtle">Server twin</dt><dd className="font-medium text-ink">scikit-learn · FastAPI <code className="text-xs">/api/predictions</code></dd>
            </dl>
            <p className="flex gap-2 rounded-lg border border-dashed border-accent-500/50 bg-accent-50 p-3 text-xs leading-relaxed text-ink-muted">
              <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-accent-700" aria-hidden />
              Prototype model trained on demo data. It is not production-accurate and should be re-trained and validated on each institution’s own records.
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader icon={<Sparkles className="size-4" />} title="What drives the prediction" subtitle={`Relative influence · ${meal}`} />
          <CardBody>
            <ul className="space-y-3">
              {m.importance.map((f) => (
                <li key={f.feature}>
                  <div className="flex justify-between text-[13px]"><span className="text-ink-muted">{f.feature}</span><span className="num font-semibold text-ink">{f.value}%</span></div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-tech-600" style={{ width: `${f.value}%` }} /></div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ink-subtle">Influence = |coefficient| × feature spread, normalised. Indicative only.</p>
          </CardBody>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-ink">AI insights</h2>
      <InsightCards insights={insights} columns={4} />
    </>
  )
}
