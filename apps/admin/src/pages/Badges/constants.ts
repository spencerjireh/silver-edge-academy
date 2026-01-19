import {
  Award,
  Star,
  Flame,
  Zap,
  Trophy,
  Gem,
  Heart,
  Rocket,
  Code,
  Bug,
  Lightbulb,
  Target,
  Footprints,
  Crown,
  Medal,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BadgeIcon, BadgeColor, TriggerType } from '@/services/api/badges'

export const iconMap: Record<BadgeIcon, LucideIcon> = {
  award: Award,
  star: Star,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  gem: Gem,
  heart: Heart,
  rocket: Rocket,
  code: Code,
  bug: Bug,
  lightbulb: Lightbulb,
  target: Target,
  footprints: Footprints,
  crown: Crown,
  medal: Medal,
  sparkles: Sparkles,
}

export const iconList: BadgeIcon[] = [
  'award', 'star', 'flame', 'zap', 'trophy', 'gem', 'heart', 'rocket',
  'code', 'bug', 'lightbulb', 'target', 'footprints', 'crown', 'medal', 'sparkles',
]

export const colorList: BadgeColor[] = [
  'indigo', 'amber', 'emerald', 'blue', 'rose', 'violet', 'cyan', 'pink',
]

export const triggerOptions: { value: TriggerType; label: string; hasValue: boolean }[] = [
  { value: 'first_login', label: 'First Login', hasValue: false },
  { value: 'first_lesson', label: 'First Lesson Completed', hasValue: false },
  { value: 'first_exercise', label: 'First Exercise Passed', hasValue: false },
  { value: 'first_quiz', label: 'First Quiz Completed', hasValue: false },
  { value: 'first_sandbox', label: 'First Sandbox Project', hasValue: false },
  { value: 'lessons_completed', label: 'Lessons Completed', hasValue: true },
  { value: 'exercises_passed', label: 'Exercises Passed', hasValue: true },
  { value: 'courses_finished', label: 'Courses Finished', hasValue: true },
  { value: 'login_streak', label: 'Login Streak (Days)', hasValue: true },
  { value: 'xp_earned', label: 'XP Earned (Total)', hasValue: true },
  { value: 'level_reached', label: 'Level Reached', hasValue: true },
]
