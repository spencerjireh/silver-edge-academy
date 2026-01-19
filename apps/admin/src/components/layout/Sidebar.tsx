import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  Award,
  ShoppingBag,
  Trophy,
  ToggleRight,
  Settings,
  GraduationCap,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/contexts/AuthContext'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  const { isCollapsed } = useSidebar()

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
          isActive
            ? 'bg-accent-50 text-accent-700 font-medium'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
          isCollapsed && 'justify-center px-0'
        )
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  )
}

interface NavSectionProps {
  title: string
  children: React.ReactNode
}

function NavSection({ title, children }: NavSectionProps) {
  return (
    <div className="mt-4 mb-2">
      <p className="nav-heading text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, toggle } = useSidebar()
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'bg-white border-r border-slate-200 fixed left-0 top-0 h-full transition-all duration-200 ease-in-out z-20',
        isCollapsed ? 'w-[72px]' : 'w-64',
        isCollapsed && 'sidebar-collapsed'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="logo-text flex-1">
                  <h1 className="font-bold text-slate-800 text-sm">Silver Edge</h1>
                  <p className="text-xs text-slate-400">Admin Portal</p>
                </div>
                <button
                  onClick={toggle}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4 text-slate-400" />
                </button>
              </>
            )}
          </div>
          {isCollapsed && (
            <button
              onClick={toggle}
              className="mt-2 w-full p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex justify-center"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <NavItem
            to="/admin"
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            end
          />

          {/* Admin-only: User Management */}
          {isAdmin && (
            <NavSection title="User Management">
              <NavItem
                to="/admin/teachers"
                icon={<GraduationCap className="w-5 h-5" />}
                label="Teachers"
              />
              <NavItem
                to="/admin/parents"
                icon={<Users className="w-5 h-5" />}
                label="Parents"
              />
              <NavItem
                to="/admin/students"
                icon={<User className="w-5 h-5" />}
                label="Students"
              />
            </NavSection>
          )}

          <NavSection title="Academic">
            <NavItem
              to="/admin/classes"
              icon={<School className="w-5 h-5" />}
              label="Classes"
            />
            <NavItem
              to="/admin/courses"
              icon={<BookOpen className="w-5 h-5" />}
              label="Courses"
            />
          </NavSection>

          <NavSection title="Rewards">
            <NavItem
              to="/admin/badges"
              icon={<Award className="w-5 h-5" />}
              label="Badges"
            />
            <NavItem
              to="/admin/shop"
              icon={<ShoppingBag className="w-5 h-5" />}
              label="Shop"
            />
          </NavSection>

          {/* Admin-only: Settings */}
          {isAdmin && (
            <NavSection title="Settings">
              <NavItem
                to="/admin/gamification"
                icon={<Trophy className="w-5 h-5" />}
                label="Gamification"
              />
              <NavItem
                to="/admin/features"
                icon={<ToggleRight className="w-5 h-5" />}
                label="Features"
              />
              <NavItem
                to="/admin/system"
                icon={<Settings className="w-5 h-5" />}
                label="System"
              />
            </NavSection>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="user-info flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm text-slate-700 truncate">
                  {user?.displayName || 'User'}
                </p>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-medium',
                    isAdmin
                      ? 'bg-accent-100 text-accent-700'
                      : 'bg-emerald-100 text-emerald-700'
                  )}
                >
                  {isAdmin ? 'Admin' : 'Teacher'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
