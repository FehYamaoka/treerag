// ragtree-api/src/scripts/scrape-browiki.ts
// Roda uma vez para gerar browiki-map.json
// Uso: bun src/scripts/scrape-browiki.ts > browiki-map.json

// Nomes singulares pt-br (não plural como nos títulos das páginas browiki)
const SINGULAR_NAMES: Record<string, string> = {
  novice: 'Aprendiz',
  swordsman: 'Espadachim',
  mage: 'Mago',
  archer: 'Arqueiro',
  acolyte: 'Acólito',
  thief: 'Ladrão',
  merchant: 'Mercador',
  knight: 'Cavaleiro',
  crusader: 'Cruzado',
  wizard: 'Bruxo',
  sage: 'Sábio',
  hunter: 'Caçador',
  bard: 'Bardo',
  dancer: 'Odalisca',
  priest: 'Sacerdote',
  monk: 'Monge',
  assassin: 'Mercenário',
  rogue: 'Desordenado',
  blacksmith: 'Ferreiro',
  alchemist: 'Alquimista',
  'lord-knight': 'Lorde Cavaleiro',
  paladin: 'Paladino',
  'high-wizard': 'Alto Bruxo',
  scholar: 'Professor',
  sniper: 'Atirador',
  minstrel: 'Menestrel',
  gypsy: 'Cigana',
  'high-priest': 'Alto Sacerdote',
  champion: 'Campeão',
  'assassin-cross': 'Sicário',
  stalker: 'Renegado',
  whitesmith: 'Ferreiro Branco',
  creator: 'Criador',
  'rune-knight': 'Cavaleiro de Runas',
  'royal-guard': 'Guarda Real',
  'arcane-master': 'Mago Arcano',
  sorcerer: 'Feiticeiro',
  ranger: 'Ranger',
  maestro: 'Maestro',
  wanderer: 'Andarilha',
  archbishop: 'Arcebispo',
  sura: 'Sura',
  'guillotine-cross': 'Cruz Guilhotina',
  'shadow-chaser': 'Caçador de Sombras',
  mechanic: 'Mecânico',
  genetic: 'Genético',
}

const CLASSES: Record<string, string> = {
  // Classe 1 (Job 1)
  novice: 'Aprendizes',        // Novice (no evolution = base job)
  swordsman: 'Espadachins',    // Swordsman
  mage: 'Magos',               // Mage
  archer: 'Arqueiros',         // Archer
  acolyte: 'Novi%C3%A7os',     // Acolyte (browiki calls it "Noviços" -> evolves to Priest/Monk)
  thief: 'Gatunos',            // Thief
  merchant: 'Mercadores',      // Merchant
  // Classe 2 (Job 2)
  knight: 'Cavaleiros',
  crusader: 'Templ%C3%A1rios', // Crusader = Templários
  wizard: 'Bruxos',            // Wizard = Bruxos
  sage: 'S%C3%A1bios',         // Sage = Sábios
  hunter: 'Ca%C3%A7adores',    // Hunter = Caçadores
  bard: 'Bardos',
  dancer: 'Odaliscas',         // Dancer = Odaliscas (evolves from Archer)
  priest: 'Sacerdotes',
  monk: 'Monges',
  assassin: 'Mercen%C3%A1rios', // Assassin = Mercenários (evolves from Thief)
  rogue: 'Arruaceiros',        // Rogue = Arruaceiros
  blacksmith: 'Ferreiros',
  alchemist: 'Alquimistas',
  // Classe Transcendental (Trans Job 2)
  'lord-knight': 'Lordes',             // Lord Knight = Lordes
  paladin: 'Paladinos',
  'high-wizard': 'Arquimagos',         // High Wizard = Arquimagos
  scholar: 'Professores',              // Scholar/Professor = Professores
  sniper: 'Atiradores_de_Elite',       // Sniper = Atiradores de Elite
  minstrel: 'Menestr%C3%A9is',         // Minstrel = Menestréis (trans of Bard)
  gypsy: 'Ciganas',                    // Gypsy = Ciganas (trans of Dancer)
  'high-priest': 'Sumo_Sacerdotes',    // High Priest = Sumo Sacerdotes
  champion: 'Mestres',                 // Champion = Mestres (trans of Monk)
  'assassin-cross': 'Algozes',         // Assassin Cross = Algozes
  stalker: 'Desordeiros',              // Stalker = Desordeiros
  whitesmith: 'Mestres-Ferreiros',     // Whitesmith = Mestres-Ferreiros
  creator: 'Criadores',
  // Classe 3 (Job 3)
  'rune-knight': 'Cavaleiros_R%C3%BAnicos',  // Rune Knight = Cavaleiros Rúnicos
  'royal-guard': 'Guardi%C3%B5es_Reais',     // Royal Guard = Guardiões Reais
  'arcane-master': 'Arcanos',                // Arcane Master = Arcanos
  sorcerer: 'Feiticeiros',
  ranger: 'Sentinelas',                      // Ranger = Sentinelas
  maestro: 'Trovadores',                     // Maestro = Trovadores (job3 of Bard)
  wanderer: 'Musas',                         // Wanderer = Musas (job3 of Dancer)
  archbishop: 'Arcebispos',
  sura: 'Shuras',
  'guillotine-cross': 'Sic%C3%A1rios',       // Guillotine Cross = Sicários
  'shadow-chaser': 'Renegados',              // Shadow Chaser = Renegados
  mechanic: 'Mec%C3%A2nicos',               // Mechanic = Mecânicos
  genetic: 'Bioqu%C3%ADmicos',              // Genetic = Bioquímicos
}

