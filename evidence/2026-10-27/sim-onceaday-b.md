# sim-onceaday-b — day-roll-aware once-a-day prechecks (loop-B run fleshout-loop-b-20261028T0330Z)

Axis: food-economy. Arm: the once-a-day residual left by
sim-refusalprecheck-b (landed on master). Prereg:
evidence/2026-10-27/sim-onceaday-b-prereg.md (committed as
efa320c04 BEFORE any judged probe or game change — binding).

## The change (one mechanism, two entries, precheck-only)

src/js/abilityActions.js, +40/-4 lines: a pure-read predictor
`_onceADayPostPaymentDay` plus a once-a-day leg appended to the
two existing ABILITY_ACTION_PRECHECKS entries, AFTER their
audience leg (impl order preserved):

- war_cry.challenge: refuse when s.challengeDay equals the
  PREDICTED post-payment day.
- intimidating_presence.end_it_before: refuse when s.postureDay
  equals the PREDICTED post-payment day.

The predictor mirrors the payment/tick code exactly (code-read
before any judged probe): both actions cost {time_min: 5} ->
3 ticks via COST_HANDLERS.time_min; tickAction rolls the day
iff dayTicks + 3 >= 512, and no-ops entirely under a fight, a
nested tick, or game-over. So the post-payment day is
day+1 iff dayTicks+3 >= 512 (and no fight/nested tick/over),
else the current day — with payment ticks derived from the
action's own data cost, not hardcoded. Fail-open: if the action
def cannot be read at all, the precheck passes through rather
than guessing a refusal. No impl text, cost, or dedup changes;
no other src/js file touched. The stale prior-arm comment
("once-a-day deliberately NOT prechecked") was updated to
describe the new day-roll-aware state.

