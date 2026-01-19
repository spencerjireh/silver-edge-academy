import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestCourse,
  createTestSection,
  createTestLesson,
  createTestExercise,
  createTestExerciseSubmission,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'
import { ExerciseSubmission } from '../../../src/modules/progress/exerciseSubmission.model'
import { Types } from 'mongoose'

describe('Student Exercises API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/exercises/:exerciseId', () => {
    it('should return exercise without solution', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id, {
        title: 'Hello World Exercise',
        instructions: 'Print "Hello World" to the console',
        starterCode: '// Write your code here',
        solution: 'console.log("Hello World")', // This should not be returned
        xpReward: 20,
      })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/exercises/${exercise._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('Hello World Exercise')
      expect(res.body.data.instructions).toBe('Print "Hello World" to the console')
      expect(res.body.data.starterCode).toBe('// Write your code here')
      expect(res.body.data.xpReward).toBe(20)
      expect(res.body.data.lessonId).toBe(lesson._id.toString())
      // Solution should NOT be included
      expect(res.body.data.solution).toBeUndefined()
    })

    it('should include orderIndex', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id, { orderIndex: 2 })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/exercises/${exercise._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.orderIndex).toBe(2)
    })

    it('should return 404 for non-existent exercise', async () => {
      const { user: student } = await createTestStudent()

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .get(`/api/student/exercises/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id)

      const res = await request(app).get(`/api/student/exercises/${exercise._id}`)

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/student/exercises/:exerciseId/submit', () => {
    it('should submit code and return test results', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id, { xpReward: 25 })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/exercises/${exercise._id}/submit`)
        .set(getAuthHeader(student))
        .send({ code: 'console.log("solution")' })

      expect(res.status).toBe(200)
      expect(res.body.data.passed).toBe(true)
      expect(res.body.data.testsTotal).toBeGreaterThanOrEqual(1)
      expect(res.body.data.testsPassed).toBeGreaterThanOrEqual(1)
      expect(res.body.data.testResults).toBeDefined()
      expect(Array.isArray(res.body.data.testResults)).toBe(true)
    })

    it('should award XP on first pass', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id, { xpReward: 30 })

      const { user: student, profile } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/exercises/${exercise._id}/submit`)
        .set(getAuthHeader(student))
        .send({ code: 'console.log("solution")' })

      expect(res.status).toBe(200)
      expect(res.body.data.passed).toBe(true)
      expect(res.body.data.xpEarned).toBe(30)

      // Verify XP was added to profile
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(30)
    })

    it('should not award XP on subsequent passes', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id, { xpReward: 25 })

      const { user: student, profile } = await createTestStudent()

      // Create existing passed submission
      await createTestExerciseSubmission(student._id, exercise._id, {
        passed: true,
        xpEarned: 25,
      })

      // Update profile with earned XP
      await StudentProfile.findByIdAndUpdate(profile._id, { totalXp: 25 })

      // Submit again
      const res = await request(app)
        .post(`/api/student/exercises/${exercise._id}/submit`)
        .set(getAuthHeader(student))
        .send({ code: 'console.log("solution")' })

      expect(res.status).toBe(200)
      expect(res.body.data.passed).toBe(true)
      expect(res.body.data.xpEarned).toBe(0) // No additional XP

      // Verify XP was not increased
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(25)
    })

    it('should save submission record', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id)

      const { user: student } = await createTestStudent()

      const submittedCode = 'console.log("my solution")'

      await request(app)
        .post(`/api/student/exercises/${exercise._id}/submit`)
        .set(getAuthHeader(student))
        .send({ code: submittedCode })

      const submission = await ExerciseSubmission.findOne({
        studentId: student._id,
        exerciseId: exercise._id,
      })

      expect(submission).not.toBeNull()
      expect(submission?.code).toBe(submittedCode)
    })

    it('should return 404 for non-existent exercise', async () => {
      const { user: student } = await createTestStudent()

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .post(`/api/student/exercises/${fakeId}/submit`)
        .set(getAuthHeader(student))
        .send({ code: 'some code' })

      expect(res.status).toBe(404)
    })

    it('should return 422 for missing code', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id)

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/exercises/${exercise._id}/submit`)
        .set(getAuthHeader(student))
        .send({}) // no code

      expect(res.status).toBe(422)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id)

      const res = await request(app)
        .post(`/api/student/exercises/${exercise._id}/submit`)
        .send({ code: 'some code' })

      expect(res.status).toBe(401)
    })
  })
})
