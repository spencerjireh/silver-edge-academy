/**
 * Python code executor using Pyodide Web Worker
 */

import type {
  CodeExecutor,
  ExecutionConfig,
  ExecutionResult,
  OutputLine,
  WorkerResponse,
} from './types'

// Import worker as URL for Vite
import PyWorkerUrl from '@/workers/pyWorker.ts?worker&url'

export class PythonExecutor implements CodeExecutor {
  private worker: Worker | null = null
  private ready = false
  private pyodideLoaded = false
  private timeoutId: ReturnType<typeof setTimeout> | null = null

  isReady(): boolean {
    return this.ready && this.pyodideLoaded
  }

  async execute(code: string, config: ExecutionConfig): Promise<ExecutionResult> {
    // Clean up any existing worker
    this.stop()

    const outputs: OutputLine[] = []

    return new Promise((resolve) => {
      // Create new worker
      this.worker = new Worker(PyWorkerUrl, { type: 'module' })

      // Set timeout for execution (longer for Python due to Pyodide loading)
      // First execution may take longer due to Pyodide loading
      const timeout = this.pyodideLoaded ? config.timeout : config.timeout + 30000 // Extra 30s for first load

      this.timeoutId = setTimeout(() => {
        outputs.push({
          type: 'error',
          content: `Execution timed out after ${timeout}ms`,
          timestamp: Date.now(),
        })
        this.stop()
        resolve({
          success: false,
          outputs,
          error: `Execution timed out after ${timeout}ms`,
          executionTime: timeout,
        })
      }, timeout)

      // Handle worker messages
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data

        switch (message.type) {
          case 'ready':
            this.ready = true
            // Send code to worker
            this.worker?.postMessage({ type: 'run', code, config })
            break

          case 'output':
            // Check if Pyodide is now loaded
            if (message.data.content === 'Python runtime loaded.') {
              this.pyodideLoaded = true
            }
            outputs.push(message.data)
            break

          case 'error':
            outputs.push({
              type: 'error',
              content: message.error,
              timestamp: Date.now(),
            })
            break

          case 'complete': {
            if (this.timeoutId) {
              clearTimeout(this.timeoutId)
              this.timeoutId = null
            }

            const hasError = outputs.some((o) => o.type === 'error')
            resolve({
              success: !hasError,
              outputs,
              error: hasError ? outputs.find((o) => o.type === 'error')?.content : undefined,
              executionTime: message.executionTime,
            })

            this.cleanup()
            break
          }
        }
      }

      // Handle worker errors
      this.worker.onerror = (error) => {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId)
          this.timeoutId = null
        }

        const errorMessage = error.message || 'Unknown worker error'
        outputs.push({
          type: 'error',
          content: errorMessage,
          timestamp: Date.now(),
        })

        resolve({
          success: false,
          outputs,
          error: errorMessage,
          executionTime: 0,
        })

        this.cleanup()
      }
    })
  }

  stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.cleanup()
  }

  private cleanup(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.ready = false
  }
}
