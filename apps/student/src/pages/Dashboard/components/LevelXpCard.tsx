import { Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface LevelXpCardProps {
  level: number
  totalXp: number
  xpProgress: number
  xpForNextLevel: number
}

export function LevelXpCard({ level, totalXp, xpProgress, xpForNextLevel }: LevelXpCardProps) {
  return (
    <Card className="relative overflow-hidden" padding="md">
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-xp-gold/10 rounded-full" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-xp-gold to-amber-500 rounded-xl flex items-center justify-center crystal-gem">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Level</p>
            <p className="text-2xl font-bold text-slate-800">{level}</p>
          </div>
        </div>

        <ProgressBar value={xpProgress} max={100} size="md" color="xp" />

        <div className="flex justify-between mt-2 text-sm">
          <span className="text-slate-500">{totalXp.toLocaleString()} XP</span>
          <span className="text-slate-500">{xpForNextLevel.toLocaleString()} XP</span>
        </div>
      </div>
    </Card>
  )
}
