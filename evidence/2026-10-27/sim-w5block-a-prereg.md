# sim-w5block-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T1715Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w5block-a.
Worktree: `~/workspace/worktrees/sim-w5block-a` (branch sim-w5block-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
wave-5 unlock blocker census. Nothing in game code is fixed by this run.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law + readiness
  table), docs/TABLE.md (full seat needs national standing, Steve
  2026-10-27 ruling), docs/MEASUREMENT.md sections 9-12 and 14-15
  (pilot gate, death-aware horizons, pre-registration, convergence,
  metric binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this census builds on, not repeats)

- evidence/2026-10-27/sim-scale-onramp-round-1631.md (adoption run):
  lesser-seat wins only, full seat 0/16, wave-5 0/16, wave-4 4/8 on
  the 74201-74208 band; median 132d. The binding question carried
  forward: what single component blocks wave 5.
- evidence/2026-10-27/sim-fallbackfeared-a.md: pilot-inconclusive;
  defiance offered on every seated seed, so no fallback-feared
  seating was ever live-tested. Not re-litigated here.
- evidence/2026-10-27/sim-scalegate-a.md: deedGateReady() ok now
  enforces scale (national/global) for the full seat; sim band
  identical before/after; full seat still 0 everywhere judged.
- evidence/2026-10-27/sim-w4funnel-repin-a.md (+ prereg): current-
  base wave-4 funnel control — arrivals 31, fought 11/31, kills 2/31
  (both log-matched to arrivals), largest loss never-fought 20/31
  (64.5%), living-vs-cumulative divergence 1 (one killer died
  d137-d138 on 73671, one killer lived on 73677), wave-5 0/8,
  median 130d on the 73671-73678 band. The arrival-to-meeting
  decomposition is already measured there and is NOT re-measured
  here; this census measures the wave-5 GATE components, which the
  funnel census did not decompose (it reported readiness veterans
  only as rd4/rd5 daily series, not the full wave-5 gate).

## Wave-5 gate, re-derived from code (not invented)

From src/js/game.js unlockedWave() and src/js/standing.js
villageStandingTotal() / waveCombatReadiness() / standingCfg(),
as read in this worktree before sweeping:

- Wave 5 unlocks iff ALL of: (a) the wave-3 rung holds — day >= 25
  AND wave-2 ledger points >= 5 (bar[2]); (b) the GATED standing
  total >= 200 (t5); (c) wave-4 faced — waveEngaged(4) > 0, i.e. at
  least one distinct wave-4 monster type in deedState().wavesFaced
  (fed by real startCombat / fieldFight / recordWaveKill; fleeing
  counts, double-tap refusals and pre-combat evades do not).
- The gated total is NOT the raw total. villageStandingTotal():
  raw = war + diplomacy + plenty, where war = +25 per wave-3+
  ledger kill point (per-type cap 2), diplomacy = +34 per seasoned
  regional+ link (30+ days, trust 40+), plenty = +20 per major feast
  (quality >= 1). Two holds can pull the gated total to t5-1 = 199:
  (i) the PLENTY CAP — capped = war + diplomacy + min(plenty, 100);
  if raw >= 200 but capped < 200 the total holds at 199; (ii) the
  READINESS DEFERRAL — if capped >= 200 but waveCombatReadiness(5)
  is not ready, the total holds at 199. A defer4 hold (raw >= 100
  but rd4 not ready) holds at 99 and is likewise reported. Once a
  wave releases, the peak ratchet floors the total at that wave's
  threshold forever (peak >= 5 floors at 200, peak >= 4 at 100).
- waveCombatReadiness(5) — four bars from LIVE village state,
  demand from standingCfg().readyDemand[5] (sim starting points,
  not canon; Steve can overrule): armored 4 at armor P >= 15
  (worn armor only, scholar via armorBonus()); armed 6 (equipped
  melee/ranged weapon, or a weapon item carried); tricks 3
  (monsterCounterKnown convention); veterans 2 (DISTINCT killer
  vids in state.waveKillLog with w >= 4, filtered to LIVING —
  scholar vid counts living by definition, else vpOf(vid) must
  exist and not be dead; null-by entries skipped). Waves 1-3 are
  never gated. Any read error fails closed (not ready).
