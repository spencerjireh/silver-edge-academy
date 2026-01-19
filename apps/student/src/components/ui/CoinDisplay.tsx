import { Coins } from 'lucide-react'
import { cn } from '@/utils/cn'
import { displaySizeStyles, displayIconSizes, type DisplaySize } from '@/utils/displayStyles'

interface CoinDisplayProps {
  amount: number
  size?: DisplaySize
  className?: string
}

export function CoinDisplay({ amount, size = 'md', className }: CoinDisplayProps) {

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 font-bold text-coins-yellow',
        displaySizeStyles[size],
        className
      )}
    >
      <Coins className={cn(displayIconSizes[size], 'text-coins-yellow')} />
      <span>{amount.toLocaleString()}</span>
    </div>
  )
}
