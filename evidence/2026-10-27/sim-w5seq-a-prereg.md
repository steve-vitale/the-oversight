# sim-w5seq-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T1940Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w5seq-a.
Worktree: `~/workspace/worktrees/sim-w5seq-a` (branch sim-w5seq-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
SEQUENTIAL two-key-lock confirm on a FRESH band, measurement only.
Nothing in game code is fixed by this run.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law + readiness
  table: wave 5 = standing >= 200 AND wave-4 faced, readiness demand
  4/15/6/3/2), docs/TABLE.md (full seat needs national standing,
  Steve 2026-10-27 ruling; full seat = deedGateReady().ok), docs/
  MEASUREMENT.md sections 9-12 and 14-15 (pilot gate, death-aware
  horizons, pre-registration, convergence, metric binding, balanced
  panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this confirm builds on, not repeats)

- evidence/2026-10-27/sim-w5twokey-a.md (+ prereg): the direct
  parent, run fleshout-20261027T1816Z. Wave 5 closed 0/8 on seeds
  74311-74318. DIAG-GO at exactly threshold: both keys absent at
  peak on 6/8 seeds (peak rd5 veterans = 0/2 AND peak capped
  standing < 200, same seed). The two misses are the sequential
  clue this run confirms: 74313 (veterans peaked 1/2 — the first
  wave-4 kill in this census family, killer dead by end) and 74316
  (capped standing peaked 202 — the standing key present — yet
  gated standing never left 99, wave 4 never released, w4faced 0,
  because rd4 veterans stayed 0). Parent's plain-words formulation:
  the keys are SEQUENTIAL — the veterans key turns first, at the
  wave-4 door, and the standing key is not even tried until then.
- evidence/2026-10-27/sim-w5block-a.md (+ prereg): the grandparent
  (seeds 74301-74308, wave 5 closed 0/8, end-state blocker support
  0/8 everywhere, veterans 0/2 at end AND peak on 8/8).
- No re-scoring of 74311-74318, 74301-74308, or any prior band,
  ever: the verdict below is judged ONLY on the fresh band.
  Prior bands appear below only as comparison columns.

## Wave-5 gate, re-derived from code (same reading as w5twokey)

From src/js/game.js unlockedWave() and src/js/standing.js
villageStandingTotal() / waveCombatReadiness() / standingCfg(),
as read in this worktree before sweeping:

- Wave 5 unlocks iff ALL of: (a) the wave-3 rung holds — day >= 25
  AND wave-2 ledger points >= 5 (bar[2]); (b) the GATED standing
  total >= 200 (t5); (c) wave-4 faced — waveEngaged(4) > 0.
- The gated total folds in two holds: the PLENTY CAP (capped =
  war + diplomacy + min(plenty, 100); raw >= 200 but capped < 200
  holds at 199) and the READINESS DEFERRALS (capped >= 200 but
  waveCombatReadiness(5) not ready holds at 199; raw >= 100 but
  waveCombatReadiness(4) not ready holds at 99). Peak ratchet
  floors the total at the released wave's threshold forever
  (peak >= 5 -> 200, peak >= 4 -> 100).
- waveCombatReadiness(5) demand (live code, to be V5-checked):
  armored 4 @ P >= 15, armed 6, tricks 3, veterans 2 (DISTINCT
  LIVING killers with wave-4+ kills in state.waveKillLog).
  waveCombatReadiness(4) demand: armored 3 @ P >= 10, armed 5,
  tricks 3, veterans 1 (distinct living killers with wave-3+
  kills). The veterans key therefore has TWO turns: rd4 veterans
  >= 1 releases the 99-hold at the wave-4 door; rd5 veterans
  >= 2 releases the 199-hold at the wave-5 door. That is the
  sequential structure this run confirms.
