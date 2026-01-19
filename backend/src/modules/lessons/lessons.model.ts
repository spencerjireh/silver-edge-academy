import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ILesson extends Document {
  _id: Types.ObjectId
  sectionId: Types.ObjectId
  title: string
  content: string
  orderIndex: number
  status: 'draft' | 'published'
  codeMode: 'visual' | 'text' | 'mixed'
  editorComplexity: 'simplified' | 'standard' | 'advanced'
  starterCode?: string
  duration?: number
  xpReward: number
  lockedBy?: Types.ObjectId
  lockedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const lessonSchema = new Schema<ILesson>(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    content: { type: String, default: '', maxlength: 50000 },
    orderIndex: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    codeMode: {
      type: String,
      enum: ['visual', 'text', 'mixed'],
      default: 'text',
    },
    editorComplexity: {
      type: String,
      enum: ['simplified', 'standard', 'advanced'],
      default: 'standard',
    },
    starterCode: { type: String, maxlength: 10000 },
    duration: { type: Number, default: 15 },
    xpReward: { type: Number, default: 10 },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lockedAt: Date,
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

lessonSchema.index({ sectionId: 1, orderIndex: 1 })
lessonSchema.index({ status: 1 })

export const Lesson = model<ILesson>('Lesson', lessonSchema)
