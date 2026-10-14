# Armor + recruitment discovery fixes — 2026-10-13/14

Worker: sim-armor-recruit-fix. Implements the armor-audit and sustainability-audit
(§3 recruitment) recommendations as GAME fixes (not sim-policy fixes).

## Pre-registration (§11)

- **Armor primary metric:** runs reaching bark_armor recipe L1 by day 3
  (discovery reachability). Baseline (audit): 2–3/8 runs, days 20–56, via the
  occupation lottery + corpse loot. GO: obvious — majority of runs at L1 by day 3.
- **Recruitment primary metric:** recruits joining without player action in sims.
  Baseline (audit): 0 recruits ever (97-day trace 11→1). GO: ≥1 recruit observed.
- **Horizon:** Stage 0 smoke — 3 seeds × 30 days, competent policy (early-game
  lever; deaths cluster days 8–20). Seeds: 11, 22, 33.
- **Guardrails:** no crashes over 90 sim-days; trust costs bounded (-1); no
  auto-recruit into homelessness; hostile rooms still wait on the player.
- **Proof tests:** scripts/proof-armor-recruit-20261013.js — RED on pre-fix
  code (all new behaviors FAIL), GREEN 51/51 on 3 seeds (0x1, 0x2A, 0x63).

## What changed

### Armor discovery (the graph, not the DR curve — the math was already correct)

1. **bark_armor L1 — guaranteed (game.js: oldCuirassBeat, founding flag).**
   Every starting haven hangs an old bark cuirass by the fire (split at the
   seam, unwearable). The first dawn you're home, you really SEE it: recipe L1
   (seen — blind 35% craft, materials at risk). Once ever, silent if already
   known, waits while you're away. This is the snare-lesson pattern applied to
   a guaranteed object — breaks the bark_armor discovery lottery.
2. **bark_armor L1 — lottery owners made useful (villager-objectives.js).**
   A villager WEARING bark armor teaches L1 on return (trust 15+, player at
   haven, once per teacher) — mirrors the snare TRAPS-return teach exactly.
3. **hide_armor L1 — circular dependency broken (corpses.js: noteHideHandled).**
   Taking an animal hide (per-item AND batch loot paths, via the
   _corpseTakeStack choke point) teaches hide_armor L1: handling the MATERIAL
   teaches the shape, the same way handling gear teaches its recipe. Before:
   needed L1 to craft, L1 only from having hide_armor — unreachable, period.
4. **Stale comment fixed (fieldFights.js:18):** ontology header said
   `absorb = round(hit*r)`; code correctly clamps. Now reads
   `absorb = min(hit-1, round(hit*r)) — at least 1 always lands`.
