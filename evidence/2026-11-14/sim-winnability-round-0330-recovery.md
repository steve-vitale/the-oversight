# sim-winnability-round-0330-recovery — stale-lock recovery + rageprecheck adoption

Run: fleshout-loop-b-20261114T0730Z (Loop B), recovery of the dead 0330Z run.
Axis: winnability chain. Date: 2026-11-14.

## Stale-lock recovery

The 0330Z run's lock (`fleshout-loop-b-20261114T0330Z`, created
2026-11-14T03:30:50Z) was still present at this run's 07:30Z start,
~4h old — past the 90-minute fallback. Its last tree,
sim-rageprecheck-b, heartbeated 07:08:17Z (22+ min stale at check,
past the 15-minute live threshold); its other two arms' trees were
already released and their evidence on master. Verdict: previous run
DEAD. Lock + claim deleted after the orphaned work below was safely
landed. No work lost.

## The 0330Z run's three arms — final disposition

- **sim-proofrefresh-b14** — LANDED before the timeout (commits
  97929b5d3, 683072466, 758206d8b): fresh neutral panel + proof
  re-point, GO 12/12 on final tip 8c83b6a9a. Round 15 owed after the
  next manifest change.
- **sim-retribution-offer-b** — LANDED before the timeout (commits
  0b3775cec, f0445d648, f59b4b674): DIAG never offered (0/108),
  instrument NO-GO on 1 fusion fizzle. Filed findings #2326
  (fusion offer tramples a pending prize sheet) and #2327 (prize
  offers fusion_reactor with no pellet, then fizzles) — both taken
  as this run's arms.
- **sim-rageprecheck-b** — ORPHANED, recovered here. The worker and
  a closeout coordinator had finished Stage 2 (commit 9568f4016,
  GO primary 756 → 0, fresh-only 424 → 0) but the branch was never
  merged. Adoption: verified the branch (6 commits, only its own
  files: src/js/abilityActions.js + 3 scripts + evidence),
  proof test 12/12 static + 25/25 game on the branch, rebased
  clean 6/6 onto fe95c314e (Loop A round evidence; no file overlap
  with the 9 transplant commits since the branch base), proof
  re-run 12/12 + 25/25 on the rebased tip e3a5a9053, merged
  --ff-only to master, tree released done-merged, branch deleted.
  The engine precheck (refuse Unleash Rage re-press while rage is
  live) is now on master. No src/js change beyond the one fix.

## Wall numbers (carried from the rageprecheck Stage 2 evidence)

- National/table/wins: capable reaches national on 13/16 seeds and
  wins 16/16 (~day 90, over-other) both legs; competent national
  0/16, wins 0/16 both legs. No village reaches the table as a
  distinct step either leg.
- Wave 4–5: wave-4 kills pooled 68 → 57, wave-5 kills 19 → 19,
  wins unchanged 16/32 both legs. The lever removes wasted turns;
  it does not buy wave-4 kills.
- Median survival: competent 121 → 122.5d; capable 90 → 90d.
- Full per-seed tables: evidence/2026-11-14/sim-rageprecheck-b-stage2.md.

## Recovery notes

- Duplicate release race: a second agent also ran
  `worktree-release.sh sim-rageprecheck-b merged` at 07:50Z
  (its shell shows the same release + verification steps — likely
  the 0330Z closeout coordinator's own session finishing late).
  Both serialized on REGISTRY.lock; this run's release won, the
  tree was released once as done-merged, and the worktree + branch
  cleanup ran from this run. No corruption, no double release.
- Reaper skipped at pre-flight (registry lock held by another
  reaper run, consecutive skips: 1); no cleanup this run.
- Loop A closed its 0615Z run cleanly mid-recovery (round evidence
  fe95c314e; claim deleted) and started a new run at 07:40Z
  (transplant14 + 12+14, scale-onramp) — NOT touched.
- origin/master verified ahead of the merge: local master ahead,
  origin an ancestor, nothing on origin missing locally (no
  divergence). No push (ship loop owns deploys).

## What this run does next

Adoption done; the 0330Z blanks are closed (lever B, round 14,
retribution-offer). This run's arms: (1) sim-fusionoffer-b —
fix findings #2326 + #2327 in one arm (same offer path);
(2) sim-proofrefresh-b15 — measurement proof is stale on
current master (verified: test-measurement-proof-update.js
throws "Proof source inputs are not current"), round 15 owed;
(3) sim-capablewinpath-b — decompose finding #2321 (capable
wins 16/16 by ~day 90, competent 0/16, identical seeds).
