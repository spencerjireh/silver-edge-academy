import { z } from 'zod'

const shopItemCategories = ['avatar_pack', 'ui_theme', 'editor_theme', 'teacher_reward'] as const

export const createShopItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(shopItemCategories),
  price: z.number().int().min(0),
  previewData: z
    .object({
      icons: z.array(z.string()).optional(),
      gradientFrom: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      gradientTo: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
    })
    .optional(),
  assetUrl: z.string().url().optional(),
  isPermanent: z.boolean().optional(),
  isActive: z.boolean().optional(),
  classId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
})

export const updateShopItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(shopItemCategories).optional(),
  price: z.number().int().min(0).optional(),
  previewData: z
    .object({
      icons: z.array(z.string()).optional(),
      gradientFrom: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      gradientTo: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
    })
    .optional(),
  assetUrl: z.string().url().optional(),
  isPermanent: z.boolean().optional(),
  isActive: z.boolean().optional(),
  classId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
})

export const listShopItemsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  category: z.enum(shopItemCategories).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  classId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
})

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID format'),
})

export type CreateShopItemInput = z.infer<typeof createShopItemSchema>
export type UpdateShopItemInput = z.infer<typeof updateShopItemSchema>
export type ListShopItemsQuery = z.infer<typeof listShopItemsQuerySchema>
