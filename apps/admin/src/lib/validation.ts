// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidationRule = (value: any) => string | undefined

export const validators = {
  required:
    (message = 'This field is required'): ValidationRule =>
    (value) =>
      !value?.toString().trim() ? message : undefined,

  email:
    (message = 'Invalid email address'): ValidationRule =>
    (value) => {
      if (!value) return undefined
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message
    },

  minLength:
    (min: number, message?: string): ValidationRule =>
    (value) => {
      if (!value) return undefined
      return value.length < min
        ? message || `Must be at least ${min} characters`
        : undefined
    },

  matches:
    (other: string, message = 'Values do not match'): ValidationRule =>
    (value) =>
      value !== other ? message : undefined,

  minItems:
    (min: number, message?: string): ValidationRule =>
    (value) =>
      !value || value.length < min
        ? message || `Select at least ${min} item${min > 1 ? 's' : ''}`
        : undefined,

  min:
    (min: number, message?: string): ValidationRule =>
    (value) =>
      value < min ? message || `Must be at least ${min}` : undefined,

  maxLength:
    (max: number, message?: string): ValidationRule =>
    (value) => {
      if (!value) return undefined
      return value.length > max
        ? message || `Must be at most ${max} characters`
        : undefined
    },

  pattern:
    (regex: RegExp, message?: string): ValidationRule =>
    (value) => {
      if (!value) return undefined
      return regex.test(value) ? undefined : message || 'Invalid format'
    },
}

export function validate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  rules: Record<string, ValidationRule[]>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    if (!fieldRules) continue
    const value = data[field]

    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) {
        errors[field] = error
        break
      }
    }
  }

  return errors
}

export const userValidationRules = {
  firstName: [validators.required('First name is required')],
  lastName: [validators.required('Last name is required')],
  email: [validators.required('Email is required'), validators.email()],
  password: [
    validators.required('Password is required'),
    validators.minLength(8, 'Password must be at least 8 characters'),
  ],
}

export const studentValidationRules = {
  firstName: [validators.required('First name is required')],
  lastName: [validators.required('Last name is required')],
  email: [validators.email()], // Optional for students
  password: [
    validators.required('Password is required'),
    validators.minLength(8, 'Password must be at least 8 characters'),
  ],
  username: [
    validators.required('Username is required'),
    validators.minLength(3, 'Username must be at least 3 characters'),
    validators.maxLength(20, 'Username must be at most 20 characters'),
    validators.pattern(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed'),
  ],
}
