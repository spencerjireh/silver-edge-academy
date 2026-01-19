import { useCallback } from 'react'

interface SortState {
  sortBy: string
  sortOrder: string
}

/**
 * Hook to manage sorting state for tables.
 * Extracts common sorting logic used across list pages.
 */
export function useSortHelper<T extends SortState>(
  urlState: T,
  setUrlState: (updates: Partial<T>) => void
) {
  /**
   * Check if a column is currently sorted and return the sort direction.
   * Returns false if the column is not the active sort column.
   */
  const sorted = useCallback(
    (column: string): false | 'asc' | 'desc' => {
      if (urlState.sortBy !== column) return false
      return urlState.sortOrder as 'asc' | 'desc'
    },
    [urlState.sortBy, urlState.sortOrder]
  )

  /**
   * Returns a click handler for a column header.
   * Toggles sort direction if already sorted by this column,
   * otherwise sets this column as the sort column with ascending order.
   */
  const onSort = useCallback(
    (column: string) => () => {
      if (urlState.sortBy === column) {
        setUrlState({
          sortOrder: urlState.sortOrder === 'asc' ? 'desc' : 'asc',
        } as Partial<T>)
      } else {
        setUrlState({ sortBy: column, sortOrder: 'asc' } as Partial<T>)
      }
    },
    [urlState.sortBy, urlState.sortOrder, setUrlState]
  )

  return { sorted, onSort }
}
