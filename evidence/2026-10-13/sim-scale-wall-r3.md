# longsim scale-wall run r3 — FIGHT-ASSESS (2026-10-13, flesh-out)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3)
- **Question:** r1 KILLED DPS-race at pilot (inert — 0 fires in 50 windows; fights run 3–4 turns, conviction needs 5+). r2 KILLED directional flee at pilot (fired 2× in 8 runs; hold-at-haven backfired). Honest diagnosis stands: the wall is fight SELECTION + monster math. Does POLICY-side PRE-FIGHT assessment — assess the damage race BEFORE engaging (map-level decline of monster-active tiles + fight-start proactive disengage at turn 1, full HP) — beat the legacy mid-fight flee-on-HP-threshold?
- **Primary metric:** national reach per seed (0/1); secondary: median survival days
- **GO threshold:** after-side national ≥ 2/8 AND median survival ≥ 1.2× baseline (≥82.8d) — else KILL AT PILOT
- **Horizon:** 150d death-aware (dead villages stop; +10d tail) — reachability lever per MEASUREMENT §10
- **Seeds:** 11/22/33/44 × competent/winseek = 8 runs before/after on IDENTICAL seeds
- **Gate config:** COMPETENT_FIGHT_ASSESS=1 (AFTER) vs unset (BEFORE). COMPETENT_DPS_RACE and COMPETENT_DIRECTIONAL_FLEE unset in BOTH arms — both mid-fight instruments stay inert. The disengage mechanics are identical between arms (legacy walk-to-edge flee, no barrier push); the measured delta is purely ASSESSMENT quality: knowledge-gated damage-race at turn 1 vs HP-ratio heuristic at fight start + 35%-HP threshold mid-fight. winseek is the untreated control arm (its own flee/assessment untouched).
- **Baseline:** re-run on this tree's tip BEFORE the lever (gate off) — see Results.

## Canon check
READ docs/CANON.md FIRST, then MONSTER-WAVES.md + DESIGN.md combat intent ("slow and risky to start"). Fights are REAL fights, never RNG outcome tables. The Highbeam Deer (160 HP) is the benchmark — never questioned. tbPlayerStrike: roll([10,16]) + w.bonus — the policy knows its own weapon, so player DPR = 13 + bonus is legitimate card knowledge.

## Lever played: FIGHT-ASSESS (policy-side pre-fight damage-race assessment)
One functional lever under one new gate (`COMPETENT_FIGHT_ASSESS=1`, default OFF):
1. **Knowledge-gated monster DPR** (`fightAssessDPR`): the policy only uses what its scholar learned — codex entry (observed/slain/patterns) → the species' real attack damage; own-fight lore (`ctx._fightLore`, per-species observed damage per player-turn, updated every fight tick) → observed DPR; unknown species → pessimistic prior 20/round. A KNOWN counter (`beastHintKnown`: fully discovered or codex 'slain') discounts DPR ×0.7 — the policy knows it has an answer.
2. **Race math** (`fightAssessRace`): playerDPR = 13 + weapon bonus; roundsToKill = totalMonsterHP / playerDPR; roundsToDie = p.hp / monsterDPR. DECLINE when roundsToDie < roundsToKill × 1.3 (lost race with margin) OR monsterDPR ≥ p.hp/2 (dead in ≤2 rounds).
3. **Fight-start proactive disengage** (`fightAssessHook`): at turn 1, full HP, replaces the legacy `totalMhp > 2.5*pmax || (wave≥2 && hp<70%) || hp<50%` heuristic under the gate. Disengages through the policy's normal flee() — walk to the edge while survivable (no push; r1/r2 gates off).
4. **Map-level decline** (`fightAssessSkipTile` in `forageTripSeedFirst`): the scholar can SEE the monster on the tile (`Game.monsterAt`) — decline engagement by skipping unwinnable destinations and trying the next candidate.

