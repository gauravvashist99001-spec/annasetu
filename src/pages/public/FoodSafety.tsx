import { AlertTriangle, ClipboardCheck, Clock, Scale, Thermometer, UserCheck } from 'lucide-react'
import { SafetyChecklist } from '@/components/landing/Audience'
import { Reveal } from '@/components/landing/Reveal'
import { PublicHero } from './PublicHero'

const PRINCIPLES = [
  { icon: Scale, title: 'Follow applicable regulations', text: 'Donors and recipients must comply with applicable food-safety laws and guidance, such as FSSAI requirements for food handling and surplus food distribution.' },
  { icon: Clock, title: 'Respect the safe-use window', text: 'Food should only be redistributed within an appropriate safe-use window set by the food handler. The platform never extends it, and hides listings once it has passed.' },
  { icon: Thermometer, title: 'Storage conditions matter', text: 'Hot holding, refrigeration or room temperature changes how long food stays suitable. Storage is recorded for every listing and shown to recipients and volunteers.' },
  { icon: UserCheck, title: 'Recipients can decline', text: 'Receiving organisations inspect food on arrival and may refuse anything they are not comfortable serving — without penalty.' },
]

export default function FoodSafety() {
  return (
    <>
      <PublicHero eyebrow="Food safety" title="Safety is a shared responsibility. We make it visible.">
        AnnaSetu provides digital coordination and tracking. It does not independently inspect or certify food as safe.
      </PublicHero>
      <section className="container-page grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <ul className="space-y-6">
            {PRINCIPLES.map((p, i) => (
              <li key={p.title}><Reveal delay={i * 0.05} className="flex gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-800"><p.icon className="size-5" aria-hidden /></span><div><h2 className="text-lg font-semibold">{p.title}</h2><p className="mt-1 text-[15px] leading-relaxed text-ink-muted">{p.text}</p></div></Reveal></li>
            ))}
          </ul>
          <div className="mt-10 flex gap-3 rounded-xl border border-accent-100 bg-accent-50 p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-accent-700" aria-hidden />
            <p className="text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">What AnnaSetu’s AI does not do:</span> it does not judge whether food is safe to eat. Forecasts and matching help coordination only; food-safety decisions stay with trained food handlers and receiving organisations.
            </p>
          </div>
        </div>
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-subtle"><ClipboardCheck className="size-4" aria-hidden /> Checklist enforced on every listing</p>
          <SafetyChecklist interactive />
          <p className="mt-4 text-[13px] text-ink-subtle">A listing can’t be matched until these are recorded, and the donor confirms it has been handled per applicable requirements.</p>
        </div>
      </section>
    </>
  )
}
