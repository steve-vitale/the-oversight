# sim-depositkeep-b — PREREGISTRATION (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1305Z,
axis food-economy, arm sim-depositkeep-b. Worktree sim-depositkeep-b,
branch sim-depositkeep-b. Answers the coordinator's depositgate-keep
arm, following sim-scholaraway-b (evidence/2026-11-01/
sim-scholaraway-b.md): under competent play the scholar sleeps at
home 22–30 of 30 evenings yet unloads exactly 0 kcal into the pantry
on 8/8 seeds — a KEEP-THRESHOLD zero, not a presence zero. The
homecoming haul block keeps the first 2,000 kcal (raised to 6,000
while the depositgate is engaged), and the largest finished-food pack
at any return was 3,720 kcal — below the keep on every return.
Scholar food reaches the pantry through donations (1,360 / 605 /
1,300 kcal on three seeds), not unload.

DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New files only: this
prereg, the depositkeep trace driver, the depositkeep analyzer, the
proof test (including positive controls), evidence, censuses/corpus.
scripts/sim-harness.js and scripts/policies/competent.js are REUSED
VERBATIM. This worker does NOT push, bump, verify live, or merge into
master; the coordinator merges. Status to coordinator: committed on
branch, pending coordinator merge.

## Canon note (read first)

docs/CANON.md read. NO canon doc defines DEPOSITGATE or the
homecoming keep as a system — the mechanism below is read from the
code's own comments (game.js returnToVillage haul block ~8749–8793:
KEEP_KCAL 2000, raised to 6000 when _depositGateEngaged(); only
finished food counts — kcalEach > 0 AND NOT isUnprocessed; kept food
stays in the pack, donate-able later via donateToPantry), not
invented canon. docs/PRESERVATION.md (food ladder) is adjacent, not
the keep.

## Question

With the gate OFF (DEPOSITGATE=0, keep 2,000), does scholar unload
become nonzero on the same seeds where the gate-on keep (6,000)
zeroed it — i.e. is the keep threshold, not scholar presence, the
live scholar-supply lever? The observed gate-on packs (up to 3,720
kcal finished food) predict nonzero unload on big-pack days at a
2,000 keep.

## Primary metric

Per seed, over a 30-day competent-policy window with DEPOSITGATE=0:
total scholar unload kcal = sum of depositPantryPieces kcal into the
home village recorded inside a non-death-path returnToVillage call
(same unload rule as scholaraway, belt and braces: in-return flag OR
a deposit stack matching /returnToVillage/). Per-return records
also carry: finished-food pack kcal at return (finished = kcalEach >
0 AND NOT isUnprocessed, the haul block's own definition),
total pack kcal, pack composition (item name / units / kcalEach /
finished flag), gate-engaged read at return (must be false with the
gate off), unload kcal, donation kcal (depositPantryPieces kcal
inside a donateToPantry call — a SEPARATE flag, since donate and
unload share the deposit helper; the two buckets never mix), and
the return's own say lines (for the unload/keep voice and the
pantry-cap line).

## GO threshold (judged exactly against this header)

