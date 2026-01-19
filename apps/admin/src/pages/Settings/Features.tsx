import { useState, useEffect, useMemo } from 'react'
import {
  Code,
  Globe,
  Puzzle,
  Palette,
  HelpCircle,
  Flame,
  AlertTriangle,
  Save,
} from 'lucide-react'
import { useFeatureToggles, useBatchUpdateFeatures } from '@/hooks/queries/useSettings'
import { featureList, type FeatureKey } from '@/services/api/settings'
import { Button } from '@/components/ui/Button'
import type { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  globe: Globe,
  puzzle: Puzzle,
  palette: Palette,
  'help-circle': HelpCircle,
  flame: Flame,
}

const colorMap: Record<string, { bg: string; text: string }> = {
  accent: { bg: 'bg-accent-100', text: 'text-accent-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
  sky: { bg: 'bg-sky-100', text: 'text-sky-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

type PendingChanges = Record<FeatureKey, boolean>

export default function Features() {
  const { data: features, isLoading } = useFeatureToggles()
  const batchUpdate = useBatchUpdateFeatures()

  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({} as PendingChanges)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    featureKey: FeatureKey | null
    featureName: string
  }>({
    isOpen: false,
    featureKey: null,
    featureName: '',
  })

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!features) return false
    return Object.keys(pendingChanges).some(
      (key) => pendingChanges[key as FeatureKey] !== features[key as FeatureKey]
    )
  }, [pendingChanges, features])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  // Initialize pending changes when features load
  useEffect(() => {
    if (features) {
      setPendingChanges(features)
    }
  }, [features])

  const handleToggle = (key: FeatureKey, currentlyEnabled: boolean, name: string) => {
    if (currentlyEnabled) {
      // Show confirmation when disabling
      setConfirmModal({
        isOpen: true,
        featureKey: key,
        featureName: name,
      })
    } else {
      // Enable directly without confirmation
      setPendingChanges((prev) => ({ ...prev, [key]: true }))
    }
  }

  const handleConfirmDisable = () => {
    if (confirmModal.featureKey) {
      setPendingChanges((prev) => ({ ...prev, [confirmModal.featureKey!]: false }))
    }
    setConfirmModal({ isOpen: false, featureKey: null, featureName: '' })
  }

  const handleCancelDisable = () => {
    setConfirmModal({ isOpen: false, featureKey: null, featureName: '' })
  }

  const handleSave = () => {
    batchUpdate.mutate(pendingChanges)
  }

  const handleDiscard = () => {
    if (features) {
      setPendingChanges(features)
    }
  }

  if (isLoading) {
    return <FeaturesSkeleton />
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-slate-600">
              Enable or disable platform features. Click Save to apply changes.
            </p>
            {hasChanges && (
              <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="secondary" onClick={handleDiscard}>
                Discard
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              loading={batchUpdate.isPending}
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {featureList.map((feature) => {
            const Icon = iconMap[feature.icon] || Code
            const colors = colorMap[feature.color] || colorMap.accent
            const isEnabled = pendingChanges[feature.key] ?? features?.[feature.key] ?? false
            const isChanged = features && pendingChanges[feature.key] !== features[feature.key]

            return (
              <div
                key={feature.key}
                className={`p-5 flex items-center justify-between ${
                  isChanged ? 'bg-amber-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-800">{feature.name}</h4>
                      {isChanged && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Modified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(feature.key, isEnabled, feature.name)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    isEnabled ? 'bg-accent-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      isEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCancelDisable}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Disable Feature?</h3>
              </div>
              <p className="text-slate-600 mb-6">
                Disabling <strong>{confirmModal.featureName}</strong> will affect all students
                currently using it. Are you sure you want to continue?
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleCancelDisable}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDisable}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Disable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeaturesSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200">
      <div className="p-5 border-b border-slate-100">
        <div className="h-5 w-96 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-12 h-6 bg-slate-200 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
