import { forwardRef, useEffect, useRef, type InputHTMLAttributes } from 'react'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  indeterminate?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate = false, id, checked, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null)
    const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || internalRef

    useEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = indeterminate
      }
    }, [indeterminate, resolvedRef])

    const isChecked = checked || false
    const showCheck = isChecked && !indeterminate
    const showMinus = indeterminate

    return (
      <label
        className={cn(
          'relative flex items-center gap-2 cursor-pointer',
          props.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
        htmlFor={id}
      >
        <input
          ref={resolvedRef}
          type="checkbox"
          id={id}
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'w-4 h-4 border-2 border-slate-300 rounded flex items-center justify-center transition-colors',
            (isChecked || indeterminate) && 'bg-accent-600 border-accent-600',
            'peer-focus:ring-2 peer-focus:ring-accent-500 peer-focus:ring-offset-2'
          )}
        >
          {showCheck && <Check className="w-3 h-3 text-white" />}
          {showMinus && <Minus className="w-3 h-3 text-white" />}
        </div>
        {label && (
          <span className="text-sm text-slate-700">{label}</span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
