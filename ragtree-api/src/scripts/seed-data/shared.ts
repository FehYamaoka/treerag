import { Types } from 'mongoose'

// Pre-assigned Class IDs
export const C = {
  novice: new Types.ObjectId(),
  swordsman: new Types.ObjectId(), mage: new Types.ObjectId(),
  archer: new Types.ObjectId(), acolyte: new Types.ObjectId(),
  thief: new Types.ObjectId(), merchant: new Types.ObjectId(),
  knight: new Types.ObjectId(), crusader: new Types.ObjectId(),
  wizard: new Types.ObjectId(), sage: new Types.ObjectId(),
  hunter: new Types.ObjectId(), bard: new Types.ObjectId(),
  dancer: new Types.ObjectId(), priest: new Types.ObjectId(),
  monk: new Types.ObjectId(), assassin: new Types.ObjectId(),
  rogue: new Types.ObjectId(), blacksmith: new Types.ObjectId(),
  alchemist: new Types.ObjectId(), lord_knight: new Types.ObjectId(),
  paladin: new Types.ObjectId(), high_wizard: new Types.ObjectId(),
  scholar: new Types.ObjectId(), sniper: new Types.ObjectId(),
  minstrel: new Types.ObjectId(), gypsy: new Types.ObjectId(),
  high_priest: new Types.ObjectId(), champion: new Types.ObjectId(),
  assassin_cross: new Types.ObjectId(), stalker: new Types.ObjectId(),
  whitesmith: new Types.ObjectId(), creator: new Types.ObjectId(),
  rune_knight: new Types.ObjectId(), royal_guard: new Types.ObjectId(),
  arcane_master: new Types.ObjectId(), sorcerer: new Types.ObjectId(),
  ranger: new Types.ObjectId(), maestro: new Types.ObjectId(),
  wanderer: new Types.ObjectId(), archbishop: new Types.ObjectId(),
  sura: new Types.ObjectId(), guillotine_cross: new Types.ObjectId(),
  shadow_chaser: new Types.ObjectId(), mechanic: new Types.ObjectId(),
  genetic: new Types.ObjectId(),
}

// Pre-assigned Skill IDs for prerequisites
export const S = {
  // Swordsman
  sword_mastery: new Types.ObjectId(), twohand_mastery: new Types.ObjectId(),
  hp_recovery: new Types.ObjectId(), bash: new Types.ObjectId(),
  provoke: new Types.ObjectId(), magnum_break: new Types.ObjectId(),
  endure: new Types.ObjectId(),
  // Knight
  spear_mastery: new Types.ObjectId(), pierce: new Types.ObjectId(),
  brandish_spear: new Types.ObjectId(), two_hand_quicken: new Types.ObjectId(),
  riding: new Types.ObjectId(), cavalry_mastery: new Types.ObjectId(),
  bowling_bash: new Types.ObjectId(), auto_counter: new Types.ObjectId(),
  head_crush: new Types.ObjectId(),
  // Mage
  sp_recovery: new Types.ObjectId(), napalm_beat: new Types.ObjectId(),
  soul_strike: new Types.ObjectId(), cold_bolt: new Types.ObjectId(),
  frost_diver: new Types.ObjectId(), fire_bolt: new Types.ObjectId(),
  lightning_bolt: new Types.ObjectId(), thunderstorm: new Types.ObjectId(),
  fire_ball: new Types.ObjectId(), fire_wall: new Types.ObjectId(),
  // Archer
  owls_eye: new Types.ObjectId(), vultures_eye: new Types.ObjectId(),
  improve_concentration: new Types.ObjectId(), double_strafe: new Types.ObjectId(),
  arrow_shower: new Types.ObjectId(),
  // Acolyte
  divine_protection: new Types.ObjectId(), demon_bane: new Types.ObjectId(),
  heal: new Types.ObjectId(), increase_agi: new Types.ObjectId(),
  blessing: new Types.ObjectId(),
  // Thief
  double_attack: new Types.ObjectId(), steal: new Types.ObjectId(),
  hiding: new Types.ObjectId(), envenom: new Types.ObjectId(),
  // Merchant
  discount: new Types.ObjectId(), overcharge: new Types.ObjectId(),
  pushcart: new Types.ObjectId(), vending: new Types.ObjectId(),
  // Monk
  iron_fists: new Types.ObjectId(), call_spirits: new Types.ObjectId(),
  chain_combo: new Types.ObjectId(), combo_finish: new Types.ObjectId(),
  // Assassin
  katar_mastery: new Types.ObjectId(), sonic_blow: new Types.ObjectId(),
  // Crusader prereqs
  guard: new Types.ObjectId(), holy_cross: new Types.ObjectId(),
  // Hunter prereqs
  falcon_mastery: new Types.ObjectId(),
  // Wizard prereqs
  jupitel_thunder: new Types.ObjectId(),
  // Priest prereqs
  lex_divina: new Types.ObjectId(),
  // Ranger prereqs
  warg_mastery: new Types.ObjectId(),
}

// Helpers
export const lv = (max: number, sp: number[]) =>
  Array.from({ length: max }, (_, i) => ({
    level: i + 1,
    sp_cost: sp[i] ?? sp[sp.length - 1],
    cast_time: 0,
    effects: {} as Record<string, unknown>,
  }))

export const dp = (id: number) => `https://static.divine-pride.net/images/skill/${id}.png`
export const dpItem = (id: number) => `https://static.divine-pride.net/images/item/${id}.png`
export const dpMob = (id: number) => `https://static.divine-pride.net/images/mob/${id}.png`
export const bw = (filename: string) => `https://browiki.org/images/${filename}`
