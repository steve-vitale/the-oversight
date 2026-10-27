# sim-w5twokey-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T1816Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w5twokey-a.
Worktree: `~/workspace/worktrees/sim-w5twokey-a` (branch sim-w5twokey-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
wave-5 two-key-lock census with deedGateReady bars instrumented.
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

## Prior evidence read first (this census builds on, not repeats)

- evidence/2026-10-27/sim-w5block-a.md (+ prereg): the direct
  parent. Wave 5 closed 0/8 on seeds 74301-74308 with NO single
  end-state blocker (blocker support 0/8 everywhere). Its two
  headline facts: (a) veterans 0/2 at end AND peak on 8/8 seeds
  (wave-4 kills 0 on all seeds; the four wave-3 kills all by
  fighters dead by end); (b) capped standing peaked >= 200 on only
  1/8 seeds (74305, capped peak 227; rest 80-147). Armor/armed/
  tricks met at peak on all wave-4 seeds but decayed by end.
  Its metric review says the next run should (i) frame the gate as
  a TWO-KEY lock (standing AND veterans), and (ii) instrument
  deedGateReady bars per seed (the 5/5/4/3/2 bars), which w5block
  did NOT instrument. This run does exactly those two things, on
  a fresh band. No re-scoring of 74301-74308 or any prior band,
  ever: the verdict below is judged ONLY on the fresh band.
- evidence/2026-10-27/sim-w4funnel-repin-a.md: arrival-to-meeting
  decomposition (arrivals 31, fought 11/31, kills 2/31) — NOT
  re-measured here.
- evidence/2026-10-27/sim-scalegate-a.md: deedGateReady().ok now
  enforces scale (national/global) for the full seat.

## Wave-5 gate, re-derived from code (same reading as w5block)

From src/js/game.js unlockedWave() and src/js/standing.js
villageStandingTotal() / waveCombatReadiness() / standingCfg(),
as read in this worktree before sweeping:

- Wave 5 unlocks iff ALL of: (a) the wave-3 rung holds — day >= 25
  AND wave-2 ledger points >= 5 (bar[2]); (b) the GATED standing
  total >= 200 (t5); (c) wave-4 faced — waveEngaged(4) > 0.
- The gated total folds in two holds: the PLENTY CAP (capped =
  war + diplomacy + min(plenty, 100); raw >= 200 but capped < 200
  holds at 199) and the READINESS DEFERRAL (capped >= 200 but
  waveCombatReadiness(5) not ready holds at 199); the rd4 deferral
  holds at 99 (raw >= 100, rd4 not ready). Peak ratchet floors the
  total at the released wave's threshold forever (peak >= 5 -> 200,
  peak >= 4 -> 100).
- waveCombatReadiness(5) demand (live code, to be V5-checked):
  armored 4 @ P >= 15, armed 6, tricks 3, veterans 2 (DISTINCT killer
  vids in state.waveKillLog with w >= 4, filtered to LIVING).
- deedGateReady() (src/js/progression.js) — the FULL-seat deed
  check, separate from the wave-5 unlock gate: waves bars 5/5/4/3/2
  DISTINCT types FACED per wave (w1 >= 5, w2 >= 5, w3 >= 4,
  w4 >= 3, w5 >= 2), contestsSurvived >= 3, crises >= 3,
  integration stage >= 2, food-thesis deeds (sentimentTaught AND
  feastSurgeUsed), scale national/global (enforced in ok per the
  2026-10-27 ruling). ok = all of those ANDed. NOTE the structural
  point, stated up front so it cannot be mistaken for a finding:
  the w5 deed bar (2 distinct wave-5 types FACED) cannot be met
  while wave 5 is closed, so deedGateReady().ok is structurally
  false on every wave-5-closed seed; the interesting deed
  questions are per-component, not ok.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the
  w5block substrate, so wall numbers compare in shape.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-w5twokey-a-
  sweep.js (census sweep, adapted from test-w5block-a-sweep.js
  with deedGateReady reads added), scripts/test-w5twokey-a.js
  (proof validator), scripts/test-w5twokey-a-sense.js (non-
  measured sense replay, adapted from test-w5block-a-sense.js).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/runDays,
  full src/js list in index.html order minus DOM-only files (per
  the worker template). Math.random seeded BEFORE eval. Never
  stub Game.save.

## Read discipline (same as w5block, plus one justified addition)

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
  writes nothing except idempotent default initialization inside
  deedState() (wavesFaced = {}, contestsSurvived |= 0 — the same
  class of default-fill the w5block state reads already performed;
  it advances no clock, no ledger, no roster). Its daily call
  cannot push the gate it measures: the wave-5 unlock gate does
  not consult deedGateReady at all (unlock = w3 rung + gated
  standing + waveEngaged(4)), and the table invitation path only
  reads the same values at its own beats.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the two-key lock on this band.

Per seed, at PEAK over the run (daily series maxima — peaks are
the right frame because readiness bars decay by end while the
standing/veteran facts are the question, and because w5block's
end-state frame already answered the end-state question with
DIAG-NO-GO), record key 1 = peak capped standing, key 2 = peak
rd5 veterans (daily series maximum of the living-filtered count).

DIAG-GO (two-key lock confirmed) if and only if on >= 6/8 seeds
BOTH keys are absent at peak: veterans-peak = 0/2 AND capped-
standing-peak < 200. Both conditions must hold on the SAME seed
to count toward the 6; a seed counts only if it meets both.

