import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestSandboxProject,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'
import { SandboxProject } from '../../src/modules/sandbox/sandboxProject.model'
import { Types } from 'mongoose'

describe('Sandbox API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/sandbox/projects', () => {
    it('should list only own projects', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      // Create projects for both students
      await createTestSandboxProject(student1._id, { name: 'My Project 1' })
      await createTestSandboxProject(student1._id, { name: 'My Project 2' })
      await createTestSandboxProject(student2._id, { name: 'Other Student Project' })

      const res = await request(app)
        .get('/api/student/sandbox/projects')
        .set(getAuthHeader(student1))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      const names = res.body.data.map((p: { name: string }) => p.name)
      expect(names).toContain('My Project 1')
      expect(names).toContain('My Project 2')
      expect(names).not.toContain('Other Student Project')
    })

    it('should support pagination', async () => {
      const { user: student } = await createTestStudent()

      // Create 5 projects
      for (let i = 0; i < 5; i++) {
        await createTestSandboxProject(student._id, { name: `Project ${i + 1}` })
      }

      const res = await request(app)
        .get('/api/student/sandbox/projects?page=1&limit=2')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)
      expect(res.body.meta.total).toBe(5)
      expect(res.body.meta.page).toBe(1)
      expect(res.body.meta.totalPages).toBe(3)
    })

    it('should filter by language', async () => {
      const { user: student } = await createTestStudent()

      await createTestSandboxProject(student._id, { name: 'JS Project', language: 'javascript' })
      await createTestSandboxProject(student._id, { name: 'Python Project', language: 'python' })

      const res = await request(app)
        .get('/api/student/sandbox/projects?language=python')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].name).toBe('Python Project')
      expect(res.body.data[0].language).toBe('python')
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/sandbox/projects')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/sandbox/projects')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })

  describe('POST /api/student/sandbox/projects', () => {
    it('should create a new project', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/sandbox/projects')
        .set(getAuthHeader(student))
        .send({
          name: 'New Project',
          description: 'A test project',
          language: 'javascript',
          code: 'console.log("hello")',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.name).toBe('New Project')
      expect(res.body.data.description).toBe('A test project')
      expect(res.body.data.language).toBe('javascript')
      expect(res.body.data.code).toBe('console.log("hello")')
      expect(res.body.data.studentId).toBe(student._id.toString())
    })

    it('should create project with default language', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/sandbox/projects')
        .set(getAuthHeader(student))
        .send({ name: 'Default Language Project' })

      expect(res.status).toBe(201)
      expect(res.body.data.language).toBe('javascript')
    })

    it('should validate name is required', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/sandbox/projects')
        .set(getAuthHeader(student))
        .send({ description: 'No name' })

      expect(res.status).toBe(422)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/student/sandbox/projects')
        .send({ name: 'Test' })

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/student/sandbox/projects/:projectId', () => {
    it('should return own project', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, {
        name: 'My Project',
        description: 'Description',
        language: 'python',
        code: 'print("hello")',
      })

      const res = await request(app)
        .get(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('My Project')
      expect(res.body.data.description).toBe('Description')
      expect(res.body.data.language).toBe('python')
      expect(res.body.data.code).toBe('print("hello")')
    })

    it('should return 404 for other students project', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      const project = await createTestSandboxProject(student2._id, { name: 'Other Project' })

      const res = await request(app)
        .get(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student1))

      expect(res.status).toBe(404)
    })

    it('should return 404 for non-existent project', async () => {
      const { user: student } = await createTestStudent()
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .get(`/api/student/sandbox/projects/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, { name: 'Test' })

      const res = await request(app).get(`/api/student/sandbox/projects/${project._id}`)

      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/student/sandbox/projects/:projectId', () => {
    it('should update own project', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, {
        name: 'Original Name',
        code: 'original code',
      })

      const res = await request(app)
        .patch(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student))
        .send({
          name: 'Updated Name',
          code: 'updated code',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('Updated Name')
      expect(res.body.data.code).toBe('updated code')
    })

    it('should allow partial updates', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, {
        name: 'Original Name',
        code: 'original code',
      })

      const res = await request(app)
        .patch(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student))
        .send({ name: 'New Name Only' })

      expect(res.status).toBe(200)
      expect(res.body.data.name).toBe('New Name Only')
      expect(res.body.data.code).toBe('original code')
    })

    it('should return 404 for other students project', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      const project = await createTestSandboxProject(student2._id, { name: 'Other Project' })

      const res = await request(app)
        .patch(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student1))
        .send({ name: 'Trying to update' })

      expect(res.status).toBe(404)
    })

    it('should return 404 for non-existent project', async () => {
      const { user: student } = await createTestStudent()
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .patch(`/api/student/sandbox/projects/${fakeId}`)
        .set(getAuthHeader(student))
        .send({ name: 'New Name' })

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, { name: 'Test' })

      const res = await request(app)
        .patch(`/api/student/sandbox/projects/${project._id}`)
        .send({ name: 'New Name' })

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/student/sandbox/projects/:projectId', () => {
    it('should delete own project', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, { name: 'To Delete' })

      const res = await request(app)
        .delete(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(204)

      // Verify deleted
      const deleted = await SandboxProject.findById(project._id)
      expect(deleted).toBeNull()
    })

    it('should return 404 for other students project', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      const project = await createTestSandboxProject(student2._id, { name: 'Other Project' })

      const res = await request(app)
        .delete(`/api/student/sandbox/projects/${project._id}`)
        .set(getAuthHeader(student1))

      expect(res.status).toBe(404)

      // Verify not deleted
      const notDeleted = await SandboxProject.findById(project._id)
      expect(notDeleted).not.toBeNull()
    })

    it('should return 404 for non-existent project', async () => {
      const { user: student } = await createTestStudent()
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .delete(`/api/student/sandbox/projects/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const { user: student } = await createTestStudent()
      const project = await createTestSandboxProject(student._id, { name: 'Test' })

      const res = await request(app).delete(`/api/student/sandbox/projects/${project._id}`)

      expect(res.status).toBe(401)
    })
  })
})
