# sim-fullseatgate-a — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261027T1940Z. Axis: scale-onramp
(the blocking axis). Worker: sim-fullseatgate-a (arm sim-fullseatgate-a).
Worktree: `~/workspace/worktrees/sim-fullseatgate-a`
(branch sim-fullseatgate-a).
MEASUREMENT ONLY — zero src/js changes, zero default flips, no game
lever, no game-lever proposal. The deliverable is knowledge: a counted
answer to how much of the table the full-seat scale gate would bite.

## Canon read first

- docs/CANON.md, then docs/TABLE.md (full seat = deedGateReady().ok:
  national/global scale, all wave bars 5/5/4/3/2, 3+ contests, 3+
  crises, stage >= 3, food-thesis deeds; lesser seat = regional+,
  4/4/3 waves, 2+ contests, 2+ crises, stage >= 2, food deeds),
  docs/MEASUREMENT.md sections 9-12 and 14-15 (pilot gate,
  death-aware horizons, pre-registration, metric binding, balanced
  panels).
- No canon invented. Where code and canon wording differ, the code
  reading below governs the census and the difference is reported,
  never adjudicated here.

## Prior evidence read first (comparison only, NEVER re-judged)

- evidence/2026-10-27/sim-scalegate-a.md (+ prereg): the gap-closure
  arm. It changed deedGateReady() so `ok` includes scale, with unit
  proof (22/22) and a before/after band identical on every field
  (full seats 0/8 both sides — wave 5 blocks full everywhere).
- evidence/2026-10-27/sim-w5twokey-a.md (+ prereg): the direct
  substrate parent. Tableseat-nowait substrate, seeds 74311-74318,
  180d death-aware. Wall numbers: national ever 7/8, table invited
  5/8, entered 3/8, wins 3/8 (all feared lesser), full 0/8, lesser
  3/8, wave-4 unlock 5/8, wave-5 unlock 0/8, median survival 156d.
  Deed bars instrumented per seed at end and peak; deedGateReady
  ok 0/8 at end and peak (structurally forced by w5 = 0).
- NOTE — the tableseat evidence files named in the task
  (sim-tableseat-a.md, sim-tableseat-nowait-a.md) do NOT exist in
  committed 2026-10-27 evidence in this worktree, nor in the main
  tree's 2026-10-27 evidence listing. The w5twokey + scalegate
  files above are the substrate and deedGateReady sources used
  instead. If the coordinator holds those files elsewhere, they
  are comparison material for a later run, not a gap in this one.

## BASE-STATE CORRECTION (recorded before sweeping — it changes the
## instrument's framing, NOT the counted answer)

The task brief states scale is "currently reported but not enforced"
in deedGateReady().ok. In THIS worktree that premise is already
stale: src/js/progression.js deedGateReady() returns
`ok = waves && contests && crises && stageOk && foodDeeds && scale`
(the sim-scalegate-a change is in this branch's base, coordinator
commit b2bf0135f). No seat-code edit is made by this arm under any
circumstances (sibling gap-closure lane owns seat code), so the
census measures the SAME counted answer counterfactually from the
breakdown fields, which the code still reports separately:

- barsOnly = waves && contests && crises && stageOk && foodDeeds
  (the old ok, recomputed from the breakdown's own fields).
- scale = the breakdown's scale field (national/global).
- ok (this tree) = barsOnly && scale — the validator checks this
  identity on every recorded snapshot.

"Would be BLOCKED if scale were enforced in ok" therefore means,
exactly: barsOnly true AND scale false at the counted moment (under
the old code such a village would have entered the full seat; under
the enforced code it downgrades to lesser or none per tableSeat()).
"Passes either way" means: barsOnly true AND scale true. The
counterfactual is computed from reads, never by toggling code.

## Stage discrepancy (recorded, NOT adjudicated, per the task)

docs/TABLE.md says the full seat needs stage >= 3, but
progression.js deedGateReady() enforces stage >= 2 (stageOk =
stage >= 2), both before and after scalegate-a. This census RECORDS
stage as observed (the stage field + stageOk field of every deed
snapshot) and uses the code's stageOk in barsOnly. It does not
adjudicate which bar is right and does not change either. That
question is a Steve call, already filed by sim-scalegate-a.

## Substrate and pairing (VERBATIM reuse, zero edits)

- Single arm, DIAG: scripts/policies/tableseat-nowait.js VERBATIM
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, TABLEDEFIANT unset) — the
  w5twokey substrate, so wall numbers compare in shape.
