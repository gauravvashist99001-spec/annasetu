import type { Organization, User } from '@/types'

/**
 * DEMO DATA — fictional organisations used only to demonstrate the prototype.
 * None of these represent real partners of AnnaSetu.
 */
export const organizations: Organization[] = [
  { id: 'inst-1', name: 'Delhi University Hostel', type: 'institution', kind: 'Hostel', address: 'North Campus, Delhi 110007', area: 'North Campus', latitude: 28.688, longitude: 77.209, contact: '+91 98100 00001', verification_status: 'verified', joined_at: '2025-11-04' },
  { id: 'inst-2', name: 'CityCare Hospital', type: 'institution', kind: 'Hospital', address: 'Karol Bagh, Delhi 110005', area: 'Karol Bagh', latitude: 28.6519, longitude: 77.1909, contact: '+91 98100 00002', verification_status: 'verified', joined_at: '2025-12-12' },
  { id: 'inst-3', name: 'GreenLeaf Hotel', type: 'institution', kind: 'Hotel', address: 'Connaught Place, Delhi 110001', area: 'Connaught Place', latitude: 28.6315, longitude: 77.2167, contact: '+91 98100 00003', verification_status: 'verified', joined_at: '2026-01-20' },
  { id: 'inst-4', name: 'Metro College Canteen', type: 'institution', kind: 'Canteen', address: 'Laxmi Nagar, Delhi 110092', area: 'Laxmi Nagar', latitude: 28.6304, longitude: 77.2773, contact: '+91 98100 00004', verification_status: 'verified', joined_at: '2026-02-08' },
  { id: 'inst-5', name: 'Central Food Processing Unit', type: 'institution', kind: 'Food Processing', address: 'Okhla Industrial Area, Delhi 110020', area: 'Okhla', latitude: 28.5355, longitude: 77.271, contact: '+91 98100 00005', verification_status: 'verified', joined_at: '2026-03-15' },
  { id: 'inst-6', name: 'Sunrise Residential School', type: 'institution', kind: 'Hostel', address: 'Dwarka Sector 10, Delhi 110075', area: 'Dwarka', latitude: 28.5823, longitude: 77.0500, contact: '+91 98100 00006', verification_status: 'pending', joined_at: '2026-09-19' },

  { id: 'ngo-1', name: 'Community Kitchen Delhi', type: 'ngo', kind: 'Community Kitchen', address: 'Civil Lines, Delhi 110054', area: 'Civil Lines', latitude: 28.6814, longitude: 77.2226, contact: '+91 98110 00011', verification_status: 'verified', joined_at: '2025-11-10', capacity_meals: 300 },
  { id: 'ngo-2', name: 'Hope Foundation', type: 'ngo', kind: 'Foundation', address: 'Paharganj, Delhi 110055', area: 'Paharganj', latitude: 28.6448, longitude: 77.213, contact: '+91 98110 00012', verification_status: 'verified', joined_at: '2025-12-02', capacity_meals: 180 },
  { id: 'ngo-3', name: 'Seva Shelter', type: 'ngo', kind: 'Shelter', address: 'Shahdara, Delhi 110032', area: 'Shahdara', latitude: 28.673, longitude: 77.289, contact: '+91 98110 00013', verification_status: 'verified', joined_at: '2026-01-05', capacity_meals: 120 },
  { id: 'ngo-4', name: 'Annapurna Community Centre', type: 'ngo', kind: 'Community Centre', address: 'Kalkaji, Delhi 110019', area: 'Kalkaji', latitude: 28.5494, longitude: 77.2588, contact: '+91 98110 00014', verification_status: 'verified', joined_at: '2026-02-18', capacity_meals: 220 },
  { id: 'ngo-5', name: 'Roti Sahayata Trust', type: 'ngo', kind: 'Foundation', address: 'Rohini Sector 7, Delhi 110085', area: 'Rohini', latitude: 28.7041, longitude: 77.1025, contact: '+91 98110 00015', verification_status: 'pending', joined_at: '2026-09-20', capacity_meals: 150 },
  { id: 'ngo-6', name: 'Nanhe Kadam Children’s Home', type: 'ngo', kind: 'Shelter', address: 'Mayur Vihar, Delhi 110091', area: 'Mayur Vihar', latitude: 28.6077, longitude: 77.2946, contact: '+91 98110 00016', verification_status: 'pending', joined_at: '2026-09-21', capacity_meals: 90 },
  { id: 'ngo-7', name: 'Saath Welfare Society', type: 'ngo', kind: 'Community Centre', address: 'Janakpuri, Delhi 110058', area: 'Janakpuri', latitude: 28.6219, longitude: 77.0878, contact: '+91 98110 00017', verification_status: 'rejected', joined_at: '2026-08-30', capacity_meals: 80 },
]

export const orgById = (id: string) => organizations.find((o) => o.id === id)!

export interface Volunteer extends User {
  vehicle: 'Two-wheeler' | 'Car' | 'Van' | 'E-rickshaw'
  area: string
  completed: number
  rating: number
}

export const volunteers: Volunteer[] = [
  { id: 'vol-1', name: 'Rahul Verma', email: 'rahul.demo@annasetu.in', phone: '+91 99990 10001', role: 'volunteer', organization_id: null, verification_status: 'verified', created_at: '2025-11-20', vehicle: 'Two-wheeler', area: 'North Delhi', completed: 64, rating: 4.9 },
  { id: 'vol-2', name: 'Ananya Iyer', email: 'ananya.demo@annasetu.in', phone: '+91 99990 10002', role: 'volunteer', organization_id: null, verification_status: 'verified', created_at: '2025-12-14', vehicle: 'Car', area: 'Central Delhi', completed: 41, rating: 4.8 },
  { id: 'vol-3', name: 'Imran Qureshi', email: 'imran.demo@annasetu.in', phone: '+91 99990 10003', role: 'volunteer', organization_id: null, verification_status: 'verified', created_at: '2026-01-09', vehicle: 'Van', area: 'East Delhi', completed: 37, rating: 4.9 },
  { id: 'vol-4', name: 'Kavya Nair', email: 'kavya.demo@annasetu.in', phone: '+91 99990 10004', role: 'volunteer', organization_id: null, verification_status: 'pending', created_at: '2026-09-18', vehicle: 'E-rickshaw', area: 'South Delhi', completed: 0, rating: 0 },
]

/** Demo personas — one per role. */
export const demoUsers: Record<string, User & { title: string }> = {
  institution: { id: 'u-inst', name: 'Priya Sharma', title: 'Mess Operations Manager', email: 'institution.demo@annasetu.in', phone: '+91 98100 00001', role: 'institution', organization_id: 'inst-1', verification_status: 'verified', created_at: '2025-11-04' },
  ngo: { id: 'u-ngo', name: 'Arjun Mehta', title: 'Operations Lead', email: 'ngo.demo@annasetu.in', phone: '+91 98110 00011', role: 'ngo', organization_id: 'ngo-1', verification_status: 'verified', created_at: '2025-11-10' },
  volunteer: { ...volunteers[0], title: 'Volunteer · North Delhi' },
  admin: { id: 'u-admin', name: 'Neha Kapoor', title: 'Platform Administrator', email: 'admin.demo@annasetu.in', phone: '+91 98120 00000', role: 'admin', organization_id: null, verification_status: 'verified', created_at: '2025-10-01' },
}
