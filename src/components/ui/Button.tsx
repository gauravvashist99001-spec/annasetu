import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-[10px] transition-[background,color,box-shadow,transform,border-color] duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none select-none'
const variants: Record<Variant, string> = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900 shadow-[0_1px_0_rgb(255_255_255/0.1)_inset,0_1px_2px_rgb(15_23_42/0.1)]',
  secondary: 'bg-brand-50 text-brand-800 hover:bg-brand-100',
  outline: 'border border-line bg-white text-ink hover:border-line-strong hover:bg-canvas',
  ghost: 'text-ink-muted hover:bg-slate-100 hover:text-ink',
  accent: 'bg-accent-500 text-ink hover:bg-accent-600 hover:text-white',
  danger: 'bg-danger text-white hover:bg-red-700',
  inverse: 'bg-white text-brand-900 hover:bg-brand-50',
}
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
})

interface ButtonLinkProps extends LinkProps {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconRight, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass(variant, size, className as string)} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  )
}
