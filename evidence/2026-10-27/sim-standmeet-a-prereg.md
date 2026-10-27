# sim-standmeet-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T2036Z. Axis: scale-onramp
(the blocking axis). Worker: sim-standmeet-a.
Worktree: `~/workspace/worktrees/sim-standmeet-a` (branch sim-standmeet-a).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
SEPARATION of the two tracks behind the wave-5 door — the STANDING
track (feast/diplomacy standing) and the MEETING track (facing wave-4
monsters) — on a FRESH band, measurement only. Nothing in game code
is fixed by this run.

## Canon read first

- docs/CANON.md, then docs/MONSTER-WAVES.md (wave law: wave 4 gate
  standing >= 100; wave 5 gate standing >= 200 AND wave-4 faced;
  readiness gates the standing unlock — veterans = living roster
  members with a wave-(w-1)+ kill; wave-5 demand 4/15/6/3/2),
  docs/TABLE.md (the table PRICES the run, never gates on godhood;
  full seat = deedGateReady().ok with national scale enforced per
  the Steve 2026-10-27 ruling; lesser seat reachable; tableWaiting
  = an open invitation — havenGrowth.js: "no open invitation"
  when tableWaiting is false), docs/MEASUREMENT.md sections 9-12
  and 14-15 (pilot gate, death-aware horizons, pre-registration,
  convergence, metric binding, balanced panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported.

## Prior evidence read first (this run separates, not repeats)

- evidence/2026-10-27/sim-w5seq-a.md (+ prereg): the direct parent,
  run fleshout-20261027T1940Z, seeds 74401-74408. Its sharpest
  datum is the seed this run is named for: 74406 reached raw
  standing 347 (capped 227, gated 199) with ZERO wave-4 meetings
  (w4faced 0) — standing earned without any fighting, held at
  199 by the readiness deferral because no fighter ever counted
  as a veteran. Two sibling seeds (74401, 74408) add the meeting
  without the kill (w4faced 3 and 4, w4kills 0). The parent's
  documented gap, carried here verbatim: "74406's standing route
  (raw 347 via plenty 220 + diplomacy 102, w4faced 0) shows a
  feast/diplomacy village can clear the standing number twice
  over while never meeting wave 4 — the standing key and the
  meeting key are earned on different tracks, and the gate
  refuses to convert one into the other."
- evidence/2026-10-27/sim-w5twokey-a.md (+ prereg) and
  sim-w5block-a.md (+ prereg): grandparents. Same substrate
  family, same gate model; their bands are comparison-only.
- No re-scoring of 74401-74408, 74311-74318, 74301-74308, or any
  prior band, ever: the verdict below is judged ONLY on the
  fresh band. Prior bands appear below only as comparison
  columns. STALE-BASELINE RULE: judged numbers cite only this
  run's own fresh corpus.

## The two tracks, defined before sweeping (binding)

- STANDING track: peak CAPPED standing (max daily capped over the
  daily series). HIGH STANDING = peak capped >= 200, the standing
  key at peak. Peak raw standing is recorded alongside (what was
  earned before the plenty cap), plus the end raw/capped/gated.
- MEETING track: wave-4 faced EVER > 0 — daily max w4faced, or
  end w4faced; engagements never un-happen, so end == ever
  except for the known death-day sampling edge (w5seq note: a
  final-day meeting can land after the last daily sample; the
  end value governs, the daily value is cross-checked).
- The SEPARATION TABLE classifies every seed into exactly one
  cell:
  - HS-no-meet: peak capped >= 200 AND w4faced ever == 0
  - meet-no-HS: w4faced ever > 0 AND peak capped < 200
  - both: peak capped >= 200 AND w4faced ever > 0
  - neither: peak capped < 200 AND w4faced ever == 0
  The four cells must sum to 8; a seed in no cell or two cells
  is a proof failure, not a finding.
- SECONDARY COLUMN (not a separate verdict): global rank reached
  (maxRank over the daily series and end) + whether a TABLE OFFER
  was ever seen. TABLE OFFER = tableWaiting ever true (the
  engine's open-invitation flag; row.table). Cross-check column:
  tablePreview seen (policy ctx tsPreviewSeen > 0). A
  RANK-WITHOUT-OFFER seed = maxRank == global AND tableWaiting
  never true. The stricter "neither waiting nor preview" count
  is also reported. This column answers "how often does top rank
  bypass the table" descriptively; it does not gate the verdict.

## Gate model, inherited whole from w5seq (FULL env set)

- Wave 5 unlocks iff ALL of: (a) the wave-3 rung holds — day
  >= 25 AND wave-2 ledger points >= 5 (bar[2]); (b) the GATED
  standing total >= 200 (t5); (c) wave-4 faced — waveEngaged(4)
  > 0.
- The gated total folds in two holds: the PLENTY CAP (capped =
  war + diplomacy + min(plenty, 100); raw >= 200 but capped <
  200 holds at 199) and the READINESS DEFERRALS (capped >= 200
  but waveCombatReadiness(5) not ready holds at 199; raw >= 100
  but waveCombatReadiness(4) not ready holds at 99). Peak
  ratchet floors the total at the released wave's threshold
  forever (peak >= 5 -> 200, peak >= 4 -> 100).
- waveCombatReadiness(5) demand (live code, to be V5-checked):
  armored 4 @ P >= 15, armed 6, tricks 3, veterans 2 (DISTINCT
  LIVING killers with wave-4+ kills in state.waveKillLog).
  waveCombatReadiness(4) demand: armored 3 @ P >= 10, armed 5,
  tricks 3, veterans 1.
- deedGateReady() (src/js/progression.js) — the FULL-seat deed
  check, separate from the wave-5 unlock gate: waves bars
  5/5/4/3/2 DISTINCT types FACED per wave, contestsSurvived
  >= 3, crises >= 3, integration stage >= 2, food-thesis deeds
  (sentimentTaught AND feastSurgeUsed), scale national/global
  (enforced in ok per the 2026-10-27 ruling). STRUCTURAL point,
  stated up front: the w5 deed bar (2 distinct wave-5 types
  FACED) cannot be met while wave 5 is closed, so
  deedGateReady().ok is structurally false on every wave-5-
  closed seed; the interesting deed questions are
  per-component, not ok.
- Table offer path (for the secondary column): tableScene's
  dawn re-check prices full via deedGateReady() or lesser via
  the lesser bar; a seat of 'none' withdraws a stale
  tableWaiting aloud. tableWaiting ever true is therefore the
  offer, and a seed can reach global rank without it if no
  seat ever priced open during its life.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the
  w5block/w5twokey/w5seq substrate, so wall numbers compare in
  shape.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-standmeet-a-
  sweep.js (census sweep, adapted from test-w5seq-a-sweep.js
  with the separation-table computation added and the SEQ
  computation kept for comparison), scripts/test-standmeet-a.js
  (proof validator, adapted from test-w5seq-a.js with
  separation + rank/offer recount gates added),
  scripts/test-standmeet-a-sense.js (non-measured sense replay,
  adapted from test-w5seq-a-sense.js).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/runDays,
  full src/js list in index.html order minus DOM-only files (per
  the worker template). Math.random seeded BEFORE eval. Never
  stub Game.save.

## Substrate-activation gate (the rule3trial lesson)

A census of a substrate's behavior is void if the substrate never
ran — and delegation gates cannot detect a missing courtship, so
this gate is measured from the substrate's own footprints, not
from its promises:

- A seed counts SUBSTRATE-ACTIVE iff at least one footprint is
  present at end: (a) end links + feasts > 0 (courtship work
  happened), OR (b) tsNationalDay set (the seat layer saw
  national+ rank), OR (c) tsPreviewSeen > 0 (the seat layer
  priced the table).
- GATE (STOP, not a verdict input): ACTIVE on >= 7/8 seeds. If
  the gate fails, the run is NOT judged — it is reported as a
  substrate failure with the per-seed footprints, loudly, and no
  verdict is claimed.
- Calibration: on the w5seq band all 8 seeds were ACTIVE by
  this rule (links/feasts: 74401 0/12, 74402 3/1, 74403 3/2,
  74404 3/0, 74405 0/0 but tsNationalDay 77, 74406 3/11, 74407
  3/0, 74408 3/7; tsNationalDay set on all 8). The 7/8 threshold
  allows one early-death seed with no footprint at all.

## Read discipline (same as w5seq, unchanged)

- The daily series uses ONLY pure reads: villageStanding(),
  standingPlentyCappedTotal(), waveCombatReadiness(4/5),
  waveEngaged(4), waveLedgerPoints(), deedGateReady(), state
  reads. It NEVER calls villageStandingTotal() or unlockedWave()
  daily — the daily gated total and daily unlocked wave are
  computed from the pure reads by the replication in the sweep
  script. The engine's own numbers are called once at end and
  checked by the validator.
- deedGateReady() is a pure read for census purposes: it computes
  from progState()/deedState()/scaleRank()/integrationStage() and
  writes nothing except idempotent deedState defaults. Its daily
  call cannot push the gate it measures: the wave-5 unlock gate
  does not consult deedGateReady at all.

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the SEPARATION TABLE on this band, fully populated.

Per seed, from the daily series, define:
- peakRaw = max daily raw; peakCapped = max daily capped;
  peakGated = max daily gated.
- w4facedEver = max(daily w4faced max, end w4faced).
- w4killsEnd, livingW4killersEnd (from gate.kills), w4unlock
  (engineUwEnd >= 4 or waveReach >= 4), w5unlock (engineUwEnd
  >= 5 or waveReach >= 5).
- nationalEver / nationalFinal / table / entered / won /
  maxRank / finalRank (row fields, as in w5seq).
- offerEver = row.table (tableWaiting ever); previewSeen =
  (row.ts.tsPreviewSeen | 0) > 0.

GO (census complete) if and only if ALL of:
- G0: census completes on 8/8 seeds (8 rows, days > 0, every
  gate + deed field present, no recorder errors).
- G0b: the SUBSTRATE-ACTIVATION gate passes (>= 7/8 ACTIVE).
- G0c: the separation table is FULLY POPULATED — all 8 seeds
  classified into exactly one cell, cells sum to 8, and the
  validator's independent recount from the daily series equals
  the summary's cells.
- G0d: all proof gates pass (V1-V7 + G4 + G5 + G10 carried
  from w5seq, plus the new S-gates below).

If GO holds, the VERDICT is the table itself with a plain-words
reading of which track moves the gate: does standing rise
without meetings (HS-no-meet > 0), do meetings happen without
standing (meet-no-HS > 0), and on which seeds, if any, do the
tracks coincide — plus, for every HS-no-meet seed, whether its
gated standing was held at 199 (the deferral doing its job) or
released (the gate actually moved). There is NO numeric
threshold on any single cell: a cell at zero is a finding
(the track does not separate that way on this band), not a
failure. A census that completes with a full table is a GO
census even if every seed lands in one cell.

If GO fails on G0/G0b/G0c/G0d, the verdict is NO-GO with the
failed gate named — the table is reported as measured but NOT
as a judged separation. No cell count is re-scored, no second
judged band is run on new wording (see Confirm-band rule).

Secondary quantities (reported, NOT the verdict, never promoted
into it mid-run):
- S1b, rank-without-offer count: seeds with maxRank == global
  AND offerEver == 0; plus the stricter neither-waiting-nor-
  preview count; plus per-seed maxRank / offerEver / previewSeen
  table.
- S2b, wall numbers every run needs: national / table / wins,
  wave 4-5 unlocks, median survival, death-cause shares, plus
  wave-4 kills, living wave-4 killers, full vs lesser seat
  split, Arc reach, and the w5seq comparison columns.
- S3b, per-seed gate table as in w5seq (raw [peak] / capped
  [peak] / gated, rd5 end [peak], w4faced, w4kills (living)),
  extended with maxRank and offerEver columns.
- S4b, the w5seq SEQ computation kept for comparison (S1/S2/S3
  + 74316-replication count), reported but not judged — the
  sequential structure is the parent's verdict, not this run's.
- S5b, standing composition on HS-no-meet seeds: end war /
  diplomacy / plenty split (what the standing was earned by, in
  numbers; the sense replay judges it in words).

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): the 8-seed band IS the
  pilot for a census (this is a census, not a lever test); no
  confirm band is pre-registered beyond this one band, per the
  confirm-band rule below.
- Seeds: 74901-74908 (fresh band). Freshness verified BEFORE
  sweeping: word-boundary grep of committed evidence/2026-10-27/
  (*.md, summary.json, per-seed s*.json rows) for each of
  74901-74908 found ZERO hits. Forbidden/used today and avoided:
  74401-74408, 74311-74318, 74301-74308, and all earlier
  2026-10-27 bands named in the w5seq prereg.
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d
  tail max) — NOT a fixed 180d. Why: matches the w5seq band in
  shape, so wall numbers compare.
