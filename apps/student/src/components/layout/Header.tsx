import { Link } from 'react-router-dom'
import { Star, PanelLeftClose, PanelLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/hooks/queries/useDashboard'
import { Avatar } from '@/components/ui/Avatar'
import { CoinDisplay } from '@/components/ui/CoinDisplay'
import { LevelBadge } from '@/components/ui/LevelBadge'
import { cn } from '@/utils/cn'

interface HeaderProps {
  isNavHidden: boolean
  toggleNav: () => void
}

export function Header({ isNavHidden, toggleNav }: HeaderProps) {
  const { user } = useAuth()
  const { data: dashboard } = useDashboard()

  const userData = dashboard?.user

  return (
    <header className="!fixed top-0 left-0 right-0 z-30 crystal-glass-heavy border-b border-slate-200/50">
      <div className={cn(
        'flex items-center justify-between h-16 px-4 md:px-6 transition-all duration-300',
        !isNavHidden && 'md:pl-36'
      )}>
        {/* Left side - Toggle + Logo */}
        <div className="flex items-center gap-3">
          {/* Nav Toggle Button */}
          <button
            onClick={toggleNav}
            className="nav-toggle-header hidden md:flex"
            aria-label={isNavHidden ? 'Show navigation' : 'Hide navigation'}
          >
            {isNavHidden ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-display font-bold text-slate-800 hidden sm:inline">
              Silver Edge Academy
            </span>
          </Link>
        </div>

        {/* Right side - Level, Coins, Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Level Badge */}
          {userData && (
            <LevelBadge level={userData.currentLevel} size="md" />
          )}

          {/* Coins */}
          {userData && (
            <CoinDisplay amount={userData.currencyBalance} size="sm" />
          )}

          {/* Profile Avatar */}
          <Link to="/app/profile" className="flex items-center">
            <Avatar
              avatarId={user?.avatarId || null}
              displayName={user?.displayName}
              size="sm"
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
