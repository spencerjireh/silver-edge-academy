import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  details?: React.ReactNode
  className?: string
  animationDelay?: number
}

export function StatCard({
  icon,
  value,
  label,
  details,
  className,
  animationDelay = 0,
}: StatCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={cn(
        'stat-card bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300 animate-fade-in',
        className
      )}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <button
        className="w-full text-left p-5"
        onClick={() => details && setExpanded(!expanded)}
        disabled={!details}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          {details && (
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform',
                expanded && 'rotate-180'
              )}
            />
          )}
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </button>

      {details && (
        <div
          className={cn(
            'expandable-content border-t border-slate-100 bg-slate-50',
            expanded && 'expanded'
          )}
        >
          <div className="p-4 space-y-2">{details}</div>
        </div>
      )}
    </div>
  )
}

interface StatDetailRowProps {
  label: string
  value: string | number
  highlight?: boolean
}

export function StatDetailRow({ label, value, highlight }: StatDetailRowProps) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={cn('font-medium', highlight ? 'text-emerald-600' : 'text-slate-700')}>
        {typeof value === 'number' && value > 0 && highlight ? `+${value}` : value}
      </span>
    </div>
  )
}
