import { useGamification } from '@/contexts/GamificationContext'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Star, Sparkles } from 'lucide-react'

export function LevelUpModal() {
  const { levelUps, clearLevelUp } = useGamification()

  const currentLevelUp = levelUps[0]

  if (!currentLevelUp) return null

  return (
    <Modal
      isOpen={true}
      onClose={() => clearLevelUp(currentLevelUp.id)}
      hideCloseButton
      size="sm"
    >
      <div className="text-center py-6 relative overflow-hidden">
        {/* Golden burst effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-gradient-radial from-xp-gold/30 to-transparent rounded-full animate-golden-burst" />
        </div>

        <div className="relative z-10">
          {/* Level circle */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-xp-gold to-amber-500 rounded-full animate-pulse-glow" />
            <div className="absolute inset-2 bg-gradient-to-br from-xp-gold to-amber-600 rounded-full flex items-center justify-center">
              <div className="text-center">
                <Star className="w-8 h-8 text-white mb-1 mx-auto fill-white" />
                <span className="text-3xl font-bold text-white">{currentLevelUp.newLevel}</span>
              </div>
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-xp-gold animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-amber-400 animate-bounce delay-1" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Level Up!</h2>
          <p className="text-slate-600 mb-6">
            You&apos;ve reached <span className="font-bold text-xp-gold">Level {currentLevelUp.newLevel}</span>!
            Keep up the great work!
          </p>

          <Button onClick={() => clearLevelUp(currentLevelUp.id)} className="w-full">
            Continue Learning
          </Button>
        </div>
      </div>
    </Modal>
  )
}
