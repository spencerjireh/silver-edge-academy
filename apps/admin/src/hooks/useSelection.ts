import { useState, useCallback, useMemo } from 'react'

export interface UseSelectionReturn {
  selectedIds: Set<string>
  isSelected: (id: string) => boolean
  isAllSelected: boolean
  isIndeterminate: boolean
  toggle: (id: string) => void
  toggleAll: () => void
  clearSelection: () => void
  selectItems: (ids: string[]) => void
  selectedCount: number
}

export function useSelection<T extends { id: string }>(items: T[]): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const selectedCount = selectedIds.size

  const isAllSelected = useMemo(
    () => items.length > 0 && items.every((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  )

  const isIndeterminate = useMemo(
    () => selectedIds.size > 0 && !isAllSelected,
    [selectedIds, isAllSelected]
  )

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)))
    }
  }, [items, isAllSelected])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectItems = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggle,
    toggleAll,
    clearSelection,
    selectItems,
    selectedCount,
  }
}
