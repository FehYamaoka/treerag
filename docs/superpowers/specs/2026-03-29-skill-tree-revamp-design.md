# Skill Tree Revamp — Spec

**Data:** 2026-03-29

## Contexto

A árvore de habilidades atual exibe apenas os skills da classe selecionada, sem acesso às classes ancestrais. Todos os nomes estão em inglês com traduções genéricas. Os ícones de classe são emojis. O objetivo é tornar o simulador um reflexo fiel do jogo: cadeia completa de evolução, nomes oficiais pt-br (fonte: browiki.org), imagens corretas, e layout de grid fiel ao in-game.

## Escopo desta entrega

- Cadeia de classes completa com cards colapsáveis (Aprendiz → ... → classe alvo)
- Pool de pontos por classe usando `job_level_max` automaticamente (máximo de cada classe)
- Nomes de classes e skills em pt-br **exatamente** como aparecem no browiki.org
- Ícones de classe e skill do browiki.org / Divine Pride CDN
- Layout x,y do grid de skills fiel ao in-game (ajustado manualmente via browiki.org)

**Fora de escopo:** itens em pt-br, tooltip detalhado de skills, setas de pré-requisito visuais, builds page

---

## Fase 1 — Script de scraping do browiki.org

**Arquivo novo:** `ragtree-api/src/scripts/scrape-browiki.ts`

Script híbrido que roda uma vez para gerar um JSON de mapeamento. O resultado alimenta manualmente o seed data.

### O que o script deve extrair por classe:

1. **Nome pt-br da classe** — ex: a página `browiki.org/wiki/Feiticeiro` → `"Feiticeiro"`
2. **URL do emblema da classe** — imagem do ícone quadrado da classe no browiki
3. **Por skill da classe:**
   - Nome pt-br
   - URL do ícone da skill (browiki ou Divine Pride CDN)

### Estrutura do output (JSON):

```json
{
  "sorcerer": {
    "name": "Feiticeiro",
    "icon_url": "https://browiki.org/images/...",
    "skills": {
      "psychic-wave": { "name": "Onda Psíquica", "icon_url": "..." },
      "striking": { "name": "...", "icon_url": "..." }
    }
  }
}
```

### O que é manual (pós-scraping):

- Posições `x, y` de cada skill no grid — verificar no browiki.org a árvore de cada classe e replicar o layout exato
- Verificação de nomes duplicados ou ambíguos entre classes

### Execução:

```bash
cd ragtree-api && bun src/scripts/scrape-browiki.ts > browiki-map.json
```

---

## Fase 2 — Atualizar seed data

**Arquivos:** `shared.ts`, `seed.ts`, todos os `skills-*-chain.ts`

### 2.1 Helper `bw()` em `shared.ts`

```ts
export const bw = (filename: string) => `https://browiki.org/images/${filename}.png`
```

Centraliza as URLs — se o padrão mudar, altera em um só lugar.

### 2.2 Classes — `seed.ts`

Para cada uma das 46 classes, atualizar usando o JSON gerado pelo scraping:
- `name` → nome pt-br exato do browiki.org
- `icon_url` → `bw('NomeDoArquivo')` ou URL direta

> **Regra crítica:** `slug` nunca muda (indexado no banco e usado nas rotas). Apenas `name`, `icon_url` e `description` são alterados.

### 2.3 Skills — todos os `skills-*-chain.ts`

Para cada skill, usando o JSON de mapeamento:
- `name` → nome pt-br exato do browiki.org
- `icon_url` → URL do browiki ou Divine Pride CDN
- `position.x` e `position.y` → layout ajustado para refletir o grid in-game

### 2.4 Verificação

```bash
docker compose exec api bun src/scripts/seed.ts
# Esperado: 46 classes, 303 skills, 60 items, 40 monsters

