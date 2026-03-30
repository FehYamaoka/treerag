# Skill Tree Revamp — Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Atualizar seed data com nomes pt-br e imagens do browiki.org, e adicionar o endpoint `/classes/:slug/chain` que retorna a cadeia completa de classes com skills.

**Architecture:** Script de scraping gera mapeamento JSON do browiki.org → seed data é atualizado com nomes oficiais pt-br, ícones e posições de grid → novo endpoint percorre `parent_class_id` e retorna a cadeia ordenada.

**Tech Stack:** Bun, Elysia, Mongoose/MongoDB, browiki.org (fonte de dados pt-br)

**Spec:** `docs/superpowers/specs/2026-03-29-skill-tree-revamp-design.md`

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `ragtree-api/src/scripts/scrape-browiki.ts` | Criar | Scraping de nomes/ícones do browiki.org |
| `ragtree-api/src/scripts/seed-data/shared.ts` | Modificar | Adicionar helper `bw()` |
| `ragtree-api/src/scripts/seed.ts` | Modificar | 46 classes com nome pt-br e `icon_url` browiki |
| `ragtree-api/src/scripts/seed-data/skills-mage-chain.ts` | Modificar | Names pt-br, posições corretas |
| `ragtree-api/src/scripts/seed-data/skills-swordsman-chain.ts` | Modificar | Names pt-br, posições corretas |
| `ragtree-api/src/scripts/seed-data/skills-archer-chain.ts` | Modificar | Names pt-br, posições corretas |
| `ragtree-api/src/scripts/seed-data/skills-acolyte-chain.ts` | Modificar | Names pt-br, posições corretas |
| `ragtree-api/src/scripts/seed-data/skills-thief-chain.ts` | Modificar | Names pt-br, posições corretas |
| `ragtree-api/src/scripts/seed-data/skills-merchant-chain.ts` | Modificar | Names pt-br, posições corretas |
| `ragtree-api/src/routes/classes.routes.ts` | Modificar | Adicionar rota `GET /:slug/chain` |

---

## Task 1: Inspecionar browiki.org e escrever script de scraping

**Files:**
- Create: `ragtree-api/src/scripts/scrape-browiki.ts`

- [ ] **Step 1: Inspecionar manualmente browiki.org**

Abrir no browser as seguintes páginas e anotar:
- URL de uma classe qualquer (ex: `https://browiki.org/wiki/Mago`)
- Como as skills aparecem listadas na página (tabela? lista?)
- URL dos ícones das classes (infobox da classe)
- URL dos ícones das skills (próximo a cada skill na página)

O objetivo é confirmar o padrão de URL e estrutura HTML antes de escrever o scraper.

- [ ] **Step 2: Criar o script de scraping**

```ts
// ragtree-api/src/scripts/scrape-browiki.ts
// Roda uma vez para gerar browiki-map.json
// Uso: bun src/scripts/scrape-browiki.ts > browiki-map.json

const CLASSES: Record<string, string> = {
  // slug_do_jogo → nome_pt_br_para_URL_browiki
  novice: 'Aprendiz',
  swordsman: 'Espadachim',
  mage: 'Mago',
  archer: 'Arqueiro',
  acolyte: 'Acolito',
  thief: 'Ladrao',
  merchant: 'Mercador',
  knight: 'Cavaleiro',
  crusader: 'Cruzado',
  wizard: 'Mago_Sabio',
  sage: 'Sabio',
  hunter: 'Cacador',
  bard: 'Bardo',
  dancer: 'Dancarina',
  priest: 'Sacerdote',
  monk: 'Monge',
  assassin: 'Assassino',
  rogue: 'Vandalo',
  blacksmith: 'Ferreiro',
  alchemist: 'Alquimista',
  'lord-knight': 'Lorde_Cavaleiro',
  paladin: 'Paladino',
  'high-wizard': 'Alto_Mago',
  scholar: 'Professor',
  sniper: 'Atirador',
  minstrel: 'Menestrel',
  gypsy: 'Cigana',
  'high-priest': 'Alto_Sacerdote',
  champion: 'Campeao',
  'assassin-cross': 'Assassino_Cruz',
  stalker: 'Perseguidor',
  whitesmith: 'Ferreiro_Branco',
  creator: 'Criador',
  'rune-knight': 'Cavaleiro_de_Runas',
  'royal-guard': 'Guarda_Real',
  'arcane-master': 'Mago_Arcano',
  sorcerer: 'Feiticeiro',
  ranger: 'Ranger',
  maestro: 'Maestro',
  wanderer: 'Andarilha',
  archbishop: 'Arcebispo',
  sura: 'Sura',
  'guillotine-cross': 'Cruz_Guilhotina',
  'shadow-chaser': 'Cacador_de_Sombras',
  mechanic: 'Mecanico',
  genetic: 'Genetico',
}

const BASE = 'https://browiki.org/wiki'
const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': 'RagTree/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

function extractClassIcon(html: string): string {
  // Extrai a primeira imagem da infobox da classe
  // AJUSTE este regex baseado no que você ver no HTML da página
  const match = html.match(/class="infobox[^"]*"[\s\S]*?<img[^>]+src="([^"]+)"/i)
    ?? html.match(/<img[^>]+src="(\/images\/[^"]+\.png)"[^>]*class="[^"]*class-icon[^"]*"/i)
    ?? html.match(/src="(https:\/\/browiki\.org\/images\/[^"]+\.png)"/i)
  return match ? (match[1].startsWith('http') ? match[1] : `https://browiki.org${match[1]}`) : ''
}

