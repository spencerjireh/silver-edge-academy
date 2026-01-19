import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import type { ActiveCourse } from '@/types/student'

interface ContinueCardProps {
  course: ActiveCourse
}

// Language icons mapping
const languageIcons: Record<string, { icon: string; bg: string; color: string }> = {
  javascript: { icon: 'JS', bg: 'bg-amber-100', color: 'text-amber-700' },
  python: { icon: 'Py', bg: 'bg-blue-100', color: 'text-blue-700' },
  scratch: { icon: 'Sc', bg: 'bg-orange-100', color: 'text-orange-700' },
  html: { icon: 'H5', bg: 'bg-emerald-100', color: 'text-emerald-700' },
}

export function ContinueCard({ course }: ContinueCardProps) {
  const langConfig = languageIcons[course.language] || languageIcons.javascript

  return (
    <div className="continue-card mb-8">
      <div className="text-sm text-slate-500 mb-3">
        Continue where you left off
      </div>

      <div className="flex items-center gap-4">
        {/* Course Icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${langConfig.bg}`}>
          <span className={`font-display font-bold text-lg ${langConfig.color}`}>
            {langConfig.icon}
          </span>
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-slate-800 text-lg truncate">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500 truncate">
            {course.currentSection}
          </p>
        </div>

        {/* Continue Button - Desktop */}
        <Link
          to={`/courses/${course.id}/lessons/${course.currentLessonId}`}
          className="hidden sm:block"
        >
          <Button className="btn-continue btn-press gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mt-4">
        <ProgressBar
          value={course.progressPercent}
          max={100}
          size="md"
          color="primary"
          className="flex-1"
        />
        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
          {course.progressPercent}%
        </span>
      </div>

      {/* Continue Button - Mobile */}
      <Link
        to={`/courses/${course.id}/lessons/${course.currentLessonId}`}
        className="sm:hidden block mt-4"
      >
        <Button className="btn-continue btn-press w-full gap-2">
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  )
}
