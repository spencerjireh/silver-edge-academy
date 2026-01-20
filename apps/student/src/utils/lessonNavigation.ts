import type { StudentCourseMap } from '@/types/student'

export interface LessonInfo {
  id: string
  title: string
  sectionId: string
  sectionTitle: string
}

export interface LessonNavigationContext {
  courseId: string
  courseTitle: string
  currentLesson: LessonInfo
  currentSection: {
    id: string
    title: string
    lessonIndex: number
    totalLessons: number
  }
  previousLesson: LessonInfo | null
  nextLesson: LessonInfo | null
  isFirstLesson: boolean
  isLastLesson: boolean
}

/**
 * Computes the navigation context for a lesson within a course map.
 * Returns null if the lesson is not found in the course.
 */
export function computeLessonNavigation(
  courseMap: StudentCourseMap,
  lessonId: string
): LessonNavigationContext | null {
  // Flatten all lessons with their section info
  const allLessons: LessonInfo[] = []

  for (const section of courseMap.sections) {
    for (const lesson of section.lessons) {
      allLessons.push({
        id: lesson.id,
        title: lesson.title,
        sectionId: section.id,
        sectionTitle: section.title,
      })
    }
  }

  // Find current lesson index
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)

  if (currentIndex === -1) {
    return null
  }

  const currentLesson = allLessons[currentIndex]

  // Find current section and position within it
  const currentSection = courseMap.sections.find((s) => s.id === currentLesson.sectionId)!
  const sectionLessonIndex = currentSection.lessons.findIndex((l) => l.id === lessonId)

  return {
    courseId: courseMap.id,
    courseTitle: courseMap.title,
    currentLesson,
    currentSection: {
      id: currentSection.id,
      title: currentSection.title,
      lessonIndex: sectionLessonIndex,
      totalLessons: currentSection.lessons.length,
    },
    previousLesson: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    nextLesson: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    isFirstLesson: currentIndex === 0,
    isLastLesson: currentIndex === allLessons.length - 1,
  }
}

/**
 * Get all lessons from a course map as a flat array with section info.
 */
export function getAllLessonsFlat(courseMap: StudentCourseMap): LessonInfo[] {
  const lessons: LessonInfo[] = []

  for (const section of courseMap.sections) {
    for (const lesson of section.lessons) {
      lessons.push({
        id: lesson.id,
        title: lesson.title,
        sectionId: section.id,
        sectionTitle: section.title,
      })
    }
  }

  return lessons
}
