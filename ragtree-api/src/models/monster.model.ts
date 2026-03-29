import mongoose, { Schema, Document } from 'mongoose'

export interface IMonster extends Document {
  name: string
  slug: string
  level: number
  hp: number
  atk: number
  matk: number
  def: number
  mdef: number
  exp: number
  job_exp: number
  element: string
  race: string
  size: 'small' | 'medium' | 'large'
  drop_items: Array<{ item_id: mongoose.Types.ObjectId; rate: number }>
  spawn_locations: Array<{ map: string; coordinates?: string }>
  icon_url?: string
}

const MonsterSchema = new Schema<IMonster>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  level: Number,
  hp: Number,
  atk: Number,
  matk: Number,
  def: Number,
  mdef: Number,
  exp: Number,
  job_exp: Number,
  element: { type: String, trim: true },
  race: { type: String, trim: true },
  size: { type: String, enum: ['small', 'medium', 'large'] },
  drop_items: [{
    item_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    rate: { type: Number, required: true }
  }],
  spawn_locations: [{
    map: { type: String, required: true, trim: true },
    coordinates: { type: String, trim: true }
  }],
  icon_url: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export const Monster = mongoose.model<IMonster>('Monster', MonsterSchema)
