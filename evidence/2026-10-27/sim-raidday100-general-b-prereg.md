# sim-raidday100-general-b — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidday100-general-b.
Backlog line 1224 (food-economy/ledger): POST-SNAPSHOT RAID ADJUSTMENT
UNEXERCISED under the focal formulation.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, the day99demand GO, or the raidday100-judge-b NO-GO — their
verdicts stand in their own evidence. Its verdict is ONLY whether the
raiddor post-snapshot raid adjustment is EXERCISED by seed 20118 under
the GENERALIZED clauses below (focal-or-taken), on a FRESH post-prereg
judged sweep. Judged ONLY against this prereg.

## Why a new prereg (the generalization, stated before any new numbers)

The raidday100-judge-b run (evidence/2026-10-27/sim-raidday100-judge-b.md,
NO-GO under the focal formulation) found the adjustment exercised in
substance on the row the take actually touches — Canned soup, off by
exactly 1,000 WITHOUT the adjustment, closed exactly WITH it — but that
row is not a focal row, so the focal formulation of clause (b) could not
see it: zero focal rows touched, clauses (c)/(d) vacuous on focal rows,
clause (f) failed on the proof's section-3d touched-row checks. This
prereg generalizes the GO clauses to focal-or-taken: the taken-item row
counts toward clause (b) and toward the corresponding closure clauses
(c)/(d). NOTHING in this prereg re-scores the 1330Z judged corpus from
the judge-b run against the new wording. The judge-b corpus is a closed
record under the old prereg; this arm runs a FRESH judged sweep of seed
20118 under this prereg and judges ONLY that fresh corpus. If the fresh
sweep's numbers differ from the old corpus's, the fresh numbers govern
and the difference is reported loudly.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raidday100-judge-b.md + prereg (NO-GO, focal
  formulation, on the current base at that time): judged sweep of 20118
  (competent-nofeast, 100d): daysAlive 100, lastSnapDay 100, demand
  day 99 from Andre of Thornfield, take day 100: asked 800, Canned soup
  4u x 250 = 1,000 kcal via villageAgencyDaily, dated == lastSnapDay.
  Counted focal rows on 20118: Muscadine Grapes (named, inflow 15,660)
  and Foraged food (generic, inflow 382,626), both raid100 = 0. Taken
  row (exercise record, not a GO input under that prereg): Canned soup,
  boundary inflow 0, bClosing 7,500, rBClosing 6,500, raid100 = 1,000,
  raid100D = 0, rBResidual WITH = 0, WITHOUT = +1,000, difference
  exactly raid100. Pooled focal channels WITH: named 0.000%, generic
  0.050%, dried 0.00% — all under the raiddor bars.
- evidence/2026-10-27/sim-day99demand-b.md + prereg (GO, seed supplied):
  seed 20118 supplies the day-99 demand / day-100 take pair. The plain
  recorder diverges on 20118 (demandDays [], takeDays []); faithful
  TRACE_FULL replay reproduces the hit exactly (demandDays [99],
  takeDays [100]). See "Recorder fidelity" below — the divergence is
  disclosed, never hidden, never a GO override.
- evidence/2026-10-27/sim-raidday100-b.md + prereg (DIAG-NO-GO): source
  of clauses (a)-(f), adapted here. Its seeds are SPENT and never
  re-screened here.
- evidence/2026-10-27/sim-raiddor-ledger-b.md + prereg (GO, on the
  PRE-c04d4e0cb pinned base): focal filter and pooled bars. Raiddor
  trajectories are NOT cited as current-base trajectories.

## Closing-snapshot day — exact definition (unchanged from raidday100)

"Closing-snapshot day" means the day of the LAST spoilDays snapshot in a
seed's corpus file (analyzer variable lastSnapDay = last spoilDays
entry's day). On a seed that survives the horizon it is day 100: the
corpus closing is that day's spoilDays snapshot, and the boundary
closing is that closing + day-100 stockSurplus pushes - day-100 meal
draws (pantryDraw + drawSpoiled, day 100).

POST-SNAPSHOT RAID ADJUSTMENT — exactly: a raid-unanswered record
dated == lastSnapDay is counted as a draw in the boundary flows (dated
<= 100) AND subtracted from the boundary closing (total channel and
dried portion): rBClosing = bClosing - raid100, rBClosingDried =
bClosingDried - raid100D, where raid100 / raid100D are the
day-==lastSnapDay raid-unanswered kcal (total / dried-portion) for
that family. Rationale, as in raiddor: the take happens after the
closing snapshot is taken, so the snapshot does not reflect it, but
the flows count it — without the subtraction the residual is
overstated by exactly the raid amount. All other _removePantryKcal
callers are census only, never folded into the judged legs.

