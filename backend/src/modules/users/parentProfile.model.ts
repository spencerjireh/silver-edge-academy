import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface IParentProfile extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  childIds: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const parentProfileSchema = new Schema<IParentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    childIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

export const ParentProfile = model<IParentProfile>('ParentProfile', parentProfileSchema)
