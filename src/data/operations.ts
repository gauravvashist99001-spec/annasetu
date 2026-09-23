import type { AppNotification, Delivery, DeliveryStatus, FoodListing, FoodRequest } from '@/types'

/** DEMO DATA — timestamps are generated relative to "now" so the demo always feels live. */
const now = Date.now()
const at = (minutes: number) => new Date(now + minutes * 60000).toISOString()

export const listings: FoodListing[] = [
  { id: 'fl-1001', organization_id: 'inst-1', food_name: 'Cooked Rice + Dal', category: 'Rice & Grains', quantity_kg: 48, servings: 120, prepared_at: at(-50), available_until: at(190), storage_condition: 'Hot holding (>60°C)', status: 'available', contact_person: 'Priya Sharma', pickup_location: 'Hostel Mess Block B, North Campus', created_at: at(-20) },
  { id: 'fl-1002', organization_id: 'inst-3', food_name: 'Veg Pulao & Raita', category: 'Cooked Meals', quantity_kg: 32, servings: 80, prepared_at: at(-40), available_until: at(160), storage_condition: 'Hot holding (>60°C)', status: 'available', contact_person: 'Chef Rakesh', pickup_location: 'GreenLeaf Hotel, Service Gate 2', created_at: at(-15) },
  { id: 'fl-1003', organization_id: 'inst-2', food_name: 'Whole Wheat Bread', category: 'Breads & Bakery', quantity_kg: 14, servings: 40, prepared_at: at(-180), available_until: at(240), storage_condition: 'Room temperature', status: 'available', contact_person: 'Sunita Rao', pickup_location: 'CityCare Hospital, Kitchen Dock', created_at: at(-35) },
  { id: 'fl-1004', organization_id: 'inst-4', food_name: 'Rajma Chawal', category: 'Dal & Curries', quantity_kg: 26, servings: 65, prepared_at: at(-30), available_until: at(75), storage_condition: 'Hot holding (>60°C)', status: 'available', contact_person: 'Manoj Kumar', pickup_location: 'Metro College Canteen, Rear Entrance', created_at: at(-10) },
  { id: 'fl-1005', organization_id: 'inst-5', food_name: 'Packaged Poha (sealed)', category: 'Packaged', quantity_kg: 60, servings: 200, prepared_at: at(-600), available_until: at(2880), storage_condition: 'Room temperature', status: 'available', contact_person: 'Deepak Jain', pickup_location: 'CFPU Warehouse Bay 4, Okhla', created_at: at(-90) },
  { id: 'fl-1006', organization_id: 'inst-2', food_name: 'Seasonal Fruit Cups', category: 'Fruits & Vegetables', quantity_kg: 18, servings: 60, prepared_at: at(-90), available_until: at(300), storage_condition: 'Refrigerated (<5°C)', status: 'available', contact_person: 'Sunita Rao', pickup_location: 'CityCare Hospital, Kitchen Dock', created_at: at(-40) },
  { id: 'fl-0998', organization_id: 'inst-1', food_name: 'Chapati & Mixed Veg', category: 'Cooked Meals', quantity_kg: 36, servings: 90, prepared_at: at(-300), available_until: at(-60), storage_condition: 'Hot holding (>60°C)', status: 'in_transit', contact_person: 'Priya Sharma', pickup_location: 'Hostel Mess Block B, North Campus', created_at: at(-280) },
  { id: 'fl-0995', organization_id: 'inst-3', food_name: 'Paneer Curry & Naan', category: 'Dal & Curries', quantity_kg: 22, servings: 55, prepared_at: at(-1500), available_until: at(-1300), storage_condition: 'Hot holding (>60°C)', status: 'delivered', contact_person: 'Chef Rakesh', pickup_location: 'GreenLeaf Hotel, Service Gate 2', created_at: at(-1480) },
  { id: 'fl-0990', organization_id: 'inst-1', food_name: 'Khichdi', category: 'Rice & Grains', quantity_kg: 40, servings: 100, prepared_at: at(-2900), available_until: at(-2700), storage_condition: 'Hot holding (>60°C)', status: 'delivered', contact_person: 'Priya Sharma', pickup_location: 'Hostel Mess Block B, North Campus', created_at: at(-2880) },
]

export const requests: FoodRequest[] = [
  { id: 'rq-1', organization_id: 'ngo-1', food_category: 'Any', quantity_required: 100, urgency: 'high', status: 'open', needed_by: at(180), note: 'Evening meal service — 2 sites' },
  { id: 'rq-2', organization_id: 'ngo-3', food_category: 'Cooked Meals', quantity_required: 80, urgency: 'critical', status: 'open', needed_by: at(120), note: 'Night shelter dinner' },
  { id: 'rq-3', organization_id: 'ngo-2', food_category: 'Any', quantity_required: 150, urgency: 'medium', status: 'open', needed_by: at(300) },
  { id: 'rq-4', organization_id: 'ngo-4', food_category: 'Breads & Bakery', quantity_required: 60, urgency: 'low', status: 'open', needed_by: at(600) },
  { id: 'rq-5', organization_id: 'ngo-1', food_category: 'Rice & Grains', quantity_required: 120, urgency: 'medium', status: 'fulfilled', needed_by: at(-1400) },
]

