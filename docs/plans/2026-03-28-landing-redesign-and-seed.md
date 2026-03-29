# Landing Page Redesign + Seed Data

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Redesign homepage with cinematic RO-nostalgia aesthetic + seed MongoDB with complete RO class/skill/item/monster data.

**Architecture:** 4 new landing components (`HeroSection`, `FeaturesSection`, `ClassesSection`, `BuildsSection`). Single idempotent `seed.ts` Bun script with pre-assigned ObjectIds.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Bun, Mongoose, MongoDB

**Spec:** `/home/fehyamaoka/Projects/ragtree/docs/specs/2026-03-28-landing-page-and-seed-data-design.md`

---

## Task 1 — Seed script: classes

**Files:**
- Create: `ragtree-api/src/scripts/seed.ts`

- [ ] Create `seed.ts` with all class data:

```typescript
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
```

- [ ] Verify it runs without errors (SKILLS/ITEMS/MONSTERS are empty arrays — that's expected):
```bash
cd /home/fehyamaoka/Projects/ragtree/ragtree-api
MONGODB_URI=mongodb://localhost:27017/ragtree bun run src/scripts/seed.ts
```
Expected output: `🌱 Seeding... ✅ 46 classes 🎉 Done!`

Note: run against the Docker mongo via `mongodb://mongo:27017/ragtree` when running inside Docker, or expose port 27017 temporarily for local dev.

- [ ] Commit: `git add src/scripts/seed.ts && git commit -m "feat: add seed script with all RO classes"`

---

## Task 2 — Seed: skills (all classes)

**Files:**
- Modify: `ragtree-api/src/scripts/seed.ts` — populate `SKILLS` array

**Icon URLs:** `https://static.divine-pride.net/images/skill/{id}.png` — verify IDs at divine-pride.net/database/skill

- [ ] Replace `const SKILLS: any[] = []` with the complete array. Include 8–12 canonical skills per class. Each entry follows this shape:

```typescript
{ _id: S.bash, class_id: C.swordsman, name: 'Bash', slug: 'bash', type: 'active' as const, max_level: 10, target: 'enemy' as const, description: 'Ataque físico poderoso.', prerequisites: [], icon_url: dp(5), position: { x: 0, y: 2 }, levels: lv(10, [10,12,14,16,18,20,22,24,26,28]) },
```

**Skills to implement per chain (canonical RO skills):**

**Novice (3):** Basic Skill (passive 9), First Aid (active 1), Trick Dead (active 1)

**Swordsman (7):** Sword Mastery (passive 10, pos 0,0), Two-Hand Sword Mastery (passive 10, pos 2,0), Increase HP Recovery (passive 10, pos 4,0), Bash (active 10, pos 0,2), Provoke (active 10, pos 2,2), Magnum Break (active 10, req bash lv5, pos 0,4), Endure (buff 10, pos 4,2)

**Knight (10):** Spear Mastery (passive 10, pos 0,0), Pierce (active 10, req spear_mastery 1, pos 0,2), Brandish Spear (active 10, req spear_mastery 5, pos 0,4), Spear Boomerang (active 5, req spear_mastery 5, pos 1,4), Two-Hand Quicken (buff 10, req twohand_mastery 10, pos 3,0), Auto Counter (passive 5, req bash 5, pos 2,0), Bowling Bash (active 10, req bash 5 + two_hand_quicken 1, pos 3,2), Riding (passive 1, pos 4,0), Cavalry Mastery (active 5, req riding 1, pos 4,2), Head Crush (active 5, pos 2,2)

**Crusader (9):** Guard (passive 10, pos 0,0), Smite (active 5, req guard 5, pos 0,2), Shield Boomerang (active 5, req guard 5, pos 1,2), Holy Cross (active 10, pos 2,0), Grand Cross (active 10, req holy_cross 5, pos 2,2), Resistant Souls (passive 5, pos 3,0), Shrink (passive 1, pos 1,0), Spear Quicken (buff 10, req spear_mastery 5, pos 4,0), Devotion (support 5, pos 4,2)

**Mage (10):** Increase SP Recovery (passive 10, pos 0,0), Napalm Beat (active 10, pos 0,2), Soul Strike (active 10, pos 1,2), Cold Bolt (active 10, pos 2,0), Frost Diver (active 10, req cold_bolt 5, pos 2,2), Stone Curse (active 10, pos 3,0), Fire Ball (active 10, pos 1,0), Fire Bolt (active 10, pos 4,0), Lightning Bolt (active 10, pos 4,2), Thunderstorm (active 10, req lightning_bolt 5, pos 4,4)

**Wizard (8):** Jupitel Thunder (active 10, req lightning_bolt 3, pos 0,0), Lord of Vermillion (active 10, req jupitel 5, pos 0,2), Water Ball (active 5, pos 1,0), Meteor Storm (active 10, pos 2,0), Storm Gust (active 10, pos 3,0), Heaven's Drive (active 10, pos 3,2), Quagmire (support 10, pos 4,0), Sense (active 1, pos 4,2)

**Sage (8):** Free Cast (passive 10, pos 0,0), Auto Spell (passive 10, pos 1,0), Cast Cancel (active 5, pos 0,2), Spell Breaker (active 10, pos 2,0), Magic Rod (active 10, pos 3,0), Dispell (active 5, pos 2,2), Land Protector (active 5, pos 4,0), Abracadabra (active 10, pos 4,2)

**High Wizard (6):** Mystical Amplification (buff 10, pos 0,0), Napalm Vulcan (active 5, pos 1,0), Gravitation Field (active 5, pos 2,0), Ganbantein (active 1, pos 3,0), Stave Crasher (active 1, pos 4,0), Amplify Magic Power (buff 10, pos 0,2)

**Scholar (6):** Double Casting (passive 5, pos 0,0), Spell Fist (active 5, pos 1,0), Indulge (active 5, pos 2,0), Foresight (buff 1, pos 3,0), Blinding Mist (active 5, pos 4,0), Free Research (passive 5, pos 0,2)

**Archer (6):** Owl's Eye (passive 10, pos 0,0), Vulture's Eye (passive 10, pos 2,0), Improve Concentration (buff 10, pos 4,0), Double Strafe (active 10, pos 0,2), Arrow Shower (active 10, pos 2,2), Arrow Repel (active 1, pos 4,2)

**Hunter (8):** Falcon Mastery (passive 1, pos 0,0), Blitz Beat (active 5, req falcon_mastery 1, pos 0,2), True Sight (passive 10, pos 1,0), Sharp Shooting (active 5, pos 2,0), Ankle Snare (active 5, pos 3,0), Claymore Trap (active 5, pos 4,0), Beast Bane (passive 10, pos 1,2), Remove Trap (active 1, pos 3,2)

**Bard (7):** Music Lessons (passive 10, pos 0,0), Melody Strike (active 10, pos 0,2), A Whistle (buff 10, pos 1,0), Apple of Idun (buff 10, pos 2,0), Poem of Bragi (buff 10, pos 3,0), Loki's Veil (buff 10, pos 4,0), Dissonance (active 10, pos 4,2)

**Dancer (7):** Dance Lessons (passive 10, pos 0,0), Charming Wink (active 5, pos 0,2), Lady Luck (buff 10, pos 1,0), Fortune's Kiss (buff 10, pos 2,0), Slow Grace (buff 10, pos 3,0), Hip Shaker (buff 10, pos 4,0), Encore (active 1, pos 4,2)

**Sniper (6):** True Sight (passive 10, pos 0,0), Wind Walk (buff 10, pos 1,0), Falcon Eyes (passive 10, pos 2,0), Falcon Assault (active 5, pos 3,0), Arrow Storm (active 10, pos 4,0), Phantasmic Arrow (active 5, pos 4,2)

**Minstrel (5):** Metallic Sound (active 5, pos 0,0), Swing Dance (buff 5, pos 1,0), Serenade of Jordi (buff 5, pos 2,0), March of Prontera (buff 5, pos 3,0), Song of Mana (buff 5, pos 4,0)

**Wanderer (5):** Severe Rainstorm (active 5, pos 0,0), Hawkeye (buff 5, pos 1,0), Dance with Wargs (buff 5, pos 2,0), Valley of Death (active 5, pos 3,0), Charming Wink Enhanced (active 5, pos 4,0)

**Acolyte (8):** Divine Protection (passive 10, pos 0,0), Demon Bane (passive 10, pos 2,0), Ruwach (active 1, pos 4,0), Pneuma (support 1, pos 4,2), Heal (active 10, pos 0,2), Increase AGI (buff 10, pos 1,2), Decrease AGI (active 10, pos 2,2), Blessing (buff 10, pos 3,2)

**Priest (10):** Aspersio (buff 5, pos 0,0), Holy Light (active 1, pos 0,2), Impositio Manus (buff 5, pos 1,0), Magnificat (buff 5, pos 2,0), Resurrection (active 4, pos 3,0), Gloria (buff 5, pos 4,0), Sanctuary (support 10, pos 1,2), Lex Divina (active 10, pos 2,2), Lex Aeterna (active 1, pos 3,2), Magnus Exorcismus (active 10, req lex_divina 5, pos 4,2)

**High Priest (6):** Assumptio (buff 5, pos 0,0), Basilica (support 5, pos 1,0), Kyrie Eleison (buff 10, pos 2,0), Clementia (buff 5, pos 3,0), Canto Candidus (buff 5, pos 4,0), Mace Mastery (passive 10, pos 0,2)

**Archbishop (6):** Renovatio (support 1, pos 0,0), Highness Heal (active 5, pos 1,0), Expiatio (buff 5, pos 2,0), Praefatio (buff 10, pos 3,0), Adoramus (active 10, pos 4,0), Sacrament (buff 5, pos 4,2)

**Monk (9):** Iron Fists (passive 10, pos 0,0), Call Spirits (active 5, pos 1,0), Throw Spirit Sphere (active 5, req call_spirits 1, pos 1,2), Occult Impaction (active 5, pos 2,0), Chain Combo (active 5, pos 3,0), Combo Finish (active 5, req chain_combo 3, pos 3,2), Guillotine Fist (active 5, req combo_finish 3, pos 4,2), Body Relocation (active 2, pos 4,0), Dodge (passive 10, pos 0,2)

**Champion (6):** Tiger Cannon (active 10, pos 0,0), Gates of Hell (active 10, pos 1,0), Raging Palm Strike (active 5, pos 2,0), Glacier Fist (active 5, pos 3,0), Fallen Empire (active 5, pos 4,0), Critical Explosion (buff 5, pos 0,2)

**Sura (6):** Tiger Cannon Enhanced (active 10, pos 0,0), Knuckle Boost (active 10, pos 1,0), Howling of Lion (active 5, pos 2,0), Earth Shaker (active 5, pos 3,0), Lightning Walk (buff 5, pos 4,0), Dragon Combo (active 10, pos 0,2)

**Thief (8):** Double Attack (passive 10, pos 0,0), Steal (active 10, pos 2,0), Hiding (buff 10, pos 4,0), Cloaking (buff 10, pos 4,2), Detoxify (active 5, pos 1,0), Envenom (active 10, pos 1,2), Improve Dodge (passive 10, pos 3,0), Pickpocket (passive 10, pos 3,2)

**Assassin (8):** Katar Mastery (passive 10, pos 0,0), Grimtooth (active 5, pos 0,2), Enchant Poison (buff 10, pos 1,0), Poison React (buff 10, pos 2,0), Venom Dust (active 10, pos 3,0), Venom Splasher (active 10, pos 4,0), Meteor Assault (active 10, pos 3,2), Sonic Blow (active 10, req katar_mastery 5, pos 0,4)

**Assassin Cross (6):** Enchant Deadly Poison (buff 5, pos 0,0), Soul Destroyer (active 10, pos 1,0), Right-Hand Mastery (passive 5, pos 2,0), Left-Hand Mastery (passive 5, pos 3,0), Venom Knife (active 5, pos 4,0), Sonic Acceleration (passive 5, pos 0,2)

**Guillotine Cross (6):** Cross Impact (active 10, pos 0,0), Counter Slash (active 5, pos 1,0), Dark Illusion (active 5, pos 2,0), Phantom Menace (active 5, pos 3,0), Hallucination Walk (buff 5, pos 4,0), Crazy Uproar (buff 1, pos 4,2)

**Rogue (7):** Steal Coin (active 10, pos 0,0), Backstab (active 10, pos 1,0), Raid (active 5, pos 2,0), Intimidate (active 10, pos 3,0), Snatcher (passive 10, pos 4,0), Gangster Paradise (passive 1, pos 4,2), Sword Mastery Rogue (passive 10, pos 0,2)

**Stalker (6):** Full Strip (active 5, pos 0,0), Chase Walk (buff 5, pos 1,0), Plagiarism (passive 10, pos 2,0), Preserve (active 1, pos 3,0), Raid Enhanced (active 10, pos 4,0), Tunnel Drive (passive 5, pos 0,2)

**Shadow Chaser (6):** Chaos Panic (active 5, pos 0,0), Masquerade Piercing (active 5, pos 1,0), Masquerade Enervation (active 5, pos 2,0), Masquerade Ignorance (active 5, pos 3,0), Masquerade Stupidity (active 5, pos 4,0), Shadow Form (buff 5, pos 0,2)

**Merchant (8):** Discount (passive 10, pos 0,0), Overcharge (passive 10, pos 1,0), Enlarge Weight Limit (passive 10, pos 2,0), Pushcart (passive 5, pos 3,0), Vending (active 4, req pushcart 2, pos 3,2), Mammonite (active 10, pos 4,0), Change Cart (active 4, pos 4,2), Item Appraisal (active 1, pos 1,2)

**Blacksmith (8):** Adrenaline Rush (buff 5, pos 0,0), Weapon Perfection (buff 5, pos 1,0), Maximize Power (buff 5, pos 2,0), Power Thrust (buff 5, pos 3,0), Hammerfall (active 5, pos 4,0), Skin Tempering (passive 5, pos 0,2), Hilt Binding (passive 1, pos 1,2), Enchantedstone Craft (active 5, pos 4,2)

**Alchemist (8):** Pharmacy (active 10, pos 0,0), Potion Pitcher (active 5, pos 1,0), Aid Potion (active 5, pos 2,0), Bioethics (passive 1, pos 3,0), Acid Terror (active 10, pos 4,0), Bomb (active 5, pos 4,2), Demonstration (active 5, pos 3,2), Berserk Pitcher (active 5, pos 0,2)

**Whitesmith (5):** Cart Boost (buff 5, pos 0,0), Full Adrenaline Rush (buff 5, pos 1,0), Meltdown (active 10, pos 2,0), Maximum Over Thrust (buff 5, pos 3,0), Weapon Repair (active 5, pos 4,0)

**Mechanic (6):** Power Swing (active 5, pos 0,0), Arm Cannon (active 5, pos 1,0), Ice Launcher (active 5, pos 2,0), Vulcan Arm (active 5, pos 3,0), Pile Bunker (active 5, pos 4,0), Madogear License (passive 5, pos 0,2)

**Creator (6):** Acid Demonstration (active 10, pos 0,0), Call Homunculus (active 1, pos 1,0), Homunculus Resurrection (active 5, pos 2,0), Bio Explosion (active 5, pos 3,0), Marine Sphere (active 5, pos 4,0), Twilight Pharmacy (active 3, pos 4,2)

**Genetic (6):** Fire Expansion (active 5, pos 0,0), Acid Bomb (active 10, pos 1,0), Hell's Plant (active 5, pos 2,0), Crazy Weed (active 5, pos 3,0), Howling of Mandragora (active 5, pos 4,0), Spore Explosion (active 5, pos 4,2)

**Lord Knight (6):** Parry (passive 10, pos 0,0), Spiral Pierce (active 5, pos 1,0), One-Hand Quicken (buff 5, pos 2,0), Traumatic Blow (active 5, pos 3,0), Frenzy (buff 1, pos 4,0), Charge Attack (active 1, pos 4,2)

**Paladin (6):** Sacrifice (buff 5, pos 0,0), Reflect Shield (buff 10, pos 1,0), Pressure (active 5, pos 2,0), Defender (buff 5, pos 3,0), Battle Chant (buff 10, pos 4,0), Rapid Smiting (active 5, pos 4,2)

**Rune Knight (6):** Dragon Training (passive 5, pos 0,0), Dragon Breath (active 10, pos 1,0), Hundred Spears (active 10, pos 2,0), Ignition Break (active 10, pos 3,0), Sonic Wave (active 10, pos 4,0), Death Bound (active 10, pos 4,2)

**Royal Guard (6):** Banding (support 5, pos 0,0), Cannon Spear (active 5, pos 1,0), Pinpoint Attack (active 5, pos 2,0), Prestige (buff 10, pos 3,0), Piety (buff 5, pos 4,0), Aegis (buff 5, pos 4,2)

**Arcane Master (6):** Tetra Vortex (active 5, pos 0,0), Comet (active 5, pos 1,0), Diamondstorm (active 5, pos 2,0), Chain Lightning (active 5, pos 3,0), Crimson Rock (active 5, pos 4,0), Jack Frost (active 5, pos 4,2)

**Sorcerer (6):** Psychic Wave (active 10, pos 0,0), Striking (support 5, pos 1,0), Varetyr Spear (active 5, pos 2,0), Diamond Dust (active 5, pos 3,0), Ball Lightning (active 5, pos 4,0), Elemental Control (active 4, pos 4,2)

**Ranger (6):** Warg Mastery (passive 1, pos 0,0), Warg Rider (passive 3, pos 0,2), Warg Bite (active 5, req warg_mastery 1, pos 1,2), Arrow Storm (active 10, pos 2,0), Camouflage (buff 5, pos 3,0), Aimed Bolt (active 10, pos 4,0)

**Maestro (5):** Metallic Sound Enhanced (active 5, pos 0,0), Swing Dance (buff 5, pos 1,0), Serenade of Jordi Enhanced (buff 5, pos 2,0), March of Prontera Enhanced (buff 5, pos 3,0), Song of Mana Enhanced (buff 5, pos 4,0)

- [ ] Run seed to verify skills:
```bash
cd /home/fehyamaoka/Projects/ragtree/ragtree-api
MONGODB_URI=mongodb://localhost:27017/ragtree bun run src/scripts/seed.ts
```
Expected: `✅ 46 classes ✅ ~280 skills`

- [ ] Commit: `git commit -m "feat: add all RO class skills to seed"`

---

## Task 3 — Seed: items and monsters

**Files:**
- Modify: `ragtree-api/src/scripts/seed.ts` — populate `ITEMS` and `MONSTERS` arrays

- [ ] Replace `const ITEMS: any[] = []` with ~80 items. Pattern:

```typescript
{ name: 'Sword', slug: 'sword', type: 'weapon' as const, sub_type: '1h-sword', weight: 60, atk: 40, slots: 3, required_level: 1, effects: {}, npc_sell_price: 50, icon_url: 'https://static.divine-pride.net/images/item/1101.png' },
```

Include (divine-pride item IDs in parentheses):
- **Weapons 1H:** Sword(1101), Main Gauche(1201), Knife(1204), Dagger(1201), Rod(1751), Short Bow(1701)
- **Weapons 2H:** Two-Handed Sword(1151), Staff(1752), Composite Bow(1707), Glaive(1401)
- **Armor:** Leather Armor(2303), Chain Mail(2305), Plate Armor(2307), Robe(2301), Cotton Shirt(2302)
- **Headgear:** Hat(2202), Helm(2209), Cap(2207)
- **Shield:** Guard(2101), Shield(2105), Buckler(2103)
- **Footgear:** Shoes(2401), Boots(2403), Sandals(2402)
- **Garment:** Manteau(2501), Muffler(2503), Hood(2502)
- **Accessory:** Necklace(2701), Earring(2703), Ring(2705)
- **Cards (20):** Poring(4001), Lunatic(4005), Fabre(4008), Willow(4010), Skeleton(4020), Hydra(4031), Thara Frog(4051), Savage Bebe(4055), Marc(4057), Bathory(4128), Marina(4038), Vadon(4047), Mummy(4053), Swordfish(4050), Pecopeco(4041), Steel Chonchon(4022), Orc Warrior(4081), Rocker(4027), Drops(4004), Santa Poring(4107)
- **Consumables:** Red Potion(501), Orange Potion(502), Yellow Potion(503), White Potion(504), Blue Potion(505), Fly Wing(601), Butterfly Wing(602), Banana Juice(518), Apple(512), Meat(517)

- [ ] Replace `const MONSTERS: any[] = []` with ~40 monsters. Pattern:

```typescript
{ name: 'Poring', slug: 'poring', level: 1, hp: 60, atk: 7, def: 0, mdef: 5, exp: 2, job_exp: 1, element: 'water', race: 'plant', size: 'small' as const, drop_items: [], icon_url: 'https://static.divine-pride.net/images/mob/1002.png' },
```

Include (divine-pride mob IDs):
Poring(1002), Lunatic(1063), Fabre(1007), Willow(1010), Thief Bug(1051), Zombie(1021), Skeleton(1014), Poporing(1031), Marin(1045), Creamy(1018), Savage Bebe(1082), Rocker(1052), Spore(1014... verify), Orc Warrior(1152), Orc Lady(1025), Minotaurus(1145), Hydra(1068), Swordfish(1069), Marc(1045... verify), Bathory(1106), Drake(1112), Eddga(1115), Moonlight Flower(1150), Osiris(1038), Baphomet(1039), Golden Thief Bug(1086), Maya(1150... verify), Pharaoh(1156), Turtle General(1312), Stormy Knight(1251), Fallen Bishop(1288), Lord of Death(1373), Dark Lord(1272), RSX-0806(1496), Kiel-D-01(1401), Randgris(1658), Gloom Under Night(1768), Ifrit(1832), Detale(1719), Thanatos(1708)

- [ ] Run seed:
```bash
MONGODB_URI=mongodb://localhost:27017/ragtree bun run src/scripts/seed.ts
```
Expected: `✅ 46 classes ✅ ~280 skills ✅ ~80 items ✅ ~40 monsters`

- [ ] Commit: `git commit -m "feat: add items and monsters to seed"`

---

## Task 4 — HeroSection component

**Files:**
- Create: `ragtree-web/src/components/landing/HeroSection.tsx`

- [ ] Create the component:

```tsx
export function HeroSection() {
  return (
    <section
      className="relative py-20 text-center"
      style={{ background: 'linear-gradient(180deg,#0a0a0f 0%,#0f1a0a 30%,#1a2800 60%,#0a0a0f 100%)', borderBottom: '3px solid #3d2e00' }}
    >
      <div className="text-xs tracking-widest mb-4" style={{ color: '#3d2e00' }}>
        {'▪'.repeat(48)}
      </div>
      <div className="text-2xl leading-none mb-[-20px] opacity-30 select-none">
        🌲🏔🌲🏰🌲🏔🌲🌲🏔🌲🏰🌲🏔🌲
      </div>
      <div className="relative z-10 px-4">
        <p className="text-xs tracking-[0.4em] mb-3 uppercase" style={{ color: '#d4a017' }}>
          Ragnarok Online LATAM
        </p>
        <h1
          className="text-5xl font-bold leading-tight mb-3"
          style={{ color: '#f5e6a3', textShadow: '0 0 40px #d4a01740' }}
        >
          Forge Your<br />Legend
        </h1>
        <p className="text-base mb-8 max-w-sm mx-auto" style={{ color: '#8a9a7a' }}>
          Simule árvores de skills, monte builds e explore o universo de Midgard
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/classes"
            className="px-6 py-2 text-sm font-bold tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{ background: '#d4a017', color: '#0a0a0f' }}
          >
            ▶ Simular Build
          </a>
          <a
            href="/classes"
            className="px-6 py-2 text-sm tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{ border: '1px solid #d4a017', color: '#d4a017' }}
          >
            Ver Classes
          </a>
        </div>
      </div>
      <div className="text-xs tracking-widest mt-8" style={{ color: '#3d2e00' }}>
        {'▪'.repeat(48)}
      </div>
    </section>
  )
}
```

- [ ] Commit: `git commit -m "feat: add HeroSection landing component"`

---

## Task 5 — FeaturesSection component

**Files:**
- Create: `ragtree-web/src/components/landing/FeaturesSection.tsx`

- [ ] Create the component:

```tsx
const features = [
  { icon: '🌳', title: 'Árvore de Skills', desc: 'Visualize e simule qualquer combinação de habilidades' },
  { icon: '🗡️', title: 'Calcule Stats', desc: 'ATK, MATK, ASPD, HIT, FLEE e muito mais' },
  { icon: '👥', title: 'Comunidade', desc: 'Salve e compartilhe builds com outros jogadores' },
]

export function FeaturesSection() {
  return (
    <section className="py-10 px-4" style={{ background: '#0a0a0f', borderBottom: '1px solid #1a1a0a' }}>
      <p className="text-center text-xs tracking-[0.4em] uppercase mb-8" style={{ color: '#d4a017' }}>
        O que é o RagTree
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {features.map(f => (
          <div
            key={f.title}
            className="text-center p-5"
            style={{ background: '#0d110a', border: '1px solid #1f2a0f' }}
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <p className="text-sm font-bold mb-2" style={{ color: '#f5e6a3' }}>{f.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: '#555' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] Commit: `git commit -m "feat: add FeaturesSection landing component"`

---

## Task 6 — ClassesSection component

**Files:**
- Create: `ragtree-web/src/components/landing/ClassesSection.tsx`

- [ ] Create the component:

```tsx
import Link from 'next/link'
import type { Class } from '@/types'

export function ClassesSection({ classes }: { classes: Class[] }) {
  return (
    <section className="py-10 px-4" style={{ background: '#0d0e08', borderBottom: '1px solid #1a1a0a' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-baseline mb-6">
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: '#d4a017' }}>
            Classes de Midgard
          </p>
          <Link href="/classes" className="text-xs transition-opacity hover:opacity-70" style={{ color: '#666' }}>
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {classes.map(cls => (
            <Link
              key={cls._id}
              href={`/classes/${cls.slug}`}
              className="p-2 text-center transition-colors hover:opacity-80"
              style={{ background: '#111409', border: '1px solid #2a2a10' }}
            >
              <div className="text-2xl mb-1">{cls.icon_url}</div>
              <p className="text-xs font-medium truncate" style={{ color: '#d4a017' }}>{cls.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] Commit: `git commit -m "feat: add ClassesSection landing component"`

---

## Task 7 — BuildsSection client component with filter

**Files:**
- Create: `ragtree-web/src/components/landing/BuildsSection.tsx`

- [ ] Create the component:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { Build, Class } from '@/types'

export function BuildsSection({ builds, classes }: { builds: Build[]; classes: Class[] }) {
  const [active, setActive] = useState<string | null>(null)

  const classesWithBuilds = classes.filter(cls =>
    builds.some(b => {
      const id = typeof b.class_id === 'object' ? b.class_id._id : b.class_id
      return String(id) === String(cls._id)
    })
  )

  const filtered = active
    ? builds.filter(b => {
        const id = typeof b.class_id === 'object' ? b.class_id._id : b.class_id
        return String(id) === active
      })
    : builds

  return (
    <section className="py-10 px-4" style={{ background: '#0a0a0f', borderBottom: '1px solid #1a1a0a' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-baseline mb-4">
          <p className="text-xs tracking-[0.4em] uppercase" style={{ color: '#d4a017' }}>
            Builds em Destaque
          </p>
          <Link href="/builds" className="text-xs transition-opacity hover:opacity-70" style={{ color: '#666' }}>
            Ver todas →
          </Link>
        </div>

        {/* Filter pills */}
        {classesWithBuilds.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setActive(null)}
              className="px-3 py-1 text-xs transition-colors"
              style={active === null
                ? { background: '#d4a017', color: '#000', fontWeight: 'bold' }
                : { border: '1px solid #2a2a10', color: '#888' }}
            >
              Todas
            </button>
            {classesWithBuilds.map(cls => (
              <button
                key={cls._id}
                onClick={() => setActive(active === String(cls._id) ? null : String(cls._id))}
                className="px-3 py-1 text-xs transition-colors"
                style={active === String(cls._id)
                  ? { background: '#d4a017', color: '#000', fontWeight: 'bold' }
                  : { border: '1px solid #2a2a10', color: '#888' }}
              >
                {cls.icon_url} {cls.name}
              </button>
            ))}
          </div>
        )}

        {/* Build list */}
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="text-xs py-4 text-center" style={{ color: '#555' }}>
              Nenhuma build para esta classe ainda
            </p>
          )}
          {filtered.map((build, i) => (
            <Link
              key={build._id}
              href={`/builds/${build._id}`}
              className="flex justify-between items-center px-4 py-3 transition-opacity hover:opacity-80"
              style={{
                background: '#0f1208',
                borderLeft: `2px solid ${i === 0 ? '#d4a017' : '#555'}`,
              }}
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: i === 0 ? '#f5e6a3' : '#ccc' }}>
                  {typeof build.class_id === 'object' ? build.class_id.icon_url : ''} {build.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                  {typeof build.class_id === 'object' ? build.class_id.name : ''} • {build.views} views
                </p>
              </div>
              <span className="text-xs ml-4 shrink-0" style={{ color: i === 0 ? '#d4a017' : '#666' }}>
                #{i + 1}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] Commit: `git commit -m "feat: add BuildsSection with class filter pills"`

---

## Task 8 — Update page.tsx

**Files:**
- Modify: `ragtree-web/src/app/page.tsx`

- [ ] Replace entire content of `page.tsx`:

```tsx
import { api } from '@/lib/api'
import type { Class, Build } from '@/types'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ClassesSection } from '@/components/landing/ClassesSection'
import { BuildsSection } from '@/components/landing/BuildsSection'

async function getData() {
  const [classes, buildsData] = await Promise.all([
    api.get<Class[]>('/classes').catch(() => [] as Class[]),
    api.get<{ builds: Build[] }>('/builds?limit=6&sort=views').catch(() => ({ builds: [] as Build[] })),
  ])
  return { classes, builds: buildsData.builds }
}

export default async function HomePage() {
  const { classes, builds } = await getData()
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <ClassesSection classes={classes} />
      <BuildsSection builds={builds} classes={classes} />
    </div>
  )
}
```

- [ ] Commit: `git commit -m "feat: replace homepage with cinematic landing components"`

---

## Verification

```bash
# 1. Seed the database (run from ragtree-api folder with mongo accessible)
cd /home/fehyamaoka/Projects/ragtree/ragtree-api
MONGODB_URI=mongodb://localhost:27017/ragtree bun run src/scripts/seed.ts

# 2. Rebuild and restart Docker
cd /home/fehyamaoka/Projects/ragtree
docker compose up --build -d

# 3. Verify API returns classes
curl http://localhost:3001/classes | jq '.[0]'

# 4. Check web
curl -s http://localhost:3000 | grep "Forge Your"
```

Expected: classes visible in homepage grid, builds section (empty until users create builds), hero with "Forge Your Legend" tagline.
