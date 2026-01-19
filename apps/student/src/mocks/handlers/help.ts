import { http, HttpResponse, delay } from 'msw'
import { validateMockToken } from '../data/auth'
import { mockHelpRequests, mockPendingHelpRequestIds } from '../data/help'
import type { StudentHelpRequest } from '@/types/student'

export const helpHandlers = [
  // Get help requests
  http.get('/api/student/help-requests', async ({ request }) => {
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

    const requests = mockHelpRequests[userId] || []
    const hasPending = mockPendingHelpRequestIds[userId] !== null

    return HttpResponse.json({ requests, hasPending })
  }),

  // Get single help request
  http.get('/api/student/help-requests/:requestId', async ({ request, params }) => {
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

    const requests = mockHelpRequests[userId] || []
    const helpRequest = requests.find((r) => r.id === params.requestId)

    if (!helpRequest) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Help request not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ request: helpRequest })
  }),

  // Create help request
  http.post('/api/student/help-requests', async ({ request }) => {
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

    // Check if already has pending request
    if (mockPendingHelpRequestIds[userId]) {
      return HttpResponse.json(
        { error: { code: 'HELP_REQUEST_PENDING', message: 'You already have a pending help request' } },
        { status: 409 }
      )
    }

    const body = (await request.json()) as {
      lessonId: string
      lessonTitle: string
      exerciseId?: string
      exerciseTitle?: string
      message: string
      codeSnapshot?: string
    }

    const newRequest: StudentHelpRequest = {
      id: `help-${Date.now()}`,
      lessonId: body.lessonId,
      lessonTitle: body.lessonTitle,
      exerciseId: body.exerciseId,
      exerciseTitle: body.exerciseTitle,
      message: body.message,
      codeSnapshot: body.codeSnapshot,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    return HttpResponse.json({ request: newRequest })
  }),
]
