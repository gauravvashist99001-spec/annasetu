import { ImpactDashboard } from '@/components/dashboard/ImpactDashboard'
import { PublicHero } from './PublicHero'

export default function ImpactPublic() {
  return (
    <>
      <PublicHero eyebrow="Impact" title="Every number here traces back to a delivery.">
        Meals and kilograms come from recipient-confirmed deliveries. Environmental figures are clearly marked estimates, with the method shown below.
      </PublicHero>
      <section className="container-page py-12 sm:py-16"><ImpactDashboard anonymized /></section>
    </>
  )
}
