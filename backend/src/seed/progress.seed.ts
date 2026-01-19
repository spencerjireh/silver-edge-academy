import { LessonProgress } from '../modules/progress/lessonProgress.model'
import { Lesson } from '../modules/lessons/lessons.model'
import { Section } from '../modules/sections/sections.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededCourses } from './courses.seed'

export async function seedProgress(
  users: SeededUsers,
  courses: SeededCourses
): Promise<void> {
  logger.info('Seeding progress data...')

  // Get all lessons for JavaScript course
  const jsSections = await Section.find({ courseId: courses.javascript })
  const jsLessons = await Lesson.find({
    sectionId: { $in: jsSections.map((s) => s._id) },
  })

  // Create varied progress for students in JavaScript class
  const jsStudents = users.students.slice(0, 5)

  for (let i = 0; i < jsStudents.length; i++) {
    const studentId = jsStudents[i]
    const lessonsToComplete = Math.floor(Math.random() * jsLessons.length)

    for (let j = 0; j < jsLessons.length; j++) {
      const lesson = jsLessons[j]

      if (j < lessonsToComplete) {
        // Completed lesson
        await LessonProgress.create({
          studentId,
          lessonId: lesson._id,
          status: 'completed',
          startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(),
          timeSpentSeconds: Math.floor(Math.random() * 1800) + 300,
          xpEarned: lesson.xpReward,
        })
      } else if (j === lessonsToComplete) {
        // In progress lesson
        await LessonProgress.create({
          studentId,
          lessonId: lesson._id,
          status: 'in_progress',
          startedAt: new Date(),
          timeSpentSeconds: Math.floor(Math.random() * 600),
          xpEarned: 0,
        })
      }
      // Remaining lessons are not started
    }
  }

  // Get all lessons for Python course
  const pySections = await Section.find({ courseId: courses.python })
  const pyLessons = await Lesson.find({
    sectionId: { $in: pySections.map((s) => s._id) },
  })

  // Create progress for Python students
  const pyStudents = users.students.slice(5, 10)

  for (let i = 0; i < pyStudents.length; i++) {
    const studentId = pyStudents[i]
    const lessonsToComplete = Math.floor(Math.random() * pyLessons.length)

    for (let j = 0; j < pyLessons.length; j++) {
      const lesson = pyLessons[j]

      if (j < lessonsToComplete) {
        await LessonProgress.create({
          studentId,
          lessonId: lesson._id,
          status: 'completed',
          startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(),
          timeSpentSeconds: Math.floor(Math.random() * 1800) + 300,
          xpEarned: lesson.xpReward,
        })
      } else if (j === lessonsToComplete) {
        await LessonProgress.create({
          studentId,
          lessonId: lesson._id,
          status: 'in_progress',
          startedAt: new Date(),
          timeSpentSeconds: Math.floor(Math.random() * 600),
          xpEarned: 0,
        })
      }
    }
  }

  logger.info('Created progress data for all students')
}
