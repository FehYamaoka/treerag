# Build Simulator — Frontend Part 2: Equipment UI Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Criar EquipmentPanel (visual in-game), EquipSlot, EquipModal e StatsPanel.

**Pré-requisito:** Frontend Part 1 concluído (types, stats engine, store).

---

## Task 1 — EquipSlot Component

**Files:**
- Create: `ragtree-web/src/components/equipment/EquipSlot.tsx`

- [ ] Criar componente que renderiza um slot de equipamento. Props: `slot: EquipSlot`, `label: string`. Lê do store. Slot vazio = borda tracejada. Slot preenchido = ícone + badge refine + dots de cartas. Click abre EquipModal.

- [ ] Commit: `git commit -m "feat: add EquipSlot component"`

---

## Task 2 — EquipModal Component

**Files:**
- Create: `ragtree-web/src/components/equipment/EquipModal.tsx`

- [ ] Modal com 4 seções:
  1. **Busca de item** — input de texto + toggle "Só LATAM" + lista filtrada por `equip_slot`. Fetch de `/items?slot={slot}&latam={toggle}&q={search}`.
  2. **Refine slider** — range 0-20, mostra bônus em tempo real. Só aparece se `item.refineable`.
  3. **Card slots** — baseado em `item.slots`. Para cada slot, busca de cards filtradas por tipo compatível.
  4. **Enchantments** — fetch de `/enchantments`, selecionar até 1-3 dependendo do sistema.

- [ ] Ao confirmar, chama `setEquipSlot(slot, { item_id, refine, cards, enchantments })` no store.

- [ ] Commit: `git commit -m "feat: add EquipModal with item search, refine, cards, enchantments"`

---

## Task 3 — EquipmentPanel Component

**Files:**
- Create: `ragtree-web/src/components/equipment/EquipmentPanel.tsx`

- [ ] Layout visual estilo ALT+Q do jogo. Silhueta/outline centralizada. 10 EquipSlots posicionados com absolute positioning:
  - head_top/mid/low no topo
  - weapon à esquerda, shield à direita
  - armor no centro
  - garment e footgear embaixo
  - accessory_l e accessory_r nos cantos inferiores

- [ ] Inclui inputs de Base Stats (STR/AGI/VIT/INT/DEX/LUK) e Base Level embaixo do painel.

- [ ] Commit: `git commit -m "feat: add EquipmentPanel with in-game visual layout"`

---

## Task 4 — StatsPanel Component

**Files:**
- Create: `ragtree-web/src/components/equipment/StatsPanel.tsx`

- [ ] Painel que chama `computeFullStats()` com dados do store (baseLevel, baseStats, equipment, skillEffects). Organizado em 3 seções colapsáveis:
  - **Primários:** ATK (status+weapon), MATK, HIT, FLEE, CRIT, ASPD, HP, SP, DEF (hard+soft), MDEF, DPS
  - **Secundários:** Perfect Dodge, Cast Time, ACD, Regen, Healing
  - **Modifiers:** Range damage, vs Boss/Normal, Resistências elementais

- [ ] Valores atualizam em tempo real via store subscription.

- [ ] Commit: `git commit -m "feat: add StatsPanel with full Renewal stats display"`