GO iff nonzero unload on >= 6/8 pilot seeds (vs the published 0/8
gate-on baseline). A miss is NO-GO, never re-scored against a
friendlier metric mid-run (e.g. never re-scored on "nonzero unload
on any seed", "total kcal > 0 across the band", or "donations rose").
If the metric proves wrong, that goes under "metric review" and the
revision applies to the NEXT run, never to this one.
- Pilot GO -> confirm on 12 FRESH seeds 51109–51120, same policy,
  same 30d window, DEPOSITGATE=0. Confirm bar, fixed now: nonzero
  unload on >= 9/12 seeds (the same 75% proportion as the pilot bar).
  If confirm misses, the claim is DOWNGRADED in the evidence — the
  pilot numbers are never re-scored against a friendlier bar.
- Pilot NO-GO -> killed-at-pilot: NO confirm spend, land evidence
  only with the NO-GO verdict.

## Baseline (cited, not re-run — seed list verified before citing)

The gate-on baseline is the published scholaraway pilot:
seeds 51101–51108, competent policy, 30d, DEPOSITGATE=1, unload
exactly 0 kcal on 8/8 seeds, donations 1,360 / 605 / 1,300 kcal on
seeds 51102 / 51105 / 51106. This arm reuses the SAME seed list, the
SAME policy file, and the SAME 30d window, so the seed list matches
the cited baseline exactly. No fresh gate-on control is run: the
baseline is citable as published, and re-running it would spend
seeds to reproduce a number already in evidence. What is NOT
identical: gate-off trajectories diverge from gate-on twins beyond
the keep, because DEPOSITGATE=0 also disables meal-share easing and
haul holdbacks. This is therefore a gate-off census on identical
seed inputs compared against a published gate-on census — NOT a
pure keep-only contrast. The keep is the named mechanism for unload
(the haul block's keep is the only gate-dependent term in the
unload path), and per-return gate-engaged reads (must be 0) plus
pack data attribute the unload result to the keep arithmetic. Any
claim beyond that is over-claiming, and the evidence will say so.

## Pilot gates (before any judged verdict)

STOP (no confirm, report as the result) if any gate fails:
  (1) POSITIVE CONTROLS: the proof test's constructed homecomings
      are green BEFORE any judged sim — (a) gate off, 3,000-kcal
      finished pack, returnToVillage: exactly one homecoming
      recorded, unload kcal > 0 (1,000 expected), gate-engaged
      read false; (b) gate off, 1,500-kcal finished pack: homecoming
      recorded, unload exactly 0 (the keep swallows it — proves the
      recorder distinguishes unload from no-unload, not just that
      it can read nonzero); (c) donate path: a donateToPantry call
      records donation kcal in the donate bucket and zero in the
      unload bucket (proves the shared deposit helper is split
      correctly). A pilot zero without proven controls is suspect,
      not a result.
  (2) COMPLETE CAPTURE: every pilot seed yields full evening
      snapshots (map coords, haven coords, playerAtHaven value all
      non-missing) plus a say-line capture, and every return record
      carries a finished-pack figure. Missing data on any seed =
      the instrument is blind there; stop.
  (3) INSTRUMENT NEUTRALITY: the driver contains no travelTo,
      returnToVillage, eat, donateToPantry, or other state-moving
      call in the judged path (wrappers count only; direct calls
      live ONLY in the proof test, never in the driver). Verified
      by code read, stated in evidence.
  (4) GATE-OFF CHECK: gate-engaged reads false on every judged
      return. Any true read = the env contract was violated; stop
      and report, do not judge.

## Horizon + why

30 days, death-aware: villages that die stop simulating (no fixed
200d; a dead village contributes its days-alive only, flagged, never
padded; +10d tail max is moot — runDays stops at engine ending).
30d matches the scholaraway window exactly, so unload numbers are
comparable seed for seed against the cited baseline, and keeps the
band inside the early game where the scale wall bites. A longer
window is a NEXT run's question, not this one's.

## Seeds and policies

Pilot seeds (reuse scholaraway, for seed-for-seed comparability):
51101, 51102, 51103, 51104, 51105, 51106, 51107, 51108.
Confirm seeds (only if pilot GO): 51109–51120 (12 fresh seeds).
Policy: competent ONLY (scripts/policies/competent.js, verbatim).
Env contract (FATAL if violated):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
  POLICY=competent, DAYS=30
  COMPETENT_STANDING_HOME, COMPETENT_ROUTE_AROUND,
  COMPETENT_TRIPHOME_ROUTE_AROUND, WOODCARRY, WOODWARM,
  MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING
  must NOT be 1.
Note: DEPOSITGATE=0 is the arm itself (sim control value), not a
policy change — no policy file is edited, and the competent base
defaults are otherwise untouched.

## Also reported (not judged)

- Pack composition at each return (finished vs unprocessed shares,
  top items by kcal) — tests whether gate-off packs even contain
  finished food above the keep, or whether the pack is unknowns
  regardless of the gate.
- Donation kcal per seed — tests unload/donation substitution: if
  unload rises while donations fall by a similar amount, the gate
  moved food between channels rather than adding supply.
- Survival / collapses, wave reach, median survival in-window.
- A sense-test read of one homecoming transcript (a nonzero-unload
  return if any exists, else the largest-pack return): does the
  unload-or-keep moment read sensibly to a player?

## Balanced panel (§15) — declared inapplicable, with reason

No panel compare is built for this arm. §15 panels compare a base
panel against a lever-applied panel on identical seeds through the
panel's standardized observer/scorecard/cohort rows; this arm
applies NO game-code lever and its primary metric is a custom
homecoming census (unload kcal per return), not a panel metric, and
its baseline is a PUBLISHED census, not a freshly run panel. The
gate-off-vs-published-baseline table is reported directly in the
evidence file instead. No compare is fabricated.

## Wall numbers — measurement limit stated before judging

A 30d pre-seat window CANNOT measure national / table / wins: those
are late-game states. The evidence will say so plainly and will NOT
claim wall movement. What is reported: wave reach (maxWaveUnlocked
per seed), median/max survival (days alive), collapse count, all
in-window.

## Sense test (SENSE-TESTING LAW)

Read one homecoming transcript end to end (the return's own say
lines plus the surrounding day lines): judge whether the
unload-or-keep moment reads sensibly — the keep voice, the unload
voice, the pack the scholar actually carried — or whether the
numbers and the narration disagree. Quote lines in evidence.

## Metric review (pre-run notes; completed in evidence after judging)

- Homecoming counting follows the scholaraway rule (Game.over false
  at entry) for comparability with the cited baseline. The
  scholaraway metric review recommends ALSO excluding endDay
  failure-branch calls (game.js:32198) in the next census; this
  driver therefore captures the return-call stack and reports a
  sensitivity count excluding stack-flagged endDay calls, but the
  JUDGED count stays the scholaraway rule so the baseline comparison
  is apples-to-apples. A one-call distortion on a death day cannot
  move a >= 6/8 bar on its own.
- Donation and unload share depositPantryPieces; the driver splits
  them by call-site flag (inReturn vs inDonate), never by amount or
  by guessing. Deposits outside both flags are ignored, not
  attributed.
- If gate-off packs turn out to be unknowns-dominated (finished
  pack ~0 on most returns), the NEXT run's question is the pack
  composition lever (identification / processing), not the keep —
  and this run's GO bar may prove to have measured pack luck, not
  keep arithmetic. That doubt is recorded here BEFORE judging; it
  does not change this run's bar.
