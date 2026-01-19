import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  return (
    <div
      className={cn(
        'animate-skeleton bg-slate-200',
        variantStyles[variant],
        className
      )}
    />
  )
}

// Common skeleton patterns
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

export function SkeletonCourseCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton variant="rectangular" className="h-3 w-full" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 p-4">
      {/* Welcome banner skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-4">
          <Skeleton variant="rectangular" className="h-20 w-32" />
          <Skeleton variant="rectangular" className="h-20 w-32" />
          <Skeleton variant="rectangular" className="h-20 w-32" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
