import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn('relative', className)}>
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          className={cn(
            'w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
            'placeholder:text-slate-400'
          )}
          {...props}
        />
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
