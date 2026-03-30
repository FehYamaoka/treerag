# Build Simulator — Frontend Part 3: Page Layout + Landing Redesign

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Integrar Equipment+Stats na página de build. Redesenhar landing page em 3 seções sem scroll.

**Pré-requisito:** Frontend Part 2 concluído (EquipmentPanel, StatsPanel).

---

## Task 1 — Atualizar ClassPageClient

**Files:**
- Modify: `ragtree-web/src/app/classes/[slug]/ClassPageClient.tsx`

- [ ] Novo layout: Equipment + Stats lado a lado no topo, info card no meio, skill trees embaixo. Importar EquipmentPanel e StatsPanel. Manter SaveBuildModal existente. O SaveBuildModal precisa incluir `equipment` do store no body do POST.

- [ ] Commit: `git commit -m "feat: integrate equipment and stats panels into class page"`

---

## Task 2 — Atualizar SaveBuildModal

**Files:**
- Modify: `ragtree-web/src/components/builds/SaveBuildModal.tsx`

- [ ] Ler `equipment` do store além de `skillPoints` e `baseStats`. Serializar equipment no POST body (converter Item objects para IDs antes de enviar).

- [ ] Commit: `git commit -m "feat: include equipment in build save payload"`

---

## Task 3 — Landing Page Redesign

**Files:**
- Modify: `ragtree-web/src/components/landing/HeroSection.tsx`
- Modify: `ragtree-web/src/components/landing/ClassesSection.tsx`
- Modify: `ragtree-web/src/components/landing/BuildsSection.tsx`
- Modify: `ragtree-web/src/app/page.tsx`

- [ ] **HeroSection:** Compacto, sem emojis grandes. Título + subtítulo + 2 CTAs. Altura max ~20vh.

- [ ] **ClassesSection:** Grid com filtro por tier (1st/2nd/3rd/4th/Transcendent). Toggle pills no topo. ~40vh.

- [ ] **BuildsSection:** Top builds com mini preview de stats. Filtro por classe. ~40vh.

- [ ] **page.tsx:** Remover FeaturesSection. Layout `h-screen` com as 3 seções distribuídas sem scroll.

- [ ] Commit: `git commit -m "feat: redesign landing page - 3 sections, no scroll"`

---

## Verificação Final

```bash
# 1. Build Docker web
docker compose build --no-cache web && docker compose up -d

# 2. Homepage sem scroll
# Abrir http://localhost:3000 — 3 seções visíveis sem scroll

# 3. Página de build completa
# Abrir http://localhost:3000/classes/sorcerer
# Verificar: Equipment panel + Stats + Info + Skill trees

# 4. Equipar item
# Clicar num slot → buscar item → selecionar → stats atualizam

# 5. Salvar build
# Clicar "Salvar Build" → verificar que equipment é persistido
```
