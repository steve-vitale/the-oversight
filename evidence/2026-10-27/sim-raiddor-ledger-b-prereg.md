# sim-raiddor-ledger-b — PRE-REGISTRATION (written BEFORE any judged sweep, 2026-10-27)

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raiddor-ledger-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the stockdoors NO-GO, the residualhunt GO,
the residual2b phase-1 NO-GO, or the ledgerbound PILOT GO / CONFIRM-GO —
their verdicts stand in their own evidence. Its verdict is ONLY whether the
family ledgers close under the boundary definition WITH the raid door
wrapped, and whether the two residual2b targets appear as named raid-door
records. Judged ONLY against this prereg.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-residual2b.md + prereg (on master): phase-1 NO-GO
  on corpus-only tracing; phase-2 contingency traced BOTH left-open
  residuals exactly to the unanswered-raid take in villageAgencyDaily —
  `_removePantryKcal(800)` at endDay (Lamb's Quarters dried -800,
  Muscadine 9825 -864). The phase-1 NO-GO stands; phase 2 is the mechanism
  for THIS ledger instrument.
- evidence/2026-10-27/sim-ledgerbound-b.md + prereg (branch
  sim-ledgerbound-b, being landed by the coordinator — NOT touched here):
  boundary-aware ledger re-judge PILOT GO (named 11/12, generic 8/8,
  dried 0.91%) + CONFIRM-GO (named 5/5, generic 12/12, dried 0.36%), zero
  src/js. Boundary definition: closing snapshot after the final day's
  flows settle (end of day 100, after meal draws); day-101 sweeps
  post-horizon and excluded. Its instrument did NOT wrap the raid door.
  Its metric review also says: the confirm named count was small (5
  rows) — a rate bar on 5 rows is weak evidence — and the analyzer's
  leg-2 label prints "/8" even on a 12-seed band (cosmetic).
- evidence/2026-10-27/sim-residualhunt-b.md: the residualhunt corpus
  (seeds 9820-9827, competent-nofeast) and its closing-boundary artifact
  findings.

## PRE-REGISTERED GO (verbatim — judge ONLY against this)

GO iff ALL of (a) pilot band seeds 9820-9827 (identical seeds, pinned-base
reuse — see base rule) closes under the boundary definition WITH the raid
door wrapped: named rate >=80% AND pooled within 1%, generic rate >=80%
AND pooled within 1%, dried pooled within 2%; AND (b) BOTH residual2b
targets appear as named raid-door records exactly: LQ dried -800 and
Muscadine 9825 -864 each equal to a raid-door record sum on their seed (or
decompose exactly with the raid component exact and any remainder itself
itemized); AND (c) a fresh confirm band of >=12 seeds on the same pinned
base meets the same three channel bars, with a named-row minimum: if the
confirm band yields fewer than 8 named family-seed rows, the confirm rate
bar is NOT judged (report pooled bars only + the row count) — do NOT claim
a rate GO on <8 rows, and do NOT lower the threshold mid-run.

A miss on any clause is NO-GO, never re-scored against a friendlier metric
mid-run. If the metric proves wrong, write it under "metric review" and
propose the revision for the NEXT run. A det-gate or coverage failure is
DIAG-NO-GO (instrument, not game). The confirm band never overrides the
pilot verdict; it is reported alongside it.

## Base rule (pinned-base discipline, mandatory)

The reproducing base is the PRE-c04d4e0cb game.js, blob
b2ba423afdfbdce8c98751ef544f10805b46cfa6. Backup the worktree's
src/js/game.js OUTSIDE the repo first
(~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-raiddor-ledger-b/gamejs-backup.js),
verify its hash, swap in the pinned blob, verify its hash, run sweeps +
proof, restore from backup, verify hash + `git diff HEAD -- src/js/game.js`
empty + worktree clean of the pin. The pin is NEVER committed. Corpus
trajectories are pre-c04d4e0cb trajectories and must not be cited as
current-base trajectories. If the pinned blob cannot be retrieved
(git cat-file), FAIL LOUDLY and stop — do not sweep on another base and
call it the same arm.

## Boundary definition (ledgerbound's, plus the raid door)

Ledgerbound boundary, unchanged: closing snapshot taken after the final
day's flows settle (end of day 100, after meal draws), with day-101 sweeps
treated as post-horizon and excluded from the judged ledger. Boundary
closing for a family = corpus closing + day-100 stockSurplus pushes
(Foraged food only) - day-100 meal draws (pantryDraw + drawSpoiled, day
100). Boundary dried closing = corpus dried closing - day-100 dried meal
draws. Boundary flows = NEW-definition flows dated <= 100; flows dated
> 100 are post-horizon and excluded.

