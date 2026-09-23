import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export function Reveal({ children, delay = 0, className, y = 16 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={cn('min-w-0', className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeading({ eyebrow, title, children, align = 'left', className }: { eyebrow: string; title: ReactNode; children?: ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <Reveal className={className}>
      <div className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl">{title}</h2>
        {children && <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-[17px]">{children}</p>}
      </div>
    </Reveal>
  )
}
