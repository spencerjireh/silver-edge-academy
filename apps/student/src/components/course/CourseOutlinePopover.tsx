import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Check, Lock } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { StudentCourseMap, StudentSection, StudentLesson } from '@/types/student'

interface CourseOutlinePopoverProps {
  isOpen: boolean
  onClose: () => void
  courseMap: StudentCourseMap
  currentLessonId: string
  currentSectionId: string
  anchorRef: React.RefObject<HTMLElement>
}

export function CourseOutlinePopover({
  isOpen,
  onClose,
  courseMap,
  currentLessonId,
  currentSectionId,
  anchorRef,
}: CourseOutlinePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([currentSectionId])
  )

  // Expand current section when it changes
  useEffect(() => {
    setExpandedSections((prev) => new Set([...prev, currentSectionId]))
  }, [currentSectionId])

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, anchorRef])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden z-50 animate-fade-in"
      role="dialog"
      aria-label="Course outline"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-display font-semibold text-slate-800 truncate text-sm">
          {courseMap.title}
        </h3>
        <div className="flex items-center gap-3 mt-2">
          <ProgressBar
            value={courseMap.progressPercent}
            max={100}
            size="sm"
            color="violet"
            className="flex-1"
          />
          <span className="text-xs font-medium text-slate-500">
            {courseMap.progressPercent}%
          </span>
        </div>
      </div>

      {/* Sections */}
      <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-2">
        {courseMap.sections.map((section, sectionIndex) => (
          <SectionAccordion
            key={section.id}
            section={section}
            sectionIndex={sectionIndex}
            courseId={courseMap.id}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            currentLessonId={currentLessonId}
            onLessonClick={onClose}
          />
        ))}
      </div>
    </div>
  )
}

interface SectionAccordionProps {
  section: StudentSection
  sectionIndex: number
  courseId: string
  isExpanded: boolean
  onToggle: () => void
  currentLessonId: string
  onLessonClick: () => void
}

function SectionAccordion({
  section,
  sectionIndex,
  courseId,
  isExpanded,
  onToggle,
  currentLessonId,
  onLessonClick,
}: SectionAccordionProps) {
  const isCompleted = section.status === 'completed'
  const isLocked = section.status === 'locked'

  return (
    <div className="mb-1">
      {/* Section header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors',
          isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
        )}
        disabled={isLocked}
        aria-expanded={isExpanded}
      >
        {/* Expand/collapse icon */}
        {isLocked ? (
          <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
        ) : isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}

        {/* Section number */}
        <div
          className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0',
            isCompleted && 'bg-emerald-100 text-emerald-600',
            section.status === 'in_progress' && 'bg-violet-100 text-violet-600',
            isLocked && 'bg-slate-100 text-slate-400'
          )}
        >
          {isCompleted ? <Check className="w-3 h-3" /> : sectionIndex + 1}
        </div>

        {/* Section title */}
        <span
          className={cn(
            'flex-1 min-w-0 truncate text-sm font-medium',
            isLocked ? 'text-slate-400' : 'text-slate-700'
          )}
        >
          {section.title}
        </span>

        {/* Progress */}
        <span className="text-xs text-slate-400 flex-shrink-0">
          {section.completedCount}/{section.totalCount}
        </span>
      </button>

      {/* Lessons list */}
      {isExpanded && !isLocked && (
        <div className="ml-6 pl-2 border-l-2 border-slate-100 mt-1 space-y-0.5">
          {section.lessons.map((lesson) => (
            <PopoverLessonItem
              key={lesson.id}
              lesson={lesson}
              courseId={courseId}
              isCurrent={lesson.id === currentLessonId}
              onClick={onLessonClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface PopoverLessonItemProps {
  lesson: StudentLesson
  courseId: string
  isCurrent: boolean
  onClick: () => void
}

function PopoverLessonItem({ lesson, courseId, isCurrent, onClick }: PopoverLessonItemProps) {
  const isClickable = lesson.status !== 'locked'
  const isCompleted = lesson.status === 'completed'
  const isLocked = lesson.status === 'locked'

  const content = (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
        isCurrent && 'bg-violet-100',
        isClickable && !isCurrent && 'hover:bg-slate-50',
        isLocked && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-medium',
          isCompleted && 'bg-emerald-500 text-white',
          isCurrent && !isCompleted && 'bg-violet-500 text-white',
          lesson.status === 'available' && !isCurrent && 'bg-slate-200 text-slate-600',
          isLocked && 'bg-slate-100 text-slate-300'
        )}
      >
        {isCompleted ? (
          <Check className="w-3 h-3" />
        ) : isLocked ? (
          <Lock className="w-2.5 h-2.5" />
        ) : (
          lesson.orderIndex + 1
        )}
      </div>

      {/* Lesson title */}
      <span
        className={cn(
          'flex-1 min-w-0 truncate text-sm',
          isCurrent && 'font-medium text-violet-700',
          isCompleted && !isCurrent && 'text-slate-500',
          lesson.status === 'available' && !isCurrent && 'text-slate-600',
          isLocked && 'text-slate-400'
        )}
      >
        {lesson.title}
      </span>
    </div>
  )

  if (isClickable) {
    return (
      <Link
        to={`/app/courses/${courseId}/lessons/${lesson.id}`}
        onClick={onClick}
        className="block"
      >
        {content}
      </Link>
    )
  }

  return <div>{content}</div>
}
