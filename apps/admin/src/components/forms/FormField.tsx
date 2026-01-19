import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FormFieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-slate-700 mb-1.5"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

interface FormRowProps {
  children: ReactNode
  columns?: 2 | 3
  className?: string
}

export function FormRow({ children, columns = 2, className }: FormRowProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 ? 'grid-cols-2' : 'grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  )
}
