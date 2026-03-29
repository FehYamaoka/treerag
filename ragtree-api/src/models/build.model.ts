import mongoose, { Schema, Document } from 'mongoose'

export interface IBuild extends Document {
  user_id: mongoose.Types.ObjectId
  class_id: mongoose.Types.ObjectId
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  equipment_ids: mongoose.Types.ObjectId[]
  views: number
  likes: number
  liked_by: mongoose.Types.ObjectId[]
  is_public: boolean
}

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
  equipment_ids: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  liked_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  is_public: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

BuildSchema.index({ class_id: 1, views: -1 })
BuildSchema.index({ class_id: 1, likes: -1 })

export const Build = mongoose.model<IBuild>('Build', BuildSchema)
