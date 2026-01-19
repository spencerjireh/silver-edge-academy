import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormSection } from '@/components/forms/FormSection'
import { FormField, FormRow } from '@/components/forms/FormField'
import { useUser, useUpdateUser } from '@/hooks/queries/useUsers'
import { useSetPageMeta } from '@/contexts/PageMetaContext'
import { FormSubmitError } from '@/hooks/useFormError'
import { validate, validators, userValidationRules, studentValidationRules } from '@/lib/validation'
import { getRolePath, getRoleDetailPath, type UserRole } from '@/lib/navigation'
import { StatusSelector } from './components/RoleFields'

interface FormData {
  firstName: string
  lastName: string
  email: string
  username: string
  status: 'active' | 'inactive'
  classes: string[]
  classId: string
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  status: 'active',
  classes: [],
  classId: '',
}

export default function UserEdit() {
  const { id } = useParams<{ id: string }>()
  const { data: user, isLoading } = useUser(id || '')

  useSetPageMeta({ entityLabel: user?.displayName })

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateUser = useUpdateUser()

  useEffect(() => {
    if (user) {
      const [firstName = '', ...rest] = user.displayName.split(' ')
      setFormData({
        firstName,
        lastName: rest.join(' '),
        email: user.email || '',
        username: user.role === 'student' ? (user as import('@/services/api/users').Student).username || '' : '',
        status: user.status,
        classes: [],
        classId: '',
      })
    }
  }, [user])

  const handleChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const isStudent = user?.role === 'student'
    const validationErrors = validate(formData, {
      firstName: userValidationRules.firstName,
      lastName: userValidationRules.lastName,
      ...(isStudent
        ? { email: [validators.email()], username: studentValidationRules.username }
        : { email: userValidationRules.email }),
    })
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validateForm() || !id || !user) return

    try {
      await updateUser.mutateAsync({
        id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || undefined,
        status: formData.status,
        ...(user.role === 'student' && { username: formData.username }),
      })
      window.location.href = getRoleDetailPath(user.role as UserRole, id)
    } catch {
      setSubmitError('Failed to update user. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">User not found</p>
        <Link to="/admin" className="text-accent-600 hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const role = user.role as UserRole

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Basic Information">
          <FormRow>
            <FormField label="First Name" htmlFor="firstName" required error={errors.firstName}>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={!!errors.firstName}
              />
            </FormField>
            <FormField label="Last Name" htmlFor="lastName" required error={errors.lastName}>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={!!errors.lastName}
              />
            </FormField>
          </FormRow>

          {role === 'student' && (
            <FormField label="Username" htmlFor="username" required error={errors.username} hint="Used for login. Letters, numbers, and underscores only.">
              <Input
                id="username"
                placeholder="student_username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                error={!!errors.username}
              />
            </FormField>
          )}

          <FormField label="Email Address" htmlFor="email" required={role !== 'student'} error={errors.email} hint={role === 'student' ? 'Optional. Students can login with username or email.' : undefined}>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={!!errors.email}
            />
          </FormField>
        </FormSection>

        {role === 'teacher' && (
          <FormSection title="Class Assignment" description="Manage this teacher's class assignments.">
            <FormField label="Assigned Classes" htmlFor="teacherClasses" hint="Hold Ctrl/Cmd to select multiple classes.">
              <Select
                id="teacherClasses"
                multiple
                className="h-32"
                value={formData.classes}
                onChange={(e) => handleChange('classes', Array.from(e.target.selectedOptions, (o) => o.value))}
              >
                <option value="5a">Class 5A</option>
                <option value="5b">Class 5B</option>
                <option value="6a">Class 6A</option>
                <option value="6b">Class 6B</option>
              </Select>
            </FormField>
          </FormSection>
        )}

        {role === 'student' && (
          <FormSection title="Student Details">
            <FormField label="Assigned Class" htmlFor="studentClass">
              <Select
                id="studentClass"
                value={formData.classId}
                onChange={(e) => handleChange('classId', e.target.value)}
              >
                <option value="">No class assigned</option>
                <option value="5a">Class 5A - Maria Santos</option>
                <option value="5b">Class 5B - Maria Santos</option>
                <option value="6a">Class 6A - John Cruz</option>
              </Select>
            </FormField>
          </FormSection>
        )}

        <StatusSelector value={formData.status} onChange={(s) => handleChange('status', s)} />

        <FormSubmitError error={submitError} />

        <div className="flex items-center justify-end gap-3 pt-4">
          <Link to={getRolePath(role)}>
            <Button type="button" variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" disabled={updateUser.isPending}>
            {updateUser.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
