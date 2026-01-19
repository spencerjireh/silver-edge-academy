import { useDashboard } from '@/hooks/queries/useDashboard'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import { WelcomeBanner } from './components/WelcomeBanner'
import { LevelXpCard } from './components/LevelXpCard'
import { CurrencyCard } from './components/CurrencyCard'
import { RecentBadges } from './components/RecentBadges'
import { ActiveCourses } from './components/ActiveCourses'
import { QuickStats } from './components/QuickStats'

export default function Dashboard() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) {
    return <SkeletonDashboard />
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <WelcomeBanner displayName={data.user.displayName} streakDays={data.user.currentStreakDays} />

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <LevelXpCard
          level={data.user.currentLevel}
          totalXp={data.user.totalXp}
          xpProgress={data.user.xpProgress}
          xpForNextLevel={data.user.xpForNextLevel}
        />
        <CurrencyCard balance={data.user.currencyBalance} />
      </div>

      {/* Recent Badges */}
      {data.recentBadges.length > 0 && (
        <RecentBadges badges={data.recentBadges} nextBadge={data.nextBadge} />
      )}

      {/* Active Courses */}
      <ActiveCourses courses={data.activeCourses} />

      {/* Quick Stats */}
      <QuickStats stats={data.stats} />
    </div>
  )
}
