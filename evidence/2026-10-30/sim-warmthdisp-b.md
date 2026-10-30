# sim-warmthdisp-b — disposition of stranded warmthrestraint branch

Run: fleshout-loop-b-20261030T1436Z, arm sim-warmthdisp-b (food-economy axis).
Worker worktree `~/workspace/worktrees/sim-warmthdisp-b`, branch sim-warmthdisp-b.
Comparison task only — no new sweep, no game-code change, no merge performed.

## Verdict: SUPERSEDED-DUPLICATE — do NOT merge sim-warmthrestraint-b

The stranded branch adds nothing to the judgment already landed as
sim-warmthrestr2-b (commit 2067af34e, 0830Z loop-B round, coordinator evidence
b4dde2795). Every verdict-relevant number agrees exactly, and all 40
nighttravel corpus files are byte-identical (full SHA-256, checked by
scripts/test-warmthdisp-b.js, exit 0).

Recommendation (coordinator/reaper only — this worker releases nothing
belonging to another run): leave branch sim-warmthrestraint-b unmerged, and
release tree sim-stranded-warmth-b through the normal reaper path once the
coordinator confirms no other run references it. Merging it would at best
re-land an identical verdict under different filenames, and would conflict
on scripts/policies/woodwarm.js (see §Code) for a cosmetic tagging difference.

## Sources compared

| Side | Tip / prereg | Base |
|---|---|---|
| Stranded | cf9cb51e0 / 345778656 | 2138ad07e (journey landing r73) |
| Landed | 2067af34e / a6d8cab94 | ee3be4fc (pinned) |

Same 10 seeds, same 30-loop-day horizon, same 4 arms (guard / on / r1 / r2):
s15003, s15009, s15091, s15211, s15215, s15220, s15221, s15337, s15376, s15439.
Stranded branch's own content is 2 commits / 50 files (1 prereg + 49 in the
GO commit: 4 census JSONs, 40 corpus JSONs, 1 narrative, 4 scripts). The
branch-vs-current-master tree diff (~1817 files) is a base artifact — the
branch base predates massive master-side additions — and is NOT what a merge
would apply; it was not used as evidence either way.

## Comparison table (verdict-relevant aggregates — all EXACT)

| Arm | Seeds/files/evenings | Creek / still / rescued | warmActed / logSpent / fireFailed | 15215 strand | Other seeds' strands |
|---|---|---|---|---|---|
| guard, stranded | 10 / 10 / 300 | 15 / 4 / 11 | 0 / 0 / 0 | days 7–9 (3) | 15009: [13] (1); rest 0 |
| guard, landed | 10 / 10 / 300 | 15 / 4 / 11 | 0 / 0 / 0 | days 7–9 (3) | identical |
| on, stranded | 10 / 10 / 300 | 21 / 11 / 10 | 6 / 4 / 2 | days 7–16 (10) | 15009: [13] (1); rest 0 |
| on, landed | 10 / 10 / 300 | 21 / 11 / 10 | 6 / 4 / 2 | days 7–16 (10) | identical |
| r1, stranded | 10 / 10 / 300 | 15 / 4 / 11 | 0 / 0 / 0 | days 7–9 (3) | 15009: [13] (1); rest 0 |
| r1, landed | 10 / 10 / 300 | 15 / 4 / 11 | 0 / 0 / 0 | days 7–9 (3) | identical |
| r2, stranded | 10 / 10 / 300 | 15 / 4 / 11 | 0 / 0 / 0 | days 7–9 (3) | 15009: [13] (1); rest 0 |
| r2, landed | 10 / 10 / 300 | 15 / 4 / 11 | 0 / 0 / 0 | days 7–9 (3) | identical |

Also exact in both runs, per arm and per seed: perSeed tables (all 10 seeds),
havenMornings (guard/r1/r2 263, on 258), warmRecords (300/arm), staged arrays
(on: 7 staged wood-short evenings on seed 15215, byte-identical content),
and missReasons:

