import { http, HttpResponse, delay } from 'msw'
import { mockStudents, validateMockToken } from '../data/auth'
import { mockEarnedBadgeIds, mockBadges } from '../data/gamification'
import { mockEquippedItems } from '../data/shop'

export const profileHandlers = [
  // Get profile
  http.get('/api/student/profile', async ({ request }) => {
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

    const student = mockStudents.find((s) => s.id === userId)
    if (!student) {
      return HttpResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    const { password: _, ...profile } = student
    const earnedBadgeIds = mockEarnedBadgeIds[userId] || []
    const earnedBadges = mockBadges.filter((b) => earnedBadgeIds.includes(b.id))
    const equippedItems = mockEquippedItems[userId] || {}

    return HttpResponse.json({
      profile,
      stats: {
        lessonsCompleted: userId === 'student-1' ? 12 : userId === 'student-2' ? 28 : 1,
        exercisesPassed: userId === 'student-1' ? 45 : userId === 'student-2' ? 95 : 2,
        quizzesPassed: userId === 'student-1' ? 8 : userId === 'student-2' ? 18 : 0,
        badgesEarned: earnedBadges.length,
      },
      recentBadges: earnedBadges.slice(0, 4),
      equippedItems,
    })
  }),

  // Update profile
  http.patch('/api/student/profile', async ({ request }) => {
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

    const body = (await request.json()) as {
      displayName?: string
      avatarId?: string
      preferences?: {
        theme?: 'light' | 'dark' | 'system'
        editorTheme?: string
      }
    }

    // In real implementation, would update the database
    const updatedProfile = {
      ...student,
      displayName: body.displayName || student.displayName,
      avatarId: body.avatarId !== undefined ? body.avatarId : student.avatarId,
      preferences: {
        ...student.preferences,
        ...body.preferences,
      },
    }

    const { password: _, ...profile } = updatedProfile

    return HttpResponse.json({ profile })
  }),

  // Get notifications
  http.get('/api/student/notifications', async ({ request }) => {
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

    // Mock notifications
    const notifications = [
      {
        id: 'notif-1',
        type: 'help_response',
        title: 'Teacher replied!',
        message: 'Ms. Santos replied to your help request about For Loops.',
        read: false,
        data: { helpRequestId: 'help-1' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif-2',
        type: 'badge_earned',
        title: 'Badge Earned!',
        message: 'You earned the "Streak Master" badge!',
        read: true,
        data: { badgeId: 'badge-streak-master' },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return HttpResponse.json({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  }),

  // Mark notification as read
  http.patch('/api/student/notifications/:notificationId/read', async ({ request }) => {
    await delay(100)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    return HttpResponse.json({ success: true })
  }),
]
