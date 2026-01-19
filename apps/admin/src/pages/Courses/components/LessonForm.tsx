import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCreateLesson } from '@/hooks/queries/useCourses'

interface LessonFormProps {
  courseId: string
  sectionId: string
  onCancel: () => void
  onSuccess: () => void
}

export function LessonForm({ courseId, sectionId, onCancel, onSuccess }: LessonFormProps) {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  const createLesson = useCreateLesson()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Lesson title is required')
      return
    }

    try {
      await createLesson.mutateAsync({
        courseId,
        sectionId,
        title: title.trim(),
      })
      onSuccess()
    } catch {
      setError('Failed to create lesson')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex-1">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (error) setError('')
          }}
          placeholder="Enter lesson title"
          error={!!error}
          autoFocus
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={createLesson.isPending}>
        Cancel
      </Button>
      <Button type="submit" size="sm" isLoading={createLesson.isPending}>
        Create
      </Button>
    </form>
  )
}
