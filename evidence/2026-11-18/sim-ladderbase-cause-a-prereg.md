# Prereg — sim-ladderbase-cause-a (frozen 2026-11-18)

Run fleshout-20261118T2015Z, Loop A, axis scale-onramp.
Arm: ROOT-CAUSE finding #2559-A / ladder-bundle control failure.
Branch: `sim-ladderbase-cause-a`. Worktree:
`~/workspace/worktrees/sim-ladderbase-cause-a`.

## The failure (reproduced on current worktree HEAD c0151cb53)

`node scripts/test-ladder-bundle-20261108.js` → **78 passed, 1 failed**:
`FAIL control: 200 monster turns WITHOUT delivery fire the ambient raid —
fires 0`. Identical at 5402d4cc3^ and 5402d4cc3 (1715Z base-pin), so the
wildavoid landing is exonerated; the cause predates it. Loop B's 1735Z
adoption confirmed the same control failure on a lever-free base
(detached HEAD 4c0c55935).

## Primary metric

The introducing commit identified by bisection: the commit hash + the
exact change that broke the control — OR the control defect named with
evidence (if the control was wrong from birth).

## GO threshold

Root cause named with bisect evidence: a commit hash + the mechanism
by which it broke the control, demonstrated by the test passing at the
commit's parent and failing at the commit — OR the control fixed and
the test green on master AND on the base where it failed. A fix lands
only if it is small and clearly correct; otherwise the fix shape is
documented for the next arm and the arm reports HELD.

## Horizon + why

No seeds, no horizon: this is a bisect / control-diagnosis arm, not a
sim. The instrument is the test file itself, run at successive commits.
Policies: n/a — no sim policy is involved.

## Pre-registered suspects (from code reading before bisecting)

- `src/js/game.js` `monsterTurn()` returns early when
  `m.lingering` is set (guard added by dc8cbd3f3, 2026-11-15, "linger
  holds the treeline"). The ladder test's `freshMercy()` sets
  `m.lingering = true` and then loops `monsterTurn()` 200 times in
  its control (section C). If that guard is the cause, the control
  can never fire — and section A (200 turns after delivery, expect 0)
  is vacuous for the same reason. The mirror test
  `scripts/test-table-sanctity-gate-20261020.js` shares the rig
  (`freshSanctity` sets `m.lingering = true`) and its positive
  control E2 is the discriminating check for the same mechanism.
- Alternative: the control was wrong from birth (test introduced
  2026-11-08, commit 167e6067c, which claimed "38 + 79 green").
  Checked first by running the test at its introduction commit.

## Method

1. Run the ladder test at 167e6067c (introduction) — green means the
   control was once true; red means wrong from birth.
2. `git bisect` (or manual bisection if the harness needs setup at
   old commits) between 167e6067c and 5402d4cc3^ with the test as judge.
3. Probe on the current tree: same rig with `lingering = false` vs
   `true`, counting `startCombat` fires — isolates the guard as the
   mechanism without a checkout.
4. If the control rig is the defect (not game code), fix the rig
   minimally (a monster that can actually raid), update the proof
   test in the same commit, and attach before/after test runs. No
   balanced panel unless game code changes (docs/MEASUREMENT.md §15).

## Metric review (to fill at closeout)

- Whether the pre-registered metric (introducing commit) was the
  right judge, or the control-defect branch applied.
