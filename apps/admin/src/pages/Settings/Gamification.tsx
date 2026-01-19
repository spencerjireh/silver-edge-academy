import { useState, useEffect, useMemo } from 'react'
import { Star, Coins, TrendingUp, Flame, X, AlertCircle } from 'lucide-react'
import { useGamificationSettings, useUpdateGamificationSettings } from '@/hooks/queries/useSettings'

interface LevelOverride {
  level: number
  threshold: number
}

export default function Gamification() {
  const { data: settings, isLoading } = useGamificationSettings()
  const updateSettings = useUpdateGamificationSettings()

  const [lessonXp, setLessonXp] = useState(50)
  const [exerciseXp, setExerciseXp] = useState(25)
  const [quizXp, setQuizXp] = useState(100)
  const [coinsPerXp, setCoinsPerXp] = useState(1)
  const [baseXp, setBaseXp] = useState(100)
  const [multiplier, setMultiplier] = useState(1.5)
  const [overrides, setOverrides] = useState<LevelOverride[]>([])
  const [streaksEnabled, setStreaksEnabled] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (settings) {
      setLessonXp(settings.xp.lessonCompletion)
      setExerciseXp(settings.xp.exercisePass)
      setQuizXp(settings.xp.quizBasePoints)
      setCoinsPerXp(settings.currency.coinsPerXp)
      setBaseXp(settings.levelProgression.baseXp)
      setMultiplier(settings.levelProgression.growthMultiplier)
      setOverrides(settings.levelProgression.overrides)
      setStreaksEnabled(settings.streaksEnabled)
    }
  }, [settings])

  const markChanged = () => setHasChanges(true)

  const levelPreview = useMemo(() => {
    const levels: { level: number; threshold: number }[] = []
    for (let level = 1; level <= 15; level++) {
      const override = overrides.find((o) => o.level === level)
      const threshold =
        override?.threshold ?? (level === 1 ? 0 : Math.round(baseXp * Math.pow(multiplier, level - 2)))
      levels.push({ level, threshold })
    }
    return levels
  }, [baseXp, multiplier, overrides])

  const handleAddOverride = () => {
    const existingLevels = overrides.map((o) => o.level)
    const nextLevel = Array.from({ length: 20 }, (_, i) => i + 2).find(
      (l) => !existingLevels.includes(l)
    )
    if (nextLevel) {
      setOverrides([...overrides, { level: nextLevel, threshold: 0 }])
      markChanged()
    }
  }

  const handleRemoveOverride = (level: number) => {
    setOverrides(overrides.filter((o) => o.level !== level))
    markChanged()
  }

  const handleOverrideChange = (level: number, threshold: number) => {
    setOverrides(overrides.map((o) => (o.level === level ? { ...o, threshold } : o)))
    markChanged()
  }

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      xp: {
        lessonCompletion: lessonXp,
        exercisePass: exerciseXp,
        quizBasePoints: quizXp,
      },
      currency: {
        coinsPerXp,
      },
      levelProgression: {
        baseXp,
        growthMultiplier: multiplier,
        overrides,
      },
      streaksEnabled,
    })
    setHasChanges(false)
  }

  const handleDiscard = () => {
    if (settings) {
      setLessonXp(settings.xp.lessonCompletion)
      setExerciseXp(settings.xp.exercisePass)
      setQuizXp(settings.xp.quizBasePoints)
      setCoinsPerXp(settings.currency.coinsPerXp)
      setBaseXp(settings.levelProgression.baseXp)
      setMultiplier(settings.levelProgression.growthMultiplier)
      setOverrides(settings.levelProgression.overrides)
      setStreaksEnabled(settings.streaksEnabled)
    }
    setHasChanges(false)
  }

  if (isLoading) {
    return <GamificationSkeleton />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* XP Values per Activity */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">XP Values per Activity</h3>
              <p className="text-sm text-slate-500">Configure XP rewards for different activities</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Lesson Completion
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={lessonXp}
                  onChange={(e) => {
                    setLessonXp(Number(e.target.value))
                    markChanged()
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  XP
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Exercise Pass
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={exerciseXp}
                  onChange={(e) => {
                    setExerciseXp(Number(e.target.value))
                    markChanged()
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  XP
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quiz Base Points
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={quizXp}
                  onChange={(e) => {
                    setQuizXp(Number(e.target.value))
                    markChanged()
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  XP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multiplied by quiz score percentage</p>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Conversion */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Currency (Coins)</h3>
              <p className="text-sm text-slate-500">XP to Coins conversion rate</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Coins per XP earned
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                value={coinsPerXp}
                onChange={(e) => {
                  setCoinsPerXp(Number(e.target.value))
                  markChanged()
                }}
                className="w-24 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <span className="text-sm text-slate-500">coin(s) per 1 XP</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Example: Student earns {lessonXp} XP = {Math.round(lessonXp * coinsPerXp)} coins
            </p>
          </div>
        </div>
      </div>

      {/* Level Progression Formula */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Level Progression</h3>
              <p className="text-sm text-slate-500">
                Exponential curve: threshold = base x multiplier^(level-1)
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formula Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Base XP (Level 2 threshold)
                </label>
                <input
                  type="number"
                  value={baseXp}
                  onChange={(e) => {
                    setBaseXp(Number(e.target.value))
                    markChanged()
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-400 mt-1">XP needed to reach Level 2</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Growth Multiplier
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={multiplier}
                  onChange={(e) => {
                    setMultiplier(Number(e.target.value))
                    markChanged()
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <p className="text-xs text-slate-400 mt-1">Each level requires this much more XP</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-3">Formula Preview</p>
                <div className="bg-slate-50 rounded-lg p-3 font-mono text-sm text-slate-600">
                  threshold = <span className="text-accent-600">{baseXp}</span> x{' '}
                  <span className="text-accent-600">{multiplier}</span>^(level-1)
                </div>
              </div>
            </div>

            {/* Generated Levels Preview */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Level Thresholds Preview</p>
              <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {levelPreview.map(({ level, threshold }) => (
                    <div key={level} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Level {level}</span>
                      <span className="font-medium text-slate-800">
                        {threshold.toLocaleString()} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Showing first 15 levels. System supports 100+ levels.
              </p>
            </div>
          </div>

          {/* Level Overrides */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Level Overrides</p>
                <p className="text-xs text-slate-400">Manually set specific level thresholds</p>
              </div>
              <button
                onClick={handleAddOverride}
                className="text-sm text-accent-600 hover:text-accent-700 font-medium"
              >
                + Add Override
              </button>
            </div>
            <div className="space-y-2">
              {overrides.map((override) => (
                <div
                  key={override.level}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <span className="text-sm text-slate-600 w-20">Level {override.level}</span>
                  <input
                    type="number"
                    value={override.threshold}
                    onChange={(e) => handleOverrideChange(override.level, Number(e.target.value))}
                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-400">XP</span>
                  <button
                    onClick={() => handleRemoveOverride(override.level)}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
              {overrides.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-3">No overrides configured</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Streak Settings */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Login Streaks</h3>
              <p className="text-sm text-slate-500">Track consecutive days with activity</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-700">Enable Login Streak Tracking</p>
              <p className="text-sm text-slate-500">Students see their current streak on dashboard</p>
            </div>
            <button
              onClick={() => {
                setStreaksEnabled(!streaksEnabled)
                markChanged()
              }}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                streaksEnabled ? 'bg-accent-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                  streaksEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Streaks can be used as badge triggers (e.g., &quot;7-day streak badge&quot;)
          </p>
        </div>
      </div>

      {/* Unsaved Changes Indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-4">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDiscard}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="px-3 py-1.5 text-sm bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50"
              >
                {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GamificationSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
