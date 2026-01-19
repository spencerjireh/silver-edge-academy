import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ITeacherProfile extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  classIds: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const teacherProfileSchema = new Schema<ITeacherProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    classIds: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

export const TeacherProfile = model<ITeacherProfile>('TeacherProfile', teacherProfileSchema)
