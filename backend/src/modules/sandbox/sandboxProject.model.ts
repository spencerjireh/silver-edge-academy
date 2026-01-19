import { Schema, model, Document, Types } from 'mongoose'
import { toJSONOptions } from '../../utils/mongoose'

export interface ISandboxProject extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  name: string
  description?: string
  language: 'javascript' | 'python'
  code: string
  createdAt: Date
  updatedAt: Date
}

const sandboxProjectSchema = new Schema<ISandboxProject>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    language: {
      type: String,
      enum: ['javascript', 'python'],
      required: true,
      default: 'javascript',
    },
    code: {
      type: String,
      default: '',
      maxlength: 50000, // 50KB limit per project
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

// Compound index for listing user's projects
sandboxProjectSchema.index({ studentId: 1, updatedAt: -1 })

// Limit projects per student (enforced in service)
sandboxProjectSchema.statics.MAX_PROJECTS_PER_STUDENT = 10

export const SandboxProject = model<ISandboxProject>('SandboxProject', sandboxProjectSchema)
