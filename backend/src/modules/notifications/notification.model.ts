import { Schema, model, Document, Types } from 'mongoose'
import { toJSONOptions } from '../../utils/mongoose'

export type NotificationType = 'help_response' | 'badge_earned' | 'level_up' | 'streak' | 'general'

export interface INotification extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  type: NotificationType
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['help_response', 'badge_earned', 'level_up', 'streak', 'general'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

// Compound index for common queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

// TTL index to auto-delete old notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const Notification = model<INotification>('Notification', notificationSchema)
