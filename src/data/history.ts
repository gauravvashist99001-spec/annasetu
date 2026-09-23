import type { ConsumptionRecord, MealType } from '@/types'
import { gaussian, seeded } from '@/utils/random'

/**
 * DEMO DATA — synthetic 120-day kitchen log for "Delhi University Hostel".
 *
 * Generated with realistic structure so the in-browser model has something to learn:
 *  - weekday / weekend attendance patterns (students leave on Friday evenings)
 *  - a mild seasonal drift (exam weeks raise dinner turnout)
 *  - campus events (+15–25%) and public holidays (−30–40%)
 *  - habitual over-preparation, worst on Friday lunch — the pattern the AI should surface.
 */

const BASE: Record<MealType, number> = { breakfast: 430, lunch: 800, dinner: 720 }
// Mon..Sun multipliers (index = JS getDay(), 0 = Sunday)
const DOW: Record<MealType, number[]> = {
  breakfast: [0.78, 1.0, 1.01, 1.0, 0.99, 0.95, 0.82],
  lunch: [0.74, 1.0, 1.02, 1.01, 0.99, 0.9, 0.8],
  dinner: [0.9, 1.0, 1.0, 1.01, 0.98, 0.84, 0.78],
}
// Kitchen habitually prepares for "a normal weekday" — which over-shoots on Fri / weekends.
const PREP_BIAS: Record<MealType, number> = { breakfast: 1.05, lunch: 1.06, dinner: 1.05 }

export const RESIDENTS = 860
export const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner']

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function generateHistory(days = 120, seed = 42): ConsumptionRecord[] {
  const rand = seeded(seed)
  const out: ConsumptionRecord[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  for (let i = days; i >= 1; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dow = d.getDay()
    const holiday = rand() < 0.035
    const event = !holiday && rand() < 0.06
    const season = 1 + 0.04 * Math.sin((2 * Math.PI * (days - i)) / 60)
    const expected = Math.round(RESIDENTS * (holiday ? 0.62 : 1) * (dow === 0 || dow === 6 ? 0.86 : dow === 5 ? 0.93 : 1) + gaussian(rand) * 12)

    for (const meal of MEALS) {
      const trueDemand =
        BASE[meal] * DOW[meal][dow] * season * (holiday ? 0.65 : 1) * (event ? 1.18 + rand() * 0.07 : 1) * (1 + gaussian(rand) * 0.03)
      const consumed = Math.round(trueDemand)
      // Kitchen plans from a weekday baseline + small reaction to known events/holidays.
      const plan = BASE[meal] * (dow === 0 || dow === 6 ? 0.9 : 1) * PREP_BIAS[meal] * (event ? 1.12 : 1) * (holiday ? 0.8 : 1)
      const prepared = Math.max(consumed, Math.round(plan * (1 + gaussian(rand) * 0.02)))
      out.push({ date: isoDay(d), meal, expected_people: expected, prepared, consumed, event, holiday })
    }
  }
  return out
}

export const history = generateHistory()
