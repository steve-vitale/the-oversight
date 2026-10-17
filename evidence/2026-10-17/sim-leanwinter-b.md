# sim-leanwinter-b — lean-season starvation census on the feast substrate (flesh-out loop B, 2026-10-17)

Axis: food-economy. Run: fleshout-loop-b-20261017T0100Z (worker sim-leanwinter-b).

## Why
The lean season is canon ("The boss. Stored food or nothing" — docs/PRESERVATION.md
canon table cites the ladder; climates.json winter note). Starvation deaths
have been counted as shares of cause inventories in prior censuses, but never
attributed one-by-one: pantry fresh-days at onset, season/day-of-year, road,
scholar vs villager. This census binds 100% attribution — every starvation
death must carry all four, or the primary misses.

## Canon read (Steve's designs, not invented)
- docs/CANON.md: food is the core thesis; preservation ladder
  cleaned(2d) < cooked(5d) < smoked(30d) < rendered(90d) < pemmican(120d).
- docs/PRESERVATION.md: the ladder + "Rot can't be smoked back into food."
  Blind penalties teach, never stupid-make.
- The honest-death-cause rule (calories.js, 2026-10-14): the overnight tick
  reports 'starvation' ONLY for a real kcal deficit (>= STARVATION_THRESHOLD);
  a trivial deficit on a full belly reports 'the night' — the spiral takes
  credit only for real starvation. Villager famine culling (game.js:28173):
  bare pantry -> -4 health/day per person -> cause 'starvation'.