- NEVER edited: tableseat-nowait.js, leanlinkrescue.js, or any
  src/js file. New instruments only: scripts/test-fullseatgate-a-
  sweep.js (census sweep, adapted from test-w5twokey-a-sweep.js
  with table-entry / table-entered deed snapshots added),
  scripts/test-fullseatgate-a.js (proof validator),
  scripts/test-fullseatgate-a-sense.js (non-measured sense replay,
  adapted from test-w5twokey-a-sense.js).
- Sweep harness: scripts/sim-harness.js loadGame/setupGame/runDays,
  full src/js list in index.html order minus DOM-only files (per
  the worker template). Math.random seeded BEFORE eval. Never
  stub Game.save.

## Read discipline (same as w5twokey)

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
  does not consult deedGateReady at all, and the table invitation
  path only reads the same values at its own beats.
- Table-entry and table-entered snapshots are deedGateReady()
  reads captured on the FIRST day the daily snap sees
  tableWaiting true (entry) and the FIRST day it sees tableDone
  true (entered). They are reads of the same pure function, not
  hooks into the table path.

## Definitions (fixed before sweeping)

- TABLE ENTRY (invited): a village whose daily snap ever sees
  tableWaiting true. ENTRY MOMENT = first such day; the entry
  deed snapshot is the deedGateReady() read of that day.
- TABLE ENTERED (sat): a village whose daily snap ever sees
  tableDone true, or whose end tableState carries a seat.
  ENTERED MOMENT = first such day; the entered deed snapshot is
  the deedGateReady() read of that day (if entry and entered fall
  on the same day, both snapshots are that day's read).
- FULL-SEAT-ELIGIBLE entry: barsOnly true at the counted moment
  (i.e. it would hold the full seat under the old ok if scale
  were ignored).
- BLOCKED (counterfactual): full-seat-eligible AND scale false.
- PASS EITHER WAY: full-seat-eligible AND scale true.
- LESSER-SEAT entry: a village whose end tableState.seat is
  'lesser' (or which entered a lesser seat per tableSeat()). These
  are UNAFFECTED by the full-seat scale gate by construction
  (tableSeat() tries full first, then lesser) and are reported as
  their own split, never folded into blocked/pass.
- FULL-SEAT entry taken: end tableState.seat is 'full'. Under the
  enforced code these must all have scale true; the validator
  asserts it (a scale-false full seat would be a gate failure,
  exit 1).

## Pre-registered primary metric (BINDING, MEASUREMENT.md §14)

PRIMARY: the counted scale-vs-ok split on this band.

AUDIT-GO if and only if ALL of:
(a) the instrument reports scale-vs-ok (barsOnly, scale, ok, stage)
    at TABLE ENTRY and at END for every village reaching the table,
    on 8/8 seeds (seeds with no table entry report the absence
    explicitly — a missing entry snapshot on a table-reaching seed
    is an instrument failure, not a zero);
(b) the counted answer is produced: the ENTRY split — among invited
    villages, how many full-seat-eligible entries are BLOCKED
    (barsOnly true, scale false) and how many PASS EITHER WAY
    (barsOnly true, scale true) — plus the LESSER-SEAT entry count
    as its own split;
(c) at least one table entry occurs on the band (see inconclusive
    branch).

INCONCLUSIVE if 0 table entries occur on the band: the instrument
ran clean on 8/8 seeds but the counted answer is vacuous. Report it
as INCONCLUSIVE, do NOT re-screen, do NOT pick new seeds, do NOT
promote the end-state split into the verdict.

The END split (same blocked/pass counting at end-of-run for
table-reaching villages) is reported as a SECONDARY quantity, never
promoted into the verdict mid-run: deeds can move between entry and
end, and the entry moment is what the gate prices.

Secondary quantities (reported, NOT the verdict, never promoted
into it mid-run):
- S1, wall numbers every run needs: national ever/final, table
  invited/entered, wins, full seat, lesser seat, wave-4/5 unlock,
  median survival, deaths, starvation deaths, Arc reach.
- S2, per-seed deed bars at entry, at entered (when it exists),
  and at end: w1..w5 vs 5/5/4/3/2, contestsN vs 3, crisesN vs 3,
  stage (as observed) + stageOk, foodDeeds, scale, barsOnly, ok.
- S3, the full-seat-eligible villages that are NOT blocked: their
  scale rank (national vs global) and which other bars, if any,
  were short at entry.
- S4, the w5twokey comparison columns (same substrate, fresh
  band): national ever, table invited/entered, wins, full/lesser,
  wave-4/5 unlock, median survival — comparison only, no
  re-judging of 74311-74318.

## Design

- PILOT GATE (MEASUREMENT.md §§9-12): 8 seeds, single arm. No
  confirm band is pre-registered: this is a census, not a lever
  test.
- Seeds: 74501-74508 (fresh band). Freshness verified BEFORE
  sweeping: no 7450x filename in evidence/2026-10-27/; word-boundary
  grep of committed evidence/2026-10-27/ finds zero seed hits —
  the only 74503/74701 word matches in the tree are freshKcal
  telemetry values (74503 kcal, 74701 kcal) in unrelated corpora,
  not seeds. Forbidden/used today and avoided: 73601-73608,
  73641-73648, 73661-73668, 73671-73678, 73701-73708, 74001-74008,
  74101-74108, 74111-74122, 74201-74208, 74301-74308, 74311-74318.
- Horizon: 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max per the harness) — NOT a fixed 180d. Why: matches the
  w5twokey band in shape, so wall numbers compare.
