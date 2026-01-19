import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestNotification,
} from '../helpers/db'
import { getAuthHeader } from '../helpers/auth'
import { Notification } from '../../src/modules/notifications/notification.model'
import { Types } from 'mongoose'

describe('Notifications API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/notifications', () => {
    it('should list notifications with unreadCount', async () => {
      const { user: student } = await createTestStudent()

      await createTestNotification(student._id, { title: 'Notification 1', read: false })
      await createTestNotification(student._id, { title: 'Notification 2', read: false })
      await createTestNotification(student._id, { title: 'Notification 3', read: true })

      const res = await request(app)
        .get('/api/student/notifications')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.notifications).toHaveLength(3)
      expect(res.body.data.unreadCount).toBe(2)
    })

    it('should support pagination', async () => {
      const { user: student } = await createTestStudent()

      for (let i = 0; i < 5; i++) {
        await createTestNotification(student._id, { title: `Notification ${i + 1}` })
      }

      const res = await request(app)
        .get('/api/student/notifications?page=1&limit=2')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.notifications).toHaveLength(2)
      expect(res.body.data.meta.total).toBe(5)
      expect(res.body.data.meta.page).toBe(1)
      expect(res.body.data.meta.totalPages).toBe(3)
    })

    it('should filter by read status', async () => {
      const { user: student } = await createTestStudent()

      await createTestNotification(student._id, { title: 'Unread 1', read: false })
      await createTestNotification(student._id, { title: 'Unread 2', read: false })
      await createTestNotification(student._id, { title: 'Read', read: true })

      const res = await request(app)
        .get('/api/student/notifications?read=false')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.notifications).toHaveLength(2)
      expect(res.body.data.notifications.every((n: { read: boolean }) => n.read === false)).toBe(true)
    })

    it('should filter by type', async () => {
      const { user: student } = await createTestStudent()

      await createTestNotification(student._id, { title: 'Badge', type: 'badge_earned' })
      await createTestNotification(student._id, { title: 'Level Up', type: 'level_up' })
      await createTestNotification(student._id, { title: 'General', type: 'general' })

      const res = await request(app)
        .get('/api/student/notifications?type=badge_earned')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.notifications).toHaveLength(1)
      expect(res.body.data.notifications[0].type).toBe('badge_earned')
    })

    it('should only return own notifications', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      await createTestNotification(student1._id, { title: 'My notification' })
      await createTestNotification(student2._id, { title: 'Other notification' })

      const res = await request(app)
        .get('/api/student/notifications')
        .set(getAuthHeader(student1))

      expect(res.status).toBe(200)
      expect(res.body.data.notifications).toHaveLength(1)
      expect(res.body.data.notifications[0].title).toBe('My notification')
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/notifications')

      expect(res.status).toBe(401)
    })

    it('should return 403 for non-student role', async () => {
      const admin = await createTestAdmin()

      const res = await request(app)
        .get('/api/student/notifications')
        .set(getAuthHeader(admin))

      expect(res.status).toBe(403)
    })
  })

  describe('PATCH /api/student/notifications/:notificationId/read', () => {
    it('should mark notification as read', async () => {
      const { user: student } = await createTestStudent()
      const notification = await createTestNotification(student._id, { read: false })

      const res = await request(app)
        .patch(`/api/student/notifications/${notification._id}/read`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.read).toBe(true)

      // Verify in database
      const updated = await Notification.findById(notification._id)
      expect(updated?.read).toBe(true)
    })

    it('should return 404 for other users notification', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      const notification = await createTestNotification(student2._id)

      const res = await request(app)
        .patch(`/api/student/notifications/${notification._id}/read`)
        .set(getAuthHeader(student1))

      expect(res.status).toBe(404)
    })

    it('should return 404 for non-existent notification', async () => {
      const { user: student } = await createTestStudent()
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .patch(`/api/student/notifications/${fakeId}/read`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const { user: student } = await createTestStudent()
      const notification = await createTestNotification(student._id)

      const res = await request(app).patch(`/api/student/notifications/${notification._id}/read`)

      expect(res.status).toBe(401)
    })
  })

  describe('PATCH /api/student/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const { user: student } = await createTestStudent()

      await createTestNotification(student._id, { read: false })
      await createTestNotification(student._id, { read: false })
      await createTestNotification(student._id, { read: false })

      const res = await request(app)
        .patch('/api/student/notifications/read-all')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.updatedCount).toBe(3)

      // Verify in database
      const unreadCount = await Notification.countDocuments({
        userId: student._id,
        read: false,
      })
      expect(unreadCount).toBe(0)
    })

    it('should return updatedCount of 0 when no unread notifications', async () => {
      const { user: student } = await createTestStudent()

      await createTestNotification(student._id, { read: true })
      await createTestNotification(student._id, { read: true })

      const res = await request(app)
        .patch('/api/student/notifications/read-all')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data.updatedCount).toBe(0)
    })

    it('should only mark own notifications as read', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      await createTestNotification(student1._id, { read: false })
      await createTestNotification(student2._id, { read: false })

      const res = await request(app)
        .patch('/api/student/notifications/read-all')
        .set(getAuthHeader(student1))

      expect(res.status).toBe(200)
      expect(res.body.data.updatedCount).toBe(1)

      // Verify student2's notification is still unread
      const student2Unread = await Notification.countDocuments({
        userId: student2._id,
        read: false,
      })
      expect(student2Unread).toBe(1)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).patch('/api/student/notifications/read-all')

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/student/notifications/:notificationId', () => {
    it('should delete own notification', async () => {
      const { user: student } = await createTestStudent()
      const notification = await createTestNotification(student._id)

      const res = await request(app)
        .delete(`/api/student/notifications/${notification._id}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(204)

      // Verify deleted
      const deleted = await Notification.findById(notification._id)
      expect(deleted).toBeNull()
    })

    it('should return 404 for other users notification', async () => {
      const { user: student1 } = await createTestStudent()
      const { user: student2 } = await createTestStudent()

      const notification = await createTestNotification(student2._id)

      const res = await request(app)
        .delete(`/api/student/notifications/${notification._id}`)
        .set(getAuthHeader(student1))

      expect(res.status).toBe(404)

      // Verify not deleted
      const notDeleted = await Notification.findById(notification._id)
      expect(notDeleted).not.toBeNull()
    })

    it('should return 404 for non-existent notification', async () => {
      const { user: student } = await createTestStudent()
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .delete(`/api/student/notifications/${fakeId}`)
        .set(getAuthHeader(student))

      expect(res.status).toBe(404)
    })

    it('should return 401 without authentication', async () => {
      const { user: student } = await createTestStudent()
      const notification = await createTestNotification(student._id)

      const res = await request(app).delete(`/api/student/notifications/${notification._id}`)

      expect(res.status).toBe(401)
    })
  })
})
