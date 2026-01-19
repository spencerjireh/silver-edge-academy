import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Code, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/courses', icon: BookOpen, label: 'Learn' },
  { to: '/sandbox', icon: Code, label: 'Create' },
  { to: '/shop', icon: ShoppingBag, label: 'Shop' },
  { to: '/profile', icon: User, label: 'Me' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-200 safe-bottom z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                'text-sm font-medium min-h-[44px]',
                isActive
                  ? 'text-primary-600'
                  : 'text-slate-500 hover:text-slate-700'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'w-5 h-5',
                    isActive && 'fill-primary-100'
                  )}
                />
                <span className="text-xs">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