- deedGateReady() (src/js/progression.js) — the FULL-seat deed
  check, separate from the wave-5 unlock gate: waves bars 5/5/4/3/2
  DISTINCT types FACED per wave, contestsSurvived >= 3, crises
  >= 3, integration stage >= 2, food-thesis deeds
  (sentimentTaught AND feastSurgeUsed), scale national/global
  (enforced in ok per the 2026-10-27 ruling). STRUCTURAL point,
  stated up front so it cannot be mistaken for a finding: the w5
  deed bar (2 distinct wave-5 types FACED) cannot be met while
  wave 5 is closed, so deedGateReady().ok is structurally false
  on every wave-5-closed seed; the interesting deed questions
  are per-component, not ok.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the
  w5block/w5twokey substrate, so wall numbers compare in shape.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-w5seq-a-
  sweep.js (census sweep, adapted from test-w5twokey-a-sweep.js
  with the sequential-leg computation added),
  scripts/test-w5seq-a.js (proof validator, adapted from
  test-w5twokey-a.js with SEQ checks added),
  scripts/test-w5seq-a-sense.js (non-measured sense replay,
  adapted from test-w5twokey-a-sense.js).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/runDays,
  full src/js list in index.html order minus DOM-only files (per
  the worker template). Math.random seeded BEFORE eval. Never
  stub Game.save.

## Read discipline (same as w5twokey, unchanged)

- The daily series uses ONLY pure reads: villageStanding(),
  standingPlentyCappedTotal(), waveCombatReadiness(4/5),
  waveEngaged(4), waveLedgerPoints(), deedGateReady(), state reads.
  It NEVER calls villageStandingTotal() or unlockedWave() daily —
  the daily gated total and daily unlocked wave are computed from
  the pure reads by the replication in the sweep script. The
  engine's own numbers are called once at end and checked by the
  validator.
- deedGateReady() is a pure read for census purposes: it computes
  from progState()/deedState()/scaleRank()/integrationStage() and
  writes nothing except idempotent deedState defaults. Its daily
  call cannot push the gate it measures: the wave-5 unlock gate
  does not consult deedGateReady at all.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the SEQUENTIAL two-key lock on this band.

Per seed, from the daily series, define:
- peakCapped = max daily capped standing; peakVet = max daily
  rd5 veterans (daily rd5[3]); peakGated = max daily gated.
- rd4vet(d) / rd5vet(d) = daily rd4[3] / rd5[3] on day d.
- rd4ready(d) (derived in the validator): daily rd4 tuple meets
  3/10/5/3/1 (armored >= 3, armed >= 5, tricks >= 3, veterans
  >= 1). rd5ready(d) analogously meets 4/15/6/3/2.
- First-veteran days: F4 = first day rd4vet >= 1 (if any); F5 =
  first day rd5vet >= 1 (if any).

DIAG-GO (sequential two-key lock confirmed) if and only if BOTH
legs hold:

LEG 1 — THE LOCK (same count as w5twokey): on >= 6/8 seeds BOTH
keys are absent at peak: peakVet = 0/2 AND peakCapped < 200.
Both conditions must hold on the SAME seed to count.

LEG 2 — THE SEQUENCE (all three sub-legs must hold):
- S1 (no single-key gated 200): on every daily point with
  gated >= 200 and daily peak < 5, that point has capped >= 200
  AND rd5vet >= 2. Equivalently in peak form, which the
  validator also checks: peakGated >= 200 implies peakCapped
  >= 200 AND peakVet >= 2, unless the seed already reached peak
  >= 5 (ratchet — in which case the FIRST day gated >= 200 must
  itself satisfy both keys). Engine-end form, also checked:
  gatedEngine >= 200 implies (peakCapped >= 200 AND peakVet
  >= 2) OR peakAfter >= 5.
- S2 (deferral observed at the wave-4 door): at least 1 seed
  exhibits a daily point with raw >= 100, rd4vet = 0, and gated
  <= 99 — standing earned while the veterans key is unturned,
  held at 99. The validator additionally reports the
  veterans-sole-short sub-count (points where rd4vet = 0 is the
  ONLY short rd4 bar) and the 74316-replication count (seeds
  with peakCapped >= 200, peakVet = 0, peakGated <= 199), but
  neither sub-count gates the verdict.
- S3 (no wave 5 on one key): no seed reaches wave 5 (daily
  computed uw = 5 on any day, or engineUwEnd >= 5) without both
  keys at peak (peakCapped >= 200 AND peakVet >= 2).

