import { motion } from 'framer-motion'
import { BadgeCheck, Building2, Cpu, Soup, Users } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * Hero visual — the AnnaSetu "bridge": surplus travels over an arch, through the AI apex,
 * to verified recipients and the community. Particles = meals in motion.
 */
const VB = { w: 560, h: 470 }
const ARCH = 'M70 350 Q280 20 490 350'
const NODES = [
  { x: 70, y: 350, label: 'Institution', icon: Building2, tone: 'green' },
  { x: 175, y: 226, label: 'Surplus Food', icon: Soup, tone: 'amber' },
  { x: 280, y: 185, label: 'AnnaSetu AI', icon: Cpu, tone: 'blue', big: true },
  { x: 385, y: 226, label: 'Verified NGO', icon: BadgeCheck, tone: 'green' },
  { x: 490, y: 350, label: 'Community', icon: Users, tone: 'green' },
] as const

const toneCls = {
  green: 'bg-white text-brand-800 ring-brand-200',
  amber: 'bg-white text-accent-700 ring-accent-100',
  blue: 'bg-tech-600 text-white ring-tech-100',
}

// Background mesh — deterministic points so SSR/refresh is stable.
const MESH = Array.from({ length: 22 }, (_, i) => ({ x: (i * 97) % VB.w, y: 30 + ((i * 173) % (VB.h - 60)) }))

export function EcosystemVisual() {
  const hangers = Array.from({ length: 11 }, (_, i) => {
    const t = (i + 1) / 12
    const x = (1 - t) ** 2 * 70 + 2 * (1 - t) * t * 280 + t ** 2 * 490
    const y = (1 - t) ** 2 * 350 + 2 * (1 - t) * t * 20 + t ** 2 * 350
    return { x, y }
  })
  return (
    <div className="relative mx-auto aspect-[56/47] w-full max-w-[560px]">
      <div className="absolute inset-[4%] rounded-[28px] border border-line bg-white/60 bg-grid" aria-hidden />
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <radialGradient id="aiGlow">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="archGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        {/* network mesh */}
        {MESH.map((p, i) => {
          if (i % 2) return null
          const q = MESH[(i + 3) % MESH.length]
          return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#e2e8f0" strokeWidth="1" strokeOpacity="0.7" />
        })}
        {MESH.map((p, i) => (
          <circle key={`m${i}`} cx={p.x} cy={p.y} r="2.5" fill="#cbd5e1">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={`${3 + (i % 4)}s`} repeatCount="indefinite" begin={`${(i % 5) * 0.4}s`} />
          </circle>
        ))}
        <circle cx="280" cy="185" r="95" fill="url(#aiGlow)" />
        {/* deck + hangers */}
        <line x1="40" y1="350" x2="520" y2="350" stroke="#0f172a" strokeOpacity="0.12" strokeWidth="3" strokeLinecap="round" />
        {hangers.map((h, i) => (
          <line key={i} x1={h.x} y1={h.y} x2={h.x} y2={350} stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1.5" />
        ))}
        {/* arch */}
        <motion.path d={ARCH} fill="none" stroke="url(#archGrad)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
        {/* meals in motion */}
        {[0, 0.8, 1.6, 2.4, 3.2].map((b) => (
          <circle key={b} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2">
            <animateMotion dur="4s" repeatCount="indefinite" begin={`${b}s`} path={ARCH} />
          </circle>
        ))}
        {/* community dots */}
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={470 + i * 20} cy={395} r="6" fill="#16a34a" opacity={0.25 + i * 0.2} />
        ))}
        <path d="M50 395h40" stroke="#16a34a" strokeOpacity="0.4" strokeWidth="2" strokeDasharray="3 4" />
      </svg>

      {NODES.map((n, i) => (
        <motion.div
          key={n.label}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
          style={{ left: `${(n.x / VB.w) * 100}%`, top: `${(n.y / VB.h) * 100}%` }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.18, duration: 0.4 }}
        >
          <span className={cn('grid place-items-center rounded-2xl shadow-[var(--shadow-raised)] ring-4', toneCls[n.tone], 'big' in n ? 'size-14 sm:size-16' : 'size-10 sm:size-12')}>
            <n.icon className={'big' in n ? 'size-6 sm:size-7' : 'size-5'} aria-hidden />
          </span>
          <span className={cn('whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs', 'big' in n ? 'bg-ink text-white' : 'bg-white/90 text-ink')}>{n.label}</span>
        </motion.div>
      ))}

      {/* floating data cards */}
      <motion.div
        className="absolute left-[2%] top-[6%] hidden animate-float rounded-xl border border-line bg-white px-3 py-2 shadow-[var(--shadow-raised)] sm:block"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Surplus registered</p>
        <p className="text-[13px] font-semibold text-ink">Rice + Dal · 120 meals</p>
      </motion.div>
      <motion.div
        className="absolute right-[2%] top-[10%] hidden rounded-xl border border-line bg-white px-3 py-2 shadow-[var(--shadow-raised)] sm:block"
        style={{ animation: 'float 6s ease-in-out 1.5s infinite' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">Best match · 2.4 km</p>
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          Score 92 <span className="rounded bg-brand-50 px-1 text-[10px] font-bold text-brand-800">VERIFIED</span>
        </p>
      </motion.div>
      <motion.div
        className="absolute bottom-[3%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-800 shadow-sm sm:text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Delivered · impact recorded
      </motion.div>
    </div>
  )
}
