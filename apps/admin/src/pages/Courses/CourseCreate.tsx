import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FileCode, Check } from 'lucide-react'
import { FormSection } from '@/components/forms/FormSection'
import { FormField } from '@/components/forms/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCreateCourse } from '@/hooks/queries/useCourses'

export default function CourseCreate() {
  const navigate = useNavigate()
  const createCourse = useCreateCourse()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript' as 'javascript' | 'python',
    status: 'draft' as 'draft' | 'published',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await createCourse.mutateAsync(formData)
      navigate('/admin/courses')
    } catch {
      setErrors({ submit: 'Failed to create course. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Course Details */}
      <FormSection title="Course Details">
        <FormField label="Course Title" required error={errors.title}>
          <Input
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., JavaScript Basics"
            error={!!errors.title}
          />
        </FormField>

        <FormField label="Description" hint="Optional. Visible to teachers and students.">
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe what students will learn in this course..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none"
          />
        </FormField>
      </FormSection>

      {/* Programming Language */}
      <FormSection
        title="Programming Language"
        description="All lessons and exercises in this course will use this language."
      >
        <div className="grid grid-cols-2 gap-4">
          <label className="cursor-pointer">
            <input
              type="radio"
              name="language"
              value="javascript"
              checked={formData.language === 'javascript'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="hidden"
            />
            <div
              className={`border-2 rounded-xl p-4 transition-all ${
                formData.language === 'javascript'
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-amber-600" />
                </div>
                {formData.language === 'javascript' && (
                  <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-slate-800">JavaScript</h4>
              <p className="text-sm text-slate-500">Web development, games, interactive apps</p>
            </div>
          </label>

          <label className="cursor-pointer">
            <input
              type="radio"
              name="language"
              value="python"
              checked={formData.language === 'python'}
              onChange={(e) => handleChange('language', e.target.value)}
              className="hidden"
            />
            <div
              className={`border-2 rounded-xl p-4 transition-all ${
                formData.language === 'python'
                  ? 'border-accent-600 bg-accent-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-sky-600" />
                </div>
                {formData.language === 'python' && (
                  <div className="w-6 h-6 bg-accent-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h4 className="font-semibold text-slate-800">Python</h4>
              <p className="text-sm text-slate-500">Data science, automation, general programming</p>
            </div>
          </label>
        </div>
      </FormSection>

      {/* Publication Status */}
      <FormSection
        title="Publication Status"
        description="Draft courses are only visible to admins and teachers."
      >
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === 'draft'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Draft</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="published"
              checked={formData.status === 'published'}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-4 h-4 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-slate-700">Published</span>
          </label>
        </div>
      </FormSection>

      {/* Form Actions */}
      {errors.submit && <p className="text-sm text-red-600">{errors.submit}</p>}

      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          to="/admin/courses"
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        >
          Cancel
        </Link>
        <Button type="submit" isLoading={createCourse.isPending}>
          Create Course
        </Button>
      </div>
    </form>
  )
}