function events(upTo: DeliveryStatus, startMin: number): Delivery['events'] {
  const order: DeliveryStatus[] = ['registered', 'matched', 'assigned', 'picked_up', 'in_transit', 'delivered']
  const gaps = [0, 4, 9, 22, 3, 24]
  let t = startMin
  return order.slice(0, order.indexOf(upTo) + 1).map((s, i) => {
    t += gaps[i]
    return { status: s, at: at(t) }
  })
}

export const deliveries: Delivery[] = [
  { id: 'dl-1', tracking_id: 'AS-2026-001284', match_id: 'm-1', food_listing_id: 'fl-0998', source_id: 'inst-1', recipient_id: 'ngo-1', volunteer_id: 'vol-1', status: 'in_transit', meals: 90, distance_km: 2.4, created_at: at(-280), events: events('in_transit', -280) },
  { id: 'dl-2', tracking_id: 'AS-2026-001279', match_id: 'm-2', food_listing_id: 'fl-0995', source_id: 'inst-3', recipient_id: 'ngo-2', volunteer_id: 'vol-2', status: 'delivered', meals: 55, distance_km: 1.9, created_at: at(-1480), events: events('delivered', -1480) },
  { id: 'dl-3', tracking_id: 'AS-2026-001271', match_id: 'm-3', food_listing_id: 'fl-0990', source_id: 'inst-1', recipient_id: 'ngo-3', volunteer_id: 'vol-1', status: 'delivered', meals: 100, distance_km: 9.6, created_at: at(-2880), events: events('delivered', -2880) },
  { id: 'dl-4', tracking_id: 'AS-2026-001266', match_id: 'm-4', food_listing_id: 'fl-0980', source_id: 'inst-2', recipient_id: 'ngo-2', volunteer_id: 'vol-3', status: 'delivered', meals: 70, distance_km: 3.1, created_at: at(-4300), events: events('delivered', -4300) },
  { id: 'dl-5', tracking_id: 'AS-2026-001258', match_id: 'm-5', food_listing_id: 'fl-0975', source_id: 'inst-4', recipient_id: 'ngo-3', volunteer_id: 'vol-3', status: 'delivered', meals: 85, distance_km: 5.2, created_at: at(-5800), events: events('delivered', -5800) },
  { id: 'dl-6', tracking_id: 'AS-2026-001251', match_id: 'm-6', food_listing_id: 'fl-0970', source_id: 'inst-5', recipient_id: 'ngo-4', volunteer_id: 'vol-2', status: 'delivered', meals: 180, distance_km: 2.3, created_at: at(-7200), events: events('delivered', -7200) },
]

/** Open pickup jobs for volunteers — matched but no volunteer yet. */
export const openPickups = [
  { id: 'pk-1', listing_id: 'fl-1001', source_id: 'inst-1', recipient_id: 'ngo-1', meals: 120, distance_km: 3.2, window_until: at(135), food: 'Cooked Rice + Dal', priority: 'high' as const },
  { id: 'pk-2', listing_id: 'fl-1003', source_id: 'inst-2', recipient_id: 'ngo-2', meals: 40, distance_km: 3.4, window_until: at(240), food: 'Whole Wheat Bread', priority: 'medium' as const },
  { id: 'pk-3', listing_id: 'fl-1004', source_id: 'inst-4', recipient_id: 'ngo-3', meals: 65, distance_km: 2.1, window_until: at(75), food: 'Rajma Chawal', priority: 'critical' as const },
  { id: 'pk-4', listing_id: 'fl-1002', source_id: 'inst-3', recipient_id: 'ngo-2', meals: 80, distance_km: 1.9, window_until: at(160), food: 'Veg Pulao & Raita', priority: 'high' as const },
]

export const notifications: AppNotification[] = [
  { id: 'n-1', user_role: 'institution', type: 'ai', title: 'High surplus risk tomorrow', message: "AI detected a high surplus risk for tomorrow's lunch. Suggested: reduce preparation by ~6%.", read: false, created_at: at(-12), href: '/app/prediction' },
  { id: 'n-2', user_role: 'ngo', type: 'food', title: 'New surplus nearby', message: 'New surplus food available 2.4 km away — Cooked Rice + Dal, 120 meals.', read: false, created_at: at(-18), href: '/app/available' },
  { id: 'n-3', user_role: 'all', type: 'delivery', title: 'Pickup accepted', message: 'Your pickup has been accepted by Rahul V. (AS-2026-001284).', read: false, created_at: at(-240), href: '/app/track/AS-2026-001284' },
  { id: 'n-4', user_role: 'volunteer', type: 'urgent', title: 'Urgent pickup', message: 'Rajma Chawal (65 meals) at Metro College Canteen — safe-use window closes in 75 min.', read: false, created_at: at(-8), href: '/app' },
  { id: 'n-5', user_role: 'all', type: 'delivery', title: 'Delivery completed', message: 'Food delivery completed — 55 meals delivered to Hope Foundation.', read: true, created_at: at(-1400), href: '/app/track/AS-2026-001279' },
  { id: 'n-6', user_role: 'admin', type: 'system', title: 'Verification requests', message: '3 organisations are awaiting verification review.', read: false, created_at: at(-60), href: '/app/verification' },
  { id: 'n-7', user_role: 'institution', type: 'food', title: 'Recipient confirmed', message: 'Community Kitchen Delhi confirmed receipt of 90 meals.', read: true, created_at: at(-2000) },
  { id: 'n-8', user_role: 'all', type: 'system', title: 'Scheduled maintenance', message: 'Demo environment: all data is fictional. No real food is being coordinated.', read: true, created_at: at(-3000) },
]
