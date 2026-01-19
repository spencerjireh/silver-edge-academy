import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

interface TeacherFieldsProps {
  classes: string[]
  onChange: (classes: string[]) => void
}

export function TeacherFields({ classes, onChange }: TeacherFieldsProps) {
  return (
    <FormSection title="Class Assignment" description="Optionally assign this teacher to classes.">
      <FormField label="Assign to Classes" htmlFor="teacherClasses" hint="Hold Ctrl/Cmd to select multiple classes.">
        <Select
          id="teacherClasses"
          multiple
          className="h-32"
          value={classes}
          onChange={(e) => onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
        >
          <option value="5a">Class 5A</option>
          <option value="5b">Class 5B</option>
          <option value="6a">Class 6A</option>
          <option value="6b">Class 6B</option>
        </Select>
      </FormField>
    </FormSection>
  )
}

export function ParentFields() {
  return (
    <FormSection title="Link Children" description="Connect this parent account to student accounts.">
      <FormField
        label="Search Students"
        htmlFor="children"
        hint="You can link children after creating the account."
      >
        <Input id="children" placeholder="Search by student name or email..." />
      </FormField>
    </FormSection>
  )
}

interface StudentFieldsProps {
  classId: string
  parentIds: string[]
  onClassChange: (classId: string) => void
  onParentChange: (parentIds: string[]) => void
  error?: string
}

export function StudentFields({
  classId,
  parentIds,
  onClassChange,
  onParentChange,
  error,
}: StudentFieldsProps) {
  return (
    <FormSection title="Student Details" description="Additional information for student accounts.">
      <FormField label="Assign to Class" htmlFor="studentClass">
        <Select id="studentClass" value={classId} onChange={(e) => onClassChange(e.target.value)}>
          <option value="">No class assigned</option>
          <option value="5a">Class 5A - Maria Santos</option>
          <option value="5b">Class 5B - Maria Santos</option>
          <option value="6a">Class 6A - John Cruz</option>
          <option value="6b">Class 6B - John Cruz</option>
        </Select>
      </FormField>

      <FormField
        label="Link Parents"
        htmlFor="parentSelect"
        hint="Select at least one parent. Hold Ctrl/Cmd to select multiple."
        required
        error={error}
      >
        <Select
          id="parentSelect"
          multiple
          className="h-32"
          value={parentIds}
          onChange={(e) => onParentChange(Array.from(e.target.selectedOptions, (o) => o.value))}
        >
          <option value="p1">Robert Chen</option>
          <option value="p2">Jennifer Smith</option>
          <option value="p3">David Kim</option>
        </Select>
      </FormField>
    </FormSection>
  )
}

interface StatusSelectorProps {
  value: 'active' | 'inactive'
  onChange: (status: 'active' | 'inactive') => void
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  return (
    <FormSection title="Account Status" description="Inactive accounts cannot log in.">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="status"
            value="active"
            checked={value === 'active'}
            onChange={() => onChange('active')}
            className="w-4 h-4 text-accent-600 focus:ring-accent-500"
          />
          <span className="text-sm text-slate-700">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="status"
            value="inactive"
            checked={value === 'inactive'}
            onChange={() => onChange('inactive')}
            className="w-4 h-4 text-accent-600 focus:ring-accent-500"
          />
          <span className="text-sm text-slate-700">Inactive</span>
        </label>
      </div>
    </FormSection>
  )
}
