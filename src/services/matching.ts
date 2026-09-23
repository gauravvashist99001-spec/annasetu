/**
 * Smart surplus matching — transparent, weighted multi-criteria scoring.
 * Mirrors backend/app/services/matching.py.
 *
 * Hard filters:  recipient verified · reachable within the safe-use window (with 30 min buffer)
 * Soft score:    distance 35% · quantity fit 25% · stated requirement/urgency 20% · time margin 20%
 *
 * The matcher assists coordination only. It does not assess or certify food safety.
 */
import type { FoodListing, FoodRequest, MatchCandidate, Organization } from '@/types'
import { haversineKm } from '@/utils/geo'
import { minutesRemaining } from '@/utils/format'

export const WEIGHTS = { distance: 0.35, quantity: 0.25, requirement: 0.2, time: 0.2 }
const ROAD_FACTOR = 1.3
const AVG_SPEED_KMPH = 18 // Delhi urban average for two-wheelers / vans
const HANDLING_MIN = 20
const SAFETY_BUFFER_MIN = 30

const URGENCY_SCORE = { critical: 1, high: 0.85, medium: 0.6, low: 0.4 }

export function scoreCandidates(
  listing: Pick<FoodListing, 'servings' | 'available_until' | 'category'>,
  source: Organization,
  recipients: Organization[],
  requests: FoodRequest[],
  now = Date.now(),
): MatchCandidate[] {
  const window = minutesRemaining(listing.available_until, now)

  return recipients
    .filter((r) => r.type === 'ngo' && r.verification_status === 'verified')
    .map((r) => {
      const distance_km = haversineKm(source, r) * ROAD_FACTOR
      const eta_min = Math.round((distance_km / AVG_SPEED_KMPH) * 60 + HANDLING_MIN)
      const req = requests.find(
        (q) => q.organization_id === r.id && q.status === 'open' && (q.food_category === 'Any' || q.food_category === listing.category),
      )
      const need_meals = req?.quantity_required ?? Math.round((r.capacity_meals ?? 100) * 0.5)

      const distance = Math.max(0, 1 - distance_km / 15)
      const ratio = Math.min(listing.servings, need_meals) / Math.max(listing.servings, need_meals)
      const quantity = ratio
      const requirement = req ? URGENCY_SCORE[req.urgency] : 0.3
      const margin = window - eta_min - SAFETY_BUFFER_MIN
      const time = Math.max(0, Math.min(1, margin / 180))

      const score = Math.round(
        100 * (WEIGHTS.distance * distance + WEIGHTS.quantity * quantity + WEIGHTS.requirement * requirement + WEIGHTS.time * time),
      )
      return { recipient: r, distance_km, need_meals, eta_min, score, breakdown: { distance, quantity, requirement, time }, feasible: margin > 0 }
    })
    .filter((c) => c.feasible)
    .map(({ feasible: _f, ...c }) => c)
    .sort((a, b) => b.score - a.score)
}
