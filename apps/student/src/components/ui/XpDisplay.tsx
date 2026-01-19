import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { displaySizeStyles, displayIconSizes, type DisplaySize } from '@/utils/displayStyles'

interface XpDisplayProps {
  amount: number
  size?: DisplaySize
  showLabel?: boolean
  className?: string
}

export function XpDisplay({ amount, size = 'md', showLabel = false, className }: XpDisplayProps) {

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-bold text-xp-gold',
        displaySizeStyles[size],
        className
      )}
    >
      <Star className={cn(displayIconSizes[size], 'fill-xp-gold text-xp-gold')} />
      <span>
        {amount.toLocaleString()}
        {showLabel && ' XP'}
      </span>
    </div>
  )
}
