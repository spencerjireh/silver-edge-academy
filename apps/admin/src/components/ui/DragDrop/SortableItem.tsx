import { type ReactNode } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableItemProps {
  id: string
  children: ReactNode
  disabled?: boolean
}

export function SortableItem({ id, children, disabled = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {typeof children === 'function'
        ? (children as (props: { listeners: typeof listeners; isDragging: boolean }) => ReactNode)({
            listeners,
            isDragging,
          })
        : children}
    </div>
  )
}

// Hook for use in child components to access sortable functionality
export { useSortable }
