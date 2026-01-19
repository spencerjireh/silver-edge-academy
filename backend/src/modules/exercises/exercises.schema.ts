import { z } from 'zod'
import {
  EXERCISE_TITLE_MAX_LENGTH,
  EXERCISE_INSTRUCTIONS_MAX_LENGTH,
  CODE_MAX_LENGTH,
} from '@silveredge/shared'

const testCaseSchema = z.object({
  id: z.string().min(1),
  input: z.string().default(''),
  expectedOutput: z.string().min(1),
  isHidden: z.boolean().default(false),
})

export const createExerciseSchema = z.object({
  title: z.string().min(1).max(EXERCISE_TITLE_MAX_LENGTH),
  instructions: z.string().min(1).max(EXERCISE_INSTRUCTIONS_MAX_LENGTH),
  orderIndex: z.number().min(0).optional(),
  starterCode: z.string().max(CODE_MAX_LENGTH).optional(),
  solution: z.string().max(CODE_MAX_LENGTH),
  testCases: z.array(testCaseSchema).min(1),
  xpReward: z.number().min(0).optional(),
})

export const updateExerciseSchema = z.object({
  title: z.string().min(1).max(EXERCISE_TITLE_MAX_LENGTH).optional(),
  instructions: z.string().min(1).max(EXERCISE_INSTRUCTIONS_MAX_LENGTH).optional(),
  orderIndex: z.number().min(0).optional(),
  starterCode: z.string().max(CODE_MAX_LENGTH).optional(),
  solution: z.string().max(CODE_MAX_LENGTH).optional(),
  testCases: z.array(testCaseSchema).min(1).optional(),
  xpReward: z.number().min(0).optional(),
})

export const submitExerciseSchema = z.object({
  code: z.string().max(CODE_MAX_LENGTH),
  testResults: z.array(
    z.object({
      testCaseId: z.string(),
      passed: z.boolean(),
      actualOutput: z.string().optional(),
      error: z.string().optional(),
    })
  ),
})

export const lessonIdParamSchema = z.object({
  lessonId: z.string().min(1),
})

export const exerciseIdParamSchema = z.object({
  lessonId: z.string().min(1),
  exerciseId: z.string().min(1),
})

export const exerciseOnlyIdParamSchema = z.object({
  id: z.string().min(1),
})

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>
export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>
