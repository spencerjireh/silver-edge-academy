import { z } from 'zod'

const quizQuestionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['multiple-choice', 'true-false', 'code-output']),
  question: z.string().min(1),
  codeSnippet: z.string().optional(),
  options: z.array(z.string()).min(2),
  correctIndex: z.number().min(0),
  explanation: z.string().optional(),
  orderIndex: z.number().min(0),
})

export const createQuizSchema = z.object({
  title: z.string().min(1).max(100),
  questions: z.array(quizQuestionSchema).min(1),
  xpReward: z.number().min(0).optional(),
})

export const updateQuizSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  questions: z.array(quizQuestionSchema).min(1).optional(),
  xpReward: z.number().min(0).optional(),
})

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().min(0),
    })
  ),
})

export const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
})

export const quizIdParamSchema = z.object({
  lessonId: z.string().min(1),
  quizId: z.string().min(1),
})

export const quizOnlyIdParamSchema = z.object({
  id: z.string().min(1),
})

export type CreateQuizInput = z.infer<typeof createQuizSchema>
export type UpdateQuizInput = z.infer<typeof updateQuizSchema>
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>
