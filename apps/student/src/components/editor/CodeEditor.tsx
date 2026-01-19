import { useState, useRef } from 'react'
import { cn } from '@/utils/cn'

interface CodeEditorProps {
  code: string
  onChange: (code: string) => void
  language: 'javascript' | 'python'
  readOnly?: boolean
  className?: string
}

export function CodeEditor({
  code,
  onChange,
  language,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineCount, setLineCount] = useState(code.split('\n').length)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    onChange(newCode)
    setLineCount(newCode.split('\n').length)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      onChange(newCode)

      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  return (
    <div className={cn('bg-slate-900 rounded-xl overflow-hidden', className)}>
      {/* Language badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-medium text-slate-400 uppercase">
          {language}
        </span>
        {readOnly && (
          <span className="text-xs font-medium text-slate-500">Read Only</span>
        )}
      </div>

      <div className="flex">
        {/* Line numbers */}
        <div className="py-4 px-3 text-right text-slate-600 font-mono text-sm select-none bg-slate-900/50 border-r border-slate-700">
          {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
            <div key={i + 1} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          className={cn(
            'flex-1 p-4 bg-transparent text-slate-100 font-mono text-sm leading-6',
            'resize-none outline-none min-h-[300px]',
            readOnly && 'cursor-default'
          )}
          placeholder="// Write your code here..."
        />
      </div>
    </div>
  )
}
