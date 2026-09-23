import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Chip({ active, onClick, children, count }: { active?: boolean; onClick?: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
        active ? 'border-brand-800 bg-brand-800 text-white' : 'border-line bg-white text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
      {count !== undefined && <span className={cn('num rounded-full px-1.5 text-[11px]', active ? 'bg-white/20' : 'bg-slate-100')}>{count}</span>}
    </button>
  )
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[10px] border border-line bg-slate-50 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'h-8 rounded-lg px-3 text-[13px] font-medium transition-colors whitespace-nowrap',
            value === o.value ? 'bg-white text-ink shadow-sm ring-1 ring-line' : 'text-ink-subtle hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
