import { PageHeader } from '@/components/ui'
import { NetworkMap } from '@/components/map/NetworkMap'
import { useData } from '@/context/DataContext'
import { volunteers } from '@/data/organizations'

export default function MapPage() {
  const { state } = useData()
  const active = state.deliveries.filter((d) => d.status !== 'delivered')
  return (
    <>
      <PageHeader title="Network Map" description="Institutions, recipients, open pickups and live delivery routes." />
      <NetworkMap
        height="min(70vh, 640px)"
        organizations={state.organizations}
        routes={[
          ...state.deliveries.map((d) => ({ id: d.id, from: d.source_id, to: d.recipient_id, active: d.status !== 'delivered' })),
          ...state.pickups.map((p) => ({ id: p.id, from: p.source_id, to: p.recipient_id, active: false })),
        ]}
        extras={active.filter((d) => d.volunteer_id).map((d) => {
          const a = state.organizations.find((o) => o.id === d.source_id)!, b = state.organizations.find((o) => o.id === d.recipient_id)!
          return { id: d.id, kind: 'volunteer' as const, latitude: (a.latitude + b.latitude) / 2, longitude: (a.longitude + b.longitude) / 2, label: volunteers.find((v) => v.id === d.volunteer_id)?.name ?? '' }
        })}
      />
      <p className="mt-3 text-xs text-ink-subtle">Map adapter is provider-agnostic — connect OpenStreetMap (Leaflet), Mapbox or Google Maps via the backend-configured key. Dashed outlines = pending verification.</p>
    </>
  )
}
