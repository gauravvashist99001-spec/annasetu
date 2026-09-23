import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TrackingView } from '@/components/dashboard/TrackingView'

export default function Tracking() {
  const { trackingId = '' } = useParams()
  const navigate = useNavigate()
  return (
    <>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"><ArrowLeft className="size-4" /> Back</button>
      <h1 className="sr-only">Delivery tracking {trackingId}</h1>
      <TrackingView trackingId={trackingId} />
    </>
  )
}
