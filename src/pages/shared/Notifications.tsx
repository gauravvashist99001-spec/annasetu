import { useState } from 'react'
import { CheckCheck } from 'lucide-react'
import type { NotificationType } from '@/types'
import { Button, Card, Chip, PageHeader } from '@/components/ui'
import { NOTIF_META, NotificationList } from '@/components/dashboard/NotificationList'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'

export default function Notifications() {
  const { session } = useAuth()
  const { state, dispatch } = useData()
  const role = session!.user.role
  const [cat, setCat] = useState<NotificationType | 'all' | 'unread'>('all')
  const mine = state.notifications.filter((n) => n.user_role === role || n.user_role === 'all')
  const items = mine.filter((n) => (cat === 'all' ? true : cat === 'unread' ? !n.read : n.type === cat))
  return (
    <>
      <PageHeader title="Notifications" description="Urgent pickups, food alerts, delivery updates and AI insights." actions={<Button variant="outline" icon={<CheckCheck className="size-4" />} onClick={() => dispatch({ type: 'readAll' })}>Mark all read</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={cat === 'all'} onClick={() => setCat('all')} count={mine.length}>All</Chip>
        <Chip active={cat === 'unread'} onClick={() => setCat('unread')} count={mine.filter((n) => !n.read).length}>Unread</Chip>
        {(Object.keys(NOTIF_META) as NotificationType[]).map((t) => (
          <Chip key={t} active={cat === t} onClick={() => setCat(t)} count={mine.filter((n) => n.type === t).length}>{NOTIF_META[t].label}</Chip>
        ))}
      </div>
      <Card className="overflow-hidden"><NotificationList items={items} /></Card>
    </>
  )
}