- The sim-thirstcause-b contract (sim-findings #418, closed 2026-10-16):
  registerDeath is ONE shared pipeline (corpses.js:152), tele at :223 fires
  the cause VERBATIM. TWO strings by role: villagers 'thirst' (game.js:28349
  villageDrinks, empty cistern), the scholar 'dehydration' (calories.js:125
  overnight metabolism). This census matches BOTH, split by player:true,
  and never merges them.

## Pre-registration (binding, MEASUREMENT.md §14 — written before sims)
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (pre-seat by design).
  Policies leadfeast/belongfeast (feastscale-wrapped courtship policies).
  180d death-aware (+10d tail, engine-side). Asserted up front by
  scripts/sweep-leanwinter-20261017.js (SWEEP STOP on mismatch).
- SEEDS: 8 FRESH seeds 5101–5108 x 2 roads = 16 runs, identical-seed
  lead/belong pairs. Fresh check: no 51xx/52xx filenames anywhere under
  evidence/ before the sweep (verified 2026-10-17).
- PRIMARY = census COMPLETION gates:
  - G1: 16/16 runs completed.
  - G2: 100% starvation attribution — every death whose cause matches
    /starv/i carries season id + day-of-year, pantry fresh-days at onset,
    road, and scholar/villager role. Miss = NO-GO.
  - G3: per-seed heterogeneity map present (min/max per-seed starvation,
    worst seed).
  - G4: 0 instrument errors.
- ESTABLISHMENT gate (expect, NOT require — the census describes, the
  tracker judges): wall numbers vs the telemetry baseline (national 12,
  table 16, wins 16, exiled 0). This substrate is PRE-SEAT by design, so
  wins/table LOUD deviations are EXPECTED — record, explain via the
  established substrate-mismatch class, do not re-score.
- Classification contracts: STARVATION = /starv/i only. 'the night'
  (calories.js honesty rule: trivial deficit or pre-damaged body) is
  NIGHT-OVER — hunger-adjacent, counted separately, NEVER folded into
  starvation. Water: BOTH 'thirst' and 'dehydration' matched, split by
  player:true. Half-ration rate per day-alive (#340 watch) measured with
  the ledgerdiag pattern (/Half ration/ on villageMeal beats).

## Metric review
The 100%-attribution bar was the right primary and it held (4/4). The
bar's shape assumed starvation would be common enough to matter; in fact
4/753 deaths (0.5%) is itself the headline. The heterogeneity map's
min/max framing undersells the skew (median 0, one seed holds 3 of 4) —
the NEXT census should pre-register a "tail concentration" framing
(top-seed share) rather than min/max deltas when the base rate is this
low. The NIGHT-OVER separation held (0 in 16 runs — the honest-cause rule
keeps them out of 'starvation'). No metric changes mid-run; §14 honored.

## Instruments
- scripts/sweep-leanwinter-20261017.js — the shared 16-run sweep (ARM 1
  census + ARM 2 food beats). Read-only tele-wrap + at-onset snapshot
  (pantry fresh-days/total/empty + season/day-of-year) + villageMeal
  half-ration wrap + bounded food beats. LEANWINTER_LIB=1 exports the
  classifier/instruments for the proof. ZERO src/js, ZERO policies edits.
- scripts/test-leanwinter-20261017.js — proof: (a) classifier fixtures,
  (b) live-honesty forced deaths through the real pipeline, (c) det-gate
  20d instrument-on vs pristine byte-identical (the read-only claim).
- scripts/analyze-leanwinter-20261017.js — ARM 1 census analyzer over the
  16 per-seed JSONs.
- Evidence: evidence/2026-10-17/perseed-leanwinter-b/*.json (16),
  evidence/2026-10-17/leanwinter-b-foodbeats/*.json.

## Results
Sweep ran 2026-10-17 ~01:00–01:15 UTC, exit 0, 16 runs in one process,
~15 min wall. Substrate asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0
explicit). Seeds 5101–5108 fresh (no 51xx/52xx filenames under evidence/
before the run — verified).

COMPLETION gates (primary — ALL GO):
- G1: 16/16 runs completed (3 survived the full 182d horizon; 13
  village-lost at d77–d166 — death-aware horizons working).
- G2: 100% starvation attribution — 4/4 fully attributed
  (season+freshDays+road+role). GO.
- G3: per-seed heterogeneity map present. GO.
- G4: 0 instrument errors across 16 runs. GO.
- Schema: 16/16 per-seed JSONs carry numeric national/table/wins/exiled/
  wave4/wave5/medianDays (schema-drift LOUD class honored).
- Proof: scripts/test-leanwinter-20261017.js 37/37 (fixtures + live-honesty
  + det-gate 20d instrument-on vs pristine byte-identical trajectories —
  the read-only claim verified before the sweep).

THE CENSUS:
- 753 deaths across 16 runs. 'starvation': 4 (0.5%). All four are
  VILLAGERS, all in LEAN WINTER, all with a BARE pantry at onset
  (freshDays=0, totalKcal=0, pieces=0):
  - leadfeast-s5106 d58 (gen_rrsufas), d70 (Rafael Torres), d75
    (Elif Demir) — dayOfYear 267/279/284; the run village-lost at d77.
  - belongfeast-s5103 d136 (visjoin_109) — dayOfYear 345; the run
    village-lost at d136.
- 0 scholar starvation deaths on 16 runs. 0 starvation deaths outside
  winter. 0 starvation deaths with a non-bare pantry (the "stocked pantry
  but no access" class is ABSENT here).
- NIGHT-OVER ('the night', the honest-cause boundary): 0/16 runs — the
  calories.js honesty rule keeps trivial-deficit deaths out of the
  starvation count, and none occurred.
- Water contract (#418): 'thirst' 0; 'dehydration' 1 — the SCHOLAR
  (belongfeast-s5106 d23, player=true, fall, pantry STOCKED at 20,128 kcal
  / 6 pieces) — the classic ranging/at-haven water-MANAGEMENT death, not
  a water-block. Strings kept separate, roles split. The thirstinst2-b
  census closed the pipeline question; this run reconfirms the split.
- Half-ration watch (#340): 752 half-ration days / 2319 day-alive =
  0.324/day combined (leadfeast 0.3014, belongfeast 0.3467). Engine
  hungry-days (starvedDays): 52. The village spends EVERY THIRD DAY on
  half rations and still produces only 4 starvation deaths in 753 — the
  ration regime is chronic but disciplined; the #340 cost is in the
  regime, not in bodies.
- Death-cause shape: combat 447 (59%), 'villager combat' 146, 'monster'
  104, expedition 18, sickness 15. Combat is the kill channel on this
  substrate; starvation is a rounding error — the opposite of a
  lean-winter regime. The pantry is being DEFENDED (half-rations) rather
  than emptied.

HETEROGENEITY MAP (starvation deaths per seed, lead/belong):
  s5101 0/0 | s5102 0/0 | s5103 0/1 | s5104 0/0 | s5105 0/0 |
  s5106 3/0 | s5107 0/0 | s5108 0/0.
  Min 0, max 3, median 0. Worst seed s5106 (3 of 4 deaths, lead road).
  The starvation tail is CONCENTRATED: one collapse run carries 75% of
  the count.

WALL NUMBERS (pre-seat substrate; baseline national 12, table 16,
wins 16, exiled 0):
  national 15/16 | table 16/16 | wins 0/16 | exiled 0/16 |
  wave4 1/16 | wave5 0/16 | arc2 16/16 arc3 16/16 arc4 16/16 |
  fourRealm 0/16 | median survival 146.0d, max 182d, min 77d.
- Telemetry check (scripts/telemetry-check.js vs scale-wall.json):
  ONLY wins LOUD (16 -> 0). national/table/exiled quiet.
- Substrate verdict (established class, not re-scored): the LOUD wins
  deviation is the SEATDRIVE=0 pre-seat mismatch — table arrival is
  16/16 on the feast substrate (the r13 food-deed chain works:
  tableWaiting fires), but conversion to wins needs the seat driver.
  Contrast: sim-wallcensus-b on base courtship (same SEATDRIVE=0) had
  table 0/16 — the feast layer buys table ARRIVAL; the driver buys
  the win. waves 4/5 and fourRealm are quiet-absent on this substrate
  (readiness-gated, scale pacing intact).

## Village assessment (assessor's read)
The feast-substrate village of 5101–5108 is a rationing machine. It
votes half rations one day in three, feeds the communal bowl, throws out
spoiled stores with muttered lessons, and almost never lets a body starve
(0.5%). It dies in fights — 59% combat, scholars ~102 of 447 — and in
the winter collapse runs it dies fast (s5106 lead: d77, 3 starvation).
The blank this census filled: starvation's exact shape on the feast
substrate — bare-pantry winter villager deaths only, no stocked-pantry
class, no scholar class. The food economy is NOT the binding constraint
on these runs; the kill channel is.

## Convergence
converging (the census delivered its binding gates; the tail-concentration
framing is the named next for any starvation-census revival).
