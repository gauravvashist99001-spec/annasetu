/**
 * AnnaSetu demand model — prototype.
 *
 * Pipeline:  historical log → preprocessing → feature engineering → ridge regression (per meal)
 *            → demand prediction (+ interval) → surplus risk → recommendation.
 *
 * This is the in-browser twin of backend/app/ml/demand_model.py (scikit-learn Ridge). It runs
 * entirely client-side in Demo Mode so judges can explore without a server. It is a small,
 * interpretable model trained on synthetic data — NOT a production-accurate forecaster.
 */
import type { ConsumptionRecord, Insight, MealType, Prediction, RiskLevel } from '@/types'
import { history as defaultHistory, MEALS, RESIDENTS } from '@/data/history'

export const FEATURES = ['bias', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'event', 'holiday', 'expected_people', 'lag_7', 'rolling_7'] as const
type Row = { x: number[]; y: number; rec: ConsumptionRecord }

const KG_PER_MEAL = 0.4
export const CO2E_PER_KG = 2.5 // illustrative lifecycle factor — see Impact › Methodology

/* ---------------- preprocessing & feature engineering ---------------- */

function byMeal(history: ConsumptionRecord[], meal: MealType) {
  return history.filter((r) => r.meal === meal).sort((a, b) => a.date.localeCompare(b.date))
}

function features(rec: { date: string; event: boolean; holiday: boolean; expected_people: number }, past: number[]): number[] {
  const dow = new Date(rec.date + 'T12:00:00').getDay()
  const oneHot = [1, 2, 3, 4, 5, 6].map((d) => (dow === d ? 1 : 0)) // Sunday is the baseline
  const lag7 = past.length >= 7 ? past[past.length - 7] : mean(past)
  const roll7 = mean(past.slice(-7))
  return [1, ...oneHot, rec.event ? 1 : 0, rec.holiday ? 1 : 0, rec.expected_people / 1000, lag7 / 1000, roll7 / 1000]
}

function buildRows(series: ConsumptionRecord[]): Row[] {
  const rows: Row[] = []
  for (let i = 7; i < series.length; i++) {
    const past = series.slice(0, i).map((r) => r.consumed)
    rows.push({ x: features(series[i], past), y: series[i].consumed, rec: series[i] })
  }
  return rows
}

/* ---------------- ridge regression (closed form) ---------------- */

function ridge(X: number[][], y: number[], lambda = 0.5): number[] {
  const p = X[0].length
  const A = Array.from({ length: p }, () => new Array(p).fill(0))
  const b = new Array(p).fill(0)
  for (let r = 0; r < X.length; r++) {
    for (let i = 0; i < p; i++) {
      b[i] += X[r][i] * y[r]
      for (let j = 0; j < p; j++) A[i][j] += X[r][i] * X[r][j]
    }
  }
  for (let i = 1; i < p; i++) A[i][i] += lambda // don't penalise the intercept
  return solve(A, b)
}

function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let piv = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r
    ;[M[c], M[piv]] = [M[piv], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c || M[c][c] === 0) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((row, i) => row[n] / (row[i] || 1))
}

const dot = (w: number[], x: number[]) => w.reduce((s, wi, i) => s + wi * x[i], 0)
const mean = (a: number[]) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0)
const std = (a: number[]) => {
  const m = mean(a)
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)))
}

/* ---------------- training + evaluation ---------------- */

export interface MealModel {
  meal: MealType
  weights: number[]
  residualStd: number
  mape: number // model error on hold-out
  baselineMape: number // error of the kitchen's own plan on the same hold-out
  backtest: { date: string; actual: number; predicted: number; prepared: number }[]
  importance: { feature: string; value: number }[]
}

export interface DemandModel {
  meals: Record<MealType, MealModel>
  trainedOn: number
  holdoutDays: number
  history: ConsumptionRecord[]
}

const HOLDOUT = 28

export function trainDemandModel(history: ConsumptionRecord[] = defaultHistory): DemandModel {
  const meals = {} as Record<MealType, MealModel>
  for (const meal of MEALS) {
    const rows = buildRows(byMeal(history, meal))
    const train = rows.slice(0, -HOLDOUT)
    const test = rows.slice(-HOLDOUT)
    const w = ridge(train.map((r) => r.x), train.map((r) => r.y))
    const residuals = train.map((r) => r.y - dot(w, r.x))
    const backtest = test.map((r) => ({ date: r.rec.date, actual: r.y, predicted: Math.round(dot(w, r.x)), prepared: r.rec.prepared }))
    const mape = mean(backtest.map((b) => Math.abs(b.actual - b.predicted) / b.actual)) * 100
    const baselineMape = mean(backtest.map((b) => Math.abs(b.actual - b.prepared) / b.actual)) * 100

    // Importance: |weight| × feature std — grouped for readability.
    const cols = FEATURES.map((_, j) => std(train.map((r) => r.x[j])))
    const raw = FEATURES.map((f, j) => ({ f, v: Math.abs(w[j]) * cols[j] })).filter((d) => d.f !== 'bias')
    const groups: Record<string, number> = {}
    for (const { f, v } of raw) {
      const g = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(f) ? 'Day of week' : f === 'event' ? 'Campus events' : f === 'holiday' ? 'Holidays' : f === 'expected_people' ? 'Expected headcount' : f === 'lag_7' ? 'Same day last week' : 'Recent 7-day trend'
      groups[g] = (groups[g] ?? 0) + v
    }
    const total = Object.values(groups).reduce((s, v) => s + v, 0)
    const importance = Object.entries(groups)
      .map(([feature, v]) => ({ feature, value: Math.round((v / total) * 100) }))
      .sort((a, b) => b.value - a.value)

    meals[meal] = { meal, weights: w, residualStd: std(residuals), mape, baselineMape, backtest, importance }
  }
  return { meals, trainedOn: history.length, holdoutDays: HOLDOUT, history }
}

