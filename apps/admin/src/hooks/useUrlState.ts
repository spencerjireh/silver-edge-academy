import { useSearchParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

type UrlStateValue = string | number | undefined

interface UrlStateConfig {
  [key: string]: UrlStateValue
}

/**
 * Hook for persisting state in URL query parameters.
 * Supports string and number values.
 *
 * @example
 * const [state, setState] = useUrlState({
 *   search: '',
 *   page: 1,
 *   status: '',
 * })
 *
 * // Update single value
 * setState({ search: 'new search' })
 *
 * // Update multiple values
 * setState({ search: 'test', page: 1 })
 */
export function useUrlState<T extends UrlStateConfig>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse URL params into state object
  const state = useMemo(() => {
    const result = { ...defaults } as T

    for (const key of Object.keys(defaults)) {
      const urlValue = searchParams.get(key)

      if (urlValue !== null) {
        const defaultValue = defaults[key]

        // Parse based on default value type
        if (typeof defaultValue === 'number') {
          const parsed = parseInt(urlValue, 10)
          if (!isNaN(parsed)) {
            (result as Record<string, UrlStateValue>)[key] = parsed
          }
        } else {
          (result as Record<string, UrlStateValue>)[key] = urlValue
        }
      }
    }

    return result
  }, [searchParams, defaults])

  // Update URL params
  const setState = useCallback(
    (updates: Partial<T>) => {
      setSearchParams(
        (prev) => {
          const newParams = new URLSearchParams(prev)

          for (const [key, value] of Object.entries(updates)) {
            // Remove param if value is empty/undefined or equals default
            if (
              value === undefined ||
              value === '' ||
              value === defaults[key]
            ) {
              newParams.delete(key)
            } else {
              newParams.set(key, String(value))
            }
          }

          return newParams
        },
        { replace: true }
      )
    },
    [setSearchParams, defaults]
  )

  return [state, setState] as const
}
