import { Link } from 'react-router-dom'
import { Check, Lock } from 'lucide-react'
import { cn } from '@/utils/cn'

interface LessonNodeProps {
  lesson: {
    id: string
    title: string
    orderIndex: number
    status: 'completed' | 'current' | 'available' | 'locked'
    xpReward?: number
  }
  courseId: string
  showTooltip?: boolean
}

export function LessonNode({ lesson, courseId, showTooltip = true }: LessonNodeProps) {
  const isClickable = lesson.status !== 'locked'

  const nodeContent = (
    <div className="relative group">
      {/* The node circle */}
      <div
        className={cn(
          'lesson-node',
          lesson.status === 'completed' && 'completed',
          lesson.status === 'current' && 'current',
          lesson.status === 'available' && 'available',
          lesson.status === 'locked' && 'locked'
        )}
      >
        {lesson.status === 'completed' ? (
          <Check className="w-5 h-5" />
        ) : lesson.status === 'locked' ? (
          <Lock className="w-4 h-4" />
        ) : (
          <span className="text-sm font-bold">{lesson.orderIndex + 1}</span>
        )}
      </div>

      {/* Tooltip on hover */}
      {showTooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
          <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap max-w-48 truncate">
            {lesson.title}
            {lesson.xpReward && lesson.status !== 'completed' && (
              <span className="text-amber-300 ml-2">+{lesson.xpReward} XP</span>
            )}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1">
            <div className="border-4 border-transparent border-t-slate-800" />
          </div>
        </div>
      )}
    </div>
  )

  if (isClickable) {
    return (
      <Link to={`/app/courses/${courseId}/lessons/${lesson.id}`}>
        {nodeContent}
      </Link>
    )
  }

  return nodeContent
}
