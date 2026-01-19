import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, Star } from 'lucide-react'
import { useExercise, useSubmitExercise } from '@/hooks/queries/useExercises'
import { useCodeRunner } from '@/hooks/useCodeRunner'
import { useGamification } from '@/contexts/GamificationContext'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { OutputPanel } from '@/components/editor/OutputPanel'
import type { ExerciseSubmitResult } from '@/types/student'

export default function ExerciseView() {
  const { courseId, lessonId, exerciseId } = useParams<{
    courseId: string
    lessonId: string
    exerciseId: string
  }>()
  const navigate = useNavigate()
  const { data: exercise, isLoading, error } = useExercise(exerciseId)
  const submitMutation = useSubmitExercise()
  const { triggerXpGain } = useGamification()
  const { addToast } = useToast()

  const [code, setCode] = useState('')
  const [submitResult, setSubmitResult] = useState<ExerciseSubmitResult | null>(null)

  // Use code runner hook - exercises use JavaScript by default
  const { run, stop, clear, outputs, isRunning, state } = useCodeRunner({ language: 'javascript' })

  // Initialize code when exercise loads
  useEffect(() => {
    if (exercise && !code && !submitResult) {
      setCode(exercise.starterCode)
    }
  }, [exercise, code, submitResult])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton variant="rectangular" className="h-64 w-full" />
        <Skeleton variant="rectangular" className="h-48 w-full" />
      </div>
    )
  }

  if (error || !exercise) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load exercise</p>
        <Link
          to={`/courses/${courseId}/lessons/${lessonId}`}
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Back to lesson
        </Link>
      </div>
    )
  }

  const handleRun = () => {
    run(code)
  }

  const handleStop = () => {
    stop()
  }

  const handleReset = () => {
    setCode(exercise.starterCode)
    clear()
    setSubmitResult(null)
  }

  const handleSubmit = async () => {
    try {
      const result = await submitMutation.mutateAsync({
        exerciseId: exercise.id,
        code,
      })
      setSubmitResult(result)

      if (result.passed) {
        if (result.xpEarned > 0) {
          triggerXpGain(result.xpEarned, 'exercise')
        }
        addToast({ type: 'success', message: 'Exercise passed! Great job!' })
      } else {
        addToast({
          type: 'warning',
          message: `${result.testsPassed}/${result.testsTotal} tests passed. Keep trying!`,
        })
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to submit exercise' })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <Link
          to={`/courses/${courseId}/lessons/${lessonId}`}
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to lesson</span>
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">{exercise.title}</h1>
          <Badge variant="warning" className="text-lg px-3 py-1">
            <Star className="w-4 h-4 mr-1 fill-xp-gold" />
            {exercise.xpReward} XP
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Instructions */}
        <Card padding="lg">
          <h2 className="font-bold text-slate-800 mb-3">Instructions</h2>
          <div
            className="prose prose-slate prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(exercise.instructions) }}
          />
        </Card>

        {/* Code editor and output */}
        <div className="space-y-4">
          <EditorToolbar
            onRun={handleRun}
            onStop={handleStop}
            onReset={handleReset}
            isRunning={isRunning}
          />

          <CodeEditor
            code={code}
            onChange={setCode}
            language="javascript"
          />

          <OutputPanel
            outputs={outputs}
            status={submitResult?.passed ? 'success' : submitResult ? 'error' : state.status}
            executionTime={state.executionTime}
          />

          {/* Submit result */}
          {submitResult && (
            <Card
              className={
                submitResult.passed
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }
              padding="md"
            >
              <div className="flex items-center gap-3">
                {submitResult.passed ? (
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <h3 className="font-bold text-slate-800">
                    {submitResult.passed ? 'All tests passed!' : 'Some tests failed'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {submitResult.testsPassed}/{submitResult.testsTotal} tests passed
                    {submitResult.xpEarned > 0 && ` - Earned ${submitResult.xpEarned} XP!`}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              isLoading={submitMutation.isPending}
              disabled={isRunning || !code.trim()}
              className="flex-1"
            >
              Submit Answer
            </Button>

            {!submitResult?.passed && (
              <Link to={`/courses/${courseId}/lessons/${lessonId}`}>
                <Button variant="ghost">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Ask for Help
                </Button>
              </Link>
            )}
          </div>

          {submitResult?.passed && (
            <Button
              onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}
              className="w-full"
              variant="success"
            >
              Continue to Lesson
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function formatMarkdown(content: string): string {
  const html = content
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-primary-600">$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto my-3"><code>$2</code></pre>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-2">')
  return DOMPurify.sanitize(html)
}
