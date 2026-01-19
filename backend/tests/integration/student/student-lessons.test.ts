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
  createTestQuiz,
  createTestLessonProgress,
  createTestExerciseSubmission,
  createTestQuizSubmission,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'
import { LessonProgress } from '../../../src/modules/progress/lessonProgress.model'
import { Types } from 'mongoose'

describe('Student Lessons API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/lessons/:lessonId', () => {
    it('should return lesson content with steps', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id, { title: 'Intro Section' })
      const lesson = await createTestLesson(section._id, {
        title: 'My First Lesson',
        content: '# Introduction\n\nWelcome to the lesson!',
        xpReward: 25,
      })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/lessons/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('My First Lesson')
      expect(res.body.data.sectionTitle).toBe('Intro Section')
      expect(res.body.data.content).toBe('# Introduction\n\nWelcome to the lesson!')
      expect(res.body.data.xpReward).toBe(25)
      expect(res.body.data.steps).toHaveLength(1) // just the lesson content step
      expect(res.body.data.steps[0].type).toBe('content')
    })

    it('should include exercises and quizzes as steps', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise1 = await createTestExercise(lesson._id, { title: 'Exercise 1', orderIndex: 0 })
      const exercise2 = await createTestExercise(lesson._id, { title: 'Exercise 2', orderIndex: 1 })
      const quiz = await createTestQuiz(lesson._id, { title: 'Chapter Quiz' })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/lessons/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.steps).toHaveLength(4)
      expect(res.body.data.steps[0].type).toBe('content')
      expect(res.body.data.steps[1].type).toBe('exercise')
      expect(res.body.data.steps[1].title).toBe('Exercise 1')
      expect(res.body.data.steps[2].type).toBe('exercise')
      expect(res.body.data.steps[2].title).toBe('Exercise 2')
      expect(res.body.data.steps[3].type).toBe('quiz')
      expect(res.body.data.steps[3].title).toBe('Chapter Quiz')
    })

    it('should mark lesson as started when accessed', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const { user: student } = await createTestStudent()

      // Verify no progress exists before
      const progressBefore = await LessonProgress.findOne({
        studentId: student._id,
        lessonId: lesson._id,
      })
      expect(progressBefore).toBeNull()

      const res = await request(app)
        .get(`/api/student/lessons/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)

      // Verify progress is created
      const progressAfter = await LessonProgress.findOne({
        studentId: student._id,
        lessonId: lesson._id,
      })
      expect(progressAfter).not.toBeNull()
      expect(progressAfter?.status).toBe('in_progress')
      expect(progressAfter?.startedAt).toBeDefined()
    })

    it('should show completed steps correctly', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id, { title: 'Exercise 1' })
      const quiz = await createTestQuiz(lesson._id, { title: 'Quiz 1' })

      const { user: student } = await createTestStudent()

      // Complete the exercise
      await createTestExerciseSubmission(student._id, exercise._id, { passed: true })

      const res = await request(app)
        .get(`/api/student/lessons/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      // content: not completed, exercise: completed, quiz: not completed
      expect(res.body.data.steps[0].completed).toBe(false) // content
      expect(res.body.data.steps[1].completed).toBe(true)  // exercise
      expect(res.body.data.steps[2].completed).toBe(false) // quiz
    })

    it('should return current step index', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const exercise = await createTestExercise(lesson._id)

      const { user: student } = await createTestStudent()

      // Complete lesson content
      await createTestLessonProgress(student._id, lesson._id, { status: 'completed' })

      const res = await request(app)
        .get(`/api/student/lessons/${lesson._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      // Content is completed, so current step is the exercise (index 1)
      expect(res.body.data.currentStepIndex).toBe(1)
    })

    it('should return 404 for non-existent lesson', async () => {
      const { user: student } = await createTestStudent()

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .get(`/api/student/lessons/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const res = await request(app).get(`/api/student/lessons/${lesson._id}`)

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/student/lessons/:lessonId/complete', () => {
    it('should complete lesson and award XP', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 50 })

      const { user: student, profile } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/lessons/${lesson._id}/complete`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.xpEarned).toBe(50)

      // Verify student XP was updated
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(50)
    })

    it('should update existing progress to completed', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 30 })

      const { user: student } = await createTestStudent()

      // Start the lesson first
      await createTestLessonProgress(student._id, lesson._id, { status: 'in_progress' })

      const res = await request(app)
        .post(`/api/student/lessons/${lesson._id}/complete`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.xpEarned).toBe(30)

      // Verify progress was updated
      const progress = await LessonProgress.findOne({
        studentId: student._id,
        lessonId: lesson._id,
      })
      expect(progress?.status).toBe('completed')
      expect(progress?.completedAt).toBeDefined()
    })

    it('should return 0 XP when already completed', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id, { xpReward: 40 })

      const { user: student, profile } = await createTestStudent()

      // Complete the lesson already
      await createTestLessonProgress(student._id, lesson._id, {
        status: 'completed',
        xpEarned: 40,
      })

      // Update profile with earned XP
      await StudentProfile.findByIdAndUpdate(profile._id, { totalXp: 40 })

      // Try to complete again
      const res = await request(app)
        .post(`/api/student/lessons/${lesson._id}/complete`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.xpEarned).toBe(0)

      // Verify XP was not doubled
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(40)
    })

    it('should return 404 for non-existent lesson', async () => {
      const { user: student } = await createTestStudent()

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .post(`/api/student/lessons/${fakeId}/complete`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)

      const res = await request(app).post(`/api/student/lessons/${lesson._id}/complete`)

      expect(res.status).toBe(401)
    })
  })
})
