import { Coins } from 'lucide-react'
import { useGamification } from '@/contexts/GamificationContext'

export function CoinEarnAnimation() {
  const { coinEarns } = useGamification()

  if (coinEarns.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {coinEarns.map((event) => (
        <div
          key={event.id}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 animate-xp-rise"
        >
          <div className="flex items-center gap-2 text-lg font-display font-bold text-amber-600 crystal-glass-heavy px-4 py-2 rounded-full border border-amber-200">
            <Coins className="w-5 h-5 text-amber-500" />
            <span>+{event.amount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
