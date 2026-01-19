import type {
  DashboardStats,
  ActivityData,
  CourseCompletionData,
  RecentlyViewedItem,
} from '@silveredge/shared'
import { User } from '../users/users.model'
import { Course } from '../courses/courses.model'
import { Class } from '../classes/classes.model'
import { LessonProgress } from '../progress/lessonProgress.model'

// In-memory storage for recently viewed items (per admin user)
const recentlyViewedStore = new Map<string, RecentlyViewedItem[]>()

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  const [
    activeStudents,
    archivedStudents,
    enrolledThisWeek,
    activeTeachers,
    inactiveTeachers,
    totalClasses,
    javascriptCourses,
    pythonCourses,
    publishedCourses,
  ] = await Promise.all([
    User.countDocuments({ role: 'student', status: 'active' }),
    User.countDocuments({ role: 'student', status: 'inactive' }),
    User.countDocuments({ role: 'student', createdAt: { $gte: weekAgo } }),
    User.countDocuments({ role: 'teacher', status: 'active' }),
    User.countDocuments({ role: 'teacher', status: 'inactive' }),
    Class.countDocuments({ status: 'active' }),
    Course.countDocuments({ language: 'javascript' }),
    Course.countDocuments({ language: 'python' }),
    Course.countDocuments({ status: 'published' }),
  ])

  const totalTeachers = activeTeachers + inactiveTeachers
  const avgClassesPerTeacher = totalTeachers > 0 ? Math.round((totalClasses / totalTeachers) * 10) / 10 : 0
  const totalCourses = javascriptCourses + pythonCourses

  return {
    totalStudents: {
      value: activeStudents + archivedStudents,
      breakdown: {
        active: activeStudents,
        archived: archivedStudents,
        enrolledThisWeek,
      },
    },
    activeTeachers: {
      value: activeTeachers,
      breakdown: {
        active: activeTeachers,
        inactive: inactiveTeachers,
        avgClassesPerTeacher,
      },
    },
    totalCourses: {
      value: totalCourses,
      breakdown: {
        javascript: javascriptCourses,
        python: pythonCourses,
        published: publishedCourses,
      },
    },
    avgCompletionRate: {
      value: 0,
      breakdown: {
        javascript: 0,
        python: 0,
        exercisesPassed: 0,
      },
    },
  }
}

export async function getActivityData(days = 7): Promise<ActivityData[]> {
  const endDate = new Date()
  endDate.setHours(23, 59, 59, 999)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  startDate.setHours(0, 0, 0, 0)

  // Aggregate lesson completions by date
  const lessonAggregation = await LessonProgress.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
        },
        count: { $sum: 1 },
      },
    },
  ])

  // Build activity data for each day
  const activityMap = new Map<string, ActivityData>()

  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    activityMap.set(dateStr, {
      date: dateStr,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      quizzesCompleted: 0,
    })
  }

  // Fill in lesson completions
  for (const item of lessonAggregation) {
    const data = activityMap.get(item._id)
    if (data) {
      data.lessonsCompleted = item.count
    }
  }

  return Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

interface LanguageCompletion {
  javascript: { percentage: number; courseCount: number }
  python: { percentage: number; courseCount: number }
}

export async function getCourseCompletionByLanguage(): Promise<LanguageCompletion> {
  const [javascriptCourses, pythonCourses] = await Promise.all([
    Course.countDocuments({ language: 'javascript', status: 'published' }),
    Course.countDocuments({ language: 'python', status: 'published' }),
  ])

  // For now, return basic counts with 0% completion (would need more complex aggregation for real %)
  return {
    javascript: {
      percentage: 0,
      courseCount: javascriptCourses,
    },
    python: {
      percentage: 0,
      courseCount: pythonCourses,
    },
  }
}

export async function getCourseCompletionData(): Promise<CourseCompletionData[]> {
  const courses = await Course.find({ status: 'published' }).limit(10).lean()

  const completionData: CourseCompletionData[] = []

  for (const course of courses) {
    const courseId = course._id.toString()

    // Get total lessons in course
    const totalLessons = course.lessonCount || 0
    if (totalLessons === 0) {
      completionData.push({
        courseId,
        courseName: course.title,
        totalStudents: 0,
        completedStudents: 0,
        inProgressStudents: 0,
        completionRate: 0,
      })
      continue
    }

    // Get students enrolled via classes
    const classesWithCourse = await Class.find({ courseIds: course._id, status: 'active' })
    const studentIds = classesWithCourse.flatMap((c) => c.studentIds)
    const uniqueStudentIds = [...new Set(studentIds.map((id) => id.toString()))]
    const totalStudents = uniqueStudentIds.length

    // Count completed and in-progress students
    // A student completes a course when all lessons are completed
    const progressAggregation = await LessonProgress.aggregate([
      {
        $lookup: {
          from: 'lessons',
          localField: 'lessonId',
          foreignField: '_id',
          as: 'lesson',
        },
      },
      { $unwind: '$lesson' },
      {
        $lookup: {
          from: 'sections',
          localField: 'lesson.sectionId',
          foreignField: '_id',
          as: 'section',
        },
      },
      { $unwind: '$section' },
      {
        $match: {
          'section.courseId': course._id,
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$studentId',
          completedLessons: { $sum: 1 },
        },
      },
    ])

    let completedStudents = 0
    let inProgressStudents = 0

    for (const progress of progressAggregation) {
      if (progress.completedLessons >= totalLessons) {
        completedStudents++
      } else if (progress.completedLessons > 0) {
        inProgressStudents++
      }
    }

    completionData.push({
      courseId,
      courseName: course.title,
      totalStudents,
      completedStudents,
      inProgressStudents,
      completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
    })
  }

  return completionData
}

export function getRecentlyViewed(userId: string): RecentlyViewedItem[] {
  return recentlyViewedStore.get(userId) || []
}

export function addRecentlyViewed(userId: string, item: Omit<RecentlyViewedItem, 'viewedAt'>): void {
  const items = recentlyViewedStore.get(userId) || []

  // Remove existing entry for same item
  const filtered = items.filter((i) => !(i.type === item.type && i.id === item.id))

  // Add new item at the beginning
  filtered.unshift({
    ...item,
    viewedAt: new Date().toISOString(),
  })

  // Keep only last 10 items
  recentlyViewedStore.set(userId, filtered.slice(0, 10))
}
