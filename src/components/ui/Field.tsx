import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

const control =
  'w-full rounded-[10px] border border-line bg-white px-3 text-sm text-ink placeholder:text-slate-400 transition-colors hover:border-line-strong focus:border-tech-600 focus:outline-none focus:ring-3 focus:ring-tech-100 disabled:bg-slate-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-red-100'

interface FieldProps {
  label: string
  hint?: ReactNode
  error?: string
  required?: boolean
  children: (props: { id: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode
  className?: string
}

export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId()
  const descId = `${id}-desc`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label} {required && <span className="text-danger" aria-hidden>*</span>}
      </label>
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error || hint ? descId : undefined })}
      {error ? (
        <p id={descId} className="text-xs font-medium text-danger" role="alert">{error}</p>
      ) : hint ? (
        <p id={descId} className="text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cn(control, 'h-10', className)} {...rest} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(control, 'min-h-24 py-2.5', className)} {...rest} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...rest }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, 'h-10 appearance-none pr-9', className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
    </div>
  )
})
