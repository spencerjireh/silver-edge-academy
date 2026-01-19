import { useMemo } from 'react'
import { LessonNode } from './LessonNode'
import { cn } from '@/utils/cn'

interface Lesson {
  id: string
  title: string
  orderIndex: number
  status: 'completed' | 'current' | 'available' | 'locked'
  xpReward?: number
}

interface WindingPathProps {
  lessons: Lesson[]
  courseId: string
  className?: string
}

// Node spacing and layout constants
const NODE_SPACING = 80 // Horizontal spacing between nodes
const NODE_SIZE = 48 // Node diameter
const WAVE_AMPLITUDE = 30 // Vertical wave amplitude
const PATH_PADDING = 40 // Padding around the path

export function WindingPath({ lessons, courseId, className }: WindingPathProps) {
  // Calculate positions for each lesson node
  const { positions, dimensions } = useMemo(() => {
    const positions = lessons.map((lesson, index) => {
      // Create a gentle wave pattern
      const x = PATH_PADDING + index * NODE_SPACING
      const waveOffset = Math.sin((index * Math.PI) / 2) * WAVE_AMPLITUDE
      const y = PATH_PADDING + WAVE_AMPLITUDE + waveOffset

      return { x, y, lesson }
    })

    // Calculate SVG dimensions
    const width = PATH_PADDING * 2 + (lessons.length - 1) * NODE_SPACING + NODE_SIZE
    const height = PATH_PADDING * 2 + WAVE_AMPLITUDE * 2 + NODE_SIZE

    return {
      positions,
      dimensions: { width, height },
    }
  }, [lessons])

  // Determine which segments are completed
  const getSegmentClass = (index: number) => {
    const lesson = lessons[index]
    const nextLesson = lessons[index + 1]

    if (lesson?.status === 'completed' && (nextLesson?.status === 'completed' || nextLesson?.status === 'current')) {
      return 'path-connector completed'
    }
    return 'path-connector'
  }

  // For mobile, use a simpler horizontal layout
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  if (isMobile || lessons.length <= 2) {
    return (
      <div className={cn('flex items-center gap-4 overflow-x-auto pb-4', className)}>
        {lessons.map((lesson, index) => (
          <div key={lesson.id} className="flex items-center">
            <LessonNode lesson={lesson} courseId={courseId} />
            {index < lessons.length - 1 && (
              <div
                className={cn(
                  'w-8 h-1 mx-2 rounded-full',
                  lesson.status === 'completed' ? 'bg-violet-400' : 'bg-violet-200'
                )}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-x-auto', className)}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {/* Draw path segments */}
        {positions.slice(0, -1).map((pos, index) => {
          const next = positions[index + 1]
          const midX = (pos.x + next.x) / 2

          return (
            <path
              key={`segment-${index}`}
              d={`M ${pos.x} ${pos.y} Q ${midX} ${pos.y}, ${midX} ${(pos.y + next.y) / 2} Q ${midX} ${next.y}, ${next.x} ${next.y}`}
              className={getSegmentClass(index)}
            />
          )
        })}
      </svg>

      {/* Position lesson nodes absolutely over the SVG */}
      {positions.map(({ x, y, lesson }) => (
        <div
          key={lesson.id}
          className="absolute"
          style={{
            left: x - NODE_SIZE / 2,
            top: y - NODE_SIZE / 2,
          }}
        >
          <LessonNode lesson={lesson} courseId={courseId} />
        </div>
      ))}
    </div>
  )
}
