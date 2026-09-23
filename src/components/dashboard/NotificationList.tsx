import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Settings2, Soup, Sparkles, Truck } from 'lucide-react'
import type { AppNotification, NotificationType } from '@/types'
import { useData } from '@/context/DataContext'
import { cn } from '@/utils/cn'
import { timeAgo } from '@/utils/format'

export const NOTIF_META: Record<NotificationType, { label: string; icon: typeof Soup; cls: string }> = {
  urgent: { label: 'Urgent', icon: AlertTriangle, cls: 'bg-danger-50 text-red-700' },
  food: { label: 'Food', icon: Soup, cls: 'bg-accent-50 text-accent-700' },
  delivery: { label: 'Delivery', icon: Truck, cls: 'bg-brand-50 text-brand-800' },
  ai: { label: 'AI Insight', icon: Sparkles, cls: 'bg-tech-50 text-tech-700' },
  system: { label: 'System', icon: Settings2, cls: 'bg-slate-100 text-ink-muted' },
}

export function NotificationList({ items, compact, onOpen }: { items: AppNotification[]; compact?: boolean; onOpen?: () => void }) {
  const { dispatch } = useData()
  const navigate = useNavigate()
  if (!items.length) return <p className="px-4 py-8 text-center text-sm text-ink-subtle">You're all caught up.</p>
  return (
    <ul className="divide-y divide-line">
      {items.map((n) => {
        const m = NOTIF_META[n.type]
        return (
          <li key={n.id}>
            <button
              onClick={() => {
                dispatch({ type: 'readNotification', id: n.id })
                onOpen?.()
                if (n.href) navigate(n.href)
              }}
              className={cn('flex w-full items-start gap-3 text-left transition-colors hover:bg-slate-50', compact ? 'px-4 py-3' : 'px-5 py-4', !n.read && 'bg-brand-50/30')}
            >
              <span className={cn('grid size-8 shrink-0 place-items-center rounded-lg', m.cls)} aria-hidden>
                <m.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-semibold text-ink">{n.title}</span>
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-accent-500" aria-label="Unread" />}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{n.message}</span>
                <span className="mt-1 block text-[11px] text-ink-subtle">{m.label} · {timeAgo(n.created_at)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
