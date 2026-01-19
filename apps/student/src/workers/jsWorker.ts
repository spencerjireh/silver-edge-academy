/**
 * JavaScript Web Worker for sandboxed code execution
 * Captures console output and runs code in isolation
 */

import type { WorkerMessage, OutputType, ExecutionConfig } from '@/services/codeRunner/types'

// Output helper
function sendOutput(type: OutputType, content: string) {
  self.postMessage({
    type: 'output',
    data: { type, content, timestamp: Date.now() },
  })
}

// Create sandboxed console
const sandboxedConsole = {
  log: (...args: unknown[]) => sendOutput('log', formatArgs(args)),
  warn: (...args: unknown[]) => sendOutput('warn', formatArgs(args)),
  error: (...args: unknown[]) => sendOutput('error', formatArgs(args)),
  info: (...args: unknown[]) => sendOutput('info', formatArgs(args)),
}

// Format console arguments to string
function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (arg === null) return 'null'
      if (arg === undefined) return 'undefined'
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2)
        } catch {
          return String(arg)
        }
      }
      return String(arg)
    })
    .join(' ')
}

// Execute code in sandboxed environment
function executeCode(code: string, config: ExecutionConfig) {
  const startTime = performance.now()

  try {
    // Create a function that runs the code with sandboxed console
    // The __maxIterations__ variable is used by loop protection injected in codeTransformer
    const wrappedCode = `
      "use strict";
      const console = __console__;
      const __maxIterations__ = ${config.maxIterations};
      let __iterationCount__ = 0;
      function __checkIteration__() {
        if (++__iterationCount__ > __maxIterations__) {
          throw new Error('Infinite loop detected: exceeded ' + __maxIterations__ + ' iterations');
        }
      }
      ${code}
    `

    // Execute using Function constructor (safer than eval, still sandboxed in worker)
    const fn = new Function('__console__', wrappedCode)
    const result = fn(sandboxedConsole)

    // If there's a return value, output it
    if (result !== undefined) {
      sendOutput('result', formatArgs([result]))
    }

    const executionTime = performance.now() - startTime
    self.postMessage({ type: 'complete', executionTime })
  } catch (err) {
    const executionTime = performance.now() - startTime
    const errorMessage = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'error', error: errorMessage })
    self.postMessage({ type: 'complete', executionTime })
  }
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const message = event.data

  if (message.type === 'run') {
    executeCode(message.code, message.config)
  }
  // 'cancel' is handled by terminating the worker from the main thread
}

// Signal that worker is ready
self.postMessage({ type: 'ready' })
