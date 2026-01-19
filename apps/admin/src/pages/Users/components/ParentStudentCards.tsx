import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { useParents, useStudents } from '@/hooks/queries/useUsers'

export function ParentCards({ studentId }: { studentId: string }) {
  const location = useLocation()
  const parentsQuery = useParents({ page: 1, limit: 100 })
  const allParents = parentsQuery.data?.data || []
  const studentsQuery = useStudents({ page: 1, limit: 100 })
  const allStudents = studentsQuery.data?.data || []
  const currentStudent = allStudents.find((s) => s.id === studentId)

  const linkedParentIds = currentStudent?.parentIds || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {linkedParentIds.map((parentId) => {
        const parent = allParents.find((p) => p.id === parentId)
        if (!parent) return null
        return (
          <Link key={parent.id} to={`/admin/parents/${parent.id}`} state={{ from: location.pathname }}>
            <div className="group bg-white border border-slate-200 hover:border-accent-500 rounded-lg p-4 cursor-pointer transition-colors duration-200">
              <div className="flex items-start gap-3">
                <Avatar name={parent.displayName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-slate-800 truncate">{parent.displayName}</h5>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-slate-500 truncate">{parent.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {parent.childIds.length} children
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export function StudentCards({ parentId }: { parentId: string }) {
  const location = useLocation()
  const studentsQuery = useStudents({ page: 1, limit: 100 })
  const allStudents = studentsQuery.data?.data || []
  const parentsQuery = useParents({ page: 1, limit: 100 })
  const allParents = parentsQuery.data?.data || []
  const currentParent = allParents.find((p) => p.id === parentId)

  const linkedStudentIds = currentParent?.studentIds || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {linkedStudentIds.map((studentId) => {
        const student = allStudents.find((s) => s.id === studentId)
        if (!student) return null
        return (
          <Link key={student.id} to={`/admin/students/${student.id}`} state={{ from: location.pathname }}>
            <div className="group bg-white border border-slate-200 hover:border-accent-500 rounded-lg p-4 cursor-pointer transition-colors duration-200">
              <div className="flex items-start gap-3">
                <Avatar name={student.displayName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-slate-800 truncate">{student.displayName}</h5>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-slate-500 truncate">{student.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {student.studentNumber}
                    </span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Lv. {student.currentLevel}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      {student.totalXp} XP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={student.status} />
                    <p className="text-xs text-slate-400 truncate">{student.className}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