function extractSkills(html: string): Record<string, { name: string; icon_url: string }> {
  const skills: Record<string, { name: string; icon_url: string }> = {}
  // Extrai skills da tabela de habilidades
  // AJUSTE este regex baseado no HTML real da página
  // Padrão esperado: link para a skill + ícone + nome
  const rows = html.matchAll(/<tr[^>]*>[\s\S]*?href="\/wiki\/([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<\/tr>/gi)
  for (const row of rows) {
    const skillSlug = row[1].toLowerCase().replace(/_/g, '-')
    const iconUrl = row[2].startsWith('http') ? row[2] : `https://browiki.org${row[2]}`
    // Nome vem do título do link (texto do <a>)
    const nameMatch = row[0].match(/href="\/wiki\/[^"]+">([^<]+)<\/a>/)
    if (nameMatch) {
      skills[skillSlug] = { name: nameMatch[1].trim(), icon_url: iconUrl }
    }
  }
  return skills
}

async function scrapeClass(slug: string, bwName: string) {
  const url = `${BASE}/${bwName}`
  try {
    const html = await fetchPage(url)
    const icon_url = extractClassIcon(html)
    const skills = extractSkills(html)
    return { name: bwName.replace(/_/g, ' '), icon_url, skills }
  } catch (e) {
    console.error(`ERRO ao scrape ${slug} (${url}):`, (e as Error).message)
    return { name: bwName.replace(/_/g, ' '), icon_url: '', skills: {} }
  }
}

const result: Record<string, any> = {}
for (const [slug, bwName] of Object.entries(CLASSES)) {
  process.stderr.write(`Scraping ${slug}...\n`)
  result[slug] = await scrapeClass(slug, bwName)
  await delay(500) // respeitar rate limit
}

console.log(JSON.stringify(result, null, 2))
```

> **Atenção:** Os regex de extração **precisam ser ajustados** após inspecionar o HTML real das páginas do browiki.org no Step 1. O script acima é um ponto de partida.

- [ ] **Step 3: Testar scraping em uma única classe**

```bash
cd ragtree-api
bun -e "
const BASE = 'https://browiki.org/wiki'
const res = await fetch(\`\${BASE}/Mago\`, { headers: { 'User-Agent': 'RagTree/1.0' } })
const html = await res.text()
// Imprimir primeiros 3000 chars para inspecionar estrutura
console.log(html.slice(0, 3000))
"
```

Use o output para ajustar os regex no script de scraping.

- [ ] **Step 4: Rodar o scraping completo**

```bash
cd ragtree-api
bun src/scripts/scrape-browiki.ts > browiki-map.json 2>scrape.log
wc -l browiki-map.json   # deve ter muitas linhas
cat scrape.log           # verificar erros
```

- [ ] **Step 5: Validar output do scraping**

```bash
cd ragtree-api
bun -e "
const map = JSON.parse(await Bun.file('browiki-map.json').text())
console.log('Classes:', Object.keys(map).length)
console.log('Mago icon:', map.mage?.icon_url)
console.log('Mago skills:', Object.keys(map.mage?.skills ?? {}).slice(0, 3))
console.log('Scholar name:', map.scholar?.name)
"
```

Esperado: 46 classes, ícones com URLs reais, nomes em pt-br.

---

## Task 2: Adicionar helper `bw()` em `shared.ts`

**Files:**
- Modify: `ragtree-api/src/scripts/seed-data/shared.ts`

- [ ] **Step 1: Adicionar helper no topo do arquivo, após `dp()`**

Localizar a função `dp` em `shared.ts` e adicionar imediatamente após ela:

```ts
export const bw = (filename: string) =>
  `https://browiki.org/images/${filename}`
```

> Nota: não adicionar `.png` fixo — o filename já vem com extensão do JSON de scraping.

- [ ] **Step 2: Verificar compilação**

```bash
cd ragtree-api
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "shared" | head -5
```

Esperado: sem erros de tipos.

- [ ] **Step 3: Commit**

```bash
git add ragtree-api/src/scripts/seed-data/shared.ts
git commit -m "feat: add bw() helper for browiki.org image URLs"
```

---

## Task 3: Atualizar classes em `seed.ts`

**Files:**
- Modify: `ragtree-api/src/scripts/seed.ts`

- [ ] **Step 1: Carregar o mapeamento browiki**

No topo do arquivo `seed.ts`, após os imports existentes, adicionar:

```ts
import browikiMap from './seed-data/browiki-map.json' assert { type: 'json' }
```

E mover o arquivo gerado:
```bash
cp ragtree-api/browiki-map.json ragtree-api/src/scripts/seed-data/browiki-map.json
```

- [ ] **Step 2: Atualizar o array CLASSES**

Para cada entrada no array CLASSES (linhas 17–67 do `seed.ts`), atualizar os campos `name` e `icon_url` usando o mapeamento. O `slug` não muda.

Exemplo de como ficará cada entrada:
```ts
// Antes:
{ _id: C.mage, name: 'Mage', slug: 'mage', ..., icon_url: '🔮', ... }

// Depois:
{ _id: C.mage, name: browikiMap.mage.name, slug: 'mage', ..., icon_url: browikiMap.mage.icon_url, ... }
```

Aplicar isso a todas as 46 entradas do array, mapeando cada `slug` para a chave correspondente no `browikiMap`.

Se a chave no browikiMap não existir (scraping falhou), usar o nome em inglês como fallback temporário.

- [ ] **Step 3: Verificar compilação**

```bash
cd ragtree-api
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "seed.ts" | head -5
```

- [ ] **Step 4: Commit**

```bash
git add ragtree-api/src/scripts/seed.ts ragtree-api/src/scripts/seed-data/browiki-map.json
git commit -m "feat: update class names to pt-br and browiki icon URLs"
```

---

## Task 4: Atualizar skills pt-br em cada chain file

> Repetir o mesmo processo para cada um dos 6 arquivos de seed de skills.
> Para cada arquivo: atualizar o campo `name` com o nome pt-br do `browikiMap[classSlug].skills[slug]`.
> O campo `slug` nunca muda. O campo `icon_url` pode ser atualizado se o scraping retornou URL válida.

**Files:**
- Modify: todos os `ragtree-api/src/scripts/seed-data/skills-*-chain.ts`

- [ ] **Step 1: Atualizar `skills-mage-chain.ts`**

Para cada skill no arquivo, localizar o nome correspondente em `browikiMap`. Exemplo:

```ts
// Antes:
{ ..., name: 'Fire Ball', slug: 'fire-ball', ..., icon_url: dp(17), ... }

// Depois (se browikiMap.mage.skills['fire-ball'] existir):
{ ..., name: browikiMap.mage.skills['fire-ball']?.name ?? 'Fire Ball', slug: 'fire-ball', ..., icon_url: browikiMap.mage.skills['fire-ball']?.icon_url || dp(17), ... }
```

> **Atenção sobre posições x,y:** Após atualizar os nomes, verificar o layout de cada árvore de skills no browiki.org. O grid do browiki.org mostra a posição visual de cada skill. Ajustar os campos `position: { x, y }` para que o grid do RagTree reflita o mesmo layout do browiki.
>
> Processo:
> 1. Abrir `https://browiki.org/wiki/Habilidades_de_Mago` (ou equivalente)
> 2. Mapear cada skill para uma posição (col, row) no grid
> 3. Atualizar `position.x` (coluna, 0-indexada) e `position.y` (linha, 0-indexada)

- [ ] **Step 2: Atualizar `skills-swordsman-chain.ts`**

Mesmo processo do Step 1 para a cadeia do Espadachim.

- [ ] **Step 3: Atualizar `skills-archer-chain.ts`**

Mesmo processo para a cadeia do Arqueiro.

- [ ] **Step 4: Atualizar `skills-acolyte-chain.ts`**

Mesmo processo para a cadeia do Acólito.

- [ ] **Step 5: Atualizar `skills-thief-chain.ts`**

Mesmo processo para a cadeia do Ladrão.

- [ ] **Step 6: Atualizar `skills-merchant-chain.ts`**

Mesmo processo para a cadeia do Mercador.

- [ ] **Step 7: Verificar compilação de todos os arquivos**

```bash
cd ragtree-api
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "skills-mage-chain.ts
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "skills-swordsman-chain.ts
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "skills-archer-chain.ts
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "skills-acolyte-chain.ts
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "skills-thief-chain.ts
cd ragtree-api && bunx tsc --noEmit 2>&1 | grep "skills-merchant-chain.ts
```

Esperado: zero erros em todos.

- [ ] **Step 8: Commit**

```bash
git add ragtree-api/src/scripts/seed-data/
git commit -m "feat: update all skill names to pt-br from browiki.org"
```

---

## Task 5: Rodar seed e verificar dados

**Files:** nenhum modificado — só execução.

- [ ] **Step 1: Rodar o seed no container**

```bash
docker compose exec api bun src/scripts/seed.ts
```

Esperado:
```
MongoDB connected
🌱 Seeding...
✅ 46 classes
✅ 303 skills
✅ 60 items
✅ 40 monsters
🎉 Done!
```

- [ ] **Step 2: Verificar nomes das classes via API**

```bash
curl -s http://localhost:3001/classes | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(c['name'], '|', c['icon_url'][:50] if c.get('icon_url') else 'SEM ÍCONE') for c in d[:5]]"
```

Esperado: nomes em pt-br e URLs do browiki.org para ao menos 3 das 5 primeiras.

- [ ] **Step 3: Verificar nomes de skills**

```bash
curl -s http://localhost:3001/classes/mage | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(s['name']) for s in d.get('skills', [])[:5]]"
```

Esperado: nomes em pt-br (ex: "Bola de Fogo", "Raio Elétrico").

---

## Task 6: Adicionar endpoint `GET /classes/:slug/chain`

**Files:**
- Modify: `ragtree-api/src/routes/classes.routes.ts`

- [ ] **Step 1: Adicionar a rota antes de `/:slug`**

Inserir o bloco abaixo **entre** o `.get('/')` e o `.get('/:slug')` existentes:

```ts
.get('/:slug/chain', async ({ params, set }) => {
  const target = await Class.findOne({ slug: params.slug }).lean()
  if (!target) { set.status = 404; return { error: 'Not found' } }

  const chain: any[] = [target]
  let current: any = target
  while (current.parent_class_id) {
    const parent = await Class.findById(current.parent_class_id).lean()
    if (!parent) break
    chain.push(parent)
    current = parent
  }
  chain.reverse()

  return Promise.all(
    chain.map(async (cls) => ({
      ...cls,
      skills: await Skill.find({ class_id: cls._id }).lean()
    }))
  )
})
```

- [ ] **Step 2: Reiniciar o container da API**

```bash
docker compose restart api
sleep 3
```

- [ ] **Step 3: Testar cadeia do Feiticeiro**

```bash
curl -s http://localhost:3001/classes/sorcerer/chain | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print([c['name'] for c in d])"
```

Esperado: lista com 5 nomes pt-br, do Aprendiz ao Feiticeiro.

```bash
curl -s http://localhost:3001/classes/sorcerer/chain | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('Tamanho:', len(d), '| Primeiro:', d[0]['name'], '| Último:', d[-1]['name'])"
```

Esperado: `Tamanho: 5 | Primeiro: Aprendiz | Último: Feiticeiro`

- [ ] **Step 4: Testar cadeia do Cavaleiro de Runas**

```bash
curl -s http://localhost:3001/classes/rune-knight/chain | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print([c['name'] for c in d])"
```

Esperado: `['Aprendiz', 'Espadachim', 'Cavaleiro', 'Lorde Cavaleiro', 'Cavaleiro de Runas']`

- [ ] **Step 5: Testar 404 para slug inválido**

```bash
curl -s http://localhost:3001/classes/classe-inexistente/chain | python3 -c "import sys,json; print(json.load(sys.stdin))"
```

Esperado: `{'error': 'Not found'}`

- [ ] **Step 6: Verificar que cada classe da cadeia tem skills**

```bash
curl -s http://localhost:3001/classes/sorcerer/chain | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(c['name'], '-', len(c.get('skills',[])), 'skills') for c in d]"
```

Esperado: cada classe listada com contagem de skills > 0.

- [ ] **Step 7: Commit**

```bash
git add ragtree-api/src/routes/classes.routes.ts
git commit -m "feat: add GET /classes/:slug/chain endpoint"
```

---

## Verificação final do Plano A

```bash
# 1. Seed com dados corretos
docker compose exec api bun src/scripts/seed.ts
# Esperado: 46 classes, 303 skills

# 2. Nomes pt-br
curl -s http://localhost:3001/classes | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['name'])"
# Deve ser nome em pt-br

# 3. Chain endpoint
curl -s http://localhost:3001/classes/sorcerer/chain | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d), 'classes na cadeia')"
# Esperado: 5

# 4. Ícones carregando (spot check)
curl -s http://localhost:3001/classes | python3 -c "import sys,json; d=json.load(sys.stdin); url=d[0].get('icon_url',''); print('ICON OK' if url.startswith('http') else 'SEM ICON')"
```

Após confirmar tudo: **avançar para o Plano B (Frontend).**
