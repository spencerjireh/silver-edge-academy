import { Link } from 'react-router-dom'
import { LessonNode } from './LessonNode'
import { cn } from '@/utils/cn'

interface Lesson {
  id: string
  title: string
  orderIndex: number
  status: 'completed' | 'current' | 'available' | 'locked'
  xpReward?: number
}

interface LessonListProps {
  lessons: Lesson[]
  courseId: string
  className?: string
}

export function LessonList({ lessons, courseId, className }: LessonListProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {lessons.map((lesson) => {
        const isClickable = lesson.status !== 'locked'

        const rowContent = (
          <div
            className={cn(
              'flex items-center gap-4 px-3 py-2 rounded-xl transition-colors',
              isClickable && 'hover:bg-violet-50 cursor-pointer',
              !isClickable && 'cursor-not-allowed'
            )}
          >
            <LessonNode lesson={lesson} courseId={courseId} showTooltip={false} disableLink />
            <span
              className={cn(
                'text-base',
                lesson.status === 'current' && 'font-medium text-slate-800',
                lesson.status === 'completed' && 'text-slate-600',
                lesson.status === 'available' && 'text-slate-700',
                lesson.status === 'locked' && 'text-slate-400'
              )}
            >
              {lesson.title}
            </span>
          </div>
        )

        if (isClickable) {
          return (
            <Link
              key={lesson.id}
              to={`/app/courses/${courseId}/lessons/${lesson.id}`}
              className="block"
            >
              {rowContent}
            </Link>
          )
        }

        return <div key={lesson.id}>{rowContent}</div>
      })}
    </div>
  )
}
