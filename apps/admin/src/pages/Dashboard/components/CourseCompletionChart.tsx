import { useCourseCompletion } from '@/hooks/queries/useDashboard'
import { formatPercent } from '@/utils/formatters'

export function CourseCompletionChart() {
  const { data: completion, isLoading } = useCourseCompletion()

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 animate-fade-in">
        <div className="p-5 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-10 animate-pulse" />
                </div>
                <div className="h-2 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-16 mt-1 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 animate-fade-in delay-5">
      <div className="p-5 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">Course Completion by Language</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* JavaScript */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
                <span className="text-sm font-medium text-slate-700">JavaScript</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {formatPercent(completion?.javascript.percentage || 0)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${completion?.javascript.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {completion?.javascript.courseCount} courses
            </p>
          </div>

          {/* Python */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-sky-400 rounded-full" />
                <span className="text-sm font-medium text-slate-700">Python</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {formatPercent(completion?.python.percentage || 0)}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-700"
                style={{ width: `${completion?.python.percentage || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{completion?.python.courseCount} courses</p>
          </div>
        </div>
      </div>
    </div>
  )
}
