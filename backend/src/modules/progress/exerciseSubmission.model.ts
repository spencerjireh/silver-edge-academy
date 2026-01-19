import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface ITestResult {
  testCaseId: string
  passed: boolean
  actualOutput?: string
  error?: string
}

export interface IExerciseSubmission extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  exerciseId: Types.ObjectId
  code: string
  passed: boolean
  testResults: ITestResult[]
  xpEarned: number
  submittedAt: Date
}

const testResultSchema = new Schema<ITestResult>(
  {
    testCaseId: { type: String, required: true },
    passed: { type: Boolean, required: true },
    actualOutput: String,
    error: String,
  },
  { _id: false }
)

const exerciseSubmissionSchema = new Schema<IExerciseSubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    code: { type: String, required: true },
    passed: { type: Boolean, required: true },
    testResults: [testResultSchema],
    xpEarned: { type: Number, default: 0, min: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
  }
)

exerciseSubmissionSchema.index({ studentId: 1, exerciseId: 1, submittedAt: -1 })

export const ExerciseSubmission = model<IExerciseSubmission>(
  'ExerciseSubmission',
  exerciseSubmissionSchema
)
