import { ArrowRight, Building2, HandHeart, Truck, Landmark } from 'lucide-react'
import { ButtonLink } from '@/components/ui'
import { Reveal } from '@/components/landing/Reveal'
import { PublicHero } from './PublicHero'

const TYPES = [
  { icon: Building2, title: 'Food-generating institutions', text: 'Hostels, hospitals, hotels, corporate & college canteens, food-processing units.', req: ['Valid registration / FSSAI licence', 'Designated kitchen contact', 'Commitment to record prep & storage details'] },
  { icon: HandHeart, title: 'Recipient organisations', text: 'Community kitchens, shelters, foundations, community centres.', req: ['Registration certificate (Trust / Society / Section 8)', 'Serving location & capacity', 'Named receiving contact'] },
  { icon: Truck, title: 'Volunteers & logistics', text: 'Individuals, student groups, and logistics partners.', req: ['Government ID verification', 'Vehicle details', 'Short handling orientation'] },
  { icon: Landmark, title: 'Civic & CSR partners', text: 'Municipal bodies, CSR programmes and research institutions.', req: ['Data-sharing agreement', 'Aggregate, anonymised reporting'] },
]

export default function Partners() {
  return (
    <>
      <PublicHero eyebrow="Partners" title="Join the network.">
        AnnaSetu works only with verified participants. Here’s who can join and what verification involves.
      </PublicHero>
      <section className="container-page py-16 sm:py-24">
        <div className="mb-10 rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-ink-muted">
          <span className="font-semibold text-ink">Prototype notice:</span> AnnaSetu has no live partnerships yet. Organisation names in the demo are fictional.
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {TYPES.map((t, i) => (
            <li key={t.title}>
              <Reveal delay={i * 0.05} className="h-full rounded-2xl border border-line bg-white p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-800"><t.icon className="size-5" aria-hidden /></span>
                <h2 className="mt-4 text-lg font-semibold">{t.title}</h2>
                <p className="mt-1 text-sm text-ink-muted">{t.text}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-subtle">Verification</p>
                <ul className="mt-2 space-y-1.5 text-sm text-ink-muted">{t.req.map((r) => <li key={r} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-brand-600" />{r}</li>)}</ul>
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/register" iconRight={<ArrowRight className="size-4" />}>Apply to join</ButtonLink>
          <ButtonLink to="/contact" variant="outline">Talk to us</ButtonLink>
        </div>
      </section>
    </>
  )
}
