import { Bot, Wand2, Flame, Rocket, Swords, User } from 'lucide-react'
import { cn } from '@/utils/cn'

interface AvatarProps {
  avatarId: string | null
  displayName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Map avatar IDs to icons and colors
const avatarConfig: Record<string, { icon: typeof User; gradient: string }> = {
  'robot-avatar': { icon: Bot, gradient: 'from-slate-500 to-slate-600' },
  'wizard-avatar': { icon: Wand2, gradient: 'from-violet-500 to-violet-600' },
  'dragon-avatar': { icon: Flame, gradient: 'from-red-500 to-orange-500' },
  'alien-avatar': { icon: Rocket, gradient: 'from-emerald-500 to-green-500' },
  'ninja-avatar': { icon: Swords, gradient: 'from-slate-800 to-slate-900' },
}

export function Avatar({ avatarId, displayName, size = 'md', className }: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  }

  const config = avatarId ? avatarConfig[avatarId] : null
  const Icon = config?.icon || User
  const gradient = config?.gradient || 'from-violet-400 to-violet-500'

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center bg-gradient-to-br text-white crystal-gem',
        gradient,
        sizeStyles[size],
        className
      )}
      title={displayName}
    >
      <Icon className={iconSizes[size]} />
    </div>
  )
}
