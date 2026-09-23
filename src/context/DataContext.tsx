/**
 * Demo data store. Holds the mutable operational state of the prototype (listings, deliveries,
 * pickups, notifications, verification) so actions in one dashboard are reflected in the others —
 * e.g. an institution registers surplus → an NGO sees it → a volunteer picks it up → tracking updates.
 * In connected mode these reducers would be replaced by API mutations + query invalidation.
 */
import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { AppNotification, Delivery, DeliveryStatus, FoodListing, FoodRequest, MatchCandidate, Organization, VerificationStatus } from '@/types'
import { organizations as seedOrgs } from '@/data/organizations'
import { deliveries as seedDeliveries, listings as seedListings, notifications as seedNotifications, openPickups, requests as seedRequests } from '@/data/operations'

export type Pickup = (typeof openPickups)[number] & { delivery_id?: string }

interface State {
  organizations: Organization[]
  listings: FoodListing[]
  requests: FoodRequest[]
  deliveries: Delivery[]
  pickups: Pickup[]
  notifications: AppNotification[]
}

type Action =
  | { type: 'addListing'; listing: FoodListing }
  | { type: 'confirmMatch'; listingId: string; candidate: MatchCandidate }
  | { type: 'acceptPickup'; pickupId: string; volunteerId: string }
  | { type: 'advance'; deliveryId: string }
  | { type: 'addRequest'; request: FoodRequest }
  | { type: 'readNotification'; id: string }
  | { type: 'readAll' }
  | { type: 'verify'; orgId: string; status: VerificationStatus }
  | { type: 'reset' }

export const DELIVERY_FLOW: DeliveryStatus[] = ['registered', 'matched', 'assigned', 'picked_up', 'in_transit', 'delivered']

let seq = 1285
const nextTracking = () => `AS-2026-${String(seq++).padStart(6, '0')}`
const nowIso = () => new Date().toISOString()

