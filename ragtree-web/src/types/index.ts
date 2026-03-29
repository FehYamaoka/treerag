export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'collaborator' | 'admin'
  avatar_url?: string
}

export interface Class {
  _id: string
  name: string
  slug: string
  description: string
  base_level_max: number
  job_level_max: number
  parent_class_id?: string
  icon_url?: string
  skills?: Skill[]
}

export interface Skill {
  _id: string
  class_id: string
  name: string
  slug: string
  description: string
  max_level: number
  type: 'active' | 'passive' | 'buff' | 'support'
  prerequisites: Array<{ skill_id: string; required_level: number }>
  icon_url?: string
  levels: Array<{ level: number; sp_cost: number; effects: Record<string, unknown> }>
  position?: { x: number; y: number }
}

export interface Build {
  _id: string
  user_id: User | string
  class_id: Class | string
  title: string
  description?: string
  tags: string[]
  skill_points: Record<string, number>
  base_stats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
  views: number
  likes: number
  is_public: boolean
  createdAt: string
}

export interface Item {
  _id: string
  name: string
  slug: string
  type: 'weapon' | 'armor' | 'card' | 'consumable' | 'misc'
  sub_type?: string
  weight?: number
  atk?: number
  def?: number
  slots?: number
  required_level?: number
  icon_url?: string
}

export interface Monster {
  _id: string
  name: string
  slug: string
  level: number
  hp: number
  exp: number
  element: string
  drop_items: Array<{ item_id: Item; rate: number }>
  icon_url?: string
}