curl http://localhost:3001/classes | jq '.[0].name'
# Deve retornar o nome pt-br correto (ex: "Aprendiz")
```

---

## Fase 3 — API: endpoint `/classes/:slug/chain`

**Arquivo:** `ragtree-api/src/routes/classes.routes.ts`

Adicionar rota **antes** de `/:slug` (evitar conflito de matching):

```ts
.get('/:slug/chain', async ({ params, set }) => {
  const target = await Class.findOne({ slug: params.slug }).lean()
  if (!target) { set.status = 404; return { error: 'Not found' } }

  // Percorre parent_class_id até Aprendiz (sem parent)
  const chain: IClass[] = [target]
  let current = target
  while (current.parent_class_id) {
    const parent = await Class.findById(current.parent_class_id).lean()
    if (!parent) break
    chain.push(parent)
    current = parent
  }
  chain.reverse() // Aprendiz primeiro

  // Popula skills de cada classe
  return Promise.all(
    chain.map(async (cls) => ({
      ...cls,
      skills: await Skill.find({ class_id: cls._id }).lean()
    }))
  )
})
```

**Verificação:**

```bash
curl http://localhost:3001/classes/sorcerer/chain | jq '. | length'    # 5
curl http://localhost:3001/classes/sorcerer/chain | jq '.[0].name'     # "Aprendiz"
curl http://localhost:3001/classes/sorcerer/chain | jq '.[-1].name'    # "Feiticeiro"
curl http://localhost:3001/classes/rune-knight/chain | jq '. | length' # 5
```

---

## Fase 4 — Store: multi-classe

**Arquivo:** `ragtree-web/src/store/skill-tree.store.ts` (reescrita completa)

### Nova shape de estado

```ts
interface SkillTreeState {
  classChain: Class[]
  skillPoints: Record<string, Record<string, number>> // classId → skillId → level
  baseLevel: number
  baseStats: { str: number; agi: number; vit: number; int: number; dex: number; luk: number }
}
```

### Métodos

| Método | Comportamento |
|--------|---------------|
| `setClassChain(chain)` | Substitui `setClass`; reseta todos os skillPoints |
| `getRemainingPoints(classId)` | `cls.job_level_max - Σ skillPoints[classId]` |
| `getSkillLevel(classId, skillId)` | `skillPoints[classId]?.[skillId] ?? 0` |
| `addSkillPoint(classId, skillId, skill)` | Valida via `canAddPoint` antes de adicionar |
| `removeSkillPoint(classId, skillId)` | Decrementa, ignora se já em 0 |
| `resetClass(classId)` | Limpa apenas o bucket da classe |
| `resetAll()` | Limpa todos os buckets |
| `getCurrentClass()` | `classChain.at(-1) ?? null` — compatibilidade |
| `canAddPoint(classId, skill)` | Ver lógica abaixo |

### `canAddPoint` — lógica

```ts
canAddPoint(classId, skill) {
  const current = getSkillLevel(classId, skill._id)
  if (current >= skill.max_level) return false
  if (getRemainingPoints(classId) <= 0) return false

  for (const prereq of skill.prerequisites) {
    // Busca em TODOS os buckets (cross-classe)
    const lvl = Object.values(skillPoints)
      .flatMap(Object.entries)
      .find(([id]) => id === prereq.skill_id)?.[1] ?? 0
    if (lvl < prereq.required_level) return false
  }
  return true
}
```

> Cross-classe é necessário porque, por exemplo, "Trovão de Júpiter" (Mago Sábio) exige "Raio Elétrico" (Mago) nível 3.

---

## Fase 5 — Componentes Frontend

### Novos componentes

**`ClassChainTree.tsx`**
- Recebe `chain: Class[]`
- No mount: `store.setClassChain(chain)`
- Renderiza lista vertical de `<ClassCard>` + `<StatsPreview>` uma vez ao final

**`ClassCard.tsx`**
- Props: `cls: Class`, `isLast: boolean`
- Estado local: `collapsed` (padrão: `!isLast` — último card começa aberto)
- Header (sempre visível): ícone browiki + nome pt-br + badge `X / job_level_max pts` + chevron
- Body (quando aberto): `<SkillTree cls={cls} />`

### Adaptações

**`SkillTree.tsx`**
- Remover `useEffect(() => setClass(cls), ...)` — chain é setada por `ClassChainTree`
- `getRemainingPoints()` → `getRemainingPoints(cls._id)`
- Botão reset → `resetClass(cls._id)`
- Remover bloco Stats Preview — movido para `ClassChainTree`
- Passar `classId={cls._id}` para cada `<SkillNode>`

**`SkillNode.tsx`**
- Nova prop: `classId: string`
- `skillPoints[skill._id]` → `getSkillLevel(classId, skill._id)`
- `canAddPoint(skill)` → `canAddPoint(classId, skill)`
- `addSkillPoint(skill._id, skill)` → `addSkillPoint(classId, skill._id, skill)`
- `removeSkillPoint(skill._id)` → `removeSkillPoint(classId, skill._id)`
- Estado maxed: borda amber-600 quando `current >= skill.max_level`

**`ClassPageClient.tsx`**
- Prop: `chain: Class[]` (antes `cls: Class`)
- Renderiza `<ClassChainTree chain={chain} />`
- Passa `chain.at(-1)._id` para `SaveBuildModal`

**`[slug]/page.tsx`**
- Fetch: `/classes/${slug}/chain` → `Class[]`
- `cls` para metadata = `chain.at(-1)`
- Passa `chain` para `ClassPageClient`

**`SaveBuildModal.tsx`**
- Achatar skillPoints antes de salvar (sem migração de schema):
  ```ts
  const flatPoints = Object.values(skillPoints)
    .reduce((acc, bucket) => ({ ...acc, ...bucket }), {})
  ```

**`next.config.ts`**
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'browiki.org' },
    { protocol: 'https', hostname: 'static.divine-pride.net' },
  ]
}
```

