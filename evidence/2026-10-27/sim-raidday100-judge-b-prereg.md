# sim-raidday100-judge-b — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidday100-judge-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, or the day99demand GO — their verdicts stand in their own
evidence. Its verdict is ONLY whether the raiddor post-snapshot raid
adjustment is EXERCISED by the supplied day-100 raid seed 20118 on the
current base, judged against raidday100 GO clauses (b)-(f) with clause
(a) re-verified on this arm's own post-prereg judged sweep. Judged ONLY
against this prereg.

## Backlog claim (recorded here; sim-findings.md edit left for coordinator)

Backlog item (sim-findings.md, 2026-10-27, food-economy/ledger):
"POST-SNAPSHOT RAID ADJUSTMENT UNEXERCISED — the analyzer subtracts raid
takes dated == closing-snapshot day from the boundary closing, but no raid
on either [raiddor] band landed on a closing-snapshot day. A future prereg
needing this leg should pre-register a day-100 raid seed if one can be
found, or keep the adjustment as defense-in-depth and say so."
The day99demand arm SUPPLIED the seed (20118, GO on the seed-supply
metric). This arm claims the judged-analyzer leg on that seed. The
sim-findings.md line edit ([open] -> [claimed ... by
sim-raidday100-judge-b]) is left for the coordinator, per the arm brief;
this prereg is the claim record.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raidday100-b.md + prereg (DIAG-NO-GO, on the
  current base at that time): 40-seed screen 10100-10139, 52 raids, ZERO
  raids dated == closing-snapshot day, latest raid day 99. Its GO
  clauses (a)-(f) are the source of this arm's GO, adapted below:
  (a) a surviving day-100 raid seed; (b) the day-100 raid touches a
  focal row; (c) touched rows close WITH the adjustment (1%); (d)
  WITHOUT the adjustment the same rows are off by exactly the raid
  amount; (e) pooled focal channels close WITH the adjustment under
  the raiddor bars; (f) proof GREEN on the judged corpus including
  the det-gate. Those seeds are SPENT and are never re-screened here.
- evidence/2026-10-27/sim-day99demand-b.md + prereg (GO, seed supplied):
  seed 20118, competent-nofeast, 100d death-aware, survived 100d, rank
  village, wave 2; demand day 99 from Andre of Thornfield, ~2,000 kcal
  spoken ask; take day 100: asked 800, Canned soup 4u x 250 = 1,000 kcal
  via villageAgencyDaily, dated == lastSnapDay day 100 — i.e. raid100
  = 1,000, dried portion raid100D = 0 (the take is all Canned soup,
  foodState null). Tracefull replay reproduces the hit exactly; the
  plain recorder diverges (suppression finding) — disclosed, never
  hidden, and never a GO override (see "Recorder fidelity" below).
- evidence/2026-10-27/sim-raiddor-ledger-b.md + prereg (GO, on the
  PRE-c04d4e0cb pinned base): focal filter (named Lamb's Quarters,
  Burdock, Muscadine Grapes, Purslane; generic Foraged food; row counts
  iff boundary inflow >= 10000) and pooled bars (named/generic
  |residual|/inflow <= 1%, dried pooled <= 2%). Raiddor trajectories
  are NOT cited as current-base trajectories.

## Closing-snapshot day — exact definition (as in raidday100)

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

- TOUCHES: a family-seed row is TOUCHED by the day-100 raid iff the
  analyzer's raid aggregation for that row's family has raid100 > 0 —
  i.e. at least one raid-unanswered item dated == lastSnapDay maps to
  that family via famOf (the item name with a trailing " (dried)" /
  " (smoked)" stripped). The take's items decide this, not the
  narration: a Canned soup take touches the Canned soup row, not a
  focal row; a Foraged food (dried) take touches the Foraged food row.
- FOCAL SET: named {Lamb's Quarters, Burdock, Muscadine Grapes,
  Purslane} + generic {Foraged food}. A focal row COUNTS iff its
  boundary inflow >= 10000 (the raiddor focal filter). Rows below the
  filter are reported, never counted.