Why a naive flag===day check would be wrong (proven again by
this run's baseline): at dayTicks 509, payment rolls the day,
so the tap IS the new day's dare/posture and succeeds. The
predictor lets those through and refuses only taps whose
payment cannot roll the day.

## Verdict: GO — clean prereg GO on all four legs

- Leg (a) NON-BOUNDARY REFUSAL TIMING: GO. 32/32 pilot
  instances (R13/R14 at dayTicks 100, R15/R16 at dayTicks 508,
  x 8 seeds) refuse PRE-payment: result false, day unchanged,
  dayTicks unchanged, kcal unchanged (the silent 40 kcal tier
  burn is gone), refusal sentence present. Button state on the
  conversation-partner fixtures (R15/R16) flips enabled->disabled
  with the once-a-day reason (see metric review 3 for the
  explicit-target probe caveat).
- Leg (b) BOUNDARY SUCCESS INVARIANCE: GO. R9/R10/R19/R20
  (flag preset, dayTicks 509) succeed byte-identically
  before/after on result, day crossing (1->2), ticks (509->0),
  kcal, flags (stamped to the new day), and narration — the
  full night transcript is identical, line for line. The
  button read on R19/R20 stays enabled, which is the
  discriminating proof against a naive check (a naive
  flag===day precheck would disable these buttons and refuse
  these taps).
- Leg (c) PRIOR-ARM INVARIANCE: GO. Fixture-by-fixture diff
  (before.json vs after.json, all 160 pilot rows): exactly 32
  rows moved, and all 32 are the intended leg-(a) fixtures
  (R13/R14/R15/R16). The other 128 rows are identical on every
  compared field, including flags. The only content difference
  on moved rows is the standard precheck wrapper suffix on the
  refusal line (see metric review 1).
- Leg (d) POLICY DET-GATE: GO on both instruments.
  Sweep-compare (competent, 60d, seeds 9981-9988): per-seed
  rows identical before/after except the run label and the
  generation timestamp; headlines won 0/8, median survival 60
  (at cap), max wave 3, national 0%, vests 0, deliberations/day
  21, identical death-cause shares. Balanced panel (§15):
  compare decision "review_required" with every paired metric
  delta exactly 0 across all 26 rows (see metric review 2).
- Confirm band (pilot GO, fresh seeds 9991-10002): assert mode
  PASS, all 240 fixtures, exit 0. Dump:
  evidence/2026-10-27/sim-onceaday-b-corpus/after-confirm.json.

## Before/after numbers — pilot (seeds 9981-9988, 160 fixtures)

Before-run (unmodified code, dump mode):
evidence/2026-10-27/sim-onceaday-b-corpus/before.json.
After-run (assert exit 0 + dump):
evidence/2026-10-27/sim-onceaday-b-corpus/after.json.

| fixture | BEFORE (unmodified) | AFTER (prechecks) |
| --- | --- | --- |
| R13/R14 (flag, dayTicks 100) | result false, day 1->1, ticks 100->103, kcal 5000->4960 | result false, day 1->1, ticks 100->100, kcal 5000->5000 |
| R15/R16 (flag, dayTicks 508, convo) | result false, day 1->1, ticks 508->511, kcal 5000->4960, button ENABLED (availOk true) | result false, day 1->1, ticks 508->508, kcal 5000->5000, button DISABLED with once-a-day reason |
| R9/R10/R19/R20 (flag, dayTicks 509) | result true, day 1->2, ticks 509->0, kcal 5000->2360, flag stamped to day 2 | identical, every field, every seed |
| R17/R18 (no flag, dayTicks 508) | result true, day 1->1, ticks 508->511, kcal 5000->4960, flag stamped to day 1 | identical, every field, every seed |
| R1/R2/R3/R11 (world-state refusals) | pre-payment refusals (prior arm) | identical |
| R4/R5/R6/R7/R8/R12 (successes) | successes crossing the day | identical |

The baseline also re-proves the predictor's straddle: 508+3 =
511 does not roll (refusal), 509+3 = 512 rolls (success) — one
tick apart, opposite outcomes, exactly as predicted. The
R15/R16 before-run button state (enabled, then the tap refuses
after paying) is the player-facing lie this arm removes: the
button now tells the truth before the tap.

## Wall numbers (judged policy band only)

Competent, 8 seeds, 60d death-aware, identical before/after:
national 0/8, table 0/8, wins 0/8, wave 4-5 reach 0/8 (max wave
3), median survival 60 AT CAP (7 villages survived to the
60d cap; seed 9983 village-lost day 12), max 60, vests 0,
arcs max 3. Probe fixtures carry no wall numbers (single
day-1 setups, not villages) and none are estimated for them.

## Sense read (SENSE-TESTING LAW — read end-to-end, plain words)

Seed 9981, R15 challenge with a conversation partner, flag
already set today, tap at dayTicks 508:

- BEFORE: one line — "You already threw down a challenge
  today. The village is still talking about it — another one
  just looks desperate. (Issue Challenge — once a day.)" The
  sentence is honest about the refusal but silent about the
  price: 3 ticks and 40 kcal quietly left with the tap, and
  the button had looked available before the tap. The player
  is told no, and charged anyway.
- AFTER: the same sentence, now with the standard refusal
  wrapper — "...just looks desperate. (Issue Challenge)" —
  and nothing taken: no ticks, no kcal, no day. The button
  beforehand reads disabled with that same reason, so the
  player need not tap to learn it. A refusal now reads as a
  refusal, not as a receipt for a small invisible charge.

Seed 9981, R19 boundary challenge: the after transcript is
the before transcript, line for line — a whole night
happening (the bank burning, the village meal, villagers
returning with food, a hurt villager, couples lingering,
a technique learned, dawn) and then the dare landing on the
new day, "Witnessed." The boundary tap still plays as a
public moment on a new day, not as a refused tap. That
unchanged night is the proof the predictor did not overreach.

## Village assessment (what the judged band shows)

The same early-game picture as the prior arm, before and
after, which is exactly what an identity gate should show for
a change that only re-times refusals: max wave 3, no national
reach, no table, no wins. Seven of eight villages hold to the
60d cap; one (seed 9983) is lost on day 12. Deaths are
dominated by villager combat (51) and monster combat (19) —
the world kills villagers in fights, not the refusal change.
Nothing in this band taps challenge / end_it_before through
useAbility under competent policy (COMPETENT_TALK off by
default), which is why the gate is an identity gate: the
change cannot move these headlines, and it does not.

## Metric review (binding section — doubts for the NEXT run, not re-scores here)

1. WRAPPER SUFFIX (same class as the prior arm's R3 note):
   pre-payment refusals read "...desperate. (Issue
   Challenge)" / "...legend. (End It Before It Starts)"
   instead of the impls' "...(Issue Challenge — once a
   day.)" / "...(End It Before It Starts — once a day.)".
   Reason text identical; the standard useAbility wrapper
   replaces the impl's own suffix. Not a leg failure (leg (a)
   requires the refusal sentence present, which it is), but
   stated, not smoothed over.
