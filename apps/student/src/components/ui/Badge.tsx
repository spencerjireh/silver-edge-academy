import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-b-2 border-slate-200',
    primary: 'bg-violet-100 text-violet-700 border-b-2 border-violet-300',
    secondary: 'bg-coral-100 text-coral-700 border-b-2 border-coral-300',
    success: 'bg-emerald-100 text-emerald-700 border-b-2 border-emerald-300',
    warning: 'bg-amber-100 text-amber-700 border-b-2 border-amber-300',
    danger: 'bg-red-100 text-red-700 border-b-2 border-red-300',
  }

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  )
}
