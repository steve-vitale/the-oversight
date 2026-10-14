# Psycho Violence Wiring — Design (2026-10-13)

## Steve's direction
- Inter-villager conflict should be RARE
- Sources: (a) bad eggs at spawn (malicious psychos), (b) hostile wanderers, (c) warring-village contact
- Villagers SHOULD fight back against alien players

## Current state (verified)
- Malicious psychos: 1.5% spawn, max 1/village. Affects scamming (+2), party score (+45), lying motives. ZERO violence.
- Inter-villager violence: 0 code paths. Census 0/123 deaths.
- Alien kills: instant-kill, max 1 per 5 days, no fight back. `apBuildFighter` exists but only for player combat.
- Visitors: shady/desperate flags exist, feed scamminess. No violent type.
- Warring villages: no system exists.

## Design

### 1. Malicious psycho escalation (corruption.js)

**Principle:** Violence needs motives, not dice. The psycho escalates through stages, each with triggers and cooldowns.

**Stages:**
- **Stage 0 — Dormant:** The psycho is just... off. Quirk visible. No action.
- **Stage 1 — Theft:** Steals from pantry or a villager. Trigger: hunger, opportunity (night), low village trust in them. This feeds the justice ladder as a crime (theft).
- **Stage 2 — Intimidation:** Threatens a villager. Trigger: previous theft undiscovered, victim is vulnerable (low status). Effect: victim gets fear, may leave village or confront.
- **Stage 3 — Attack:** Physical assault via fieldFight. Trigger: stage 2 victim confronted them, OR extreme stress (starvation + high corruption). This is RARE.

**Rates (target):**
- Daily check only if psycho exists and is alive
- Stage 1: ~2% per day when hungry/opportunity (roughly once per 50 days)
- Stage 2: only after stage 1, ~10% per day (escalates within ~10 days if unchecked)
- Stage 3: only after stage 2, ~5% per day (roughly 1 in 20 escalations reach violence)
- Net: ~1-2% of runs with a psycho see actual violence

**Justice integration:**
- Theft → `recordCrime('theft', {villain: psychoId})` → justice ladder (cold shoulder → confrontation → moot)
- Intimidation → `recordCrime('threat', ...)` → higher heat
- Attack → immediate confrontation by witnesses → moot → exile or uprising
- If the village exiles the psycho and they return → uprising

### 2. Villager vs alien combat (alienPlayers.js)

**Principle:** When an alien murders a villager, the village doesn't just watch.

**Mechanism:**
- Hook into the alien villager-kill path (after `registerDeath` with cause 'alien')
- Find nearby villagers: at Haven, or within 3 tiles of the kill
- Each nearby villager makes a LEARN-VS-FIGHT judgment:
  - If they know the alien is dangerous (witnessed kill, high fear) → more likely to engage
  - If in a group (2+ villagers) → more likely to engage
  - Bold/intense temperaments → more likely
- Engaging villagers use `fieldFight` with the alien's fighter (via `apBuildFighter`)
- Outcome:
  - Villagers win → alien retreats (not killed — they have backup bodies per canon)
  - Alien wins → villagers flee or die (existing death paths)
  - This creates a real cost for alien predation

**Rates:**
- Only triggers on actual kills (max 1 per 5 days already)
- ~60% chance at least one villager engages if 3+ present
- This makes alien kills risky, not free

### 3. Hostile wanderers (betrayal.js visitor system)

**Principle:** Most visitors are just people. A rare few are dangerous.

**Mechanism:**
- Add `hostile` flag to visitor generation: ~3% of visitors
- Hostile visitors:
  - May steal (like psycho stage 1)
  - May threaten (like psycho stage 2)
  - Rarely (~10% of hostile visitors) may attack
- Village response: confrontation → drive off → combat if they don't leave
- Uses existing visitor framework, adds violence as a rare branch

### 4. Warring village contact

**Scope note:** Full inter-village warfare is a large system. For this wiring:
- Add the hook: `villageRelations` tracks hostility
- When hostility is high, raids can occur (steal → violence if resisted)
- This is a foundation, not the full system

## Target rates (Steve: "shouldn't be as frequent")
- Psycho violence: 1-2% of runs
- Wanderer violence: 1-2% of runs  
- Alien-villager combat: triggers on alien kills (already rare at 1 per 5 days max)
- Total inter-villager deaths: <5% of all deaths (vs 0% now, vs mismeasured 22%)

## Files to modify
1. `src/js/corruption.js` — psycho escalation stages, daily tick
2. `src/js/alienPlayers.js` — villager engagement on alien kill
3. `src/js/betrayal.js` — hostile visitor type
4. `src/js/justice.js` — ensure NPC crimes feed the ladder (may already work via recordCrime)

## Proof tests
- `scripts/test-psycho-violence-20261013.js`:
  - Psycho theft triggers justice ladder
  - Psycho escalation stages work
  - Alien kill triggers villager engagement
  - Hostile visitor can be driven off
  - Rates are sane (not rampant)

## Implementation (2026-10-13)

### Files changed
1. **`src/js/corruption.js`** — Added `psychoViolenceTick()`:
   - Runs once per day (dawn part) via `corruptionTick()`
   - Finds malicious psychos in the village roster
   - Stage 0→1 (Theft): ~2%/day when hungry/opportunity, records 'theft' crime
   - Stage 1→2 (Intimidation): ~10%/day after theft, records 'threat' crime, +25 fear to victim
   - Stage 2→3 (Attack): ~5%/day, uses fieldFight vs victim, records 'assault' crime
   - 7-day cooldown between acts; stage 3 hands off to justice ladder

2. **`src/js/alienPlayers.js`** — Added `apVillagerRetaliate(pid, victimId)`:
   - Called after alien kills a villager (in the kill path)
   - Brave villagers (bold/intense temperaments, low fear, group courage) may engage
   - Uses `fieldFight` with alien as opponent (via mdef conversion)
   - Victory → alien driven off (deactivated, not killed — backup bodies per canon)
   - Defeat → village mourns

3. **`src/js/betrayal.js`** — Added hostile visitors:
   - `visitor.hostile = R() < 0.03` (~3% of visitors)
   - `hostileVisitorTick()` called from `betrayalDaily()`
   - 30% of hostile visitors act: 50% steal, 35% threaten, 15% attack (very rare)
   - Attackers are driven off immediately

### Proof results
- **GREEN**: 11/11 tests pass
- **RED**: 11/11 correctly fail on pre-change code (verified via patch-file revert)
- All modules pass `node --check`

### Target rates (Steve: "shouldn't be as frequent")
- Psycho violence: ~1-2% of runs with a psycho see stage 3
- Hostile visitor attack: ~0.45% of all visitors (3% hostile × 30% act × 15% attack)
- Alien retaliation: triggers on kills (max 1 per 5 days), ~60% engagement with 3+ villagers
- Total inter-villager deaths: target <5% of all deaths (vs 0% now)
