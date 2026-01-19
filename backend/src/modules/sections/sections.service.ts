import { Types } from 'mongoose'
import { Section, type ISection } from './sections.model'
import { Course } from '../courses/courses.model'
import { Lesson } from '../lessons/lessons.model'
import { ApiError } from '../../utils/ApiError'
import type { CreateSectionInput, UpdateSectionInput } from './sections.schema'

export async function listSections(courseId: string): Promise<ISection[]> {
  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  return Section.find({ courseId: new Types.ObjectId(courseId) }).sort({ orderIndex: 1 })
}

export async function getSectionById(courseId: string, sectionId: string): Promise<ISection> {
  const section = await Section.findOne({
    _id: new Types.ObjectId(sectionId),
    courseId: new Types.ObjectId(courseId),
  })
  if (!section) {
    throw ApiError.notFound('Section')
  }
  return section
}

export async function createSection(
  courseId: string,
  input: CreateSectionInput
): Promise<ISection> {
  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  // Get max order index
  let orderIndex = input.orderIndex
  if (orderIndex === undefined) {
    const maxSection = await Section.findOne({ courseId: new Types.ObjectId(courseId) })
      .sort({ orderIndex: -1 })
      .select('orderIndex')
    orderIndex = maxSection ? maxSection.orderIndex + 1 : 0
  }

  return Section.create({
    ...input,
    courseId: new Types.ObjectId(courseId),
    orderIndex,
  })
}

export async function updateSection(
  courseId: string,
  sectionId: string,
  input: UpdateSectionInput
): Promise<ISection> {
  const section = await Section.findOne({
    _id: new Types.ObjectId(sectionId),
    courseId: new Types.ObjectId(courseId),
  })
  if (!section) {
    throw ApiError.notFound('Section')
  }

  Object.assign(section, input)
  await section.save()
  return section
}

export async function deleteSection(courseId: string, sectionId: string): Promise<void> {
  const section = await Section.findOne({
    _id: new Types.ObjectId(sectionId),
    courseId: new Types.ObjectId(courseId),
  })
  if (!section) {
    throw ApiError.notFound('Section')
  }

  // Delete all lessons in this section
  await Lesson.deleteMany({ sectionId: section._id })
  await section.deleteOne()

  // Reorder remaining sections
  await Section.updateMany(
    { courseId: new Types.ObjectId(courseId), orderIndex: { $gt: section.orderIndex } },
    { $inc: { orderIndex: -1 } }
  )
}

export async function reorderSections(courseId: string, sectionIds: string[]): Promise<void> {
  const course = await Course.findById(courseId)
  if (!course) {
    throw ApiError.notFound('Course')
  }

  // Verify all sections belong to this course
  const sections = await Section.find({ courseId: new Types.ObjectId(courseId) })
  const existingIds = new Set(sections.map((s) => s._id.toString()))

  for (const id of sectionIds) {
    if (!existingIds.has(id)) {
      throw ApiError.badRequest(`Section ${id} does not belong to this course`)
    }
  }

  // Update order indexes
  await Promise.all(
    sectionIds.map((id, index) =>
      Section.findByIdAndUpdate(id, { orderIndex: index })
    )
  )
}
