import { useCallback } from 'react'
import type { UseSelectionReturn } from './useSelection'

interface ConfirmDialogOptions {
  title: string
  message: string
  confirmLabel: string
  variant: 'danger' | 'warning'
}

interface PreDeleteCheckResult {
  canDelete: boolean
  message?: string
}

interface UseBulkDeleteOptions<T> {
  selection: UseSelectionReturn
  confirm: (opts: ConfirmDialogOptions) => Promise<boolean>
  deleteMutation: {
    mutateAsync: (id: string) => Promise<unknown>
    isPending: boolean
  }
  itemName: string
  itemNamePlural?: string
  /**
   * Optional function to validate items before deletion.
   * Return { canDelete: false, message: '...' } to show a warning and abort.
   */
  getSelectedItems?: () => T[]
  preDeleteCheck?: (items: T[]) => PreDeleteCheckResult | Promise<PreDeleteCheckResult>
}

/**
 * Hook to handle bulk delete operations with confirmation dialog.
 * Extracts common bulk delete logic used across list pages.
 */
export function useBulkDelete<T extends { id: string }>({
  selection,
  confirm,
  deleteMutation,
  itemName,
  itemNamePlural,
  getSelectedItems,
  preDeleteCheck,
}: UseBulkDeleteOptions<T>) {
  const handleBulkDelete = useCallback(async () => {
    const count = selection.selectedCount
    const plural = itemNamePlural || `${itemName}s`
    const label = count === 1 ? itemName : plural

    // Run pre-delete check if provided
    if (preDeleteCheck && getSelectedItems) {
      const items = getSelectedItems()
      const result = await preDeleteCheck(items)
      if (!result.canDelete) {
        await confirm({
          title: `Cannot Delete ${label}`,
          message: result.message || `Some ${plural} cannot be deleted.`,
          confirmLabel: 'Understood',
          variant: 'warning',
        })
        return
      }
    }

    // Show confirmation dialog
    const confirmed = await confirm({
      title: `Delete ${count} ${label}`,
      message: `Are you sure you want to delete ${count} ${label}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })

    if (confirmed) {
      // Delete all selected items
      for (const id of selection.selectedIds) {
        await deleteMutation.mutateAsync(id)
      }
      selection.clearSelection()
    }
  }, [
    selection,
    confirm,
    deleteMutation,
    itemName,
    itemNamePlural,
    getSelectedItems,
    preDeleteCheck,
  ])

  return {
    handleBulkDelete,
    isDeleting: deleteMutation.isPending,
  }
}
