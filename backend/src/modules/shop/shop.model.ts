import { Schema, model, Document, Types } from 'mongoose'
import { toJSONOptions } from '../../utils/mongoose'
import type { ShopItemCategory } from '@silveredge/shared'

export interface IShopItem extends Document {
  _id: Types.ObjectId
  name: string
  description?: string
  category: ShopItemCategory
  price: number
  previewData?: {
    icons?: string[]
    gradientFrom?: string
    gradientTo?: string
  }
  assetUrl?: string
  isPermanent: boolean
  isActive: boolean
  purchaseCount: number
  createdBy: Types.ObjectId
  classId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const shopItemSchema = new Schema<IShopItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ['avatar_pack', 'ui_theme', 'editor_theme', 'teacher_reward'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    previewData: {
      icons: [String],
      gradientFrom: String,
      gradientTo: String,
    },
    assetUrl: String,
    isPermanent: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    purchaseCount: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
  }
)

shopItemSchema.index({ category: 1 })
shopItemSchema.index({ isActive: 1 })
shopItemSchema.index({ classId: 1 })

export const ShopItem = model<IShopItem>('ShopItem', shopItemSchema)

// Purchase record
export interface IPurchase extends Document {
  _id: Types.ObjectId
  studentId: Types.ObjectId
  itemId: Types.ObjectId
  price: number
  purchasedAt: Date
}

const purchaseSchema = new Schema<IPurchase>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'ShopItem', required: true },
    price: { type: Number, required: true, min: 0 },
    purchasedAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
  }
)

purchaseSchema.index({ studentId: 1 })
purchaseSchema.index({ itemId: 1 })
purchaseSchema.index({ studentId: 1, itemId: 1 })

export const Purchase = model<IPurchase>('Purchase', purchaseSchema)