5. **Dead data cleaned (items.json):** removed the `materials` fields from
   bark_armor / hide_armor / padded_cloth. They disagreed with recipes.json
   (hide_armor said "2 vine" — pure nonsense) and were never read by craft()
   (verified: no code reads item-def `.materials`; schema doesn't require it).
   Armor protections untouched (10/20/5).

### Recruitment (Option A + C-lite — Steve overrule invited)

The audit recommended "give the competent policy an application/visitor
behavior" — but that's a policy gap, and the task fixed the GAME instead:
recruitment now works **without requiring player action**.

- **A: villageAutoRecruit (membership.js, daily via membershipDaily).**
  Roster < 8 + housing room: the village debates (debateIntake, aloud) and
  auto-accepts the best pending application, or takes in a waiting joinable
  visitor. Trust cost: -1 when the room was split (decided without you); warm
  room costs nothing; hostile room (≥60 against) waits for the player — that
  tension is preserved. Shady/hostile visitors are never auto-taken. One
  intake/day max. Copy follows the existing moot precedent ("The moot doesn't
  wait forever... taken without you" — betrayal.js).
- **C-lite: desperation arrival floor (membership.js + betrayal.js).** A thin
  village's need is loud: applications and strangers get a 0.08/day arrival
  floor even below the notability-40 gate; low-notability thin villages draw
  the desperate (curious/fleeing), not traders. Without this the auto-recruit
  has nothing to work with — the gate binds first.
- **Not chosen: B (UI visibility).** Moves nothing in sims. Steve can overrule
  toward B or C-full (lower the gate for everyone).

## Results

**Proof tests:** 51/51 GREEN on seeds 0x1, 0x2A, 0x63. RED verified on pre-fix
code (every new behavior FAILs; guards correctly pass). All player-facing
lines sense-read (transcripts in test output) — coherent, in-fiction, honest
about L1 being "seen."

**Stage 0 smoke (3 seeds × 30d, competent):**

| seed | days | endReason | bark L1 | hide L1 | pop | recruits |
|------|------|-----------|---------|---------|-----|----------|
| 11 | 27 | village-lost | day 1 (witnessed) | — | 5 | 1 (app auto-accepted) |
| 22 | 30 | survived | day 1 (witnessed) | — | 9 | 0 |
| 33 | 30 | survived | day 1 (witnessed) | — | 7 | 0 |

- **Armor GO:** bark_armor L1 day 1, 3/3 seeds (baseline: 2–3/8 by days 20–56).
  The discovery lottery is dead.
- **Recruitment GO:** seed 11 auto-accepted an application end-to-end with zero
  player action (pop 5, thin). Seeds 22/33: 22 stayed ≥8 (gate correctly idle);
  33 sat at 7 with no arrival in-window (0.08/day ≈ 12d mean — in-window miss,
  not a wiring failure; the proof test forces the arrival deterministically).
- **hide_armor L1 did NOT fire in the smoke** — the competent policy looted no
  animal kill in 30 days. The handling beat is proven unit-level (both loot
  paths); reaching it in sims needs a hunt/loot policy behavior — a policy
  gap, not a game bug. Noted for the loops.
- No crashes; trust costs landed as designed (-1 split room, 0 warm room).

## Steve-level decisions (overrule invited)

1. **NPC armor crafting: NOT now.** Villagers have no crafting system at all —
   armor-only NPC crafting would be an inconsistent one-off. Player crafting is
   now reachable (L1 day 1–2; bark/vine/hide all day-1 world materials). If you
   want villagers armored, the honest options are (a) a general villager-craft
   system (bigger design), or (b) the existing gear-up path (owners keep and
   re-equip theirs). Note the audit's measurement: even FREE P=20 player armor
   didn't shift survival — villagers die unarmored days 8–20 to wave-1 fights;
   the binding constraint is villager combat competence, not their gear.
2. **Recruitment: Option A + C-lite (documented above), not B.** B moves nothing
   in sims; the one-way population ratchet needed a no-player-action path.
3. **padded_cloth has the same discovery hole** (no spawn/teach path; L1 only
   via equip/loot of a padded_cloth that never enters play). Out of scope for
   this fix — same two-beat treatment would close it if you want it.

## Metric review (§14)

- Metrics held. The bark-L1 metric measured exactly what it claimed
  (discovery reachability, before/after obvious).
- hide-L1-in-sims would have been the wrong metric for this run — it measures
  policy hunting behavior, not the game fix. Kept as a unit-proven beat;
  proposing "hide L1 day with a hunt-looting policy" for the next run.
- validate-data.js crashes identically on pristine HEAD (pre-existing
  `spec.endsWith` TypeError — validator rot, not this change). items.json
  validity covered by the proof test (parses; protections intact).
- Ontology: `scripts/validate-ontology.js` green (94 systems).

## Follow-ups for the loops (not this fix)

- Competent-policy armor crafting (competent.js:1425) can now fire on the
  knowledge leg (L1 guaranteed) — but bark is still never banked (policy works
  tree cells, not deadfall). Policy gap.
- hide_armor L1 in sims needs a hunt/loot-animal policy behavior.
- padded_cloth discovery (see decision 3).

## Convergence

`delivered` — fixes implemented, proof tests green (51/51 × 3 seeds),
ontology green, smoke GO on both primary metrics, merged locally pending ship.
