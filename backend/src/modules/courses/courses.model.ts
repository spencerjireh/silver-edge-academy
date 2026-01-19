import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ICourse extends Document {
  _id: Types.ObjectId
  title: string
  description?: string
  language: 'javascript' | 'python'
  status: 'draft' | 'published'
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500 },
    language: {
      type: String,
      enum: ['javascript', 'python'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

courseSchema.index({ status: 1 })
courseSchema.index({ language: 1 })
courseSchema.index({ createdBy: 1 })

export const Course = model<ICourse>('Course', courseSchema)
