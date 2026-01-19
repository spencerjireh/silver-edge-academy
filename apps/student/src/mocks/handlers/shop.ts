import { http, HttpResponse, delay } from 'msw'
import { mockStudents, validateMockToken } from '../data/auth'
import { mockShopItems, mockOwnedItems, mockEquippedItems } from '../data/shop'
import type { StudentShopItem } from '@/types/student'

export const shopHandlers = [
  // Get all shop items
  http.get('/api/student/shop/items', async ({ request }) => {
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

    const student = mockStudents.find((s) => s.id === userId)
    if (!student) {
      return HttpResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    const ownedIds = mockOwnedItems[userId] || []
    const equippedItems = mockEquippedItems[userId] || {}

    // Filter items: show all except teacher rewards from other classes
    const items: StudentShopItem[] = mockShopItems
      .filter((item) => {
        if (item.category === 'teacher_reward') {
          return item.classId === student.classId
        }
        return true
      })
      .map((item) => ({
        ...item,
        isOwned: ownedIds.includes(item.id),
        isEquipped: Object.values(equippedItems).includes(item.id),
      }))

    return HttpResponse.json({ items })
  }),

  // Get inventory (owned items)
  http.get('/api/student/shop/inventory', async ({ request }) => {
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

    const ownedIds = mockOwnedItems[userId] || []
    const equippedItems = mockEquippedItems[userId] || {}

    const items = mockShopItems
      .filter((item) => ownedIds.includes(item.id))
      .map((item) => ({
        ...item,
        isOwned: true,
        isEquipped: Object.values(equippedItems).includes(item.id),
      }))

    return HttpResponse.json({ items, equipped: equippedItems })
  }),

  // Purchase item
  http.post('/api/student/shop/purchase', async ({ request }) => {
    await delay(400)

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

    const body = (await request.json()) as { itemId: string }
    const item = mockShopItems.find((i) => i.id === body.itemId)

    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      )
    }

    const student = mockStudents.find((s) => s.id === userId)
    if (!student) {
      return HttpResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    const ownedIds = mockOwnedItems[userId] || []

    if (ownedIds.includes(item.id)) {
      return HttpResponse.json(
        { error: { code: 'ITEM_ALREADY_OWNED', message: 'You already own this item' } },
        { status: 409 }
      )
    }

    if (student.currencyBalance < item.price) {
      return HttpResponse.json(
        { error: { code: 'INSUFFICIENT_COINS', message: 'Not enough coins' } },
        { status: 400 }
      )
    }

    // In a real implementation, this would update the database
    // For mock, we just return success
    const newBalance = student.currencyBalance - item.price

    return HttpResponse.json({
      success: true,
      newBalance,
      item,
    })
  }),

  // Equip item
  http.post('/api/student/shop/equip', async ({ request }) => {
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

    const body = (await request.json()) as { itemId: string }
    const item = mockShopItems.find((i) => i.id === body.itemId)

    if (!item) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Item not found' } },
        { status: 404 }
      )
    }

    const ownedIds = mockOwnedItems[userId] || []

    if (!ownedIds.includes(item.id)) {
      return HttpResponse.json(
        { error: { code: 'NOT_OWNED', message: 'You do not own this item' } },
        { status: 400 }
      )
    }

    return HttpResponse.json({ success: true, item })
  }),
]
