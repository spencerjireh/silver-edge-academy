import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-slate-800 bg-white',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-slate-200 focus:ring-accent-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'
