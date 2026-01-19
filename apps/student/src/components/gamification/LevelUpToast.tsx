import { useEffect } from 'react'
import { Star } from 'lucide-react'
import { useGamification } from '@/contexts/GamificationContext'
import { cn } from '@/utils/cn'

export function LevelUpToast() {
  const { levelUps, clearLevelUp } = useGamification()

  const currentLevelUp = levelUps[0]

  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (!currentLevelUp) return

    const timer = setTimeout(() => {
      clearLevelUp(currentLevelUp.id)
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentLevelUp, clearLevelUp])

  if (!currentLevelUp) return null

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={cn(
          'toast-notification',
          'flex items-center gap-4 px-6 py-4',
          'rounded-2xl crystal-glass-heavy border border-violet-100',
          'animate-slideDown'
        )}
      >
        {/* Level circle */}
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center animate-badge-pop">
            <div className="text-center">
              <Star className="w-4 h-4 text-white fill-white mx-auto" />
              <span className="text-lg font-bold text-white">{currentLevelUp.newLevel}</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="font-display font-bold text-slate-800 text-lg">Level Up!</p>
          <p className="text-sm text-slate-500">
            You reached <span className="font-semibold text-violet-600">Level {currentLevelUp.newLevel}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
