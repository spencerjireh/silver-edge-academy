import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface IQuizAnswer {
  questionId: string
  selectedIndex: number
  isCorrect: boolean
}

export interface IQuizSubmission extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  lessonId: Types.ObjectId
  quizId: Types.ObjectId
  answers: IQuizAnswer[]
  score: number
  maxScore: number
  passed: boolean
  xpEarned: number
  submittedAt: Date
}

const quizAnswerSchema = new Schema<IQuizAnswer>(
  {
    questionId: { type: String, required: true },
    selectedIndex: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
)

const quizSubmissionSchema = new Schema<IQuizSubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [quizAnswerSchema],
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    passed: { type: Boolean, required: true },
    xpEarned: { type: Number, default: 0, min: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
  }
)

quizSubmissionSchema.index({ studentId: 1, quizId: 1, submittedAt: -1 })

export const QuizSubmission = model<IQuizSubmission>('QuizSubmission', quizSubmissionSchema)
