import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function AdminOnlyRoute() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    // Teachers trying to access admin-only routes get redirected to dashboard
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
