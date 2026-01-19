import { Types } from 'mongoose'
import type { PaginationMeta } from '@silveredge/shared'
import { ShopItem, Purchase, type IShopItem } from './shop.model'
import { User } from '../users/users.model'
import { StudentProfile } from '../users/studentProfile.model'
import { ApiError } from '../../utils/ApiError'
import { parsePaginationParams, buildPaginationMeta, buildSortObject } from '../../utils/pagination'
import type { CreateShopItemInput, UpdateShopItemInput, ListShopItemsQuery } from './shop.schema'

export interface ShopItemListResult {
  items: IShopItem[]
  meta: PaginationMeta
}

export async function listShopItems(query: ListShopItemsQuery): Promise<ShopItemListResult> {
  const { page, limit, skip, sortBy, sortOrder } = parsePaginationParams(query)

  const filter: Record<string, unknown> = {}
  if (query.category) {
    filter.category = query.category
  }
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive
  }
  if (query.classId) {
    filter.classId = new Types.ObjectId(query.classId)
  }

  const [items, total] = await Promise.all([
    ShopItem.find(filter).sort(buildSortObject(sortBy, sortOrder)).skip(skip).limit(limit),
    ShopItem.countDocuments(filter),
  ])

  return {
    items,
    meta: buildPaginationMeta(total, page, limit),
  }
}

export async function getShopItemById(id: string): Promise<IShopItem> {
  const item = await ShopItem.findById(id)
  if (!item) {
    throw ApiError.notFound('Shop item')
  }
  return item
}

export async function createShopItem(
  input: CreateShopItemInput,
  createdBy: string
): Promise<IShopItem> {
  const item = await ShopItem.create({
    ...input,
    createdBy: new Types.ObjectId(createdBy),
    classId: input.classId ? new Types.ObjectId(input.classId) : undefined,
    isPermanent: input.isPermanent ?? true,
    isActive: input.isActive ?? true,
  })
  return item
}

export async function updateShopItem(id: string, input: UpdateShopItemInput): Promise<IShopItem> {
  const item = await ShopItem.findById(id)
  if (!item) {
    throw ApiError.notFound('Shop item')
  }

  if (input.classId !== undefined) {
    item.classId = input.classId ? new Types.ObjectId(input.classId) : undefined
  }

  const { classId: _classId, ...rest } = input
  Object.assign(item, rest)
  await item.save()
  return item
}

export async function deleteShopItem(id: string): Promise<void> {
  const item = await ShopItem.findById(id)
  if (!item) {
    throw ApiError.notFound('Shop item')
  }

  // Check if any purchases exist
  const purchaseCount = await Purchase.countDocuments({ itemId: item._id })
  if (purchaseCount > 0) {
    throw ApiError.conflict('Cannot delete item that has been purchased')
  }

  await item.deleteOne()
}

export async function toggleItemActive(id: string): Promise<IShopItem> {
  const item = await ShopItem.findById(id)
  if (!item) {
    throw ApiError.notFound('Shop item')
  }

  item.isActive = !item.isActive
  await item.save()
  return item
}

export async function purchaseItem(itemId: string, studentId: string): Promise<void> {
  const item = await ShopItem.findById(itemId)
  if (!item) {
    throw ApiError.notFound('Shop item')
  }

  if (!item.isActive) {
    throw ApiError.badRequest('This item is not available for purchase')
  }

  const student = await User.findById(studentId)
  if (!student || student.role !== 'student') {
    throw ApiError.badRequest('Invalid student')
  }

  const profile = await StudentProfile.findOne({ userId: studentId })
  if (!profile) {
    throw ApiError.badRequest('Student profile not found')
  }

  // Check if already purchased (for permanent items)
  if (item.isPermanent) {
    const existingPurchase = await Purchase.findOne({
      studentId: new Types.ObjectId(studentId),
      itemId: item._id,
    })
    if (existingPurchase) {
      throw ApiError.conflict('You have already purchased this item')
    }
  }

  // Check if student has enough coins
  if (profile.currencyBalance < item.price) {
    throw ApiError.badRequest('Insufficient coins')
  }

  // Deduct coins
  profile.currencyBalance -= item.price
  await profile.save()

  // Create purchase record
  await Purchase.create({
    studentId: new Types.ObjectId(studentId),
    itemId: item._id,
    price: item.price,
  })

  // Increment purchase count
  await ShopItem.findByIdAndUpdate(itemId, { $inc: { purchaseCount: 1 } })
}

export interface StudentPurchase {
  id: string
  itemId: string
  itemName: string
  category: string
  price: number
  purchasedAt: string
}

export async function getStudentPurchases(studentId: string): Promise<StudentPurchase[]> {
  const purchases = await Purchase.find({ studentId: new Types.ObjectId(studentId) })
    .sort({ purchasedAt: -1 })
    .lean()

  const itemIds = purchases.map((p) => p.itemId)
  const items = await ShopItem.find({ _id: { $in: itemIds } }).lean()
  const itemMap = new Map(items.map((i) => [i._id.toString(), i]))

  return purchases.map((p) => {
    const item = itemMap.get(p.itemId.toString())
    return {
      id: p._id.toString(),
      itemId: p.itemId.toString(),
      itemName: item?.name || 'Unknown Item',
      category: item?.category || 'unknown',
      price: p.price,
      purchasedAt: p.purchasedAt.toISOString(),
    }
  })
}
