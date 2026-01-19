import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ILessonUnlock extends Document {
  _id: Types.ObjectId
  lessonId: Types.ObjectId
  classId: Types.ObjectId
  studentId?: Types.ObjectId
  unlockedBy: Types.ObjectId
  unlockedAt: Date
  expiresAt?: Date
}

const lessonUnlockSchema = new Schema<ILessonUnlock>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User' },
    unlockedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    unlockedAt: { type: Date, default: Date.now },
    expiresAt: Date,
  },
  {
    toJSON: toJSONOptions,
  }
)

lessonUnlockSchema.index({ lessonId: 1, classId: 1 }, { unique: true })
lessonUnlockSchema.index({ classId: 1 })

export const LessonUnlock = model<ILessonUnlock>('LessonUnlock', lessonUnlockSchema)
