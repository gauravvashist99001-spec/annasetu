import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { useAuth } from './context/AuthContext'
import { ButtonLink, EmptyState, Skeleton } from './components/ui'
import type { Role } from './types'
import Landing from './pages/public/Landing'

// Public
const HowItWorks = lazy(() => import('./pages/public/HowItWorks'))
const About = lazy(() => import('./pages/public/About'))
const ImpactPublic = lazy(() => import('./pages/public/ImpactPublic'))
const Partners = lazy(() => import('./pages/public/Partners'))
const FoodSafety = lazy(() => import('./pages/public/FoodSafety'))
const Contact = lazy(() => import('./pages/public/Contact'))
const Login = lazy(() => import('./pages/public/Login'))
const Register = lazy(() => import('./pages/public/Register'))
const TrackPublic = lazy(() => import('./pages/public/TrackPublic'))
const NotFound = lazy(() => import('./pages/public/NotFound'))
// Institution
const InstitutionOverview = lazy(() => import('./pages/institution/Overview'))
const Prediction = lazy(() => import('./pages/institution/Prediction'))
const Inventory = lazy(() => import('./pages/institution/Inventory'))
const RegisterSurplus = lazy(() => import('./pages/institution/RegisterSurplus'))
const Redistribution = lazy(() => import('./pages/institution/Redistribution'))
// NGO
const NgoOverview = lazy(() => import('./pages/ngo/Overview'))
const AvailableSurplus = lazy(() => import('./pages/ngo/AvailableSurplus'))
const FoodRequests = lazy(() => import('./pages/ngo/FoodRequests'))
const NgoDeliveries = lazy(() => import('./pages/ngo/Deliveries'))
// Volunteer
const VolunteerPickups = lazy(() => import('./pages/volunteer/AvailablePickups'))
const MyPickups = lazy(() => import('./pages/volunteer/MyPickups'))
// Admin
const AdminOverview = lazy(() => import('./pages/admin/Overview'))
const Verification = lazy(() => import('./pages/admin/Verification'))
const Organizations = lazy(() => import('./pages/admin/Organizations'))
const Listings = lazy(() => import('./pages/admin/Listings'))
const Transactions = lazy(() => import('./pages/admin/Transactions'))
// Shared
const Analytics = lazy(() => import('./pages/shared/Analytics'))
const ImpactApp = lazy(() => import('./pages/shared/Impact'))
const Notifications = lazy(() => import('./pages/shared/Notifications'))
const Settings = lazy(() => import('./pages/shared/Settings'))
const Tracking = lazy(() => import('./pages/shared/Tracking'))
const MapPage = lazy(() => import('./pages/shared/MapPage'))

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function PageFallback() {
  return (
    <div className="container-page space-y-4 py-10" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

/** Role-based access control for dashboard routes (the API enforces the same rules server-side). */
function Only({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session } = useAuth()
  if (session && roles.includes(session.user.role)) return <>{children}</>
  return (
    <EmptyState icon={<Lock className="size-5" />} title="Not available for your role" action={<ButtonLink to="/app" variant="outline">Back to dashboard</ButtonLink>}>
      This area is restricted by role-based access control.
    </EmptyState>
  )
}

function RoleHome() {
  const role = useAuth().session?.user.role
  if (role === 'institution') return <InstitutionOverview />
  if (role === 'ngo') return <NgoOverview />
  if (role === 'volunteer') return <VolunteerPickups />
  return <AdminOverview />
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="about" element={<About />} />
            <Route path="impact" element={<ImpactPublic />} />
            <Route path="partners" element={<Partners />} />
            <Route path="food-safety" element={<FoodSafety />} />
            <Route path="contact" element={<Contact />} />
            <Route path="track/:trackingId" element={<TrackPublic />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="app" element={<DashboardLayout />}>
            <Route index element={<RoleHome />} />
            <Route path="prediction" element={<Only roles={['institution']}><Prediction /></Only>} />
            <Route path="inventory" element={<Only roles={['institution']}><Inventory /></Only>} />
            <Route path="surplus/new" element={<Only roles={['institution']}><RegisterSurplus /></Only>} />
            <Route path="redistribution" element={<Only roles={['institution']}><Redistribution /></Only>} />
            <Route path="requests" element={<Only roles={['ngo']}><FoodRequests /></Only>} />
            <Route path="available" element={<Only roles={['ngo']}><AvailableSurplus /></Only>} />
            <Route path="deliveries" element={<Only roles={['ngo']}><NgoDeliveries /></Only>} />
            <Route path="pickups" element={<Only roles={['volunteer']}><MyPickups /></Only>} />
            <Route path="verification" element={<Only roles={['admin']}><Verification /></Only>} />
            <Route path="organizations" element={<Only roles={['admin']}><Organizations /></Only>} />
            <Route path="listings" element={<Only roles={['admin']}><Listings /></Only>} />
            <Route path="transactions" element={<Only roles={['admin']}><Transactions /></Only>} />
            <Route path="analytics" element={<Only roles={['institution', 'admin']}><Analytics /></Only>} />
            <Route path="map" element={<Only roles={['volunteer', 'admin']}><MapPage /></Only>} />
            <Route path="impact" element={<ImpactApp />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="track/:trackingId" element={<Tracking />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
