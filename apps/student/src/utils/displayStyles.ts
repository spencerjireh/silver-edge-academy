export const displaySizeStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
} as const

export const displayIconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const

export type DisplaySize = keyof typeof displaySizeStyles
