import { Terminal, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { OutputLine, ExecutionStatus } from '@/services/codeRunner/types'

interface OutputPanelProps {
  // Support both legacy string output and new structured outputs
  output?: string
  outputs?: OutputLine[]
  error?: string
  status?: ExecutionStatus
  executionTime?: number
  className?: string
}

export function OutputPanel({
  output,
  outputs = [],
  error,
  status = 'idle',
  executionTime,
  className,
}: OutputPanelProps) {
  const statusConfig = {
    idle: { icon: Terminal, color: 'text-slate-400', label: 'Output' },
    running: { icon: Terminal, color: 'text-blue-400', label: 'Running...' },
    success: { icon: CheckCircle, color: 'text-emerald-400', label: 'Success' },
    error: { icon: XCircle, color: 'text-red-400', label: 'Error' },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  // Check if we have content to display
  const hasOutputs = outputs.length > 0
  const hasLegacyOutput = Boolean(output)

  // Color mapping for different output types
  const outputTypeColors: Record<string, string> = {
    log: 'text-slate-300',
    info: 'text-blue-400',
    warn: 'text-amber-400',
    error: 'text-red-400',
    result: 'text-emerald-400',
  }

  return (
    <div className={cn('bg-slate-900 rounded-2xl overflow-hidden border-2 border-violet-500/20', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-violet-500/20">
        <div className="flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.color)} />
          <span className={cn('text-sm font-medium font-mono', config.color)}>
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Execution time */}
          {executionTime !== undefined && status !== 'running' && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-mono">
                {executionTime < 1000
                  ? `${Math.round(executionTime)}ms`
                  : `${(executionTime / 1000).toFixed(2)}s`}
              </span>
            </div>
          )}
          {/* Running spinner */}
          {status === 'running' && (
            <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Output content */}
      <div className="p-4 min-h-[150px] max-h-[300px] overflow-auto">
        {error ? (
          <div className="flex items-start gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <pre className="font-mono text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        ) : hasOutputs ? (
          <div className="space-y-1">
            {outputs.map((line, index) => (
              <div
                key={index}
                className={cn(
                  'font-mono text-sm whitespace-pre-wrap',
                  outputTypeColors[line.type] || 'text-slate-300'
                )}
              >
                {line.type === 'warn' && (
                  <span className="text-amber-500 mr-1">[warn]</span>
                )}
                {line.type === 'error' && (
                  <span className="text-red-500 mr-1">[error]</span>
                )}
                {line.type === 'result' && (
                  <span className="text-emerald-500 mr-1">=&gt;</span>
                )}
                {line.content}
              </div>
            ))}
          </div>
        ) : hasLegacyOutput ? (
          <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap">
            {output}
          </pre>
        ) : (
          <p className="text-slate-500 text-sm">
            Click &quot;Run Code&quot; to see the output here.
          </p>
        )}
      </div>
    </div>
  )
}
