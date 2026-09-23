import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface Column<T> {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  hideOnMobile?: boolean
}

/**
 * Responsive data table: a real <table> from md up; stacked cards on small screens
 * (instead of a squeezed horizontal scroll).
 */
export function DataTable<T>({ columns, rows, rowKey, empty, caption, onRowClick }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; empty?: ReactNode; caption?: string; onRowClick?: (r: T) => void }) {
  if (!rows.length) return <div className="px-5 py-10 text-center text-sm text-ink-subtle">{empty ?? 'No records found.'}</div>
  return (
    <>
      <div className="hidden overflow-x-auto md:block scrollbar-thin">
        <table className="w-full text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-y border-line bg-slate-50/70">
              {columns.map((c) => (
                <th key={c.key} scope="col" className={cn('px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle whitespace-nowrap', c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cn('transition-colors hover:bg-slate-50', onRowClick && 'cursor-pointer')}>
                {columns.map((c) => (
                  <td key={c.key} className={cn('px-5 py-3 align-middle text-ink', c.className)}>{c.cell(r)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-line border-t border-line md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)} className="space-y-2 px-4 py-3.5" onClick={onRowClick ? () => onRowClick(r) : undefined}>
            {columns.filter((c) => !c.hideOnMobile).map((c, i) => (
              <div key={c.key} className={cn('flex items-center justify-between gap-3 text-sm', i === 0 && 'font-medium')}>
                {i > 0 && <span className="text-xs text-ink-subtle">{c.header}</span>}
                <div className={cn(i === 0 ? 'w-full' : 'text-right')}>{c.cell(r)}</div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}
