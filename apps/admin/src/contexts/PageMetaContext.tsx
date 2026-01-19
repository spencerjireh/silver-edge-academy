import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageMeta {
  entityLabel?: string
}

interface PageMetaContextValue {
  meta: PageMeta
  setMeta: (meta: PageMeta) => void
}

const PageMetaContext = createContext<PageMetaContextValue | null>(null)

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>({})
  const { pathname } = useLocation()

  // Reset meta when route changes
  useEffect(() => {
    setMeta({})
  }, [pathname])

  return (
    <PageMetaContext.Provider value={{ meta, setMeta }}>
      {children}
    </PageMetaContext.Provider>
  )
}

export function usePageMeta() {
  const context = useContext(PageMetaContext)
  if (!context) {
    throw new Error('usePageMeta must be used within a PageMetaProvider')
  }
  return context
}

// Convenience hook for pages to set their meta
export function useSetPageMeta(meta: PageMeta) {
  const { setMeta } = usePageMeta()

  useEffect(() => {
    if (meta.entityLabel) {
      setMeta(meta)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally only trigger on entityLabel change
  }, [meta.entityLabel, setMeta])
}
