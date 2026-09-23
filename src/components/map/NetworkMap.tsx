/**
 * NetworkMap — provider-agnostic map surface.
 *
 * The prototype renders a lightweight schematic SVG of Delhi (no tiles, no API key, works offline
 * for demos). The props are the same shape a Leaflet/OpenStreetMap or Mapbox adapter would take
 * (lat/lng markers + routes), so swapping the renderer is a drop-in change:
 *    <NetworkMap provider="osm" … />  → render react-leaflet <MapContainer> with the same markers.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Building2, HandHeart } from 'lucide-react'
import type { Organization } from '@/types'
import { cn } from '@/utils/cn'

export interface MapRoute { id: string; from: string; to: string; active?: boolean; label?: string }
export interface MapMarkerExtra { id: string; latitude: number; longitude: number; kind: 'volunteer' | 'pickup'; label: string }

interface Props {
  organizations: Organization[]
  routes?: MapRoute[]
  extras?: MapMarkerExtra[]
  anonymized?: boolean
  height?: number | string
  highlight?: string[]
  className?: string
  showLegend?: boolean
}

const BOUNDS = { minLon: 77.02, maxLon: 77.34, minLat: 28.5, maxLat: 28.74 }
const W = 1000
const H = Math.round(W * ((BOUNDS.maxLat - BOUNDS.minLat) * 111) / ((BOUNDS.maxLon - BOUNDS.minLon) * 111 * Math.cos((28.62 * Math.PI) / 180)))

function project(lat: number, lon: number) {
  return {
    x: ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * W,
    y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
  }
}

// Schematic geography (approximate) — Yamuna river + ring roads + district labels.
const river = [
  [28.74, 77.225], [28.7, 77.232], [28.67, 77.245], [28.64, 77.252], [28.61, 77.258], [28.58, 77.27], [28.55, 77.285], [28.5, 77.3],
].map(([la, lo]) => project(la, lo))
const riverPath = river.reduce((d, p, i) => d + (i ? ` L${p.x},${p.y}` : `M${p.x},${p.y}`), '')
const LABELS: [string, number, number][] = [
  ['Rohini', 28.715, 77.1], ['North Campus', 28.7, 77.2], ['Civil Lines', 28.683, 77.235], ['Karol Bagh', 28.658, 77.17], ['Connaught Place', 28.625, 77.205],
  ['Shahdara', 28.685, 77.3], ['Laxmi Nagar', 28.64, 77.29], ['Dwarka', 28.575, 77.06], ['Janakpuri', 28.63, 77.075], ['Kalkaji', 28.54, 77.245], ['Okhla', 28.525, 77.285],
]

export function NetworkMap({ organizations, routes = [], extras = [], anonymized, height = 420, highlight = [], className, showLegend = true }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const show = (id: string, x: number, y: number) => {
    setHover(id)
    const svg = svgRef.current, box = boxRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !box || !ctm) return
    const pt = new DOMPoint(x, y).matrixTransform(ctm)
    const r = box.getBoundingClientRect()
    setTip({ x: pt.x - r.left, y: pt.y - r.top })
  }
  const hide = () => { setHover(null); setTip(null) }
  // Keep markers a constant on-screen size whatever the map's rendered width.
  const [ms, setMs] = useState(1.4)
  useEffect(() => {
    const el = boxRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => {
      // SVG units per screen pixel under preserveAspectRatio="meet"
      const { width, height } = e.contentRect
      if (width > 0 && height > 0) setMs(Math.max(W / width, H / height))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const [filter, setFilter] = useState<{ institution: boolean; ngo: boolean; routes: boolean }>({ institution: true, ngo: true, routes: true })

  const pts = useMemo(
    () =>
      organizations.map((o, i) => {
        // Anonymised view nudges each point ~300–500 m so exact premises aren't exposed publicly.
        const j = anonymized ? { la: Math.sin(i * 12.9898) * 0.004, lo: Math.cos(i * 78.233) * 0.004 } : { la: 0, lo: 0 }
        return { org: o, ...project(o.latitude + j.la, o.longitude + j.lo) }
      }),
    [organizations, anonymized],
  )
  const byId = Object.fromEntries(pts.map((p) => [p.org.id, p]))
  const hovered = pts.find((p) => p.org.id === hover)

  return (
    <div ref={boxRef} className={cn('relative overflow-hidden rounded-xl border border-line bg-[#f4f7f5] bg-[linear-gradient(to_right,#e3ebe6_1px,transparent_1px),linear-gradient(to_bottom,#e3ebe6_1px,transparent_1px)] bg-[size:28px_28px]', className)} style={{ height }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full" role="img" aria-label={`Map of ${organizations.length} partner locations across Delhi${anonymized ? ' (approximate, anonymised)' : ''}`}>
        <rect width={W} height={H} fill="#f4f7f5" opacity="0.6" />
        {/* Green belts */}
        <ellipse cx={project(28.64, 77.16).x} cy={project(28.64, 77.16).y} rx="70" ry="40" fill="#dcefe2" />
        <ellipse cx={project(28.56, 77.17).x} cy={project(28.56, 77.17).y} rx="90" ry="50" fill="#dcefe2" />
        {/* Ring roads */}
        <ellipse cx={project(28.625, 77.2).x} cy={project(28.625, 77.2).y} rx="230" ry="190" fill="none" stroke="#fff" strokeWidth="9" />
        <ellipse cx={project(28.625, 77.2).x} cy={project(28.625, 77.2).y} rx="230" ry="190" fill="none" stroke="#dde5e0" strokeWidth="1.5" />
        <ellipse cx={project(28.63, 77.19).x} cy={project(28.63, 77.19).y} rx="340" ry="280" fill="none" stroke="#fff" strokeWidth="7" />
        {/* Yamuna */}
        <path d={riverPath} fill="none" stroke="#cfe3f5" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        <path d={riverPath} fill="none" stroke="#b9d6f0" strokeWidth="2" strokeLinecap="round" />
        {LABELS.map(([t, la, lo]) => {
          const p = project(la, lo)
          return (
            <text key={t} x={p.x} y={p.y} textAnchor="middle" className="fill-slate-400 font-medium uppercase" style={{ letterSpacing: 1.5, fontSize: 9.5 * ms }}>
              {t}
            </text>
          )
        })}

        {/* Routes */}
        {filter.routes &&
          routes.map((r) => {
            const a = byId[r.from], b = byId[r.to]
            if (!a || !b) return null
            const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.18
            const d = `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`
            return (
              <g key={r.id}>
                <path d={d} fill="none" stroke={r.active ? '#2563eb' : '#94a3b8'} strokeOpacity={r.active ? 0.25 : 0.25} strokeWidth={(r.active ? 6 : 3.5) * ms} strokeLinecap="round" />
                <path d={d} fill="none" stroke={r.active ? '#2563eb' : '#94a3b8'} strokeWidth={1.75 * ms} strokeDasharray={`${5 * ms} ${5 * ms}`} strokeLinecap="round" className={r.active ? 'animate-dash' : ''} />
              </g>
            )
          })}

        {/* Extras (volunteers / pickups) */}
        {extras.map((e) => {
          const p = project(e.latitude, e.longitude)
          return (
            <g key={e.id} transform={`translate(${p.x},${p.y}) scale(${ms * 0.8})`}>
              <circle r="16" fill="#2563eb" opacity="0.15" className="origin-center animate-pulse-ring" style={{ transformBox: 'fill-box' }} />
              <circle r="8" fill="#2563eb" stroke="#fff" strokeWidth="3" />
            </g>
          )
        })}

        {/* Markers */}
        {pts
          .filter((p) => filter[p.org.type])
          .map((p) => {
            const inst = p.org.type === 'institution'
            const hl = highlight.includes(p.org.id) || hover === p.org.id
            const pending = p.org.verification_status !== 'verified'
            return (
              <g
                key={p.org.id}
                transform={`translate(${p.x},${p.y}) scale(${ms * 0.72})`}
                tabIndex={0}
                role="button"
                aria-label={anonymized ? `${inst ? 'Institution' : 'Recipient organisation'} in ${p.org.area}` : `${p.org.name}, ${p.org.area}`}
                onMouseEnter={() => show(p.org.id, p.x, p.y)}
                onMouseLeave={hide}
                onFocus={() => show(p.org.id, p.x, p.y)}
                onBlur={hide}
                className="cursor-pointer outline-none"
              >
                {hl && <circle r="26" fill={inst ? '#16a34a' : '#f59e0b'} opacity="0.18" />}
                {inst ? (
                  <rect x="-13" y="-13" width="26" height="26" rx="7" fill={pending ? '#fff' : '#166534'} stroke={pending ? '#166534' : '#fff'} strokeWidth="3" strokeDasharray={pending ? '4 3' : undefined} />
                ) : (
                  <circle r="13" fill={pending ? '#fff' : '#f59e0b'} stroke={pending ? '#d97706' : '#fff'} strokeWidth="3" strokeDasharray={pending ? '4 3' : undefined} />
                )}
                <circle r={inst ? 3.5 : 3.5} fill={pending ? (inst ? '#166534' : '#d97706') : '#fff'} />
              </g>
            )
          })}
      </svg>

      {hovered && tip && (
        <div
          className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-[var(--shadow-raised)]"
          style={{ left: tip.x, top: tip.y - 18 }}
        >
          <p className="flex items-center gap-1.5 font-semibold text-ink">
            {hovered.org.type === 'institution' ? <Building2 className="size-3.5 text-brand-700" aria-hidden /> : <HandHeart className="size-3.5 text-accent-600" aria-hidden />}
            {anonymized ? (hovered.org.type === 'institution' ? `${hovered.org.kind}` : `${hovered.org.kind}`) : hovered.org.name}
          </p>
          <p className="mt-0.5 text-ink-subtle">{hovered.org.area}{anonymized ? ' (approx.)' : ''}</p>
        </div>
      )}

      {showLegend && (
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {(
            [
              ['institution', 'Institutions', <span key="i" className="size-2.5 rounded-[3px] bg-brand-800" />],
              ['ngo', 'Recipients', <span key="n" className="size-2.5 rounded-full bg-accent-500" />],
              ['routes', 'Routes', <span key="r" className="h-0.5 w-3 border-t-2 border-dashed border-tech-600" />],
            ] as const
          ).map(([k, label, sw]) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter[k]}
              onClick={() => setFilter((f) => ({ ...f, [k]: !f[k] }))}
              className={cn('inline-flex items-center gap-1.5 rounded-md border bg-white/95 px-2 py-1 text-[11px] font-medium shadow-sm backdrop-blur transition-opacity', filter[k] ? 'border-line text-ink' : 'border-transparent text-ink-subtle opacity-60')}
            >
              {sw} {label}
            </button>
          ))}
          {extras.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white/95 px-2 py-1 text-[11px] font-medium text-ink shadow-sm">
              <span className="size-2.5 rounded-full bg-tech-600" /> Volunteer
            </span>
          )}
        </div>
      )}
      <p className="absolute bottom-3 right-3 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-ink-subtle">Schematic map · </p>
    </div>
  )
}
