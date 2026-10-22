# sim-rotsensor-b — fixed-phase rot sensor (#817) + drawn=0 mystery resolution (#819)

Run: fleshout-loop-b, arm sim-rotsensor-b (worker). INSTRUMENT FIX + DIAG.
Worker tree: ~/workspace/worktrees/sim-rotsensor-b (master b73e4751e;
master has since moved one scripts-only commit — do NOT rebase mid-work).
**ZERO src/js changes, zero policy edits.** Deliverables namespaced
`*-rotsensor-b.js`.

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the proof)

- **PRIMARY (instrument)**: the fixed-phase rot sensor detects rot on
  narrated-rot days. Baseline: 0/16 census runs detected any rot (the
  phase-broken dawn scan). **GO at ≥1 seed with sensor>0 on a
  narrated-rot day** (a day where the engine's own say stream voices
  pantry rot — "threw out spoiled stores … (pantry)").
- **PRIMARY (#819)**: the drawn=0 final-day mystery (Somchai d135,
  Ingrid d141, belong-s66050) resolved to a NAMED mechanism, or
  documented honestly as open. NOT a claim to force; an open question
  stays open.
- **Design**: scripts/rotsensor-b.js wraps Game.sweepSpoiled with a
  BEFORE-call pantry scan (the fragilityfeast measure's phase) + rot
  narration capture from the say stream + the drawSpoiled after-call
  tally. Proof (scripts/test-rotsensor-b.js): RED (legacy phase reads 0
  on narrated-rot days) → GREEN (fixed phase reads >0) on identical
  seeds, DET (instrumented vs pristine byte-identical), REPEAT,
  drawSpoiled unit. Sweep (scripts/sweep-rotsensor-b.js): 5 runs, 180d
  death-aware, FEASTSCALE_R13=1/SEATDRIVE=0 — the 2 target seed-runs
  ({66050}×{lead,belong}) + 3 sensor-validation seeds
  (66049/66051/66052×belong), each riding the new sensor + the proven
  starvechan instrument (meal rows for a corpus-reproduction digest).
- **Budget**: 2–8 seed-runs. Used 5 + proof runs (all ≤100d).
- **Verdict classes**: GO (both primaries met) / NO-GO (a miss is a
  miss, never re-scored) / instrument-FAIL (sensor doesn't detect).

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (the food ladder;
  "Rot can't be smoked back into food" — the sweep's discard is canon
  behavior, the instrument only measures it). **No canon doc covers the
  village pantry's meal order or the away-villager ration path** — the
  #819 mechanisms below are code-grounded from src/js/game.js
  (pantryDraw cands filter, drawSpoiled desperation gate, villageMeal →
  villageEats order, roster-order meal loop, mid-loop stockSurplus
  deposits, packKcal dawn ration), captured from the engine, never
  templated.

## Proof results (pre-sweep — 13/13 GREEN, 2026-10-22)

FEASTSCALE_R13=1 SEATDRIVE=0 per the Usage header (ENV TRAP honored).

- **RED**: on seed 66101's 10 pantry-rot-voice days, the legacy
  dawn-phase scan (sleep wrap, after the engine's call) read **0 on all
  10 days** (11 scan rows, max=0) — instrument silence proved, on the
  same run where the engine narrated rot.
- **GREEN**: the fixed-phase sensor read **>0 on 10/10 narrated-rot
  days** (e.g. d32 = 462 kcal); total swept rot 21,542 kcal over 100d;
  every pantry-voice day has a same-day sweep record (the voice fires
  inside the sweep).
- **DET**: instrumented vs pristine compact projection byte-identical
  (days/endReason/gameDays/over/dead/pantryKcal); uninstall restores
  all 4 wrapped refs (===). Zero RNG draws, zero state writes.
- **REPEAT**: same seed twice → sweeps byte-identical (99 sweeps),
  voice lines byte-identical (52 lines).
- **UNIT**: drawSpoiled on a synthetic spoiled pantry returns 600 kcal
  call-through, rotEaten tallies 600, the fresh stack untouched.

## Sweep results (5/5, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0)

Per-seed JSONs: evidence/2026-10-22/perseed-rotsensor-b/.

| run | end | sensor: swept / pantry-voice days / hits | legacy nonzero |
|---|---|---|---|
| lead-66050 | village-lost d111 | 2,000 kcal / 2 / **2** | 0 |
| belong-66050 | village-lost d87 | 4,265 kcal / 2 / **2** | 0 |
| belong-66049 | village-lost d126 | 0 kcal / 0 / — | 0 |
| belong-66051 | **survived 180d** | **244,391 kcal / 66 / 66** | 0 |
| belong-66052 | village-lost d143 | 5,180 kcal / 5 / **5** | 0 |

- **Sensor hits on 75/75 pantry-voice days** across 4 runs; the legacy
  phase reads 0 on every day of every run (the silence reproduces).
- **Reproduction: all 5 runs DIVERGED** from the census corpus
  (meal-row digests differ). Root cause: the substrate moved between
  cd68e6dd3 (census anchor) and b73e4751e — the sick-stay-home gate
  (villager-agency.js: sick villagers don't depart; villager-objectives.js:
  never asked to walk guard) changes expedition composition. The target
  deaths did NOT reproduce (belong-66050 re-run lost the village d87
  vs the corpus's d143 scattering). See Metric review — the #819
  resolution below is code-path + corpus analysis, not re-observation.
- rotEaten = 0 on all 5 runs (drawSpoiled never fired) — matches the
  census (0 across 16 runs). The desperation path is real code that
  essentially never engages; the swept-rot half is now measured.
- Worst single-night rot: 39% of the pantry (belong-66050 d49:
  2,765 of 7,054). An all-spoiled pantry never occurs in these runs.
- Wall (n=5, report-only): wins 0/5; 1/5 survived to 180d; 4/5
  village-lost (d87, d111, d126, d143). (National/table/wave fields
  were not in this sweep's lean per-seed record — the corpus holds
  them; not re-measured here.)

## #819 — DRAWN=0 FINAL-DAY MYSTERY: RESOLVED (two named mechanisms)

The corpus meal rows (evidence/2026-10-22/perseed-deathcause-b/deathcause-belong-s66050.json)
plus the engine's meal code give both deaths a complete, code-grounded story.
The all-spoiled-pantry hypothesis is **FALSIFIED** (details below).

**Somchai d135 — the away path (not a pantry mystery at all).**
Final row: away=TRUE, ate=26, drawn=0, produced=26, expected=29, need=2500.
Away villagers don't draw from the pantry — they take the packMeal path
(game.js:29137+): the dawn ration (packKcal, drawn from the pantry via
pantryDraw, fresh-only) plus own production. His ration drew 0 and his
production collapsed to 26 kcal (expected 29 ≈ 1% of a healthy day's
expectation — the health/100 factor in villagerExpectedDaily means ~1 HP:
grievously wounded). Away + production cliff + empty ration = the
census's Shape 2 (trail-starvation) final day. The "500–1,000 kcal in the
pantry" is a village-level dawn number; an away villager can't touch it —
"The village cannot feed someone who isn't there." The instrument's
`drawn` field conflates pantry and pack draws (census metric-review item
6); for away villagers it records the pack. drawn=0 is the expected
reading, not an anomaly.

**Ingrid d141 — roster-order first-eater on a thin-pantry night.**
Final row: away=FALSE, ate=29, drawn=0, produced=29, expected=30, need=2000.
The night's meal order (game.js:30730/30738, 29776): the scholar's
villageMeal FIRST (drew 1,235 on d141), then villagers in roster order —
Ingrid eats FIRST. At her turn the pantry was genuinely empty: pantryDraw's
fresh candidates were empty AND drawSpoiled found nothing (rotEaten=0 for
the whole run; the desperation voice never fired). Then, mid-loop, the
surplus-sharing block (game.js:29160+: each villager deposits
stockSurplus AFTER their own draw) refilled the pantry: devon (2nd,
produced 1,800) deposited 141, ethan (3rd, away, produced 3,897)
deposited 753 — and mgpspiz2843 (4th) drew 800 from exactly that refill.
Ingrid's drawn=0 is a **meal-order effect**: first eater on a night when
the pool is empty at loop start, with 29 kcal of her own production
(expected 30 — again ~1 HP; starvation was the last hit on a grievously
wounded villager). The dawn "500 kcal" reading predates the day's
foraging, the scholar's 1,235 draw, and the night's meal sequence — it
never described what was available at her meal.

**Why the all-spoiled hypothesis fails** (two independent falsifications):
1. Code: pantryDraw filters spoiled from candidates; with empty cands,
   `shortOfFresh = need>0 && !stoppedForCrumbs && freshLeft<need` is TRUE,
   so drawSpoiled IS called — and it eats any isSpoiled stack (no silent
   failure mode exists in the function). drawn=0 + rotEaten=0 + no
   desperation voice ⇒ zero spoiled kcal were present at the meals.
2. Sensor: the fixed-phase sensor now measures actual swept rot; the
   worst night in 5 runs was 39% spoiled, never ~100%. The pantry is
   never all-spoiled in this substrate.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read the rot voice lines captured by the new sensor on belong-66051:

- Pantry voice, first teaching: "The village threw out spoiled stores:
  Cattail. Elena mutters: 'Should've smoked that. Fresh stuff keeps a day
  or two on the shelf — the smoke rack is right there.' (pantry)" — a
  named villager, the teaching lands once, repeats condense to the
  thrown-out list. SENSE-PASS.
- Pack voice (scholar): "Overnight, unknown shoots went bad — beyond
  saving. You leave it for the flies." / "Overnight, Muscadine Grapes
  went bad — beyond saving." — the early game rots unknown foraged foods
  constantly (2-day shelf vs unidentified hauls). SENSE-PASS: the fiction
  matches the instrument's numbers (66 pantry-voice days ↔ 66 sensor>0
  days; the pack voice fires on different days than the pantry voice —
  two separate clocks, correctly separated by the sensor).
- The big-rot nights read honestly: d81 swept 19,707 kcal (25% of a
  78,997 pantry) — "Muscadine Grapes (dried), Foraged food, Expedition
  haul" — a village stockpiling far more fresh food than it preserves or
  eats. The waste is voiced every time. SENSE-PASS.

## Village assessment

Five villages on the sick-stay-home substrate. Four died (d87, d111,
d126, d143), one lived the full 180d — and the survivor is the story:
belong-66051 survived while its sensor recorded **244,391 kcal of rot
swept over 180d** (66 pantry-voice days, ~1,357 kcal/day, peak night 25%
of the pantry). Rot at this scale is survivable waste, not the starvation
driver — the village out-produced its own spoilage. The deaths came in the
familiar shapes (the re-runs are too diverged for a fresh census, and
that wasn't this arm's job).

**Who thrived**: the village that kept inflow above need + rot combined.
**Who died and why**: thin-pool villages on the new substrate — the
sick-stay-home gate keeps feverish villagers home, which changes who
ranges and what comes back; the meal digest divergence is the fingerprint.

**Blanks filled**: #817 (the rot sensor now measures what the game
narrates — the `rot` channel boolean can actually fire); #819 (both
drawn=0 deaths resolve to named mechanisms; the all-spoiled hypothesis is
dead).
**Blanks documented**: the 244k-rot-leak observation (filed to the
backlog — rot magnitude vs preservation behavior is a live food-economy
question, but not this arm's axis); the drawSpoiled desperation path has
never been observed firing in 21 runs (0/16 census + 0/5 here) — the
"eat rot rather than starve" beat may be unreachable in practice.

## Metric review (§14)

1. **PRIMARY (sensor): GO, exceeded.** Bar was ≥1 seed with sensor>0 on a
   narrated-rot day; the proof showed 10/10 and the sweep 75/75
   pantry-voice days with sensor>0, legacy phase 0 throughout. Never
   re-scored — the bar was met as written.
2. **PRIMARY (#819): RESOLVED to named mechanisms.** Somchai = away
   packMeal path + production cliff (trail-starvation final day);
   Ingrid = roster-order first-eater on a thin-pantry night (scholar drew
   first, mid-loop surplus refilled after her turn). The all-spoiled
   hypothesis is falsified twice (code path, sensor data). Per the
   pre-reg, a named mechanism counts as resolved; this is not a forced
   claim — the evidence is in the corpus rows and the engine code.
3. **Substrate divergence (honest caveat):** all 5 re-runs DIVERGED from
   the census corpus — the sick-stay-home change moved the substrate, so
   the "≥1 corpus seed" phrasing of the pre-reg is met only in the
   diverged sense (same seeds, new substrate). The sensor validation does
   not depend on corpus identity (voice days vs sensor>0 within each
   run), and #819's resolution rests on the corpus's own meal rows plus
   engine code, not on re-observed deaths. Documented, not hidden.
4. **rotEaten=0 (21 runs):** the drawSpoiled desperation path is
   unobserved in practice. The `rot` channel's swept half is now
   measured; its eaten half remains a code path without a sighting —
   worth one line in the next taxonomy revision, not a re-run.
5. **What would change this verdict:** nothing on the primaries. The
   open threads (244k rot leak magnitude, desperation-path reachability)
   are new backlog items, not verdict-changers.

## Convergence state

**GO on both pre-registered primaries.** #817 fixed: the rot sensor now
reads the pantry at the sweep's phase (proof 13/13, sweep 75/75 voice-day
hits, legacy silence confirmed on every run). #819 resolved: both drawn=0
deaths to named mechanisms, all-spoiled hypothesis falsified. The food
economy's `rot` channel is now MEASURABLE — the next census can actually
fire the rot boolean. food-economy stays converging; the wall is unmoved
by this arm (instrument-only by design: wins 0/5, wave-5 not in this
sweep's lean record).

## Telemetry note

Coordinator's step (run body §10). Corpus:
evidence/2026-10-22/perseed-rotsensor-b/ (5 per-seed JSONs + _summary.json),
anchor b73e4751e, substrate FEASTSCALE_R13=1/SEATDRIVE=0. Note the
reproduction=DIVERGED flag on all 5 (substrate moved since the census
anchor cd68e6dd3) — join to the deathcause corpus by (seed, policy, day)
only with that caveat.
