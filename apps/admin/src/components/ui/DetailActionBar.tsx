import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { ActionBarBase } from './ActionBarBase'
import { ActionBarSection } from './ActionBarSection'

interface DetailActionBarProps {
  backTo: string
  backLabel?: string
  editTo?: string
  onDelete?: () => void
  isDeleting?: boolean
  children?: ReactNode
  className?: string
}

export function DetailActionBar({
  backTo,
  backLabel = 'Back',
  editTo,
  onDelete,
  isDeleting = false,
  children,
  className,
}: DetailActionBarProps) {
  return (
    <ActionBarBase className={className}>
      {/* Back link */}
      <Link
        to={backTo}
        className="flex items-center gap-2 pr-4 border-r border-slate-700 text-sm font-medium hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      {/* Custom actions */}
      {children && (
        <ActionBarSection withBorder>
          {children}
        </ActionBarSection>
      )}

      {/* Primary actions */}
      <ActionBarSection>
        {editTo && (
          <Link to={editTo}>
            <Button
              variant="secondary"
              size="sm"
              className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        )}

        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </ActionBarSection>
    </ActionBarBase>
  )
}
