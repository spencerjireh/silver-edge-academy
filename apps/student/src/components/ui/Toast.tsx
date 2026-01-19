import { createPortal } from 'react-dom'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useToast, type ToastType } from '@/contexts/ToastContext'
import { cn } from '@/utils/cn'

const typeConfig: Record<
  ToastType,
  {
    icon: typeof CheckCircle
    borderColor: string
    iconColor: string
  }
> = {
  success: {
    icon: CheckCircle,
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-500',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: Info,
    borderColor: 'border-l-sky-500',
    iconColor: 'text-sky-500',
  },
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) {
    return null
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const config = typeConfig[toast.type]
        const Icon = config.icon

        return (
          <div
            key={toast.id}
            className={cn(
              'rounded-xl crystal-glass-heavy border-l-4 p-4 min-w-72',
              'animate-slide-in-right',
              config.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              <Icon
                className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)}
              />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="font-semibold text-slate-800">{toast.title}</p>
                )}
                <p className="text-sm text-slate-600">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
