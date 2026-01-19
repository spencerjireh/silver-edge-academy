import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { UseSelectionReturn } from '@/hooks/useSelection'

export interface ColumnDef<T> {
  key: string
  header: string
  sortable?: boolean
  className?: string
  render: (item: T) => ReactNode
}

export interface PaginationConfig {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  itemName?: string
}

export interface SortingConfig {
  sorted: (column: string) => 'asc' | 'desc' | false
  onSort: (column: string) => () => void
}

export interface EmptyStateConfig {
  message: string
  icon?: LucideIcon
  description?: string
  actionLabel?: string
  actionPath?: string
}

export interface DataTableProps<T extends { id: string }> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  emptyMessage?: string
  emptyState?: EmptyStateConfig
  pagination?: PaginationConfig
  sorting?: SortingConfig
  selection?: UseSelectionReturn
  onRowClick?: (item: T) => void
}
