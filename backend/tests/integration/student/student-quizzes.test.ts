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
  createTestQuiz,
  createTestQuizSubmission,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'
import { QuizSubmission } from '../../../src/modules/progress/quizSubmission.model'
import { Quiz } from '../../../src/modules/quizzes/quizzes.model'
import { Types } from 'mongoose'

describe('Student Quizzes API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/quizzes/:quizId', () => {
    it('should return quiz without correct answers', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id, {
        title: 'JavaScript Basics Quiz',
        xpReward: 50,
      })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/quizzes/${quiz._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.title).toBe('JavaScript Basics Quiz')
      expect(res.body.data.xpReward).toBe(50)
      expect(res.body.data.lessonId).toBe(lesson._id.toString())
      expect(res.body.data.questions).toHaveLength(1)
      expect(res.body.data.questions[0].question).toBe('What is 2 + 2?')
      expect(res.body.data.questions[0].options).toEqual(['3', '4', '5', '6'])
      // Correct answer index should NOT be included
      expect(res.body.data.questions[0].correctIndex).toBeUndefined()
    })

    it('should track attempts', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const { user: student } = await createTestStudent()

      // Create some previous attempts
      await createTestQuizSubmission(student._id, lesson._id, quiz._id, { passed: false })
      await createTestQuizSubmission(student._id, lesson._id, quiz._id, { passed: false })

      const res = await request(app)
        .get(`/api/student/quizzes/${quiz._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.currentAttempt).toBe(3) // next attempt is 3
    })

    it('should include question count and max attempts', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get(`/api/student/quizzes/${quiz._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.questionCount).toBe(1)
      expect(res.body.data.maxAttempts).toBeDefined()
    })

    it('should return 404 for non-existent quiz', async () => {
      const { user: student } = await createTestStudent()

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .get(`/api/student/quizzes/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const res = await request(app).get(`/api/student/quizzes/${quiz._id}`)

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/student/quizzes/:quizId/submit', () => {
    it('should submit answers and return score with correct answers', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      // Get the quiz to find question ID (questions use custom 'id' field, not MongoDB _id)
      const quizDoc = await Quiz.findById(quiz._id)
      const questionId = quizDoc!.questions[0].id

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .set(getAuthHeader(student))
        .send({
          answers: [
            { questionId, selectedIndex: 1 }, // Correct answer
          ],
        })

      expect(res.status).toBe(200)
      expect(res.body.data.score).toBe(1)
      expect(res.body.data.total).toBe(1)
      expect(res.body.data.passed).toBe(true)
      expect(res.body.data.results).toHaveLength(1)
      expect(res.body.data.results[0].isCorrect).toBe(true)
      expect(res.body.data.results[0].correctIndex).toBe(1) // Now we reveal the correct answer
    })

    it('should award XP on first pass', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id, { xpReward: 40 })

      const quizDoc = await Quiz.findById(quiz._id)
      const questionId = quizDoc!.questions[0].id

      const { user: student, profile } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .set(getAuthHeader(student))
        .send({
          answers: [{ questionId, selectedIndex: 1 }],
        })

      expect(res.status).toBe(200)
      expect(res.body.data.passed).toBe(true)
      expect(res.body.data.xpEarned).toBe(40)

      // Verify XP was added
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(40)
    })

    it('should not award XP on subsequent passes', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id, { xpReward: 35 })

      const quizDoc = await Quiz.findById(quiz._id)
      const questionId = quizDoc!.questions[0].id

      const { user: student, profile } = await createTestStudent()

      // Create existing passed submission
      await createTestQuizSubmission(student._id, lesson._id, quiz._id, {
        passed: true,
        xpEarned: 35,
      })

      await StudentProfile.findByIdAndUpdate(profile._id, { totalXp: 35 })

      // Submit again
      const res = await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .set(getAuthHeader(student))
        .send({
          answers: [{ questionId, selectedIndex: 1 }],
        })

      expect(res.status).toBe(200)
      expect(res.body.data.passed).toBe(true)
      expect(res.body.data.xpEarned).toBe(0)

      // Verify XP not increased
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.totalXp).toBe(35)
    })

    it('should handle incorrect answers', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const quizDoc = await Quiz.findById(quiz._id)
      const questionId = quizDoc!.questions[0].id

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .set(getAuthHeader(student))
        .send({
          answers: [{ questionId, selectedIndex: 0 }], // Wrong answer (3 instead of 4)
        })

      expect(res.status).toBe(200)
      expect(res.body.data.score).toBe(0)
      expect(res.body.data.total).toBe(1)
      expect(res.body.data.passed).toBe(false)
      expect(res.body.data.xpEarned).toBe(0)
      expect(res.body.data.results[0].isCorrect).toBe(false)
      expect(res.body.data.results[0].selectedIndex).toBe(0)
      expect(res.body.data.results[0].correctIndex).toBe(1)
    })

    it('should save submission record', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const quizDoc = await Quiz.findById(quiz._id)
      const questionId = quizDoc!.questions[0].id

      const { user: student } = await createTestStudent()

      await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .set(getAuthHeader(student))
        .send({
          answers: [{ questionId, selectedIndex: 1 }],
        })

      const submission = await QuizSubmission.findOne({
        studentId: student._id,
        quizId: quiz._id,
      })

      expect(submission).not.toBeNull()
      expect(submission?.score).toBe(1)
    })

    it('should return 404 for non-existent quiz', async () => {
      const { user: student } = await createTestStudent()

      const fakeId = new Types.ObjectId()
      const res = await request(app)
        .post(`/api/student/quizzes/${fakeId}/submit`)
        .set(getAuthHeader(student))
        .send({ answers: [] })

      expect(res.status).toBe(404)
    })

    it('should return 422 for missing answers', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .set(getAuthHeader(student))
        .send({}) // no answers

      expect(res.status).toBe(422)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const course = await createTestCourse(admin._id)
      const section = await createTestSection(course._id)
      const lesson = await createTestLesson(section._id)
      const quiz = await createTestQuiz(lesson._id)

      const res = await request(app)
        .post(`/api/student/quizzes/${quiz._id}/submit`)
        .send({ answers: [] })

      expect(res.status).toBe(401)
    })
  })
})
