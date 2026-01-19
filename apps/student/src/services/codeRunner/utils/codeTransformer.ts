/**
 * Code transformer utilities for loop protection injection
 */

/**
 * Inject loop protection into JavaScript code
 * Adds iteration checks to while, for, and do-while loops
 */
export function transformJavaScript(code: string): string {
  // Pattern to match loop constructs
  // This is a simplified approach - a proper implementation would use an AST parser

  let transformed = code

  // Inject check into while loops: while (cond) { ... } -> while (cond) { __checkIteration__(); ... }
  transformed = transformed.replace(
    /\bwhile\s*\(([^)]+)\)\s*\{/g,
    'while ($1) { __checkIteration__();'
  )

  // Inject check into for loops: for (...) { ... } -> for (...) { __checkIteration__(); ... }
  transformed = transformed.replace(
    /\bfor\s*\(([^)]*)\)\s*\{/g,
    'for ($1) { __checkIteration__();'
  )

  // Inject check into do-while loops: do { ... } while -> do { __checkIteration__(); ... } while
  transformed = transformed.replace(
    /\bdo\s*\{/g,
    'do { __checkIteration__();'
  )

  return transformed
}

/**
 * Inject loop protection into Python code
 * Adds iteration checks to while and for loops
 */
export function transformPython(code: string): string {
  const lines = code.split('\n')
  const result: string[] = []

  // Add the loop guard class at the beginning
  result.push('class __LoopGuard:')
  result.push('    count = 0')
  result.push('    max_iterations = 10000')
  result.push('    @staticmethod')
  result.push('    def check():')
  result.push('        __LoopGuard.count += 1')
  result.push('        if __LoopGuard.count > __LoopGuard.max_iterations:')
  result.push('            raise RuntimeError("Infinite loop detected: exceeded " + str(__LoopGuard.max_iterations) + " iterations")')
  result.push('')

  for (const line of lines) {
    result.push(line)

    // Check if this line starts a loop (while or for)
    const trimmedLine = line.trimStart()
    const indent = line.length - trimmedLine.length

    if (/^(while|for)\s+.*:\s*$/.test(trimmedLine)) {
      // Add loop guard check on the next line with proper indentation
      const nextIndent = ' '.repeat(indent + 4)
      result.push(`${nextIndent}__LoopGuard.check()`)
    }
  }

  return result.join('\n')
}
