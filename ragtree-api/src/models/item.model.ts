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
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

ItemSchema.index({ name: 'text' })

export const Item = mongoose.model<IItem>('Item', ItemSchema)
