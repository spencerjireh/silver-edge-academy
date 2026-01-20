import { useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, ArrowRight, BookOpen, Code, FileQuestion, CheckCircle, ChevronDown } from 'lucide-react'
import { useLesson, useCompleteLesson, useCourseMap } from '@/hooks/queries/useCourses'
import { useGamification } from '@/contexts/GamificationContext'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { CourseOutlinePopover } from '@/components/course/CourseOutlinePopover'
import { computeLessonNavigation } from '@/utils/lessonNavigation'
import { cn } from '@/utils/cn'
import type { LessonStep } from '@/types/student'

export default function LessonView() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { data: lesson, isLoading, error } = useLesson(lessonId)
  const { data: courseMap, isLoading: courseMapLoading } = useCourseMap(courseId)
  const completeLessonMutation = useCompleteLesson()
  const { triggerXpGain } = useGamification()
  const { addToast } = useToast()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isOutlineOpen, setIsOutlineOpen] = useState(false)
  const outlineButtonRef = useRef<HTMLButtonElement>(null)

  // Compute navigation context from course map
  const navContext = courseMap && lessonId ? computeLessonNavigation(courseMap, lessonId) : null

  if (isLoading || courseMapLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton variant="rectangular" className="h-96 w-full" />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load lesson</p>
        <Link to={`/app/courses/${courseId}`} className="text-violet-600 hover:underline mt-2 inline-block">
          Back to course
        </Link>
      </div>
    )
  }

  const currentStep = lesson.steps[currentStepIndex]
  const isLastStep = currentStepIndex === lesson.steps.length - 1
  const allStepsCompleted = lesson.steps.every((s) => s.completed)

  const handleNextStep = () => {
    if (currentStepIndex < lesson.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleCompleteLesson = async () => {
    try {
      const result = await completeLessonMutation.mutateAsync(lesson.id)
      if (result.xpEarned > 0) {
        triggerXpGain(result.xpEarned, 'lesson')
      }
      addToast({ type: 'success', message: 'Lesson completed!' })
      navigate(`/app/courses/${courseId}`)
    } catch {
      addToast({ type: 'error', message: 'Failed to complete lesson' })
    }
  }

  // Build breadcrumb items
  const breadcrumbItems = navContext
    ? [
        { label: navContext.courseTitle, href: `/app/courses/${courseId}` },
        { label: navContext.currentSection.title },
        { label: lesson.title },
      ]
    : [
        { label: 'Course', href: `/app/courses/${courseId}` },
        { label: lesson.sectionTitle },
        { label: lesson.title },
      ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Breadcrumb and Outline Toggle */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-3">
          <Breadcrumb items={breadcrumbItems} />
          {courseMap && (
            <div className="relative">
              <button
                ref={outlineButtonRef}
                onClick={() => setIsOutlineOpen(!isOutlineOpen)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl transition-colors',
                  isOutlineOpen
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700'
                )}
                aria-label="Toggle course outline"
                aria-expanded={isOutlineOpen}
              >
                <span className="text-sm font-medium">Outline</span>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isOutlineOpen && 'rotate-180'
                  )}
                />
              </button>
              {courseMap && lessonId && (
                <CourseOutlinePopover
                  isOpen={isOutlineOpen}
                  onClose={() => setIsOutlineOpen(false)}
                  courseMap={courseMap}
                  currentLessonId={lessonId}
                  currentSectionId={lesson.sectionId}
                  anchorRef={outlineButtonRef}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Badge variant="default" className="mb-2">{lesson.sectionTitle}</Badge>
            <h1 className="font-display text-2xl font-bold text-slate-800">{lesson.title}</h1>
            {/* Position indicator */}
            {navContext && (
              <p className="text-sm text-slate-500 mt-1">
                Lesson {navContext.currentSection.lessonIndex + 1} of {navContext.currentSection.totalLessons} in {navContext.currentSection.title}
              </p>
            )}
          </div>
          <Badge variant="warning" className="text-lg px-3 py-1">
            +{lesson.xpReward} XP
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {lesson.steps.map((step: LessonStep, index: number) => {
          const Icon = step.type === 'content' ? BookOpen :
                       step.type === 'exercise' ? Code :
                       FileQuestion
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStepIndex(index)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap',
                index === currentStepIndex
                  ? 'bg-violet-100/80 text-violet-700 backdrop-blur-sm'
                  : step.completed
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              )}
            >
              {step.completed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <Card padding="lg">
        {currentStep.type === 'content' && (
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-display text-2xl font-bold mt-6 mb-4 text-slate-800">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-display text-xl font-bold mt-6 mb-3 text-slate-800">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-display text-lg font-bold mt-6 mb-2 text-slate-800">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="my-3 text-slate-600 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                code: ({ children, className }) => {
                  const isCodeBlock = className?.includes('language-')
                  if (isCodeBlock) {
                    return <code className="font-mono text-sm">{children}</code>
                  }
                  return (
                    <code className="bg-violet-50 px-1.5 py-0.5 rounded text-sm font-mono text-violet-600">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl overflow-x-auto my-4 border-2 border-violet-500/20">
                    {children}
                  </pre>
                ),
                ul: ({ children }) => (
                  <ul className="my-3 space-y-1">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="ml-4 text-slate-600">{children}</li>
                ),
              }}
            >
              {lesson.content}
            </ReactMarkdown>
          </div>
        )}

        {currentStep.type === 'exercise' && (
          <div className="text-center py-12">
            <Code className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Exercise: {currentStep.title}</h3>
            <p className="text-slate-500 mb-6">Complete the coding exercise to continue</p>
            <Link to={`/app/courses/${courseId}/lessons/${lessonId}/exercises/${currentStep.id}`}>
              <Button>Start Exercise</Button>
            </Link>
          </div>
        )}

        {currentStep.type === 'quiz' && (
          <div className="text-center py-12">
            <FileQuestion className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Quiz: {currentStep.title}</h3>
            <p className="text-slate-500 mb-6">Test your knowledge with a quick quiz</p>
            <Link to={`/app/courses/${courseId}/lessons/${lessonId}/quizzes/${currentStep.id}`}>
              <Button>Start Quiz</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {isLastStep && allStepsCompleted ? (
          <Button onClick={handleCompleteLesson} isLoading={completeLessonMutation.isPending}>
            Complete Lesson
            <CheckCircle className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleNextStep} disabled={isLastStep}>
            Next
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
