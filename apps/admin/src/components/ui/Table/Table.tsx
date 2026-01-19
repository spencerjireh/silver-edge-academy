import { type ReactNode, type HTMLAttributes } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown, Check, Minus, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { Button } from '../Button'

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

export function TableHeader({ children, className, ...props }: TableHeaderProps) {
  return (
    <thead className={cn('bg-slate-50 border-b border-slate-100', className)} {...props}>
      {children}
    </thead>
  )
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={cn('divide-y divide-slate-100', className)} {...props}>
      {children}
    </tbody>
  )
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode
  clickable?: boolean
  selected?: boolean
}

export function TableRow({ children, className, clickable, selected, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'hover:bg-slate-50 transition-colors',
        clickable && 'cursor-pointer',
        selected && 'bg-accent-50/50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
  sortable?: boolean
  sorted?: 'asc' | 'desc' | false
  onSort?: () => void
}

export function TableHead({
  children,
  className,
  sortable,
  sorted,
  onSort,
  ...props
}: TableHeadProps) {
  const SortIcon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown

  return (
    <th
      className={cn(
        'text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-slate-100 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <span className="flex items-center gap-1.5">
        {children}
        {sortable && (
          <SortIcon
            className={cn(
              'w-3.5 h-3.5 flex-shrink-0',
              sorted ? 'text-accent-600' : 'text-slate-400'
            )}
          />
        )}
      </span>
    </th>
  )
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={cn('px-4 py-4', className)} {...props}>
      {children}
    </td>
  )
}

interface TableEmptyProps {
  colSpan: number
  message?: string
  icon?: LucideIcon
  description?: string
  actionLabel?: string
  actionPath?: string
}

export function TableEmpty({
  colSpan,
  message = 'No results found',
  icon: Icon,
  description,
  actionLabel,
  actionPath,
}: TableEmptyProps) {
  // Enhanced empty state with icon
  if (Icon) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{message}</h3>
            {description && (
              <p className="text-sm text-slate-500 text-center max-w-sm mb-4">{description}</p>
            )}
            {actionLabel && actionPath && (
              <Link to={actionPath}>
                <Button>{actionLabel}</Button>
              </Link>
            )}
          </div>
        </td>
      </tr>
    )
  }

  // Simple empty state (fallback)
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <p className="text-slate-500">{message}</p>
      </td>
    </tr>
  )
}

interface SelectAllHeadProps {
  isAllSelected: boolean
  isIndeterminate: boolean
  onSelectAll: () => void
}

export function SelectAllHead({ isAllSelected, isIndeterminate, onSelectAll }: SelectAllHeadProps) {
  const label = isAllSelected ? 'Deselect all items' : 'Select all items'

  return (
    <th className="w-12 px-4 py-3">
      <button
        type="button"
        onClick={onSelectAll}
        aria-label={label}
        aria-checked={isAllSelected ? 'true' : isIndeterminate ? 'mixed' : 'false'}
        role="checkbox"
        className="flex items-center justify-center w-full"
      >
        <div
          className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
            isAllSelected || isIndeterminate
              ? 'bg-accent-600 border-accent-600'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          {isAllSelected && !isIndeterminate && (
            <Check className="w-3 h-3 text-white" />
          )}
          {isIndeterminate && (
            <Minus className="w-3 h-3 text-white" />
          )}
        </div>
      </button>
    </th>
  )
}

interface SelectableCellProps {
  isSelected: boolean
  onSelect: () => void
  itemLabel?: string
}

export function SelectableCell({ isSelected, onSelect, itemLabel }: SelectableCellProps) {
  const label = isSelected
    ? `Deselect ${itemLabel || 'item'}`
    : `Select ${itemLabel || 'item'}`

  return (
    <td className="w-12 px-4 py-4">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
        aria-label={label}
        aria-checked={isSelected}
        role="checkbox"
        className="flex items-center justify-center w-full"
      >
        <div
          className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-accent-600 border-accent-600'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </button>
    </td>
  )
}
