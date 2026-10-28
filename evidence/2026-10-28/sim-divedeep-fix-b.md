# sim-divedeep-fix-b — day-roll predictor extended to dive_deep

Run: fleshout-loop-b-20261028T0630Z, axis food-economy.
Prior run: evidence/2026-10-28/sim-onceaday-scope-b.md §3 (group C proved
the gap; this run is the named fix). Prereg:
evidence/2026-10-28/sim-divedeep-fix-b-prereg.md (committed before any
after-measurement; commit 23aafa5e).
Proof script: scripts/test-divedeep-fix-b.js (ALL CHECKS PASS, exit 0).
Fix commit: see below (pending coordinator merge; no push, no bump, no
live check).

## Verdict: GO — all three pre-registered legs hold

(a) Boundary false refusal fixed. Flag-set dayTicks-500 dive (500+15 >=
    512) now succeeds as tomorrow's dive on both fixture seeds, matching
    flag-unset behavior exactly: day 1 -> 2, dayTicks 500 -> 0, flag
    stamped on the NEW day, salvage in pack.
(b) Genuine same-day reuse still refuses. Flag set, dayTicks 100 (no
    day-roll pending): button disabled, tap refuses pre-payment,
    day/ticks/kcal all unchanged (0/0/0).
(c) 8-seed pilot band (competent policy, 100d death-aware cap, identical
    seeds before/after) completes 8/8 with no crash and no new refusal
    class; wall numbers identical before/after (see §2).

## 1. The fix (one precheck site, abilityActions.js only)

`water_breathing.dive_deep`'s precheck now keys its once-per-tile-per-day
flag on `_onceADayPostPaymentDay(game, 'water_breathing', 'dive_deep')`
instead of the pre-payment `s.day`. The predictor reads the action def's
time_min 30 -> 15 ticks and returns day+1 exactly when dayTicks + 15 >=
512 (and no fight / nested tick / game-over), mirroring what the impl
sees after payment. If the def is unreadable the predictor returns null
and the precheck falls back to the pre-payment day — baseline behaviour,
never a guessed refusal. No other precheck, ability, or file touched:
challenge/end_it_before prechecks, calm_beast, and every other ability
are byte-identical (verified by the regression guard below, and the
diff is one hunk in one file).

## 2. Before/after numbers (identical seeds)

### Fixtures — group C re-run, seeds 9981 (creek@4,0) and 9983 (creek@3,0)

| Case | BEFORE (pre-fix) | AFTER (fixed) |
|---|---|---|
| C-500-flag (boundary, flag set) | button DISABLED, "Already worked this water today."; tap refuses, 0/0/0 | button ENABLED; tap SUCCEEDS, day 1->2, ticks 500->0, kcal 5000->2200, salvage in pack |
| C-500-noflag (boundary, flag unset) | succeeds, day 1->2, ticks 500->0, kcal 5000->2200 | unchanged: succeeds, same numbers |
| C-100-flag (non-boundary, flag set) | refuses pre-payment, 0/0/0 | unchanged: refuses pre-payment, 0/0/0 |
| Button purity, 10x reads at dayTicks 500 | deltas 0, stable | deltas 0, stable (button now reads ENABLED when flag-set at the boundary — that IS the fix) |