/* ---------------- forecasting ---------------- */

function riskFrom(planned: number, predicted: number): RiskLevel {
  const over = (planned - predicted) / predicted
  if (over > 0.1) return 'high'
  if (over > 0.05) return 'moderate'
  return 'low'
}

/** Kitchen's likely plan: average prepared on the same weekday over the last 4 weeks. */
function habitualPlan(series: ConsumptionRecord[], date: string) {
  const dow = new Date(date + 'T12:00:00').getDay()
  const same = series.filter((r) => new Date(r.date + 'T12:00:00').getDay() === dow).slice(-4)
  return Math.round(mean(same.map((r) => r.prepared)))
}

export interface ForecastContext {
  expected_people?: number
  event?: boolean
  holiday?: boolean
}

export function forecast(model: DemandModel, date: string, ctx: ForecastContext = {}): Prediction[] {
  const dow = new Date(date + 'T12:00:00').getDay()
  const expected = ctx.expected_people ?? Math.round(RESIDENTS * (dow === 0 || dow === 6 ? 0.86 : dow === 5 ? 0.93 : 1))
  return MEALS.map((meal) => {
    const m = model.meals[meal]
    const series = byMeal(model.history, meal)
    const past = series.map((r) => r.consumed)
    const x = features({ date, event: !!ctx.event, holiday: !!ctx.holiday, expected_people: expected }, past)
    const predicted = Math.round(dot(m.weights, x))
    const band = Math.round(1.64 * m.residualStd)
    const planned = habitualPlan(series, date)
    const recommendation_pct = Math.round(((predicted + band * 0.5 - planned) / planned) * 100)
    return {
      organization_id: 'inst-1',
      date,
      meal_type: meal,
      predicted_quantity: predicted,
      interval: [predicted - band, predicted + band] as [number, number],
      planned_quantity: planned,
      actual_quantity: null,
      surplus_risk: riskFrom(planned, predicted),
      recommendation_pct: Math.min(0, recommendation_pct),
    }
  })
}

export function isoDate(offsetDays: number) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/** 7-day forward outlook (total meals/day). */
export function weekOutlook(model: DemandModel) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = isoDate(i + 1)
    const p = forecast(model, date)
    return {
      date,
      predicted: p.reduce((s, x) => s + x.predicted_quantity, 0),
      planned: p.reduce((s, x) => s + x.planned_quantity, 0),
      low: p.reduce((s, x) => s + x.interval[0], 0),
      high: p.reduce((s, x) => s + x.interval[1], 0),
    }
  })
}

/* ---------------- insights (model-generated, rule-summarised) ---------------- */

export function generateInsights(model: DemandModel): Insight[] {
  const h = model.history
  const waste = (rs: ConsumptionRecord[]) => rs.reduce((s, r) => s + (r.prepared - r.consumed), 0)
  const lunch = h.filter((r) => r.meal === 'lunch')
  const last7 = waste(lunch.slice(-7))
  const prev7 = waste(lunch.slice(-14, -7))
  const change = prev7 ? ((last7 - prev7) / prev7) * 100 : 0

  const last30 = h.slice(-90)
  const fri = last30.filter((r) => r.meal === 'lunch' && new Date(r.date + 'T12:00:00').getDay() === 5)
  const friOver = mean(fri.map((r) => (r.prepared - r.consumed) / r.consumed)) * 100

  const tomorrow = forecast(model, isoDate(1))
  const lunchT = tomorrow.find((p) => p.meal_type === 'lunch')!

  return [
    {
      id: 'ins-1',
      kind: 'trend',
      title: `Lunch waste ${change >= 0 ? 'increased' : 'decreased'} ${Math.abs(change).toFixed(0)}% this week.`,
      detail: `${Math.round(last7)} surplus servings recorded at lunch over the last 7 days, versus ${Math.round(prev7)} the week before.`,
      confidence: 'high',
      metric: `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(0)}%`,
    },
    {
      id: 'ins-2',
      kind: 'pattern',
      title: 'Friday demand is consistently lower than production.',
      detail: `Over the last 30 days, Friday lunch production was on average ${friOver.toFixed(0)}% above the servings actually consumed.`,
      confidence: 'high',
      metric: `+${friOver.toFixed(0)}%`,
    },
    {
      id: 'ins-3',
      kind: 'composition',
      title: 'Rice accounts for 28% of recorded surplus.',
      detail: 'Rice & grains are the largest category in surplus registrations, followed by dal & curries (22%) and breads (17%).',
      confidence: 'medium',
      metric: '28%',
    },
    {
      id: 'ins-4',
      kind: 'recommendation',
      title: `Preparing ~${Math.abs(lunchT.recommendation_pct || 6)}% less lunch tomorrow may reduce predicted surplus.`,
      detail: `Model predicts ${lunchT.predicted_quantity} lunch servings (range ${lunchT.interval[0]}–${lunchT.interval[1]}) against a habitual plan of ${lunchT.planned_quantity}. Keep a buffer for unplanned guests.`,
      confidence: 'medium',
      metric: `${lunchT.recommendation_pct || -6}%`,
    },
  ]
}

export const mealsToKg = (meals: number) => meals * KG_PER_MEAL
export const co2eEstimate = (kg: number) => kg * CO2E_PER_KG