## Definitions (fixed before judging — read the analyzer first)

- TOUCHES (generalized): a family row is TOUCHED by the day-100 raid
  iff the analyzer's raid aggregation for that family has raid100 > 0
  — i.e. at least one raid-unanswered item dated == lastSnapDay maps
  to that family via famOf (the item name with a trailing " (dried)" /
  " (smoked)" stripped). The take's items decide this, not the
  narration: a Canned soup take touches the Canned soup row; a
  Foraged food (dried) take touches the Foraged food row.
- FOCAL SET: named {Lamb's Quarters, Burdock, Muscadine Grapes,
  Purslane} + generic {Foraged food}. A focal row COUNTS iff its
  boundary inflow >= 10000 (the raiddor focal filter). Rows below the
  filter are reported, never counted as focal.
- TAKEN-ITEM ROW: the family row of an item in the day-100 take
  (raid-unanswered, dated == lastSnapDay), whatever its focal status
  and whatever its boundary inflow — including inflow 0 (a
  starting-stock take, as on 20118). A taken-item row counts toward
  (b), (c), and (d) even when it is not a focal row and even when it
  is below the inflow filter. If the take spans several families, each
  touched family is a taken-item row.
- FOCAL-OR-TAKEN ROW: a row that is either focal-counted or a
  taken-item row. Clauses (b), (c), (d) are judged over
  focal-or-taken rows. Focal rows that are NOT touched (raid100 = 0)
  are not judged under (c)/(d) — they are the (e) control pool, not
  exercise rows.
- COUNTED-ROW FIGURES: per-row rBResidual / rBResidualShare come from
  the vendored general analyzer's raid-door legs (leg3r/leg4r rows
  for focal rows; the proof's independent section-3d recomputation
  for taken rows, which the analyzer also carries as a family row);
  the with/without identity comes from the proof's independent
  section-3d recomputation (second code path, from raw records).
- POOLED FIGURES (clause (e), focal only — see below): named pooled =
  analyzer leg3r pooledResid / pooledInflow over counted named rows;
  generic pooled = leg4r pooledResid / pooledInflow over counted
  generic rows; dried pooled = leg5r pooledDriedResid / totPost
  (pooled transformed post-kcal). "Where counted rows exist" means: a
  pooled bar is judged only if >= 1 row of that channel is counted on
  the judged seed; a channel with zero counted rows is reported as
  n/a, never as a pass.
- DEMAND / TAKE (as in day99demand): a DEMAND is a treeline staging
  line in raidSayLines containing "Shouts from the treeline", dated
  by the scholar day at say time; a TAKE is a raidRecord
  (raid-unanswered, caller villageAgencyDaily) dated by the capture
  at _removePantryKcal time.

## PRE-REGISTERED GO (generalized clauses)

