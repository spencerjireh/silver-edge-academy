import { GraduationCap, Users, User, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { UserRole } from '@/lib/navigation'

const roleConfig = {
  teacher: {
    icon: GraduationCap,
    title: 'Teacher',
    description: 'Manages classes and courses',
    bgColor: 'bg-accent-100',
    textColor: 'text-accent-600',
  },
  parent: {
    icon: Users,
    title: 'Parent',
    description: 'Monitors child progress',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-600',
  },
  student: {
    icon: User,
    title: 'Student',
    description: 'Learns and earns rewards',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
  },
} as const

interface RoleSelectorProps {
  value: UserRole
  onChange?: (role: UserRole) => void
  locked?: boolean
}

export function RoleSelector({ value, onChange, locked }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {(Object.keys(roleConfig) as UserRole[]).map((roleKey) => {
        const config = roleConfig[roleKey]
        const Icon = config.icon
        const isSelected = value === roleKey
        const isDisabled = locked && !isSelected

        const card = (
          <div
            className={cn(
              'border-2 rounded-xl p-4 transition-all',
              isSelected ? 'border-accent-500 bg-accent-50' : 'border-slate-200',
              isDisabled && 'opacity-50',
              !locked && !isDisabled && 'hover:border-slate-300'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', config.bgColor)}>
                <Icon className={cn('w-6 h-6', config.textColor)} />
              </div>
              {isSelected && (
                <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <h4 className="font-semibold text-slate-800">{config.title}</h4>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
        )

        if (locked) {
          return <div key={roleKey}>{card}</div>
        }

        return (
          <label key={roleKey} className="cursor-pointer">
            <input
              type="radio"
              name="role"
              value={roleKey}
              checked={isSelected}
              onChange={() => onChange?.(roleKey)}
              className="sr-only"
            />
            {card}
          </label>
        )
      })}
    </div>
  )
}

export function getRoleLabel(role: UserRole): string {
  return roleConfig[role].title
}
