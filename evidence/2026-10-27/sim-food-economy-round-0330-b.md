# sim-food-economy round 0330-b — coordinator evidence (loop B, run fleshout-loop-b-20261028T0330Z)

Axis: food-economy (second axis; loop A live on scale-onramp the whole run,
claim fleshout-20261028T0320Z, arms sim-w4damage-a + sim-w4tbhp-a, NOT touched).
Two arms, both LANDED, merged locally pending ship. No push, no bump, no live
verification (ship-loop line).

## Arm 1 — sim-onceaday-b: day-roll-aware once-a-day precheck (backlog 1293, FIXED)

Prereg 7ae65e117, game change 8118c0be1, evidence bcf137c40 (after rebase onto
loop A's landed master b1eb04456; zero file overlap, proof re-run green
post-rebase and on merged master).

What changed, in plain words: when a player taps a once-a-day challenge or
posture button, the game used to charge the tap first and only then discover
it was already used today — quietly eating a few ticks and 40 food-energy on
a tap that then refused. Now the button knows before charging: if the tap
cannot roll the day over, it refuses up front and takes nothing; if the tap
does roll the day over, it is genuinely tomorrow's challenge and still works.
The change is in src/js/abilityActions.js only (+40/−4): a pure-read predictor
(day rolls iff dayTicks + 3 >= 512, mirroring the cost/tick code exactly,
fail-open on unknown defs) plus a once-a-day leg on the two existing precheck
entries (war_cry.challenge, intimidating_presence.end_it_before). No impl
text, cost, or dedup changes. No canon doc covers ability-action refusals /
once-a-day prechecks (CANON.md + SYSTEMS/TIME-ECONOMY/DIRECTIVES grepped, no
hits) — stated in the arm evidence, nothing invented.

Before/after, judged against the prereg (pilot seeds 9981–9988, confirm
9991–10002):
- Leg (a) non-boundary refusal timing: GO. 32/32 pilot instances (dayTicks
  100 and 508) refuse pre-payment: day, ticks, kcal all unchanged — the silent
  40 kcal tier burn is gone. Buttons on conversation fixtures flip
  enabled→disabled with the once-a-day reason (before, the button lied:
  enabled, then the tap refused after paying).
- Leg (b) boundary success invariance: GO. Flag preset at dayTicks 509
  succeeds byte-identically before/after (day 1→2, ticks 509→0, kcal
  5000→2360, flag stamped to day 2, full night transcript identical
  line-for-line). Boundary buttons stay enabled — the discriminating proof
  against a naive flag===day check.
- Leg (c) prior-arm invariance: GO. Before/after diff over all 160 pilot
  rows: exactly 32 rows moved, all the intended leg-(a) fixtures; other 128
  rows identical on every field. Straddle fixtures prove the predictor:
  508+3=511 refuses, 509+3=512 succeeds, one tick apart.
- Leg (d) policy det-gate: GO on both instruments. Sweep-compare (competent,
  60d, seeds 9981–9988): per-seed rows identical except label/timestamp.
  Balanced panel (§15): decision `review_required` with every paired delta
  exactly 0 across 26 rows (same label caveat as the prior arm — descriptive /
  insufficient statuses, not movement).
- Confirm band: assert mode PASS 240/240, exit 0. Coordinator proof on
  merged master: PASS 160/160, exit 0.

Sense read (seed 9981, non-boundary refusal): before, one refusal sentence
that silently charged 3 ticks + 40 kcal behind an available-looking button;
after, the same sentence with the standard `(Issue Challenge)` wrapper and
nothing taken, with the button disabled beforehand. Boundary tap still plays
as a full night plus a public "Witnessed" dare on the new day, unchanged.

Metric review (disclosed in arm evidence, not hidden): (1) refusal lines gain
the standard `(Action Name)` wrapper in place of the impls' own
`(… — once a day.)` suffix — reason text identical, same class as the prior
arm's R3 note; (2) panel `review_required` label on zero deltas; (3) prereg
wording gap: `_actionAvailable` hardcodes target=null, so button-state proof
rests on conversation-partner fixtures (tap-level pre-payment proof holds for
all fixtures including explicit-target ones); (4) predictor scope note — only
`time_min` advances the clock today; a future clock-advancing cost handler
would need the same extension, bounded by fail-open; (5) canon gap carried
forward (no doc covers this rule).

