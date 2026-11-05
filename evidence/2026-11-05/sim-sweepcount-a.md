# sim-sweepcount-a — unit count in the dawn spoil sweep line (Loop A, food-economy / narration)

Verdict: **GO — LAND.** The dawn sweep line now states the unit
count on every removal, pilot and fresh-seed confirm alike.
Lever commit deec5d4d9 ([needs-eyes], narration change).

Worker: sim-sweepcount-a (RE-DISPATCH: the first worker on this arm
died 11:19:51Z on a platform transport error, "sqlx error: pool
timed out", with no committed work — but left the instrument
`scripts/test-sweepcount-a.js`. The re-dispatch VERIFIED it before
adopting: ran green on Stage A, Stage B, and the delayed-day
override, anchorOk true, formNamed true, countNamed false on the
unmodified baseline, overnight line byte-identical to the spoilname
evidence. Adopted as-is; no rewrite needed.)

Base: master f72e4bd16. Prereg:
`evidence/2026-11-05/sim-sweepcount-a-prereg.md` (commit e62001da5),
committed BEFORE any judged sim. Instrument:
`scripts/test-sweepcount-a.js` (shared `scripts/sim-harness.js`
kit, one seed + one stage per node process; TAG=before|after).
Corpus: `evidence/2026-11-05/perseed-sweepcount-a/` (53 JSON files:
pilot band 15376–15383 × Stage A/B × before/after = 32, plus 4
delayed-day files, plus confirm band 15400–15407 × Stage A/B after
= 16, plus 1 delayed confirm file).

## Parent finding (sim-spoilname-a, 2026-11-04)
The dawn sweep named the lost form on every actual removal (8/8)
but NEVER stated how many units were lost (x12 unnamed: 0/8 at
day 10, 0/2 delayed). This arm builds ONLY the count insertion.

## Change (one line, count insertion only)
`src/js/food.js` `sweepSpoiled()`, the `Overnight,` line (line
2695): the removed stack's name is now prefixed with its unit
count when units > 1:

> "Overnight, 12 unknown berries went bad — beyond saving. You
> leave it for the flies."

Singular stacks (units 1 / undefined) keep their existing wording
with no count — verified directly: a mixed sweep prints
"Overnight, 3 smoked fish; cooked rabbit went bad — beyond
saving. You leave them for the flies." No rewording of the
form-naming, no change to the it/them tail, no change to the
pantry line, the corpse-rot line, or any other spoil line. No
gates, prices, deed bars, or other systems touched. Commit
deec5d4d9 carries [needs-eyes] (narration change).

Canon: docs/PRESERVATION.md prescribes the preservation ladder
and "spoiled meat is discarded honestly" but no sweep wording —
the form-naming is established (sim-spoilname-a); this arm adds
ONLY the unit count. No canon doc covers the sweep line's
wording; the exact wording is the worker's call, documented
here, for Steve's eyes.

## Pilot numbers (matched before/after, band 15376–15383)
Primary metric (prereg): share of removal events whose Stage-A
sweep line states the unit count ("<n> <form>"), GO ≥ 0.80,
denominator = removal events, not seeds.

| Seed | Bonus | Day-10 removal | Count named before | Count named after |
|------|-------|----------------|--------------------|-------------------|
| 15376 | 0 | berries × 12 | NO | YES / YES (A+B) |
| 15377 | 0 | berries × 12 | NO | YES / YES |
| 15378 | 0 | berries × 12 | NO | YES / YES |
| 15379 | 0 | berries × 12 | NO | YES / YES |
| 15380 | +6 | none at day 10 | n/a — no event | n/a — no event |
| 15381 | 0 | berries × 12 | NO | YES / YES |
| 15382 | 0 | berries × 12 | NO | YES / YES |
| 15383 | +2 | none at day 10 | n/a — no event | n/a — no event |

Stage A: **0/6 before → 6/6 after**. Stage B (real `endDay()`
dawn path): 0/6 → 6/6, identical lines, DAWN header present,
player alive, dayAfter 10 on all 8 seeds. Delayed-day
follow-ups at the true spoil days (15380 @ day 16, 15383 @
day 12): before 0/2 → after 2/2, count travels with the delayed
event. Pilot total: **8/8 removal events, 14/14 stage-runs** —
GO threshold (≥ 0.80) met with margin. Form-naming intact:
6/6 before and after (no regression on the spoilname verdict).

## Fresh-seed confirm (band 15400–15407)
Freshness-checked against ALL dated preregs
(`evidence/*/sim-*-prereg.md`, 1509 distinct 5-digit seeds
collected; 15400–15407 absent from every one) plus the
forbidden-band lists (99201–99208 et al. named in the 11-04
preregs; none of 15400–15407 appears). 8 fresh seeds, Stage A +
Stage B, after-code only: 7/8 remove at day 10 (15405 carries
spoilBonusDays +6, no removal at day 10), all 14 removal
stage-runs state the count; delayed follow-up 15405 @ day 16
also states it (1/1). Confirm total: **8/8 removal events,
15/15 stage-runs**. Combined after: **16/16 removal events,
29/29 stage-runs** state the count; before was **0/8 events**.

