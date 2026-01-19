import { Types } from 'mongoose'
import { Class } from '../modules/classes/classes.model'
import { StudentProfile } from '../modules/users/studentProfile.model'
import { TeacherProfile } from '../modules/users/teacherProfile.model'
import { logger } from '../utils/logger'
import type { SeededUsers } from './users.seed'
import type { SeededCourses } from './courses.seed'

export interface SeededClasses {
  class1: Types.ObjectId
  class2: Types.ObjectId
}

export async function seedClasses(
  users: SeededUsers,
  courses: SeededCourses
): Promise<SeededClasses> {
  logger.info('Seeding classes...')

  // Class 1: JavaScript Beginners
  const class1 = await Class.create({
    name: 'JavaScript Beginners',
    description: 'Introduction to JavaScript for young coders',
    color: '#3b82f6',
    teacherId: users.teachers[0],
    studentIds: users.students.slice(0, 5),
    courseIds: [courses.javascript],
    status: 'active',
  })

  // Update teacher profile
  await TeacherProfile.findOneAndUpdate(
    { userId: users.teachers[0] },
    { $addToSet: { classIds: class1._id } }
  )

  // Update student profiles
  await StudentProfile.updateMany(
    { userId: { $in: users.students.slice(0, 5) } },
    { classId: class1._id }
  )

  logger.info('Created Class 1: JavaScript Beginners')

  // Class 2: Python Adventures
  const class2 = await Class.create({
    name: 'Python Adventures',
    description: 'Learning Python through fun projects',
    color: '#10b981',
    teacherId: users.teachers[1],
    studentIds: users.students.slice(5, 10),
    courseIds: [courses.python],
    status: 'active',
  })

  // Update teacher profile
  await TeacherProfile.findOneAndUpdate(
    { userId: users.teachers[1] },
    { $addToSet: { classIds: class2._id } }
  )

  // Update student profiles
  await StudentProfile.updateMany(
    { userId: { $in: users.students.slice(5, 10) } },
    { classId: class2._id }
  )

  logger.info('Created Class 2: Python Adventures')

  return {
    class1: class1._id,
    class2: class2._id,
  }
}
