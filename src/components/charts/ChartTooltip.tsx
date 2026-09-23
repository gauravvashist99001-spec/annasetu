/* Shared tooltip: text wears ink tokens; the colored swatch carries identity. */
interface Item { name?: string | number; value?: number | string | (number | string)[]; color?: string; dataKey?: string | number; payload?: Record<string, unknown> }

export function ChartTooltip({ active, payload, label, unit, labelFormatter }: { active?: boolean; payload?: Item[]; label?: string | number; unit?: string; labelFormatter?: (l: string | number) => string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-36 rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-[var(--shadow-raised)]">
      {label !== undefined && <p className="mb-1.5 font-semibold text-ink">{labelFormatter ? labelFormatter(label) : label}</p>}
      <ul className="space-y-1">
        {payload.filter((p) => p.value !== undefined && p.value !== null && !Array.isArray(p.value)).map((p) => (
          <li key={String(p.dataKey ?? p.name)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-muted">
              <span className="size-2 rounded-full" style={{ background: p.color }} aria-hidden />
              {p.name}
            </span>
            <span className="num font-semibold text-ink">
              {typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}
              {unit && <span className="ml-0.5 font-normal text-ink-subtle">{unit}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          {i.dashed ? (
            <svg width="16" height="4" aria-hidden><line x1="0" y1="2" x2="16" y2="2" stroke={i.color} strokeWidth="2" strokeDasharray="4 3" /></svg>
          ) : (
            <span className="h-0.5 w-4 rounded-full" style={{ background: i.color, height: 3 }} aria-hidden />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  )
}
