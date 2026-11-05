# sim-pantryspoil-a — unit count in the pantry spoil line (Loop A, food-economy / narration)

Verdict: **GO — LAND.** The pantry spoil line now states the unit
count on every removal, pilot and fresh-seed confirm alike.
Lever commit 90b959147 ([needs-eyes], narration change).

Worker: sim-pantryspoil-a, run fleshout-20261105T1215Z. Base:
master f2238ed19 (sweepcount lever e578c47e1 already in history).
Prereg: `evidence/2026-11-05/sim-pantryspoil-a-prereg.md`
(commit 4b7df4aa6), committed BEFORE any judged sim. Instrument:
`scripts/test-pantryspoil-a.js` (shared `scripts/sim-harness.js`
kit, one seed + one stage per node process; TAG=before|after).
Corpus: `evidence/2026-11-05/perseed-pantryspoil-a/` (52 JSON
files: pilot band 15376–15383 × Stage A/B × before/after = 32,
plus 2 delayed-day before + 2 delayed-day after files, plus
confirm band 15410–15417 × Stage A/B after = 16).

## Parent finding (sim-findings.md #1758)
The dawn sweep line now states the unit count on every removal
(sim-sweepcount-a, 16/16 events), but the pantry spoil line
names its stack without a count — separate channel/voice.
This arm builds ONLY the count insertion in that channel.

## Change (one line + comment, count insertion only)
`src/js/food.js` `sweepSpoiled()`, the pantry loop (line 2693):
the removed stack's name is now prefixed with its unit count
when units > 1, mirroring the pack sweep's
`((it.units || 1) > 1 ? it.units + ' ' : '') + name` pattern:

> "The village threw out spoiled stores: Smoked fish,
> 3 Muscadine Grapes, 5 Foraged food. ... (pantry)"

