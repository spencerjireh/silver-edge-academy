import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export type QuestionType = 'multiple-choice' | 'true-false' | 'code-output'

export interface IQuizQuestion {
  id: string
  type: QuestionType
  question: string
  codeSnippet?: string
  options: string[]
  correctIndex: number
  explanation?: string
  orderIndex: number
}

export interface IQuiz extends Document {
  _id: Types.ObjectId
  lessonId: Types.ObjectId
  title: string
  questions: IQuizQuestion[]
  xpReward: number
  createdAt: Date
  updatedAt: Date
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'code-output'],
      required: true,
    },
    question: { type: String, required: true },
    codeSnippet: String,
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: String,
    orderIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const quizSchema = new Schema<IQuiz>(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true, trim: true },
    questions: [quizQuestionSchema],
    xpReward: { type: Number, default: 25 },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

quizSchema.index({ lessonId: 1 })

export const Quiz = model<IQuiz>('Quiz', quizSchema)
