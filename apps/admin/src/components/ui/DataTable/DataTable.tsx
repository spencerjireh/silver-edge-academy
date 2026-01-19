import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  SelectAllHead,
  SelectableCell,
} from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Table/Pagination'
import type { DataTableProps } from './types'

export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No results found',
  emptyState,
  pagination,
  sorting,
  selection,
  onRowClick,
}: DataTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton />
  }

  const colSpan = columns.length + (selection ? 1 : 0)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {selection && (
              <SelectAllHead
                isAllSelected={selection.isAllSelected}
                isIndeterminate={selection.isIndeterminate}
                onSelectAll={selection.toggleAll}
              />
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                sortable={col.sortable && !!sorting}
                sorted={sorting?.sorted(col.key) || false}
                onSort={sorting?.onSort(col.key)}
                className={col.className}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmpty
              colSpan={colSpan}
              message={emptyState?.message || emptyMessage}
              icon={emptyState?.icon}
              description={emptyState?.description}
              actionLabel={emptyState?.actionLabel}
              actionPath={emptyState?.actionPath}
            />
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                clickable={!!onRowClick}
                selected={selection?.isSelected(item.id)}
                onClick={() => onRowClick?.(item)}
              >
                {selection && (
                  <SelectableCell
                    isSelected={selection.isSelected(item.id)}
                    onSelect={() => selection.toggle(item.id)}
                  />
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && pagination.totalItems > 0 && <Pagination {...pagination} />}
    </>
  )
}

function TableSkeleton() {
  return (
    <div className="p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100">
          <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-48 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
