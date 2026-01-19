import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ISection extends Document {
  _id: Types.ObjectId
  courseId: Types.ObjectId
  title: string
  description?: string
  orderIndex: number
  createdAt: Date
  updatedAt: Date
}

const sectionSchema = new Schema<ISection>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true },
    orderIndex: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

sectionSchema.index({ courseId: 1, orderIndex: 1 })

export const Section = model<ISection>('Section', sectionSchema)
