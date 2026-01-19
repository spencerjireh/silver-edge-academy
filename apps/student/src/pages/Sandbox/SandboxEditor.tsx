import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Settings } from 'lucide-react'
import { useSandboxProject, useUpdateSandboxProject } from '@/hooks/queries/useSandbox'
import { useCodeRunner } from '@/hooks/useCodeRunner'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { OutputPanel } from '@/components/editor/OutputPanel'
import type { SupportedLanguage } from '@/services/codeRunner/types'

export default function SandboxEditor() {
  const { projectId } = useParams<{ projectId: string }>()
  const { data: project, isLoading, error } = useSandboxProject(projectId)
  const updateMutation = useUpdateSandboxProject()
  const { addToast } = useToast()

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Use the code runner hook with the project language
  const language = (project?.language ?? 'javascript') as SupportedLanguage
  const { run, stop, clear, outputs, isRunning, state } = useCodeRunner({ language })

  useEffect(() => {
    if (project) {
      setCode(project.code)
      setName(project.name)
      setDescription(project.description || '')
    }
  }, [project])

  useEffect(() => {
    if (project) {
      setHasChanges(
        code !== project.code ||
        name !== project.name ||
        description !== (project.description || '')
      )
    }
  }, [code, name, description, project])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton variant="rectangular" className="h-96 w-full" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load project</p>
        <Link to="/sandbox" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to sandbox
        </Link>
      </div>
    )
  }

  const handleRun = () => {
    run(code)
  }

  const handleStop = () => {
    stop()
  }

  const handleReset = () => {
    setCode(project.code)
    clear()
  }

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        data: { code, name, description: description || undefined },
      })
      setShowSaveModal(false)
      addToast({ type: 'success', message: 'Project saved!' })
    } catch {
      addToast({ type: 'error', message: 'Failed to save project' })
    }
  }

  const handleQuickSave = async () => {
    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        data: { code },
      })
      addToast({ type: 'success', message: 'Code saved!' })
    } catch {
      addToast({ type: 'error', message: 'Failed to save' })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/sandbox"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800">{name}</h1>
              <Badge variant={project.language === 'javascript' ? 'warning' : 'primary'} size="sm">
                {project.language === 'javascript' ? 'JS' : 'PY'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleQuickSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={() => setShowSaveModal(true)}>
            <Settings className="w-4 h-4 mr-1" />
            Edit Details
          </Button>
        </div>
      </div>

      {/* Editor */}
      <EditorToolbar
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleReset}
        isRunning={isRunning}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          code={code}
          onChange={setCode}
          language={project.language}
          className="min-h-[400px]"
        />
        <OutputPanel
          outputs={outputs}
          status={state.status}
          executionTime={state.executionTime}
          className="min-h-[400px]"
        />
      </div>

      {/* Save modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Project"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this project do?"
          />

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowSaveModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} isLoading={updateMutation.isPending} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
