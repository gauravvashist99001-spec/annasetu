import { useState } from 'react'
import { Check, MoreHorizontal, X } from 'lucide-react'
import type { Organization } from '@/types'
import { Badge, Button, DataTable, Modal, Textarea, VerifiedBadge, useToast, type Column } from '@/components/ui'
import { useData } from '@/context/DataContext'
import { fmtDate } from '@/utils/format'

export function OrgTable({ rows, caption }: { rows: Organization[]; caption: string }) {
  const { dispatch } = useData()
  const toast = useToast()
  const [review, setReview] = useState<{ org: Organization; action: 'verified' | 'rejected' } | null>(null)
  const [reason, setReason] = useState('')

  const columns: Column<Organization>[] = [
    { key: 'name', header: 'Organization', cell: (o) => <div><p className="flex items-center gap-1 font-medium text-ink">{o.name} {o.verification_status === 'verified' && <VerifiedBadge status="verified" compact />}</p><p className="text-xs text-ink-subtle">{o.kind}</p></div> },
    { key: 'type', header: 'Type', cell: (o) => <Badge tone={o.type === 'institution' ? 'green' : 'amber'}>{o.type === 'institution' ? 'Institution' : 'NGO'}</Badge> },
    { key: 'loc', header: 'Location', cell: (o) => <span className="text-ink-muted">{o.area}</span> },
    { key: 'status', header: 'Status', cell: (o) => <VerifiedBadge status={o.verification_status} /> },
    { key: 'joined', header: 'Joined', hideOnMobile: true, cell: (o) => <span className="text-ink-muted">{fmtDate(o.joined_at)}</span> },
    {
      key: 'actions', header: <span className="sr-only">Actions</span>, className: 'text-right',
      cell: (o) =>
        o.verification_status === 'pending' ? (
          <div className="flex justify-end gap-1.5">
            <Button size="sm" variant="outline" icon={<X className="size-3.5" />} onClick={() => setReview({ org: o, action: 'rejected' })} aria-label={`Reject ${o.name}`}>Reject</Button>
            <Button size="sm" icon={<Check className="size-3.5" />} onClick={() => setReview({ org: o, action: 'verified' })} aria-label={`Approve ${o.name}`}>Approve</Button>
          </div>
        ) : (
          <button className="rounded-lg p-1.5 text-ink-subtle hover:bg-slate-100 hover:text-ink" aria-label={`More actions for ${o.name}`} onClick={() => toast({ title: o.name, body: 'Profile, documents & audit log open here in production.', tone: 'info' })}>
            <MoreHorizontal className="size-4" />
          </button>
        ),
    },
  ]

  return (
    <>
      <DataTable columns={columns} rows={rows} rowKey={(o) => o.id} caption={caption} empty="No organisations match." />
      <Modal
        open={!!review}
        onClose={() => setReview(null)}
        size="sm"
        title={review?.action === 'verified' ? `Approve ${review?.org.name}?` : `Reject ${review?.org.name}?`}
        description={review?.action === 'verified' ? 'The organisation gets a verified badge and can transact on the network.' : 'The applicant is notified with your reason and may re-apply.'}
        footer={
          <>
            <Button variant="outline" onClick={() => setReview(null)}>Cancel</Button>
            <Button
              variant={review?.action === 'verified' ? 'primary' : 'danger'}
              disabled={review?.action === 'rejected' && reason.trim().length < 5}
              onClick={() => {
                dispatch({ type: 'verify', orgId: review!.org.id, status: review!.action })
                toast({ title: review!.action === 'verified' ? 'Organisation verified' : 'Application rejected', body: review!.org.name })
                setReview(null)
                setReason('')
              }}
            >
              {review?.action === 'verified' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        {review && (
          <div className="space-y-3 text-sm">
            <dl className="grid grid-cols-[110px_1fr] gap-y-1.5">
              <dt className="text-ink-subtle">Type</dt><dd>{review.org.kind}</dd>
              <dt className="text-ink-subtle">Address</dt><dd>{review.org.address}</dd>
              <dt className="text-ink-subtle">Contact</dt><dd>{review.org.contact}</dd>
              <dt className="text-ink-subtle">Documents</dt><dd>Registration certificate · {review.org.type === 'institution' ? 'FSSAI licence' : '12A / 80G'} (demo)</dd>
            </dl>
            {review.action === 'rejected' && (
              <div>
                <label htmlFor="reason" className="text-[13px] font-medium">Reason (sent to applicant)</label>
                <Textarea id="reason" className="mt-1.5" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Registration document is unreadable" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
