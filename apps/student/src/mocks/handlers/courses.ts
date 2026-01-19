import { http, HttpResponse, delay } from 'msw'
import { validateMockToken } from '../data/auth'
import { mockCourses } from '../data/courses'
import { mockLessonContent, mockExercises, mockQuizzes, mockQuizQuestions, mockQuizAnswers } from '../data/lessons'

export const courseHandlers = [
  // Get all courses for student
  http.get('/api/student/courses', async ({ request }) => {
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

    // Return simplified course list
    const courses = mockCourses.map((c) => ({
      id: c.id,
      title: c.title,
      language: c.language,
      description: c.description,
      progressPercent: c.progressPercent,
      totalLessons: c.sections.reduce((acc, s) => acc + s.lessons.length, 0),
      completedLessons: c.sections.reduce((acc, s) => acc + s.completedCount, 0),
    }))

    return HttpResponse.json({ courses })
  }),

  // Get course map (detail with sections and lessons)
  http.get('/api/student/courses/:courseId', async ({ request, params }) => {
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

    const course = mockCourses.find((c) => c.id === params.courseId)

    if (!course) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Course not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ course })
  }),

  // Get lesson content
  http.get('/api/student/lessons/:lessonId', async ({ request, params }) => {
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

    const lessonId = params.lessonId as string
    const lesson = mockLessonContent[lessonId]

    if (!lesson) {
      // Return generic lesson content for unimplemented lessons
      return HttpResponse.json({
        lesson: {
          id: lessonId,
          title: 'Lesson Content',
          sectionTitle: 'Section',
          sectionId: 'section-1',
          courseId: 'course-js-basics',
          content: '# Coming Soon\n\nThis lesson content is being prepared.',
          codeMode: 'text',
          xpReward: 10,
          steps: [
            { type: 'content', id: 'content-1', title: 'Learn', completed: false },
          ],
          currentStepIndex: 0,
        },
      })
    }

    return HttpResponse.json({ lesson })
  }),

  // Get exercise
  http.get('/api/student/exercises/:exerciseId', async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const exerciseId = params.exerciseId as string
    const exercise = mockExercises[exerciseId]

    if (!exercise) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Exercise not found' } },
        { status: 404 }
      )
    }

    return HttpResponse.json({ exercise })
  }),

  // Submit exercise
  http.post('/api/student/exercises/:exerciseId/submit', async ({ request, params }) => {
    await delay(800) // Simulate code execution time

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { code: string }
    const exerciseId = params.exerciseId as string

    // Simple mock validation - check if code contains expected patterns
    let passed = false
    let testsPassed = 0
    const testsTotal = 5

    if (exerciseId === 'exercise-1') {
      // Countdown exercise - check for while loop and decrement
      if (body.code.includes('while') && (body.code.includes('--') || body.code.includes('-= 1'))) {
        passed = true
        testsPassed = 5
      } else if (body.code.includes('while')) {
        testsPassed = 3
      } else {
        testsPassed = 1
      }
    } else if (exerciseId === 'exercise-2') {
      // For loop exercise
      if (body.code.includes('for') && body.code.includes('console.log')) {
        passed = true
        testsPassed = 5
      } else {
        testsPassed = 2
      }
    } else {
      // Generic check
      passed = body.code.length > 20
      testsPassed = passed ? 5 : 2
    }

    return HttpResponse.json({
      passed,
      testsTotal,
      testsPassed,
      xpEarned: passed ? 15 : 0,
      testResults: Array.from({ length: testsTotal }, (_, i) => ({
        testCaseId: `test-${i + 1}`,
        passed: i < testsPassed,
        input: `Test case ${i + 1}`,
        expected: 'Expected output',
        actual: i < testsPassed ? 'Expected output' : 'Incorrect output',
      })),
    })
  }),

  // Get quiz
  http.get('/api/student/quizzes/:quizId', async ({ request, params }) => {
    await delay(200)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const quizId = params.quizId as string
    const quiz = mockQuizzes[quizId]

    if (!quiz) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Quiz not found' } },
        { status: 404 }
      )
    }

    const questions = mockQuizQuestions[quizId] || []

    return HttpResponse.json({ quiz, questions })
  }),

  // Submit quiz
  http.post('/api/student/quizzes/:quizId/submit', async ({ request, params }) => {
    await delay(500)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const body = (await request.json()) as { answers: { questionId: string; selectedIndex: number }[] }
    const quizId = params.quizId as string
    const correctAnswers = mockQuizAnswers[quizId] || []

    let score = 0
    const results = body.answers.map((answer, index) => {
      const isCorrect = answer.selectedIndex === correctAnswers[index]
      if (isCorrect) score++
      return {
        questionId: answer.questionId,
        isCorrect,
        correctIndex: correctAnswers[index],
        selectedIndex: answer.selectedIndex,
      }
    })

    const total = correctAnswers.length
    const passed = score >= Math.ceil(total * 0.7) // 70% to pass

    return HttpResponse.json({
      score,
      total,
      passed,
      xpEarned: passed ? 25 : 0,
      results,
    })
  }),

  // Complete lesson
  http.post('/api/student/lessons/:lessonId/complete', async ({ request, params }) => {
    await delay(300)

    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return HttpResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      )
    }

    const lessonId = params.lessonId as string

    return HttpResponse.json({
      success: true,
      xpEarned: 10,
      lessonId,
      nextLessonId: null, // Would calculate actual next lesson
    })
  }),
]
