import { useCallback } from 'react'
import type { FoodListing, Organization } from '@/types'
import { useData } from '@/context/DataContext'
import { useToast } from '@/components/ui'
import { haversineKm } from '@/utils/geo'

/** NGO requests a listing → (demo) institution auto-accepts → match + pickup created. */
export function useRequestFood(recipient: Organization | undefined) {
  const { state, dispatch } = useData()
  const toast = useToast()
  return useCallback(
    (l: FoodListing) => {
      if (!recipient) return
      const src = state.organizations.find((o) => o.id === l.organization_id)!
      const distance_km = haversineKm(src, recipient) * 1.3
      dispatch({
        type: 'confirmMatch',
        listingId: l.id,
        candidate: { recipient, distance_km, need_meals: l.servings, score: 0, eta_min: Math.round((distance_km / 18) * 60 + 20), breakdown: { distance: 0, quantity: 0, requirement: 0, time: 0 } },
      })
      toast({ title: 'Request sent', body: `${src.name} accepted your request (demo auto-confirm). A volunteer will be assigned.` })
    },
    [recipient, state.organizations, dispatch, toast],
  )
}
