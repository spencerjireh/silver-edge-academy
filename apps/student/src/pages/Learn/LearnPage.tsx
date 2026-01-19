import { useDashboard } from '@/hooks/queries/useDashboard'
import { SkeletonDashboard } from '@/components/ui/Skeleton'
import { ContinueCard } from './components/ContinueCard'
import { CourseGrid } from './components/CourseGrid'
import { RecentActivity } from './components/RecentActivity'

export default function LearnPage() {
  const { data, isLoading, error } = useDashboard()

  if (isLoading) {
    return <SkeletonDashboard />
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load data</p>
      </div>
    )
  }

  const { user, activeCourses, recentBadges, stats } = data
  const mostRecentCourse = activeCourses[0]
  const hasStartedLearning = activeCourses.length > 0

  return (
    <div className="animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">
          {hasStartedLearning ? `Welcome back, ${user.displayName}` : `Welcome, ${user.displayName}!`}
        </h1>
        {!hasStartedLearning && (
          <p className="text-slate-500 mt-1">
            Your teacher will assign courses for you to start learning.
          </p>
        )}
      </div>

      {/* Continue Card - only show if courses exist */}
      {mostRecentCourse && (
        <ContinueCard course={mostRecentCourse} />
      )}

      {/* Course Grid - show all courses except the first one in continue card */}
      {activeCourses.length > 1 && (
        <CourseGrid courses={activeCourses.slice(1)} />
      )}

      {/* If only one course, still show it in the grid section */}
      {activeCourses.length === 1 && (
        <div className="mb-8">
          <h2 className="font-display font-semibold text-slate-800 text-lg mb-4">
            Your Courses
          </h2>
          <p className="text-slate-500">
            Continue learning in your course above.
          </p>
        </div>
      )}

      {/* Recent Activity */}
      <RecentActivity stats={stats} recentBadges={recentBadges} />

      {/* Empty state when no courses */}
      {!hasStartedLearning && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📚</span>
          </div>
          <h3 className="font-display font-semibold text-slate-800 mb-2">
            No courses yet
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Your teacher will assign courses for you. In the meantime, you can explore the Code sandbox!
          </p>
        </div>
      )}
    </div>
  )
}
