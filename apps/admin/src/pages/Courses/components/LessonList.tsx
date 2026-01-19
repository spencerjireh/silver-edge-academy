import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useReorderLessons } from '@/hooks/queries/useCourses'
import type { CourseLesson } from '@/services/api/courses'
import { LessonItem } from './LessonItem'
import { LessonForm } from './LessonForm'

interface LessonListProps {
  courseId: string
  sectionId: string
  lessons: CourseLesson[]
}

export function LessonList({ courseId, sectionId, lessons }: LessonListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const reorderLessons = useReorderLessons()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id)
      const newIndex = lessons.findIndex((l) => l.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(lessons, oldIndex, newIndex)
        await reorderLessons.mutateAsync({
          courseId,
          sectionId,
          lessonIds: newOrder.map((l) => l.id),
        })
      }
    }
  }

  return (
    <div className="space-y-2 pt-2">
      {lessons.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {lessons.map((lesson) => (
              <LessonItem
                key={lesson.id}
                courseId={courseId}
                sectionId={sectionId}
                lesson={lesson}
              />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-sm text-slate-400 text-center py-4">No lessons in this section</p>
      )}

      {isAdding ? (
        <LessonForm
          courseId={courseId}
          sectionId={sectionId}
          onCancel={() => setIsAdding(false)}
          onSuccess={() => setIsAdding(false)}
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-2 text-sm text-slate-500 hover:text-accent-600 hover:bg-accent-50 rounded-lg border border-dashed border-slate-200 hover:border-accent-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </button>
      )}
    </div>
  )
}
