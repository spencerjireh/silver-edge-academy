import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-slate-800 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:border-transparent',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-slate-200 focus:ring-accent-500',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
