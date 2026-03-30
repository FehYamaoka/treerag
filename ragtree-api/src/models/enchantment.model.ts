import mongoose, { Schema, Document } from 'mongoose'

export interface IEnchantment extends Document {
  name: string
  slug: string
  system: 'armor' | 'archangel' | 'fallen_angel'
  effects: Record<string, number>
  icon_url?: string
  available_latam: boolean
}

const EnchantmentSchema = new Schema<IEnchantment>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  system: { type: String, enum: ['armor', 'archangel', 'fallen_angel'], required: true },
  effects: { type: Schema.Types.Mixed, default: {} },
  icon_url: String,
  available_latam: { type: Boolean, default: false },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

EnchantmentSchema.index({ system: 1, available_latam: 1 })

export const Enchantment = mongoose.model<IEnchantment>('Enchantment', EnchantmentSchema)
