import { NavLink } from 'react-router-dom'
import { BookOpen, Code, User } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useNotifications } from '@/hooks/queries/useProfile'

interface NavItem {
  icon: typeof BookOpen
  label: string
  path: string
  exactMatch?: boolean
}

const navItems: NavItem[] = [
  { icon: BookOpen, label: 'Learn', path: '/app', exactMatch: true },
  { icon: Code, label: 'Code', path: '/app/sandbox' },
  { icon: User, label: 'Me', path: '/app/profile' },
]

interface FloatingNavProps {
  isHidden: boolean
}

export function FloatingNav({ isHidden }: FloatingNavProps) {
  const { data: notifications } = useNotifications()

  const unreadCount = notifications?.unreadCount || 0

  return (
    <nav className={cn('nav-container', isHidden && 'nav-hidden')}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isMe = item.path === '/app/profile'

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exactMatch}
            className={({ isActive }) =>
              cn('nav-gem', isActive && 'active')
            }
          >
            {/* Shimmer overlay */}
            <span className="gem-shimmer" aria-hidden="true" />
            {/* Bottom edge depth */}
            <span className="gem-edge" aria-hidden="true" />

            <Icon className="w-6 h-6 relative z-10 flex-shrink-0" />
            <span className="nav-label relative z-10">{item.label}</span>

            {/* Notification badge on Me gem */}
            {isMe && unreadCount > 0 && (
              <span className="notification-badge" />
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}
