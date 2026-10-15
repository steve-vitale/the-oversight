# sim-carcasshaul-b — the carcass-haul design fix, measured (loop B, 2026-10-15)

## Status: PRE-REGISTERED (header written BEFORE any sims; results below as they land)

## Context — the blank

Sim-findings #18 (steve-call, ANSWERED by Steve's 2026-10-13 design call):
"MAP MEMORY + CROSS-NODE OBJECTIVES — villagers remember corpses on other
nodes and form haul/butcher objectives" (prompted by the carcass-haul
finding: 97% of edible kill kcal rotted unlooted).

**The design call was BUILT but never MEASURED.** Landed on master:
- `1723aae1` — villager map memory + cross-node HAUL objectives
  (src/js/villager-mapmem.js, HAUL kind in src/js/villager-objectives.js,
  expedition kills leave real bodies, gossip spread of secondhand memories)
- `837ba5da` — villager butcher yield 0.35 → 0.50 (Steve's wall-lever call)

The r11 run measured the POLICY-side haul (player-side, reach-bounded:
closed ~half the rot gap where reachable). The GAME-side mechanism
(villagers hauling their own kills on other nodes — the structural 57–84%
of carcass kcal) has never been measured in a long sim. This run is that
measurement, plus builder work if the mechanism proves inert.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — fixed BEFORE the pilot ran)

- **Primary metric:** villager kill→food conversion — `haulK` (kcal
  deposited to the pantry by villager HAUL objectives, measured at the
  objReturnEffect deposit) per run, and the conversion share
  `haulK / carcassKcal` (share of carcass gross kcal villagers convert).
  Baseline blank: r10's 97% rotted unlooted; the control side (mechanism
  inert) must read ~0 — the SMOKE gate asserts it.
- **GO threshold (pilot gate):** armed median haulK ≥ 1,500 kcal/run AND
  haulK > 0 in ≥ 6/16 runs. Honest bar: the mechanism must fire (a third
  of runs) and convert a visible amount (~2 known-food kills at the
  honest 0.50 villager yield). §9 sniff test — visible in the raw
  numbers, no statistics.
- **Horizon:** 180 days, death-aware (runDays stops at village-lost).
- **Seeds:** 11/22/33/44/55/66/77/88. **Policies:** leadcourt, belongseek
  (villager kills happen on the courtship roads — the natural baseline;
  16 runs/side, identical seeds across sides).
- **Control:** MAPMEM=0 — the mapmem* methods are deleted at harness
  load (the landed proof's PRISTINE pattern; every hook is
  feature-checked, so the game degrades exactly to pre-1723aae1
  behavior on the same tip). Armed: MAPMEM=1, untouched tip.
- **Guardrails:** median survival ≥ control − 10d; national ≥
  control − 2/16; starvation/hungryDays within noise; rot per-villager-day
  ≤ control × 1.335 (the r25b calibration); no new death mode (n ≥ 3).
  §14: a miss is NO-GO, never re-scored against a friendlier metric
  mid-run.
- **Convergence state:** pilot GO → builder work / confirm as the numbers
  dictate; pilot miss → KILL with diagnosis (builder work on the
  mechanism's binding constraint is this arm's remaining option).

## Canon read

- docs/CANON.md (read first), docs/PRESERVATION.md (carcass spoil clock
  day+2; "Rot can't be smoked back into food"), docs/DISEASES.md
  (monster-meat quirks — alien-pool effects via weirdness, canon boundary
  respected: villagers only haul known-safe meat).
- BELLTOAD design (Steve 2026-10-13, MEMORY.md): carcass drops legs as a
  separate item from body meat — legs safe, body poisonous; discovery
  through the normal chain. Implemented in game.js monsterCarcassEntries
  (legs 2/3 of gross, gates on codex 'belltoad_legs').
- Loot-as-action (Steve 2026-10-06): the carcass stays where it died;
  the haul is the honest verb for moving it.