- guard: {} both runs.
- on: not-creek-refused 279, rescued 10, branches-available 1, ticks-short 1,
  no-wood 3 — both runs.
- r1: not-creek-refused 285, rescued 11, branches-available 1, ticks-short 1,
  restraint-r1 2 — both runs.
- r2: same with restraint-r2 2 — both runs.

R1-vs-R2 equivalence holds inside each run (warmActed 0, logSpent 0, 15215
strand 3 in both variants of both runs). The landed run's extra
restraintMissDetail pins the 2 blocked attempts to seed 15215, loopDays 8
and 9, woodBefore 4 — the stranded run's missReason counts (2) are consistent
with the same 2 blocks; its analyzer simply does not carry the detail field.

Corpus check: 40/40 nighttravel files byte-identical (guard 10/10, on 10/10,
r1 10/10, r2 10/10, full SHA-256). The underlying sim trajectories are the
same trajectories, not merely the same totals.

## Bars match

Both preregs judge PRIMARY identically: 15215 strand nights == fresh guard
strand nights (3) AND no bank seed's variant strand exceeds its guard strand;
GO iff both hold. Both carry the same interpretation rule: a variant meeting
PRIMARY with zero benefit retained is GUARD-EQUIVALENT (trap prevented,
warmth benefit fully forgone), never "warmth-preserving". Both narratives
conclude, word for word in substance: R1 GO (GUARD-EQUIVALENT), R2 GO
(GUARD-EQUIVALENT). No bar change flips or qualifies anything.

## Sense-testing (read, not just counted)