Wall numbers (judged det-gate band only, competent 8×60d): national 0/8,
table 0/8, wins 0/8, wave 4–5 reach 0/8 (max wave 3), median survival 60d at
cap (7 held to cap; seed 9983 lost day 12), vests 0, arcs max 3. Deaths
dominated by villager combat (51) and monster combat (19), unchanged. This is
a refusal-timing fix, not a wall mover, as expected.

Telemetry deviation check on the det-gate corpus: 3 LOUD lines (national
12→0, table 16→0, wins 16→0), the known WINSEAT-baseline vs det-gate-fixture
artifact class — baseline NOT rolled, no exiled line, no new investigation.

## Arm 2 — sim-outflowzero-b: zero-record outflow paths (backlog 1283, FIXED)

Prereg 011c41836, evidence eceb39e0a (after rebase onto journey-social r62
master 1418ebb8e; zero file overlap, proof re-run green post-rebase and on
merged master). Zero src/js files modified; measurement only, reusing
scripts/stockdoors-capture.js UNCHANGED (which folds the driedhunt
_removePantryKcal door in as `remove-pantry-kcal`).

What was open: five pantry outflow paths had recorded zero events on the
stockdoors band. Alien raids were already closed by driedhunt. This arm
closes the remaining four — and it did NOT close any of them from band zeros
alone: every path fired on scripted fixtures on both fixture seeds (9820 +
9850, identical) with capture exact to 0 kcal against an independent pantry
snapshot.

Per-path verdicts (prereg bar: scripted fire on both fixture seeds + capture
exact to 0 kcal + counted band account):
- Light Fingers lifts: CLOSED. Fixture 2u Rice × 200 = 400 kcal; record 400
  == snapshot 400, inventory +400. Band: calls 0, records 0 — counted:
  competent never calls `useAbility` for thief (policy grep this run).
- Event takes: CLOSED. Feed fixture 600/600 exact; trade fixture (rope, 250
  ask) 300/300 exact — whole-unit over-removal, honest actuals. Band: calls
  0, records 0 — counted: competent never calls feed/tradeRiverTrader.
- Bulk takes: CLOSED. Fixture 1 Rice + 1 Dried beans = 350 kcal; record 350
  == snapshot 350, inventory +350. Band: calls 0, records 0 — counted:
  competent calls only single `takeFromPantry`.
- Child pantry eats: CLOSED. Fixture 1 unit, 150 kcal (first kcal>0 stack),
  hunger 80 → 50 (−30); record 150 == snapshot 150. Band: calls 0, records
  0 — counted by census: 0 children in 96 roster slots (ages 19–69, youngest
  19); `nestedChildCalls` 0 on all seeds.

No confirm band spent, per the pre-registered rule (confirm only for a path
with ≥1 unscripted event; none had any). Coordinator proof on merged master:
ALL FIXTURE CHECKS PASSED, exit 0, identical fixture summary on both seeds
(lift 400, evfeed 600, evtrade 300, bulk 350, child 150).

Sense read: clean lift, seed 9820 (same on 9850): "The food disappears.
Magic. (It's not magic. Nobody saw. Light Fingers.)" — ledger agrees exactly:
2u Rice out of the pantry, 2u Rice into the pack, 400 kcal. Bulk pack:
"Packed: 1 Rice, 1 Dried beans. (350 kcal, 1.0 kg)" — items, kcal, weight all
match the ledger. Child eat: "<name> eats from the pantry." — small sentence
for a small act, 150 kcal gone, hunger −30. Caveats disclosed in arm evidence:
the child fixture's subject is an age-overridden adult (no roster child
existed on either fresh game), so its announce still reads "maybe 20s" — a
fixture artifact, NOT a claim about real children. A wild child eat and a
caught lift (both fixture lifts landed clean) remain unobserved, though
neither blocks the verdicts.