If LEG 1 holds but LEG 2 fails, the verdict is DIAG-NO-GO with
the failed sub-leg named (the lock replicates but the
sequential formulation does not). If LEG 1 fails, the verdict
is DIAG-NO-GO regardless of LEG 2 (reported with the exact
counts: both-absent / veterans-only / standing-only / neither,
so the shape of the miss is visible).
Inconclusive branch: if the band never reaches wave 4 on >= 6/8
seeds (wave4 < 3/8), the census measures a wave-4 problem, not
a wave-5 gate problem, and says so (the verdict is still
reported as measured, with the inconclusive flag attached,
not re-scored).

CONFIRM-BAND RULE (binding): if this replicate fails, the
formulation is REVISED, not re-scored. There is NO second
judged band on the same wording in this run. A failed confirm
goes back to the coordinator with the exact failing counts,
not to another 8 seeds.

Secondary quantities (reported, NOT the verdict, never promoted
into it mid-run):
- S1b, the looser one-component rule: veterans = 0 on >= 6/8
  seeds at end AND at peak.
- S2b, per-seed deedGateReady bars at end AND peak, plus the
  faced-vs-killed gap (deed w4 bar vs readiness veterans).
- S3b, the strict/loose 'wave-4 kills at zero while deed bars
  met' formulations, exactly as in w5twokey (both expected 0/8;
  the strict reading is structurally impossible pre-wave-5).
- S4b, wall numbers every run needs: national / table / wins,
  wave 4-5 unlocks, median survival, death-cause shares, plus
  wave-4 kills, living wave-4 killers, full vs lesser seat
  split, Arc reach, and the w5twokey comparison columns.
- S5b, first-veteran-day behavior (descriptive, per seed with
  F4/F5): gated, capped, raw, rd4ready/rd5ready on F4 and F5,
  and whether the 99-hold (F4) / 199-hold (F5) released on
  that day. This table is the task's "veterans reach >= 1"
  leg in observable form; it describes, it does not gate.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test); no
  confirm band is pre-registered beyond this one band, per the
  confirm-band rule above.
- Seeds: 74401-74408 (fresh band). Freshness verified BEFORE
  sweeping: grep of committed evidence/2026-10-27/ (all *.md
  plus per-seed summary seeds lists) for 74401-74408 found ZERO
  swept hits — the only mentions are sim-w5twokey-a.md and its
  prereg naming 74401-74408 as held alternates. Forbidden/used
  today and avoided: 74301-74308, 74311-74318, and all earlier
  2026-10-27 bands named in the w5twokey prereg.
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max) — NOT a fixed 180d. Why: matches the w5twokey band
  in shape, so wall numbers compare.
- Per-seed daily tracking: gated standing, raw, capped, war/
  diplomacy/plenty, rd5 bars, rd4 bars, w4faced, unlockedWave
  (computed), rank, waveKillLog-derived wave-4 kill/killer counts,
  AND deedGateReady() per day. Peaks and first-crossing days are
  derived from the daily series in the proof validator, never
  hand-edited.
- Proof gates (STOP, not verdict inputs):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate + deed
    field present, no recorder errors.
  - G2 veterans recompute (as w5twokey V2).
  - G3 gated consistency (as w5twokey V3).
  - G4 unlock consistency (as w5twokey V4).
  - G5 demand vs live code (as w5twokey V5).
  - G6 recount (as w5twokey V6).
  - G7 daily series (as w5twokey V7).
  - G8 deed agreement (as w5twokey G4).
  - G9 twokey recount (as w5twokey G5).
  - G10 SEQ recount: LEG 2 (S1/S2/S3) recomputed from the daily
    series in the validator equals the summary's SEQ counts;
    first-veteran-day table recomputed from the daily series.
- SENSE TEST (SENSE-TESTING LAW): seed nearest wave 5 by the
  fixed rule — highest gated standing at end; ties by most
  wave-4 kills, then lowest seed. Non-measured narration replay
  (say/sysSay taps, last 30 days) read for whether villagers
  act like people — judged in plain words in the evidence.
  Replay text never enters any count.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (w5twokey grep:
  0 hits for ingest/corpus; it builds before/after panels from
  two roots). A panel compare will be ATTEMPTED and reported
  honestly; no panel artifact will be faked. Same standing
  exception as the w5twokey corpus if the attempt fails.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall baseline,
  metrics national,table,wins,exiled) and report LOUD lines
  with verdict; do NOT roll the baseline on an unexplained
  LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
