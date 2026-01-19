import { createContext, useContext, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)

  const activeTab = value ?? internalValue
  const setActiveTab = (tab: string) => {
    if (onValueChange) {
      onValueChange(tab)
    } else {
      setInternalValue(tab)
    }
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn('flex border-b border-slate-200', className)}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  count?: number
  className?: string
}

export function TabsTrigger({ value, children, count, className }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn(
        'px-6 py-4 text-sm border-b-2 transition-colors',
        isActive
          ? 'text-accent-600 border-accent-600 font-medium'
          : 'text-slate-500 hover:text-slate-700 border-transparent',
        className
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
            isActive
              ? 'bg-accent-100 text-accent-700'
              : 'bg-slate-100 text-slate-600'
          )}
        >
          {count.toLocaleString()}
        </span>
      )}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) {
    return null
  }

  return <div className={className}>{children}</div>
}
