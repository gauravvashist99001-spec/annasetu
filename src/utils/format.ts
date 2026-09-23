const nf = new Intl.NumberFormat('en-IN')

export const fmtNum = (n: number) => nf.format(Math.round(n))
export const fmtKg = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${fmtNum(kg)} kg`)
export const fmtPct = (n: number, digits = 0) => `${n.toFixed(digits)}%`
export const fmtKm = (km: number) => `${km.toFixed(1)} km`

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function fmtDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
export function fmtDateTime(iso: string) {
  return `${fmtDateShort(iso)}, ${fmtTime(iso)}`
}

/** "2h 40m" until the given time; "Expired" when past. */
export function timeRemaining(iso: string, now = Date.now()) {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return 'Expired'
  const m = Math.floor(ms / 60000)
  const h = Math.floor(m / 60)
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`
}
export function minutesRemaining(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((new Date(iso).getTime() - now) / 60000))
}

export function timeAgo(iso: string, now = Date.now()) {
  const s = Math.floor((now - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
