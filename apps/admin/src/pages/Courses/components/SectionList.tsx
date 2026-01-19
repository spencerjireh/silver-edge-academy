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
import { Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useReorderSections } from '@/hooks/queries/useCourses'
import type { CourseSection } from '@/services/api/courses'
import { SectionItem } from './SectionItem'
import { SectionForm } from './SectionForm'

interface SectionListProps {
  courseId: string
  sections: CourseSection[]
}

export function SectionList({ courseId, sections }: SectionListProps) {
  const [isAdding, setIsAdding] = useState(false)
  const reorderSections = useReorderSections()

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
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(sections, oldIndex, newIndex)
        await reorderSections.mutateAsync({
          courseId,
          sectionIds: newOrder.map((s) => s.id),
        })
      }
    }
  }

  if (sections.length === 0 && !isAdding) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 mb-4">No sections yet</p>
        <Button variant="secondary" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4" />
          Add First Section
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section, index) => (
            <SectionItem
              key={section.id}
              courseId={courseId}
              section={section}
              index={index}
            />
          ))}
        </SortableContext>
      </DndContext>

      {isAdding ? (
        <SectionForm
          courseId={courseId}
          onCancel={() => setIsAdding(false)}
          onSuccess={() => setIsAdding(false)}
        />
      ) : (
        <Button
          variant="secondary"
          onClick={() => setIsAdding(true)}
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      )}
    </div>
  )
}
