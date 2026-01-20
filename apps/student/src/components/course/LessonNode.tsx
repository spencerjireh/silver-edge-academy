import { useState, useRef, useEffect } from 'react'
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
  disableLink?: boolean
}

export function LessonNode({ lesson, courseId, showTooltip = true, disableLink = false }: LessonNodeProps) {
  const isClickable = lesson.status !== 'locked'
  const nodeRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isHovered && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect()
      setTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 8, // 8px above the node
      })
    }
  }, [isHovered])

  const nodeContent = (
    <div
      ref={nodeRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
    </div>
  )

  const content = isClickable && !disableLink ? (
    <Link to={`/app/courses/${courseId}/lessons/${lesson.id}`}>
      {nodeContent}
    </Link>
  ) : (
    nodeContent
  )

  return (
    <>
      {content}
      {/* Fixed position tooltip that escapes overflow containers */}
      {showTooltip && isHovered && (
        <div
          className="fixed pointer-events-none z-50 transition-opacity duration-200"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
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
    </>
  )
}
