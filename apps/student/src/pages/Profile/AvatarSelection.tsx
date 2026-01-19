import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useProfile, useUpdateAvatar } from '@/hooks/queries/useProfile'
import { useToast } from '@/contexts/ToastContext'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'

// Available avatar options
const avatarOptions = [
  { id: 'robot', label: 'Robot' },
  { id: 'cat', label: 'Cat' },
  { id: 'dog', label: 'Dog' },
  { id: 'astronaut', label: 'Astronaut' },
  { id: 'wizard', label: 'Wizard' },
  { id: 'ninja', label: 'Ninja' },
  { id: 'superhero', label: 'Superhero' },
  { id: 'alien', label: 'Alien' },
  { id: 'dragon', label: 'Dragon' },
  { id: 'unicorn', label: 'Unicorn' },
  { id: 'pirate', label: 'Pirate' },
  { id: 'scientist', label: 'Scientist' },
]

export default function AvatarSelection() {
  const navigate = useNavigate()
  const { data: profileData, isLoading } = useProfile()
  const updateAvatarMutation = useUpdateAvatar()
  const { addToast } = useToast()

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <Skeleton key={i} variant="rectangular" className="aspect-square" />
          ))}
        </div>
      </div>
    )
  }

  const currentAvatar = selectedAvatar || profileData?.profile.avatarId || 'robot'

  const handleSave = async () => {
    if (!selectedAvatar) return

    try {
      await updateAvatarMutation.mutateAsync(selectedAvatar)
      addToast({ type: 'success', message: 'Avatar updated!' })
      navigate('/profile')
    } catch {
      addToast({ type: 'error', message: 'Failed to update avatar' })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Choose Avatar</h1>
      </div>

      {/* Current selection preview */}
      <Card padding="md" className="text-center">
        <p className="text-sm text-slate-500 mb-3">Preview</p>
        <Avatar
          avatarId={currentAvatar}
          displayName={profileData?.profile.displayName || 'Student'}
          size="xl"
          className="mx-auto"
        />
        <p className="mt-2 font-medium text-slate-800">
          {avatarOptions.find((a) => a.id === currentAvatar)?.label || 'Robot'}
        </p>
      </Card>

      {/* Avatar grid */}
      <Card padding="md">
        <CardTitle className="mb-4">Available Avatars</CardTitle>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {avatarOptions.map((avatar) => {
            const isSelected = currentAvatar === avatar.id
            const isOwned = true // In a real app, check against owned avatars

            return (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                disabled={!isOwned}
                className={cn(
                  'relative flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-transparent bg-slate-50 hover:bg-slate-100',
                  !isOwned && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Avatar avatarId={avatar.id} displayName={avatar.label} size="lg" />
                <span className="mt-2 text-sm font-medium text-slate-700">{avatar.label}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => navigate('/profile')} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!selectedAvatar || selectedAvatar === profileData?.profile.avatarId}
          isLoading={updateAvatarMutation.isPending}
          className="flex-1"
        >
          Save Avatar
        </Button>
      </div>
    </div>
  )
}
