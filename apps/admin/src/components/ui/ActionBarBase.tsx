import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

interface ActionBarBaseProps {
  children: ReactNode
  className?: string
  visible?: boolean
  animate?: boolean
}

export function ActionBarBase({
  children,
  className,
  visible = true,
  animate = false,
}: ActionBarBaseProps) {
  if (!visible) return null

  return createPortal(
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
        'bg-slate-900 text-white rounded-xl shadow-2xl',
        'px-4 py-3 flex items-center gap-4',
        animate && 'animate-in slide-in-from-bottom-4 duration-200',
        className
      )}
    >
      {children}
    </div>,
    document.body
  )
}
