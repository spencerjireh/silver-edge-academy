import { Schema, model, Document, Types } from 'mongoose'

import { toJSONOptions } from '../../utils/mongoose'

export interface IAttendance extends Document {
  _id: Types.ObjectId
  classId: Types.ObjectId
  studentId: Types.ObjectId
  date: Date
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  recordedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      required: true,
    },
    notes: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

attendanceSchema.index({ classId: 1, studentId: 1, date: 1 }, { unique: true })
attendanceSchema.index({ classId: 1, date: 1 })

export const Attendance = model<IAttendance>('Attendance', attendanceSchema)
