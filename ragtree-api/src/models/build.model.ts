import mongoose, { Schema, Document } from 'mongoose'

export interface IEquippedItem {
  item_id?: mongoose.Types.ObjectId
  refine?: number
  cards?: mongoose.Types.ObjectId[]
  enchantments?: Array<{ enchantment_id: mongoose.Types.ObjectId }>
}

export interface IEquipment {
  weapon?: IEquippedItem
  shield?: IEquippedItem
  head_top?: IEquippedItem
  head_mid?: IEquippedItem
  head_low?: IEquippedItem
  armor?: IEquippedItem
  garment?: IEquippedItem
  footgear?: IEquippedItem
  accessory_l?: IEquippedItem
  accessory_r?: IEquippedItem
}

export interface IBuild extends Document {
  user_id: mongoose.Types.ObjectId
  class_id: mongoose.Types.ObjectId
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  equipment: IEquipment
  views: number
  likes: number
  liked_by: mongoose.Types.ObjectId[]
  is_public: boolean
}

const EquippedItemSchema = new Schema<IEquippedItem>({
  item_id: { type: Schema.Types.ObjectId, ref: 'Item' },
  refine: { type: Number, default: 0, min: 0, max: 20 },
  cards: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  enchantments: [{ enchantment_id: { type: Schema.Types.ObjectId, ref: 'Enchantment' } }],
}, { _id: false })

const BuildSchema = new Schema<IBuild>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  title: { type: String, required: true, maxlength: 100, trim: true },
  description: { type: String, maxlength: 500, trim: true },
  tags: [{ type: String, trim: true }],
  skill_points: { type: Schema.Types.Mixed, default: {} },
  base_stats: {
    str: { type: Number, default: 1 },
    agi: { type: Number, default: 1 },
    vit: { type: Number, default: 1 },
    int: { type: Number, default: 1 },
    dex: { type: Number, default: 1 },
    luk: { type: Number, default: 1 }
  },
  equipment: {
    weapon: { type: EquippedItemSchema, default: () => ({}) },
    shield: { type: EquippedItemSchema, default: () => ({}) },
    head_top: { type: EquippedItemSchema, default: () => ({}) },
    head_mid: { type: EquippedItemSchema, default: () => ({}) },
    head_low: { type: EquippedItemSchema, default: () => ({}) },
    armor: { type: EquippedItemSchema, default: () => ({}) },
    garment: { type: EquippedItemSchema, default: () => ({}) },
    footgear: { type: EquippedItemSchema, default: () => ({}) },
    accessory_l: { type: EquippedItemSchema, default: () => ({}) },
    accessory_r: { type: EquippedItemSchema, default: () => ({}) },
  },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_public: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

BuildSchema.index({ class_id: 1, views: -1 })
BuildSchema.index({ class_id: 1, likes: -1 })

export const Build = mongoose.model<IBuild>('Build', BuildSchema)
