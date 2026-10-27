# sim-raidday100-b — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidday100-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the ledgerbound GO, or
any earlier verdict — their verdicts stand in their own evidence. Its
verdict is ONLY whether the raiddor post-snapshot raid adjustment is
EXERCISED by a day-100 raid seed on the current base, and whether the
judged ledger closes with it and is off by exactly the raid amount
without it. Judged ONLY against this prereg.

## Backlog claim (recorded here; sim-findings.md edit left for coordinator)

Backlog item (sim-findings.md, 2026-10-27, food-economy/ledger):
"POST-SNAPSHOT RAID ADJUSTMENT UNEXERCISED — the analyzer subtracts raid
takes dated == closing-snapshot day from the boundary closing, but no raid
on either [raiddor] band landed on a closing-snapshot day. A future prereg
needing this leg should pre-register a day-100 raid seed if one can be
found, or keep the adjustment as defense-in-depth and say so."
This arm claims that item. The sim-findings.md line edit ([open] ->
[claimed ... by sim-raidday100-b]) is left for the coordinator, per the
arm brief; this prereg is the claim record.

## Context (read before designing; verdicts not re-judged)

- evidence/2026-10-27/sim-raiddor-ledger-b.md + prereg (GO, on the
  PRE-c04d4e0cb pinned base): the raid door wraps _removePantryKcal;
  pilot 9820-9827 closes named 12/12, generic 8/8, dried 0.65%; confirm
  9870-9881 closes named 8/8, generic 12/12, dried 0.34%; both residual2b
  targets appear as named raid-door records exactly. Its metric review
  states the post-snapshot raid adjustment is implemented but
  UNEXERCISED: no raid on either band landed on a closing-snapshot day.
- Raiddor trajectories are PRE-c04d4e0cb trajectories and must NOT be
  cited as current-base trajectories. This arm runs on the CURRENT base
  (see "Base rule" below) with NO pin; its trajectories are current-base
  trajectories, and its verdict does not depend on reproducing raiddor's.

## Closing-snapshot day — exact definition (read the analyzer first)

"Closing-snapshot day" means the day of the LAST spoilDays snapshot in a
seed's corpus file (analyzer variable lastSnapDay = last spoilDays
entry's day). On a seed that survives the horizon it is day 100: the
corpus closing is that day's spoilDays snapshot, and the boundary
closing is that closing + day-100 stockSurplus pushes - day-100 meal
draws (pantryDraw + drawSpoiled, day 100) — i.e. the boundary closing
is the day-100 position AFTER the day-100 meal draws, exactly as in
raiddor/ledgerbound. On a seed that dies early it is the death day
(e.g. raiddor 9881: lastSnapDay 61), and its closing snapshot is that
day's snapshot, not day 100.

POST-SNAPSHOT RAID ADJUSTMENT — exactly how it treats a raid dated ==
that day: a raid-unanswered record dated == lastSnapDay is counted as a
draw in the boundary flows (dated <= 100) AND subtracted from the
boundary closing (total channel and dried portion): rBClosing =
bClosing - raid100, rBClosingDried = bClosingDried - raid100D, where
raid100 / raid100D are the day-==lastSnapDay raid-unanswered kcal
(total / dried-portion) for that family. Rationale, as in raiddor: the
take happens after the closing snapshot is taken, so the snapshot does
not reflect it, but the flows count it — without the subtraction the
residual is overstated by exactly the raid amount. All other
_removePantryKcal callers are census only, never folded into the
judged legs. A raid on a DEATH-DAY closing snapshot (village dies
before day 100) is a PARTIAL exercise only: it exercises the same code
path, but it does NOT satisfy a day-100 GO (see "GO" below).

## PRE-REGISTERED GO (verbatim — judge ONLY against this)

