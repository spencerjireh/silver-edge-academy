import { Flame, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface WelcomeBannerProps {
  displayName: string
  streakDays: number
}

export function WelcomeBanner({ displayName, streakDays }: WelcomeBannerProps) {
  const greeting = getGreeting()
  const firstName = displayName.split(' ')[0]

  return (
    <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0" padding="lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {greeting}, {firstName}!
          </h1>
          <p className="text-primary-100">
            {getMotivationalMessage(streakDays)}
          </p>
        </div>
        <div className="hidden sm:block">
          <Sparkles className="w-12 h-12 text-primary-200 opacity-50" />
        </div>
      </div>

      {streakDays > 0 && (
        <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 w-fit">
          <Flame className="w-5 h-5 text-streak-orange fill-streak-orange animate-fire" />
          <span className="font-semibold">
            {streakDays} day streak!
          </span>
        </div>
      )}
    </Card>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getMotivationalMessage(streakDays: number): string {
  if (streakDays >= 7) return "You're on fire! Keep up the amazing work!"
  if (streakDays >= 3) return 'Great progress! Keep the momentum going!'
  if (streakDays > 0) return "You're doing great! Ready to learn something new?"
  return 'Ready to start your coding adventure today?'
}
