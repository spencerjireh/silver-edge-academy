import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ITestCase {
  id: string
  input: string
  expectedOutput: string
  isHidden: boolean
}

export interface IExercise extends Document {
  _id: Types.ObjectId
  lessonId: Types.ObjectId
  title: string
  instructions: string
  orderIndex: number
  starterCode?: string
  solution: string
  testCases: ITestCase[]
  xpReward: number
  createdAt: Date
  updatedAt: Date
}

const testCaseSchema = new Schema<ITestCase>(
  {
    id: { type: String, required: true },
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
  },
  { _id: false }
)

const exerciseSchema = new Schema<IExercise>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    instructions: { type: String, required: true, maxlength: 5000 },
    orderIndex: { type: Number, required: true, min: 0 },
    starterCode: { type: String, maxlength: 10000 },
    solution: { type: String, required: true, maxlength: 10000 },
    testCases: [testCaseSchema],
    xpReward: { type: Number, default: 15 },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

exerciseSchema.index({ lessonId: 1, orderIndex: 1 })

export const Exercise = model<IExercise>('Exercise', exerciseSchema)
