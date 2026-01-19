import { http, HttpResponse, delay } from 'msw'
import { validateMockToken } from '../data/auth'
import { mockSandboxProjects } from '../data/sandbox'
import { MAX_SANDBOX_PROJECTS } from '@silveredge/shared'
import type { SandboxProject } from '@/types/student'

export const sandboxHandlers = [
  // Get sandbox projects
  http.get('/api/student/sandbox/projects', async ({ request }) => {
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

    const projects = mockSandboxProjects[userId] || []

    return HttpResponse.json({
      projects,
      count: projects.length,
      maxProjects: MAX_SANDBOX_PROJECTS,
    })
  }),

  // Get single sandbox project
  http.get('/api/student/sandbox/projects/:projectId', async ({ request, params }) => {
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

    const projects = mockSandboxProjects[userId] || []
    const project = projects.find((p) => p.id === params.projectId)

    if (!project) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ project })
  }),

  // Create sandbox project
  http.post('/api/student/sandbox/projects', async ({ request }) => {
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

    const projects = mockSandboxProjects[userId] || []
    if (projects.length >= MAX_SANDBOX_PROJECTS) {
      return HttpResponse.json(
        { error: { code: 'LIMIT_REACHED', message: 'Maximum projects reached. Delete some projects to create new ones.' } },
        { status: 400 }
      )
    }

    const body = (await request.json()) as Partial<SandboxProject>

    const newProject: SandboxProject = {
      id: `sandbox-${Date.now()}`,
      name: body.name || 'Untitled Project',
      description: body.description,
      language: body.language || 'javascript',
      code: body.code || '// Write your code here\n',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ project: newProject })
  }),

  // Update sandbox project
  http.patch('/api/student/sandbox/projects/:projectId', async ({ request, params }) => {
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

    const projects = mockSandboxProjects[userId] || []
    const project = projects.find((p) => p.id === params.projectId)

    if (!project) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Project not found' } },
        { status: 404 }
      )
    }

    const body = (await request.json()) as Partial<SandboxProject>

    const updatedProject = {
      ...project,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ project: updatedProject })
  }),

  // Delete sandbox project
  http.delete('/api/student/sandbox/projects/:projectId', async ({ request }) => {
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

    return HttpResponse.json({ success: true })
  }),
]