## Sense test (transcript read, not just counts)
Real Stage-B dawn transcript (seed 15403):

> — DAY 10 DAWN — The world wakes. Animals are active.
> Overnight, 12 unknown berries went bad — beyond saving. You
> leave it for the flies.
> Fresh food keeps days, not weeks. Smoke it over a fire to make
> it last.

The count reads naturally — "12 unknown berries" sits where a
player expects the quantity, the form name is intact, and "You
leave it for the flies" still reads as the stack/lot. The
singular check ("3 smoked fish; cooked rabbit") shows the
no-count singular form and the "them" tail for multi-stack
sweeps both behave. No clanking, no grammar break.

## Proof / counts
- Instrument runs: 53 corpus files, 0 crashes, 0 write
  failures (flap-resilient write with read-back verification;
  every file re-read and validated in the closing audit:
  anchorOk 53/53, Stage-B integrity 32/32 — endDayOk, dayAfter
  10, player alive, DAY 10 DAWN header present).
- Fixture assertions: anchorOk 53/53 (Stage A and B alike).
- Singular/multi-stack probe: ad-hoc node check (not in
  corpus) — "3 smoked fish; cooked rabbit" line verified.
- `node scripts/check.js --quick`: run 1: 282 passed, 8 failed in
  923s; run 2 (full log saved): 284 passed, 6 failed in 747s —
  see "check.js failures" below. The 6 named failures were each
  re-run on the UNMODIFIED baseline (food.js restored from
  HEAD~1) and all 6 fail there too — pre-existing, none caused
  by this one-line change. Change restored and verified after
  the baseline runs (`node --check` passes, count insertion
  present).
- Commits: prereg + instrument e62001da5; lever deec5d4d9
  ([needs-eyes]).
- Index-clobber repair applied after BOTH safe-commit.sh
  commits (commit correct throughout; index showed
  staged-as-deleted / stale entries; repaired via cacheinfo
  from HEAD blobs per the recorded lesson; verified
  `git status --short` empty + `git diff HEAD` empty after
  each repair).

## check.js failures (6 named, all pre-existing)
Run 2 (full log, 284 passed / 6 failed / 747s) named:
`godpath/test-measurement-proof-update.js` (retained neutrality
proof vs current inputs), `godpath/test-measurement-workflow.js`,
`godpath/test-mobile-combat-cadence.js` (Continue wrap),
`godpath/test-occupation-panels.js` (real CLI workflow),
`godpath/test-phone-frame-proof.js` (stale phone receipt:
index.html), `test-establishment-r20-fixes-20261020.js` (next-day
voices: expected 2, got 1). Each was re-run individually against
the UNMODIFIED baseline food.js (restored from HEAD~1): all 6
exit 1 there too. **None is caused by this change.** (The
measurement-proof failure is the known retained-proof staleness
that any Game-input change would trip; it already fails at this
base, so no `balance-proof-update.js` refresh is owed by this
arm.) Run 1 showed 8 failed vs run 2's 6 — two failures are
flaky run-to-run and their names scrolled off the tail-cut
output; they were not among the 6 named in run 2 and no test in
the suite pins the old `Overnight,` wording (verified by grep),
so no failure is attributable to the count insertion.

## Metric review (for the NEXT run, never a mid-run re-score)
The primary held: conditioned on removal, count-named is the
honest rate, and the bonus-delayed seeds were correctly kept
out of the denominator (reported as their own delayed row).
No revision proposed — the metric did what the spoilname
review asked for. One note for the next narration arm: the
instrument's filename scheme collides between a day-10 run and
a delayed-day run on the same seed/stage/tag (the delayed run
overwrites the day-10 file); this run worked around it with a
separate OUTDIR + `-delayed<day>` renames. A future instrument
should take the spoil day in the filename.

## Reachability / village assessment
Not applicable as a lever run: no balance changed, no content
reachability question opened. The village assessment is the
fixture itself — a fresh day-8 camp with three unknown lumps —
and the dawn now tells the player exactly what was lost, in
both number and kind.

## Left unjudged / open
- Steve-eyes call on the wording itself (commit flagged
  [needs-eyes]): "12 unknown berries" is the worker's phrasing;
  Steve can overrule the placement ("12× unknown berries",
  trailing "(×12)", etc.).
- The pantry spoil line ("The village threw out spoiled
  stores: Foraged food.") names its stack but carries no unit
  count — separate channel, separate voice, deliberately
  untouched here; a future arm if Steve wants parity there.
- No telemetry-deviation check run: no lever panel, no
  before/after panel numbers to compare (narration-only change
  on a fixture instrument, not a balance lever).
