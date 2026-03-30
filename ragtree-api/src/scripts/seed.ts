import { connectDB } from '../db/mongoose'
import { Class } from '../models/class.model'
import { Skill } from '../models/skill.model'
import { Item } from '../models/item.model'
import { Monster } from '../models/monster.model'
import { C } from './seed-data/shared'
import { swordsmanChainSkills } from './seed-data/skills-swordsman-chain'
import { mageChainSkills } from './seed-data/skills-mage-chain'
import { archerChainSkills } from './seed-data/skills-archer-chain'
import { acolyteChainSkills } from './seed-data/skills-acolyte-chain'
import { thiefChainSkills } from './seed-data/skills-thief-chain'
import { merchantChainSkills } from './seed-data/skills-merchant-chain'
import { ITEMS } from './seed-data/items'
import { MONSTERS } from './seed-data/monsters'
import { Enchantment } from '../models/enchantment.model'
import { ENCHANTMENTS } from './seed-data/enchantments'
import rawBrowikiMap from './seed-data/browiki-map.json'

type BrowikiEntry = { name: string; icon_url: string }
const bwMap = rawBrowikiMap as Record<string, BrowikiEntry | undefined>
const bwName = (slug: string, fallback: string) => bwMap[slug]?.name ?? fallback
const bwIcon = (slug: string) => bwMap[slug]?.icon_url ?? ''