The numbers cohere as a story. Unrestrained warmth (on) spends the pack down
4 → 3 → 2 → 1 → 0 across stranded nights 9–13 — the staged narration says
"No bridge tonight — the pack holds N logs, and a bridge needs 4" each
night — and the strand stretches from 3 nights (guard, rescued day 10) to
10 nights (days 7–16). Both restraints block exactly the 2 warmth attempts
that would have spent at woodBefore 4: 4 is neither ≥5 (R1's "bridge still
buildable after spend") nor <4 (R2's "bridge already lost"), so both
collapse to never lighting on this bank and the guard strand (days 7–9)
survives intact. That "no middle at wood 4" is the finding both runs report,
and it is the same finding in both runs because the trajectories are the
same trajectories.

## Code check (secondary)

Both GO commits add the identical restraint gate to scripts/policies/woodwarm.js
(a sim-policy script, not game code — neither GO commit touches src/js):
restraintDecision with R1 wood ≥ 5, R2 wood < 4, unknown strings fail closed,
null/'off' unconditional. Blob-to-blob diff between the two gate versions is
only: (1) comment wording; (2) the landed version calls the pure
restraintDecision twice instead of once (same result); (3) the stranded
version tags acted records with a `restraint` key while the landed version
does not. Difference (3) cannot affect any corpus here: R1/R2 acted 0 times,
and guard/on run with null restraint, which the stranded code also leaves
untagged — consistent with the 40/40 byte-identical corpora. The current
worktree HEAD already carries the landed gate blob (a75dc8f8); the stranded
blob is b7904d663. Merging the stranded branch would conflict on this file
for a cosmetic difference. The two runs' analyzer/trace/test scripts differ
only in filenames and analyzer-only keys (see below).

## Analyzer-only differences (not verdict-relevant, per prereg tolerance)

Stranded-only census keys: unstagedWoodShort ([]), woodGe5Evenings ([]),
woodMax (4). Landed-only: packGe5Evenings (0), restraintMissDetail (the 2
blocks above, r1/r2 only; [] on guard/on), sub4WithoutSpend (0),
woodMaxCreek (4). Values are mutually consistent (wood max 4 both ways; zero
≥5-wood evenings both ways; zero unstaged/sub-4 cases both ways). Strand
encoding differs in shape only: stranded `{seed: {maxRun, runs}}` for all
seeds vs landed `{seed: [runs]}` for non-empty seeds; normalized, the run
windows are identical.

## Base drift: not invoked

The prereg base-drift rule (a differing cell counts as drift only if guard/on
baselines moved the same way) was never needed: guard and on agree exactly
across the two different bases (2138ad07e vs ee3be4fc), so there is no drift
on any verdict cell to explain away. Two independent bases reproducing all
40 corpora byte-identically is, if anything, a stronger duplicate than a
same-base re-run.

## Correction to the task brief

The brief described the stranded GO commit as "evidence JSONs only, ZERO
src/js, ZERO scripts". The src/js part is correct, but the scripts part is
not: the stranded GO commit touches scripts/policies/woodwarm.js plus its
analyzer, trace, and test scripts — the same shape as the landed GO commit.
This disposition therefore covers the policy gate code as well as the census
evidence, and the verdict is unchanged by the correction: the gate is
functionally identical and the measurements are identical.

## Canon

docs/CANON.md read first. No canon doc covers the woodwarm restraint
specifically (a sim-policy gate, not a game system); nothing was invented
from canon. This disposition judges measurement agreement only and changes
no game behaviour.

## What happens next (recommendation only)

1. Do NOT merge sim-warmthrestraint-b.
2. Coordinator/reaper: release tree sim-stranded-warmth-b via the normal
   path after confirming no other run references the branch.
3. Tracker: the warmthrestraint disposition is now resolved as
   SUPERSEDED-DUPLICATE (the 1332Z entry listing it HELD is superseded by
   this disposition, not by a new landing).

## Metric review

- The exact-agreement rule was the right instrument: it left no room to
  re-score analyzer-key differences into a verdict, and the script enforces
  it mechanically (exit 1 on any verdict mismatch).
- Honest process note: structural previews (file lists, census key names,
  the woodwarm gate diff, and one guard-census head sample) were viewed
  before the prereg commit; the prereg rule itself was fixed and committed
  before the systematic comparison, and the comparison script re-derives
  every verdict aggregate from the blobs, so the preview did not set any
  threshold. Future dispositions should commit the prereg before even a
  head sample.
- The strand-encoding shape difference (maxRun wrapper vs bare runs) is a
  standing analyzer-version hazard for future comparisons; the script's
  normalization handles it, and it should be kept in any re-run of this
  comparison.
- No metric revision is proposed for the next run: the rule worked as written.

## Proof

`node scripts/test-warmthdisp-b.js sim-warmthrestraint-b 2067af34e` — exit 0,
"VERDICT: SUPERSEDED-DUPLICATE". The script is pure reads (git show +
stdout); it writes nothing. No jest run was needed: no game code was touched
or executed by this arm.

## Commit status — LOUD: container write-denial flap blocked the commit

At commit time, every git object/index write failed with
`fatal: sha1 file '...lock' write error: Operation not permitted` and
`fatal: unable to write loose object file: Operation not permitted` —
~70 safe-commit.sh attempts plus a workspace-path private-index probe, all
failing identically, while plain file writes (this evidence file, the test
script) succeeded. No ref was forced and no manual ref surgery was done.
A probe `git diff --cached` run against the failed (empty) probe index
printed a 58545-file deletion diff; that was probe-index-only noise — the
worktree's main index was verified intact afterwards (`git status --short`
shows ONLY the 3 files below, branch tip unchanged).

If the flap clears, the coordinator (or a retry of this worker) commits
with exactly:
`bash scripts/safe-commit.sh "sim-warmthdisp-b: stranded warmthrestraint disposition SUPERSEDED-DUPLICATE (census + 40 corpora identical to landed 2067af34e), prereg + comparison test + evidence" -- evidence/2026-10-30/sim-warmthdisp-b-prereg.md evidence/2026-10-30/sim-warmthdisp-b.md scripts/test-warmthdisp-b.js`
from `~/workspace/worktrees/sim-warmthdisp-b` on branch sim-warmthdisp-b.
Until that commit lands, the disposition lives ONLY in these uncommitted
worktree files — do not release the worktree before committing them.
