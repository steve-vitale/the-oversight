# longsim scale-wall run r5 — FOOD ECONOMY (2026-10-13, flesh-out)

## Stale-lock recovery
The previous run's coordinator died after heartbeating at 07:27:55Z. This run
recovered its lock per the guard, verified the registry, and landed the
previous run's verified commit ee16131f (r4: monster-math KILLED AT PILOT)
before starting. No live run was active.

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation; `longsims-rotation.txt` stays 3)
- **Lever:** 0 (food economy) as a lens on the scale wall. Context: r1–r4 all KILLED AT PILOT (fight-selection ×3, monster-math ×1); national 0/8 every time. r3's honest diagnosis: declining fights is a FOOD decision — the scholar needs wave-1 kills for MEAT, and villages that push toward national starve mid-ambition.
- **Primary metric:** national reach per seed (0/1)
- **GO threshold:** ≥2/8 national AND median survival ≥82.8d on the 8-run suite (r1–r3's bar)
- **Horizon:** 150d death-aware (dead villages stop; +10d tail max). Never a fixed 200d.
- **Seeds:** 11/22/33/44 × competent/winseek = 8 runs, identical seeds before/after
- **Gate config:** FOODLEVER_R5=1 (AFTER) vs unset (BEFORE). Opt-in, default OFF — pristine parity.
- **Baseline:** re-run on this tree's tip BEFORE any lever (gate off). Master == tip (ee16131f); no movement since r4's baseline.

## Canon check
READ docs/CANON.md FIRST, then PRESERVATION.md, BALANCING.md, MONSTER-WAVES.md.
Findings that constrain this run:
- The preservation ladder (cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d) is canon; smoking pace is 16 ticks (Steve's final word). Blind penalties teach, never stupid-make.
- "No nonsensical calorie loss" (Steve 2026-10-09) — cooking/combining must never destroy calories without sense.
- The Highbeam Deer (160 HP) is the benchmark; wave-1 animal deadliness is canon ("every animal might kill you").
- Monster tiers ≠ loot tiers; fights are real, not RNG.

## Phase 1 — INSTRUMENT (fills r3's open blank; tooling only, no game change)
New: `scripts/food-coupling-20261013.js` — the fight→food coupling instrument.
Wraps (no RNG touched, no game state mutated):
- `recordWaveKill` → kills/day by wave (the single funnel for player + villager kills)
- `carcassToMeat` → kcal harvested per kill (gross vs net, meatId, how)
- `stockPantry` + `donateToPantry` → influx by source (donations bypass stockPantry — caught during smoke test)
- `sweepSpoiled` → rot loss breakdown (container × foodState × name)
- `cookFood`/`preserveFood`/`renderFat`/`makePemmican`/`askSpecialist`/`hostFeast`/`grantFeastBuff` → processing + feast counts
- `resolveOneAssignment` → hunt/forage labor split (task counts)
- policy.daily → daily rows: roster kcal need, pantry kcal, pantry-days buffer (`pantryDaysEstimate`), ate share (lastEat vs need), preserved-kcal curve
- End-of-run: vest scan (military/swat in pack or equipped)

Also: vest tracking added to `scripts/sweep-compare.js` (mission measure list; was untracked). Proof: `scripts/test-food-coupling-instrument-20261013.js` 36/36 (3 seeds; RED-demonstrated via FOODCOUPLE_BREAK=1 sabotage).

**Committed:** 82ad1ced (instrument + vest tracking), 1b9148dc (lever v1 + diags), ba075b8b (lever v2).

## Results

### Baseline (gate off) — 8 runs, current tip
national **0/8**, table 0/8, won 0/8, median **69d**, maxWave 3, vests 0/8.
Per-seed days byte-identical to r1–r4 baselines (competent 69/150/14/90, winseek 32/124/15/34). The tip is stable; the wall holds.

**The fight→food coupling (the blank, now filled):**
- kills=126 (0.24/day), byWave w1:102 w2:24 — monster kills, almost all wave 1–2
- butcherEvents=34 (27% of kills), netHarvest=7k total, **avgKcalPerKill=55 kcal**
- **The scholar's kills are NOT a food source in practice.** 126 monster kills → 7k kcal over 8 runs. (Monster meat is knowledge-gated; most kills yield loot, not carcasses.)
- influx: Fish catch 628k, Garden harvest 254k, Foraged food 215k, Expedition haul 46k, Snared meat 4k — **the village lives on fish+garden+forage. The trapline is garnish (4k).**
- **rot: 1,291k kcal over 1,180 items** = ~2.4k kcal/day. Top: Foraged food 569k, Fish catch 305k, Garden harvest 160k, Groundnut 92k, Foraged food (dried) 44k. **95%+ fresh.**
- process: cook 0, smoke 0, render 0, pemmican 0 (player verbs — the competent policy never preserves); the villager cook's inline smoking is separate (see below)
- labor (task resolutions): fish 1221, garden 507, cook 202, water 728, wood 112, forage 10, **hunt 0** — 62% food labor already; the village staffs food heavily
- ateShare median 81–88% (villagers cover ~85% of need via own-production + pantry); starveDays=15
- pantry-days median 1–50 (thin buffer)

**The cook's smoke path (diagnostic):**
- Cook staffed every 2–3.5 days (17–37 resolutions per 60d). Smoke fires on ~50–60% of resolutions, preserving ~2.4–2.8k kcal per fire (~460/day).
- **The racks-full guard blocks 35–50% of smoke resolutions** (6/17, 18/37). When blocked, 7.7k–20.7k eligible kcal sits and rots fresh.
- The guard's logic: "more than the haven can eat before it turns." But preserved rot is only 44k of 1,291k (3.4%) — the guard solves a problem the data doesn't show while causing the fresh-rot problem.

### The lever: specialist processing throughput (measurement's pick)
The measurement killed (a) re-role (labor already 62% food; more production = more rot) and (c) trap/hunt (4k garnish; hunt 0 resolutions). The pick is (b).

**v1 — famine-aware racks (KILLED as dead code before pilot):** the guard stands down when pantryDays < 7. Mechanism proven 15/15 (proof test). But the diagnostic showed **hungryAndFull=0/54** — pantryDays<7 NEVER co-occurs with racks-full (mutually exclusive). The override was dead code. Killed without pilot spend.

**v2 — guard stands down (FOODLEVER_R5=1):** the cook smokes eligible surplus up to the 4000 budget whenever it's there. Mechanism proven 15/15 gate-on, 9/9 gate-off, RED-verified.

### Pilot (v2, gate on) — 4 runs (seeds 11,22 × competent,winseek)
| | national | table | won | median days | rot | preserved rot |
|---|---|---|---|---|---|---|
| baseline (gate off, same 4) | 0/4 | 0/4 | 0/4 | 96.5 | 1,096k | 44k |
| **pilot (gate on)** | **0/4** | 0/4 | 0/4 | **82** | **790k (−28%)** | **80k** |
| GO threshold | ≥2/8 | — | — | ≥82.8 | — | — |

**The lever works mechanically** (rot −28%, fresh rot −32%, the guard no longer blocks), **but national stays 0/4.** The preserved-rot regression is real but modest (44k→80k). The villages still die village-lost (combat/sickness), not starvation.

### Pilot verdict: KILLED AT PILOT
Per the pre-registered GO (≥2/8 national AND ≥82.8d): 0/4 national. The effect on rot is obvious and large, but the PRIMARY metric doesn't move. Per MEASUREMENT §9: killed at pilot, never run 12–20 seeds on an invisible (national) effect.

| | national | table | won | median days |
|---|---|---|---|---|
| baseline (gate off, 8-run) | 0/8 | 0/8 | 0/8 | 69 |
| pilot (gate on, 4-run) | 0/4 | 0/4 | 0/4 | 82 |
| GO threshold | ≥2/8 | — | — | ≥82.8 |

### Convergence state: killed-at-pilot
Scale-onramp stays the blocking axis. Wall numbers: national 0/8, table 0/8, wins 0, wave 4–5 unlocks 0, median 69d, vests 0/8. `longsims-rotation.txt` stays 3.

The r1–r5 arc: fight SELECTION (policy) killed ×3, monster MATH (game) killed ×1, food PROCESSING (game) killed ×1 — all three halves of the wall tested, all empty on national. The remaining hypothesis: the wall is not (only) food — villages die village-lost (combat/sickness) at 85% food security. The scale wall may be multi-causal, or the food lever needs to be stronger (the cook is still under-staffed/under-budgeted; 790k still rots).

## Village assessment (baseline, gate off; sense-tested)
- **Seed 11 competent (69d):** the median village. Ate 83%, pantry-days 50. Died village-lost. The knowledge economy worked (wave 3, arc 3); the bodies didn't.
- **Seed 22 competent (150d, survived):** the best village. Ate 81%, pantry-days 6 (thin!). 150 days and never past village rank. The ceiling isn't survival, it's SCALE.
- **Seed 22 winseek (124d, regional):** the ambitious village. 11 starveDays, ate 82%. Reached regional (the scale push), died village-lost. The ambition is there; the buffer isn't.
- **Who thrived:** villages that kept fish+garden labor staffed. **Who died and why:** villages die village-lost (combat, sickness, wounds) — NOT starvation. The food security is 85%; the killer is something else.
- **The village voice (transcript sample, 30d, seed 11):** villagers talk ("Just people"), teach (tick removal, Staghorn Sumac), work (garden, fish, water), react ("Interesting. Nobody asked me."). Names are learned over time (Sofia, Rosa, Deirdre). The Longhouse rises (d7). A death is recorded ("Lamar Boehm is dead. You didn't ask. It knew."). **Verdict:** villagers act like people. The texture is intact. The "pantry is in the hall" gate repeats (trust-gated player access) — a system message, not a villager behavior.
- **Missing capabilities:** the fight→food instrument now exists (this run). The scale-push starvation (2026-10-12: day 39–63) was NOT reproduced in this suite — my villages die of combat/sickness at 85% food security. The 2026-10-12 scale sims may have used a different policy or the competent policy doesn't push scale hard enough to hit the food wall.

## Blanks filled
1. **Fight→food coupling instrument** (`scripts/food-coupling-20261013.js`): kills/day by wave, kcal per kill, influx by source, rot breakdown, labor split, pantry-days/ate-share curves, vest scan. The r3 blank is FILLED.
2. **Vest tracking** in `scripts/sweep-compare.js`: 0/8 vests (reachable per r6's 2/12, but rare).
3. **Cook smoke diagnostics** (`diag-cook-smoke`, `diag-cook-guards`, `diag-racks-hungry`): the guard blocks 35–50%; the famine-aware override is mutually exclusive (0/54).
4. **Baseline re-verified** on current tip (byte-identical to r1–r4).
5. **Donation influx** caught: `donateToPantry` bypasses `stockPantry` (instrument fix).

## Blanks documented (open)
- The scale-push starvation (day 39–63) from 2026-10-12 was not reproduced — different policy or version. The food wall at scale remains unmeasured in this suite.
- Villager field-fight math vs "slow and risky" still unaudited (scholar-only duels in r4).
- Whether a STRONGER food lever (higher cook budget, passive racks, re-role) moves national — the throughput gap remains (790k still rots).
- The wall may be multi-causal: villages die village-lost at 85% food security. Combat/sickness may bind before food does.

## Reachability (wall numbers, this run)
national 0/8 · table 0/8 · wins 0/8 · wave 4–5 unlocks 0 (maxWave 3) · Arc II/III reached (maxArc 3), Arc IV not reached · regional 3/8 (winseek) · median survival 69d · vests 0/8.

## SENSE-TESTING (transcripts read, not just counts)
Village voice (seed 11, 30d): reads as people living together — work, talk, teaching, grief. The food system reads as honest (rot is named, the cook explains the racks, the pantry gate is explicit). The lever's change (guard stands down) is invisible in the transcript (it's a throughput change, not a beat change) — which is correct for a systems lever. Verdict: the fiction and the mechanics agree; the village feels alive. The wall is not a feel problem.