function notify(state: State, n: Omit<AppNotification, 'id' | 'read' | 'created_at'>): AppNotification[] {
  return [{ ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, read: false, created_at: nowIso() }, ...state.notifications]
}

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'addListing':
      return {
        ...state,
        listings: [a.listing, ...state.listings],
        notifications: notify(state, { user_role: 'ngo', type: 'food', title: 'New surplus registered', message: `${a.listing.food_name} — ${a.listing.servings} meals now available.`, href: '/app/available' }),
      }
    case 'confirmMatch': {
      const listing = state.listings.find((l) => l.id === a.listingId)
      if (!listing) return state
      const tracking = nextTracking()
      const delivery: Delivery = {
        id: `dl-${tracking}`,
        tracking_id: tracking,
        match_id: `m-${tracking}`,
        food_listing_id: listing.id,
        source_id: listing.organization_id,
        recipient_id: a.candidate.recipient.id,
        volunteer_id: null,
        status: 'matched',
        meals: listing.servings,
        distance_km: a.candidate.distance_km,
        created_at: nowIso(),
        events: [
          { status: 'registered', at: listing.created_at },
          { status: 'matched', at: nowIso(), note: `Match score ${a.candidate.score}/100` },
        ],
      }
      const pickup: Pickup = {
        id: `pk-${tracking}`,
        listing_id: listing.id,
        source_id: listing.organization_id,
        recipient_id: a.candidate.recipient.id,
        meals: listing.servings,
        distance_km: a.candidate.distance_km,
        window_until: listing.available_until,
        food: listing.food_name,
        priority: 'high',
        delivery_id: delivery.id,
      }
      return {
        ...state,
        listings: state.listings.map((l) => (l.id === listing.id ? { ...l, status: 'matched' } : l)),
        deliveries: [delivery, ...state.deliveries],
        pickups: [pickup, ...state.pickups],
        notifications: notify(state, { user_role: 'volunteer', type: 'urgent', title: 'New pickup available', message: `${listing.food_name} → ${a.candidate.recipient.name} (${a.candidate.distance_km.toFixed(1)} km).`, href: '/app' }),
      }
    }
    case 'acceptPickup': {
      const p = state.pickups.find((x) => x.id === a.pickupId)
      if (!p) return state
      let deliveries = state.deliveries
      let deliveryId = p.delivery_id
      if (!deliveryId) {
        const tracking = nextTracking()
        deliveryId = `dl-${tracking}`
        deliveries = [
          {
            id: deliveryId, tracking_id: tracking, match_id: `m-${tracking}`, food_listing_id: p.listing_id, source_id: p.source_id, recipient_id: p.recipient_id,
            volunteer_id: a.volunteerId, status: 'assigned', meals: p.meals, distance_km: p.distance_km, created_at: nowIso(),
            events: [
              { status: 'registered', at: new Date(Date.now() - 25 * 60000).toISOString() },
              { status: 'matched', at: new Date(Date.now() - 12 * 60000).toISOString() },
              { status: 'assigned', at: nowIso() },
            ],
          },
          ...deliveries,
        ]
      } else {
        deliveries = deliveries.map((d) =>
          d.id === deliveryId ? { ...d, volunteer_id: a.volunteerId, status: 'assigned', events: [...d.events, { status: 'assigned', at: nowIso() }] } : d,
        )
      }
      return {
        ...state,
        deliveries,
        pickups: state.pickups.filter((x) => x.id !== a.pickupId),
        listings: state.listings.map((l) => (l.id === p.listing_id ? { ...l, status: 'matched' } : l)),
        notifications: notify(state, { user_role: 'all', type: 'delivery', title: 'Pickup accepted', message: `A volunteer accepted the pickup of ${p.food} (${p.meals} meals).` }),
      }
    }
    case 'advance': {
      return {
        ...state,
        deliveries: state.deliveries.map((d) => {
          if (d.id !== a.deliveryId) return d
          const i = DELIVERY_FLOW.indexOf(d.status)
          if (i >= DELIVERY_FLOW.length - 1) return d
          const next = DELIVERY_FLOW[i + 1]
          return { ...d, status: next, events: [...d.events, { status: next, at: nowIso() }] }
        }),
        listings: state.listings.map((l) => {
          const d = state.deliveries.find((x) => x.id === a.deliveryId)
          if (!d || l.id !== d.food_listing_id) return l
          const next = DELIVERY_FLOW[DELIVERY_FLOW.indexOf(d.status) + 1]
          return { ...l, status: next === 'delivered' ? 'delivered' : next === 'in_transit' || next === 'picked_up' ? 'in_transit' : l.status }
        }),
      }
    }
    case 'addRequest':
      return { ...state, requests: [a.request, ...state.requests] }
    case 'readNotification':
      return { ...state, notifications: state.notifications.map((n) => (n.id === a.id ? { ...n, read: true } : n)) }
    case 'readAll':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
    case 'reset':
      return seedState()
    case 'verify':
      return { ...state, organizations: state.organizations.map((o) => (o.id === a.orgId ? { ...o, verification_status: a.status } : o)) }
  }
}

const DataContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

const STORE_KEY = 'annasetu.demo-state.v1'

function seedState(): State {
  return { organizations: seedOrgs, listings: seedListings, requests: seedRequests, deliveries: seedDeliveries, pickups: openPickups, notifications: seedNotifications }
}

/** Demo state survives reloads within the tab (sessionStorage); falls back to seed data. */
function loadState(): State {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as State & { seq?: number }
      if (s.seq) seq = s.seq
      return s
    }
  } catch {
    /* storage blocked — use seed */
  }
  return seedState()
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ ...state, seq }))
    } catch {
      /* ignore */
    }
  }, [state])
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

export function useOrg(id: string | null | undefined) {
  const { state } = useData()
  return state.organizations.find((o) => o.id === id)
}
