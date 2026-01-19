import { CheckCircle, Code, Star, ClipboardCheck } from 'lucide-react'
import type { Badge } from '@silveredge/shared'

interface Activity {
  id: string
  type: 'lesson_completed' | 'exercise_passed' | 'badge_earned' | 'quiz_completed'
  description: string
  timestamp: string
}

interface RecentActivityProps {
  stats: {
    lessonsCompleted: number
    exercisesPassed: number
    quizzesPassed: number
  }
  recentBadges: Badge[]
}

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

// Get icon for activity type
function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'lesson_completed':
      return <CheckCircle className="w-5 h-5" />
    case 'exercise_passed':
      return <Code className="w-5 h-5" />
    case 'badge_earned':
      return <Star className="w-5 h-5" />
    case 'quiz_completed':
      return <ClipboardCheck className="w-5 h-5" />
    default:
      return <CheckCircle className="w-5 h-5" />
  }
}

export function RecentActivity({ stats, recentBadges }: RecentActivityProps) {
  // Build activity list from stats and recent badges
  // In a real app, this would come from an API
  const activities: Activity[] = []

  // Add recent badges as activities
  recentBadges.slice(0, 2).forEach((badge, index) => {
    activities.push({
      id: `badge-${badge.id}`,
      type: 'badge_earned',
      description: `Earned "${badge.name}" badge`,
      timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    })
  })

  // Add placeholder activities based on stats
  if (stats.lessonsCompleted > 0) {
    activities.push({
      id: 'lesson-recent',
      type: 'lesson_completed',
      description: 'Completed a lesson',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    })
  }

  if (stats.exercisesPassed > 0) {
    activities.push({
      id: 'exercise-recent',
      type: 'exercise_passed',
      description: 'Passed an exercise',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    })
  }

  // Sort by timestamp and limit to 3
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3)

  if (sortedActivities.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="font-display font-semibold text-slate-800 text-lg mb-4">
        Recent Activity
      </h2>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {sortedActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            <span className="text-violet-500">
              {getActivityIcon(activity.type)}
            </span>
            <span className="flex-1 text-sm text-slate-600">
              {activity.description}
            </span>
            <span className="text-xs text-slate-400">
              {formatRelativeTime(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
