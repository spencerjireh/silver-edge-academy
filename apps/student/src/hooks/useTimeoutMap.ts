import { useRef, useEffect, useCallback } from 'react'

export function useTimeoutMap() {
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const refs = timeoutRefs.current
    return () => {
      refs.forEach((id) => clearTimeout(id))
      refs.clear()
    }
  }, [])

  const set = useCallback((key: string, callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      callback()
      timeoutRefs.current.delete(key)
    }, delay)
    timeoutRefs.current.set(key, id)
  }, [])

  const clear = useCallback((key: string) => {
    const id = timeoutRefs.current.get(key)
    if (id) {
      clearTimeout(id)
      timeoutRefs.current.delete(key)
    }
  }, [])

  return { set, clear }
}
