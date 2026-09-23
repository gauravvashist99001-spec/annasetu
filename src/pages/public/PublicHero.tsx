import type { ReactNode } from 'react'

export function PublicHero({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="container-page relative py-14 sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">{title}</h1>
        {children && <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">{children}</p>}
      </div>
    </section>
  )
}
