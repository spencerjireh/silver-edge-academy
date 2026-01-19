import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SidebarContextValue {
  isCollapsed: boolean
  toggle: () => void
  collapse: () => void
  expand: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const STORAGE_KEY = 'admin-sidebar-collapsed'

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'true'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  const toggle = () => setIsCollapsed((prev) => !prev)
  const collapse = () => setIsCollapsed(true)
  const expand = () => setIsCollapsed(false)

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, collapse, expand }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
