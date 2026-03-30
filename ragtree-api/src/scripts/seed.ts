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
import browikiMap from './seed-data/browiki-map.json'

const CLASSES = [
  { _id: C.novice, name: (browikiMap as any).novice?.name ?? 'Novice', slug: 'novice', description: 'O início de toda jornada em Midgard.', base_level_max: 10, job_level_max: 10, icon_url: (browikiMap as any).novice?.icon_url ?? '' },
  // 1st
  { _id: C.swordsman, name: (browikiMap as any).swordsman?.name ?? 'Swordsman', slug: 'swordsman', description: 'Guerreiros corpo a corpo, base dos Tank e DPS físicos.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).swordsman?.icon_url ?? '', parent_class_id: C.novice },
  { _id: C.mage, name: (browikiMap as any).mage?.name ?? 'Mage', slug: 'mage', description: 'Conjuradores de magias elementais destrutivas.', base_level_max: 99, job_level_max: 40, icon_url: (browikiMap as any).mage?.icon_url ?? '', parent_class_id: C.novice },
  { _id: C.archer, name: (browikiMap as any).archer?.name ?? 'Archer', slug: 'archer', description: 'Especialistas em combate à distância.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).archer?.icon_url ?? '', parent_class_id: C.novice },
  { _id: C.acolyte, name: (browikiMap as any).acolyte?.name ?? 'Acolyte', slug: 'acolyte', description: 'Devotos com poderes de cura e suporte divino.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).acolyte?.icon_url ?? '', parent_class_id: C.novice },
  { _id: C.thief, name: (browikiMap as any).thief?.name ?? 'Thief', slug: 'thief', description: 'Ágeis e furtivos, mestres em velocidade.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).thief?.icon_url ?? '', parent_class_id: C.novice },
  { _id: C.merchant, name: (browikiMap as any).merchant?.name ?? 'Merchant', slug: 'merchant', description: 'Comerciantes com habilidades únicas de suporte.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).merchant?.icon_url ?? '', parent_class_id: C.novice },
  // 2nd
  { _id: C.knight, name: (browikiMap as any).knight?.name ?? 'Knight', slug: 'knight', description: 'Cavaleiros poderosos, força ofensiva da linha de frente.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).knight?.icon_url ?? '', parent_class_id: C.swordsman },
  { _id: C.crusader, name: (browikiMap as any).crusader?.name ?? 'Crusader', slug: 'crusader', description: 'Paladinos sagrados que protegem aliados.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).crusader?.icon_url ?? '', parent_class_id: C.swordsman },
  { _id: C.wizard, name: (browikiMap as any).wizard?.name ?? 'Wizard', slug: 'wizard', description: 'Mestres da destruição mágica em área.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).wizard?.icon_url ?? '', parent_class_id: C.mage },
  { _id: C.sage, name: (browikiMap as any).sage?.name ?? 'Sage', slug: 'sage', description: 'Estudiosos da magia com suporte único.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).sage?.icon_url ?? '', parent_class_id: C.mage },
  { _id: C.hunter, name: (browikiMap as any).hunter?.name ?? 'Hunter', slug: 'hunter', description: 'Caçadores com falcões e armadilhas.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).hunter?.icon_url ?? '', parent_class_id: C.archer },
  { _id: C.bard, name: (browikiMap as any).bard?.name ?? 'Bard', slug: 'bard', description: 'Músicos que fortalecem aliados com canções mágicas.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).bard?.icon_url ?? '', parent_class_id: C.archer },
  { _id: C.dancer, name: (browikiMap as any).dancer?.name ?? 'Dancer', slug: 'dancer', description: 'Dançarinas que enfraquecem inimigos.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).dancer?.icon_url ?? '', parent_class_id: C.archer },
  { _id: C.priest, name: (browikiMap as any).priest?.name ?? 'Priest', slug: 'priest', description: 'Curandeiros sagrados, fundamentais em qualquer grupo.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).priest?.icon_url ?? '', parent_class_id: C.acolyte },
  { _id: C.monk, name: (browikiMap as any).monk?.name ?? 'Monk', slug: 'monk', description: 'Guerreiros espirituais com poder de chi.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).monk?.icon_url ?? '', parent_class_id: C.acolyte },
  { _id: C.assassin, name: (browikiMap as any).assassin?.name ?? 'Assassin', slug: 'assassin', description: 'Assassinos letais com duplo ataque e veneno.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).assassin?.icon_url ?? '', parent_class_id: C.thief },
  { _id: C.rogue, name: (browikiMap as any).rogue?.name ?? 'Rogue', slug: 'rogue', description: 'Pícaros com habilidades de roubo e imitação.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).rogue?.icon_url ?? '', parent_class_id: C.thief },
  { _id: C.blacksmith, name: (browikiMap as any).blacksmith?.name ?? 'Blacksmith', slug: 'blacksmith', description: 'Ferreiros que dominam o fogo e forjam armas.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).blacksmith?.icon_url ?? '', parent_class_id: C.merchant },
  { _id: C.alchemist, name: (browikiMap as any).alchemist?.name ?? 'Alchemist', slug: 'alchemist', description: 'Alquimistas que criam poções e homúnculos.', base_level_max: 99, job_level_max: 50, icon_url: (browikiMap as any).alchemist?.icon_url ?? '', parent_class_id: C.merchant },
  // 3rd (Transcendent)
  { _id: C.lord_knight, name: (browikiMap as any)['lord-knight']?.name ?? 'Lord Knight', slug: 'lord-knight', description: 'A forma transcendente do Knight.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any)['lord-knight']?.icon_url ?? '', parent_class_id: C.knight },
  { _id: C.paladin, name: (browikiMap as any).paladin?.name ?? 'Paladin', slug: 'paladin', description: 'A forma transcendente do Crusader.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).paladin?.icon_url ?? '', parent_class_id: C.crusader },
  { _id: C.high_wizard, name: (browikiMap as any)['high-wizard']?.name ?? 'High Wizard', slug: 'high-wizard', description: 'A forma transcendente do Wizard.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any)['high-wizard']?.icon_url ?? '', parent_class_id: C.wizard },
  { _id: C.scholar, name: (browikiMap as any).scholar?.name ?? 'Scholar', slug: 'scholar', description: 'A forma transcendente do Sage.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).scholar?.icon_url ?? '', parent_class_id: C.sage },
  { _id: C.sniper, name: (browikiMap as any).sniper?.name ?? 'Sniper', slug: 'sniper', description: 'A forma transcendente do Hunter.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).sniper?.icon_url ?? '', parent_class_id: C.hunter },
  { _id: C.minstrel, name: (browikiMap as any).minstrel?.name ?? 'Minstrel', slug: 'minstrel', description: 'A forma transcendente do Bard.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).minstrel?.icon_url ?? '', parent_class_id: C.bard },
  { _id: C.gypsy, name: (browikiMap as any).gypsy?.name ?? 'Gypsy', slug: 'gypsy', description: 'A forma transcendente da Dancer.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).gypsy?.icon_url ?? '', parent_class_id: C.dancer },
  { _id: C.high_priest, name: (browikiMap as any)['high-priest']?.name ?? 'High Priest', slug: 'high-priest', description: 'A forma transcendente do Priest.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any)['high-priest']?.icon_url ?? '', parent_class_id: C.priest },
  { _id: C.champion, name: (browikiMap as any).champion?.name ?? 'Champion', slug: 'champion', description: 'A forma transcendente do Monk.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).champion?.icon_url ?? '', parent_class_id: C.monk },
  { _id: C.assassin_cross, name: (browikiMap as any)['assassin-cross']?.name ?? 'Assassin Cross', slug: 'assassin-cross', description: 'A forma transcendente do Assassin.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any)['assassin-cross']?.icon_url ?? '', parent_class_id: C.assassin },
  { _id: C.stalker, name: (browikiMap as any).stalker?.name ?? 'Stalker', slug: 'stalker', description: 'A forma transcendente do Rogue.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).stalker?.icon_url ?? '', parent_class_id: C.rogue },
  { _id: C.whitesmith, name: (browikiMap as any).whitesmith?.name ?? 'Whitesmith', slug: 'whitesmith', description: 'A forma transcendente do Blacksmith.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).whitesmith?.icon_url ?? '', parent_class_id: C.blacksmith },
  { _id: C.creator, name: (browikiMap as any).creator?.name ?? 'Creator', slug: 'creator', description: 'A forma transcendente do Alchemist.', base_level_max: 99, job_level_max: 70, icon_url: (browikiMap as any).creator?.icon_url ?? '', parent_class_id: C.alchemist },
  // 4th (Renewal)
  { _id: C.rune_knight, name: (browikiMap as any)['rune-knight']?.name ?? 'Rune Knight', slug: 'rune-knight', description: 'Knight que domina o poder das runas ancestrais.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any)['rune-knight']?.icon_url ?? '', parent_class_id: C.lord_knight },
  { _id: C.royal_guard, name: (browikiMap as any)['royal-guard']?.name ?? 'Royal Guard', slug: 'royal-guard', description: 'Guardião real com poder sagrado e auras.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any)['royal-guard']?.icon_url ?? '', parent_class_id: C.paladin },
  { _id: C.arcane_master, name: (browikiMap as any)['arcane-master']?.name ?? 'Arcane Master', slug: 'arcane-master', description: 'Mago com domínio absoluto das energias arcanas.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any)['arcane-master']?.icon_url ?? '', parent_class_id: C.high_wizard },
  { _id: C.sorcerer, name: (browikiMap as any).sorcerer?.name ?? 'Sorcerer', slug: 'sorcerer', description: 'Feiticeiro que convoca e manipula elementais.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).sorcerer?.icon_url ?? '', parent_class_id: C.scholar },
  { _id: C.ranger, name: (browikiMap as any).ranger?.name ?? 'Ranger', slug: 'ranger', description: 'Ranger com warg e armadilhas avançadas.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).ranger?.icon_url ?? '', parent_class_id: C.sniper },
  { _id: C.maestro, name: (browikiMap as any).maestro?.name ?? 'Maestro', slug: 'maestro', description: 'Músico supremo com canções de poder lendário.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).maestro?.icon_url ?? '', parent_class_id: C.minstrel },
  { _id: C.wanderer, name: (browikiMap as any).wanderer?.name ?? 'Wanderer', slug: 'wanderer', description: 'Dançarina que vaga pelos campos de batalha.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).wanderer?.icon_url ?? '', parent_class_id: C.gypsy },
  { _id: C.archbishop, name: (browikiMap as any).archbishop?.name ?? 'Archbishop', slug: 'archbishop', description: 'Arcebispo com curas e bênçãos divinas supremas.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).archbishop?.icon_url ?? '', parent_class_id: C.high_priest },
  { _id: C.sura, name: (browikiMap as any).sura?.name ?? 'Sura', slug: 'sura', description: 'Mestre das artes marciais com poder de tigre.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).sura?.icon_url ?? '', parent_class_id: C.champion },
  { _id: C.guillotine_cross, name: (browikiMap as any)['guillotine-cross']?.name ?? 'Guillotine Cross', slug: 'guillotine-cross', description: 'Assassino supremo com venenos mortais.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any)['guillotine-cross']?.icon_url ?? '', parent_class_id: C.assassin_cross },
  { _id: C.shadow_chaser, name: (browikiMap as any)['shadow-chaser']?.name ?? 'Shadow Chaser', slug: 'shadow-chaser', description: 'Caçador de sombras com habilidades de ilusão.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any)['shadow-chaser']?.icon_url ?? '', parent_class_id: C.stalker },
  { _id: C.mechanic, name: (browikiMap as any).mechanic?.name ?? 'Mechanic', slug: 'mechanic', description: 'Engenheiro que pilota mechas devastadoras.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).mechanic?.icon_url ?? '', parent_class_id: C.whitesmith },
  { _id: C.genetic, name: (browikiMap as any).genetic?.name ?? 'Genetic', slug: 'genetic', description: 'Cientista que manipula plantas e criaturas.', base_level_max: 175, job_level_max: 60, icon_url: (browikiMap as any).genetic?.icon_url ?? '', parent_class_id: C.creator },
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
  await Class.insertMany(CLASSES as any[])
  console.log(`✅ ${CLASSES.length} classes`)
  if (SKILLS.length) { await Skill.insertMany(SKILLS as any[]); console.log(`✅ ${SKILLS.length} skills`) }
  if (ITEMS.length) { await Item.insertMany(ITEMS as any[]); console.log(`✅ ${ITEMS.length} items`) }
  if (MONSTERS.length) { await Monster.insertMany(MONSTERS as any[]); console.log(`✅ ${MONSTERS.length} monsters`) }
  console.log('🎉 Done!')
  process.exit(0)
}
seed().catch(err => { console.error('❌', err); process.exit(1) })
