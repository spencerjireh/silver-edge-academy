import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface IStudentProfile extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  parentIds: Types.ObjectId[]
  classId?: Types.ObjectId
  currentLevel: number
  totalXp: number
  currencyBalance: number
  currentStreakDays: number
  longestStreak: number
  lastActivityDate?: Date
  preferences: {
    theme?: 'light' | 'dark' | 'system'
    editorTheme?: string
    fontSize?: number
  }
  createdAt: Date
  updatedAt: Date
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    parentIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    currentLevel: { type: Number, default: 1, min: 1 },
    totalXp: { type: Number, default: 0, min: 0 },
    currencyBalance: { type: Number, default: 0, min: 0 },
    currentStreakDays: { type: Number, default: 0, min: 0 },
    longestStreak: { type: Number, default: 0, min: 0 },
    lastActivityDate: Date,
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'] },
      editorTheme: String,
      fontSize: Number,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

studentProfileSchema.index({ classId: 1 })
studentProfileSchema.index({ currentLevel: -1 })
studentProfileSchema.index({ totalXp: -1 })

export const StudentProfile = model<IStudentProfile>('StudentProfile', studentProfileSchema)
