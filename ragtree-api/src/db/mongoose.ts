import mongoose from 'mongoose'

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set')
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    throw err
  })
  console.log('MongoDB connected')
}
