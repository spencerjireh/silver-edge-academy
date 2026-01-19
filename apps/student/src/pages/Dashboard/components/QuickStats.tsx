import { BookCheck, Code, FileQuestion } from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/Card'

interface QuickStatsProps {
  stats: {
    lessonsCompleted: number
    exercisesPassed: number
    quizzesPassed: number
  }
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statItems = [
    {
      label: 'Lessons',
      value: stats.lessonsCompleted,
      icon: BookCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50/70 border-b-[3px] border-emerald-200',
    },
    {
      label: 'Exercises',
      value: stats.exercisesPassed,
      icon: Code,
      color: 'text-secondary-500',
      bgColor: 'bg-secondary-50/70 border-b-[3px] border-secondary-200',
    },
    {
      label: 'Quizzes',
      value: stats.quizzesPassed,
      icon: FileQuestion,
      color: 'text-primary-500',
      bgColor: 'bg-primary-50/70 border-b-[3px] border-primary-200',
    },
  ]

  return (
    <Card>
      <CardTitle className="mb-4">Your Progress</CardTitle>

      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className={`${item.bgColor} rounded-xl p-4 text-center`}>
            <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
            <p className="text-2xl font-bold text-slate-800">{item.value}</p>
            <p className="text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
