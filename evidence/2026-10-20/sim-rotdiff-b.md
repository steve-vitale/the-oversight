# SIM-ROTDIFF-B — engine rot-path diagnostic (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-rotdiff-b
Run: fleshout-loop-b-20261020T2235Z · Axis: food-economy · Arm: sim-rotdiff-b (DIAGNOSTIC)

Filed by the sim-retagrot-b4 kill (kill write-up in the live 2130Z tree, not
touched): on lead-type trajectories the re-tag appeared to INCREASE fast-rot
(lead 1.32x vs belong 0.55x pooled split). The re-tag moved kcal from the
engine's stockSurplus funnel into the engine's stockPantry funnel. This arm
asks the engine-side question: what in the ENGINE's stockPantry path rots
faster than the engine's stockSurplus path — cap binding? piece size? draw
order? something else? Instrument-only; zero src/js; no lever revival
(scripts/policies/retagrot-b4.js stays deleted).

## Pre-registration (binding — docs/MEASUREMENT.md §§9-12, 14-15)

- **Primary question**: decompose the engine's pantry-path vs surplus-path rot
  differential into named mechanisms. Candidates, from code reading:
  (a) CAP BINDING — stockSurplus refuses writes at the pantry cap
  (food.js, break-it r5); stockPantry has NO cap check and overfills.
  (b) PIECE SIZE — stockPantry pieces up to 500 kcal (default pieceKcal) vs
  stockSurplus 200-kcal units; fresh-first pantryDraw best-fits smaller pieces
  first within a shelf class (game.js pantryDraw, kcalEach ascending).
  (c) DRAW ORDER / CLOCK SKEW — pantryDraw is FRESH-FIRST (spoilDay ascending,
  blitz-eatlast 2026-10-13): stockPantry pieces carry spoilDay = day+3+
  granarySpoilBonus (havenGrowth.js: +3d at tier>=3, +14d preserved);
  stockSurplus units carry spoilDay = v.day+3 with NO granary bonus. Longer
  clocks are drawn LATER — the granary bonus may de-prioritize pantry pieces
  toward their own rot.
  (d) DAY REFERENCE — stockPantry uses scholar.day, stockSurplus uses v.day
  (rule-out class; expected ~0 on this substrate).
- **GO gate (binding)**: >=80% of the PANTRY-path rot kcal lands in the three
  named mechanism classes (pantry-cap + pantry-clock6 + pantry-coarse), AND
  0 unexplained mechanism classes (unclassifiedRot == 0). A miss is DIAG-NO-GO,
  never re-scored.
- **Horizon**: 180d death-aware (dead villages stop +10d tail max, per
  sim-harness). Rot needs long horizons; matches the b3/b4 substrate.
- **Seeds**: 22001-22008 (8 fresh, verified unused: zero `"seed": N`,
  policy-seed, or sweep-SEEDS hits in scripts/ and evidence/2026-10-19,
  evidence/2026-10-20; not on the coordinator's banned list, asserted inline
  by the sweep). Proof seeds 22011/22012/22021 are disjoint.
- **Policies**: plain leadfeast + belongfeast (scripts/policies/feastscale.js)
  + FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset. The lead/belong split
  is the pairing dimension (the filed question is a lead-vs-belong split).
- **Instrument**: scripts/rotdiff-instruments.js — read-only wraps of
  Game.stockPantry / Game.stockSurplus / Game.sweepSpoiled / Game.pantryDraw /
  Game.drawSpoiled. Per-item path-kcal mix (_rdK) is exact: cross-path merges
  are impossible (kg differs, stacksMatch compares kg); within-path merges
  are homogeneous (stacksMatch requires equal name/kcalEach/spoilDay/kg).
  Proof: scripts/test-rotdiff-instruments.js — 36/36 GREEN (tagging, merge
  increments, stacksMatch immunity, cap sensors, draw counters, all six
  cascade classes exact, unclassifiedRot 0, conservation bound, DET digest
  identical with/without instruments on 25d x 2 seeds leadfeast).
- **Panel (§15)**: NOT expressible — the balanced panel compares before/after
  lever cases through POLICY_REGISTRY; this is instrument-only diagnostic
  work with no lever, no before/after, no policy delta. Shipping a compare
  would be bogus (same precedent as sim-retagrot-confirm-b's documented
  non-ship). The pre-registered GO gate above is the judge.
- **Telemetry**: deviation check vs scale-wall baselines at closeout
  (scale-wall.json is the winseat regime — wins structurally 0 here, so
  scale-wall-preseat.json is the regime-matched read).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. No new canon invented.
- Preservation ladder (PRESERVATION.md): cleaned 2d < cooked 5d < smoked 30d
  < rendered 90d < pemmican 120d. The engine's fresh writes here are all
  3-day-clock (fresh) — the diagnostic is about the FRESH rung's two funnels.
- "Rot can't be smoked back into food" — the instrument only observes the
  engine's own discard (sweepSpoiled); desperation eating (drawSpoiled) is
  tracked separately as eaten-not-rotted.

