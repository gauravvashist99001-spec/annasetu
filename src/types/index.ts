/* Domain types — mirror backend/app/models.py so mock data can be swapped for API data 1:1. */

export type Role = 'institution' | 'ngo' | 'volunteer' | 'admin'
export type VerificationStatus = 'verified' | 'pending' | 'rejected'
export type OrgType = 'institution' | 'ngo'
export type InstitutionKind = 'Hostel' | 'Hospital' | 'Hotel' | 'Canteen' | 'Food Processing'
export type NgoKind = 'Community Kitchen' | 'Shelter' | 'Foundation' | 'Community Centre'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  organization_id: string | null
  verification_status: VerificationStatus
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: OrgType
  kind: InstitutionKind | NgoKind
  address: string
  area: string
  latitude: number
  longitude: number
  contact: string
  verification_status: VerificationStatus
  joined_at: string
  capacity_meals?: number
}

export type FoodCategory = 'Cooked Meals' | 'Rice & Grains' | 'Breads & Bakery' | 'Dal & Curries' | 'Fruits & Vegetables' | 'Packaged' | 'Dairy'
export type StorageCondition = 'Hot holding (>60°C)' | 'Refrigerated (<5°C)' | 'Room temperature' | 'Frozen'
export type ListingStatus = 'available' | 'matched' | 'in_transit' | 'delivered' | 'expired'
export type Urgency = 'critical' | 'high' | 'medium' | 'low'

export interface FoodListing {
  id: string
  organization_id: string
  food_name: string
  category: FoodCategory
  quantity_kg: number
  servings: number
  prepared_at: string
  available_until: string
  storage_condition: StorageCondition
  status: ListingStatus
  contact_person: string
  pickup_location: string
  created_at: string
}

export interface FoodRequest {
  id: string
  organization_id: string
  food_category: FoodCategory | 'Any'
  quantity_required: number
  urgency: Urgency
  status: 'open' | 'fulfilled' | 'cancelled'
  needed_by: string
  note?: string
}

export interface MatchCandidate {
  recipient: Organization
  distance_km: number
  need_meals: number
  score: number
  breakdown: { distance: number; quantity: number; requirement: number; time: number }
  eta_min: number
}

export interface Match {
  id: string
  food_listing_id: string
  recipient_id: string
  match_score: number
  distance_km: number
  status: 'proposed' | 'accepted' | 'declined'
}

export type DeliveryStatus = 'registered' | 'matched' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered'

export interface Delivery {
  id: string
  tracking_id: string
  match_id: string
  food_listing_id: string
  source_id: string
  recipient_id: string
  volunteer_id: string | null
  status: DeliveryStatus
  meals: number
  distance_km: number
  created_at: string
  events: { status: DeliveryStatus; at: string; note?: string }[]
}

export interface ImpactRecord {
  id: string
  food_listing_id: string
  quantity_saved_kg: number
  meals_saved: number
  estimated_co2e_kg: number
  created_at: string
}

export type MealType = 'breakfast' | 'lunch' | 'dinner'
export type RiskLevel = 'low' | 'moderate' | 'high'

export interface ConsumptionRecord {
  date: string
  meal: MealType
  expected_people: number
  prepared: number
  consumed: number
  event: boolean
  holiday: boolean
}

export interface Prediction {
  organization_id: string
  date: string
  meal_type: MealType
  predicted_quantity: number
  interval: [number, number]
  planned_quantity: number
  actual_quantity: number | null
  surplus_risk: RiskLevel
  recommendation_pct: number
}

export type NotificationType = 'urgent' | 'food' | 'delivery' | 'ai' | 'system'

export interface AppNotification {
  id: string
  user_role: Role | 'all'
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
  href?: string
}

export interface Insight {
  id: string
  kind: 'trend' | 'pattern' | 'composition' | 'recommendation'
  title: string
  detail: string
  confidence: 'low' | 'medium' | 'high'
  metric?: string
}