**Mechanism proof: scripts/test-fight-assess-r1.js — 22/22 PASS** (gallowdeer-vs-unarmed declines with def-midpoint DPR; winnable holds; unknown→prior 20, codex→25, lore overrides; dead-in-two rule; counter discount 21.5→15; hook disengages/holds correctly; map skip fires; gate on/off wiring). Sweep driver: scripts/sweep-fight-assess-r1.js (kind-split deaths kept; NEW: bearer-death telemetry via villagerId changes — fills r2's open blank).

## Results

### Baseline re-run on this tree's tip (gate off) — matches r1/r2 exactly
8 runs, seeds 11/22/33/44 × competent/winseek, 150d death-aware: **national 0/8, table 0/8, won 0/8, median 69d** — per-seed days byte-identical to r1's bc1980f6 and r2's c14017af baselines (competent 69/150/14/90, winseek 32/124/15/34). The tip is stable; the wall holds. Gate-off path confirmed inert (faDeclined 0, faSkipped 0). Kind-split deaths: competent `monster:combat` 16 (scholar's kills) vs `villager:combat` 8 (villager deaths to monsters); bearer deaths 24 across 8 runs (13 competent / 11 winseek).

(TBD — pilot results below)

### Pilot verdict: KILLED AT PILOT
Identical 8 seeds, after-side (COMPETENT_FIGHT_ASSESS=1, DPS_RACE and DIR_FLEE unset): **national 0/8, table 0/8, won 0/8, median 33d** (GO required national ≥ 2/8 AND median ≥ 82.8d = 1.2× 69d).

| | national | table | won | median days |
|---|---|---|---|---|
| before (gate off) | 0/8 | 0/8 | 0/8 | 69 |
| after (gate on) | 0/8 | 0/8 | 0/8 | 33 |
| GO threshold | ≥2/8 | — | — | ≥82.8 |

Per-run days before: 69/150/14/90 (competent), 32/124/15/34 (winseek).
Per-run days after: 33/37/13/32 (competent), 29/41/16/50 (winseek).
FaDeclined 10 / faSkipped 13 (competent); faDeclined 0 / faSkipped 26 (winseek — see control note below).

### Why (honest diagnosis, data-verified)
1. **The assessment is CORRECT — the disengage is a fiction.** The first-decline details are genuinely lost races (bulldozer 2.8-to-kill vs 3.3-to-die; gallowdeer 12.2 vs 3.3 unarmed). But without the r1/r2 barrier-push gates, flee() = walk to the nearest edge = a wasted turn 1 (no strike, full monster round incoming) after which the fight CONTINUES from the edge. The scholar pays a free monster round to "decline" a fight they then fight anyway. 10 declines = 10 lost first-strike turns.
2. **Declining fights is a FOOD decision, and the food economy punishes it harder than combat punishes engagement.** Competent scholar kills (`monster:combat`) 16→10, villager-field kills 18→11; starvation 2→13, thirst 2→5. The lever traded combat deaths for starvation deaths — and starvation kills VILLAGERS, which is what ends villages (all 8 runs end `village-lost`). The knowledge economy atrophies too: beastTricks 66→33, counters known 43→29, traps 11/11→3/3.
3. **The map-level decline alone is mildly positive but not wall-moving.** Control-arm note: winseek shares `forageTripSeedFirst` (map decline fired 26× there; its fight() is untouched, faDeclined 0) — so winseek measured map-decline-only: median 34→41, villager:monster deaths 13→7, starvation 7→5. Not nothing, but 0/8 national both arms. The pessimistic prior (20/round for unknown species) refuses too many winnable wave-1 fights the scholar needs for meat/codex/counters.
4. **What this says about the wall:** fight selection as AVOIDANCE is anti-food. The competent policy's meat income depends on taking fights; the binding constraint is the food economy, not the combat losses (villager:combat deaths HALVED 8→4 and it still collapsed — starvation 2→13 swamped it). The honest reading of r1+r2+r3 together: no policy-side fight-selection instrument has moved national off 0/8 across 24 runs; the wall is fight selection + monster MATH, and the math half (wave-1/2 damage numbers vs "slow and risky" intent) is now the untested half.

### Convergence state: killed-at-pilot
Scale-onramp stays the blocking axis; wall numbers unchanged (national 0/8, table 0/8, wins 0, wave 4–5 unlocks 0). `longsims-rotation.txt` stays 3 (standing directive overrides rotation). The lever is kept behind the opt-in gate (default OFF), documented, proven 22/22 — inert unless a future run re-arms it. Salvageable sub-instrument documented: map-level decline alone (winseek: +7d median, 13→7 villager:monster) — a future run could test map-decline-only on competent, but it does not touch the wall.

### Village assessment (after-side, gate on)
- **Seeds 11/22/44 (competent)** collapsed 69→33, 150→37, 90→32. Villages starved: fewer kills, 13 skipped forage destinations, traps 11/11→3/3. Bearer deaths 7 (vs 13 before — scholars died less, villages died more).
- **Seed 33** unchanged-ish 14→13 (early collapse both arms — thirst/starvation, a food lever can't reach day-14 thirst deaths).
- **Who died and why:** scholars live slightly longer; villagers starve. `villager:starvation` 2→13 is the run's story. Death causes stayed flavorful and systemic (Nostalgia, Grief Counselor, Hushpuppy, contest, lockjaw) — the world's texture is intact.
- **Missing capabilities:** no instrument measures the fight→food coupling in-run (kills-per-day × meat-yield vs village kcal need); the race model needs a FOOD-aware margin (declining a winnable fight costs meat — the assessment is combat-pure); bearer-death telemetry is now automatic (r2's blank filled: 24 before / 22 after).
- **Blanks filled:** (1) FIGHT-ASSESS instrument — built, proven 22/22, kept gated; (2) knowledge-gated DPR (codex → lore → pessimistic prior) + counter discount; (3) map-level decline (perception-based destination skip); (4) bearer-death telemetry in the sweep driver (villagerId-change counting — r2's open blank, now automatic).
- **Blanks documented (open):** fight-start disengage needs a real exit to be honest (barrier push = r1 stranding; without = wasted turn); wave-1/2 damage numbers vs "slow and risky" intent (the untested half of the wall); whether a food-aware race margin (value of the kill) changes the decline math.

### Sense-testing (transcripts read)
- **Villagers act like people (untouched by this lever).** 25-day gate-on sample (seed 11): six distinct backstories/voices (Carmela the pipeline welder, Marta the Warsaw sports-clinic physio, Marcus the electrician, Sofia the community gardener, James the framer, David the plumber). Language-barrier system intact (Marta speaks only Polish — "mówisz po polsku? Nie? ...cholera"). No robotic repetition.
- **Known limitation (pre-existing, not mine):** the sim policy talkTo→endConvo's immediately, so sim convos run 1 turn — same as r1/r2 noted. The lever touches only the scholar's fight/forage policy; villager agency, dialogue, and gossip code paths are untouched (git scope: competent.js + scripts only).

### What I changed (files)
- scripts/policies/competent.js — COMPETENT_FIGHT_ASSESS gate; fightAssessOn/fightAssessDPR/fightAssessRace/fightAssessLore/fightAssessHook/fightAssessSkipTile (+ exports); fight() new-fight hook routes to the race assessment under the gate (legacy HP-ratio block byte-identical when off); forageTripSeedFirst skips monster-active unwinnable destinations under the gate
- scripts/test-fight-assess-r1.js — 22/22 mechanism proof (NEW)
- scripts/sweep-fight-assess-r1.js — before/after sweep driver, identical seeds, kind-split deaths + bearer-death telemetry (NEW)
- scripts/sense-fight-assess-r1.js — roster + transcript sense check (NEW)
- evidence/2026-10-13/sim-scale-wall-r3.md — this file

### Numbers table (before → after, identical seeds 11/22/33/44)
| | national | table | won | median days | bearer deaths | scholar kills (monster:combat) | starvation (villager) |
|---|---|---|---|---|---|---|---|
| before (gate off) | 0/8 | 0/8 | 0/8 | 69 | 24 | 18 | 9 |
| after (gate on) | 0/8 | 0/8 | 0/8 | 33 | 22 | 15 | 18 |
| GO threshold | ≥2/8 | — | — | ≥82.8 | — | — | — |

Wall numbers every run: national 0/8, table 0/8, wins 0, wave 4–5 unlocks 0, max wave 3, max arc 3.
