import { Types } from 'mongoose'
import { Attendance, type IAttendance } from './attendance.model'
import { Class } from '../classes/classes.model'
import { ApiError } from '../../utils/ApiError'
import type { MarkAttendanceInput, ListAttendanceQuery } from './attendance.schema'

export async function listAttendance(
  classId: string,
  query: ListAttendanceQuery
): Promise<IAttendance[]> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const filter: Record<string, unknown> = { classId: new Types.ObjectId(classId) }

  if (query.startDate || query.endDate) {
    filter.date = {}
    if (query.startDate) {
      (filter.date as Record<string, Date>).$gte = new Date(query.startDate)
    }
    if (query.endDate) {
      (filter.date as Record<string, Date>).$lte = new Date(query.endDate)
    }
  }

  if (query.studentId) {
    filter.studentId = new Types.ObjectId(query.studentId)
  }

  return Attendance.find(filter)
    .sort({ date: -1 })
    .populate('studentId', 'displayName username')
    .populate('recordedBy', 'displayName')
}

export async function markAttendance(
  classId: string,
  input: MarkAttendanceInput,
  recordedBy: string
): Promise<IAttendance[]> {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const date = input.date ? new Date(input.date) : new Date()
  // Normalize to start of day
  date.setHours(0, 0, 0, 0)

  const results: IAttendance[] = []

  for (const record of input.records) {
    // Verify student is in class
    if (!classDoc.studentIds.some((id) => id.toString() === record.studentId)) {
      throw ApiError.badRequest(`Student ${record.studentId} is not in this class`)
    }

    // Upsert attendance record
    const attendance = await Attendance.findOneAndUpdate(
      {
        classId: new Types.ObjectId(classId),
        studentId: new Types.ObjectId(record.studentId),
        date,
      },
      {
        status: record.status,
        notes: record.notes,
        recordedBy: new Types.ObjectId(recordedBy),
      },
      { upsert: true, new: true }
    )

    results.push(attendance)
  }

  return results
}

export async function getAttendanceSummary(classId: string, studentId?: string) {
  const classDoc = await Class.findById(classId)
  if (!classDoc) {
    throw ApiError.notFound('Class')
  }

  const matchFilter: Record<string, unknown> = { classId: new Types.ObjectId(classId) }
  if (studentId) {
    matchFilter.studentId = new Types.ObjectId(studentId)
  }

  const summary = await Attendance.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: studentId ? null : '$studentId',
        totalDays: { $sum: 1 },
        presentDays: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        absentDays: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        lateDays: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
        excusedDays: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
      },
    },
    {
      $project: {
        studentId: studentId ? studentId : '$_id',
        classId,
        totalDays: 1,
        presentDays: 1,
        absentDays: 1,
        lateDays: 1,
        excusedDays: 1,
        attendanceRate: {
          $cond: [
            { $eq: ['$totalDays', 0] },
            0,
            {
              $multiply: [
                { $divide: [{ $add: ['$presentDays', '$lateDays'] }, '$totalDays'] },
                100,
              ],
            },
          ],
        },
      },
    },
  ])

  return studentId ? summary[0] || null : summary
}