---

## Ordem de implementação

| # | Arquivo | Tipo |
|---|---|---|
| 1 | `scrape-browiki.ts` | Criar script de scraping |
| 2 | Executar script | Gerar `browiki-map.json` |
| 3 | `shared.ts` | Adicionar `bw()` |
| 4 | `seed.ts` | 46 classes pt-br + browiki URLs |
| 5 | `skills-mage-chain.ts` | Names pt-br + posições x,y |
| 6 | `skills-swordsman-chain.ts` | Names pt-br + posições x,y |
| 7 | `skills-archer-chain.ts` | Names pt-br + posições x,y |
| 8 | `skills-acolyte-chain.ts` | Names pt-br + posições x,y |
| 9 | `skills-thief-chain.ts` | Names pt-br + posições x,y |
| 10 | `skills-merchant-chain.ts` | Names pt-br + posições x,y |
| 11 | Rodar seed | Verificar contagens |
| 12 | `classes.routes.ts` | Endpoint `/chain` |
| 13 | Verificar API | curl /chain |
| 14 | `skill-tree.store.ts` | Reescrita multi-classe |
| 15 | `SkillNode.tsx` | `classId` prop + store calls |
| 16 | `SkillTree.tsx` | Remove setClass effect, stats out |
| 17 | `ClassCard.tsx` | Novo componente |
| 18 | `ClassChainTree.tsx` | Novo componente |
| 19 | `ClassPageClient.tsx` | Aceita `chain` |
| 20 | `[slug]/page.tsx` | Fetch `/chain` |
| 21 | `SaveBuildModal.tsx` | Achatar skillPoints |
| 22 | `next.config.ts` | Remote patterns |
| 23 | Rebuild Docker | `docker compose build --no-cache web && docker compose up -d` |

---

## Casos de borda

- **Pré-requisito cross-classe**: busca em todos os buckets de `skillPoints`
- **Aprendiz sem parent**: loop termina naturalmente (sem parent_class_id)
- **Branch** (Bardo/Dançarina de Arqueiro): chain é linear, sem conflito
- **URL browiki 404**: fallback `''` — frontend já trata `icon_url &&`
- **Scraping bloqueado**: browiki pode ter rate limit; usar delays entre requests