- COUNTED-ROW FIGURES: per-row rBResidual / rBResidualShare come from
  the vendored judge analyzer's raid-door legs (leg3r/leg4r rows);
  the with/without identity comes from the proof's independent
  section-3d recomputation (second code path, from raw records).
- POOLED FIGURES: named pooled = analyzer leg3r pooledResid /
  pooledInflow over counted named rows; generic pooled = leg4r
  pooledResid / pooledInflow over counted generic rows; dried pooled
  = leg5r pooledDriedResid / totPost (pooled transformed post-kcal).
  "Where counted rows exist" means: a pooled bar is judged only if
  >= 1 row of that channel is counted on the judged seed; a channel
  with zero counted rows is reported as n/a, never as a pass.
- DEMAND / TAKE (as in day99demand): a DEMAND is a treeline staging
  line in raidSayLines containing "Shouts from the treeline", dated
  by the scholar day at say time; a TAKE is a raidRecord
  (raid-unanswered, caller villageAgencyDaily) dated by the capture
  at _removePantryKcal time.

## PRE-REGISTERED GO (verbatim adapted from raidday100 clauses (b)-(f), plus clause (a) re-verification)

GO iff ALL of:
(a) RE-VERIFIED on this arm's own post-prereg judged sweep of seed
20118 (not assumed from the day99demand screen): daysAlive == 100,
lastSnapDay == 100, a demand dated 99, AND a take dated 100. If the
judged sweep does not itself show all four, the verdict is
DIAG-NO-GO (instrument mismatch — the supplied hit did not reproduce
under the judging instrument), not a pass and not a game verdict;
AND
(b) on the judged sweep, the day-100 raid touches at least one focal
family-seed row (TOUCHES as defined above; counted rows only — a
touched row below the inflow filter does not satisfy (b)); AND
(c) every focal row touched by the day-100 raid closes WITH the
adjustment: |rBResidual| / boundary inflow <= 1% (named and generic
rows alike); AND
(d) WITHOUT the adjustment the same rows are off by exactly the
day-100 raid amount: for every counted focal row, (residual WITHOUT
the post-snapshot subtraction, raid draws still counted) - (residual
WITH it) == raid100 for that family (total channel), and the
dried-channel difference == raid100D — i.e. the leg was exercised,
not vacuous; AND
(e) the pooled focal channels on the judged seed close WITH the
adjustment under the raiddor bars where counted rows exist: named
pooled |residual| / pooled inflow <= 1% (if >= 1 named row counted),
generic pooled <= 1% (if >= 1 generic row counted), dried pooled
|residual| / pooled transformed post-kcal <= 2%; AND
(f) the proof (scripts/test-raidday100-judge-b.js) is GREEN on the
judged corpus, including the det-gate (instrument on vs off
byte-identical on non-raid fields).

Verdict vocabulary (fixed here, not chosen after seeing numbers):
- GO: all of (a)-(f) pass.
- NO-GO: clause (a) verified, but any of (b)-(f) fails. A miss on any
  clause is NO-GO, never re-scored against a friendlier metric
  mid-run.
- DIAG-NO-GO: clause (a) fails on the judged sweep (instrument
  mismatch), or the det-gate / coverage instrument fails. An
  instrument failure is never a game verdict.
- PARTIAL: NOT APPLICABLE to this arm. There is no death-day leg
  here: a judged sweep that dies early or snapshots before day 100
  is a clause (a) failure (DIAG-NO-GO), not a partial exercise.

## Vacuity rules + exercise record (fixed here so a vacuous pass is impossible)

- (c) and (d) are judged over focal rows. If ZERO focal rows are
  touched, (c) holds vacuously (no touched row to fail it) and (d)
  holds vacuously on focal rows (raid100 == 0 on every focal row, so
  the with/without difference is 0 == 0) — but (b) FAILS, so the
  verdict is NO-GO regardless. Vacuous (c)/(d) never rescue a (b)
  miss, and the evidence file must label them VACUOUS, not PASS,
  when zero focal rows are touched.