- known_food_only (module rule): villagers haul meat the village knows
  is food; unknown flesh stays for cautious testing. The knowledge gate
  is canon — this run measures whether it ever opens, never breaks it.

## Non-overlap (plan-time declaration, loop B ARM 2 of 2)

My game-code regions: src/js/corpses.js, src/js/food.js (carcass
pipeline), the villager objective/assignment formation system
(villager-objectives.js, villager-agency.js, villager-mapmem.js).
I do NOT touch: hierarchy.js tribute paths, the prodthrottle hook
region in game.js, feast systems, siege systems. Loop A's live arms are
policy-side (sim-feastexposure killed at pilot; sim-siegeroster
policy-preferred) — no game-code overlap.

## Mechanism audit (pre-pilot, read-only)

V1 is fully unit-proven (scripts/test-mapmem-20261013.js 10/10 on the
current tip, real RED via PRISTINE=1 — re-verified this run). Audit
findings that bound what the pilot can show:

1. **The knowledge gate is the structural bind.** mapmemFoodKnown:
   animals always known; monsters need codex monsterFoodSafe. Baseline
   policies (leadcourt/belongseek/competent) never cautious-test
   (testUnknownMeat only in policies/haul.js + meatseek.js); the gate
   opens in sims only via NPC fireside experiments (game.js ~16488,
   r11 observed 1 NPC discovery on a baseline run) or the player's own
   tests. Villager kills are monsters via patrol/expedition field
   fights — so the addressable pool is animal carcasses + the rare
   known-safe monster. The pilot measures the real opening rate.
2. **Expedition kills lose belltoad legs.** mapmemNoteKill pushes
   monsterMeatEntry (singular — the poisonous body for belltoad) while
   patrol kills (game.js:6650) use monsterCarcassEntries (plural —
   body + legs). Documented for builder work if the pilot GOes;
   the fix is a one-line alignment inside my regions.
3. **Need gate:** HAUL forms at pantry < 5000 or personal hunger > 50 —
   an opportunistic bar, not a desperation one. The pilot will show
   whether it gates real hauls out.

## The lever (tooling only so far)

