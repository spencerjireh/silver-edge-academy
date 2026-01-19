import { Sparkles } from 'lucide-react'
import { useGamification } from '@/contexts/GamificationContext'

export function XpGainAnimation() {
  const { xpGains } = useGamification()

  if (xpGains.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {xpGains.map((event) => (
        <div
          key={event.id}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-xp-rise"
        >
          <div className="flex items-center gap-2 text-xl font-display font-bold text-amber-500 crystal-glass-heavy px-5 py-2.5 rounded-full border border-amber-200">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>+{event.amount} XP</span>
          </div>
        </div>
      ))}
    </div>
  )
}
