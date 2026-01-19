import { StatsGrid } from './components/StatsGrid'
import { ActivityChart } from './components/ActivityChart'
import { RecentlyViewed } from './components/RecentlyViewed'
import { CourseCompletionChart } from './components/CourseCompletionChart'

export default function Dashboard() {
  return (
    <div>
      {/* Stats Grid */}
      <StatsGrid />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ActivityChart />
        <RecentlyViewed />
      </div>

      {/* Course Completion */}
      <CourseCompletionChart />
    </div>
  )
}