- Per-seed daily tracking: gated standing, raw, capped, war/
  diplomacy/plenty, rd5 bars, rd4 bars, w4faced, unlockedWave
  (computed), rank, waveKillLog-derived wave-4 kill/killer
  counts, AND deedGateReady() per day. Peaks and first-crossing
  days are derived from the daily series in the proof validator,
  never hand-edited.
- Proof gates (STOP, not verdict inputs):
  - G1 corpus integrity (as w5seq V1).
  - G2 veterans recompute (as w5seq V2).
  - G3 gated consistency (as w5seq V3).
  - G4 unlock consistency (as w5seq V4).
  - G5 demand vs live code (as w5seq V5).
  - G6 recount (as w5seq V6).
  - G7 daily series (as w5seq V7).
  - G8 deed agreement (as w5seq G4).
  - G9 twokey recount (as w5seq G5).
  - G10 SEQ recount (as w5seq G10).
  - S-G1 separation recount: cells recomputed from the daily
    series in the validator equal summary.separation.cells and
    summary.separation.perSeed; cells sum to 8; every seed in
    exactly one cell.
  - S-G2 rank/offer recount: per-seed maxRank recomputed from
    the daily rank series + end rank equals summary; offerEver
    equals row.table; previewSeen equals (row.ts.tsPreviewSeen
    | 0) > 0; rank-without-offer count recomputed equals
    summary.
  - S-G3 substrate-activation recount: ACTIVE flags recomputed
    from end links/feasts + tsNationalDay + tsPreviewSeen equal
    summary; ACTIVE count >= 7.
