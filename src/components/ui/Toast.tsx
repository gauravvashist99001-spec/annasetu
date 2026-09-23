import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'

type ToastTone = 'success' | 'info' | 'warning'
interface ToastItem { id: number; title: string; body?: string; tone: ToastTone }

const ToastContext = createContext<(t: Omit<ToastItem, 'id' | 'tone'> & { tone?: ToastTone }) => void>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const push = useCallback((t: Omit<ToastItem, 'id' | 'tone'> & { tone?: ToastTone }) => {
    const id = Date.now() + Math.random()
    setItems((s) => [...s, { tone: 'success', ...t, id }])
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 4200)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end" aria-live="polite">
        {items.map((t) => {
          const Icon = t.tone === 'success' ? CheckCircle2 : t.tone === 'warning' ? AlertTriangle : Info
          return (
            <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-white p-3.5 shadow-[var(--shadow-pop)] animate-[slidein_.2s_ease-out]">
              <Icon className={cn('mt-0.5 size-5 shrink-0', t.tone === 'success' ? 'text-brand-600' : t.tone === 'warning' ? 'text-accent-600' : 'text-tech-600')} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.body && <p className="mt-0.5 text-[13px] text-ink-muted">{t.body}</p>}
              </div>
              <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} className="rounded p-0.5 text-ink-subtle hover:text-ink" aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
