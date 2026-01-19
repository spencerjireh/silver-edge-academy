import { Link } from 'react-router-dom'
import { ArrowRight, Trophy, Star, Bug, Flame, Repeat, Compass, Hand, Footprints } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Badge } from '@silveredge/shared'

const iconMap: Record<string, typeof Star> = {
  footprints: Footprints,
  bug: Bug,
  flame: Flame,
  repeat: Repeat,
  trophy: Trophy,
  compass: Compass,
  'hand-helping': Hand,
  star: Star,
}

interface RecentBadgesProps {
  badges: Badge[]
  nextBadge?: {
    name: string
    progress: number
    target: number
  }
}

export function RecentBadges({ badges, nextBadge }: RecentBadgesProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Recent Badges</CardTitle>
        <Link
          to="/profile?tab=achievements"
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Badge grid */}
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {badges.map((badge) => {
          const Icon = iconMap[badge.iconName] || Star
          return (
            <div key={badge.id} className="flex flex-col items-center min-w-[72px]">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center crystal-gem mb-2"
                style={{
                  background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
                }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-slate-600 text-center font-medium truncate max-w-[72px]">
                {badge.name}
              </span>
            </div>
          )
        })}
      </div>

      {/* Next badge progress */}
      {nextBadge && (
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              Next: {nextBadge.name}
            </span>
            <span className="text-sm text-slate-500">
              {nextBadge.progress}/{nextBadge.target}
            </span>
          </div>
          <ProgressBar
            value={nextBadge.progress}
            max={nextBadge.target}
            size="sm"
            color="primary"
          />
        </div>
      )}
    </Card>
  )
}
