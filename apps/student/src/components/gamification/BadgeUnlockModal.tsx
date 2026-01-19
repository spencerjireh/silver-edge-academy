import { useGamification } from '@/contexts/GamificationContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ConfettiEffect } from './ConfettiEffect'
import { getBadgeIcon } from '@/utils/badgeIcons'

export function BadgeUnlockModal() {
  const { badgeUnlocks, clearBadgeUnlock } = useGamification()

  const currentUnlock = badgeUnlocks[0]

  if (!currentUnlock) return null

  const { badge } = currentUnlock
  const Icon = getBadgeIcon(badge.iconName)

  return (
    <Modal
      isOpen={true}
      onClose={() => clearBadgeUnlock(currentUnlock.id)}
      hideCloseButton
      size="sm"
    >
      <ConfettiEffect isActive />
      <div className="text-center py-6 relative z-10">
        {/* Badge icon with gradient */}
        <div
          className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 animate-bounce-custom"
          style={{
            background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
          }}
        >
          <Icon className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Badge Unlocked!</h2>
        <h3 className="text-xl font-semibold text-primary-600 mb-2">{badge.name}</h3>
        <p className="text-slate-600 mb-6">{badge.description}</p>

        <Button onClick={() => clearBadgeUnlock(currentUnlock.id)} className="w-full">
          Awesome!
        </Button>
      </div>
    </Modal>
  )
}
