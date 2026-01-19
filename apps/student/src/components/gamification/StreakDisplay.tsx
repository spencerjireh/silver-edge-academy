import { Flame } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StreakDisplayProps {
  days: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function StreakDisplay({
  days,
  size = 'md',
  showLabel = false,
  className,
}: StreakDisplayProps) {
  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const isActive = days > 0

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-bold',
        isActive ? 'text-streak-orange' : 'text-slate-400',
        sizeStyles[size],
        className
      )}
    >
      <Flame
        className={cn(
          iconSizes[size],
          isActive && 'animate-fire fill-streak-orange'
        )}
      />
      <span>
        {days}
        {showLabel && (days === 1 ? ' day' : ' days')}
      </span>
    </div>
  )
}
