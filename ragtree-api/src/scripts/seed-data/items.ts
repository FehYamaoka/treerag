import { dpItem } from './shared'

export const ITEMS = [
  // ── Weapons 1H ──
  { name: 'Sword', slug: 'sword', type: 'weapon' as const, sub_type: '1h-sword', weight: 60, atk: 40, slots: 3, required_level: 1, effects: {}, npc_sell_price: 50, icon_url: dpItem(1101) },
  { name: 'Main Gauche', slug: 'main-gauche', type: 'weapon' as const, sub_type: 'dagger', weight: 40, atk: 43, slots: 3, required_level: 1, effects: {}, npc_sell_price: 120, icon_url: dpItem(1201) },
  { name: 'Knife', slug: 'knife', type: 'weapon' as const, sub_type: 'dagger', weight: 40, atk: 17, slots: 2, required_level: 1, effects: {}, npc_sell_price: 25, icon_url: dpItem(1204) },
  { name: 'Dagger', slug: 'dagger', type: 'weapon' as const, sub_type: 'dagger', weight: 60, atk: 25, slots: 1, required_level: 1, effects: {}, npc_sell_price: 50, icon_url: dpItem(1202) },
  { name: 'Rod', slug: 'rod', type: 'weapon' as const, sub_type: 'staff', weight: 40, atk: 15, matk: 15, slots: 3, required_level: 1, effects: {}, npc_sell_price: 25, icon_url: dpItem(1601) },
  { name: 'Short Bow', slug: 'short-bow', type: 'weapon' as const, sub_type: 'bow', weight: 50, atk: 15, slots: 0, required_level: 1, effects: {}, npc_sell_price: 50, icon_url: dpItem(1701) },

  // ── Weapons 2H ──
  { name: 'Two-Handed Sword', slug: 'two-handed-sword', type: 'weapon' as const, sub_type: '2h-sword', weight: 160, atk: 100, slots: 1, required_level: 33, effects: {}, npc_sell_price: 30000, icon_url: dpItem(1151) },
  { name: 'Staff', slug: 'staff', type: 'weapon' as const, sub_type: 'staff', weight: 40, atk: 25, matk: 25, slots: 2, required_level: 12, effects: {}, npc_sell_price: 1250, icon_url: dpItem(1602) },
  { name: 'Composite Bow', slug: 'composite-bow', type: 'weapon' as const, sub_type: 'bow', weight: 60, atk: 29, slots: 3, required_level: 4, effects: {}, npc_sell_price: 2500, icon_url: dpItem(1707) },
  { name: 'Glaive', slug: 'glaive', type: 'weapon' as const, sub_type: 'spear', weight: 100, atk: 84, slots: 2, required_level: 4, effects: {}, npc_sell_price: 12000, icon_url: dpItem(1401) },

  // ── Armor ──
  { name: 'Leather Armor', slug: 'leather-armor', type: 'armor' as const, sub_type: 'armor', weight: 35, def: 3, slots: 0, required_level: 1, effects: {}, npc_sell_price: 500, icon_url: dpItem(2303) },
  { name: 'Chain Mail', slug: 'chain-mail', type: 'armor' as const, sub_type: 'armor', weight: 33, def: 5, slots: 0, required_level: 20, effects: {}, npc_sell_price: 16000, icon_url: dpItem(2305) },
  { name: 'Plate Armor', slug: 'plate-armor', type: 'armor' as const, sub_type: 'armor', weight: 45, def: 7, slots: 0, required_level: 40, effects: {}, npc_sell_price: 40000, icon_url: dpItem(2307) },
  { name: 'Robe', slug: 'robe', type: 'armor' as const, sub_type: 'armor', weight: 20, def: 2, slots: 0, required_level: 1, effects: {}, npc_sell_price: 200, icon_url: dpItem(2301) },
  { name: 'Cotton Shirt', slug: 'cotton-shirt', type: 'armor' as const, sub_type: 'armor', weight: 10, def: 1, slots: 0, required_level: 1, effects: {}, npc_sell_price: 10, icon_url: dpItem(2302) },

  // ── Headgear ──
  { name: 'Hat', slug: 'hat', type: 'armor' as const, sub_type: 'headgear', weight: 20, def: 2, slots: 0, required_level: 1, effects: {}, npc_sell_price: 200, icon_url: dpItem(2202) },
  { name: 'Helm', slug: 'helm', type: 'armor' as const, sub_type: 'headgear', weight: 60, def: 6, slots: 1, required_level: 1, effects: {}, npc_sell_price: 22000, icon_url: dpItem(2209) },
  { name: 'Cap', slug: 'cap', type: 'armor' as const, sub_type: 'headgear', weight: 40, def: 4, slots: 0, required_level: 1, effects: {}, npc_sell_price: 2000, icon_url: dpItem(2207) },

  // ── Shield ──
  { name: 'Guard', slug: 'guard-shield', type: 'armor' as const, sub_type: 'shield', weight: 30, def: 3, slots: 0, required_level: 1, effects: {}, npc_sell_price: 120, icon_url: dpItem(2101) },
  { name: 'Shield', slug: 'shield', type: 'armor' as const, sub_type: 'shield', weight: 60, def: 6, slots: 0, required_level: 1, effects: {}, npc_sell_price: 28000, icon_url: dpItem(2105) },
  { name: 'Buckler', slug: 'buckler', type: 'armor' as const, sub_type: 'shield', weight: 40, def: 4, slots: 0, required_level: 1, effects: {}, npc_sell_price: 14000, icon_url: dpItem(2103) },

  // ── Footgear ──
  { name: 'Shoes', slug: 'shoes', type: 'armor' as const, sub_type: 'footgear', weight: 20, def: 2, slots: 0, required_level: 1, effects: {}, npc_sell_price: 200, icon_url: dpItem(2401) },
  { name: 'Boots', slug: 'boots', type: 'armor' as const, sub_type: 'footgear', weight: 60, def: 4, slots: 1, required_level: 1, effects: {}, npc_sell_price: 9000, icon_url: dpItem(2403) },
  { name: 'Sandals', slug: 'sandals', type: 'armor' as const, sub_type: 'footgear', weight: 20, def: 3, slots: 0, required_level: 1, effects: {}, npc_sell_price: 2000, icon_url: dpItem(2402) },

  // ── Garment ──
  { name: 'Manteau', slug: 'manteau', type: 'armor' as const, sub_type: 'garment', weight: 60, def: 4, slots: 1, required_level: 1, effects: {}, npc_sell_price: 16000, icon_url: dpItem(2501) },
  { name: 'Muffler', slug: 'muffler', type: 'armor' as const, sub_type: 'garment', weight: 40, def: 2, slots: 0, required_level: 1, effects: {}, npc_sell_price: 2000, icon_url: dpItem(2503) },
  { name: 'Hood', slug: 'hood', type: 'armor' as const, sub_type: 'garment', weight: 20, def: 1, slots: 0, required_level: 1, effects: {}, npc_sell_price: 500, icon_url: dpItem(2502) },

  // ── Accessory ──
  { name: 'Necklace', slug: 'necklace', type: 'armor' as const, sub_type: 'accessory', weight: 10, def: 0, slots: 0, required_level: 1, effects: {}, npc_sell_price: 1100, icon_url: dpItem(2701) },
  { name: 'Earring', slug: 'earring', type: 'armor' as const, sub_type: 'accessory', weight: 10, def: 0, slots: 0, required_level: 1, effects: { int: 2 }, npc_sell_price: 1500, icon_url: dpItem(2703) },
  { name: 'Ring', slug: 'ring', type: 'armor' as const, sub_type: 'accessory', weight: 10, def: 0, slots: 0, required_level: 1, effects: { str: 2 }, npc_sell_price: 1500, icon_url: dpItem(2705) },

  // ── Cards (20) ──
  { name: 'Poring Card', slug: 'poring-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { luk: 2, perfect_dodge: 1 }, npc_sell_price: 10, icon_url: dpItem(4001) },
  { name: 'Lunatic Card', slug: 'lunatic-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { luk: 1, crit: 1, perfect_dodge: 1 }, npc_sell_price: 10, icon_url: dpItem(4005) },
  { name: 'Fabre Card', slug: 'fabre-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { vit: 1, max_hp: 100 }, npc_sell_price: 10, icon_url: dpItem(4008) },
  { name: 'Willow Card', slug: 'willow-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { max_sp: 80 }, npc_sell_price: 10, icon_url: dpItem(4010) },
  { name: 'Skeleton Card', slug: 'skeleton-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { atk_percent: 2 }, npc_sell_price: 10, icon_url: dpItem(4020) },
  { name: 'Hydra Card', slug: 'hydra-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { damage_vs_demi_human: 20 }, npc_sell_price: 10, icon_url: dpItem(4031) },
  { name: 'Thara Frog Card', slug: 'thara-frog-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { reduce_demi_human: 30 }, npc_sell_price: 10, icon_url: dpItem(4051) },
  { name: 'Savage Bebe Card', slug: 'savage-bebe-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { vit: 3 }, npc_sell_price: 10, icon_url: dpItem(4055) },
  { name: 'Marc Card', slug: 'marc-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { water_property_armor: true, freeze_immunity: true }, npc_sell_price: 10, icon_url: dpItem(4057) },
  { name: 'Bathory Card', slug: 'bathory-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { dark_property_armor: true }, npc_sell_price: 10, icon_url: dpItem(4128) },
  { name: 'Marina Card', slug: 'marina-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { freeze_chance: 5 }, npc_sell_price: 10, icon_url: dpItem(4038) },
  { name: 'Vadon Card', slug: 'vadon-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { damage_vs_fire: 20 }, npc_sell_price: 10, icon_url: dpItem(4047) },
  { name: 'Mummy Card', slug: 'mummy-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { hit: 20 }, npc_sell_price: 10, icon_url: dpItem(4053) },
  { name: 'Swordfish Card', slug: 'swordfish-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { water_property_armor: true }, npc_sell_price: 10, icon_url: dpItem(4050) },
  { name: 'Pecopeco Card', slug: 'pecopeco-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { max_hp_percent: 10 }, npc_sell_price: 10, icon_url: dpItem(4041) },
  { name: 'Steel Chonchon Card', slug: 'steel-chonchon-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { def: 2, dodge_vs_wind: true }, npc_sell_price: 10, icon_url: dpItem(4022) },
  { name: 'Orc Warrior Card', slug: 'orc-warrior-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { atk: 3, hit: -5 }, npc_sell_price: 10, icon_url: dpItem(4081) },
  { name: 'Rocker Card', slug: 'rocker-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { dex: 1, atk: 5 }, npc_sell_price: 10, icon_url: dpItem(4027) },
  { name: 'Drops Card', slug: 'drops-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { dex: 1, hit: 3 }, npc_sell_price: 10, icon_url: dpItem(4004) },
  { name: 'Santa Poring Card', slug: 'santa-poring-card', type: 'card' as const, sub_type: 'card', weight: 1, effects: { luk: 2, crit: 1 }, npc_sell_price: 10, icon_url: dpItem(4107) },

  // ── Consumables ──
  { name: 'Red Potion', slug: 'red-potion', type: 'consumable' as const, sub_type: 'healing', weight: 7, effects: { hp_restore: 45 }, npc_sell_price: 25, icon_url: dpItem(501) },
  { name: 'Orange Potion', slug: 'orange-potion', type: 'consumable' as const, sub_type: 'healing', weight: 10, effects: { hp_restore: 105 }, npc_sell_price: 100, icon_url: dpItem(502) },
  { name: 'Yellow Potion', slug: 'yellow-potion', type: 'consumable' as const, sub_type: 'healing', weight: 13, effects: { hp_restore: 175 }, npc_sell_price: 225, icon_url: dpItem(503) },
  { name: 'White Potion', slug: 'white-potion', type: 'consumable' as const, sub_type: 'healing', weight: 15, effects: { hp_restore: 325 }, npc_sell_price: 600, icon_url: dpItem(504) },
  { name: 'Blue Potion', slug: 'blue-potion', type: 'consumable' as const, sub_type: 'healing', weight: 15, effects: { sp_restore: 60 }, npc_sell_price: 2500, icon_url: dpItem(505) },
  { name: 'Fly Wing', slug: 'fly-wing', type: 'consumable' as const, sub_type: 'utility', weight: 5, effects: { teleport: true }, npc_sell_price: 30, icon_url: dpItem(601) },
  { name: 'Butterfly Wing', slug: 'butterfly-wing', type: 'consumable' as const, sub_type: 'utility', weight: 5, effects: { return_to_save_point: true }, npc_sell_price: 150, icon_url: dpItem(602) },
  { name: 'Banana Juice', slug: 'banana-juice', type: 'consumable' as const, sub_type: 'healing', weight: 4, effects: { sp_restore: 25 }, npc_sell_price: 125, icon_url: dpItem(518) },
  { name: 'Apple', slug: 'apple', type: 'consumable' as const, sub_type: 'healing', weight: 2, effects: { hp_restore: 16 }, npc_sell_price: 5, icon_url: dpItem(512) },
  { name: 'Meat', slug: 'meat', type: 'consumable' as const, sub_type: 'healing', weight: 5, effects: { hp_restore: 70 }, npc_sell_price: 25, icon_url: dpItem(517) },
]
