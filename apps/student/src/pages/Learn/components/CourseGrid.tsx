import { Link } from 'react-router-dom'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { ActiveCourse } from '@/types/student'

interface CourseGridProps {
  courses: ActiveCourse[]
}

// Language configuration for themed cards
const languageConfig: Record<string, { icon: string; iconBg: string; iconColor: string }> = {
  javascript: { icon: 'JS', iconBg: 'bg-amber-200', iconColor: 'text-amber-800' },
  python: { icon: 'Py', iconBg: 'bg-blue-200', iconColor: 'text-blue-800' },
  scratch: { icon: 'Sc', iconBg: 'bg-orange-200', iconColor: 'text-orange-800' },
  html: { icon: 'H5', iconBg: 'bg-emerald-200', iconColor: 'text-emerald-800' },
  web: { icon: 'W', iconBg: 'bg-emerald-200', iconColor: 'text-emerald-800' },
}

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <h2 className="font-display font-semibold text-slate-800 text-lg mb-4">
        Your Courses
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => {
          const config = languageConfig[course.language] || languageConfig.javascript

          return (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className={`course-card ${course.language} block rounded-2xl border p-5 cursor-pointer`}
            >
              {/* Course Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${config.iconBg}`}>
                <span className={`font-display font-bold text-lg ${config.iconColor}`}>
                  {config.icon}
                </span>
              </div>

              {/* Course Title */}
              <h3 className="font-display font-semibold text-slate-800 mb-1">
                {course.title}
              </h3>

              {/* Current Section */}
              <p className="text-sm text-slate-500 mb-4 line-clamp-1">
                {course.currentSection}
              </p>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <ProgressBar
                  value={course.progressPercent}
                  max={100}
                  size="sm"
                  color="primary"
                  className="flex-1"
                />
                <span className="text-sm font-medium text-slate-600">
                  {course.progressPercent}%
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