Singular stacks (units 1 / undefined) keep their existing
wording with no count — verified directly: a real x1
"Foraged food" stack prints bare ("5 Foraged food, Foraged
food"). No rewording of the form-naming, no change to the
`new Set` dedup, no change to `spoilVoiceLine` itself, no
change to the pack `Overnight,` line, the corpse-rot line, or
any other spoil line. VOICE ONLY: no mechanic, no timing, no
RNG draws — `spoilVoiceLine` keeps its exact
one-`_beatCast`-draw-per-call discipline (findings #263/#264
det-gate), proven below. No gates, prices, deed bars, or other
systems touched. Commit carries [needs-eyes] (narration change).

Canon: docs/PRESERVATION.md prescribes the preservation ladder
and "spoiled meat is discarded honestly" but no spoil-line
wording — the form-naming is established (sim-spoilname-a, then
sim-sweepcount-a); this arm adds ONLY the unit count to the
pantry channel. No canon doc covers the pantry line's wording;
the exact wording is the worker's call, documented here, for
Steve's eyes.

## Pilot numbers (matched before/after, band 15376–15383)
Primary metric (prereg): share of pantry-spoil removal events
whose Stage-A pantry line states the unit count ("<n> <form>"
adjacent to EACH multi-unit form name), GO ≥ 0.80,
denominator = removal events, not seeds.

| Seed | Bonus | Day-10 removal | Count named before | Count named after |
|------|-------|----------------|--------------------|-------------------|
| 15376 | 0 | Foraged food ×5, Grapes ×3, Smoked fish ×1 | NO | YES / YES (A+B) |
| 15377 | 0 | same fixture (+ real Foraged food ×2 in B) | NO | YES / YES |
| 15378 | 0 | same fixture | NO | YES / YES |
| 15379 | 0 | same fixture (+ real Foraged food ×4 in B) | NO | YES / YES |
| 15380 | +6 | none at day 10 | n/a — no event | n/a — no event |
| 15381 | 0 | same fixture (+ real Foraged food ×2 in B) | NO | YES / YES |
| 15382 | 0 | same fixture (+ real Foraged food ×1 in B) | NO | YES / YES |
| 15383 | +2 | none at day 10 | n/a — no event | n/a — no event |

Stage A: **0/6 before → 6/6 after**. Stage B (real `endDay()`
dawn path): 0/6 → 6/6, identical lines, DAWN header present,
player alive, dayAfter 10 on all 8 seeds, exactly one sweep
call per run. Delayed-day follow-ups at the true spoil days
(15380 @ day 16, 15383 @ day 12): before 0/2 → after 2/2, count
travels with the delayed event. Pilot total: **8/8 removal
events, 14/14 stage-runs** — GO threshold (≥ 0.80) met with
margin. Form-naming intact: 6/6 before and after (no regression
on the spoilname verdict). Singular wording intact: 8/8 after
(no "1 Smoked fish" anywhere; the real x1 stack prints bare).
Survivor intact: Dried beans ×4 @30 still in the pantry after
every run. Sweepcount regression guard: the pack `Overnight,`
line still states "12 unknown berries" on every removal run
before and after (14/14 after).

Real-pantry bonus (unplanned, in-corpus): Stage B runs sweep
real pantry stacks the village itself deposited on day 9 —
extra "Foraged food" stacks (×1/×2/×3/×4) spoiled alongside
the fixture on 4 pilot + 5 confirm seeds. The line names each
with its own count ("5 Foraged food, 2 Foraged food"), so the
same-name multi-stack case is covered by live data, not just
the fixture. The `new Set` dedup never collapsed a pair in
this corpus (all same-name pairs differed in units); the
identical-name+units collapse case from the prereg remains
unobserved and open for a future arm.

## Fresh-seed confirm (band 15410–15417)
Freshness-checked against ALL dated preregs
(`evidence/*/sim-*-prereg.md`, 0 mentions of any of the eight
seeds) plus the forbidden-band lists (99201–99208 et al. named
in the 11-04 preregs; none of 15410–15417 appears) plus all
evidence markdown (one hit only: `pantry=15413` in
evidence/2026-10-19/windowsurvive-taxonomy.md — a pantry kcal
figure, not a seed naming). 8 fresh seeds, Stage A + Stage B,
after-code only: 8/8 remove at day 10 (no bonus-delayed seed
in this band), all 16 removal stage-runs state the count.
Confirm total: **8/8 removal events, 16/16 stage-runs**.
Combined after: **16/16 removal events, 30/30 stage-runs**
state the count; before was **0/8 events**.

## Det-gate (no RNG-draw-count change)
- RNG draws during `sweepSpoiled()`: identical before/after
  on every seed (teaching branch 1 draw, knows-smoking branch
  0 draws, delayed no-event 0 draws — the branch, not the
  change, decides; speakers byte-identical before/after per
  seed in both stages).
- Next-3 `Math.random()` values after the sweep: identical
  before/after on all 10 Stage-A before/after pairs (8 day-10
  + 2 delayed). No draw added, none moved.
- `spoilVoiceLine` untouched; `_spoilMutterSpeaker` untouched.

## Sense test (transcript read, not just counts)
Real Stage-B dawn transcript (confirm seed 15417, which also
carries a real extra stack):

> — DAY 10 DAWN — The world wakes. Animals are active.
> Overnight, 12 unknown berries went bad — beyond saving. You
> leave it for the flies.
> Fresh food keeps days, not weeks. Smoke it over a fire to make
> it last.
> The village threw out spoiled stores: Smoked fish,
> 3 Muscadine Grapes, 5 Foraged food, 3 Foraged food.
> Merveille mutters: "Should've smoked that. Fresh stuff keeps
> a day or two on the shelf — the smoke rack is right there."
> (pantry)

The count reads naturally — "3 Muscadine Grapes" and
"5 Foraged food" sit where a player expects the quantity, the
form names are intact, the singular "Smoked fish" keeps its
bare name, and the mutter still lands after the loss. The
same-name repeat ("5 Foraged food, 3 Foraged food") reads as
two separate lots thrown out, which is what happened. No
clanking, no grammar break. Both voice branches are covered in
the corpus: the teaching mutter (knowsPreserve=false) and the
condensed smoke-rack mutter (knowsPreserve=true, seeds 15379 /
15383 / 15415) — counts ride identically in both.

## Proof / counts
- Instrument runs: 52 corpus files, 0 crashes, 0 write
  failures (flap-resilient write with read-back verification;
  closing audit: anchorOk 52/52, Stage-B integrity 24/24 —
  endDayOk, dayAfter 10, player alive, exactly one sweep call,
  DAY 10 DAWN header present).
- Fixture assertions: anchorOk 52/52 (Stage A and B alike).
- `node scripts/check.js --quick`: run after the change: **280
  passed, 10 failed in 1474s** — see "check.js failures" below.
  The beat-identity suite (`scripts/godpath/
  test-main67-beat-identity.js`, which pins `spoilVoiceLine`
  teaching/condensed paths and mutter rotation) passes on the
  changed code with 0 failures (run directly, rc=0).

## check.js failures (10 named, none caused by this change)
Run: 280 passed / 10 failed / 1474s. Each of the 10 was re-run
individually against the UNMODIFIED baseline (food.js restored
from HEAD; the change re-applied byte-identical afterwards,
blob e48a57e92, `node --check` passes):

- Pre-existing on baseline (rc=1 there too, same failure):
  `godpath/test-measurement-proof-update.js` (retained neutrality
  proof vs current inputs — the known staleness any Game-input
  change trips; it already fails at this base, so no
  `balance-proof-update.js` refresh is owed by this arm),
  `godpath/test-measurement-workflow.js` (same retained proof),
  `godpath/test-mobile-combat-cadence.js` (Continue wrap),
  `godpath/test-occupation-panels.js` (real CLI workflow),
  `godpath/test-phone-frame-proof.js` (stale phone receipt:
  index.html),
  `test-establishment-r20-fixes-20261020.js` (next-day voices:
  expected 2, got 1).
- 120s-cap artifacts (pass alone on baseline given time):
  `godpath/test-trust-observer-neutrality.js` (rc=0),
  `test-synergy-stall.js` (rc=0),
  `test-capable-bot-20261014.js` (40 passed, 0 failed) — each
  was killed by check.js's 120s per-script timeout, not by an
  assertion.
- Parallel-load flake: `godpath/test-measurement-cache-flags.js`
  failed in check.js but passes 4/4 alone on the baseline AND
  4/4 alone on the changed code (rc=0 both) — not attributable
  to the change.

**None of the 10 is caused by this one-line voice change.**
(Side note: a mid-run /tmp wipe removed the check.js log and
both /tmp copies of the changed food.js; the change was
re-applied byte-identical from the recorded diff and all
attribution re-runs after that point logged to
~/workspace/tmp-logs/. Do not keep run-critical files in /tmp.)

## Metric review (for the NEXT run, never a mid-run re-score)
The primary held: conditioned on removal, count-named is the
honest rate, and the bonus-delayed seeds were correctly kept
out of the denominator (reported as their own delayed row).
No revision proposed. Two notes for the next narration arm:
(1) the identical-name+units `new Set` collapse case is still
unobserved — a fixture with two same-name same-units pantry
stacks would settle whether the line under-reports it;
(2) Stage B now demonstrably sweeps real day-9 pantry
deposits alongside the fixture, so a future arm can drop the
planted fixture and measure the pantry line on fully organic
spoilage.

## Reachability / village assessment
Not applicable as a lever run: no balance changed, no content
reachability question opened. The village assessment is the
fixture itself — a fresh day-8 camp with a stocked pantry —
and the dawn now tells the player exactly what the village
threw out, in both number and kind. The wall numbers are
carried from the 1041Z run (scale-onramp CONVERGING, NOT
converged; full seat 0, wave 5 0) — nothing re-measured on a
narration corpus.

## Left unjudged / open
- Steve-eyes call on the wording itself (commit flagged
  [needs-eyes]): "5 Foraged food" is the worker's phrasing,
  mirroring the sweep line; Steve can overrule the placement
  ("5× Foraged food", trailing "(×5)", aggregated
  "7 Foraged food" for same-name lots, etc.).
- The identical-name+units dedup collapse (prereg known
  limitation) is unobserved and unfixed; same-name lots with
  different units are named separately and honestly.
- No telemetry-deviation check run: no lever panel, no
  before/after panel numbers to compare (narration-only change
  on a fixture instrument, not a balance lever — same
  precedent as sim-sweepcount-a).

## Convergence
food-economy / narration: converging (this item fixed;
#1758 moves to `fixed` on landing). Scale-onramp stays
converging, NOT converged (untouched by this arm).
