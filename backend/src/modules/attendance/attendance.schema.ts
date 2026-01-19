import { z } from 'zod'

export const markAttendanceSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['present', 'absent', 'late', 'excused']),
      notes: z.string().optional(),
    })
  ),
  date: z.string().datetime().optional(),
})

export const listAttendanceQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  studentId: z.string().optional(),
})

export const classIdParamSchema = z.object({
  id: z.string().min(1),
})

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>