## Results

Sweep complete: 16 runs (seeds 22001-22008 x {leadfeast, belongfeast}, 180d
death-aware), corpora evidence/2026-10-20/perseed-rotdiff-b/{lead,belong}.json.
Analyzer: scripts/analyze-rotdiff-b.js.

### Headline: the engine's two fresh funnels rot at PARITY

| policy | pantry-path rot rate | surplus-path rot rate | ratio |
|---|---|---|---|
| leadfeast (n=8, 1064d) | 31.9% (277k/868k) | 29.9% (1136k/3802k) | 1.07x |
| belongfeast (n=8, 1076d) | 25.9% (236k/912k) | 28.5% (1277k/4484k) | 0.91x |
| pooled (n=16, 2140d) | 28.8% | 29.1% | 0.99x |

There is NO intrinsic "stockPantry path rots faster" mechanism in the engine.
The filed question's premise is refined, not confirmed: the b4 re-tag's
1.32x/0.55x lead/belong swing cannot come from the funnel it wrote into —
the engine-side differential is +2.0pp on lead, -2.6pp on belong. The swing
must come from the re-tag's own write pattern (crisis-share interception
timing — the confirm kill's mechanism), not the stockPantry path itself.

### Mechanism decomposition of pantry-path rot (the GO gate)

99.8% of pantry-path rot kcal in named classes; unclassifiedRot = 0.
DIAG-GO on the pre-registered gate.

| class | pooled kcal | share of pantry rot | mean draws before rot | mean sit |
|---|---|---|---|---|
| pantry-coarse (>200-kcal pieces, 3d clock) | 372k | 72% | 0.0 | 7.3d |
| pantry-clock6 (granary +3d clock) | 141k | 27% | 0.0 | 10.8d |
| pantry-base (3d, <=200 kcal) | 1k | 0.2% | 0.0 | 4.0d |
| pantry-cap (written over cap) | 0 | 0% | — | — |
| surplus-3d (comparison) | 2413k | — | 1.6 | 7.6d |

- **CAP BINDING: ruled out.** 0 surplus refusals, 0 truncations, 0 over-cap
  writes across 2140 run-days. The 120k cap never binds on this substrate.
- **DAY REFERENCE: ruled out.** 0 scholar.day/v.day mismatches.
- **PIECE SIZE x DRAW ORDER: the mechanism.** pantryDraw is fresh-first
  (spoilDay asc) then best-fit (kcalEach asc). Within each day-cohort the
  200-kcal surplus units are eaten first; the <=500-kcal pantry pieces are
  the residual buffer. Surplus inflow is 4.6x pantry-path inflow, so the
  daily draw rarely reaches the pantry pieces — 72% of rotted pantry kcal
  was NEVER touched by a single meal draw (meanDraws 0.0) while rotted
  surplus units averaged 1.6 draws. First-draw lag: pantry|3 3.2d, surplus
  4.9d, pantry|6 7.2d (belong 10.4d).
- **THE GRANARY BONUS BACKFIRES under fresh-first draw.** The +3d clock
  (havenGrowth.js, tier>=3) de-prioritizes pieces in the draw queue; they
  sit the longest (10.8d) and still rot with 0 draws. A longer clock is not
  a longer life when the draw eats urgency-first — it is a later place in
  line.
- **Other-path rot** (324k pooled; 294k lead vs 30k belong): named class,
  out of the gate's scope. Composition: hierarchy long-clock writers
  (route tariffs 21d, raid spoils 14d, granary draws 14d, favor repaid 21d,
  contest shares) + pantryAdd finished goods. The 10x lead/belong gap
  tracks lead's 8/8 global rank vs belong's 3/8 national — more hierarchy
  activity, more long-clock items. pantryAdd tag-stripping bounded
  NEGLIGIBLE by probe (scripts/probe-pantryadd-b.js: 2-4k kcal/60d vs
  324k other-rot).

### The rot theory for future funnel levers

1. Fresh-funnel rot is at parity (~29% each) — moving kcal between the two
   engine funnels does not intrinsically change rot. Funnel levers must win
   on TIMING/PLACEMENT (when the food is written relative to the draw),
   not on funnel choice.
2. Rotted pantry kcal is residual-buffer rot: coarse pieces and
   granary-clock pieces the fresh-first/best-fit draw never reaches.
   The lever surface is the DRAW ORDER (who gets eaten first), not the
   write path.
3. The granary's +3d is a de-prioritization penalty under fresh-first
   draw, not a preservation bonus, for food the village can't eat in time.
