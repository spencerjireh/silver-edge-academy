import { Schema, model, Document, Types } from 'mongoose'
import { toJSONOptions } from '../../utils/mongoose'
import type { BadgeTriggerType } from '@silveredge/shared'

export interface IBadge extends Document {
  _id: Types.ObjectId
  name: string
  description: string
  iconName: string
  gradientFrom: string
  gradientTo: string
  triggerType: BadgeTriggerType
  triggerValue?: number
  isActive: boolean
  earnedCount: number
  createdAt: Date
  updatedAt: Date
}

const badgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    iconName: { type: String, required: true },
    gradientFrom: { type: String, required: true, default: '#6366f1' },
    gradientTo: { type: String, required: true, default: '#8b5cf6' },
    triggerType: {
      type: String,
      enum: [
        'first_login',
        'first_lesson',
        'first_exercise',
        'first_quiz',
        'first_sandbox',
        'lessons_completed',
        'exercises_passed',
        'courses_finished',
        'login_streak',
        'xp_earned',
        'level_reached',
      ],
      required: true,
    },
    triggerValue: { type: Number },
    isActive: { type: Boolean, default: true },
    earnedCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

badgeSchema.index({ triggerType: 1 })
badgeSchema.index({ isActive: 1 })

export const Badge = model<IBadge>('Badge', badgeSchema)

// Student Badge (many-to-many relationship)
export interface IStudentBadge extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  badgeId: Types.ObjectId
  earnedAt: Date
}

const studentBadgeSchema = new Schema<IStudentBadge>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
  }
)

studentBadgeSchema.index({ studentId: 1 })
studentBadgeSchema.index({ badgeId: 1 })
studentBadgeSchema.index({ studentId: 1, badgeId: 1 }, { unique: true })

export const StudentBadge = model<IStudentBadge>('StudentBadge', studentBadgeSchema)
