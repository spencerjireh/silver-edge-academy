import { Link } from 'react-router-dom'
import { User, School, Award, BookOpen } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/queries/useDashboard'
import { formatRelativeTime } from '@/utils/formatters'

const typeIcons = {
  teacher: User,
  student: User,
  class: School,
  badge: Award,
  course: BookOpen,
}

const typeLabels = {
  teacher: 'Teacher',
  student: 'Student',
  class: 'Class',
  badge: 'Badge',
  course: 'Course',
}

const typeLinks = {
  teacher: '/admin/users',
  student: '/admin/users',
  class: '/admin/classes',
  badge: '/admin/badges',
  course: '/admin/courses',
}

export function RecentlyViewed() {
  const { data: items, isLoading } = useRecentlyViewed()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 animate-fade-in">
        <div className="p-5 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
        <div className="p-3">
          <div className="space-y-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 animate-fade-in delay-5">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Recently Viewed</h3>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          {items?.map((item) => {
            const Icon = typeIcons[item.type]
            return (
              <Link
                key={item.id}
                to={typeLinks[item.type]}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                  <p className="text-xs text-slate-400">{typeLabels[item.type]}</p>
                </div>
                <span className="text-xs text-slate-400">{formatRelativeTime(item.time)}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
