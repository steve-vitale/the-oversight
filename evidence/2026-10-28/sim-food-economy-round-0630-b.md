# Loop B coordinator evidence — run fleshout-loop-b-20261028T0630Z (axis food-economy — 3 arms LANDED, all GO, merged locally pending ship)

Loop A live the whole run on scale-onramp (0527Z claim: lingerer-vis /
w4tbkill / fighterconstruct, then a new 0634Z claim: lingerfinish /
sysbond / tbovertime — NOT touched). This run worked food-economy
(converging), taking the 0530Z tracker blanks in order, skipping blank
(1): the home-village birth path is a Steve-call game change (it changes
who lives in Haven) and is NOT implemented here. All three arms are small
game fixes with pre-registered GO thresholds, fixture proof on identical
seeds, and an 8-seed pilot band each. No push, no bump, no live
verification (ship-loop line).

## Arm 1 — sim-divedeep-fix-b (GO, merged 0761aab9b + prereg a71f30481)

Fix: `src/js/abilityActions.js`, `water_breathing.dive_deep` precheck
only — the once-per-tile-per-day flag is now keyed on
`_onceADayPostPaymentDay` instead of the pre-payment day, with fallback
to the pre-payment day if the def is unreadable. Challenge/end_it_before
prechecks, calm_beast, and every other ability untouched (one hunk).
Proof `scripts/test-divedeep-fix-b.js`: ALL CHECKS PASS on the worktree,
post-rebase, and on merged master. Boundary case (flag set, dayTicks
500) now succeeds as tomorrow's dive on both fixture seeds, matching
flag-unset behavior (day 1→2, ticks 500→0, flag stamped on the new day);
genuine same-day reuse (flag set, dayTicks 100) still refuses with
0/0/0. Pilot band 9981–9988 (competent, 100d): 8/8 before and after,
band JSONs differ only in timestamp; wall numbers both sides:
national 0/8, table 0/8, wins 0/8, wave 4–5 0/8, median 100d.
Sense: seed 9981 boundary dive reads "— DAY 2 DAWN —" then a coherent
salvage line, no double-day narration. check.js --quick: 279 passed,
8 failed, all 8 proven pre-existing on pristine HEAD (phone-frame
staleness flagged for the ship loop, not fixed by hand-editing hashes).

Plain words: a player standing on a creek at dusk who already worked
that water today was wrongly told "already worked this water today"
and refused a dive the game itself would have accepted as tomorrow's.
Now the button stays live and the dive lands on the new day.

## Arm 2 — sim-caughtlift-fix-b (GO, merged 98784fc00)

Fix: both caught paths (pantry lift and ordinary take) route the −20
through `bumpTrust(vid, -20, 'caught stealing from the pantry')`
instead of writing `v.trust` directly; `observe()` gains a live
`caught_you_stealing` table entry (theft dims: honest −25, generous
−15, brave −3, competent 0). Narration lines untouched;
`theftConfrontation` still runs after, unchanged.
Proof `scripts/test-caughtlift-fix-b.js`: judged legs all pass on the
worktree, post-rebase, and on merged master. Fixtures seeds 9820 +
9850, both paths: delta exactly −20 (50→30, 400 kcal lift preserved),
narration verbatim, `tele('trust')` event with −20 and the reason, no
other villager's trust moved. Clean lift still 50→50 with zero tele
events; unset-trust caught lift still floors at 0 (so the || 15 vs
|| 10 default minor is numerically invisible for a −20 loss — measured,
not argued; the fix routes through `bumpTrust` as-is with no
pre-seeding). Witness probe (9820): witness rep honest 0→−20,
generous 0→−12, 1 gossip seeded; a fixture with no witnesses correctly
seeds nothing, with tele carrying the trace there. Disclosed side
effect: `bumpTrust`'s milestone drama can now fire at the haven like
every other trust loss; it fired nowhere in fixtures and changes no
number or line.
Pilot band 10420–10427 (competent, 100d): 8/8, no crash, lift calls 0
(competent play never lifts — the expected no-regression signature);
national/table/wins 0/8 both sides; median 100d cap-censored.
MASTER RE-RUN NOTE (see § "Band drift"): the master re-run band shows
wave-4 reach 1/8 (seed 10423 only) vs the worker's 2/8 (10421 + 10423).
Seed 10421 flipped wave 4→3 between the worker's post-rebase proof and
the master proof. The judged fixture legs are identical; the band is a
guardrail and still passes (8/8, wall zeros unchanged). Cause not
adjudicated (intervening changes: the divedeep fix, the barwhy UI
change, and a sibling journey commit — see below); logged in the
findings backlog, not used to re-judge the arm.
Residual, honestly stated (backlog item, needs a design call, not
follow-up code): the convoTopics line "I know about my pack. Hands
where I can see them, next time." still cannot surface from a pantry
lift alone, because it keys on a victim-keyed memory and a pantry lift
has no victim. `remember()` under the player's own id would be a
self-memory no villager's conversation ever reads. Who remembers a
victimless pantry theft is a design call before any work.

Plain words: getting caught stealing from the pantry used to cost
trust on paper but leave no trace anywhere — no record, no witness
effect, no way for anyone to ever bring it up. Now the loss is booked
properly with its reason, witnesses react, and gossip can carry it.

## Arm 3 — sim-barwhy-b (GO, merged 60f873319 + prereg abcdc2372)