- NOTE (code vs canon wording): MONSTER-WAVES.md says wave 5 needs
  "standing >= 200 AND wave 4 faced", and the game.js comment still
  says readiness v3 may hold wave 4 "until 3 distinct wave-3 kinds
  are faced blow-by-blow" — that faced-bar comment is STALE: the
  live gate is waveCombatReadiness (design call #4, 2026-10-16),
  and faced-experience is retired from unlocks (engagements still
  feed the endgame deed bars only). The census reads the live gate,
  and this staleness is reported, not silently "fixed" (DIAG run).
- NOTE (scope): this census reads the gate at end-of-run and its
  peak over the run (see tracking below). It does NOT re-derive
  arrivals (w4funnel-repin-a owns that) and does NOT instrument
  melts (the proposed sim-w4melt-a arm owns that).

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the
  same baseline substrate as the 1631Z band, so wall numbers
  compare in shape with that band. No armed leg: there is no lever
  under test, so a second leg would add no comparison.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-w5block-a-sweep.js
  (census sweep), scripts/test-w5block-a.js (proof validator),
  scripts/test-w5block-a-sense.js (non-measured sense replay).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/runDays,
  full src/js list in index.html order minus DOM-only files (per
  the worker template). Math.random seeded BEFORE eval. Never
  stub Game.save.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the single binding wave-5 blocker on this band.

Per seed, at end of run (and peak over the run), record every
wave-5 gate component: w3 rung (day, wave-2 ledger points), raw
standing + war/diplomacy/plenty split, capped standing, gated
standing, peak wave, rd5 bars (armored/armed/tricks/veterans +
demand + short list), rd4 bars (for context), w4faced count
(waveEngaged(4)), wave-4 kills (waveKillLog w == 4, distinct
killers), living wave-4 killers, unlockedWave, wave reach,
national ever/final, table invited/entered, seat kind, won.

DIAG-GO requires a SINGLE named blocker C (one gate component,
or one rd5 sub-bar) such that on >= 6/8 seeds, C is short at
end-of-run while every other wave-5 gate component is MET at
end-of-run (for ratcheted items — peak wave, w4faced — "met"
means met at any point in the run, since those never un-happen;
for readiness bars and standing, "met" means met at end-of-run,
with peak values reported alongside to distinguish "never had
it" from "had it and lost it"). Two named example shapes that
would satisfy GO: (i) veterans = 0 while armored/armed/tricks,
standing, capped, and w4faced are all met; (ii) wave-4 kills = 0
while the standing/deed components are met.

If no single blocker meets the >= 6/8 bar, the verdict is
DIAG-NO-GO (no single binding blocker on this band) — or
inconclusive if the band never reaches wave 4 at all on >= 6/8
seeds (then the census measures a wave-4 problem, not a wave-5
gate problem, and says so). Never re-score mid-run: a miss is
NO-GO, never re-scored against a friendlier metric. Metric
doubts go under "metric review" for the NEXT run.

Secondary (reported, NOT judged): wall numbers every run needs —
national / table / wins, wave 4-5 unlocks, median survival; death-
cause shares; wave-4 engagements (wavesFaced counts per wave) vs
wave-4 kills; full-seat vs lesser-seat split; Arc reach.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): 8 seeds, single arm. No
  confirm band is pre-registered: this is a census, not a lever
  test; if DIAG-GO names a blocker, the NEXT run designs arms
  against it — this run does not re-run another band to chase GO.
- Seeds: 74301-74308 (pilot band). Freshness verified BEFORE
  sweeping: grep of committed evidence/2026-10-27/ for each seed
  as a word found NO seed usage (the single 74308 hit in the tree
  is a pantry kcal count in a journey-scale file, not a seed).
  Forbidden/used today and avoided: 73601-73608, 73641-73648,
  73661-73668, 73671-73678, 73701-73708, 74001-74008, 74101-74108,
  74111-74122, 74201-74208.
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max per the harness) — NOT a fixed 180d. Why: matches the 1631Z
  and w4funnel-repin bands in shape, so wall numbers compare; dead
  villages stop instead of being dragged to a fixed day count.
- Per-seed daily tracking (cheap, in the daily policy wrapper):
  gated standing, raw, capped, war/diplomacy/plenty, rd5 bars,
  rd4 bars, w4faced, unlockedWave, rank, waveKillLog-derived
  wave-4 kill/killer counts. Peaks and first-crossing days are
  derived from the daily series in the proof validator, never
  hand-edited.
- Proof gates (STOP, not verdict inputs):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate field
    present, no recorder errors.
  - G2 gate-component check: scripts/test-w5block-a.js recomputes
    veterans from the corpus waveKillLog + living roster by the
    code's own rule and matches the census's end-state veterans
    on every seed; plus at least one direct waveCombatReadiness(5)
    check against code (demand values, living filter).
  - G3 census integrity: per-seed unlockedWave at end is
    consistent with (gated standing, w4faced, w3 rung) under the
    unlockedWave() rule — any inconsistency is a gate failure
    (exit 1), investigated, not smoothed over.
- SENSE TEST (SENSE-TESTING LAW): seed nearest wave 5 by the
  fixed rule — highest gated standing at end; ties by most
  wave-4 kills, then lowest seed. Non-measured narration replay
  (say/sysSay taps, last 30 days) read for whether villagers act
  like people (goals, routines, reactions, dialogue) — judged in
  plain words in the evidence. Replay text never enters any count.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (grep for
  ingest/corpus in the script: 0 hits; it builds before/after
  panels from two roots). No panel artifact will be faked for
  this census; the sweep table + validator output are the
  comparison of record. Same standing exception as the recorder
  corpora (w4funnel-repin-a, eleventh sighting class).
- Telemetry deviation check: per the loop body, run AFTER writing
  evidence (telemetry-check.js vs scale-wall baseline, metrics
  national,table,wins,exiled) and report LOUD lines with verdict;
  do NOT roll the baseline on an unexplained LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
