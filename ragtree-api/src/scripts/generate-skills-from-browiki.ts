// Generates skill seed data from browiki-map.json
// Usage: bun src/scripts/generate-skills-from-browiki.ts > output.txt

const map = JSON.parse(await Bun.file('src/scripts/seed-data/browiki-map.json').text())

// Class chain definitions (which classes belong to which chain file)
const CHAINS: Record<string, string[]> = {
  'swordsman-chain': ['swordsman', 'knight', 'crusader', 'lord-knight', 'paladin', 'rune-knight', 'royal-guard'],
  'mage-chain': ['mage', 'wizard', 'sage', 'high-wizard', 'scholar', 'arcane-master', 'sorcerer'],
  'archer-chain': ['archer', 'hunter', 'bard', 'dancer', 'sniper', 'minstrel', 'wanderer', 'ranger', 'maestro'],
  'acolyte-chain': ['acolyte', 'priest', 'monk', 'high-priest', 'champion', 'archbishop', 'sura'],
  'thief-chain': ['thief', 'assassin', 'rogue', 'assassin-cross', 'stalker', 'guillotine-cross', 'shadow-chaser'],
  'merchant-chain': ['merchant', 'blacksmith', 'alchemist', 'whitesmith', 'creator', 'mechanic', 'genetic'],
}

// C key mapping (slug -> C.key)
const C_KEY: Record<string, string> = {
  novice: 'novice', swordsman: 'swordsman', mage: 'mage', archer: 'archer',
  acolyte: 'acolyte', thief: 'thief', merchant: 'merchant',
  knight: 'knight', crusader: 'crusader', wizard: 'wizard', sage: 'sage',
  hunter: 'hunter', bard: 'bard', dancer: 'dancer', priest: 'priest',
  monk: 'monk', assassin: 'assassin', rogue: 'rogue', blacksmith: 'blacksmith',
  alchemist: 'alchemist', 'lord-knight': 'lord_knight', paladin: 'paladin',
  'high-wizard': 'high_wizard', scholar: 'scholar', sniper: 'sniper',
  minstrel: 'minstrel', gypsy: 'gypsy', 'high-priest': 'high_priest',
  champion: 'champion', 'assassin-cross': 'assassin_cross', stalker: 'stalker',
  whitesmith: 'whitesmith', creator: 'creator', 'rune-knight': 'rune_knight',
  'royal-guard': 'royal_guard', 'arcane-master': 'arcane_master', sorcerer: 'sorcerer',
  ranger: 'ranger', maestro: 'maestro', wanderer: 'wanderer',
  archbishop: 'archbishop', sura: 'sura', 'guillotine-cross': 'guillotine_cross',
  'shadow-chaser': 'shadow_chaser', mechanic: 'mechanic', genetic: 'genetic',
}

function slugify(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

for (const [chainName, classSlgs] of Object.entries(CHAINS)) {
  console.log(`\n=== ${chainName} ===\n`)

  for (const classSlug of classSlgs) {
    const cls = map[classSlug]
    if (!cls) { console.log(`// ${classSlug}: NOT FOUND`); continue }

    const skills = cls._skills_list ?? Object.values(cls.skills ?? {})
    const cKey = C_KEY[classSlug]

    console.log(`  // ── ${cls.name} (${skills.length}) ──`)

    skills.forEach((skill: any, i: number) => {
      const slug = slugify(skill.name)
      const col = i % 6
      const row = Math.floor(i / 6) * 2

      console.log(`  { class_id: C.${cKey}, name: '${skill.name.replace(/'/g, "\\'")}', slug: '${slug}', type: 'active' as const, max_level: 5, description: '${skill.name.replace(/'/g, "\\'")}', prerequisites: [], icon_url: '${skill.icon_url}', position: { x: ${col}, y: ${row} }, levels: lv(5, [10, 10, 10, 10, 10]) },`)
    })

    console.log()
  }
}
