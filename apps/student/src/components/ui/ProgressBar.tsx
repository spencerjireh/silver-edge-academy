import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'violet' | 'secondary' | 'xp' | 'success'
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)

  const sizeStyles = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }

  // Note: violet is an alias for primary, success is an alias for secondary
  // This allows semantic naming (success for completion states) while maintaining color consistency
  const colorStyles = {
    primary: 'bg-gradient-to-r from-violet-400 to-violet-500',
    violet: 'bg-gradient-to-r from-violet-400 to-violet-500', // alias for primary
    secondary: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
    xp: 'bg-gradient-to-r from-amber-400 to-amber-500',
    success: 'bg-gradient-to-r from-emerald-400 to-emerald-500', // alias for secondary
  }

  const trackColors = {
    primary: 'bg-violet-100',
    violet: 'bg-violet-100', // alias for primary
    secondary: 'bg-emerald-100',
    xp: 'bg-amber-100',
    success: 'bg-emerald-100', // alias for secondary
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full overflow-hidden', sizeStyles[size], trackColors[color])}>
        <div
          className={cn(
            'h-full rounded-full',
            colorStyles[color],
            animated && 'progress-bar-animated'
          )}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-slate-600 mt-1">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}