GO iff ALL of:
(a) RE-VERIFIED on this arm's own post-prereg FRESH judged sweep of seed
20118 (not assumed from the day99demand screen and not borrowed from
the judge-b judged corpus): daysAlive == 100, lastSnapDay == 100, a
demand dated 99, AND a take dated 100. If the fresh judged sweep does
not itself show all four, the verdict is DIAG-NO-GO (instrument
mismatch — the supplied hit did not reproduce under the judging
instrument), not a pass and not a game verdict; AND
(b) on the fresh judged sweep, the day-100 raid touches at least one
focal-or-taken family row (TOUCHES as defined above; the touched row
must exist in the analyzer's family map with raid100 > 0). HONEST
READING, fixed here: under this wording (b) is satisfied by the taken
row itself whenever a day-100 take is recorded and mapped — the
discriminating work moves to (c) and (d), which is the point of the
generalization: the old (b) asked "did the take reach a focal item",
the new (b) asks "did the take reach a ledger row at all", and (c)/(d)
ask "does that row close exactly". A (b) pass must never be reported
without its (c)/(d) numbers beside it; AND
(c) every focal-or-taken row touched by the day-100 raid closes WITH
the adjustment: for a focal-counted row, |rBResidual| / boundary
inflow <= 1% (named and generic rows alike); for a taken row below the
inflow filter (including boundary inflow 0, where no share is defined),
rBResidual === 0 EXACTLY on the total channel — the taken row closes
exactly with the adjustment, not approximately. (A taken row that is
also focal-counted is judged by the 1% share rule, not the exact-0
rule; the two rules never both apply to one row.) AND
(d) WITHOUT the adjustment the same rows are off by exactly the
day-100 raid amount: for every touched focal-or-taken row, (residual
WITHOUT the post-snapshot subtraction, raid draws still counted) -
(residual WITH it) == raid100 for that family (total channel), and
the dried-channel difference == raid100D — i.e. the leg was exercised,
not vacuous; AND
(e) the pooled FOCAL channels on the fresh judged seed close WITH the
adjustment under the raiddor bars where counted rows exist: named
pooled |residual| / pooled inflow <= 1% (if >= 1 named row counted),
generic pooled <= 1% (if >= 1 generic row counted), dried pooled
|residual| / pooled transformed post-kcal <= 2%. The taken row is NOT
pooled into the focal pools (it is not a focal row, and at inflow 0
it has no share) — (e) is the focal control, unchanged from
raidday100-judge-b, and it must still pass on its own numbers; AND
(f) the proof (scripts/test-raidday100-general-b.js) is GREEN on the
fresh judged corpus, including the det-gate (instrument on vs off
byte-identical on non-raid fields). The proof's section 3d encodes
(b)/(c)/(d) as generalized above: a touched-row failure in the proof
is a clause (b)/(c) failure, and therefore a clause (f) failure as
well. That double-counting is intended (the proof is faithful, not a
rubber stamp), and the evidence file reports it as such rather than
re-scoring (f) separately.

Verdict vocabulary (fixed here, not chosen after seeing numbers):
- GO: all of (a)-(f) pass.
- NO-GO: clause (a) verified, but any of (b)-(f) fails. A miss on any
  clause is NO-GO, never re-scored against a friendlier metric
  mid-run.
- DIAG-NO-GO: clause (a) fails on the fresh judged sweep (instrument
  mismatch), or the det-gate / coverage instrument fails. An
  instrument failure is never a game verdict.
- PARTIAL: NOT APPLICABLE to this arm. There is no death-day leg
  here: a fresh judged sweep that dies early or snapshots before day
  100 is a clause (a) failure (DIAG-NO-GO), not a partial exercise.

## Vacuity rules (fixed here so a vacuous pass is impossible)

- (c) and (d) are judged over touched focal-or-taken rows. If ZERO
  rows are touched, (c) holds vacuously (no touched row to fail it)
  and (d) holds vacuously on touched rows — but (b) FAILS, so the
  verdict is NO-GO regardless. Vacuous (c)/(d) never rescue a (b)
  miss, and the evidence file must label them VACUOUS, not PASS,
  when zero rows are touched. (With a take present, zero touched rows
  would mean the analyzer failed to map the take to any family row —
  an instrument finding, reported as such alongside the (b) miss.)
- Focal rows that are NOT touched are reported in the per-row table
  with raid100 = 0 and are NOT (c)/(d) inputs: their with/without
  identity (0 == 0) is trivial and must not be presented as exercise.
- The proof's section-3d checks encode (b)/(c)/(d) as written,
  including the non-vacuity requirement that the WITHOUT-identity
  check requires touched.length >= 1 (a vacuous identity on an empty
  touched set does not pass section 3d).

## What must hold, clause by clause, on focal rows vs taken rows

- Focal-counted rows, touched: (c) 1% share bar, (d) exact identity.
  Focal-counted rows, untouched: (e) pooled control only; never
  (c)/(d) inputs.
- Taken rows (any inflow, focal or not): (b) counted, (c) 1% share
  if focal-counted else exact-0 total residual, (d) exact identity
  (total + dried).
- Clause (e): focal pools only, taken row excluded, bars unchanged
  (1% / 1% / 2%).
- Clause (f): proof green on the fresh corpus, section 3d in the
  generalized form, det-gate included.

## Judged sweep (single seed, post-prereg, nothing else judged)

- Seed: 20118 ONLY. No screen, no confirm band: this arm judges one
  exercised leg on one supplied seed, not a population rate.
- Instrument/policy/horizon: the vendored general sweep (below), same
  instrument class as the day99demand screen and the judge-b judged
  sweep (competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off; 100d death-aware).
  The judged sweep runs AFTER this prereg commit, into
  evidence/2026-10-27/sim-raidday100-general-b-corpus/ (file prefix
  raidday100-general-b-competent-nofeast-s20118.json). The day99demand
  screen corpus file for 20118 is a SUPPLY record, not the judged
  corpus; the judge-b judged corpus is a CLOSED record under the old
  prereg, not the judged corpus. Only the post-prereg fresh sweep is
  judged, even if the three files agree byte-for-byte apart from `ms`
  and mode.
- Analyzer: scripts/analyze-raidday100-general-b.js run on the fresh
  judged corpus dir (output saved as
  evidence/2026-10-27/sim-raidday100-general-b-analyzer.log).
- Proof: scripts/test-raidday100-general-b.js run on the fresh judged
  corpus (output saved as
  evidence/2026-10-27/sim-raidday100-general-b-proof.log). The proof
  must be GREEN for clause (f); a proof failure on any check other
  than the section-3d exercise checks is an instrument failure
  (DIAG-NO-GO), reported loudly.
- Corroboration (NOT a GO input): the general row trace
  (scripts/trace-raidday100-general-b.js) on the fresh corpus for the
  taken family, showing the persistent divergence at the day-99 ->
  day-100 transition, as judge-b did.

## Recorder fidelity (stated explicitly — the suppression finding)

- The sweep instrument's death wrapper SUPPRESSES the original
  Game.registerDeath (records deaths into its own array, never calls
  the original) — exactly as the day99demand prereg proved. The
  judged trajectory is therefore a SWEEP-INSTRUMENT trajectory, NOT
  a plain-game trajectory, and is never cited as such.
- The day99demand plain-recorder run on 20118 diverged completely
  (demandDays [], takeDays []), because the suppression shifts the
  RNG stream from the first death onward, and 20118's first death is
  day 7. The plain recorder is NOT re-run as a GO input here: the
  deliverable is judged under the sweep instrument the analyzer
  reads. The divergence is disclosed in the evidence file as a
  reported leg, never a GO override, and never hidden.
- Faithful TRACE_FULL replication is the fidelity anchor: the
  day99demand run's TRACE_FULL=1 replay of seed 20118
  (scripts/trace-day100raid-code-b.js, unmodified sibling file)
  reproduced demandDays [99] / takeDays [100] exactly. This arm
  re-runs that TRACE_FULL replay as a corroboration leg on the fresh
  run (output saved alongside the evidence) and reports whether it
  still reproduces — but the replay is NOT a GO input and does NOT
  substitute for the fresh judged sweep. Within-instrument
  comparisons stay apples-to-apples (the suppression is present in
  every sweep run identically).
- Whether to fix the sweep to call through to the original
  registerDeath remains a coordinator/Steve call (it would change
  every future sweep trajectory) and is NOT done here.

## Base rule (NO pin — current worktree HEAD at prereg time)

Base: current worktree HEAD at prereg time:
60e260dc007b5ee5cb4247d00699faefa082a3c2 (branch
sim-raidday100-general-b). NO base pin: raiddor's pin was
pre-c04d4e0cb and its trajectories must not be cited as
current-base. If the worktree HEAD moves between prereg and judged
sweep, report the move; do not silently sweep on a new base and call
it the prereg base. Zero src/js files modified at prereg time (git
status clean except this run's own new files).

## Instrument (vendored under NEW raidday100-general names, zero sibling modifications)

- scripts/sweep-raidday100-general-b.js (vendored from
  sweep-raidday100-judge-b.js; output dir/file prefix, mode string,
  staging dir, capture require adapted; sweep logic otherwise
  identical).
- scripts/analyze-raidday100-general-b.js (vendored from
  analyze-raidday100-judge-b.js; default corpus dir adapted; ledger
  math byte-identical, including the post-snapshot adjustment).
- scripts/test-raidday100-general-b.js (proof; vendored from
  test-raidday100-judge-b.js; corpus dir + env names, sweep script
  name, allowed-modified set adapted for general files; the
  sibling-modified list additionally includes the raidday100-judge-b
  files themselves, which must NOT be modified by this arm; section
  3d REWRITTEN for the focal-or-taken touched set — focal-counted
  rows within 1%, taken rows below the filter exactly 0, WITHOUT
  identity over touched rows with a non-vacuity requirement; the
  computeLegs require still reads the raiddor analyzer (read-only,
  unmodified) exactly as the judge proof did — requiring a file is
  not modifying it).
- scripts/trace-raidday100-general-b.js (vendored from
  trace-raidday100-judge-b.js; used for row traces in evidence).
- scripts/stockdoors-capture-raidday100-general.js (vendored from
  stockdoors-capture-raidday100-judge.js; internal raid field names
  raidRecords/raiddorOn and the RAIDDOORS env name retained for
  analyzer compatibility — only filenames, corpus dir, file prefix,
  mode string, staging dir, and capture require changed).
- NEVER modified: any sibling capture file (inflow/mealdraw/
  spoilvol/driedpath/stockdoor-capture, ledgerbound, raiddor,
  raidday100, day99demand, raidday100-judge-b files) or any src/js
  file. Leg-2 coverage is NOT applicable to a 1-seed corpus and is
  not part of this arm's GO (as raidday100 stated); the analyzer's
  leg-2 line is reported as observation only.

## Policies + horizon + seeds (restated for the judged sweep)

Policies: competent-nofeast exactly as raidday100/day99demand/judge-b
(COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
FEASTSCALE_R13 off). Any env mismatch is FATAL in the sweep.
Horizon: 100 days, death-aware (a seed that dies ends early; dead
villages stop simulating; +10d tail max — not applicable here, the
instrument stops at death).
Judged sweep: seed 20118 only, after this prereg commit, into
evidence/2026-10-27/sim-raidday100-general-b-corpus/.

## Named-row rule (counting, fixed before judging)

A named/generic family-seed row counts as FOCAL iff its boundary
inflow >= 10000 (raiddor focal filter). Named set: Lamb's Quarters,
Burdock, Muscadine Grapes, Purslane. Generic set: Foraged food
(alone). A taken-item row counts regardless of inflow. Dried pooled:
pooled |dried-channel boundary residual with raid door| across all
focal family-seeds, over pooled transformed post-kcal (boundary
definition, dated <= 100). Rate/share definitions as in raiddor.

## Proof (must be GREEN on the fresh judged corpus for clause (f))

scripts/test-raidday100-general-b.js proves: corpus validity
(single-seed judged corpus: policy, stockdoorsOn + raiddorOn, no
truncation, all 7 direct methods wrapped, raid fields present);
det-gate (instrument on vs off byte-identical on non-raid fields +
reproduces the judged corpus counts on the judged seed, seed taken
from the first corpus file); independent leg recomputation (second
code path reproduces the analyzer's pooled residuals, including the
raiddor boundary legs); day-100 exercise in the GENERALIZED form
(section 3d: day-100 raid present on a surviving seed, touched
focal-or-taken rows close with the adjustment — focal-counted within
1%, taken rows below the filter exactly 0 — without-adjustment
residuals differ by exactly raid100 / raid100D per touched row, with
touched.length >= 1 required so the identity cannot pass vacuously);
raid-door disjointness; instrument integrity (raid record item sums
equal returned kcal; no unknown raid caller paths); hygiene (zero
src/js modified, zero sibling files modified — including raidday100,
day99demand, and raidday100-judge-b files — no modified tracked file
outside this run's own files).

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on the judged seed — reported
honestly even when 0. Village assessment in plain words. Sense note:
the day-99 demand line and day-100 take line are quoted from the
fresh judged corpus and checked against the ledger record (numbers
must match, as raiddor's, raidday100's, day99demand's, and judge-b's
did), or an explicit statement that the raid take is silent in the
captured transcript. The spoken "~2,000 kcal" is the ASK as spoken,
not the take: the adjustment amount is raid100 = the recorded take
(1,000 on the judge-b corpus; the fresh corpus governs here).

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no
before/after to panel — exactly as raidday100, day99demand, and
judge-b stated. The det-gate (instrument on vs off, byte-identical
on non-raid fields) plus the with/without-adjustment recomputation
is the instrument before/after. Not forced, not faked.

## Metric review (required in the evidence file)

The evidence file carries a "metric review" section (MEASUREMENT.md
§14): whether the pre-registered metric worked as written, what (if
anything) it proved wrong about, and the proposed revision for the
NEXT run. A metric doubt is never a mid-run re-score. The evidence
file also carries, as notes only, any new out-of-scope gaps for the
findings backlog — this arm does NOT edit goal hidden_files itself.
