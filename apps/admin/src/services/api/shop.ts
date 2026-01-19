import type { ShopItemCategory } from '@silveredge/shared'
import type { AdminShopItem } from '@/types/admin'
import { api } from './client'
import { API_ENDPOINTS } from './endpoints'

// Re-export types for backward compatibility
export type { AdminShopItem as ShopItem, ShopItemCategory }

export interface CreateShopItemPayload {
  name: string
  description: string
  category: ShopItemCategory
  price: number
  status: 'enabled' | 'disabled'
  gradientFrom?: string
  gradientTo?: string
}

export async function getShopItems(category?: ShopItemCategory): Promise<AdminShopItem[]> {
  return api.get<AdminShopItem[]>(API_ENDPOINTS.shop.list, {
    params: category ? { category } : undefined,
  })
}

export async function getShopItem(id: string): Promise<AdminShopItem> {
  return api.get<AdminShopItem>(API_ENDPOINTS.shop.detail(id))
}

export async function createShopItem(payload: CreateShopItemPayload): Promise<AdminShopItem> {
  return api.post<AdminShopItem>(API_ENDPOINTS.shop.create, payload)
}

export async function updateShopItem(
  id: string,
  payload: Partial<CreateShopItemPayload>
): Promise<AdminShopItem> {
  return api.patch<AdminShopItem>(API_ENDPOINTS.shop.update(id), payload)
}

export async function deleteShopItem(id: string): Promise<void> {
  return api.delete(API_ENDPOINTS.shop.delete(id))
}

export async function toggleShopItemStatus(id: string): Promise<AdminShopItem> {
  return api.patch<AdminShopItem>(API_ENDPOINTS.shop.toggle(id))
}
