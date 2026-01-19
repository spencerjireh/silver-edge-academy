/**
 * Code Runner Service - singleton for managing code execution
 * Routes execution to appropriate language-specific executor
 */

import type {
  SupportedLanguage,
  ExecutionConfig,
  ExecutionResult,
  CodeExecutor,
  OutputLine,
} from './types'
import { DEFAULT_CONFIG } from './types'
import { JavaScriptExecutor } from './JavaScriptExecutor'

class CodeRunnerServiceImpl {
  private jsExecutor: JavaScriptExecutor
  private pyExecutor: CodeExecutor | null = null
  private currentExecutor: CodeExecutor | null = null
  private outputCallback: ((output: OutputLine) => void) | null = null

  constructor() {
    this.jsExecutor = new JavaScriptExecutor()
  }

  /**
   * Set callback for streaming output during execution
   */
  setOutputCallback(callback: ((output: OutputLine) => void) | null): void {
    this.outputCallback = callback
  }

  /**
   * Execute code in the specified language
   */
  async execute(
    code: string,
    language: SupportedLanguage,
    config: Partial<ExecutionConfig> = {}
  ): Promise<ExecutionResult> {
    const fullConfig: ExecutionConfig = { ...DEFAULT_CONFIG, ...config }

    // Get appropriate executor
    const executor = this.getExecutor(language)
    this.currentExecutor = executor

    // Execute code
    const result = await executor.execute(code, fullConfig)

    // Stream outputs if callback is set
    if (this.outputCallback) {
      for (const output of result.outputs) {
        this.outputCallback(output)
      }
    }

    this.currentExecutor = null
    return result
  }

  /**
   * Stop current execution
   */
  stop(): void {
    if (this.currentExecutor) {
      this.currentExecutor.stop()
      this.currentExecutor = null
    }
  }

  /**
   * Check if Python executor is loaded and ready
   */
  isPythonReady(): boolean {
    return this.pyExecutor?.isReady() ?? false
  }

  /**
   * Preload Python executor (Pyodide) for faster first execution
   */
  async preloadPython(): Promise<void> {
    if (!this.pyExecutor) {
      // Lazy load Python executor to avoid bundling Pyodide
      const { PythonExecutor } = await import('./PythonExecutor')
      this.pyExecutor = new PythonExecutor()
    }
  }

  private getExecutor(language: SupportedLanguage): CodeExecutor {
    switch (language) {
      case 'javascript':
        return this.jsExecutor
      case 'python':
        if (!this.pyExecutor) {
          throw new Error('Python executor not loaded. Call preloadPython() first.')
        }
        return this.pyExecutor
      default:
        throw new Error(`Unsupported language: ${language}`)
    }
  }
}

// Export singleton instance
export const CodeRunnerService = new CodeRunnerServiceImpl()
