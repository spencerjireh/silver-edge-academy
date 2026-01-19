import { Flame, BookCheck, Code, FileQuestion } from 'lucide-react'

interface ProgressTabProps {
  stats: {
    lessonsCompleted: number
    exercisesPassed: number
    quizzesPassed: number
    badgesEarned: number
  }
  streakDays: number
}

export function ProgressTab({ stats, streakDays }: ProgressTabProps) {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div>
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4">
          Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-violet-50 rounded-2xl p-4 text-center">
            <BookCheck className="w-6 h-6 text-violet-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.lessonsCompleted}</p>
            <p className="text-sm text-slate-500">Lessons</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <Code className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.exercisesPassed}</p>
            <p className="text-sm text-slate-500">Exercises</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center">
            <FileQuestion className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{stats.quizzesPassed}</p>
            <p className="text-sm text-slate-500">Quizzes</p>
          </div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4">
          Current Streak
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Flame className="w-8 h-8 text-white animate-fire" />
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-800">{streakDays} Days</p>
            <p className="text-slate-500">
              {streakDays > 0 ? 'Keep it up!' : 'Start learning to build your streak!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
