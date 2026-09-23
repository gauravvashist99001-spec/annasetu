import { PageHeader } from '@/components/ui'
import { ImpactDashboard } from '@/components/dashboard/ImpactDashboard'

export default function ImpactApp() {
  return (
    <>
      <PageHeader title="Impact" description="Meals, kilograms and estimated environmental benefit from confirmed redistribution." />
      <ImpactDashboard />
    </>
  )
}
