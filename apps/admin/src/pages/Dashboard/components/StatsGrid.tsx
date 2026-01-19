import { Users, UserCheck, BookOpen, Target } from 'lucide-react'
import { StatCard, StatDetailRow } from '@/components/ui/StatCard'
import { useDashboardStats } from '@/hooks/queries/useDashboard'
import { formatNumber, formatPercent } from '@/utils/formatters'

export function StatsGrid() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse"
          >
            <div className="w-10 h-10 bg-slate-200 rounded-lg mb-3" />
            <div className="h-8 bg-slate-200 rounded w-20 mb-2" />
            <div className="h-4 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={<Users className="w-5 h-5 text-slate-600" />}
        value={formatNumber(stats.totalStudents.value)}
        label="Total Students"
        animationDelay={0.05}
        details={
          <>
            <StatDetailRow label="Active" value={formatNumber(stats.totalStudents.breakdown.active)} />
            <StatDetailRow label="Archived" value={formatNumber(stats.totalStudents.breakdown.archived)} />
            <StatDetailRow
              label="Enrolled this week"
              value={stats.totalStudents.breakdown.enrolledThisWeek}
              highlight
            />
          </>
        }
      />

      <StatCard
        icon={<UserCheck className="w-5 h-5 text-slate-600" />}
        value={stats.activeTeachers.value}
        label="Active Teachers"
        animationDelay={0.1}
        details={
          <>
            <StatDetailRow label="Active" value={stats.activeTeachers.breakdown.active} />
            <StatDetailRow label="Inactive" value={stats.activeTeachers.breakdown.inactive} />
            <StatDetailRow
              label="Avg. classes per teacher"
              value={stats.activeTeachers.breakdown.avgClassesPerTeacher}
            />
          </>
        }
      />

      <StatCard
        icon={<BookOpen className="w-5 h-5 text-slate-600" />}
        value={stats.totalCourses.value}
        label="Total Courses"
        animationDelay={0.15}
        details={
          <>
            <StatDetailRow label="JavaScript" value={stats.totalCourses.breakdown.javascript} />
            <StatDetailRow label="Python" value={stats.totalCourses.breakdown.python} />
            <StatDetailRow label="Published" value={stats.totalCourses.breakdown.published} highlight />
          </>
        }
      />

      <StatCard
        icon={<Target className="w-5 h-5 text-slate-600" />}
        value={formatPercent(stats.avgCompletionRate.value)}
        label="Avg. Completion Rate"
        animationDelay={0.2}
        details={
          <>
            <StatDetailRow
              label="JavaScript courses"
              value={formatPercent(stats.avgCompletionRate.breakdown.javascript)}
            />
            <StatDetailRow
              label="Python courses"
              value={formatPercent(stats.avgCompletionRate.breakdown.python)}
            />
            <StatDetailRow
              label="Exercises passed"
              value={formatPercent(stats.avgCompletionRate.breakdown.exercisesPassed)}
            />
          </>
        }
      />
    </section>
  )
}
