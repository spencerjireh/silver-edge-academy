import { http, HttpResponse, delay } from 'msw'
import { mockStudents, generateMockToken, validateMockToken } from '../data/auth'
import type { StudentAuthUser } from '@/types/student'

export const authHandlers = [
  // Login
  http.post('/api/student/auth/login', async ({ request }) => {
    await delay(400)

    const body = (await request.json()) as { username: string; password: string }
    const { username, password } = body

    // Find student by username
    const student = mockStudents.find(
      (s) => s.username.toLowerCase() === username.toLowerCase()
    )

    if (!student || student.password !== password) {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password',
          },
        },
        { status: 401 }
      )
    }

    // Generate mock token
    const token = generateMockToken(student.id)

    // Return user without password
    const { password: _, ...authUser } = student

    return HttpResponse.json({
      user: authUser,
      token,
    })
  }),

  // Logout
  http.post('/api/student/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({ success: true })
  }),

  // Get current user
  http.get('/api/student/auth/me', async ({ request }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'No valid authentication token provided',
          },
        },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const userId = validateMockToken(token)

    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired',
          },
        },
        { status: 401 }
      )
    }

    const student = mockStudents.find((s) => s.id === userId)

    if (!student) {
      return HttpResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      )
    }

    // Return user without password
    const { password: _, ...authUser } = student

    return HttpResponse.json({ user: authUser as StudentAuthUser })
  }),
]
