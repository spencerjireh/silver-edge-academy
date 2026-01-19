import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { requestLogger } from './middleware/requestLogger'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFound'

// Import routes
import authRoutes from './modules/auth/auth.routes'
import usersRoutes from './modules/users/users.routes'
import classesRoutes from './modules/classes/classes.routes'
import coursesRoutes from './modules/courses/courses.routes'
import sectionsRoutes from './modules/sections/sections.routes'
import lessonsRoutes from './modules/lessons/lessons.routes'
import exercisesRoutes from './modules/exercises/exercises.routes'
import quizzesRoutes from './modules/quizzes/quizzes.routes'
import progressRoutes from './modules/progress/progress.routes'
import attendanceRoutes from './modules/attendance/attendance.routes'
import uploadsRoutes from './modules/uploads/uploads.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'
import badgesRoutes from './modules/badges/badges.routes'
import shopRoutes from './modules/shop/shop.routes'
import settingsRoutes from './modules/settings/settings.routes'
import studentRoutes from './modules/student/student.routes'
import helpRequestsRoutes from './modules/helpRequests/helpRequests.routes'

const app = express()

// Basic middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use(requestLogger)

// API documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec)
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api', (_req, res) => {
  res.json({ message: 'Welcome to Silver Edge Academy API' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/classes', classesRoutes)
app.use('/api/classes', attendanceRoutes) // Attendance is under classes
app.use('/api/courses', coursesRoutes)
app.use('/api/courses', sectionsRoutes)
app.use('/api/courses', lessonsRoutes)
app.use('/api/lessons', exercisesRoutes)
app.use('/api/lessons', quizzesRoutes)
app.use('/api/exercises', exercisesRoutes) // Also mount for /api/exercises/:id/submit
app.use('/api/quizzes', quizzesRoutes) // Also mount for /api/quizzes/:id/submit
app.use('/api/progress', progressRoutes)
app.use('/api/students', progressRoutes) // Student progress routes
app.use('/api/uploads', uploadsRoutes)
app.use('/api/admin/dashboard', dashboardRoutes)
app.use('/api/badges', badgesRoutes)
app.use('/api/shop', shopRoutes)
app.use('/api/settings', settingsRoutes)

// Student-specific routes
app.use('/api/student', studentRoutes)

// Help requests (teacher/admin routes)
app.use('/api/help-requests', helpRequestsRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handler
app.use(errorHandler)

export { app }
