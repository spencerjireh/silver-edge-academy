import { Schema, model, Document, Types } from 'mongoose'
import { toJSONOptions } from '../../utils/mongoose'

export type HelpRequestStatus = 'pending' | 'in_progress' | 'resolved' | 'closed'

export interface IHelpRequest extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  classId?: Types.ObjectId
  lessonId: Types.ObjectId
  exerciseId?: Types.ObjectId
  message: string
  codeSnapshot?: string
  status: HelpRequestStatus
  assignedTeacherId?: Types.ObjectId
  response?: string
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const helpRequestSchema = new Schema<IHelpRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    codeSnapshot: {
      type: String,
      maxlength: 10000,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },
    assignedTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    response: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    respondedAt: Date,
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

// Compound indexes for common queries
helpRequestSchema.index({ studentId: 1, createdAt: -1 })
helpRequestSchema.index({ classId: 1, status: 1 })
helpRequestSchema.index({ assignedTeacherId: 1, status: 1 })

export const HelpRequest = model<IHelpRequest>('HelpRequest', helpRequestSchema)
