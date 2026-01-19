import { Schema, model, Document, Types } from 'mongoose'
import { toJSONOptionsWithoutPassword } from '../../utils/mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  email?: string
  username?: string
  passwordHash: string
  role: 'admin' | 'teacher' | 'parent' | 'student'
  displayName: string
  avatarId?: string
  emailVerified: boolean
  status: 'active' | 'inactive'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'parent', 'student'],
      required: true,
    },
    displayName: { type: String, required: true, trim: true },
    avatarId: { type: String },
    emailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: toJSONOptionsWithoutPassword,
  }
)

userSchema.index({ role: 1 })
userSchema.index({ status: 1 })
userSchema.index({ email: 1, role: 1 })

export const User = model<IUser>('User', userSchema)
