import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface FormSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 p-6', className)}>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
}