Seed 9982 has no creek/wetland tile (prior arm's documented limit);
dive fixtures rest on 9981 + 9983, same pair design as the prior arm.

### Regression guard — challenge/end_it_before group B, seeds 9981 + 9982

All 12 rows reproduce the prior arm's numbers exactly, both before and
after the fix: B-508-flag refuses pre-payment 0/0/0; B-509-flag succeeds
day 1->2, ticks 509->0, kcal 5000->2360; B-508-noflag succeeds same day
+3 ticks, kcal 5000->4960. The fix did not move its neighbours.

### Pilot band — competent policy, DAYS=100, seeds 9981–9988

Before and after JSONs are identical except the generation timestamp
(diff verified); per-seed outcomes match seed-for-seed:

- Before: 8/8 completed, won 0, median survival 100d, max 100d, max wave
  3, national 0, table 0, vests 0. Deaths: monster:combat 56, monster:
  villager combat 64, player:the arena 15, monster:expedition 11,
  villager:sickness 10, villager:a wound that wouldn't close 6, others
  small.
- After: identical on every field. No crash, no new refusal class, no
  wall-number movement — expected: the fix only unblocks a dive at a
  15-tick boundary window, and the competent policy rarely stands on
  water at dayTicks 497–511 with a flagged tile. The band's job here was
  proving no harm, and it proves exactly that.

Wall numbers (both): national 0/8, table 0/8, wins 0/8, wave 4–5 reach
0/8, median survival 100d. The scale wall is untouched by this fix and
is not claimed otherwise.

## 3. Reachability verdict

Dive Deep's once-per-tile-per-day content was already reachable; the
fix removes a false refusal at one boundary window (a tap that the game
itself would have accepted as tomorrow's dive). No wave, arc, regional,
national, table, or win content changes reachability in either
direction — the band proves it. No content here was decoration, and none
became newly reachable; a narrowly wrong refusal is gone.

## 4. Village assessment (plain words)

No village changed shape: the band's villages are the same villages
before and after, down to the death-cause counts. The competent villages
survive to the 100-day cap at wave 3, lose nobody to the fix, and gain
nothing from it either — because a bot that almost never dives at the
day's last quarter-hour never met the refusal. The one place the fix
matters is the human player standing on a creek at dusk who already
worked that water today: before, the game told them "already worked
this water today" and refused a dive that would have been tomorrow's;
now the button stays live and the dive lands on the new day. That is a
small honesty repair, not a lever that moves the food economy — and the
numbers say so plainly rather than dressing it up.

## 5. Sense note (transcripts read, not just counts)

Boundary dive, seed 9981, flag set for day 1, dayTicks 500, after the
fix — the transcript reads in order:

> — DAY 2 DAWN — The world wakes. Animals are active.
> Franz Jackson reads the sky: frost tomorrow, cold.
> You go down into the cold dark and feel along the bottom. Your lungs
> don't burn — they never do, down here. You come up with stone knife,
> lost by someone, kept by the water, yours now. (Dive Deep)
> (−80 kcal — food becomes water breathing.)

The day turns first, then the dive happens, then the salvage lands in
the pack (stone knife, salvaged: true). The narration is coherent: the
player is not told they worked the water today and then handed
tomorrow's salvage in the same breath — the dawn line separates the two
days, and the dive sentence still reads like a person going under, not
a system granting a token. The refusal sentence, where it still applies
(non-boundary reuse), is unchanged and still true when spoken.

One script bug caught during the run and fixed in the script (not the
game): the purity check initially asserted a flag-set boundary button
must read disabled — that was the pre-fix expectation, written before
the fix's meaning settled. The group C assertions are the authority;
the purity check now asserts only deltas 0 and stability, which is its
actual job.

## 6. check.js --quick: 279 passed, 8 failed — all 8 pre-existing

Full quick run against the fixed tree: 279 passed, 8 failed (1669s).
All 8 failures were re-run against pristine HEAD with the fix stashed
— all 8 fail there too, so none is caused by this change:

- godpath/test-hide-discovery.js (counter butchering lesson)
- godpath/test-measurement-comparison.js, test-measurement-proof-update.js,
  test-measurement-workflow.js (measurement proof currency — the workflow
  one demands a refreshed collector/contract proof whenever inputs move)
- godpath/test-mobile-combat-cadence.js (Continue round wrap)
- godpath/test-occupation-panels.js (CLI workflow)
- godpath/test-phone-frame-proof.js — proven stale before this change:
  52 of its 170 recorded source hashes already differ from HEAD
  (sibling landings moved those files); abilityActions.js was already
  among the differing set before this edit. Refreshing it needs the
  browser receipt flow (phone-frame-proof-update.js), not a hash edit —
  out of this worker's scope, flagged for the coordinator.
- test-establishment-r20-fixes-20261020.js (racks-full voice gate)

No failure touches dive, water, ability prechecks, or the day-roll
predictor.

## 7. What this run did NOT prove (limits, stated plainly)

- Dive fixtures rest on two seeds (9982 has no water tile); the pair
  design (flag-set vs flag-unset at the same boundary) is what makes
  two seeds conclusive, same as the prior arm.
- The band cannot show a food-economy effect because the policy rarely
  dives at the boundary; a human player at dusk is the beneficiary, and
  that path is fixture-proven, not band-proven.
- No balance-panel artifact: scripts/balance-panel.js is a panel driver
  that runs its own harness observations under its own observer — it
  does not ingest sweep-compare JSONs or fixture assertions, so there
  is no panel artifact to attach for this corpus. Stated explicitly
  per the standing panel exception rather than faking one; a full
  panel run would be a different, larger experiment than this
  one-precheck fix's prereg calls for.

## Metric review

- The pre-registered verdict rule held with no re-scoring: legs (a) and
  (b) are fixture-exact, leg (c) completed 8/8 with identical wall
  numbers. No metric proved wrong mid-run.
- Doubt for the NEXT run, not this one: "no new refusal class" in leg
  (c) was judged from the band's summary table (identical death shares
  and completion), not from a refusal log — the sweep summary does not
  carry a refusal counter. A future run that wants refusal-class
  accounting should add an extraMetrics refusal counter to the sweep
  rather than inferring from death shares.

## Commits (branch sim-divedeep-fix-b, no push, no bump, no live check)

- 23aafa5e — prereg (committed before any after-measurement).
- (fix commit — filled in at commit time; see git log.)
- Worktree clean at handoff; all work committed on the branch.
