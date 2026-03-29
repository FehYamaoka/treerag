import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: 'user' | 'collaborator' | 'admin'
  oauth_providers: Array<{ provider: string; provider_id: string }>
  avatar_url?: string
  created_at: Date
  updated_at: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'collaborator', 'admin'], default: 'user' },
  oauth_providers: [{
    provider: { type: String, required: true },
    provider_id: { type: String, required: true }
  }],
  avatar_url: String,
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })

UserSchema.index({ 'oauth_providers.provider': 1, 'oauth_providers.provider_id': 1 })

export const User = mongoose.model<IUser>('User', UserSchema)
