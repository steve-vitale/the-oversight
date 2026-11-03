# Wave-5 faced wall — diagnostic pre-registration (run fleshout-20261103T0203Z, axis scale-onramp)

Committed BEFORE any judged sim. Measurement only: zero game-code change,
zero policy change, zero default flips. New files only.

## Question (next blank (2) from 1915Z)

Seed 98201 unlocked wave 5 (d76, standing 307, wave-4 faced) and faced ZERO
wave-5 monsters before winning at the lesser seat on d90
(evidence/2026-11-02/sim-scale-onramp-round-1915.md; the 1915Z wave-4
instrument's rows for 98201 already show target→5 = 0, cast→5 = 0,
spawn→5 = 0, start→5 = 0, field→5 = 0, deed-faced w5 = 0). Wave-5 fought is
0 on every band so far (0/8 diag band, 0/16 wave4seek band). Which stage
of the encounter pipeline is empty for wave 5 — and is 98201's pattern
(unlock-without-spawn) the shape, or a short-window artifact?

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md: wave 5 = The Producers
  (8 named kinds + finale crew/credits in data: cancellation, editor,
  rerun, spoiler, timeslot, nielsen, finale, network_note, plus
  finale_crew/finale_opening), gate = village standing >= 200 AND wave-4
  faced (flexible-route call, bread capped at 100 toward t5), spawn
  ratios w5: 55/20/12/8/5. Readiness gate: while any
  waveCombatReadiness(5) bar is short (armored 4, armor P >= 15, armed 6,
  tricks 3, veterans 2 killed wave-4+), villageStandingTotal() holds at
  t5-1 and the wave stays out of monsterWavePool().
- docs/TABLE.md / docs/PROGRESSION.md: deedGateReady() needs 5/5/4/3/2
  DISTINCT monsters fought per wave 1-5 — so the full seat needs 2
  distinct wave-5 kinds FACED (fled or won, blow-by-blow), never
  unlocked-only. A wave-5 unlock with zero faced leaves the full seat
  bound on w5, exactly as 98201's endGate shows (binding: ["w5"], w5: 0,
  dist w5: 2).
- No canon doc covers this recorder/instrument; the 1915Z instrument +
  prereg are the governing docs. No canon invented.

## Stages (per seed, wave 5 only, same stage order as 1915Z)

0. **Gate**: first day `unlockedWave() >= 5`; days unlocked; standing
   total and `waveCombatReadiness(5)` bars at first unlock and at end;
   wave-4 faced count at unlock (the gate's second rung).
1. **Pool / target**: `monsterWavePool()` wave-5 entries at unlock and
   daily after; `spawnWaveTarget()` calls returning 5 (and total calls
   in the post-unlock window, so a zero can be judged against its
   denominator).
2. **Placed**: `spawnWorldMonster()` calls with a wave-5 id, tile,
   distance to player/home tile, caller attribution.
3. **Offered**: `castMonster()` returns of wave-5 ids (wanderer casts),
   `triggerEncounter()` wave-5 calls, wanderer wave-5 days.
4. **Fought / ended**: `startCombat()` wave-5 starts (provenance),
   `fieldFight()` wave-5 rows by outcome, authoritative deed count —
   `deedState().wavesFaced` distinct wave-5 types at run end.
5. **Removed without a fight**: `removeWorldMonster()` wave-5 rows by
   caller/class, HP at removal, days alive.

## Primary metric

Per-stage counts per seed, aggregated over the reproduced
wave-5-unlocked seeds, with the bottleneck stage named: the first stage
(in pipeline order) whose count is zero while an earlier stage is
non-zero, or — if no stage is zero — the stage whose count collapses
most sharply relative to its predecessor, named with its binding
mechanism (e.g. readiness hold keeping the wave out of the pool,
spawn-ratio dilution, short post-unlock window ending in a lesser-seat
win, wanderer-contact geometry, curious/territorial stance conversion).
A bare "0 fought" restatement is NOT a pass.

## GO threshold (diagnostic success)

The run SEPARATES the wave-5 bottleneck mechanism on >= 2
wave-5-unlocked seeds: per-stage counts reported for every such seed,
and the bottleneck stage named with counts proving it (spawn failure
vs conversion failure distinguished: targets/spawns empty = spawn
failure; spawns non-empty with starts/field/deed empty = conversion
failure). If fewer than 2 wave-5-unlocked seeds exist in reach, the
verdict is SCARCITY with a verified count of how many wave-5-unlocked
seeds exist across the searched corpora and why — that verified
scarcity IS the finding, reported honestly, not padded. A verdict from
a single seed alone is NOT claimed.

## Horizon, seeds, policies

- Horizon: 180 days, death-aware (runDays ends on death/win; 180d cap
  to match the 1915Z bands). 98201 won at 90d, inside the cap.
- Policy stack verbatim from scripts/fightoutcome-driver-20261102.js
  (closecommit: titanroute + musterclose + mustergap over
  lead-fullseat); env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1; mode `herald`; one
  process per seed.
- Anchor seed 98201 MUST be re-run first (reproduction: it must
  reproduce the known wave-5 unlock with 0 faced, or any divergence
  explained, before diagnosis from it).
- Named corpora searched for other wave-5-unlocked seeds (maxWave >= 5
  in recorder format, or unlockedWave >= 5 in driver format):
  heraldband-widen 98201-98207 (only 98201 unlocked w5 under the w4
  driver; wave4seek band 98301-98308 unlocked none — both verified
  from their per-seed JSONs, not assumed), plus every other corpus
  under evidence/2026-11-0*/perseed-*. Candidate re-run seeds are
  taken from those corpora's maxWave >= 5 records and re-run under
  the closecommit stack + wave-5 instrument; a candidate counts as
  wave-5-unlocked ONLY if the re-run itself unlocks wave 5 (old-corpus
  maxWave is a lead, never a verdict — stacks and code have moved
  since those runs).
- If re-runs yield fewer than 2 wave-5-unlocked seeds in total
  (anchor included), run a fresh 8-seed pilot band to try to produce
  a second one: seeds chosen fresh at that point, verified against
  dated evidence + per-seed filenames (no reuse presented as fresh).
  Do NOT re-judge the wave-4 question; do NOT claim a wave-5 verdict
  from a single seed.
- Wall numbers are descriptive only (national/table/wins, wave reach,
  median survival): they are not judged against a GO threshold in
  this diagnostic arm. Table numbers use the split fields where the
  driver emits them (tableWaiting/tableDone), never the collapsed
  legacy latch alone.

## Sense-testing

At least one post-unlock stretch on a wave-5-unlocked seed is read from
the captured say transcript and judged for meaning/coherence/
consequences, not just counts — including whether anything in the
lines ever says a wave-5 fight matters for the full seat. The sense
verdict is reported with the counts.

## Metric review (filled at closeout)

- (to be filled: whether the staged counts bound the run fairly, and
  any revision proposed for the NEXT run only.)
