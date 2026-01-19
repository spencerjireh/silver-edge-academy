import { forwardRef } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DragHandleProps {
  disabled?: boolean
  className?: string
}

export const DragHandle = forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ disabled = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing touch-none',
          disabled
            ? 'text-slate-200 cursor-not-allowed'
            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
          className
        )}
        disabled={disabled}
        {...props}
      >
        <GripVertical className="w-4 h-4" />
      </button>
    )
  }
)

DragHandle.displayName = 'DragHandle'
