import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface IClass extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  color: string
  teacherId?: Types.ObjectId
  studentIds: Types.ObjectId[]
  courseIds: Types.ObjectId[]
  startDate?: Date
  endDate?: Date
  status: 'active' | 'archived' | 'draft'
  createdAt: Date
  updatedAt: Date
}

const classSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, default: '#6366f1' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    studentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'archived', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

classSchema.index({ teacherId: 1 })
classSchema.index({ status: 1 })

export const Class = model<IClass>('Class', classSchema)
