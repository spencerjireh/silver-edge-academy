/**
 * React hook for code execution
 * Provides state management and output aggregation
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type {
  SupportedLanguage,
  ExecutionConfig,
  CodeRunnerState,
  OutputLine,
} from '@/services/codeRunner/types'
import { CodeRunnerService } from '@/services/codeRunner'

interface UseCodeRunnerOptions {
  language: SupportedLanguage
  config?: Partial<ExecutionConfig>
}

interface UseCodeRunnerReturn {
  state: CodeRunnerState
  run: (code: string) => Promise<void>
  stop: () => void
  clear: () => void
  outputs: OutputLine[]
  isRunning: boolean
  isPythonReady: boolean
}

export function useCodeRunner({
  language,
  config = {},
}: UseCodeRunnerOptions): UseCodeRunnerReturn {
  const [state, setState] = useState<CodeRunnerState>({
    status: 'idle',
    outputs: [],
  })

  const [isPythonReady, setIsPythonReady] = useState(false)
  const isRunningRef = useRef(false)

  // Preload Python executor when language is python
  useEffect(() => {
    let isMounted = true
    if (language === 'python' && !isPythonReady) {
      CodeRunnerService.preloadPython()
        .then(() => {
          if (isMounted) setIsPythonReady(true)
        })
        .catch((error) => {
          console.error('Failed to preload Python:', error)
        })
    }
    return () => {
      isMounted = false
    }
  }, [language, isPythonReady])

  const run = useCallback(
    async (code: string) => {
      if (isRunningRef.current) return

      isRunningRef.current = true
      setState({
        status: 'running',
        outputs: [],
        error: undefined,
        executionTime: undefined,
      })

      try {
        const result = await CodeRunnerService.execute(code, language, config)

        setState({
          status: result.success ? 'success' : 'error',
          outputs: result.outputs,
          error: result.error,
          executionTime: result.executionTime,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'

        setState({
          status: 'error',
          outputs: [
            {
              type: 'error',
              content: errorMessage,
              timestamp: Date.now(),
            },
          ],
          error: errorMessage,
        })
      } finally {
        isRunningRef.current = false
      }
    },
    [language, config]
  )

  const stop = useCallback(() => {
    CodeRunnerService.stop()
    isRunningRef.current = false
    setState((prev) => ({
      ...prev,
      status: 'idle',
      outputs: [
        ...prev.outputs,
        {
          type: 'warn',
          content: 'Execution stopped by user',
          timestamp: Date.now(),
        },
      ],
    }))
  }, [])

  const clear = useCallback(() => {
    setState({
      status: 'idle',
      outputs: [],
      error: undefined,
      executionTime: undefined,
    })
  }, [])

  return {
    state,
    run,
    stop,
    clear,
    outputs: state.outputs,
    isRunning: state.status === 'running',
    isPythonReady,
  }
}