If fewer than 6/8 seeds hold both keys absent at peak, the verdict
is DIAG-NO-GO (the two-key lock is NOT confirmed on this band) —
reported with the exact counts (both-absent / veterans-only /
standing-only / neither) so the shape of the miss is visible.
Inconclusive branch: if the band never reaches wave 4 on >= 6/8
seeds, the census measures a wave-4 problem, not a wave-5 gate
problem, and says so (the verdict is still reported as measured,
with the inconclusive flag attached, not re-scored).

Secondary quantities (reported, NOT the verdict, never promoted
into it mid-run):
- S1, the looser one-component rule: veterans = 0 on >= 6/8 seeds
  at end AND at peak (both must hold per seed to count).
- S2, per-seed deedGateReady bars at end AND peak: w1..w5 faced
  counts vs 5/5/4/3/2, contestsN vs 3, crisesN vs 3, stage vs 2,
  foodDeeds, scale, ok. Plus agreement/disagreement vs the
  readiness bars, in particular: (a) deed w4 faced count vs
  waveEngaged(4) (both count distinct faced wave-4 types — they
  must agree; disagreement is a gate failure, exit 1); (b) deed
  w4 bar (faced >= 3) vs readiness veterans (killed >= 2) — the
  FACED-vs-KILLED gap: faced can be met while veterans sit at 0.
- S3, the 'wave-4 kills at zero while deed bars met' formulation,
  tested in TWO pre-registered readings, neither of which changes
  the verdict: (a) STRICT: deedGateReady().ok true while w4kills
  = 0 — expected structurally impossible pre-wave-5 (the w5 bar
  needs wave-5 faced), reported as a count; (b) LOOSE: all
  pre-wave-5 deed components met (w1 >= 5, w2 >= 5, w3 >= 4,
  w4 >= 3, contests >= 3, crises >= 3, stage >= 2, foodDeeds,
  scale national+) while w4kills = 0 — counted per seed at end
  and at peak.
- S4, wall numbers every run needs: national / table / wins,
  wave 4-5 unlocks, median survival, death-cause shares, plus
  wave-4 kills, living wave-4 killers, full vs lesser seat split,
  Arc reach, and the w5block comparison columns (end-state
  rd5 bars, end gated standing) so the two bands can be set side
  by side without re-scoring either.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): 8 seeds, single arm. No
  confirm band is pre-registered: this is a census, not a lever
  test; if DIAG-GO confirms the lock, the NEXT run designs arms
  against it — this run does not re-run another band to chase GO.
- Seeds: 74311-74318 (fresh band). Freshness verified BEFORE
  sweeping: grep of committed evidence/2026-10-27/ for each seed
  as a word found ZERO hits for all eight (74311-74318 and the
  74401-74408 alternates both clean; 74311-74318 chosen as the
  next band after w5block's 74301-74308). Forbidden/used today and
  avoided: 73601-73608, 73641-73648, 73661-73668, 73671-73678,
  73701-73708, 74001-74008, 74101-74108, 74111-74122, 74201-74208,
  74301-74308.
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max per the harness) — NOT a fixed 180d. Why: matches the
  w5block band in shape, so wall numbers compare.
- Per-seed daily tracking: gated standing, raw, capped, war/
  diplomacy/plenty, rd5 bars, rd4 bars, w4faced, unlockedWave
  (computed), rank, waveKillLog-derived wave-4 kill/killer counts,
  AND deedGateReady() per day (w1..w5, contestsN, crisesN, rank,
  stage, foodDeeds, stageOk, scale, waves, ok). Peaks and
  first-crossing days are derived from the daily series in the
  proof validator, never hand-edited.
- Proof gates (STOP, not verdict inputs):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate + deed
    field present, no recorder errors.
  - G2 gate-component check: scripts/test-w5twokey-a.js recomputes
    veterans from the corpus waveKillLog + living roster by the
    code's own rule and matches the census's end-state veterans
    on every seed; plus at least one direct waveCombatReadiness(5)
    check against code (demand values, living filter).
  - G3 census integrity: per-seed unlockedWave at end is
    consistent with (gated standing, w4faced, w3 rung) under the
    unlockedWave() rule — any inconsistency is a gate failure
    (exit 1), investigated, not smoothed over.
  - G4 deed agreement: per-seed deed w4 faced count equals
    waveEngaged(4) at end (both count distinct faced wave-4 types);
    deed w-counts never exceed the wavesFaced-derived counts in
    the row's gate.wavesFaced; deedGateReady recomputed from the
    row's recorded deed components matches the row's recorded ok.
  - G5 two-key recount: DIAG-GO counting recomputed from the daily
    series in the validator equals the summary's count.
- SENSE TEST (SENSE-TESTING LAW): seed nearest wave 5 by the fixed
  rule — highest gated standing at end; ties by most wave-4 kills,
  then lowest seed. Non-measured narration replay (say/sysSay taps,
  last 30 days) read for whether villagers act like people (goals,
  routines, reactions, dialogue) — judged in plain words in the
  evidence. Replay text never enters any count.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (grep for
  ingest/corpus in the script: 0 hits; it builds before/after
  panels from two roots). No panel artifact will be faked for
  this census; the sweep table + validator output are the
  comparison of record. Same standing exception as the w5block
  corpus.
- Telemetry deviation check: per the loop body, run AFTER writing
  evidence (telemetry-check.js vs scale-wall baseline, metrics
  national,table,wins,exiled) and report LOUD lines with verdict;
  do NOT roll the baseline on an unexplained LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
