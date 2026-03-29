# Design: Landing Page Redesign + Seed Data

**Date:** 2026-03-28
**Approach:** B — Component-based landing page + unified seed script
**Scope:** ragtree-web (frontend) + ragtree-api (seed script)

---

## Overview

Two deliverables:

1. **Landing page redesign** — cinematic game-website aesthetic (inspired by Where Winds Meet) with pixel art RO nostalgia feel, replacing the current minimal homepage.
2. **Seed script** — single `seed.ts` Bun script that populates MongoDB with all RO classes (base through 4th), canonical skills, representative items, and classic monsters.

---

## 1. Landing Page

### Visual Style

- **Background:** `#0a0a0f` (near-black with a warm dark-green undertone)
- **Accent / gold:** `#d4a017`
- **Highlight text:** `#f5e6a3`
- **Muted text:** `#8a9a7a`, `#666`, `#555`
- **Borders:** `#2a2a10`, `#1f2a0f`, `#3d2e00`
- **Typography:** monospace for labels/letters, normal sans-serif for body
- **Decorative elements:** pixel dot dividers (`▪▪▪▪▪`), `letter-spacing` on uppercase labels, border-left highlights on list items
- **No video backgrounds**

### Component Architecture

`src/app/page.tsx` remains a Server Component. It fetches classes and top-6 builds (by views), then passes data as props to the section components. It does not contain markup beyond composition.

```
src/app/page.tsx
src/components/landing/
  HeroSection.tsx
  FeaturesSection.tsx
  ClassesSection.tsx
  BuildsSection.tsx       ← "use client"
```

### Sections (top to bottom)

#### HeroSection
- Full-width atmospheric panel with CSS gradient: `linear-gradient(180deg, #0a0a0f 0%, #0f1a0a 30%, #1a2800 60%, #0a0a0f 100%)`
- Decorative pixel-dot top/bottom dividers
- Emoji silhouette row (trees/mountains) behind the text for atmosphere
- Label: `RAGNAROK ONLINE LATAM` (small, gold, wide letter-spacing)
- Title: `Forge Your Legend` (large, `#f5e6a3`, text-shadow glow)
- Subtitle: `Simule árvores de skills, monte builds e explore o universo de Midgard`
- Two CTAs: primary `▶ SIMULAR BUILD` (gold fill) → `/classes`, secondary `VER CLASSES` (gold outline) → `/classes`

#### FeaturesSection
- Title label: `O QUE É O RAGTREE` (gold, letter-spacing)
- 3-column grid, each card with dark border:
  - 🌳 **Árvore de Skills** — Visualize e simule qualquer combinação de habilidades
  - 🗡️ **Calcule Stats** — ATK, MATK, ASPD, HIT, FLEE e muito mais
  - 👥 **Comunidade** — Salve e compartilhe builds com outros jogadores

#### ClassesSection
- Header: `CLASSES DE MIDGARD` (gold label) + `Ver todas →` link to `/classes`
- 6-column grid of class cards, each with emoji icon, class name in gold, role descriptor in muted text
- Shows all classes seeded (all generations)

#### BuildsSection (`"use client"`)
- Header: `BUILDS EM DESTAQUE` (gold label) + `Ver todas →` link to `/builds`
- Class filter: pills row above the list
  - First pill: **Todas** (active by default, gold fill)
  - One pill per class that has at least 1 public build
  - Active pill: gold background, black text; inactive: dark border, muted text
  - Clicking a pill filters the list client-side (no new server request)
- Build list: top 6 by views, filtered by active class
  - Rank #1: `border-left: 2px solid #d4a017`
  - Others: `border-left: 2px solid #555`
  - Each row: build title, author + class name, view count
  - If active filter has no builds: `Nenhuma build para esta classe ainda`

#### Footer (existing, no changes needed)

---

## 2. Seed Data

### Script location

`ragtree-api/src/scripts/seed.ts`

