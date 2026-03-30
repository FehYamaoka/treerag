import mongoose, { Schema, Document } from 'mongoose'

export interface IItem extends Document {
  name: string
  slug: string
  type: 'weapon' | 'armor' | 'card' | 'consumable' | 'misc'
  sub_type?: string
  weight?: number
  atk?: number
  matk?: number
  def?: number
  mdef?: number
  slots?: number
  required_level?: number
  required_job?: string
  effects: Record<string, unknown>
  drop_sources: Array<{ monster_id: mongoose.Types.ObjectId; rate: number }>
  npc_sell_price?: number
  icon_url?: string
  equip_slot?: string[]
  equip_jobs?: string[]
  weapon_level?: number
  refineable?: boolean
  available_latam?: boolean
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  type: { type: String, enum: ['weapon', 'armor', 'card', 'consumable', 'misc'], required: true },
  sub_type: { type: String, trim: true },
  weight: Number,
  atk: Number,
  matk: Number,
  def: Number,
  mdef: Number,
  slots: Number,
  required_level: Number,
  required_job: { type: String, trim: true },
  effects: { type: Schema.Types.Mixed, default: {} },
  drop_sources: [{
    monster_id: { type: Schema.Types.ObjectId, ref: 'Monster', required: true },
    rate: { type: Number, required: true }
  }],
  npc_sell_price: Number,
  icon_url: String,
  equip_slot: [{ type: String, trim: true }],
  equip_jobs: [{ type: String, trim: true }],
  weapon_level: Number,
  refineable: { type: Boolean, default: false },
  available_latam: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

ItemSchema.index({ name: 'text' })
ItemSchema.index({ equip_slot: 1, available_latam: 1 })

export const Item = mongoose.model<IItem>('Item', ItemSchema)
