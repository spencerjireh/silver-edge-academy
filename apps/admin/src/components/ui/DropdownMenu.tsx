import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface DropdownMenuItem {
  label: string
  icon?: ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  disabledReason?: string
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, items, align = 'right' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => setIsOpen((prev) => !prev)
  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const menuRect = menuRef.current.getBoundingClientRect()
      const padding = 4

      let top = triggerRect.bottom + padding
      let left = align === 'right'
        ? triggerRect.right - menuRect.width
        : triggerRect.left

      // Keep menu within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < padding) left = padding
      if (left + menuRect.width > viewportWidth - padding) {
        left = viewportWidth - menuRect.width - padding
      }
      if (top + menuRect.height > viewportHeight - padding) {
        top = triggerRect.top - menuRect.height - padding
      }

      setPosition({ top, left })
    }
  }, [isOpen, align])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        closeMenu()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return
    item.onClick()
    closeMenu()
  }

  return (
    <>
      <div ref={triggerRef} onClick={toggleMenu} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 min-w-[160px] py-1 bg-white border border-slate-200 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
            style={{ top: position.top, left: position.left }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  item.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
                title={item.disabled ? item.disabledReason : undefined}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  )
}