GO iff ALL of:
(a) a day-100 raid seed is found in the screened range: a seed that
survives to day 100 (daysAlive == 100, lastSnapDay == 100) with at
least one raid-unanswered record dated == 100; AND
(b) on the judged sweep of that seed (single seed, post-prereg,
identical instrument/policy/base/horizon — see below), the day-100
raid touches at least one focal family-seed row (named set: Lamb's
Quarters, Burdock, Muscadine Grapes, Purslane; generic set: Foraged
food; row counts iff boundary inflow >= 10000, the raiddor focal
filter); AND
(c) every focal row touched by the day-100 raid closes WITH the
adjustment: |rBResidual| / boundary inflow <= 1% (named and generic
rows alike); AND
(d) WITHOUT the adjustment the same rows are off by exactly the
day-100 raid amount: for every focal row, (residual WITHOUT the
post-snapshot subtraction, raid draws still counted) - (residual WITH
it) == raid100 for that family (total channel), and the dried-channel
difference == raid100D — i.e. the leg was exercised, not vacuous;
AND
(e) the pooled focal channels on the judged seed close WITH the
adjustment under the raiddor bars where counted rows exist: named
pooled |residual| / pooled inflow <= 1% (if >= 1 named row counted),
generic pooled <= 1% (if >= 1 generic row counted), dried pooled
|residual| / pooled transformed post-kcal <= 2%; AND
(f) the proof (scripts/test-raidday100-b.js) is GREEN on the judged
corpus, including the det-gate (instrument on vs off byte-identical
on non-raid fields).

If NO day-100 raid is found in the screened range, the verdict is
DIAG-NO-GO (adjustment stays defense-in-depth) with the full screen
census reported — never a pass on silence. A raid on a death-day
closing snapshot counts as PARTIAL exercise only: report it, do not
let it satisfy clause (a). A miss on any clause is NO-GO, never
re-scored against a friendlier metric mid-run. If the metric proves
wrong, write it under "metric review" and propose the revision for
the NEXT run. A det-gate or coverage failure is DIAG-NO-GO
(instrument, not game).

## Screen (scouting, NOT judging — runs BEFORE this prereg commit)

