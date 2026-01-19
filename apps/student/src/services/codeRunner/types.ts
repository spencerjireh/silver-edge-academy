/**
 * Types for the code runner service
 */

import { CODE_EXECUTION_TIMEOUT_MS } from '@silveredge/shared'

export type SupportedLanguage = 'javascript' | 'python'

export type OutputType = 'log' | 'warn' | 'error' | 'info' | 'result'

export interface OutputLine {
  type: OutputType
  content: string
  timestamp: number
}

export interface ExecutionConfig {
  timeout: number // milliseconds
  maxIterations: number // loop protection
}

export const DEFAULT_CONFIG: ExecutionConfig = {
  timeout: CODE_EXECUTION_TIMEOUT_MS,
  maxIterations: 10000, // 10k iterations before infinite loop detection
}

export interface ExecutionResult {
  success: boolean
  outputs: OutputLine[]
  error?: string
  executionTime: number // milliseconds
}

export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error'

export interface CodeRunnerState {
  status: ExecutionStatus
  outputs: OutputLine[]
  error?: string
  executionTime?: number
}

// Worker message types
export type WorkerMessageType = 'run' | 'cancel'
export type WorkerResponseType = 'output' | 'error' | 'complete' | 'ready'

export interface WorkerRunMessage {
  type: 'run'
  code: string
  config: ExecutionConfig
}

export interface WorkerCancelMessage {
  type: 'cancel'
}

export type WorkerMessage = WorkerRunMessage | WorkerCancelMessage

export interface WorkerOutputResponse {
  type: 'output'
  data: OutputLine
}

export interface WorkerErrorResponse {
  type: 'error'
  error: string
}

export interface WorkerCompleteResponse {
  type: 'complete'
  executionTime: number
}

export interface WorkerReadyResponse {
  type: 'ready'
}

export type WorkerResponse =
  | WorkerOutputResponse
  | WorkerErrorResponse
  | WorkerCompleteResponse
  | WorkerReadyResponse

// Executor interface for language-specific implementations
export interface CodeExecutor {
  execute(code: string, config: ExecutionConfig): Promise<ExecutionResult>
  stop(): void
  isReady(): boolean
}
