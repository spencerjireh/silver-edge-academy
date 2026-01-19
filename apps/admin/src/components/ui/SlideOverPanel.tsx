import { type ReactNode, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

type PanelSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClasses: Record<PanelSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

interface SlideOverPanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  breadcrumb?: string[]
  headerActions?: ReactNode
  size?: PanelSize
  children: ReactNode
  footer?: ReactNode
}

export function SlideOverPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  breadcrumb,
  headerActions,
  size = 'lg',
  children,
  footer,
}: SlideOverPanelProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-full bg-white shadow-xl flex flex-col',
          'transform transition-transform duration-300 ease-out',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {breadcrumb && breadcrumb.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                  {breadcrumb.map((item, index) => (
                    <span key={index} className="flex items-center gap-2">
                      {index > 0 && <span>/</span>}
                      <span className={index === breadcrumb.length - 1 ? 'text-slate-800 font-medium truncate' : ''}>
                        {item}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
              {subtitle && (
                <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              {headerActions}
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
