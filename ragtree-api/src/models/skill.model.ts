import mongoose, { Schema, Document } from 'mongoose'

export interface ISkill extends Document {
  class_id: mongoose.Types.ObjectId
  name: string
  slug: string
  description: string
  max_level: number
  type: 'active' | 'passive' | 'buff' | 'support'
  element?: string
  target?: 'self' | 'enemy' | 'ally' | 'area'
  prerequisites: Array<{ skill_id: mongoose.Types.ObjectId; required_level: number }>
  icon_url?: string
  levels: Array<{
    level: number
    sp_cost: number
    cast_time?: number
    delay?: number
    effects: Record<string, unknown>
  }>
  position?: { x: number; y: number }
}

const SkillSchema = new Schema<ISkill>({
  class_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  max_level: { type: Number, required: true },
  type: { type: String, enum: ['active', 'passive', 'buff', 'support'], required: true },
  element: { type: String, trim: true },
  target: { type: String, enum: ['self', 'enemy', 'ally', 'area'] },
  prerequisites: [{
    skill_id: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    required_level: { type: Number, required: true }
  }],
  icon_url: String,
  levels: [{
    level: { type: Number, required: true },
    sp_cost: { type: Number, required: true },
    cast_time: Number,
    delay: Number,
    effects: { type: Schema.Types.Mixed, default: {} }
  }],
  position: { x: Number, y: Number }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

SkillSchema.index({ class_id: 1, slug: 1 }, { unique: true })

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema)
