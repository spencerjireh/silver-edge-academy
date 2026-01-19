import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ActionBarSectionProps {
  children: ReactNode
  withBorder?: boolean
  className?: string
}

export function ActionBarSection({
  children,
  withBorder = false,
  className,
}: ActionBarSectionProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        withBorder && 'pr-4 border-r border-slate-700',
        className
      )}
    >
      {children}
    </div>
  )
}