const CLASSES = [
  { _id: C.novice, name: bwName('novice', 'Novice'), slug: 'novice', description: 'O início de toda jornada em Midgard.', base_level_max: 10, job_level_max: 10, icon_url: bwIcon('novice') },
  // 1st
  { _id: C.swordsman, name: bwName('swordsman', 'Swordsman'), slug: 'swordsman', description: 'Guerreiros corpo a corpo, base dos Tank e DPS físicos.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('swordsman'), parent_class_id: C.novice },
  { _id: C.mage, name: bwName('mage', 'Mage'), slug: 'mage', description: 'Conjuradores de magias elementais destrutivas.', base_level_max: 99, job_level_max: 40, icon_url: bwIcon('mage'), parent_class_id: C.novice },
  { _id: C.archer, name: bwName('archer', 'Archer'), slug: 'archer', description: 'Especialistas em combate à distância.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('archer'), parent_class_id: C.novice },
  { _id: C.acolyte, name: bwName('acolyte', 'Acolyte'), slug: 'acolyte', description: 'Devotos com poderes de cura e suporte divino.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('acolyte'), parent_class_id: C.novice },
  { _id: C.thief, name: bwName('thief', 'Thief'), slug: 'thief', description: 'Ágeis e furtivos, mestres em velocidade.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('thief'), parent_class_id: C.novice },
  { _id: C.merchant, name: bwName('merchant', 'Merchant'), slug: 'merchant', description: 'Comerciantes com habilidades únicas de suporte.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('merchant'), parent_class_id: C.novice },
  // 2nd
  { _id: C.knight, name: bwName('knight', 'Knight'), slug: 'knight', description: 'Cavaleiros poderosos, força ofensiva da linha de frente.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('knight'), parent_class_id: C.swordsman },
  { _id: C.crusader, name: bwName('crusader', 'Crusader'), slug: 'crusader', description: 'Paladinos sagrados que protegem aliados.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('crusader'), parent_class_id: C.swordsman },
  { _id: C.wizard, name: bwName('wizard', 'Wizard'), slug: 'wizard', description: 'Mestres da destruição mágica em área.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('wizard'), parent_class_id: C.mage },
  { _id: C.sage, name: bwName('sage', 'Sage'), slug: 'sage', description: 'Estudiosos da magia com suporte único.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('sage'), parent_class_id: C.mage },
  { _id: C.hunter, name: bwName('hunter', 'Hunter'), slug: 'hunter', description: 'Caçadores com falcões e armadilhas.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('hunter'), parent_class_id: C.archer },
  { _id: C.bard, name: bwName('bard', 'Bard'), slug: 'bard', description: 'Músicos que fortalecem aliados com canções mágicas.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('bard'), parent_class_id: C.archer },
  { _id: C.dancer, name: bwName('dancer', 'Dancer'), slug: 'dancer', description: 'Dançarinas que enfraquecem inimigos.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('dancer'), parent_class_id: C.archer },
  { _id: C.priest, name: bwName('priest', 'Priest'), slug: 'priest', description: 'Curandeiros sagrados, fundamentais em qualquer grupo.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('priest'), parent_class_id: C.acolyte },
  { _id: C.monk, name: bwName('monk', 'Monk'), slug: 'monk', description: 'Guerreiros espirituais com poder de chi.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('monk'), parent_class_id: C.acolyte },
  { _id: C.assassin, name: bwName('assassin', 'Assassin'), slug: 'assassin', description: 'Assassinos letais com duplo ataque e veneno.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('assassin'), parent_class_id: C.thief },
  { _id: C.rogue, name: bwName('rogue', 'Rogue'), slug: 'rogue', description: 'Pícaros com habilidades de roubo e imitação.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('rogue'), parent_class_id: C.thief },
  { _id: C.blacksmith, name: bwName('blacksmith', 'Blacksmith'), slug: 'blacksmith', description: 'Ferreiros que dominam o fogo e forjam armas.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('blacksmith'), parent_class_id: C.merchant },
  { _id: C.alchemist, name: bwName('alchemist', 'Alchemist'), slug: 'alchemist', description: 'Alquimistas que criam poções e homúnculos.', base_level_max: 99, job_level_max: 50, icon_url: bwIcon('alchemist'), parent_class_id: C.merchant },
  // 3rd (Transcendent)
  { _id: C.lord_knight, name: bwName('lord-knight', 'Lord Knight'), slug: 'lord-knight', description: 'A forma transcendente do Knight.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('lord-knight'), parent_class_id: C.knight },
  { _id: C.paladin, name: bwName('paladin', 'Paladin'), slug: 'paladin', description: 'A forma transcendente do Crusader.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('paladin'), parent_class_id: C.crusader },
  { _id: C.high_wizard, name: bwName('high-wizard', 'High Wizard'), slug: 'high-wizard', description: 'A forma transcendente do Wizard.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('high-wizard'), parent_class_id: C.wizard },
  { _id: C.scholar, name: bwName('scholar', 'Scholar'), slug: 'scholar', description: 'A forma transcendente do Sage.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('scholar'), parent_class_id: C.sage },
  { _id: C.sniper, name: bwName('sniper', 'Sniper'), slug: 'sniper', description: 'A forma transcendente do Hunter.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('sniper'), parent_class_id: C.hunter },
  { _id: C.minstrel, name: bwName('minstrel', 'Minstrel'), slug: 'minstrel', description: 'A forma transcendente do Bard.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('minstrel'), parent_class_id: C.bard },
  { _id: C.gypsy, name: bwName('gypsy', 'Gypsy'), slug: 'gypsy', description: 'A forma transcendente da Dancer.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('gypsy'), parent_class_id: C.dancer },
  { _id: C.high_priest, name: bwName('high-priest', 'High Priest'), slug: 'high-priest', description: 'A forma transcendente do Priest.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('high-priest'), parent_class_id: C.priest },
  { _id: C.champion, name: bwName('champion', 'Champion'), slug: 'champion', description: 'A forma transcendente do Monk.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('champion'), parent_class_id: C.monk },
  { _id: C.assassin_cross, name: bwName('assassin-cross', 'Assassin Cross'), slug: 'assassin-cross', description: 'A forma transcendente do Assassin.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('assassin-cross'), parent_class_id: C.assassin },
  { _id: C.stalker, name: bwName('stalker', 'Stalker'), slug: 'stalker', description: 'A forma transcendente do Rogue.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('stalker'), parent_class_id: C.rogue },
  { _id: C.whitesmith, name: bwName('whitesmith', 'Whitesmith'), slug: 'whitesmith', description: 'A forma transcendente do Blacksmith.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('whitesmith'), parent_class_id: C.blacksmith },
  { _id: C.creator, name: bwName('creator', 'Creator'), slug: 'creator', description: 'A forma transcendente do Alchemist.', base_level_max: 99, job_level_max: 70, icon_url: bwIcon('creator'), parent_class_id: C.alchemist },
  // 4th (Renewal)
  { _id: C.rune_knight, name: bwName('rune-knight', 'Rune Knight'), slug: 'rune-knight', description: 'Knight que domina o poder das runas ancestrais.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('rune-knight'), parent_class_id: C.lord_knight },
  { _id: C.royal_guard, name: bwName('royal-guard', 'Royal Guard'), slug: 'royal-guard', description: 'Guardião real com poder sagrado e auras.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('royal-guard'), parent_class_id: C.paladin },
  { _id: C.arcane_master, name: bwName('arcane-master', 'Arcane Master'), slug: 'arcane-master', description: 'Mago com domínio absoluto das energias arcanas.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('arcane-master'), parent_class_id: C.high_wizard },
  { _id: C.sorcerer, name: bwName('sorcerer', 'Sorcerer'), slug: 'sorcerer', description: 'Feiticeiro que convoca e manipula elementais.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('sorcerer'), parent_class_id: C.scholar },
  { _id: C.ranger, name: bwName('ranger', 'Ranger'), slug: 'ranger', description: 'Ranger com warg e armadilhas avançadas.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('ranger'), parent_class_id: C.sniper },
  { _id: C.maestro, name: bwName('maestro', 'Maestro'), slug: 'maestro', description: 'Músico supremo com canções de poder lendário.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('maestro'), parent_class_id: C.minstrel },
  { _id: C.wanderer, name: bwName('wanderer', 'Wanderer'), slug: 'wanderer', description: 'Dançarina que vaga pelos campos de batalha.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('wanderer'), parent_class_id: C.gypsy },
  { _id: C.archbishop, name: bwName('archbishop', 'Archbishop'), slug: 'archbishop', description: 'Arcebispo com curas e bênçãos divinas supremas.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('archbishop'), parent_class_id: C.high_priest },
  { _id: C.sura, name: bwName('sura', 'Sura'), slug: 'sura', description: 'Mestre das artes marciais com poder de tigre.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('sura'), parent_class_id: C.champion },
  { _id: C.guillotine_cross, name: bwName('guillotine-cross', 'Guillotine Cross'), slug: 'guillotine-cross', description: 'Assassino supremo com venenos mortais.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('guillotine-cross'), parent_class_id: C.assassin_cross },
  { _id: C.shadow_chaser, name: bwName('shadow-chaser', 'Shadow Chaser'), slug: 'shadow-chaser', description: 'Caçador de sombras com habilidades de ilusão.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('shadow-chaser'), parent_class_id: C.stalker },
  { _id: C.mechanic, name: bwName('mechanic', 'Mechanic'), slug: 'mechanic', description: 'Engenheiro que pilota mechas devastadoras.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('mechanic'), parent_class_id: C.whitesmith },
  { _id: C.genetic, name: bwName('genetic', 'Genetic'), slug: 'genetic', description: 'Cientista que manipula plantas e criaturas.', base_level_max: 175, job_level_max: 60, icon_url: bwIcon('genetic'), parent_class_id: C.creator },
]

// Novice skills
const noviceSkills = [
  { class_id: C.novice, name: 'Basic Skill', slug: 'basic-skill', type: 'passive' as const, max_level: 9, description: 'Habilidade básica que desbloqueia funções.', prerequisites: [], icon_url: '', position: { x: 0, y: 0 }, levels: Array.from({ length: 9 }, (_, i) => ({ level: i + 1, sp_cost: 0, cast_time: 0, effects: {} })) },
  { class_id: C.novice, name: 'First Aid', slug: 'first-aid', type: 'active' as const, max_level: 1, target: 'self' as const, description: 'Cura uma pequena quantidade de HP.', prerequisites: [], icon_url: '', position: { x: 1, y: 0 }, levels: [{ level: 1, sp_cost: 3, cast_time: 0, effects: { hp_restore: 5 } }] },
  { class_id: C.novice, name: 'Trick Dead', slug: 'trick-dead', type: 'active' as const, max_level: 1, target: 'self' as const, description: 'Finge de morto para evitar monstros.', prerequisites: [], icon_url: '', position: { x: 2, y: 0 }, levels: [{ level: 1, sp_cost: 5, cast_time: 0, effects: {} }] },
]

const SKILLS = [
  ...noviceSkills,
  ...swordsmanChainSkills,
  ...mageChainSkills,
  ...archerChainSkills,
  ...acolyteChainSkills,
  ...thiefChainSkills,
  ...merchantChainSkills,
]

async function seed() {
  await connectDB()
  console.log('🌱 Seeding...')
  await Class.deleteMany({})
  await Skill.deleteMany({})
  await Item.deleteMany({})
  await Monster.deleteMany({})
  await Enchantment.deleteMany({})
  await Class.insertMany(CLASSES as any[])
  console.log(`✅ ${CLASSES.length} classes`)
  if (SKILLS.length) { await Skill.insertMany(SKILLS as any[]); console.log(`✅ ${SKILLS.length} skills`) }
  if (ITEMS.length) { await Item.insertMany(ITEMS as any[]); console.log(`✅ ${ITEMS.length} items`) }
  if (MONSTERS.length) { await Monster.insertMany(MONSTERS as any[]); console.log(`✅ ${MONSTERS.length} monsters`) }
  if (ENCHANTMENTS.length) { await Enchantment.insertMany(ENCHANTMENTS as any[]); console.log(`✅ ${ENCHANTMENTS.length} enchantments`) }
  console.log('🎉 Done!')
  process.exit(0)
}
seed().catch(err => { console.error('❌', err); process.exit(1) })
