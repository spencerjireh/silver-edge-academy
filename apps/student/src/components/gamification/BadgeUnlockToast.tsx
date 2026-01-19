import { useEffect } from 'react'
import { useGamification } from '@/contexts/GamificationContext'
import { cn } from '@/utils/cn'
import { getBadgeIcon } from '@/utils/badgeIcons'

export function BadgeUnlockToast() {
  const { badgeUnlocks, clearBadgeUnlock } = useGamification()

  const currentUnlock = badgeUnlocks[0]

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!currentUnlock) return

    const timer = setTimeout(() => {
      clearBadgeUnlock(currentUnlock.id)
    }, 4000)

    return () => clearTimeout(timer)
  }, [currentUnlock, clearBadgeUnlock])

  if (!currentUnlock) return null

  const { badge } = currentUnlock
  const Icon = getBadgeIcon(badge.iconName)

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
        {/* Badge icon */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center animate-badge-pop"
          style={{
            background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
          }}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Text */}
        <div>
          <p className="font-display font-bold text-slate-800 text-lg">Badge Unlocked!</p>
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-violet-600">{badge.name}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
