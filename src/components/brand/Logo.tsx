import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

/** Mark: a food bowl (orange) bridged by an arch to a community node — "Anna" + "Setu". */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#166534" />
      <path d="M6.5 21.5C9 13.5 12.5 10.5 16 10.5s7 3 9.5 11" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M11 21.5v-4.2M16 21.5v-7M21 21.5v-4.2" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 21.5h7a3.5 3.5 0 0 1-7 0Z" fill="#F59E0B" />
      <circle cx="25.5" cy="17.4" r="1.9" fill="#fff" />
      <path d="M22.3 23.8a3.2 3.2 0 0 1 6.4 0" fill="#fff" />
    </svg>
  )
}

export function Logo({ to = '/', inverse, className }: { to?: string; inverse?: boolean; className?: string }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 rounded-lg', className)} aria-label="AnnaSetu home">
      <LogoMark />
      <span className={cn('text-[19px] font-bold tracking-tight', inverse ? 'text-white' : 'text-ink')}>
        Anna<span className={inverse ? 'text-brand-200' : 'text-brand-700'}>Setu</span>
      </span>
    </Link>
  )
}
