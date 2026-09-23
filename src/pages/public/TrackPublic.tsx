import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { TrackingView } from '@/components/dashboard/TrackingView'

export default function TrackPublic() {
  const { trackingId = '' } = useParams()
  const navigate = useNavigate()
  const [q, setQ] = useState(trackingId)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (q.trim()) navigate(`/track/${q.trim().toUpperCase()}`)
  }
  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Traceability</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Track a food journey</h1>
        </div>
        <form onSubmit={submit} className="flex gap-2 sm:w-96" role="search">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="AS-2026-001284" aria-label="Tracking ID" className="font-mono" />
          <Button type="submit" icon={<Search className="size-4" />}>Track</Button>
        </form>
      </div>
      <TrackingView trackingId={trackingId} publicView />
    </section>
  )
}
