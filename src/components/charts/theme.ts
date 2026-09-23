/** Chart tokens — categorical order validated for CVD separation & contrast (never cycled). */
export const SERIES = ['#16a34a', '#2563eb', '#d97706', '#9333ea', '#0891b2', '#db2777'] as const
export const GRID = '#eef2f6'
export const AXIS = '#94a3b8'
export const MUTED_FILL = '#cbd5e1'

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: '#64748b' },
} as const