Fix: `src/js/app.js` `abilityBarHTML` renders
`<span class="ctx-why"> — {why}</span>` plus the reason in the title on
disabled buttons only (choiceAvailable counts as enabled; no CSS
change); `src/js/abilityActions.js` `_legacyActivatables` rows carry
`why: null` when available and the refusal sentence only when disabled
(named time_skip/echo_location plus the same stale-why pattern in
blood_magic, field_medicine, herbal_remedy, purify, compost_king).
No enabled/disabled state, precheck, cost, or narration text changed.
Proof `scripts/test-barwhy-b.js`: 90 rows (seeds 9981 + 9982, 7
scenarios/seed) — all 50 disabled rows render their why verbatim
(before: 0 of 50); zero enabled buttons carry a stale why (before: 28
enabled legacy rows carried false refusal sentences); availability
parity 0 changes across all 90 rows. Post-rebase dump reproduced the
committed 90-row corpus exactly; master re-run dump reproduced it
exactly again. Render proven by evaluating the real `abilityBarHTML`
source extracted from `app.js` (DOM-only file, stated plainly).
Pilot band 10430–10437 (competent, 100d): 8/8 before and after,
identical seed-by-seed; wins/national/table 0/8, max wave 4, median
100d (one village lost day 35, seed 10431), 169 deaths (monster combat
dominant). Reachability unchanged by design — waves 1–4, Arc III;
wave 5/national/table/win unreached in this band (the known scale
wall, unmoved). Calm_beast deliberately NOT fixed here: still disabled
with "Nothing here to calm." — now visible in a fight, still untrue
about the room. That belongs to the separate targeting arm; this arm
only makes the existing reason visible. The C1-combat scenario in this
arm's proof is that arm's before fixture.
check.js --quick: 279 passed, 8 failed, all 8 reproduce identically on
base code — none caused by this arm.

Plain words: a greyed-out button used to hide why you couldn't press
it — you only learned the reason by wasting a tap. Now the reason
sits on the button itself, and live buttons no longer carry stale
refusal lines from an earlier state.

## Wall numbers (all three bands, pre-seat 100d competent bands)

No band reached national, table, or a win; wave-5 reach 0 everywhere;
median survival 100d (cap-censored) except barwhy's one day-35 village
loss. These bands are guardrails for small honesty fixes, not
scale-wall attempts — the wall is untouched by this axis, as expected.

## Telemetry deviation check

Run on the divedeep band-after JSON against
`hidden_files/telemetry-baselines/scale-wall.json` (metrics
national,table,wins,exiled): 3 LOUD lines (national 12→0, table 16→0,
wins 16→0, n=1 file). Adjudicated as the known regime artifact
(WINSEAT baseline vs pre-seat fixture bands; the band JSON is not a
per-seed telemetry corpus). Baseline NOT rolled, no new investigation.
Panel exception stands (balance-panel.js has no corpus-ingest mode
for fixture/band output); every comparison above is direct on
identical seeds.

## Metric review

- All three preregs judged as written; no metric was re-scored
  mid-run. The caughtlift band's wave-4 count moved on the master
  re-run (2→1, seed 10421) — recorded under "Band drift" above, not
  re-judged, because the arm's primary metric is fixture-based and
  unchanged and the band guardrail (8/8, no crash, wall zeros) still
  passes. Lesson for the next run: when a guardrail band moves on a
  master re-run, name the intervening commits in the evidence the
  same day rather than leaving the flip unexplained.
- No canon doc covers ability-action refusals or pantry ledger
  accounting generally (tracker blank, still open) — stated, not
  invented; the arms applied CANON.md's "no silent actions" rule.

## Infrastructure

- Master moved three times under the run before the merges (sibling
  loop A 0527Z coordinator evidence 3cb5f8b82; this run's own merges;
  sibling journey-landing r64 6eb84f967, betrayal.js/conversation.js
  only, zero overlap with these arms). All three branches rebased
  clean in their own worktrees with proof re-runs green/identical
  (barwhy dump-identical twice); no merge conflicts.
- Safe-commit index clobber hit all three workers' commits (phantom
  staged deletions); each repaired via HEAD-blob cacheinfo and
  re-verified (commit content correct, worktree clean). Coordinator
  evidence commit verified the same way (see below).
- One landing incident class avoided, not suffered: merges and
  releases were never chained — HEAD verified before each release.
- No EPERM flap on .git ref writes this run. No jest (arm proof
  scripts are the attributable verification; check.js --quick run by
  workers, failures proven pre-existing).
- Reap at closeout: active 6/16, all other runs' trees, untouched.
  Main tree clean at closeout. Merged locally, pending ship.

## Browser-proof gap, stated (barwhy arm)

The barwhy arm changes field UI (`abilityBarHTML` in `app.js`), and
the repo's own rules say node campaigns cannot prove a readable,
clickable card — only a real browser pass can. This arm's render proof
is node-side (the real function source evaluated against stubs), which
proves the HTML string, not the phone rendering. The commit carries
[needs-eyes], so Steve's phone check is the feel gate for this one,
and any phone-frame receipt refresh is ship-loop maintenance. The GO
verdict above is for the why-visibility logic and availability parity,
not a claim of browser-proven layout.

## Next blanks, in order

1. Home-village birth path (Steve-call game change, own prereg —
   distant births alone can never reach the pantry door).
2. Calm_beast targeting path or fight-scanning precheck (barwhy
   C1-combat scenario is its before fixture).
3. Pantry-lift convo-line design call (who remembers a victimless
   pantry theft?) — needs Steve's ruling before any work.
4. Band-seed 10421 wave-4 flip across code moves (drift note, not a
   verdict change).
5. No canon doc covers ability-action refusals or pantry ledger
   accounting (still open).

food-economy stays converging (NOT converged): three refusal/ledger
honesty blanks are now closed on measured evidence (one boundary
false refusal, one unbooked trust move, one invisible why reason),
but the scale wall is untouched by this axis and the home-birth gap
remains open as a Steve-call. scale-onramp stays converging
(untouched; sibling loop A live). Claim deleted; lock deleted.