const BASE = 'https://browiki.org/wiki'
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'RagTree/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function extractClassIcon(html: string): string {
  // The class icon is the "partyicn" image in the infobox header
  // Pattern: <img src="/images/X/XX/NAMEpartyicn.png" ...>
  const match = html.match(/src="(\/images\/[^"]+partyicn[^"]*\.png)"/)
    ?? html.match(/src="(\/images\/[^"]+icn[^"]*\.png)"/)
  return match ? `https://browiki.org${match[1]}` : ''
}

function extractClassNameFromPage(html: string, fallback: string): string {
  // Extract actual PT-BR class name from the page title area in the infobox
  // Pattern: <span class="mw-default-size" ...><img ...partyicn.png.../></span> CLASS_NAME\n
  const match = html.match(/partyicn[^"]*\.png"[^>]*\s*\/><\/span><\/span>\s*([^<\n\r]+)/)
    ?? html.match(/partyicn[^"]*\.png"[^\/]*\/><\/span><\/span>\s*([^\n<]+)/)
  if (match) {
    return match[1].trim()
  }
  // Fallback: use the page <title> tag
  const titleMatch = html.match(/<title>([^<]+) - bROWiki<\/title>/)
  if (titleMatch) return titleMatch[1].trim()
  return fallback.replace(/_/g, ' ')
}

function extractSkills(html: string): Record<string, { name: string; icon_url: string }> {
  const skills: Record<string, { name: string; icon_url: string }> = {}

  // Find the Habilidades section by its id anchor
  const sectionIdx = html.indexOf('id="Habilidades"')
  if (sectionIdx === -1) return skills

  // Extract from Habilidades to next h2 section (or end of content)
  const nextSection = html.indexOf('<h2', sectionIdx + 1)
  const skillSection = nextSection > 0
    ? html.slice(sectionIdx, nextSection)
    : html.slice(sectionIdx)

  // Pattern: <a href="/wiki/SKILL_URL" title="SKILL_NAME"><img src="ICON_SRC"
  const entries = skillSection.matchAll(/href="\/wiki\/([^"]+)" title="([^"]+)"><img src="([^"]+)"/g)
  for (const entry of entries) {
    const wikiSlug = decodeURIComponent(entry[1])
    const name = entry[2].trim()
    const rawIconSrc = entry[3]
    const iconUrl = rawIconSrc.startsWith('http') ? rawIconSrc : `https://browiki.org${rawIconSrc}`
    // Skip party icon contaminations (links to other class pages)
    if (iconUrl.includes('partyicn')) continue
    // Convert wiki slug to kebab-case skill slug
    const skillSlug = wikiSlug.toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-')
    skills[skillSlug] = { name, icon_url: iconUrl }
  }

  return skills
}

async function scrapeClass(slug: string, bwName: string) {
  const url = `${BASE}/${bwName}`
  try {
    const html = await fetchPage(url)
    const icon_url = extractClassIcon(html)
    const bwDisplayName = extractClassNameFromPage(html, bwName)
    const name = SINGULAR_NAMES[slug] ?? bwDisplayName.replace(/_/g, ' ')
    const skills = extractSkills(html)
    return { name, icon_url, skills, _skills_list: Object.values(skills) }
  } catch (e) {
    process.stderr.write(`ERRO ao scrape ${slug} (${url}): ${(e as Error).message}\n`)
    return { name: SINGULAR_NAMES[slug] ?? bwName.replace(/_/g, ' '), icon_url: '', skills: {}, _skills_list: [] }
  }
}

const result: Record<string, any> = {}
for (const [slug, bwName] of Object.entries(CLASSES)) {
  process.stderr.write(`Scraping ${slug}...\n`)
  result[slug] = await scrapeClass(slug, bwName)
  await delay(500)
}

console.log(JSON.stringify(result, null, 2))