- Per-seed daily tracking: gated standing, raw, capped, war/
  diplomacy/plenty, rd5/rd4 bars, w4faced, unlockedWave
  (computed), rank, waveKillLog-derived wave-4 kill/killer counts,
  AND deedGateReady() per day (w1..w5, contestsN, crisesN, rank,
  stage, stageOk, foodDeeds, scale, barsOnly recomputed, ok).
  Entry and entered deed snapshots are captured on their first
  days and carried into the row.
- Proof gates (STOP, not verdict inputs):
  - G1 corpus integrity: 8/8 rows, days > 0, every gate + deed
    field present, no recorder errors; every table-reaching seed
    carries an entry deed snapshot (and an entered snapshot iff
    it entered).
  - G2 deed identity: on every recorded deed snapshot,
    ok == (barsOnly && scale), where barsOnly is recomputed from
    that snapshot's own waves/contests/crises/stageOk/foodDeeds
    fields; a scale-false snapshot with seat 'full' at end is a
    gate failure (exit 1).
  - G3 deed agreement: per-seed deed w4 faced count equals
    waveEngaged(4) at end (both count distinct faced wave-4
    types); deed w-counts never exceed the wavesFaced-derived
    counts in the row's gate.wavesFaced.
  - G4 instrument completeness: the AUDIT-GO counting (entry
    split + lesser split) recomputed from the corpus rows equals
    the summary's count.
- SENSE TEST (SENSE-TESTING LAW): seed by the fixed rule — highest
  gated standing at end; ties by most wave-4 kills, then lowest
  seed. Non-measured narration replay (say/sysSay taps, last 30
  days) read for whether villagers act like people (goals,
  routines, reactions, dialogue) — judged in plain words in the
  evidence. Replay text never enters any count.
- Balanced panel note: scripts/balance-panel.js has NO corpus-
  ingest mode for a single-arm census corpus (grep for
  ingest/corpus in the script: 0 hits; it builds before/after
  panels from two roots). A panel compare will be ATTEMPTED and
  reported honestly if it fails; no panel artifact will be faked.
  Same standing exception as the w5block/w5twokey corpora.
- Telemetry deviation check: per the loop body, run AFTER writing
  evidence (telemetry-check.js vs scale-wall baseline, metrics
  national,table,wins,exiled) and report LOUD lines with verdict;
  do NOT roll the baseline on an unexplained LOUD line.

## Metric review (to be filled at judging time, not before)

- (pending at pre-registration; doubts arising during the run go
  here, and any revision applies to the NEXT run, never this one.)
