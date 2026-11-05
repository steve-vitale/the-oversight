# sim-bankadded-a — PREREGISTRATION (binding; committed BEFORE any judged sim)

Run: oversight-flesh-out-loop, run fleshout-20261105T0515Z, arm
sim-bankadded-a, axis food-economy. Worktree sim-bankadded-a.
MEASUREMENT/DIAGNOSIS ONLY: no game-code change, no policy
change, no win-price / deed-gate / food-number change. If the
census proves a genuine bug, this arm STOPS and documents it
as a precise backlog item with its own proposed GO threshold;
it does not build a fix, except a pure instrument fix in its
own scripts (pre-registered here, proven before/after on
identical seeds). Sibling Loop B run never touched; main tree
never touched; hidden_files never touched (coordinator owns
the backlog/tracker/claims). Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via
--ff-only); report 'merged locally, pending ship' readiness.

## Canon read first

docs/CANON.md, docs/PRESERVATION.md (food ladder, spoilage).
No canon doc covers "banked evening food retention" as a
named rule — that still holds, as in all prior bankretain
arms. The engine's documented per-form dawn spoil sweep (a
form whose spoilDay has arrived is swept at dawn, other
forms persist) is the only overnight removal mechanism on
record. This arm does not invent canon.

## Blank

Loop A arm sim-bankretain-substrate-a (run
fleshout-20261104T2230Z, evidence/2026-11-04/
sim-bankretain-substrate-a.md) confirmed retention 3/3 for
CARRIED-source edible food at stranded evenings, but all 3
judged events had bank-added edible delta 0. The narrow
BANK-ADDED-edible case — an evening phase that ADDS edible
food to the bank on a stranded evening, judged at the
following stranded morning — is still unjudged in-stack (the
old band's 15003 day-30 case remains censored). This arm
closes that case or reports INSUFFICIENT-DATA with a full
screen yield. It does NOT rerun the old census unchanged
(the backlog parks a third unchanged rerun): the substrate
change is a BANK-mode screen (below).

## Adopted accounting (from the substrate arm, unchanged)

- Evening record modes come from scripts/policies/
  bankfood-diag.js: 'bank' (clock >= 449 at evening, 2 forage
  presses) vs 'flip' (clock within 80 ticks of 449, walk +
  gather + forage presses to 449) vs 'skip' (never an event).
  Both bank and flip evenings fire ONLY on stranded-away
  evenings (travel-refused / out-of-reach, not at haven).
- Post-bank edible = row.postDailyPack.edibleKcal (canonical
  pack snapshot after the evening phase). Pack-before edible
  = evening record packBefore.edibleKcal. Bank-added edible
  delta = post-bank edible − pack-before edible.
- Judged event (this arm, NARROW): mode 'bank' AND delta > 0
  AND a FOLLOWING MORNING IN-STACK (next loop-day row exists
  AND a firstUpkeep record exists for scholarDay = gameDay +
  1). Otherwise the bank-added evening is CENSORED, with its
  reason reported (no-next-loop-day / no-first-upkeep).
- Source split, recorded per event, never used to exclude:
  'banked' (delta > 0, pack-before edible 0) vs 'mixed'
  (delta > 0, pack-before edible > 0). Carried food (delta 0)
  is NOT a bank-added event in this arm.
- Retention verdict at the first-upkeep (true post-sleep
  morning) snapshot, via the spec-conformant classifier in
  scripts/analyze-bankretain-rerun.js (spoil check precedes
  vanish check): RETAINED (no loss) or RETAINED-SPOIL-SWEPT
  (every shortfall a named per-form dawn spoil sweep) =
  retained; VANISHED (food gone with an unnamed shortfall) or
  PARTIAL-UNEXPLAINED = not retained.
- Morning upkeep's competentEat IS the morning meal for
  accounting (prior arms' mechanism decision): retained-
  then-eaten counts as retained, not vanished. Upkeep eats
  count as morning meals, never as vanished food. Remote
  pantry requisition (havenStoresAccess 'remote') is
  reported per judged morning via the strandnarr analysis
  (pantryDelta / accessValues), never silently netted out.
- Count DISTINCT events (seed + loopDay), never
  leg-instances. A distinct judged event is RETAINED iff
  every judged leg-instance of it is retained; differing
  instance verdicts flag DISAGREED, which fails unanimity.
- Full-transcript rule (from the prior arms' cautions): the
  morning adjudication MUST use the strandnarr full-
  transcript corpus (scripts/strandnarr-trace-b.js, policy
  stack identical to the screen driver, recorder armed),
  never the daily-slice capture of bankfood-trace-b.js
  alone. Upkeep-window meal beats are pattern-kept in the
  trimmed corpus by construction; the numeric first-upkeep
  snapshot is the verdict, the transcript is the narration
  adjudication.

## Primary metric (binding)

Distinct judged BANK-ADDED events (mode 'bank', delta > 0)
retained at the true post-sleep morning, with the retention
verdict (RETAINED / NOT-RETAINED with mechanism) holding on
all of them.

GO threshold for a verdict: >= 3 distinct judged events,
with a unanimous retention verdict (all retained, or all
not-retained with a traced mechanism). Fewer than 3 =
INSUFFICIENT-DATA: report the screen yield (how many
BANK-mode evenings found, how many bank-added, how many
judged, how many censored and why). Do NOT lower the bar
mid-run. Do NOT re-score against a friendlier metric
(e.g. counting flip-mode delta > 0 events, or carried
events, toward the bar) — flip-mode delta > 0 events are
reported as screen context only, never counted toward the
bar. A miss is NO-GO / INSUFFICIENT-DATA, never re-scored.

## Substrate design, chosen up front: BANK-mode screen

- Step 0 (no new sims): RE-ANALYZE the substrate arm's
  guard-variant screen corpus (evidence/2026-11-04/
  sim-bankretain-substrate-a-corpus-guard-variant, seeds
  17001–17024, 60d) with the new bank-added filter
  (scripts/analyze-bankadded.js). Expected from that arm's
  report: 0 bank-added judged events (its 3 judged events
  were all delta 0); the re-analysis verifies that count
  rather than assuming it, and reports any bank-added
  censored events on the final census day.
- Step 1 (pilot block): screen seeds 17025–17032 (8 seeds)
  with bankfood-trace-b.js guard-variant legs (BANKFOOD=1,
  WOODWARM=0, DAYS=60, same env gates as the substrate
  arm), OUTDIR evidence/2026-11-04/
  sim-bankadded-a-screen-guard-variant.
- Step 2 (screen extension): extend in blocks of 8
  (17033–17040, 17041–17048, …) under the same legs until
  cumulative distinct judged bank-added events reach >= 3,
  or until 64 new seeds (17025–17088) are screened. The
  extension blocks are the pre-registered screen itself,
  not a confirm spend: the screen's product IS the yield
  table, and a single empty 8-seed block is the expected
  outcome for a rare-evening pool, not a kill criterion.
  If the cap is reached below 3, stop and report
  INSUFFICIENT-DATA with the full yield table and the
  substrate that would be needed next (a bank-screened
  band pre-filtered on bank-mode evenings, or a
  probe-given-food leg — proposed, not built here).
- Step 3 (census, only for candidate seeds): for every seed
  with >= 1 bank-added event (judged or censored), run
  strandnarr-trace-b.js legs (BANKFOOD=1, WOODWARM=0,
  STRANDNARR=1, DAYS=60, same env gates), OUTDIR
  evidence/2026-11-04/sim-bankadded-a-corpus. Verify
  replication: each screen judged event must reproduce on
  the strandnarr leg with the same seed+loopDay, delta,
  and verdict; any divergence is flagged DISAGREED and
  investigated, never averaged away. Morning narration is
  adjudicated from the strandnarr corpus: upkeep-window
  meal beats naming the bank-added food, the
  bankfoodMorning record, and pantryDelta/accessValues.
  Census cap: 8 candidate seeds (not expected to bind).
- Panel note (§15): scripts/balance-panel.js cannot express
  the nighttravel+woodcarry+woodwarm strand stack, the
  60-day evening census, or an env-gated single-mechanism
  probe (same declaration as every prior strand arm).
  Comparison here is screen vs strandnarr legs on identical
  seeds through the bank-added analyzer, never labeled a
  panel comparison. No game-code change was made, so no
  panel comparison is owed.

## Horizon and policy

60d death-aware horizon (dead villages stop simulating;
the driver runs at most 60 loop-days). Policy: competent-
player policy (nighttravel + woodcarry + woodwarm +
bankfood stack, as in the substrate arm). SENSE-TESTING LAW:
read the morning transcripts for judged events — judge
what the morning record actually says about the banked
food, not just counts.

## New instrument (pure, pre-registered)

scripts/analyze-bankadded.js (new): filters the rerun
analyzer's per-seed events to mode 'bank' + delta > 0,
splits judged vs censored, reports flip-mode delta > 0 as
context, and normalizes strandnarr corpora (whose
firstUpkeeps live inside bankfoodStore) for the same
filter. scripts/test-bankadded-a.js (new): pure tests for
the filter + normalizer on hand-built fixtures (bank vs
flip, delta > 0 vs 0, judged vs censored, banked vs mixed,
strandnarr normalization). No existing script is edited;
no game code is touched. Proof bar: test-bankadded-a.js
green BEFORE any new screen sim runs.

## Metric review (section required in the evidence file)

A miss is NO-GO / INSUFFICIENT-DATA, never re-scored
against a friendlier metric mid-run. If the metric proves
wrong, write it under "metric review" and propose the
revision for the NEXT run.
