import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { formatDate, formatNumber } from '@/utils/formatters'
import type { ColumnDef } from '@/components/ui/DataTable'
import type { Student } from '@/services/api/users'

export const studentColumns: ColumnDef<Student>[] = [
  {
    key: 'displayName',
    header: 'Name',
    sortable: true,
    render: (s) => (
      <div className="flex items-center gap-3">
        <Avatar name={s.displayName} />
        <span className="font-medium text-slate-800">{s.displayName}</span>
      </div>
    ),
  },
  {
    key: 'username',
    header: 'Username',
    sortable: true,
    className: 'text-sm text-slate-600 font-mono',
    render: (s) => s.username,
  },
  {
    key: 'className',
    header: 'Class',
    sortable: true,
    render: (s) => (
      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
        {s.className}
      </span>
    ),
  },
  {
    key: 'currentLevel',
    header: 'Level',
    sortable: true,
    render: (s) => <span className="text-sm font-medium text-slate-800">Lv. {s.currentLevel}</span>,
  },
  {
    key: 'totalXp',
    header: 'XP',
    sortable: true,
    className: 'text-sm text-slate-600',
    render: (s) => `${formatNumber(s.totalXp)} XP`,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (s) => <StatusBadge status={s.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created',
    sortable: true,
    className: 'text-sm text-slate-500',
    render: (s) => formatDate(s.createdAt),
  },
]
