import { Play, Square, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface EditorToolbarProps {
  onRun: () => void
  onStop?: () => void
  onReset: () => void
  onUndo?: () => void
  onRedo?: () => void
  isRunning?: boolean
  canUndo?: boolean
  canRedo?: boolean
  className?: string
}

export function EditorToolbar({
  onRun,
  onStop,
  onReset,
  isRunning = false,
  className,
}: EditorToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-2 bg-slate-100 rounded-xl',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          title="Reset to starter code"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {isRunning && onStop ? (
          <Button variant="danger" size="sm" onClick={onStop}>
            <Square className="w-4 h-4 mr-1" />
            Stop
          </Button>
        ) : (
          <button
            onClick={onRun}
            disabled={isRunning}
            className="run-button inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Run Code
          </button>
        )}
      </div>
    </div>
  )
}