- EXERCISE RECORD (observation, NEVER a GO input): the evidence file
  reports, for every family row the day-100 raid actually touches
  (focal or not — e.g. the taken item's row), its boundary inflow,
  raid100 / raid100D, residual WITH the adjustment, and residual
  WITHOUT it. If the taken-item row is off by exactly raid100
  WITHOUT the adjustment and closes WITH it, that is reported as
  "adjustment exercised on a non-focal row" — an observation for the
  NEXT run's metric revision, not a satisfaction of (b), (c), or (d).
  Nothing in this paragraph converts a (b) miss into a pass.
- The proof's section-3d checks encode (b)/(c)/(d) as written: a
  touched-row failure in the proof is a clause (b)/(c) failure, and
  therefore a clause (f) failure as well. That double-counting is
  intended (the proof is faithful, not a rubber stamp), and the
  evidence file reports it as such rather than re-scoring (f)
  separately.

## Judged sweep (single seed, post-prereg, nothing else judged)

- Seed: 20118 ONLY. No screen, no confirm band: this arm judges one
  exercised leg on one supplied seed, not a population rate.
- Instrument/policy/horizon: the vendored judge sweep (below), same
  instrument class as the day99demand screen (competent-nofeast:
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 off; 100d death-aware). The judged sweep runs AFTER
  this prereg commit, into
  evidence/2026-10-27/sim-raidday100-judge-b-corpus/ (file prefix
  raidday100-judge-b-competent-nofeast-s20118.json). The day99demand
  screen corpus file for 20118 is a SUPPLY record, not the judged
  corpus: only the post-prereg judged sweep is judged, even if the
  two files agree byte-for-byte apart from `ms` and mode.
- Analyzer: scripts/analyze-raidday100-judge-b.js run on the judged
  corpus dir (output saved as
  evidence/2026-10-27/sim-raidday100-judge-b-analyzer.log).
- Proof: scripts/test-raidday100-judge-b.js run on the judged
  corpus (output saved as
  evidence/2026-10-27/sim-raidday100-judge-b-proof.log). The proof
  must be GREEN for clause (f); a proof failure on any check other
  than the section-3d exercise checks is an instrument failure
  (DIAG-NO-GO), reported loudly.

## Recorder fidelity (stated explicitly — the suppression finding)

- The sweep instrument's death wrapper SUPPRESSES the original
  Game.registerDeath (records deaths into its own array, never calls
  the original) — exactly as the day99demand prereg proved. The
  judged trajectory is therefore a SWEEP-INSTRUMENT trajectory, NOT
  a plain-game trajectory, and is never cited as such.
- The day99demand plain-recorder run on 20118 diverged completely
  (demandDays [], takeDays []), while TRACE_FULL faithful replay
  reproduced the hit exactly. This arm does NOT re-run the plain
  recorder as a GO input: the deliverable is judged under the sweep
  instrument the analyzer reads. The divergence is disclosed in the
  evidence file as a reported leg, never a GO override, and never
  hidden. Within-instrument comparisons stay apples-to-apples (the
  suppression is present in every sweep run identically).
- Whether to fix the sweep to call through to the original
  registerDeath remains a coordinator/Steve call (it would change
  every future sweep trajectory) and is NOT done here.

## Base rule (NO pin — current worktree HEAD at prereg time)

Base: current worktree HEAD at prereg time:
b353f3817 (branch sim-raidday100-judge-b; includes the day99demand
commits). NO base pin: raiddor's pin was pre-c04d4e0cb and its
trajectories must not be cited as current-base. If the worktree HEAD
moves between prereg and judged sweep, report the move; do not
silently sweep on a new base and call it the prereg base. Zero src/js
files modified at prereg time (git status clean except this run's
own new files).

## Instrument (vendored under NEW raidday100-judge names, zero sibling modifications)

- scripts/sweep-raidday100-judge-b.js (vendored from
  sweep-raidday100-b.js; output dir/file prefix, mode string, staging
  dir, capture require adapted; sweep logic otherwise identical).
- scripts/analyze-raidday100-judge-b.js (vendored from
  analyze-raidday100-b.js; default corpus dir adapted; ledger math
  byte-identical, including the post-snapshot adjustment).
- scripts/test-raidday100-judge-b.js (proof; vendored from
  test-raidday100-b.js; corpus dir + env names, sweep script name,
  allowed-modified set adapted for judge files; the sibling-modified
  list additionally includes the raidday100 files themselves, which
  must NOT be modified by this arm; the computeLegs require still
  reads the raiddor analyzer (read-only, unmodified) exactly as the
  raidday100 proof did — requiring a file is not modifying it).
- scripts/trace-raidday100-judge-b.js (vendored from
  trace-raidday100-b.js; used for row traces in evidence).
- scripts/stockdoors-capture-raidday100-judge.js (vendored from
  stockdoors-capture-raidday100.js; internal raid field names
  raidRecords/raiddorOn and the RAIDDOORS env name retained for
  analyzer compatibility — only filenames, corpus dir, file prefix,
  mode string, staging dir, and capture require changed).
- NEVER modified: any sibling capture file (inflow/mealdraw/
  spoilvol/driedpath/stockdoor-capture, ledgerbound files, raiddor
  files, raidday100 files, day99demand files) or any src/js file.
  Leg-2 coverage is NOT applicable to a 1-seed corpus and is not
  part of this arm's GO (as raidday100 stated); the analyzer's leg-2
  line is reported as observation only.

## Policies + horizon + seeds (restated for the judged sweep)

Policies: competent-nofeast exactly as raidday100/day99demand
(COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
FEASTSCALE_R13 off). Any env mismatch is FATAL in the sweep.
Horizon: 100 days, death-aware (a seed that dies ends early; dead
villages stop simulating; +10d tail max — not applicable here, the
instrument stops at death).
Judged sweep: seed 20118 only, after this prereg commit, into
evidence/2026-10-27/sim-raidday100-judge-b-corpus/.

## Named-row rule (counting, fixed before judging)

A named/generic family-seed row counts iff its boundary inflow >=
10000 (raiddor focal filter). Named set: Lamb's Quarters, Burdock,
Muscadine Grapes, Purslane. Generic set: Foraged food (alone).
Dried pooled: pooled |dried-channel boundary residual with raid door|
across all focal family-seeds, over pooled transformed post-kcal
(boundary definition, dated <= 100). Rate/share definitions as in
raiddor.

## Proof (must be GREEN on the judged corpus for clause (f))

scripts/test-raidday100-judge-b.js proves: corpus validity
(single-seed judged corpus: policy, stockdoorsOn + raiddorOn, no
truncation, all 7 direct methods wrapped, raid fields present);
det-gate (instrument on vs off byte-identical on non-raid fields +
reproduces the judged corpus counts on the judged seed, seed taken
from the first corpus file); independent leg recomputation (second
code path reproduces the analyzer's pooled residuals, including the
raiddor boundary legs); day-100 exercise (section 3d: day-100 raid
present on a surviving seed, touched focal rows close with the
adjustment, without-adjustment residuals differ by exactly raid100
/ raid100D per focal row); raid-door disjointness; instrument
integrity (raid record item sums equal returned kcal; no unknown
raid caller paths); hygiene (zero src/js modified, zero sibling
files modified — including raidday100 and raiddor files — no modified
tracked file outside this run's own files).

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on the judged seed — reported
honestly even when 0. Village assessment in plain words. Sense note:
the day-99 demand line and day-100 take line are quoted from the
judged corpus and checked against the ledger record (numbers must
match, as raiddor's and raidday100's did), or an explicit statement
that the raid take is silent in the captured transcript.

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no
before/after to panel — exactly as raidday100 and day99demand stated.
The det-gate (instrument on vs off, byte-identical on non-raid
fields) plus the with/without-adjustment recomputation is the
instrument before/after. Not forced, not faked.

## Metric review (required in the evidence file)

The evidence file carries a "metric review" section (MEASUREMENT.md
§14): whether the pre-registered metric worked as written, what (if
anything) it proved wrong about, and the proposed revision for the
NEXT run. A metric doubt is never a mid-run re-score.
