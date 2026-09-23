import { ArrowDown, Coffee, Moon, Sun } from 'lucide-react'
import type { MealType, Prediction, RiskLevel } from '@/types'
import { TimeSeriesChart } from '@/components/charts/Charts'
import type { DemandModel } from '@/services/prediction'
import { fmtDateShort } from '@/utils/format'
import { cn } from '@/utils/cn'

const RISK_TEXT: Record<RiskLevel, string> = { low: 'text-brand-700', moderate: 'text-accent-700', high: 'text-red-700' }

const MEAL_META: Record<MealType, { label: string; icon: typeof Sun }> = {
  breakfast: { label: 'Breakfast', icon: Coffee },
  lunch: { label: 'Lunch', icon: Sun },
  dinner: { label: 'Dinner', icon: Moon },
}

export function overallRisk(preds: Prediction[]): RiskLevel {
  if (preds.some((p) => p.surplus_risk === 'high')) return 'high'
  if (preds.some((p) => p.surplus_risk === 'moderate')) return 'moderate'
  return 'low'
}

/** Tomorrow's expected meals — prediction, interval and the kitchen's habitual plan side-by-side. */
export function TomorrowForecast({ predictions, compact }: { predictions: Prediction[]; compact?: boolean }) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3">
      {predictions.map((p) => {
        const M = MEAL_META[p.meal_type]
        return (
          <li key={p.meal_type} className={cn('rounded-xl border border-line bg-white', compact ? 'p-3' : 'p-4')}>
            <p className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <M.icon className="size-3.5" aria-hidden /> {M.label}
            </p>
            <p className={cn('num mt-1.5 font-bold tracking-tight text-ink', compact ? 'text-2xl' : 'text-[28px]')}>{p.predicted_quantity}</p>
            <p className="num text-[11px] text-ink-subtle">
              range {p.interval[0]}–{p.interval[1]}
            </p>
            {!compact && (
              <div className="mt-3 space-y-1 border-t border-line pt-3 text-xs">
                <p className="flex justify-between text-ink-muted">Usual prep <span className="num font-semibold text-ink">{p.planned_quantity}</span></p>
                <p className="flex justify-between text-ink-muted">
                  Suggested
                  <span className={cn('num inline-flex items-center font-semibold', p.recommendation_pct < 0 ? 'text-brand-700' : 'text-ink')}>
                    {p.recommendation_pct < 0 ? <><ArrowDown className="size-3" aria-hidden />{Math.abs(p.recommendation_pct)}%</> : 'As usual'}
                  </span>
                </p>
                <p className="flex justify-between gap-2 text-ink-muted">
                  Risk
                  <span className={cn('inline-flex items-center gap-1 font-semibold capitalize', RISK_TEXT[p.surplus_risk])}>
                    <span className="size-1.5 rounded-full bg-current" aria-hidden />{p.surplus_risk}
                  </span>
                </p>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Hold-out backtest: actual consumption vs model prediction vs what the kitchen prepared. */
export function BacktestChart({ model, meal = 'lunch', height = 240, showPrepared = true }: { model: DemandModel; meal?: MealType; height?: number; showPrepared?: boolean }) {
  const data = model.meals[meal].backtest
  return (
    <TimeSeriesChart
      data={data}
      xKey="date"
      height={height}
      unit=" meals"
      xFormatter={(d) => fmtDateShort(d)}
      caption={`Actual vs predicted ${meal} consumption, last ${data.length} days`}
      series={[
        { key: 'actual', label: 'Actual (recorded)', color: '#16a34a', area: true },
        { key: 'predicted', label: 'Predicted (model)', color: '#2563eb', dashed: true },
        ...(showPrepared ? [{ key: 'prepared', label: 'Prepared', color: '#d97706' }] : []),
      ]}
    />
  )
}
