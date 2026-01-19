import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ILessonProgress extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  lessonId: Types.ObjectId
  status: 'not_started' | 'in_progress' | 'completed'
  startedAt?: Date
  completedAt?: Date
  timeSpentSeconds: number
  xpEarned: number
  createdAt: Date
  updatedAt: Date
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    startedAt: Date,
    completedAt: Date,
    timeSpentSeconds: { type: Number, default: 0, min: 0 },
    xpEarned: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

lessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true })
lessonProgressSchema.index({ studentId: 1, status: 1 })

export const LessonProgress = model<ILessonProgress>('LessonProgress', lessonProgressSchema)