2. PANEL DECISION LABEL: "review_required" is the panel's
   standing label when descriptive/insufficient metrics exist,
   not a movement verdict — every paired delta is 0, as in the
   prior arm. Reported verbatim above; the leg (d) criterion
   (rows match seed-for-seed) is met on both instruments.
3. BUTTON-PROBE CAVEAT (disclosed, minor prereg wording gap):
   the prereg's leg (a) says "button read with the fixture's
   own target" — but _actionAvailable hardcodes target=null
   when calling prechecks, so no probe can carry an explicit
   target. The button-state proof therefore rests on the
   conversation-partner fixtures (R15/R16 refuse-disabled with
   the once-a-day reason; R19/R20 boundary enabled), where the
   probe's audience resolution matches the tap's. The tap-level
   pre-payment proof — the binding part of leg (a) — holds for
   ALL non-boundary fixtures, explicit ones included. A future
   test revision could thread a target through
   _actionAvailable, but that is a harness change, not a game
   change, and was not smuggled in here.
4. PREDICTOR SCOPE (maintenance note, not a failure): the
   predictor covers the cost handlers that exist today — only
   time_min advances the clock; kcal/hp never do, and turn is
   spent after dispatch in combat, where tickAction no-ops
   anyway. If a future cost handler advanced the clock, the
   predictor would need the same extension. The fail-open rule
   (unknown def -> pass through) bounds that future risk to a
   post-payment refusal, never a regressed success.
5. CANON GAP (carried forward, not invented): no canon doc
   covers ability-action refusals or once-a-day prechecks
   (CANON.md read first; SYSTEMS.md, TIME-ECONOMY.md,
   DIRECTIVES.md grepped — no hits). This arm mirrors shipped
   code, not a design doc. If Steve wants the once-a-day rule
   itself canonized (why one dare/posture a day, and why the
   boundary tap counts as the new day's), that doc does not
   yet exist.

## Convergence line

onceaday — day-roll-aware prechecks for the two once-a-day
social actions (challenge, end_it_before): pilot legs
(a)+(b)+(c)+(d) GO, confirm 240/240 GO, policy det-gate GO on
sweep-compare + panel (all deltas 0). The once-a-day residual
from sim-refusalprecheck-b is CLOSED: non-boundary taps refuse
pre-payment, boundary taps succeed unchanged, and the button
tells the truth in both cases. No further seeds would change
the verdict: the mechanism is proven on identical fixtures
including the one-tick straddle (508 vs 509), and the gate is
an identity gate.

## Files committed in this run

- src/js/abilityActions.js (predictor + two precheck legs only)
- scripts/test-onceaday-b.js (new; prior script untouched)
- evidence/2026-10-27/sim-onceaday-b-prereg.md (efa320c04,
  before any judged probe)
- evidence/2026-10-27/sim-onceaday-b.md (this file)
- evidence/2026-10-27/sim-onceaday-b-corpus/before.json
  (pilot before, 160 rows, unmodified code)
- evidence/2026-10-27/sim-onceaday-b-corpus/after.json
  (pilot after, 160 rows)
- evidence/2026-10-27/sim-onceaday-b-corpus/after-confirm.json
  (confirm after, 240 rows, seeds 9991-10002)
- evidence/2026-10-27/sim-onceaday-b-corpus/detgate-before.json
  + detgate-after.json (sweep-compare, competent 8x60d;
  identical except label + timestamp)
- evidence/2026-10-27/sim-onceaday-b-corpus/panels-before/panel.json.gz
  + panels-after/panel.json.gz + panels-compare.md/.json
  (balanced panel; cases/ caches NOT committed, per §15)

## Infrastructure notes (for the coordinator, not hidden)

- safe-commit.sh index clobber hit on BOTH commits this run
  (prereg + game change): the commits themselves were correct
  (verified via git show --stat + hash-object matches), only
  the main index lied (staged deletions/modifications of files
  byte-identical to HEAD). Repaired both times with
  git update-index --add --cacheinfo from the HEAD blob, then
  verified git status clean + git diff HEAD empty. No ref
  surgery, no resets, no force flags.
- The EPERM flap noted at run start did not block any write in
  this run: all commits, dumps, and panel builds landed on
  first attempt. No retry loop was needed.
- Worktree left clean (only committed work); no other trees
  touched; loop A trees and the sim-outflowzero-b branch
  untouched.
