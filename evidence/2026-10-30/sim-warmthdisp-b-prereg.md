# sim-warmthdisp-b prereg — disposition of stranded warmthrestraint branch

Run: fleshout-loop-b-20261030T1436Z, arm sim-warmthdisp-b. Worker worktree
`~/workspace/worktrees/sim-warmthdisp-b`, branch sim-warmthdisp-b.
Committed BEFORE any judged census comparison (structural key listing only,
no verdict aggregates read before this note).

## Question (comparison only, not a sweep)

Is stranded branch sim-warmthrestraint-b (tip cf9cb51e0, prereg 345778656,
base 2138ad07e) SUPERSEDED-DUPLICATE of the already-landed
sim-warmthrestr2-b judgment (commit 2067af34e, prereg a6d8cab94, pinned base
ee3be4fc, landed in the 0830Z loop-B round, coordinator evidence b4dde2795),
or does it contain a MATERIAL-DIFFERENCE?

Seeds (both runs): s15003, s15009, s15091, s15211, s15215, s15220, s15221,
s15337, s15376, s15439 (10 seeds, 4 arms: guard / on / r1 / r2).

## Comparison rule (decides the verdict)

Compare, file by file, the stranded census JSONs
(`git show sim-warmthrestraint-b:evidence/2026-10-30/sim-warmthrestraint-b-census-{guard,on,r1,r2}.json`)
against the landed census JSONs
(`evidence/2026-10-30/sim-warmthrestr2-b-census-{guard,on,r1,r2}.json` on
master/this worktree's HEAD lineage), plus both prereg documents and both
evidence narratives (bars, GO wording).

VERDICT-RELEVANT aggregates (the deciders — exact agreement required):
1. Coverage per arm: seeds, files, evenings, creekEvenings.
2. Guard strand: per-seed strand maxRun and run windows — in particular
   which seed(s) hold the 3-night guard strand, and whether R1 and R2 each
   preserve that same strand (same seed, same maxRun, same window).
3. Warmth benefit retained: per-arm warmActed and warmLogSpent, and per-seed
   warmActed / warmLogSpent — R1 and R2 must show the same retained benefit
   in stranded as in landed (the claimed verdict is zero benefit retained).
4. Restraint misses: missReasons restraint-r1 / restraint-r2 counts per arm,
   agreeing between runs.
5. R1-vs-R2 equivalence inside each run: R1 and R2 verdict aggregates equal
   each other, in both runs.
6. Bars: the stranded prereg's GO bars match the landed prereg's GO bars
   (same threshold, same horizon, same arms judged); a bar change that flips
   or qualifies GO is material.

TOLERANCE: exact agreement on all of 1–5. Census row counts / analyzer-only
extra keys (e.g. keys present in one analyzer version but not the other) may
differ ONLY if every verdict aggregate above agrees exactly — extra keys are
not verdict-relevant unless they contradict a verdict aggregate. Filenames
and directory names are not verdict-relevant.

BASE DRIFT vs REAL DISAGREEMENT: stranded base 2138ad07e predates the landed
pinned base ee3be4fc. A differing cell is base drift ONLY if the same
direction of difference already appears in the guard/on baseline arms of the
two runs (the baseline itself moved). If guard/on agree but R1/R2 differ, that
is a real disagreement, not drift.

CODE CHECK (secondary, not a substitute for the census rule): compare the
restraint gate in scripts/policies/woodwarm.js between the two GO commits.
A functional difference (R1 threshold, R2 act window, fail-closed behaviour)
is material even if the census happens to agree; a cosmetic difference
(comments, record-field tagging on acted records, analyzer key names) is not,
provided the census aggregates agree exactly.

## Verdicts

- SUPERSEDED-DUPLICATE: all verdict aggregates agree exactly, bars match,
  gate logic functionally identical. Consequence: stranded branch adds
  nothing and must NOT be merged; recommend release of tree
  sim-stranded-warmth-b by the coordinator/reaper only (this worker releases
  nothing belonging to another run).
- MATERIAL-DIFFERENCE: any verdict aggregate, bar, or functional gate
  difference that changes or qualifies the R1+R2 GO GUARD-EQUIVALENT verdict.
  Report the exact differing cells and HOLD for coordinator decision; do NOT
  merge unilaterally.

## Correction noted before comparison

The task brief described the stranded GO commit as "evidence JSONs only,
ZERO src/js, ZERO scripts". A preliminary `git show --stat` / file list (not
a judged comparison) shows the stranded GO commit also touches
scripts/policies/woodwarm.js and its analyzer/trace/test scripts — the same
shape as the landed GO commit. The disposition therefore covers the policy
gate code as well as the census evidence; it does not change the verdict
rule above. No src/js (game code) is touched by either GO commit, on the
file lists seen.

## Canon

docs/CANON.md read first. No canon doc covers the woodwarm restraint
specifically (it is a sim-policy gate, not a game system); nothing is
invented from canon here. This disposition judges measurement agreement only.

## Metric review

To be completed in the evidence file: whether this exact-agreement rule was
the right instrument (e.g. whether analyzer-key differences forced any
judgment call, and whether the base-drift rule was invoked).
