import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent'
  size?: 'sm' | 'md'
  dot?: boolean
  children: ReactNode
  className?: string
}

const variants = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-sky-50 text-sky-700',
  accent: 'bg-accent-50 text-accent-700',
}

const dotColors = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-sky-500',
  accent: 'bg-accent-500',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'pending' | 'archived' }) {
  const config = {
    active: { variant: 'success' as const, label: 'Active', dot: true },
    inactive: { variant: 'default' as const, label: 'Inactive', dot: true },
    pending: { variant: 'warning' as const, label: 'Pending', dot: true },
    archived: { variant: 'default' as const, label: 'Archived', dot: true },
  }

  const { variant, label, dot } = config[status]

  return (
    <Badge variant={variant} dot={dot}>
      {label}
    </Badge>
  )
}

export function RoleBadge({ role }: { role: 'teacher' | 'parent' | 'student' | 'admin' }) {
  const config = {
    teacher: { variant: 'accent' as const, label: 'Teacher' },
    parent: { variant: 'success' as const, label: 'Parent' },
    student: { variant: 'warning' as const, label: 'Student' },
    admin: { variant: 'info' as const, label: 'Admin' },
  }

  const { variant, label } = config[role]

  return (
    <Badge variant={variant} className="rounded">
      {label}
    </Badge>
  )
}
