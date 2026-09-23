import type { ReactNode } from 'react'
import { BadgeCheck, Clock, FlaskConical, XCircle } from 'lucide-react'
import type { DeliveryStatus, ListingStatus, RiskLevel, Urgency, VerificationStatus } from '@/types'
import { cn } from '@/utils/cn'

export type Tone = 'green' | 'amber' | 'blue' | 'red' | 'gray' | 'purple'
const tones: Record<Tone, string> = {
  green: 'bg-brand-50 text-brand-800 ring-brand-200',
  amber: 'bg-accent-50 text-accent-700 ring-accent-100',
  blue: 'bg-tech-50 text-tech-700 ring-tech-100',
  red: 'bg-danger-50 text-red-700 ring-red-100',
  gray: 'bg-slate-100 text-ink-muted ring-slate-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-100',
}

export function Badge({ tone = 'gray', children, className, dot, icon }: { tone?: Tone; children: ReactNode; className?: string; dot?: boolean; icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {icon}
      {children}
    </span>
  )
}

export function VerifiedBadge({ status, label, compact }: { status: VerificationStatus; label?: string; compact?: boolean }) {
  if (status === 'verified')
    return compact ? (
      <BadgeCheck className="inline size-4 shrink-0 fill-brand-600 text-white" aria-label="Verified" role="img" />
    ) : (
      <Badge tone="green" icon={<BadgeCheck className="size-3.5" aria-hidden />}>{label ?? 'Verified'}</Badge>
    )
  if (status === 'pending') return <Badge tone="amber" icon={<Clock className="size-3.5" aria-hidden />}>Pending review</Badge>
  return <Badge tone="red" icon={<XCircle className="size-3.5" aria-hidden />}>Rejected</Badge>
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border border-dashed border-accent-500/60 bg-accent-50 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-700', className)}>
      <FlaskConical className="size-3" aria-hidden /> Demo Data
    </span>
  )
}

const deliveryMap: Record<DeliveryStatus, [string, Tone]> = {
  registered: ['Registered', 'gray'],
  matched: ['Matched', 'blue'],
  assigned: ['Volunteer assigned', 'purple'],
  picked_up: ['Picked up', 'amber'],
  in_transit: ['In transit', 'amber'],
  delivered: ['Delivered', 'green'],
}
export const StatusBadge = ({ status }: { status: DeliveryStatus }) => <Badge tone={deliveryMap[status][1]} dot>{deliveryMap[status][0]}</Badge>
export const deliveryLabel = (s: DeliveryStatus) => deliveryMap[s][0]

const listingMap: Record<ListingStatus, [string, Tone]> = {
  available: ['Available', 'green'],
  matched: ['Matched', 'blue'],
  in_transit: ['In transit', 'amber'],
  delivered: ['Delivered', 'gray'],
  expired: ['Expired', 'red'],
}
export const ListingBadge = ({ status }: { status: ListingStatus }) => <Badge tone={listingMap[status][1]} dot>{listingMap[status][0]}</Badge>

const urgencyMap: Record<Urgency, Tone> = { critical: 'red', high: 'amber', medium: 'blue', low: 'gray' }
export const UrgencyBadge = ({ urgency }: { urgency: Urgency }) => <Badge tone={urgencyMap[urgency]} className="capitalize">{urgency}</Badge>

const riskMap: Record<RiskLevel, Tone> = { low: 'green', moderate: 'amber', high: 'red' }
export const RiskBadge = ({ risk }: { risk: RiskLevel }) => <Badge tone={riskMap[risk]} dot className="uppercase tracking-wide">{risk} risk</Badge>
