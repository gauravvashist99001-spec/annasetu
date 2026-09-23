import {
  ArrowLeftRight, Bell, BrainCircuit, Building2, ChartColumn, HandHeart, Inbox, LayoutDashboard, Leaf, ListChecks, Map, PackageCheck,
  PackagePlus, Route, Settings, ShieldCheck, Soup, Truck, Warehouse, type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types'

export interface NavItem { label: string; to: string; icon: LucideIcon; end?: boolean; badgeKey?: 'notifications' | 'verification' | 'pickups' }

export const NAV: Record<Role, NavItem[]> = {
  institution: [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Demand Prediction', to: '/app/prediction', icon: BrainCircuit },
    { label: 'Food Inventory', to: '/app/inventory', icon: Warehouse },
    { label: 'Register Surplus', to: '/app/surplus/new', icon: PackagePlus },
    { label: 'Redistribution', to: '/app/redistribution', icon: Truck },
    { label: 'Analytics', to: '/app/analytics', icon: ChartColumn },
    { label: 'Impact', to: '/app/impact', icon: Leaf },
    { label: 'Notifications', to: '/app/notifications', icon: Bell, badgeKey: 'notifications' },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ],
  ngo: [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Food Requests', to: '/app/requests', icon: Inbox },
    { label: 'Available Surplus', to: '/app/available', icon: Soup },
    { label: 'My Deliveries', to: '/app/deliveries', icon: PackageCheck },
    { label: 'Impact', to: '/app/impact', icon: Leaf },
    { label: 'Notifications', to: '/app/notifications', icon: Bell, badgeKey: 'notifications' },
    { label: 'Organization Profile', to: '/app/settings', icon: Building2 },
  ],
  volunteer: [
    { label: 'Available Pickups', to: '/app', icon: HandHeart, end: true, badgeKey: 'pickups' },
    { label: 'My Pickups', to: '/app/pickups', icon: Route },
    { label: 'Network Map', to: '/app/map', icon: Map },
    { label: 'My Impact', to: '/app/impact', icon: Leaf },
    { label: 'Notifications', to: '/app/notifications', icon: Bell, badgeKey: 'notifications' },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ],
  admin: [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Verification', to: '/app/verification', icon: ShieldCheck, badgeKey: 'verification' },
    { label: 'Organizations', to: '/app/organizations', icon: Building2 },
    { label: 'Food Listings', to: '/app/listings', icon: ListChecks },
    { label: 'Transactions', to: '/app/transactions', icon: ArrowLeftRight },
    { label: 'Network Map', to: '/app/map', icon: Map },
    { label: 'Reports', to: '/app/analytics', icon: ChartColumn },
    { label: 'Notifications', to: '/app/notifications', icon: Bell, badgeKey: 'notifications' },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ],
}

export const ROLE_LABEL: Record<Role, string> = { institution: 'Institution', ngo: 'NGO / Recipient', volunteer: 'Volunteer', admin: 'Admin' }
