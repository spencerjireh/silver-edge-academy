import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/utils/formatters'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { Teacher } from '@/services/api/users'

export const teacherColumns: ColumnDef<Teacher>[] = [
  {
    key: 'displayName',
    header: 'Name',
    sortable: true,
    render: (t) => (
      <div className="flex items-center gap-3">
        <Avatar name={t.displayName} />
        <span className="font-medium text-slate-800">{t.displayName}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    className: 'text-sm text-slate-600',
    render: (t) => t.email,
  },
  {
    key: 'classCount',
    header: 'Classes',
    sortable: true,
    className: 'text-sm text-slate-600',
    render: (t) => t.classCount,
  },
  {
    key: 'studentCount',
    header: 'Students',
    sortable: true,
    className: 'text-sm text-slate-600',
    render: (t) => t.studentCount,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (t) => <StatusBadge status={t.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    className: 'text-sm text-slate-500',
    render: (t) => formatDate(t.createdAt),
  },
]
