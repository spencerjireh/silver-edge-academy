import { useState, useCallback } from 'react'

interface FormErrorState {
  fieldErrors: Record<string, string>
  submitError: string | null
}

export interface UseFormErrorReturn {
  errors: Record<string, string>
  submitError: string | null
  setFieldError: (field: string, error: string) => void
  setFieldErrors: (errors: Record<string, string>) => void
  setSubmitError: (error: string) => void
  clearFieldError: (field: string) => void
  clearAllErrors: () => void
  hasErrors: boolean
}

export function useFormError(): UseFormErrorReturn {
  const [state, setState] = useState<FormErrorState>({
    fieldErrors: {},
    submitError: null,
  })

  const setFieldError = useCallback((field: string, error: string) => {
    setState((prev) => ({
      ...prev,
      fieldErrors: { ...prev.fieldErrors, [field]: error },
    }))
  }, [])

  const setFieldErrors = useCallback((errors: Record<string, string>) => {
    setState({ fieldErrors: errors, submitError: null })
  }, [])

  const setSubmitError = useCallback((error: string) => {
    setState((prev) => ({ ...prev, submitError: error }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setState((prev) => {
      const { [field]: _, ...rest } = prev.fieldErrors
      return { ...prev, fieldErrors: rest }
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setState({ fieldErrors: {}, submitError: null })
  }, [])

  return {
    errors: state.fieldErrors,
    submitError: state.submitError,
    setFieldError,
    setFieldErrors,
    setSubmitError,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(state.fieldErrors).length > 0 || !!state.submitError,
  }
}

export function FormSubmitError({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-sm text-red-700">{error}</p>
    </div>
  )
}