RAID-DOOR ADDITION (the only ledger change in this arm): raid-unanswered
draws — `_removePantryKcal` calls whose caller frame is
villageAgencyDaily (the unanswered-raid branch, the only
`_removePantryKcal` call inside villageAgencyDaily) — count as draws in
the boundary ledger (dated <= 100), split base/dried by item name, and
raid-unanswered records dated == the closing-snapshot day (day 100 on
surviving seeds) are post-snapshot: they are subtracted from the boundary
closing (total and dried portion), mirroring the day-100 meal adjustment
(a take after the day-100 snapshot cannot be reflected in it, but is
counted in the flows). All other `_removePantryKcal` callers are recorded
under their own caller paths and reported as a census; they are NOT folded
into the judged legs. A kcal recorded by the raid door must not also
appear in another door's records for the same event (disjointness proven
in the proof: method sets disjoint, plus no shared day/name/spoilDay/units
tuple between raid and direct records).

## Instrument (vendored under NEW raiddor names, zero sibling modifications)

- scripts/sweep-raiddor-ledger-b.js (vendored from ledgerbound's sweep;
  output dir/file prefix, mode string, staging dir, and capture require
  adapted; sweep logic otherwise identical; RAIDDOORS=0 disables ONLY
  the raiddor install for the det-gate control).
- scripts/analyze-raiddor-ledger-b.js (vendored from ledgerbound's
  analyzer; ledger math identical except the raid-door addition above;
  old-boundary and ledgerbound-boundary legs computed on the same corpus
  and reported alongside as controls).
- scripts/test-raiddor-ledger-b.js (proof; see below).
- scripts/trace-raiddor-ledger-b.js (vendored from ledgerbound's trace;
  raid-unanswered draws included in the transition flows).
- scripts/stockdoors-capture-raiddor.js (vendored from ledgerbound's
  stockdoors capture, header adapted, plus the NEW raid installer:
  wraps Game._removePantryKcal with pantry snapshot-diff, records seed,
  day, caller frame, path, asked kcal, returned kcal, and per-item
  units/kcal/spoilDay/foodState).
NEVER modified: any sibling capture file (inflow/mealdraw/spoilvol/
driedpath/stockdoor-capture, ledgerbound files) or any src/js file.

## Policies + horizon + seeds

Policies: competent-nofeast exactly as ledgerbound (COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).
Horizon: 100 days, death-aware (a seed that dies ends early; dead villages
stop simulating).
Pilot: 8 seeds (9820-9827) before ANY confirm spend (pilot gate).
Confirm: 12 fresh seeds, 9870-9881, collision-checked before this prereg
commit: no corpus JSON filenames for these seeds in evidence/2026-10-26/
or evidence/2026-10-27/ corpus dirs, no seed mentions in dated evidence
.md files for these seeds (the only "987x" hits in .md files are
substrings of the pinned blob hash, not seed uses), not present on the
ledgerbound branch, and distinct from spent-but-unjudged 9768-9779 (never
reused as fresh).

## Named-row rule (counting, fixed before judging)

A named family-seed row counts iff its boundary inflow >= 10000 (same
focal filter as ledgerbound/stockdoors). Named set: Lamb's Quarters,
Burdock, Muscadine Grapes, Purslane. Generic set: Foraged food (alone).
Dried pooled: pooled |dried-channel boundary residual with raid door|
across all focal family-seeds, over pooled transformed post-kcal
(boundary definition, dated <= 100). Rate = passing rows / counted rows
within 1% per row. Pooled share = |pooled residual| / pooled inflow
(named/generic) or / pooled transformed post-kcal (dried).

## Proof (must be GREEN on the pinned base before evidence commits)

scripts/test-raiddor-ledger-b.js proves: corpus validity; det-gate
(instrument on vs off byte-identical on non-raid fields + reproduces the
pilot corpus counts); independent leg recomputation (second code path
reproduces the analyzer's pooled residuals, including the raiddor
boundary legs); raid-door disjointness; instrument integrity (raid
record item sums equal returned kcal; no unknown raid caller paths);
hygiene (zero src/js modified vs HEAD apart from the pinned-base
allowance, zero sibling files modified, no modified tracked file outside
this run's own files). The proof runs on both pilot and confirm corpora
(LEDGERBOUND-style corpus-dir env: RAIDDOOR_CORPUS_DIR).

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on both bands — reported honestly
even when 0. Village assessment in plain words. Sense note: at least one
raid-take narration/transcript line quoted if one exists in the corpus
(say-lines or journal), or an explicit statement that the raid take is
silent in the captured transcript (that silence is a finding, not a gap
to fill with invented narration).

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no before/after
to panel. The det-gate is the instrument before/after. If
scripts/balance-panel.js applies to a measurement corpus, the comparison
will be attached; otherwise the evidence file will say so explicitly
instead of forcing it.
