import { useMemo } from 'react'
import { trainDemandModel, type DemandModel } from '@/services/prediction'

let cached: DemandModel | null = null

/** Trains the demand model once per session (≈ a few ms on 360 rows) and caches it. */
export function useDemandModel(): DemandModel {
  return useMemo(() => (cached ??= trainDemandModel()), [])
}