Metric review (disclosed in arm evidence, not hidden): the prereg's F1
wording ("method returns success") is wrong for bulk: `takeFromPantryBulk`
returns null ON success (its success signal is the "Packed:" narration).
The first fixture run caught this (pantry −350, record 350, inventory +350,
return null); the fix keeps the bar's substance — bulk F1 is now Packed
narration PLUS pantry decrease, never the return value alone. Proposed
revision for the next prereg: define F1 per path as "the method's own success
signal," named per path in advance. No tolerance was widened, no leg dropped.

Wall numbers (unscripted band, competent-nofeast, 100d, seeds 9850–9857):
national / table / wins 0/8. Wave 4 on 1/8 (9853), wave 3 on 6/8, wave 2 on
1/8, wave 5 on 0/8. Median survival 100d (8/8 survived to horizon). Deaths 23:
arena 13, ambush 3, monster 3, choir toad 1, expedition 1, wound 1, alien 1;
zero starvation. Panel exception stated explicitly (measurement only, no
lever/game change; corpus is census rows with no panel-ingest mode; no panel
faked).

Telemetry deviation check on the outflow corpus: 3 LOUD lines (national
12→0, table 16→0, wins 16→0, n=8 files), investigated same-run by the worker
and accepted by the coordinator as band composition, not a regression — the
stockdoors comparator band is 0/20, reproduced at 0/8 here, and wave-4 reach
improved (0/20 → 1/8). Baseline NOT rolled, no exiled line.

## Village assessment, in plain words

Two quiet honesty fixes, both about the game telling the truth about food.
First, a button that used to let you tap, take your food-energy, and then say
"no" now says "no" before taking anything — and a tap that genuinely belongs
to tomorrow still works, even at the very last tick of the day. Second, the
pantry ledger now accounts for every way food can leave without a meal: a
thief's lift, a trader's take, a bulk pack, a child's snack. Nothing in this
run moves villages toward the national table or the win — the wall numbers
above are flat, and that is honest: these arms fix trust in the food system,
not the scale on-ramp. The village that emerges from the bands is one that
survives to the horizon (100d on the outflow band) but still never reaches
wave 5 or a table win.

## Blanks filled or documented

- FILLED (backlog 1293): once-a-day taps now refuse pre-payment, day-roll-aware.
- FILLED (backlog 1283): with driedhunt's alien raids, all five stockdoors
  zero-record paths are now accounted for.
- DOCUMENTED, still open: (1) cultivate fresh-setup hall gate (backlog 1281)
  — the next food-economy blank in tracker order; (2) a wild child eat needs
  a births band (starting rosters hold no children); (3) a caught lift's
  trust narration is unobserved; (4) the once-a-day predictor's clock-advancing
  cost scope and the `_actionAvailable` target=null button-state note;
  (5) no canon doc covers ability-action refusals or pantry ledger accounting.

## Infrastructure

- Run-start EPERM flap blocked the outflowzero worktree registration
  (~03:36Z: checkout write failures, then a packed-refs write failure on
  branch cleanup). No ref surgery, no forced retry: the onceaday arm ran
  first, the flap cleared by ~04:20Z, the stale branch (zero unique commits,
  tip 3264dbb80) was deleted, and the outflow tree registered cleanly on the
  new master. The flap did not block any worker write after that.
- Safe-commit index clobber hit all worker commits on both arms (commits
  verified correct via `git show --stat` + hash-object matches; only the main
  index lied) — repaired via HEAD-blob cacheinfo each time, same as prior runs.
- Master moved under the run three times (loop A 0320Z landing, journey
  establishment r50, journey social r62) — both arms rebased clean (zero file
  overlap both times), proofs re-run green post-rebase and on merged master.
- Loop A trees and claim NOT touched; sibling trees with uncommitted changes
  (panel-contract-rulings, journey2-social, sim-wallwounds-a, sim-w4convert-a,
  sim-seatpath-a) NOT touched. Main tree clean at closeout. Merged locally,
  pending ship. No push, no bump, no live verification (ship-loop line).

food-economy stays converging (NOT converged): two backlog items are now
closed on measured evidence, but the scale wall is untouched by this axis and
the cultivate hall gate remains open. scale-onramp stays converging
(untouched except loop A's own landed round). Claim deleted; lock deleted.
