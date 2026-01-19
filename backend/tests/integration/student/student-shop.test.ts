import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import request from 'supertest'
import { app } from '../../../src/app'
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from '../../setup'
import {
  createTestStudent,
  createTestAdmin,
  createTestShopItem,
  createTestPurchase,
} from '../../helpers/db'
import { getAuthHeader } from '../../helpers/auth'
import { StudentProfile } from '../../../src/modules/users/studentProfile.model'

describe('Student Shop API', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/student/shop/items', () => {
    it('should return items with isOwned and isEquipped flags', async () => {
      const admin = await createTestAdmin()
      const item1 = await createTestShopItem(admin._id, { name: 'Avatar Pack 1', price: 100 })
      const item2 = await createTestShopItem(admin._id, { name: 'Avatar Pack 2', price: 150 })
      const item3 = await createTestShopItem(admin._id, { name: 'Avatar Pack 3', price: 200 })

      const { user: student, profile } = await createTestStudent()

      // Purchase item1
      await createTestPurchase(student._id, item1._id, 100)

      const res = await request(app)
        .get('/api/student/shop/items')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(3)

      const ownedItem = res.body.data.find((i: { name: string }) => i.name === 'Avatar Pack 1')
      const notOwnedItem = res.body.data.find((i: { name: string }) => i.name === 'Avatar Pack 2')

      expect(ownedItem.isOwned).toBe(true)
      expect(notOwnedItem.isOwned).toBe(false)
    })

    it('should only return active items', async () => {
      const admin = await createTestAdmin()
      await createTestShopItem(admin._id, { name: 'Active Item', isActive: true })
      await createTestShopItem(admin._id, { name: 'Inactive Item', isActive: false })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get('/api/student/shop/items')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0].name).toBe('Active Item')
    })

    it('should include item details', async () => {
      const admin = await createTestAdmin()
      await createTestShopItem(admin._id, {
        name: 'Cool Theme',
        description: 'A cool UI theme',
        category: 'ui_theme',
        price: 250,
      })

      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get('/api/student/shop/items')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data[0].name).toBe('Cool Theme')
      expect(res.body.data[0].description).toBe('A cool UI theme')
      expect(res.body.data[0].category).toBe('ui_theme')
      expect(res.body.data[0].price).toBe(250)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/shop/items')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/student/shop/inventory', () => {
    it('should return only owned items', async () => {
      const admin = await createTestAdmin()
      const item1 = await createTestShopItem(admin._id, { name: 'Owned Item 1', price: 100 })
      const item2 = await createTestShopItem(admin._id, { name: 'Not Owned', price: 150 })
      const item3 = await createTestShopItem(admin._id, { name: 'Owned Item 2', price: 200 })

      const { user: student } = await createTestStudent()

      // Purchase item1 and item3
      await createTestPurchase(student._id, item1._id, 100)
      await createTestPurchase(student._id, item3._id, 200)

      const res = await request(app)
        .get('/api/student/shop/inventory')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(2)

      const itemNames = res.body.data.map((i: { name: string }) => i.name)
      expect(itemNames).toContain('Owned Item 1')
      expect(itemNames).toContain('Owned Item 2')
      expect(itemNames).not.toContain('Not Owned')
    })

    it('should return empty array when no items owned', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .get('/api/student/shop/inventory')
        .set(getAuthHeader(student))

      expect(res.status).toBe(200)
      expect(res.body.data).toHaveLength(0)
    })

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/student/shop/inventory')

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/student/shop/purchase', () => {
    it('should purchase item and deduct currency', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id, { name: 'New Avatar', price: 100 })

      const { user: student, profile } = await createTestStudent()
      await StudentProfile.findByIdAndUpdate(profile._id, { currencyBalance: 500 })

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .set(getAuthHeader(student))
        .send({ itemId: item._id.toString() })

      expect(res.status).toBe(200)
      expect(res.body.data.success).toBe(true)
      expect(res.body.data.newBalance).toBe(400)
      expect(res.body.data.item.name).toBe('New Avatar')
      expect(res.body.data.item.price).toBe(100)

      // Verify balance was deducted
      const updatedProfile = await StudentProfile.findById(profile._id)
      expect(updatedProfile?.currencyBalance).toBe(400)
    })

    it('should return 400 for insufficient funds', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id, { price: 500 })

      const { user: student, profile } = await createTestStudent()
      await StudentProfile.findByIdAndUpdate(profile._id, { currencyBalance: 100 })

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .set(getAuthHeader(student))
        .send({ itemId: item._id.toString() })

      expect(res.status).toBe(400)
    })

    it('should return 409 for already owned permanent item', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id, { price: 100, isPermanent: true })

      const { user: student, profile } = await createTestStudent()
      await StudentProfile.findByIdAndUpdate(profile._id, { currencyBalance: 500 })

      // Already purchased
      await createTestPurchase(student._id, item._id, 100)

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .set(getAuthHeader(student))
        .send({ itemId: item._id.toString() })

      expect(res.status).toBe(409)
    })

    it('should return 404 for non-existent item', async () => {
      const { user: student, profile } = await createTestStudent()
      await StudentProfile.findByIdAndUpdate(profile._id, { currencyBalance: 500 })

      const { Types } = await import('mongoose')
      const fakeId = new Types.ObjectId()

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .set(getAuthHeader(student))
        .send({ itemId: fakeId.toString() })

      expect(res.status).toBe(404)
    })

    it('should return 400 for inactive item', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id, { price: 100, isActive: false })

      const { user: student, profile } = await createTestStudent()
      await StudentProfile.findByIdAndUpdate(profile._id, { currencyBalance: 500 })

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .set(getAuthHeader(student))
        .send({ itemId: item._id.toString() })

      expect(res.status).toBe(400)
    })

    it('should return 422 for missing itemId', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .set(getAuthHeader(student))
        .send({})

      expect(res.status).toBe(422)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id, { price: 100 })

      const res = await request(app)
        .post('/api/student/shop/purchase')
        .send({ itemId: item._id.toString() })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/student/shop/equip', () => {
    it('should equip owned item', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id, { category: 'avatar_pack' })

      const { user: student } = await createTestStudent()
      await createTestPurchase(student._id, item._id, 100)

      const res = await request(app)
        .post('/api/student/shop/equip')
        .set(getAuthHeader(student))
        .send({ itemId: item._id.toString(), slot: 'avatar' })

      expect(res.status).toBe(200)
      expect(res.body.data.success).toBe(true)
    })

    it('should return 403 for not owned item', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id)

      const { user: student } = await createTestStudent()
      // Not purchased

      const res = await request(app)
        .post('/api/student/shop/equip')
        .set(getAuthHeader(student))
        .send({ itemId: item._id.toString(), slot: 'avatar' })

      expect(res.status).toBe(403)
    })

    it('should return 422 for missing required fields', async () => {
      const { user: student } = await createTestStudent()

      const res = await request(app)
        .post('/api/student/shop/equip')
        .set(getAuthHeader(student))
        .send({ itemId: 'someid' }) // missing slot

      expect(res.status).toBe(422)
    })

    it('should return 401 without authentication', async () => {
      const admin = await createTestAdmin()
      const item = await createTestShopItem(admin._id)

      const res = await request(app)
        .post('/api/student/shop/equip')
        .send({ itemId: item._id.toString(), slot: 'avatar' })

      expect(res.status).toBe(401)
    })
  })
})
