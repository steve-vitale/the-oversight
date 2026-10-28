# sim-onceaday-b — pre-registration (committed BEFORE any judged probe or game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T0330Z,
axis food-economy. Arm: the once-a-day residual left by
sim-refusalprecheck-b (landed on master; evidence/2026-10-27/
sim-refusalprecheck-b.md). Findings backlog line 1293 (2026-10-27):
non-boundary once-a-day taps refuse POST-payment with ticks + a
silent 40 kcal tier burn, while boundary once-a-day taps SUCCEED
because payment rolls the day before the impl checks the flag.

Canon note: docs/CANON.md was read first, then SYSTEMS.md,
TIME-ECONOMY.md and DIRECTIVES.md were grepped — NO canon doc covers
ability-action refusals or once-a-day prechecks specifically. This
arm therefore invents no canon; it mirrors code that already ships
(the two impls' refusal conditions and the payment/tick code), and
says so in the evidence file instead of inventing a design doc.

## The change (one mechanism, two entries, precheck-only)

Extend the two existing ABILITY_ACTION_PRECHECKS entries in
src/js/abilityActions.js — war_cry.challenge and
intimidating_presence.end_it_before — with a DAY-ROLL-AWARE
once-a-day leg, AFTER the existing audience leg (impl order:
audience first, then once-a-day). No impl text, cost, or dedup
changes. No other src/js file changes. Prechecks are pure reads.

### Predictor derivation (code-read, before any judged probe)

- Impl condition (both actions): refuse iff flag === s.day, where
  flag is s.challengeDay / s.postureDay and s.day is read AFTER
  payment (useAbility pays, then dispatches).
- Payment for both actions (src/data/abilities.json): cost is
  {time_min: 5} only. COST_HANDLERS.time_min converts it to
  ticks = max(1, round(5/2)) = 3, paid via game.tickAction(3).
- tickAction (src/js/game.js): no-ops entirely if game.tbfight or
  game._ticking; otherwise adds n to s.dayTicks, then rolls the
  day (s.dayTicks = 0, endDay()) iff s.dayTicks >=
  TIME.TICKS_PER_DAY (512) and !game.over and s.day unchanged
  during the tick. Nested tickAction calls inside the tick are
  blocked by the _ticking guard, so payment advances the clock
  by exactly n ticks and nothing else.
- Therefore the post-payment day is EXACTLY predictable
  pre-payment as:
  postDay = s.day + 1  iff  (s.dayTicks + paymentTicks >= 512
  and !game.tbfight and !game._ticking and !game.over),
  else s.day — where paymentTicks is derived from the action's
  own data cost (time_min -> max(1, round(time_min/2)); no
  time_min -> 0). The precheck refuses iff flag === postDay.
- Fail-open rule: if the action def cannot be read at all
  (broken data), the precheck passes through (no refusal) rather
  than guessing — a pass-through preserves baseline behaviour,
  while a guessed refusal could regress a success. In practice
  useAbility has already validated the def before the precheck
  runs, so this path should never fire.
- Why this is safe where a naive flag===day check is not: the
  naive check refuses boundary taps (dayTicks 509 + 3 ticks =
  512 -> day rolls -> impl would accept as the new day's dare).
  The day-roll-aware check lets those through (flag 1 !==
  postDay 2) and refuses only taps whose payment cannot roll
  the day (flag === postDay === current day).
- Combat-action contrast (why existing naive once-a-day
  prechecks are NOT touched): scream_cheese.scream,
  cheese_wheel.hurl and green_thumb.ask pay turn/kcal costs,
  and tickAction no-ops mid-fight, so their payment can never
  roll the day — flag===day is already exact for them. Only
  the two social, time-paying actions need day-roll awareness.

### Threshold positions (the predictor's straddle test)

Both actions pay 3 ticks, so the roll boundary is dayTicks 509
(509+3 = 512 rolls; 508+3 = 511 does not). Fixtures therefore
cover 509 (boundary success, prior R9/R10), 508 (must refuse
pre-payment — one tick short of the roll), and 100 (mid-day
refusal, prior R13/R14).

## Pre-registered GO legs (binding — a miss is NO-GO, never re-scored)

Pilot seeds 9981-9988 (same as the prior arm, for comparability).
Confirm seeds 9991-10002 (12 seeds, same as the prior confirm
band). Fixture script: scripts/test-onceaday-b.js (new; the
prior script is left untouched and its R13/R14 residual
assertions are superseded by this arm's new assertions).

- Leg (a) NON-BOUNDARY REFUSAL TIMING: every non-boundary
  once-a-day fixture (R13/R14 at dayTicks 100, plus new R15/R16
  at dayTicks 508, flag preset, audience present) refuses
  PRE-payment on 100% of pilot instances: result false, day
  unchanged, dayTicks unchanged, kcal unchanged (no 40 kcal
  tier burn), refusal sentence present. Button read with the
  fixture's own target also disabled with the once-a-day reason.
- Leg (b) BOUNDARY SUCCESS INVARIANCE: boundary fixtures R9/R10
  (flag preset, dayTicks 509, audience present) succeed
  byte-identically before/after on result, day crossing (1->2),
  dayTicks (509->0), kcal, flags (stamped to the new day), and
  narration. Button read with the fixture's target reads
  enabled (payment rolls the day, so the tap is the new day's).
- Leg (c) PRIOR-ARM INVARIANCE: all prior-arm fixtures
  (R1/R2/R3/R11 world-state refusals, R4/R5/R6/R7/R8/R12
  successes) behave identically before/after on result, day,
  ticks, kcal, flags, and narration. The only permitted
  movement is the intended leg-(a) timing change on R13/R14
  (and the new R15/R16 fixtures, which have no before-run
  pre-payment expectation — their before-run behaviour is
  recorded in dump mode and must show the post-payment refusal
  with ticks + 40 kcal burn, proving the residual existed).
- Leg (d) POLICY DET-GATE: competent policy, 60d death-aware
  horizon (villages stop at loss; 60d cap), seeds 9981-9988,
  identical seeds/policies/days before/after via
  scripts/sweep-compare.js (and the balanced panel per
  MEASUREMENT.md §15 if it runs; its decision label is
  reported verbatim with the same caveat as the prior arm).
  Criterion: per-seed headline rows identical (days, end
  reason, wave, arc, rank, table, won). This is an identity
  gate: competent policy does not tap these actions through
  useAbility by default, so nothing should move.
- Leg (e) SENSE: a before/after transcript read for a
  non-boundary refusal (what the player sees, what it costs,
  what it means) is included in the evidence file — not just
  counts. The after-read must show a single refusal line with
  nothing taken; the before-read must show the paid refusal.

GO requires legs (a)-(d) all pass on the pilot AND the confirm
band (12 seeds, assert mode exit 0). Confirm spend only after
a pilot GO. If any leg fails, the arm is NO-GO and lands no
game change (killed arms leave no trace; the prereg and test
script may still be reported as evidence of the finding).

## Horizon + why

Fixture probes are single-tap setups (no horizon question).
The det-gate horizon is 60d death-aware because it matches the
prior arm's gate (comparability), covers the early game where
these social actions live, and never uses a fixed 200d.

## Metric review (binding section — doubts for the NEXT run)

To be filled in the evidence file after judging. Known
candidates, disclosed now, not re-scores: (1) the prior arm's
test-script avail probe (target=null, cleared conversation)
reads disabled for audience reasons on explicit-target
fixtures — this arm adds an avail-with-target probe to isolate
the once-a-day button state; (2) the panel's decision label
caveat from the prior arm (review_required on zero deltas)
applies again if the panel is used.
