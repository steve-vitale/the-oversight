# sim-ladderbase-cause-a — ladder-bundle control root cause (finding #2559-A)

Run fleshout-20261118T2015Z, Loop A, axis scale-onramp. Arm: ROOT-CAUSE
finding #2559-A / ladder-bundle control failure.

**Verdict: GO — root cause found, control fixed, test green.**
Finding #2559 is **CLOSED as a control defect, not a game defect**: the
ladder-bundle failure predates wildavoid (proven in the 1715Z round by
base-pinning) and predates the guard that broke it by a week in the other
direction — the test rig was written before the lingering design landed,
and the design changed under it.

## The failure (reproduced on the arm's base)

`node scripts/test-ladder-bundle-20261108.js` → **78 passed, 1 failed**:
`FAIL control: 200 monster turns WITHOUT delivery fire the ambient raid —
fires 0`. Identical at 5402d4cc3^ and 5402d4cc3 (1715Z base-pin), so the
wildavoid landing is exonerated. Loop B's 1735Z adoption confirmed the
same control failure on a lever-free base (detached HEAD 4c0c55935).

## Root cause (bisect + mechanism)

**Introducing commit: `dc8cbd3f3` (2026-11-15, "linger holds the
treeline").** It added to `monsterTurn()`'s ambient-contact path in
`src/js/game.js`:

```js
if (m.lingering) return;
```

with the CASCADE rationale (design call #8, Steve 2026-10-16): a lingering
raider holds the treeline — it is a siege, answered by sortie or
endurance, not a duel. The besieger must not step onto the scholar inside
the hall and start a turn-based fight it always wins solo. The scholar
may still walk up and press Fight (`startCombat` untouched), the sortie
still fights it (`fieldFight`, not `monsterTurn`), the nightly gorge and
the ~6-night drift valve are untouched, and non-lingering intruders still
breach exactly as before. Nothing despawns.

**The test predates the guard by a week.** The ladder-bundle test was
introduced 2026-11-08 (`167e6067c`, "ladder leg2: seat + bundle unit
proofs (38 + 79 green)") with its section-C control rig setting
`m.lingering = true` and then looping `monsterTurn()` 200 times expecting
the ambient raid to fire. That rig was true when written — a lingering
monster raided then — and the guard made it impossible: a lingering
monster can NEVER raid via `monsterTurn` now. Section C could never
fire, and section A (200 turns after delivery, expect 0) passed
vacuously for the same reason — the mercy mechanism was never actually
tested against a monster that would raid.

**Mechanism proven by probe** (regression test
`scripts/test-lingering-raid-control-20261118.js`, GREEN):

- Lingering raider: 200 monsterTurns, **0 fires**.
- Same rig, not lingering: 200 monsterTurns, **1 fire**.
- Delivered capstone + not lingering: 200 monsterTurns, **0 fires** —
  the mercy mechanism itself works; only the rig was wrong.

**Same defect class in a sibling test.** `scripts/test-table-sanctity-gate-20261020.js`
shares the rig (`freshSanctity` sets `m.lingering = true`). Its section-A
control was vacuous the same way, and its positive control E2 ("ambient
contact still engages without sanctity") **failed on master** — verified
by running the HEAD version of the file: exactly 1 failure, E2, fires 0.
The sanctity test is not on the green list, so this failure was invisible
to the gate; the ladder-bundle failure was the visible one (green-list
line 486, quick).

## The fix (test rigs only — NO game code changed)

The lingering guard is deliberate design and stays. The fix corrects the
rigs so the controls test what they claim:

- `08cab0c98` — ladder-bundle mercy rig: remove `m.lingering = true`
  from `freshMercy()` in `scripts/test-ladder-bundle-20261108.js`.
  Section A then tests the table gate alone (delivery on vs off is the
  only difference between A and C).
- `16313a16f` — regression test
  `scripts/test-lingering-raid-control-20261118.js` (78 lines) pinning
  the lingering-vs-raid distinction: lingering never raids, non-lingering
  does, delivered capstone still blocks the non-lingering raider.
- This commit — sanctity-gate rig: `m.lingering = false` before the
  monsterTurn loops in sections A and E of
  `scripts/test-table-sanctity-gate-20261020.js`. Sections B–D keep the
  lingering rig (A3 asserts the lingerer stays pinned via identity;
  C/D test the re-engage stash, not ambient contact). E2 now fires on
  tick 4.

## Verification (re-run at adoption, on the branch tip)

| Test | Result |
| --- | --- |
| `test-lingering-raid-control-20261118.js` | GREEN — all checks pass |
| `test-ladder-bundle-20261108.js` | **79 passed, 0 failed** (was 78 + 1 failed) — the control "200 monster turns WITHOUT delivery fire the ambient raid" now fires |
| `test-table-sanctity-gate-20261020.js` | **GREEN — all checks pass** (was RED, 1 failure: E2) |

All three re-run on the rebased tip at adoption (see round evidence).

## What this means

- The ladder-bundle control failure is **not** a game regression and
  never was — no ladder or mercy behavior changed. The gate's standing
  "ladder-bundle control" failure should clear on the next full gate
  run; if it does not, the failure moved and needs re-adjudication.
- The mercy mechanism itself (delivered capstone blocks the ambient
  raid) is now proven against a monster that would actually raid, for
  the first time since the guard landed.
- Lesson for future rigs: any test that sets `m.lingering = true` and
  then expects `monsterTurn()` to raid is testing a behavior the design
  removed. A raid control must use a non-lingering monster. (Recorded
  in the regression test's header so the next author finds it.)

## Metric review (closeout)

The pre-registered metric (introducing commit) resolved to the
control-defect branch: the control was right at birth (green 2026-11-08)
and broke when the design changed under it (2026-11-15 guard). No
balanced panel: no game code changed (docs/MEASUREMENT.md §15). The
pre-registered alternative (wrong from birth) is excluded by the
introduction commit's green claim plus the mechanism probe. One scope
note: the adoption found and fixed the sibling sanctity E2 failure the
arm worker had left uncommitted — same defect class, same file family,
same finding; the worker's section-A edit is kept and the section-E edit
added by the adoption, both verified green together.

## Files

- Prereg: `evidence/2026-11-18/sim-ladderbase-cause-a-prereg.md` (frozen,
  commit 19c81a828)
- Fix + regression test: commits `08cab0c98`, `16313a16f`
- Sanctity rig fix: this commit
- Round-level gate and telemetry:
  `evidence/2026-11-18/sim-scale-onramp-round-2015.md`
