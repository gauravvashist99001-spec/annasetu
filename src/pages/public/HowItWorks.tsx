import { ArrowRight, BrainCircuit, Building2, HandHeart, Truck } from 'lucide-react'
import { ButtonLink } from '@/components/ui'
import { HowItWorksTimeline } from '@/components/landing/Story'
import { MatchingSection } from '@/components/landing/Platform'
import { Reveal } from '@/components/landing/Reveal'
import { PublicHero } from './PublicHero'

const ROLES = [
  { icon: Building2, title: 'Institution', steps: ['Check tomorrow’s forecast', 'Adjust preparation', 'Register any surplus', 'Confirm recipient', 'Track & report impact'] },
  { icon: HandHeart, title: 'NGO / Recipient', steps: ['Post requirements', 'Get matched or browse nearby', 'Request food', 'Receive & confirm'] },
  { icon: Truck, title: 'Volunteer', steps: ['See nearby pickups', 'Accept with one tap', 'Update picked up / in transit', 'Mark delivered'] },
]

export default function HowItWorks() {
  return (
    <>
      <PublicHero eyebrow="How it works" title="From kitchen to community — predictable, traceable, fast.">
        AnnaSetu first helps kitchens cook closer to real demand. Whatever surplus remains is matched to verified organisations and moved by volunteers, with every step recorded.
      </PublicHero>
      <section className="container-page py-16 sm:py-24">
        <div className="mb-12 flex items-center gap-3 rounded-2xl border border-tech-100 bg-tech-50 p-5">
          <BrainCircuit className="size-6 shrink-0 text-tech-600" aria-hidden />
          <p className="text-sm text-ink-muted"><span className="font-semibold text-ink">Step 0 happens the day before:</span> the demand model forecasts servings per meal and flags likely over-production, so less surplus is created in the first place.</p>
        </div>
        <HowItWorksTimeline detailed />
      </section>
      <section className="border-y border-line bg-white py-16 sm:py-24">
        <div className="container-page">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">What each role does</h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {ROLES.map((r, i) => (
              <li key={r.title}>
                <Reveal delay={i * 0.06} className="h-full rounded-2xl border border-line p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-800"><r.icon className="size-5" aria-hidden /></span>
                  <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
                  <ol className="mt-3 space-y-2">
                    {r.steps.map((s, j) => (
                      <li key={s} className="flex gap-3 text-sm text-ink-muted"><span className="num grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-ink">{j + 1}</span>{s}</li>
                    ))}
                  </ol>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <MatchingSection />
      <div className="container-page pb-20 text-center">
        <ButtonLink to="/login#demo" size="lg" iconRight={<ArrowRight className="size-4" />}>Try it in the demo</ButtonLink>
      </div>
    </>
  )
}
