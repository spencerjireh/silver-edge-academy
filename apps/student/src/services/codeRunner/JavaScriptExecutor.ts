/**
 * JavaScript code executor using Web Workers
 */

import type {
  CodeExecutor,
  ExecutionConfig,
  ExecutionResult,
  OutputLine,
  WorkerResponse,
} from './types'
import { transformJavaScript } from './utils/codeTransformer'

// Import worker as URL for Vite
import JsWorkerUrl from '@/workers/jsWorker.ts?worker&url'

export class JavaScriptExecutor implements CodeExecutor {
  private worker: Worker | null = null
  private ready = false
  private timeoutId: ReturnType<typeof setTimeout> | null = null

  isReady(): boolean {
    return this.ready
  }

  async execute(code: string, config: ExecutionConfig): Promise<ExecutionResult> {
    // Clean up any existing worker
    this.stop()

    const outputs: OutputLine[] = []

    return new Promise((resolve) => {
      // Create new worker
      this.worker = new Worker(JsWorkerUrl, { type: 'module' })

      // Set timeout for execution
      this.timeoutId = setTimeout(() => {
        outputs.push({
          type: 'error',
          content: `Execution timed out after ${config.timeout}ms`,
          timestamp: Date.now(),
        })
        this.stop()
        resolve({
          success: false,
          outputs,
          error: `Execution timed out after ${config.timeout}ms`,
          executionTime: config.timeout,
        })
      }, config.timeout)

      // Handle worker messages
      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const message = event.data

        switch (message.type) {
          case 'ready': {
            this.ready = true
            // Transform code to add loop protection, then send to worker
            const transformedCode = transformJavaScript(code)
            this.worker?.postMessage({ type: 'run', code: transformedCode, config })
            break
          }

          case 'output':
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
