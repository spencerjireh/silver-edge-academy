/**
 * Python Web Worker using Pyodide (WebAssembly)
 * Loads Pyodide ESM from CDN to avoid bundling the large WASM files
 */

import type { WorkerMessage, OutputType, ExecutionConfig } from '@/services/codeRunner/types'

// Pyodide types (minimal)
interface PyodideInterface {
  runPython: (code: string) => unknown
  runPythonAsync: (code: string) => Promise<unknown>
  loadPackage: (packages: string | string[]) => Promise<void>
  setStdout: (options: { batched: (msg: string) => void }) => void
  setStderr: (options: { batched: (msg: string) => void }) => void
}

// Pyodide CDN version - using ESM build
const PYODIDE_VERSION = '0.27.0'
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodide: PyodideInterface | null = null
let isLoading = false
let loadError: string | null = null

// Output helper
function sendOutput(type: OutputType, content: string) {
  self.postMessage({
    type: 'output',
    data: { type, content, timestamp: Date.now() },
  })
}

// Load Pyodide from CDN using dynamic import
async function loadPyodideRuntime(): Promise<PyodideInterface> {
  if (pyodide) return pyodide
  if (loadError) throw new Error(loadError)

  if (isLoading) {
    // Wait for existing load to complete
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if (pyodide) return pyodide
    if (loadError) throw new Error(loadError)
  }

  isLoading = true

  try {
    // Dynamic import of Pyodide ESM from CDN
    const pyodideModule = await import(
      /* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`
    )

    // Load Pyodide with the CDN URL
    pyodide = await pyodideModule.loadPyodide({
      indexURL: PYODIDE_CDN,
    })

    // Redirect stdout/stderr to our output handler
    pyodide!.setStdout({
      batched: (msg: string) => sendOutput('log', msg),
    })

    pyodide!.setStderr({
      batched: (msg: string) => sendOutput('error', msg),
    })

    isLoading = false
    return pyodide!
  } catch (error) {
    isLoading = false
    loadError = error instanceof Error ? error.message : String(error)
    throw error
  }
}

// Inject loop protection into Python code
function injectLoopProtection(code: string, maxIterations: number): string {
  const lines = code.split('\n')
  const result: string[] = []

  // Add the loop guard class at the beginning
  // Use single underscore prefix to avoid Python name mangling
  result.push('class _LoopGuard:')
  result.push('    _count = 0')
  result.push(`    _max = ${maxIterations}`)
  result.push('    @staticmethod')
  result.push('    def check():')
  result.push('        _LoopGuard._count += 1')
  result.push('        if _LoopGuard._count > _LoopGuard._max:')
  result.push('            raise RuntimeError("Infinite loop detected: exceeded " + str(_LoopGuard._max) + " iterations")')
  result.push('')

  for (const line of lines) {
    result.push(line)

    // Check if this line starts a loop (while or for)
    const trimmedLine = line.trimStart()
    const indent = line.length - trimmedLine.length

    if (/^(while|for)\s+.*:\s*$/.test(trimmedLine)) {
      // Add loop guard check on the next line with proper indentation
      const nextIndent = ' '.repeat(indent + 4)
      result.push(`${nextIndent}_LoopGuard.check()`)
    }
  }

  return result.join('\n')
}

// Execute Python code
async function executeCode(code: string, config: ExecutionConfig) {
  const startTime = performance.now()

  try {
    // Load Pyodide if not already loaded
    sendOutput('info', 'Loading Python runtime...')
    const py = await loadPyodideRuntime()
    sendOutput('info', 'Python runtime loaded.')

    // Inject loop protection
    const protectedCode = injectLoopProtection(code, config.maxIterations)

    // Execute the code
    const result = await py.runPythonAsync(protectedCode)

    // If there's a return value, output it
    if (result !== undefined && result !== null) {
      sendOutput('result', String(result))
    }

    const executionTime = performance.now() - startTime
    self.postMessage({ type: 'complete', executionTime })
  } catch (err) {
    const executionTime = performance.now() - startTime
    const errorMessage = err instanceof Error ? err.message : String(err)

    // Clean up the error message for better readability
    const cleanError = errorMessage
      .replace(/PythonError: Traceback \(most recent call last\):\n/, '')
      .replace(/\s+File "<exec>", line \d+, in <module>\n/, '')
      .trim()

    self.postMessage({ type: 'error', error: cleanError || errorMessage })
    self.postMessage({ type: 'complete', executionTime })
  }
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data

  if (message.type === 'run') {
    await executeCode(message.code, message.config)
  }
  // 'cancel' is handled by terminating the worker from the main thread
}

// Signal that worker is ready (but Pyodide still needs to load on first run)
self.postMessage({ type: 'ready' })