4. Saturation dominates: surplus inflow 4.6x pantry inflow; both funnels
   rot ~29% because the village over-produces relative to its daily draw.

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../scale-wall-preseat.json
--current 'evidence/2026-10-20/perseed-rotdiff-b/per-seed/*.json'
--metrics national,table,wins,exiled` → 1 LOUD: "table disappeared:
baseline 24 -> current 0". INVESTIGATED: regime artifact. The preseat
baseline was measured with the FULL win-side stack (WINPURSUIT=1,
WINDEFER=1, VETREL=1, ...); this diagnostic ran the bare feastscale
substrate (FEASTSCALE_R13=1 + SEATDRIVE=0 only) — the same substrate as
the retagrot b3/b4 runs, which also measured table 0/64 with the
documented note "this substrate lacks the win-stack flags". national,
wins, exiled all quiet. Baseline NOT rolled.

### Sense check

Spoil beats fire daily and read honest: "The village threw out spoiled
stores: Foraged food." with the smoke-rack mutter condensed after the first
teaching ("Should've smoked that. Fresh stuff keeps a day or two on the
shelf — the smoke rack is right there." then "(pantry)" repeats). The
village notices its own waste and names the correct fix — the fiction
agrees with the instruments. SENSE-OK. Sample lines in the per-seed
corpus (rd.spillLines, first 12 per run).

## Village assessment

Sixteen villages lived on seeds 22001-22008, lead and belong. The modal
story: a competent village climbs to global/national, reaches wave 4, and
dies between day 70 and day 180 — village-lost to the mid-game grind
(raids, wave-4 monsters, attrition). Nobody won (0/16); nobody reached the
table (0/16 — this substrate lacks the win-stack flags, as in the b3/b4
runs); wave 5 never unlocked (0/16).

Who thrived: belong s22005 (national, survived 180d) and s22006 (global,
survived 180d) — the only two villages to see the horizon. Who died and
why: the other 14, all village-lost; lead villages died richer (deeper
pantries, more hierarchy activity — 8/8 global rank) while belong villages
mostly stalled at regional.

The pantry story is the assessment: villagers SHARE enormously — the
surplus funnel (villager meal shares into stockSurplus) carried 3.8M kcal
on lead and 4.5M kcal on belong, 4.6x the pantry-path inflow. The village
eats ~2000/villager/day and shares the rest; both funnels rot ~29% because
inflow outruns the draw. The pantry-path inflow mix is 67% 'Foraged food'
(duty returns), 10% expedition hauls, ~15% inter-village aid, 5-18% fish.

The villagers act like people in the spoil beats: the village throws out
its rot daily, mutters about the cold smoke rack, and keeps sharing anyway
— the surplus funnel never stops even as the rot mounts. SENSE-OK.

## Blanks filled / documented

- ANSWERED (the filed question): the engine's stockPantry path does NOT rot
  faster than stockSurplus (0.99x pooled). Cap binding contributes 0;
  day-reference contributes 0. The b4 re-tag's lead/belong swing is not an
  intrinsic funnel penalty — it came from the re-tag's write pattern
  (crisis-share interception), not the path.
- The rot theory above is the foundation the future funnel levers asked for:
  parity rates, residual-buffer rot, the draw order as the lever surface,
  the granary bonus backfiring under fresh-first draw.
- DOCUMENTED (instrument limits, all bounded): pantryAdd tag-stripping
  negligible (probe 2-4k/60d); sat-days inflate on re-deposited items via
  pantryAdd's +gb re-clock (class attribution unaffected); _rdArr staleness
  on depositPantryPieces copies (same); other-path = hierarchy long-clock
  writers (named, out of gate scope).

## Metric review (mandatory — docs/MEASUREMENT.md §14)

1. The pre-registered GO gate measured attribution share within pantry-path
   rot (99.8% PASS, 0 unclassified PASS). The gate did not require the
   path differential to be large; the differential turned out ~zero
   (0.99x pooled) — that IS the answer to the filed question (the premise
   refined, not re-scored). No mid-run re-scoring occurred.
2. pantryAdd tag-stripping: the instrument's _rdK tags do not survive
   pantryAdd's fresh _entry (fields not copied). Bounded by probe
   (scripts/probe-pantryadd-b.js, 60d x 2 seeds x 2 policies): 2-4k
   kcal/60d vs 324k pooled other-path rot — negligible; no revision needed.
3. sat-days (rotDay - _rdArr) inflates past the nominal clock for items
   that cycle pantry -> pack -> pantryAdd, because pantryAdd re-clocks
   (+granary bonus) while the copy keeps the original _rdArr. Class
   attribution (piece/clock/path) is unaffected — the piece IS coarse, the
   path IS pantry. Read sat-days as "days since first write", not "days
   on current clock". No revision needed.
4. Panel (§15): not expressible for instrument-only diagnostic work with no
   lever and no before/after (pre-registered). No bogus compare shipped —
   the GO gate above is the judge.
5. other-path rot (named class, out of gate scope): 10x lead/belong gap
   tracks hierarchy activity (lead 8/8 global vs belong 3/8 national).
   Composition hypothesis (tariffs/spoils/favor/granary-draws, all 14-21d
   clocks) is code-read, not instrument-proven — a future diagnostic can
   tag the other writers if the theory needs it.
