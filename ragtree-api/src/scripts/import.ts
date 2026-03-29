#!/usr/bin/env bun
import mongoose from 'mongoose'
import { readFileSync } from 'fs'

const [,, collection, filePath] = process.argv

if (!collection || !filePath) {
  console.error('Usage: bun run src/scripts/import.ts <collection> <file.json>')
  process.exit(1)
}

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ragtree')

const models: Record<string, mongoose.Model<any>> = {
  items: (await import('../models/item.model')).Item,
  monsters: (await import('../models/monster.model')).Monster,
  classes: (await import('../models/class.model')).Class,
  skills: (await import('../models/skill.model')).Skill,
}

const Model = models[collection]
if (!Model) { console.error(`Unknown collection: ${collection}`); process.exit(1) }

const data = JSON.parse(readFileSync(filePath, 'utf-8'))
const arr = Array.isArray(data) ? data : [data]

const result = await Model.insertMany(arr, { ordered: false })
console.log(`Imported ${result.length} documents to ${collection}`)
await mongoose.disconnect()
