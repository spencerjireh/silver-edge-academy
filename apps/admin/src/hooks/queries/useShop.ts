import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getShopItems,
  getShopItem,
  createShopItem,
  updateShopItem,
  deleteShopItem,
  toggleShopItemStatus,
  type ShopItemCategory,
  type CreateShopItemPayload,
} from '@/services/api/shop'

export const shopKeys = {
  all: ['shop'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  list: (category?: ShopItemCategory) => [...shopKeys.lists(), category] as const,
  details: () => [...shopKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopKeys.details(), id] as const,
}

export function useShopItems(category?: ShopItemCategory) {
  return useQuery({
    queryKey: shopKeys.list(category),
    queryFn: () => getShopItems(category),
  })
}

export function useShopItem(id: string) {
  return useQuery({
    queryKey: shopKeys.detail(id),
    queryFn: () => getShopItem(id),
    enabled: !!id,
  })
}

export function useCreateShopItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateShopItemPayload) => createShopItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() })
    },
  })
}

export function useUpdateShopItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Partial<CreateShopItemPayload>) =>
      updateShopItem(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shopKeys.detail(variables.id) })
    },
  })
}

export function useDeleteShopItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteShopItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() })
    },
  })
}

export function useToggleShopItemStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => toggleShopItemStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: shopKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shopKeys.detail(id) })
    },
  })
}
