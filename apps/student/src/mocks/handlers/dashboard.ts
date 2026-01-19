import { http, HttpResponse, delay } from 'msw'
import { mockStudents, validateMockToken } from '../data/auth'
import { mockActiveCourses } from '../data/courses'
import { mockBadges, mockEarnedBadgeIds, getXpForNextLevel, getXpProgress } from '../data/gamification'
import type { DashboardData } from '@/types/student'

export const dashboardHandlers = [
  // Get dashboard data
  http.get('/api/student/dashboard', async ({ request }) => {
    await delay(300)

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

    const student = mockStudents.find((s) => s.id === userId)
    if (!student) {
      return HttpResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Get earned badges
    const earnedBadgeIds = mockEarnedBadgeIds[userId] || []
    const recentBadges = mockBadges
      .filter((b) => earnedBadgeIds.includes(b.id))
      .slice(0, 4)

    // Find next badge to earn
    const unearndBadges = mockBadges.filter((b) => !earnedBadgeIds.includes(b.id))
    const nextBadge = unearndBadges[0]

    const dashboardData: DashboardData = {
      user: {
        displayName: student.displayName,
        username: student.username,
        avatarId: student.avatarId,
        currentLevel: student.currentLevel,
        totalXp: student.totalXp,
        xpForNextLevel: getXpForNextLevel(student.currentLevel),
        xpProgress: getXpProgress(student.totalXp, student.currentLevel),
        currencyBalance: student.currencyBalance,
        currentStreakDays: student.currentStreakDays,
      },
      activeCourses: mockActiveCourses,
      recentBadges,
      stats: {
        lessonsCompleted: userId === 'student-1' ? 12 : userId === 'student-2' ? 28 : 1,
        exercisesPassed: userId === 'student-1' ? 45 : userId === 'student-2' ? 95 : 2,
        quizzesPassed: userId === 'student-1' ? 8 : userId === 'student-2' ? 18 : 0,
      },
      nextBadge: nextBadge
        ? {
            name: nextBadge.name,
            progress: 7,
            target: nextBadge.triggerValue || 10,
          }
        : undefined,
    }

    return HttpResponse.json(dashboardData)
  }),
]
