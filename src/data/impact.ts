/**
 * DEMO DATA — platform-level impact figures for the prototype.
 * Replace with GET /api/impact/summary and /api/impact/timeseries when a backend is connected.
 */

export const platformStats = {
  meals_rescued: 12480,
  food_diverted_kg: 3800,
  verified_partners: 186,
  success_rate: 94,
  organizations_helped: 58,
  volunteers_active: 212,
}

const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
const rescued = [180, 320, 460, 610, 790, 960, 1120, 1240, 1310, 1490, 1780, 2220]
export const monthlyRescued = months.map((m, i) => ({ month: m, meals: rescued[i], kg: Math.round(rescued[i] * 0.305) }))

export const institutionComparison = [
  { name: 'DU Hostel', short: 'DU Hostel', meals: 3920, rate: 96 },
  { name: 'CityCare Hospital', short: 'CityCare', meals: 2610, rate: 93 },
  { name: 'GreenLeaf Hotel', short: 'GreenLeaf', meals: 2280, rate: 95 },
  { name: 'Metro College Canteen', short: 'Metro Canteen', meals: 1840, rate: 90 },
  { name: 'Central Food Processing Unit', short: 'CFPU', meals: 1830, rate: 94 },
]

export const categoryDistribution = [
  { name: 'Rice & Grains', value: 28 },
  { name: 'Dal & Curries', value: 22 },
  { name: 'Breads & Bakery', value: 17 },
  { name: 'Cooked Meals', value: 15 },
  { name: 'Fruits & Vegetables', value: 11 },
  { name: 'Other', value: 7 },
]

export const surplusByTimeOfDay = [
  { slot: '6–9 AM', servings: 38 },
  { slot: '9–12 PM', servings: 22 },
  { slot: '12–3 PM', servings: 142 },
  { slot: '3–6 PM', servings: 41 },
  { slot: '6–9 PM', servings: 118 },
  { slot: '9 PM+', servings: 64 },
]

export const weeklyRedistribution = [
  { week: 'W1', redistributed: 410, surplus: 452 },
  { week: 'W2', redistributed: 468, surplus: 495 },
  { week: 'W3', redistributed: 432, surplus: 470 },
  { week: 'W4', redistributed: 521, surplus: 548 },
  { week: 'W5', redistributed: 556, surplus: 580 },
  { week: 'W6', redistributed: 590, surplus: 612 },
]