- scripts/mapmem-gate-20261015.js — MAPMEM=0/1 gate (method deletion,
  the proof's RED pattern) + SMOKE assertions.
- scripts/test-carcasshaul-20261015.js — proof: gate RED (mechanism
  absent, hooks inert, trajectories byte-identical to pristine) →
  GREEN (mechanism present, haul chain fires, deposit measured).
- scripts/det-gate-carcasshaul-20261015.js — 16/16 determinism per side.
- scripts/carcasshaul-sweep-20261015.js — the pilot: 8 seeds × 2
  policies × 2 sides, haul telemetry + narration capture for the
  sense-test.

## Results

### Pilot 1 — V1 as landed (8 seeds × {leadcourt, belongseek} × {control, armed}, 180d death-aware)

| side | n | medDays | national | table | wins | exiled | wave45 | haulK total | haulK median | runsWithHaul | haulShare |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CONTROL (MAPMEM=0) | 16 | 93d | 12/16 | 0/16 | 0 | 0 | 8/16 | 0 | 0 | 0/16 | 0% |
| ARMED (MAPMEM=1) | 16 | 106d | 9/16 | 0/16 | 0 | 2 | 9/16 | 0 | 0 | 0/16 | 0% |

Carcass gross: control 147.2k, armed 141.9k. Corpse-rot share 64% both
sides (corpseRotK 94.2k vs 90.4k). Departures/arrivals/completions: 0
everywhere on armed.

**PRIMARY: MISS.** Armed median haulK 0 vs GO ≥ 1,500 kcal/run;
runsWithHaul 0/16 vs GO ≥ 6/16. Per §14: NO-GO, never re-scored.

**Guardrails:** median 106d vs 93d (+13d, beneficial — passes ≥
control−10d). National 9/16 vs 12/16 — MISSES ≥ control−2/16 by one.
Starvation 0/0. No new death mode (deaths are combat/monster/wound on
both sides; the 2 armed exiles are courtship-road moot outcomes, not a
mechanism path). Rot per-villager-day: instrumentation bug in pilot 1
(m2.daily never populated — dailyRow is pushed by runFoodCouple's own
loop, not attachInstruments); fixed in the driver, re-measured in
pilot 2.

**The national miss is noise on an inert mechanism, not harm.** The
mechanism fired zero times — it has no designed path to affect
national. Per-seed diffs are mixed-direction (s55-lc lived LONGER on
armed, d115 vs d90, but didn't national; s11-lc died earlier, d33 vs
d134). Median survival is UP on armed. The only behavioral delta is the
corpse-creation side effect (expedition kills leave real bodies on
armed), which is benign (monster corpses; the codex-people wrapper
ignores non-person deaths).

### Diagnosis — why V1 never fires (instrumented, 3 seeds × 2 policies × 60d)

The chain breaks at the knowledge gate:

1. **Sites form rarely** (1–32 per 60d run): only the killer remembers,
   or walkers-by. 60–90% of `mapmemRemember` calls return null —
   mostly `nomeat` (zero-calorie monsters leave no meat item — honest)
   and `person` (villager corpses — correctly excluded).
2. **The knowledge gate never opens**: `mapmemBestHaul` returned a hit
   0 times across ~2,300 objPicks. Monster carcasses need codex
   `monsterFoodSafe`; baseline policies never cautious-test, and NPC
   fireside experiments opened the gate 0–2× per 60d run. Animals are
   always known — but zero animal corpses appeared in 360 villager-days
   (courtship policies don't hunt; villagers don't trap).
3. **The spoil clock (2–3d) purges memories** before any hauler acts;
   `sites=0` in 95%+ of picks even on runs where sites formed.

In short: V1 is correctly built (proof-green) but structurally inert
on the courtship roads — the village never learns what's food, so
there's nothing the haulers are allowed to haul. The designed synergy
(a testing policy opening the gate, then villagers hauling) is real but
unmeasured; the baseline never opens the gate.

### Builder work — belltoad legs on expedition kills (FIXED)

Real bug found during the audit: `mapmemNoteKill` used the singular
`monsterMeatEntry`, so an expedition belltoad kill left only the
poisonous body — the safe legs (2/3 of gross, Steve 2026-10-13)
vanished. The patrol path already used the plural
`monsterCarcassEntries`. Fixed `mapmemNoteKill` to use
`monsterCarcassEntries` (with mdef lookup — the expedition hands over
the def). Proof scripts/test-carcasshaul-legs-20261015.js: RED (old
code: body only, 300 kcal, no legs) → GREEN (legs 200 + body 100 =
300, no energy created, shared spoil clock). Landed as its own commit.

### Pilot 2 — V1 + legs fix (re-run, fixed rot instrumentation)

Same 32 runs, legs fix in, `dailyRow` pushed per day. Results:

| side | n | medDays | national | starveDays | rot/vd mean | haulK |
|---|---|---|---|---|---|---|
| CONTROL | 16 | 93d | 12/16 | 20 | 164.6 | 0 |
| ARMED | 16 | 106d | 9/16 | 10 | 226.0 | 0 |

**PRIMARY: MISS again** (0/16 hauls). The legs fix doesn't change the
firing rate — as diagnosed, the bind is the knowledge gate, not the
meat items.

**Rot guardrail: 226.0/164.6 = 1.37x vs the ≤1.335 bound — MISS by
0.04x.** Per-seed analysis: 6/16 seeds are byte-identical across sides;
the 10 divergent seeds split mixed-direction (s11-lc LOWER on armed,
289→11; s22-lc HIGHER, 263→833). The mechanism fired zero times — it
has no designed path to pantry rot. This is trajectory noise on a
high-variance metric, not mechanism harm. (The r25b 1.335 bound was
calibrated for an active lever; see metric review.)

**Starvation guardrail:** 10 vs 20 starveDays (armed better — within
noise, beneficial direction). **Death modes:** no new mode (combat,
monster, wound, sickness on both sides).

**Det-gate:** 16/16 identical on BOTH sides (control and armed,
separately). The cross-side trajectory divergences are real (different
code paths consume RNG differently), not measurement noise — the
before/after comparison is trustworthy.

### Verdict

**KILL the lever as a food-economy instrument (pilot miss, §14).**
The V1 mechanism is proven inert on the natural baseline — not
marginal, not noisy, but structurally unable to fire because the
village never learns what's food. The belltoad-legs bug fix stands on
its own (real bug, proof-tested, landed separately).

## Sense-test (SENSE-TESTING LAW)

The mechanism fired zero times in 32 pilot runs, so there are no live
haul transcripts — itself a finding (the village never speaks of hauls
because hauls never happen). The narration was sense-tested in the
rigged proof scenario: departure ("sets out for the X. 'Meat's meat.
Back with it or not at all.'"), butcher ("butchers the X — working
fast, wasting little"), return ("is back with meat: +700 kcal to the
pantry"). It reads as a person working a kill, not a robot — the voice
is right; the trigger is what's missing.

## Village assessment

The villages in this pilot lived on the courtship roads: leadcourt runs
reached national 7/8 on control (the road works), belongseek 5/8.
They died as they always do — combat (wave-1/2 field fights), wounds,
the occasional sickness. The carcass economy is large (142–147k gross
kcal across 16 runs) and 64% of it rots on corpses — the #18 blank
stands. Monster meat remains a rumor the village never tastes: 0 kcal
hauled, 0 discovered via the haul path. The wall numbers: national
21/32, table 0/32, wins 0/32, wave45 17/32, median survival ~100d.

## Blanks filled / documented

- FILLED (measurement): the V1 map-memory mechanism is proven inert on
  the natural baseline — 0/16 hauls across 2,880+ villager-days, with
  the knowledge gate identified as the binding constraint.
- FILLED (bug): expedition belltoad kills lost the legs — fixed,
  proof-tested RED→GREEN.
- OPEN (design, Steve's call): the knowledge-gate bind — villagers
  can't haul what the village never learns is food, and the village
  rarely learns. Options: the policy synergy (a testing policy +
  V1 — unmeasured), more frequent NPC fireside experiments (tuning
  someone else's system), or a design change to how villagers learn.
  Filed in sim-findings.
- OPEN: the legs-hauling gap — even when the village learns legs are
  safe (codex 'belltoad_legs'), `mapmemFoodKnown` gates on 'belltoad'
  (the poisonous body), so villagers never haul the safe legs.
  Documented, not fixed (design extension, not a bug).

## Metric review (§14)

- The GO threshold (median ≥ 1,500 kcal, ≥ 6/16 runs) was honest and
  the miss is clean — the mechanism is inert, not marginal.
- The national guardrail (≥ control−2/16) fired on an inert mechanism.
  Per the r25b precedent (median/hungryDays bounds were found
  miscalibrated), guardrails on a zero-effect lever measure noise.
  Proposal for the next run: when the primary reads exactly zero,
  guardrails should be evaluated for systematic harm (per-seed
  direction + median), not the absolute bar — the bar assumes an
  active lever.
- The rot/vd guardrail was unmeasurable in pilot 1 (instrumentation
  bug — my driver's, not the engine's). Fixed; re-measured in pilot 2.

## Convergence

**food-economy: converging (unchanged).** The V1 carcass-haul mechanism
is measured and inert on the natural baseline — the #18 blank is now a
quantified design question (knowledge-gate bind), not an unmeasured
mechanism. The belltoad-legs bug is fixed. The scale wall is unmoved
(national 21/32, table 0, wins 0) — the carcass kcal still rots where
it falls.
