import { FlaskConical } from 'lucide-react'
import { Hero, ImpactNumbers } from '@/components/landing/Hero'
import { HowItWorksSection, ProblemSection, SolutionSection } from '@/components/landing/Story'
import { AISection, ImpactPreview, MatchingSection, TrackSection } from '@/components/landing/Platform'
import { AudienceSection, FinalCTA, SafetySection } from '@/components/landing/Audience'
import { DemoRolePicker } from '@/components/landing/DemoRolePicker'
import { Reveal } from '@/components/landing/Reveal'

export default function Landing() {
  return (
    <>
      <Hero />
      <ImpactNumbers />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <AISection />
      <MatchingSection />
      <TrackSection />
      <ImpactPreview />
      <section id="demo" className="container-page pb-20 sm:pb-24" aria-labelledby="demo-title">
        <Reveal>
          <div className="rounded-2xl border border-dashed border-line-strong bg-white p-5 sm:p-7">
            <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-700"><FlaskConical className="size-3.5" aria-hidden /> Explore Demo</p>
                <h2 id="demo-title" className="mt-1 text-xl font-bold text-ink sm:text-2xl">Step into the platform — no sign-up needed.</h2>
              </div>
              <p className="text-[13px] text-ink-subtle">Fictional demo data · nothing real is coordinated</p>
            </div>
            <DemoRolePicker />
          </div>
        </Reveal>
      </section>
      <AudienceSection />
      <SafetySection />
      <FinalCTA />
    </>
  )
}
