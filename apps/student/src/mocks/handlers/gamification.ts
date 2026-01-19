import { http, HttpResponse, delay } from 'msw'
import { validateMockToken } from '../data/auth'
import { mockBadges, mockEarnedBadgeIds } from '../data/gamification'

export const gamificationHandlers = [
  // Get all badges (earned and available)
  http.get('/api/student/badges', async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const userId = validateMockToken(token)

    if (!userId) {
      return HttpResponse.json(
        { error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } },
        { status: 401 }
      )
    }

    const earnedIds = mockEarnedBadgeIds[userId] || []

    const badges = mockBadges.map((badge) => ({
      ...badge,
      isEarned: earnedIds.includes(badge.id),
      earnedAt: earnedIds.includes(badge.id)
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    }))

    const earnedBadges = badges.filter((b) => b.isEarned)
    const lockedBadges = badges.filter((b) => !b.isEarned)

    return HttpResponse.json({
      earned: earnedBadges,
      locked: lockedBadges,
      totalEarned: earnedBadges.length,
      totalAvailable: mockBadges.length,
    })
  }),

  // Get XP history
  http.get('/api/student/xp-history', async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const userId = validateMockToken(token)

    if (!userId) {
      return HttpResponse.json(
        { error: { code: 'TOKEN_EXPIRED', message: 'Token expired' } },
        { status: 401 }
      )
    }

    // Generate mock XP history
    const history = [
      { id: '1', amount: 15, actionType: 'exercise_complete', description: 'Completed "Countdown Exercise"', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: '2', amount: 10, actionType: 'lesson_complete', description: 'Completed "For Loops"', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: '3', amount: 25, actionType: 'quiz_complete', description: 'Passed "For Loops Quiz"', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { id: '4', amount: 5, actionType: 'daily_login', description: 'Daily login bonus', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      { id: '5', amount: 10, actionType: 'streak_bonus', description: '5-day streak bonus', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    ]

    return HttpResponse.json({ history })
  }),
]