Screen size pre-registered here (cap): up to 40 seeds, screened in
chunks of 8, stopping early when a day-100 raid is found. Screen range:
10100-10139. Collision check (done before screening): no corpus JSON
filenames for 10100-10139 in evidence/2026-10-27/ corpus dirs; no
word-boundary seed mentions for 10100-10139 in dated evidence
2026-10-27/*.md files (checked 10100, 10200, 10300, 10400, 10500,
11000, 12000, 13000, 14000, 15000 bases — 10100 base had 0 hits);
distinct from spent bands 9820-9827, 9870-9881, 9768-9779, and from
the ledgerbound confirm band 9850-9861. Screening uses the vendored
raidday100 census recorder (full sweep, raid census extracted);
screened seeds are spent-but-unjudged if not used in the judged
sweep — the screened range actually screened and the full census are
recorded in evidence/2026-10-27/sim-raidday100-b-screen-census.json
and in the evidence file, so a later arm does not re-spend them
blind. The screen is NOT the judged sweep: a found seed is re-run
post-prereg as the judged sweep, and only that post-prereg run is
judged. Screen corpus dir:
evidence/2026-10-27/sim-raidday100-b-screen-corpus/.

SCREEN RESULT (filled in before the prereg commit; the judged sweep
runs only after this commit):
- Screened range actually screened: 10100-10139, all 40 seeds (chunks
  of 8: 10100-10107, 10108-10115, 10116-10123, 10124-10131,
  10132-10139; no early stop, because no day-100 raid was found).
  Screen corpus:
  evidence/2026-10-27/sim-raidday100-b-screen-corpus/ (40 files);
  full census:
  evidence/2026-10-27/sim-raidday100-b-screen-census.json.
- Day-100 raid seeds found: NONE. 52 raid-unanswered records total
  (51,484 kcal), latest raid day 99 (seed 10109), then 97 (10114),
  96 (10106), 93 (10134), 91 (10119). 14 seeds had zero raids.
- Death-day closing-snapshot raids (partial only): NONE. The two
  early-ending seeds had no closing-day raid: 10110 died day 24
  (lastSnapDay 24, zero raids); 10139 ran to daysAlive 100 with
  endReason village-lost but its last spoilDays snapshot is day 99
  (lastSnapDay 99, zero raids) — the village was lost during day
  100 before the day-100 snapshot, so its closing snapshot day is
  99, not 100, and no raid dated 99 exists on it either.
- CONSEQUENCE (recorded here so the verdict is not re-scored later):
  clause (a) of the GO fails on the full screened range, so NO
  judged sweep is run and the verdict is DIAG-NO-GO (adjustment
  stays defense-in-depth). The prereg commit still precedes any
  judged sweep — vacuously, since none occurs — and the evidence
  file reports the screen as the run's result, not as a judged
  sweep.

## Base rule (NO pin — current master HEAD at prereg time)

Base: current master HEAD at prereg time (commit hash recorded at
commit time in the evidence file; worktree HEAD at screen time was
6ae5049d88d6c22192489dca51a5160d90606daf). NO base pin: raiddor's
pin was pre-c04d4e0cb and its trajectories must not be cited as
current-base. If the worktree HEAD moves between prereg and judged
sweep, report the move; do not silently sweep on a new base and call
it the prereg base.

## Instrument (vendored under NEW raidday100 names, zero sibling modifications)

- scripts/sweep-raidday100-b.js (vendored from raiddor's sweep;
  output dir/file prefix, mode string, staging dir, capture require
  adapted; sweep logic otherwise identical; RAIDDOORS=0 disables ONLY
  the raid install for the det-gate control).
- scripts/analyze-raidday100-b.js (vendored from raiddor's analyzer;
  ledger math byte-identical, including the post-snapshot adjustment
  above; old-boundary and ledgerbound-boundary legs reported alongside
  as controls; leg-2 label prints the real seed count).
- scripts/test-raidday100-b.js (proof; see below — adapted for a
  single-seed judged corpus: corpus size 1 allowed, det-gate seed =
  first corpus seed, section 3d day-100 exercise + without-adjustment
  checks; leg-2 coverage is NOT applicable to a 1-seed corpus and is
  not part of this arm's GO).
- scripts/trace-raidday100-b.js (vendored from raiddor's trace;
  raid-unanswered draws included in the transition flows).
- scripts/stockdoors-capture-raidday100.js (vendored from raiddor's
  capture; internal raid field names raidRecords/raiddorOn and the
  RAIDDOORS env name retained for analyzer compatibility — only
  filenames, corpus dir, file prefix, mode string, staging dir, and
  capture require changed).
NEVER modified: any sibling capture file (inflow/mealdraw/spoilvol/
driedpath/stockdoor-capture, ledgerbound files, raiddor files) or any
src/js file.

## Policies + horizon + seeds

Policies: competent-nofeast exactly as raiddor/ledgerbound
(COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
FEASTSCALE_R13 off).
Horizon: 100 days, death-aware (a seed that dies ends early; dead
villages stop simulating; +10d tail max — not applicable here, the
instrument stops at death).
Judged sweep: the single found day-100 seed only (if found), run
after this prereg commit, into
evidence/2026-10-27/sim-raidday100-b-corpus/. No confirm band: this
arm judges one exercised leg on one seed, not a population rate;
the population evidence is the screen census + raiddor's two bands.

## Named-row rule (counting, fixed before judging)

A named/generic family-seed row counts iff its boundary inflow >=
10000 (raiddor focal filter). Named set: Lamb's Quarters, Burdock,
Muscadine Grapes, Purslane. Generic set: Foraged food (alone).
Dried pooled: pooled |dried-channel boundary residual with raid door|
across all focal family-seeds, over pooled transformed post-kcal
(boundary definition, dated <= 100). Rate/share definitions as in
raiddor.

## Proof (must be GREEN on the judged corpus before evidence commits)

scripts/test-raidday100-b.js proves: corpus validity (single-seed
judged corpus: policy, stockdoorsOn + raiddorOn, no truncation, all
7 direct methods wrapped, raid fields present); det-gate (instrument
on vs off byte-identical on non-raid fields + reproduces the judged
corpus counts on the judged seed); independent leg recomputation
(second code path reproduces the analyzer's pooled residuals,
including the raiddor boundary legs); day-100 exercise (section 3d:
day-100 raid present on a surviving seed, touched focal rows close
with the adjustment, without-adjustment residuals differ by exactly
raid100 / raid100D per focal row); raid-door disjointness;
instrument integrity (raid record item sums equal returned kcal; no
unknown raid caller paths); hygiene (zero src/js modified, zero
sibling files modified — including raiddor files — no modified
tracked file outside this run's own files).

## Reachability + sense (reported, not judged)

Waves 1-5, regional/national/table/win on the judged seed — reported
honestly even when 0. Village assessment in plain words. Sense note:
the day-100 raid's narration line (the "didn't wait" treeline line)
quoted and checked against the ledger record (numbers must match,
as raiddor's did), or an explicit statement that the raid take is
silent in the captured transcript.

## Balanced panel (MEASUREMENT.md §15)

This arm changes no lever and no game code, so there is no
before/after to panel — exactly as raiddor stated. The det-gate
(adjustment on vs off, via the with/without recomputation) is the
instrument before/after. Not forced, not faked.
