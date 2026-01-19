import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCreateSection, useUpdateSection } from '@/hooks/queries/useCourses'
import type { CourseSection } from '@/services/api/courses'

interface SectionFormProps {
  courseId: string
  section?: CourseSection
  onCancel: () => void
  onSuccess: () => void
}

export function SectionForm({ courseId, section, onCancel, onSuccess }: SectionFormProps) {
  const isEditing = !!section
  const [title, setTitle] = useState(section?.title || '')
  const [description, setDescription] = useState(section?.description || '')
  const [error, setError] = useState('')

  const createSection = useCreateSection()
  const updateSection = useUpdateSection()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Section title is required')
      return
    }

    try {
      if (isEditing) {
        await updateSection.mutateAsync({
          courseId,
          sectionId: section.id,
          title: title.trim(),
          description: description.trim() || undefined,
        })
      } else {
        await createSection.mutateAsync({
          courseId,
          title: title.trim(),
          description: description.trim() || undefined,
        })
      }
      onSuccess()
    } catch {
      setError('Failed to save section')
    }
  }

  const isLoading = createSection.isPending || updateSection.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <label htmlFor="section-title" className="block text-sm font-medium text-slate-700 mb-1.5">
          Section Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="section-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error) setError('')
          }}
          placeholder="Enter section title"
          error={!!error}
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <div>
        <label htmlFor="section-description" className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="section-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this section"
          rows={2}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent resize-none text-sm"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isLoading}>
          {isEditing ? 'Save' : 'Create Section'}
        </Button>
      </div>
    </form>
  )
}
