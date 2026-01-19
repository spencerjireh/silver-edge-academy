import { Trash2, X } from 'lucide-react'
import { Button } from './Button'
import { ActionBarBase } from './ActionBarBase'
import { ActionBarSection } from './ActionBarSection'

interface BulkActionBarProps {
  selectedCount: number
  onDelete: () => void
  onClearSelection: () => void
  isDeleting?: boolean
  itemName?: string
}

export function BulkActionBar({
  selectedCount,
  onDelete,
  onClearSelection,
  isDeleting = false,
  itemName = 'items',
}: BulkActionBarProps) {
  return (
    <ActionBarBase visible={selectedCount > 0} animate>
      {/* Selection count */}
      <ActionBarSection withBorder>
        <span className="text-sm font-medium">
          {selectedCount} {itemName} selected
        </span>
        <button
          onClick={onClearSelection}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </ActionBarSection>

      {/* Actions */}
      <ActionBarSection>
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          isLoading={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </Button>
      </ActionBarSection>
    </ActionBarBase>
  )
}
