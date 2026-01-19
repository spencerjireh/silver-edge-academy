import { cn } from '@/utils/cn'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LevelBadge({ level, size = 'md', className }: LevelBadgeProps) {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        'bg-violet-50 text-violet-600 border-b-2 border-violet-200',
        sizeStyles[size],
        className
      )}
    >
      <span>Lv</span>
      <span>{level}</span>
    </div>
  )
}
