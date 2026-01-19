import type { Badge } from '@silveredge/shared'

export const mockBadges: Badge[] = [
  {
    id: 'badge-first-steps',
    name: 'First Steps',
    description: 'Completed your first lesson!',
    iconName: 'footprints',
    gradientFrom: '#22c55e',
    gradientTo: '#16a34a',
    triggerType: 'first_lesson',
    isActive: true,
    earnedCount: 150,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-bug-squasher',
    name: 'Bug Squasher',
    description: 'Passed 10 exercises!',
    iconName: 'bug',
    gradientFrom: '#ef4444',
    gradientTo: '#dc2626',
    triggerType: 'exercises_passed',
    triggerValue: 10,
    isActive: true,
    earnedCount: 85,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-streak-master',
    name: 'Streak Master',
    description: 'Maintained a 5-day streak!',
    iconName: 'flame',
    gradientFrom: '#fb923c',
    gradientTo: '#ea580c',
    triggerType: 'login_streak',
    triggerValue: 5,
    isActive: true,
    earnedCount: 45,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-loop-hero',
    name: 'Loop Hero',
    description: 'Completed the Loops section!',
    iconName: 'repeat',
    gradientFrom: '#8b5cf6',
    gradientTo: '#7c3aed',
    triggerType: 'lessons_completed',
    triggerValue: 5,
    isActive: true,
    earnedCount: 32,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-quiz-champion',
    name: 'Quiz Champion',
    description: 'Got 100% on 3 quizzes!',
    iconName: 'trophy',
    gradientFrom: '#fbbf24',
    gradientTo: '#f59e0b',
    triggerType: 'lessons_completed',
    triggerValue: 3,
    isActive: true,
    earnedCount: 28,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-code-explorer',
    name: 'Code Explorer',
    description: 'Created your first sandbox project!',
    iconName: 'compass',
    gradientFrom: '#06b6d4',
    gradientTo: '#0891b2',
    triggerType: 'first_sandbox',
    isActive: true,
    earnedCount: 95,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-helping-hand',
    name: 'Helping Hand',
    description: 'Asked for help and learned something new!',
    iconName: 'hand-helping',
    gradientFrom: '#f472b6',
    gradientTo: '#ec4899',
    triggerType: 'first_lesson',
    isActive: true,
    earnedCount: 120,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'badge-level-10',
    name: 'Rising Star',
    description: 'Reached Level 10!',
    iconName: 'star',
    gradientFrom: '#fbbf24',
    gradientTo: '#d97706',
    triggerType: 'level_reached',
    triggerValue: 10,
    isActive: true,
    earnedCount: 15,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

// Badges earned by student-1 (alex_coder)
export const mockEarnedBadgeIds: Record<string, string[]> = {
  'student-1': ['badge-first-steps', 'badge-bug-squasher', 'badge-streak-master', 'badge-loop-hero', 'badge-code-explorer', 'badge-helping-hand'],
  'student-2': ['badge-first-steps', 'badge-bug-squasher', 'badge-streak-master', 'badge-loop-hero', 'badge-quiz-champion', 'badge-code-explorer', 'badge-helping-hand', 'badge-level-10'],
  'student-3': ['badge-first-steps'],
}

// XP thresholds for levels
export const levelThresholds = [
  0, // Level 1
  100, // Level 2
  250, // Level 3
  450, // Level 4
  700, // Level 5
  1000, // Level 6
  1350, // Level 7
  1750, // Level 8
  2200, // Level 9
  2700, // Level 10
  3250, // Level 11
  3850, // Level 12
  4500, // Level 13
  5200, // Level 14
  6000, // Level 15
]

export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel >= levelThresholds.length) {
    return levelThresholds[levelThresholds.length - 1] + (currentLevel - levelThresholds.length + 1) * 1000
  }
  return levelThresholds[currentLevel]
}

export function getXpProgress(totalXp: number, currentLevel: number): number {
  const currentLevelXp = currentLevel > 0 ? levelThresholds[currentLevel - 1] || 0 : 0
  const nextLevelXp = getXpForNextLevel(currentLevel)
  const xpInCurrentLevel = totalXp - currentLevelXp
  const xpNeededForLevel = nextLevelXp - currentLevelXp
  return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)
}
