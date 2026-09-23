import { Eye, Handshake, Leaf, Scale, ShieldCheck, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/landing/Reveal'
import { LogoMark } from '@/components/brand/Logo'
import { PublicHero } from './PublicHero'

const VALUES = [
  { icon: Eye, title: 'Transparency', text: 'Every score, forecast and delivery can be inspected. No black boxes for the people using it.' },
  { icon: ShieldCheck, title: 'Trust', text: 'Only verified institutions, recipients and volunteers can transact.' },
  { icon: Scale, title: 'Honest measurement', text: 'Impact comes from confirmed deliveries; estimates are labelled as estimates.' },
  { icon: Handshake, title: 'Dignity', text: 'Recipients choose what they can use. Food is shared, not dumped.' },
  { icon: Leaf, title: 'Prevention first', text: 'The best outcome is food that never became surplus.' },
  { icon: Sparkles, title: 'Useful AI', text: 'Models that suggest, explain and defer to people — never auto-decide.' },
]

export default function About() {
  return (
    <>
      <PublicHero eyebrow="About AnnaSetu" title={<>A bridge between surplus and the people who need it.</>}>
        <span className="font-semibold text-ink">Anna</span> means food. <span className="font-semibold text-ink">Setu</span> means bridge. AnnaSetu is a digital bridge connecting institutional kitchens with verified community organisations — and helping those kitchens waste less to begin with.
      </PublicHero>
      <section className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why we’re building this</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-muted">
            <p>Hostels, hospitals, hotels and canteens cook at scale against uncertain demand. Some over-production is inevitable — but much of it is predictable, and most of what remains is still perfectly good food when the service ends.</p>
            <p>What’s missing is coordination: knowing tomorrow’s likely demand, knowing who nearby can use tonight’s surplus, and moving it within its safe-use window with a clear record of who handled it.</p>
            <p>AnnaSetu brings those pieces together in one platform: <span className="font-medium text-ink">predict, prevent, detect, match, redistribute, track, measure — and improve.</span></p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3"><LogoMark className="size-12" /><div><p className="text-lg font-bold">AnnaSetu</p><p className="text-sm text-ink-subtle">From Surplus to Smiles</p></div></div>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted">The mark shows a food bowl carried across an arch to a community — surplus crossing the bridge to people, with intelligence at the apex.</p>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-[13px] text-ink-muted">
              <p className="font-semibold text-ink">Project status</p>
              <p className="mt-1">AnnaSetu is a prototype developed for the Smart India Hackathon. Organisations, people and figures shown in the demo are fictional; no partnerships are implied.</p>
            </div>
          </div>
        </Reveal>
      </section>
      <section className="border-t border-line bg-white py-16 sm:py-24">
        <div className="container-page">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What we stand for</h2>
          <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((v, i) => (
              <li key={v.title}><Reveal delay={i * 0.05} className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-800"><v.icon className="size-[18px]" aria-hidden /></span><div><p className="font-semibold">{v.title}</p><p className="mt-1 text-sm text-ink-muted">{v.text}</p></div></Reveal></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
