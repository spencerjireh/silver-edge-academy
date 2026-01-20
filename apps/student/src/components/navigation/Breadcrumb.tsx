import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center flex-wrap gap-1 text-sm', className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight
                className="w-4 h-4 text-slate-400 flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-slate-500 hover:text-violet-600 transition-colors truncate max-w-[200px]"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'truncate max-w-[200px]',
                  isLast ? 'text-slate-700 font-medium' : 'text-slate-500'
                )}
                title={item.label}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
