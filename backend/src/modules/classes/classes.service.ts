import { Types } from 'mongoose'
import { Class, type IClass } from './classes.model'
import { LessonUnlock } from './lessonUnlock.model'
import { User } from '../users/users.model'
import { StudentProfile } from '../users/studentProfile.model'
import { TeacherProfile } from '../users/teacherProfile.model'
import { Course } from '../courses/courses.model'
import { ApiError } from '../../utils/ApiError'
import {
  parsePaginationParams,
  buildPaginationMeta,
  buildSortObject,
} from '../../utils/pagination'
import type { CreateClassInput, UpdateClassInput, ListClassesQuery } from './classes.schema'
import type { PaginationMeta } from '@silveredge/shared'

export interface ClassListResult {
  classes: IClass[]
  meta: PaginationMeta
}

export async function listClasses(query: ListClassesQuery): Promise<ClassListResult> {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}
  if (query.status) {
    filter.status = query.status
  }
  if (query.teacherId) {
    filter.teacherId = new Types.ObjectId(query.teacherId)
  }

  const [classes, total] = await Promise.all([
    Class.find(filter)
      .sort(buildSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .populate('teacherId', 'displayName'),
    Class.countDocuments(filter),
  ])

  return {
    classes,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getClassById(id: string): Promise<IClass> {
  const classDoc = await Class.findById(id).populate('teacherId', 'displayName')
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }
  return classDoc
}

export async function createClass(input: CreateClassInput): Promise<IClass> {
  const classDoc = await Class.create({
    ...input,
    teacherId: input.teacherId ? new Types.ObjectId(input.teacherId) : undefined,
    courseIds: input.courseIds?.map((id) => new Types.ObjectId(id)) || [],
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    endDate: input.endDate ? new Date(input.endDate) : undefined,
  })

  // Update teacher profile
  if (input.teacherId) {
    await TeacherProfile.findOneAndUpdate(
      { userId: new Types.ObjectId(input.teacherId) },
      { $addToSet: { classIds: classDoc._id } }
    )
  }

  return classDoc
}

export async function updateClass(id: string, input: UpdateClassInput): Promise<IClass> {
  const classDoc = await Class.findById(id)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  // Handle teacher change
  if (input.teacherId !== undefined && input.teacherId !== classDoc.teacherId?.toString()) {
    // Remove from old teacher
    if (classDoc.teacherId) {
      await TeacherProfile.findOneAndUpdate(
        { userId: classDoc.teacherId },
        { $pull: { classIds: classDoc._id } }
      )
    }
    // Add to new teacher
    if (input.teacherId) {
      await TeacherProfile.findOneAndUpdate(
        { userId: new Types.ObjectId(input.teacherId) },
        { $addToSet: { classIds: classDoc._id } }
      )
    }
  }

  const updateData: Record<string, unknown> = { ...input }
  if (input.teacherId !== undefined) {
    updateData.teacherId = input.teacherId ? new Types.ObjectId(input.teacherId) : null
  }
  if (input.startDate !== undefined) {
    updateData.startDate = input.startDate ? new Date(input.startDate) : null
  }
  if (input.endDate !== undefined) {
    updateData.endDate = input.endDate ? new Date(input.endDate) : null
  }

  Object.assign(classDoc, updateData)
  await classDoc.save()

  return classDoc
}

export async function deleteClass(id: string): Promise<void> {
  const classDoc = await Class.findById(id)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  // Archive instead of delete
  classDoc.status = 'archived'
  await classDoc.save()
}

export async function getClassStudents(classId: string) {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  return User.find({ _id: { $in: classDoc.studentIds } })
}

export async function addStudent(classId: string, studentId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const student = await User.findById(studentId)
  if (!student || student.role !== 'student') {
    throw ApiError.badRequest('Invalid student')
  }

  // Check if already in class
  if (classDoc.studentIds.some((id) => id.toString() === studentId)) {
    throw ApiError.conflict('Student is already in this class')
  }

  // Update student's current class
  const studentProfile = await StudentProfile.findOne({ userId: studentId })
  if (studentProfile?.classId) {
    // Remove from old class
    await Class.findByIdAndUpdate(studentProfile.classId, { $pull: { studentIds: studentId } })
  }

  // Add to new class
  classDoc.studentIds.push(new Types.ObjectId(studentId))
  await classDoc.save()

  // Update student profile
  await StudentProfile.findOneAndUpdate(
    { userId: studentId },
    { classId: classDoc._id }
  )
}

export async function removeStudent(classId: string, studentId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  classDoc.studentIds = classDoc.studentIds.filter((id) => id.toString() !== studentId)
  await classDoc.save()

  // Update student profile
  await StudentProfile.findOneAndUpdate({ userId: studentId, classId: classDoc._id }, { $unset: { classId: 1 } })
}

export async function getClassCourses(classId: string) {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  return Course.find({ _id: { $in: classDoc.courseIds } })
}

export async function addCourse(classId: string, courseId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  if (classDoc.courseIds.some((id) => id.toString() === courseId)) {
    throw ApiError.conflict('Course is already assigned to this class')
  }

  classDoc.courseIds.push(new Types.ObjectId(courseId))
  await classDoc.save()
}

export async function removeCourse(classId: string, courseId: string): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  classDoc.courseIds = classDoc.courseIds.filter((id) => id.toString() !== courseId)
  await classDoc.save()
}

export async function unlockLesson(
  classId: string,
  lessonId: string,
  unlockedBy: string
): Promise<void> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const existing = await LessonUnlock.findOne({ classId, lessonId })
  if (existing) {
    throw ApiError.conflict('Lesson is already unlocked for this class')
  }

  await LessonUnlock.create({
    lessonId: new Types.ObjectId(lessonId),
    classId: new Types.ObjectId(classId),
    unlockedBy: new Types.ObjectId(unlockedBy),
  })
}

export async function lockLesson(classId: string, lessonId: string): Promise<void> {
  await LessonUnlock.deleteOne({
    classId: new Types.ObjectId(classId),
    lessonId: new Types.ObjectId(lessonId),
  })
}

export async function getUnlockedLessons(classId: string) {
  return LessonUnlock.find({ classId: new Types.ObjectId(classId) })
}

export async function archiveClass(id: string): Promise<IClass> {
  const classDoc = await Class.findById(id)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  if (classDoc.status === 'archived') {
    throw ApiError.badRequest('Class is already archived')
  }

  classDoc.status = 'archived'
  await classDoc.save()
  return classDoc
}
