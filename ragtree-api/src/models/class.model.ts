import mongoose, { Schema, Document } from 'mongoose'

export interface IClass extends Document {
  name: string
  slug: string
  description: string
  base_level_max: number
  job_level_max: number
  parent_class_id?: mongoose.Types.ObjectId
  icon_url?: string
}

const ClassSchema = new Schema<IClass>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, trim: true },
  base_level_max: { type: Number, default: 175 },
  job_level_max: { type: Number, default: 60 },
  parent_class_id: { type: Schema.Types.ObjectId, ref: 'Class' },
  icon_url: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

export const Class = mongoose.model<IClass>('Class', ClassSchema)
