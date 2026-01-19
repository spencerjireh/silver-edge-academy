import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coral' | 'ghost' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95'

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:from-violet-600 hover:to-violet-700 focus-visible:ring-violet-500 crystal-gem crystal-shimmer',
      secondary:
        'bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-500 border-b-[3px] border-slate-200 hover:border-slate-300',
      coral:
        'bg-gradient-to-r from-coral-500 to-coral-600 text-white hover:from-coral-600 hover:to-coral-700 focus-visible:ring-coral-500 crystal-gem crystal-shimmer',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500 border-b-2 border-transparent hover:border-slate-200',
      success:
        'bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500 crystal-gem crystal-shimmer',
      danger:
        'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 crystal-gem crystal-shimmer',
    }

    // Touch-friendly sizes (min 44px height)
    const sizeStyles = {
      sm: 'text-sm px-3 py-2 min-h-[36px]',
      md: 'text-base px-4 py-2.5 min-h-[44px]',
      lg: 'text-lg px-6 py-3 min-h-[52px]',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