- SENSE TEST (SENSE-TESTING LAW): sense seed by the fixed rule —
  highest peak capped standing among HS-no-meet seeds if that
  cell is non-empty; otherwise the w5seq rule (highest gated
  standing at end; ties by most wave-4 kills, then lowest
  seed). Non-measured narration replay (say/sysSay taps, last
  30 days) read for WHAT the standing was actually earned by —
  feasts, links, war, diplomacy — and whether villagers act like
  people. Replay text never enters any count.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (w5seq grep: 0
  hits for ingest/corpus; it builds before/after panels from
  two roots). A panel compare will be ATTEMPTED and reported
  honestly; no panel artifact will be faked. Same standing
  exception as the w5seq corpus if the attempt fails.
- Telemetry deviation check: per the loop body, run AFTER
  writing evidence (telemetry-check.js vs scale-wall baseline,
  metrics national,table,wins,exiled) and report LOUD lines
  with verdict; do NOT roll the baseline on an unexplained
  LOUD line.

## Confirm-band rule (binding)

If this census fails GO, the formulation is REVISED, not
re-scored. There is NO second judged band on the same wording
in this run. A failed census goes back to the coordinator with
the exact failing counts, not to another 8 seeds. Judge ONLY
the fresh band; prior bands are comparison-only, never
re-scored. Do NOT run a second judged band on new wording.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