### Usage

```bash
bun run src/scripts/seed.ts
```

The script is **idempotent**: runs `deleteMany({})` then `insertMany()` for each collection. Safe to re-run.

### Classes

Full RO class hierarchy with correct `parent_class_id` references:

| Generation | Classes |
|---|---|
| Novice | Novice |
| 1st | Swordsman, Mage, Archer, Acolyte, Thief, Merchant |
| 2nd | Knight, Crusader, Wizard, Sage, Hunter, Bard, Dancer, Priest, Monk, Assassin, Rogue, Blacksmith, Alchemist |
| 3rd (Transcendent) | Lord Knight, Paladin, High Wizard, Scholar, Sniper, Minstrel, Gypsy, High Priest, Champion, Assassin Cross, Stalker, Whitesmith, Creator |
| 4th (Renewal) | Rune Knight, Royal Guard, Arcane Master, Sorcerer, Ranger, Maestro, Wanderer, Archbishop, Sura, Guillotine Cross, Shadow Chaser, Mechanic, Genetic |

Each class document: `name`, `slug`, `description`, `base_level_max`, `job_level_max`, `parent_class_id` (ObjectId reference), `icon_url` (emoji placeholder).

### Skills

8–15 canonical skills per class. Each skill document:

- `name`, `slug`, `class_id`
- `description`, `max_level`, `type` (active/passive/buff/support)
- `prerequisites`: array of `{ skill_id, required_level }` — mirrors in-game tree
- `position`: `{ x, y }` — mirrors actual in-game skill tree grid layout
- `icon_url`: URL pointing to the official RO LATAM site skill icon image
- `levels`: array of `{ level, sp_cost, cast_time, effects }` for at least max_level entries

Skill tree positions use the same coordinate grid as the in-game skill tree so the `SkillTree` component can render them identically.

### Items (~80)

Representative selection covering all equipment types:

- **Weapons:** Sword, Two-Handed Sword, Spear, Mace, Rod/Staff, Bow, Dagger, Knuckle, Axe, Whip, Instrument
- **Armors:** Leather Armor, Chain Mail, Plate Armor, Robe, various headgear
- **Cards:** Poring Card, Hydra Card, Skeleton Worker Card, Bathory Card, Thara Frog Card, Marc Card, etc.
- **Consumables:** Red Potion, Blue Potion, White Potion, Yggdrasil Berry, Speed Potion

Each item: `name`, `slug`, `type`, `sub_type`, `weight`, stats (`atk`, `matk`, `def`, `mdef`), `slots`, `required_level`, `required_job`, `effects`, `npc_sell_price`, `icon_url`.

### Monsters (~40)

Classic RO monsters covering a range of levels and zones:

Poring, Lunatic, Fabre, Willow, Thief Bug, Zombie, Skeleton, Orc Warrior, Orc Lady, Minotaur, Hydra, Swordfish, Marc, Bathory, Drake, Baphomet, Dark Lord, Eddga, Moonlight Flower, Osiris, Golden Thief Bug, Maya, Pharaoh, Lord of Death, Turtle General, Stormy Knight, Fallen Bishop, Kiel-D-01, Randgris, Thanatos.

Each monster: `name`, `slug`, `level`, `hp`, `exp`, `job_exp`, `element`, `race`, `size`, `atk`, `def`, `drop_items` (with `item_id` references and drop rates), `icon_url`.

---

## Out of Scope (reserved for Abordagem C)

- Global design token system / CSS variables for game theme
- Design system applied to all other pages (classes, items, builds, dashboard)
- Component library / shared UI primitives

---

## Constraints

- No video backgrounds
- SSR-safe: `BuildsSection` is the only client component, receives data as props
- Seed script must run in isolation (no running API required, connects directly to MongoDB)
- Skill positions must match actual in-game tree layout per class
- Skill icon URLs must reference the official RO LATAM website image paths
