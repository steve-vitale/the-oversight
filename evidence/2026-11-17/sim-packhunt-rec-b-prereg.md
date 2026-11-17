# Prereg — sim-packhunt-rec-b (finding #2497, frozen)

Arm: instrument fix, zero game-code change (`src/` diff must be 0).
Date: 2026-11-17. Finding: #2497 (sim-findings.md line 2501), from Loop B
arm sim-partysize-allycap-b (run fleshout-loop-b-20261117T2030Z,
evidence/2026-11-17/sim-partysize-allycap-b.md, NO-GO on B2-unjudged).

## What is wrong

The post-call HP recovery (`recoverMHpStart`, scripts/fightallycap-driver-
20261117.js, inherited from the partysize recorder arm, finding #2488)
recovers spawned monster HP as `rec.mHpLeft + rec.mDealt`. A Beastmaster's
Pack Hunt harries the monster for 2–4 per round (src/js/godpath.js
`fieldStrike`: `c.lead.hp -= hd`, log line `the pack harries it for N.`)
and that damage is NOT in `rec.mDealt` — it reduces the monster's HP as a
side effect on the lead body, counted in no dealt total. So the recovery
understates spawn HP on Beastmaster fights, and any damage share using
recovered HP (`mDealt / mHpStart`) overstates the Beastmaster's share
slightly. The recovery's comment ("Wave-4/5 monsters are pack-1, so
mDealt is lead-only and the sum is exact") is wrong for Beastmasters.

No canon doc covers the sim recorder (docs/CANON.md lists no recorder
doc); this fix is grounded in src/js/godpath.js `fieldStrike` and the
frozen fight logs, not in invented canon.

## Frozen band (no new sims)

Band 103601–103608, competent policy, 150d, ctl + arm legs of
sim-partysize-allycap-b. Frozen corpora (held tree sim-partysize-b,
read-only; copies in this worktree under
evidence/2026-11-17/frozen-check/ for the re-check only, deleted before
the final commit):
- perseed-partysize-allycap-b-ctl/ (8 files)
- perseed-partysize-allycap-b-arm/ (8 files)

## The 6 known mismatch rows (primary population)

Rows where recovered `mHpStart` disagrees with CONTACTREC's
`rec.mHpStart` (stored as `mHpStartRec`), each explained exactly by the
pack-harry total in the fight log:

1. seed 103604 ctl, day 95 vs The Congregation — diff 9 = harries 4+2+3
2. seed 103606 arm, day 133 vs The Editor — diff 7
3. seed 103606 arm, day 135 vs The Editor — diff 12
4. seed 103606 arm, day 136 vs The Editor — diff 10 = harries 2+4+4
5. seed 103606 arm, day 137 vs The Editor — diff 7
6. seed 103606 arm, day 141 vs The Editor — diff 9

One of the six is on the CONTROL leg (FIGHTALLY2 off), so this is not an
ally-cap artifact. Effect ≤2.7% of the denominator on 6 rows; touches no
size-4 launched meeting on this band; moves no verdict.

## Fix (confined)

`recoverMHpStart` in scripts/fightallycap-driver-20261117.js ONLY — the
landed copy of the recorder (its body is byte-identical to the unmerged
partysize driver's copy in the held tree; that branch file is not touched
and needs the same patch if ever revived). Parse the pack-harry total
from the fight record's log (`the pack harries it for N.` lines, summed)
and fold it into the recovery: `mHpStart = mHpLeft + mDealt + packTotal`.
Return `mPackDealt` on the result; the driver stores it as `row.mPackDealt`
(0 when no harry fired). Correct the wrong "lead-only and exact" comment.
Do NOT touch the analyzer's verdict logic (it prints GO on unjudged B2 by
design — leave it). Do NOT touch any game code.

## Primary metric (the judge)

The 6 known mismatch rows reconcile to 0 mismatch after the fix:
for each row, fixed-recovered HP (`mHpStart` + parsed pack-harry total
from the stored log) equals `mHpStartRec` exactly.

## GO threshold

ALL of:
- all 6 rows reconcile exactly (diff 0 after the fix);
- zero regressions on the frozen corpora: re-deriving every row's
  recovered HP with the fixed rule leaves every non-Beastmaster row
  unchanged and produces 0 total mismatches across both legs
  (16 files);
- re-running the frozen partysize-allycap-b analysis on the corrected
  corpora moves no verdict and no bar (verdict stays NO-GO on
  B2-unjudged; B1/B2/B3 numbers unchanged except the 6 rows'
  denominators);
- proof test scripts/test-packhunt-rec-b.js green on the branch tip
  (unit legs + frozen-row legs + live-harness leg);
- `src/` diff is 0.

## Metric review (to be filled in the evidence file)

Whether the primary metric proved right; any Bird Strike sibling channel
(`the birds tear at it for N.`, same side-effect shape, 8–12/round) is
OUT of scope for this fix — zero bird lines exist on the frozen band —
and is filed as a follow-up finding, not folded in unproven.
