import { Types } from 'mongoose'
import { connectDB } from '../db/mongoose'
import { Class } from '../models/class.model'
import { Skill } from '../models/skill.model'
import { Item } from '../models/item.model'
import { Monster } from '../models/monster.model'

// Pre-assigned IDs for cross-references
const C = {
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

// Pre-assigned Skill IDs needed as prerequisites
const S = {
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
  chain_combo: new Types.ObjectId(),
  // Assassin
  katar_mastery: new Types.ObjectId(), sonic_blow: new Types.ObjectId(),
}

const lv = (max: number, sp: number[]) =>
  Array.from({ length: max }, (_, i) => ({
    level: i + 1,
    sp_cost: sp[i] ?? sp[sp.length - 1],
    cast_time: 0,
    effects: {} as Record<string, unknown>,
  }))

const dp = (id: number) => `https://static.divine-pride.net/images/skill/${id}.png`

const CLASSES = [
  { _id: C.novice, name: 'Novice', slug: 'novice', description: 'O início de toda jornada em Midgard.', base_level_max: 10, job_level_max: 10, icon_url: '🧝' },
  // 1st
  { _id: C.swordsman, name: 'Swordsman', slug: 'swordsman', description: 'Guerreiros corpo a corpo, base dos Tank e DPS físicos.', base_level_max: 99, job_level_max: 50, icon_url: '⚔️', parent_class_id: C.novice },
  { _id: C.mage, name: 'Mage', slug: 'mage', description: 'Conjuradores de magias elementais destrutivas.', base_level_max: 99, job_level_max: 40, icon_url: '🔮', parent_class_id: C.novice },
  { _id: C.archer, name: 'Archer', slug: 'archer', description: 'Especialistas em combate à distância.', base_level_max: 99, job_level_max: 50, icon_url: '🏹', parent_class_id: C.novice },
  { _id: C.acolyte, name: 'Acolyte', slug: 'acolyte', description: 'Devotos com poderes de cura e suporte divino.', base_level_max: 99, job_level_max: 50, icon_url: '✝️', parent_class_id: C.novice },
  { _id: C.thief, name: 'Thief', slug: 'thief', description: 'Ágeis e furtivos, mestres em velocidade.', base_level_max: 99, job_level_max: 50, icon_url: '🔪', parent_class_id: C.novice },
  { _id: C.merchant, name: 'Merchant', slug: 'merchant', description: 'Comerciantes com habilidades únicas de suporte.', base_level_max: 99, job_level_max: 50, icon_url: '💰', parent_class_id: C.novice },
  // 2nd
  { _id: C.knight, name: 'Knight', slug: 'knight', description: 'Cavaleiros poderosos, força ofensiva da linha de frente.', base_level_max: 99, job_level_max: 50, icon_url: '🛡️', parent_class_id: C.swordsman },
  { _id: C.crusader, name: 'Crusader', slug: 'crusader', description: 'Paladinos sagrados que protegem aliados.', base_level_max: 99, job_level_max: 50, icon_url: '⚜️', parent_class_id: C.swordsman },
  { _id: C.wizard, name: 'Wizard', slug: 'wizard', description: 'Mestres da destruição mágica em área.', base_level_max: 99, job_level_max: 50, icon_url: '🌪️', parent_class_id: C.mage },
  { _id: C.sage, name: 'Sage', slug: 'sage', description: 'Estudiosos da magia com suporte único.', base_level_max: 99, job_level_max: 50, icon_url: '📚', parent_class_id: C.mage },
  { _id: C.hunter, name: 'Hunter', slug: 'hunter', description: 'Caçadores com falcões e armadilhas.', base_level_max: 99, job_level_max: 50, icon_url: '🦅', parent_class_id: C.archer },
  { _id: C.bard, name: 'Bard', slug: 'bard', description: 'Músicos que fortalecem aliados com canções mágicas.', base_level_max: 99, job_level_max: 50, icon_url: '🎵', parent_class_id: C.archer },
  { _id: C.dancer, name: 'Dancer', slug: 'dancer', description: 'Dançarinas que enfraquecem inimigos.', base_level_max: 99, job_level_max: 50, icon_url: '💃', parent_class_id: C.archer },
  { _id: C.priest, name: 'Priest', slug: 'priest', description: 'Curandeiros sagrados, fundamentais em qualquer grupo.', base_level_max: 99, job_level_max: 50, icon_url: '🙏', parent_class_id: C.acolyte },
  { _id: C.monk, name: 'Monk', slug: 'monk', description: 'Guerreiros espirituais com poder de chi.', base_level_max: 99, job_level_max: 50, icon_url: '👊', parent_class_id: C.acolyte },
  { _id: C.assassin, name: 'Assassin', slug: 'assassin', description: 'Assassinos letais com duplo ataque e veneno.', base_level_max: 99, job_level_max: 50, icon_url: '🗡️', parent_class_id: C.thief },
  { _id: C.rogue, name: 'Rogue', slug: 'rogue', description: 'Pícaros com habilidades de roubo e imitação.', base_level_max: 99, job_level_max: 50, icon_url: '🎭', parent_class_id: C.thief },
  { _id: C.blacksmith, name: 'Blacksmith', slug: 'blacksmith', description: 'Ferreiros que dominam o fogo e forjam armas.', base_level_max: 99, job_level_max: 50, icon_url: '⚒️', parent_class_id: C.merchant },
  { _id: C.alchemist, name: 'Alchemist', slug: 'alchemist', description: 'Alquimistas que criam poções e homúnculos.', base_level_max: 99, job_level_max: 50, icon_url: '⚗️', parent_class_id: C.merchant },
  // 3rd (Transcendent)
  { _id: C.lord_knight, name: 'Lord Knight', slug: 'lord-knight', description: 'A forma transcendente do Knight.', base_level_max: 99, job_level_max: 70, icon_url: '👑', parent_class_id: C.knight },
  { _id: C.paladin, name: 'Paladin', slug: 'paladin', description: 'A forma transcendente do Crusader.', base_level_max: 99, job_level_max: 70, icon_url: '🌟', parent_class_id: C.crusader },
  { _id: C.high_wizard, name: 'High Wizard', slug: 'high-wizard', description: 'A forma transcendente do Wizard.', base_level_max: 99, job_level_max: 70, icon_url: '✨', parent_class_id: C.wizard },
  { _id: C.scholar, name: 'Scholar', slug: 'scholar', description: 'A forma transcendente do Sage.', base_level_max: 99, job_level_max: 70, icon_url: '📖', parent_class_id: C.sage },
  { _id: C.sniper, name: 'Sniper', slug: 'sniper', description: 'A forma transcendente do Hunter.', base_level_max: 99, job_level_max: 70, icon_url: '🎯', parent_class_id: C.hunter },
  { _id: C.minstrel, name: 'Minstrel', slug: 'minstrel', description: 'A forma transcendente do Bard.', base_level_max: 99, job_level_max: 70, icon_url: '🎶', parent_class_id: C.bard },
  { _id: C.gypsy, name: 'Gypsy', slug: 'gypsy', description: 'A forma transcendente da Dancer.', base_level_max: 99, job_level_max: 70, icon_url: '🌹', parent_class_id: C.dancer },
  { _id: C.high_priest, name: 'High Priest', slug: 'high-priest', description: 'A forma transcendente do Priest.', base_level_max: 99, job_level_max: 70, icon_url: '💫', parent_class_id: C.priest },
  { _id: C.champion, name: 'Champion', slug: 'champion', description: 'A forma transcendente do Monk.', base_level_max: 99, job_level_max: 70, icon_url: '🥊', parent_class_id: C.monk },
  { _id: C.assassin_cross, name: 'Assassin Cross', slug: 'assassin-cross', description: 'A forma transcendente do Assassin.', base_level_max: 99, job_level_max: 70, icon_url: '💀', parent_class_id: C.assassin },
  { _id: C.stalker, name: 'Stalker', slug: 'stalker', description: 'A forma transcendente do Rogue.', base_level_max: 99, job_level_max: 70, icon_url: '🕵️', parent_class_id: C.rogue },
  { _id: C.whitesmith, name: 'Whitesmith', slug: 'whitesmith', description: 'A forma transcendente do Blacksmith.', base_level_max: 99, job_level_max: 70, icon_url: '🔨', parent_class_id: C.blacksmith },
  { _id: C.creator, name: 'Creator', slug: 'creator', description: 'A forma transcendente do Alchemist.', base_level_max: 99, job_level_max: 70, icon_url: '🧪', parent_class_id: C.alchemist },
  // 4th (Renewal)
  { _id: C.rune_knight, name: 'Rune Knight', slug: 'rune-knight', description: 'Knight que domina o poder das runas ancestrais.', base_level_max: 175, job_level_max: 60, icon_url: '⚡', parent_class_id: C.lord_knight },
  { _id: C.royal_guard, name: 'Royal Guard', slug: 'royal-guard', description: 'Guardião real com poder sagrado e auras.', base_level_max: 175, job_level_max: 60, icon_url: '🏰', parent_class_id: C.paladin },
  { _id: C.arcane_master, name: 'Arcane Master', slug: 'arcane-master', description: 'Mago com domínio absoluto das energias arcanas.', base_level_max: 175, job_level_max: 60, icon_url: '🌀', parent_class_id: C.high_wizard },
  { _id: C.sorcerer, name: 'Sorcerer', slug: 'sorcerer', description: 'Feiticeiro que convoca e manipula elementais.', base_level_max: 175, job_level_max: 60, icon_url: '💠', parent_class_id: C.scholar },
  { _id: C.ranger, name: 'Ranger', slug: 'ranger', description: 'Ranger com warg e armadilhas avançadas.', base_level_max: 175, job_level_max: 60, icon_url: '🐺', parent_class_id: C.sniper },
  { _id: C.maestro, name: 'Maestro', slug: 'maestro', description: 'Músico supremo com canções de poder lendário.', base_level_max: 175, job_level_max: 60, icon_url: '🎸', parent_class_id: C.minstrel },
  { _id: C.wanderer, name: 'Wanderer', slug: 'wanderer', description: 'Dançarina que vaga pelos campos de batalha.', base_level_max: 175, job_level_max: 60, icon_url: '🌸', parent_class_id: C.gypsy },
  { _id: C.archbishop, name: 'Archbishop', slug: 'archbishop', description: 'Arcebispo com curas e bênçãos divinas supremas.', base_level_max: 175, job_level_max: 60, icon_url: '⛪', parent_class_id: C.high_priest },
  { _id: C.sura, name: 'Sura', slug: 'sura', description: 'Mestre das artes marciais com poder de tigre.', base_level_max: 175, job_level_max: 60, icon_url: '🐯', parent_class_id: C.champion },
  { _id: C.guillotine_cross, name: 'Guillotine Cross', slug: 'guillotine-cross', description: 'Assassino supremo com venenos mortais.', base_level_max: 175, job_level_max: 60, icon_url: '☠️', parent_class_id: C.assassin_cross },
  { _id: C.shadow_chaser, name: 'Shadow Chaser', slug: 'shadow-chaser', description: 'Caçador de sombras com habilidades de ilusão.', base_level_max: 175, job_level_max: 60, icon_url: '🎨', parent_class_id: C.stalker },
  { _id: C.mechanic, name: 'Mechanic', slug: 'mechanic', description: 'Engenheiro que pilota mechas devastadoras.', base_level_max: 175, job_level_max: 60, icon_url: '🤖', parent_class_id: C.whitesmith },
  { _id: C.genetic, name: 'Genetic', slug: 'genetic', description: 'Cientista que manipula plantas e criaturas.', base_level_max: 175, job_level_max: 60, icon_url: '🌿', parent_class_id: C.creator },
]

const SKILLS: any[] = []
const ITEMS: any[] = []
const MONSTERS: any[] = []

async function seed() {
  await connectDB()
  console.log('🌱 Seeding...')
  await Class.deleteMany({})
  await Skill.deleteMany({})
  await Item.deleteMany({})
  await Monster.deleteMany({})
  await Class.insertMany(CLASSES as any[])
  console.log(`✅ ${CLASSES.length} classes`)
  if (SKILLS.length) { await Skill.insertMany(SKILLS); console.log(`✅ ${SKILLS.length} skills`) }
  if (ITEMS.length) { await Item.insertMany(ITEMS); console.log(`✅ ${ITEMS.length} items`) }
  if (MONSTERS.length) { await Monster.insertMany(MONSTERS); console.log(`✅ ${MONSTERS.length} monsters`) }
  console.log('🎉 Done!')
  process.exit(0)
}
seed().catch(err => { console.error('❌', err); process.exit(1) })
