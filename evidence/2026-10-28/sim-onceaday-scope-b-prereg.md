# sim-onceaday-scope-b — PRE-REGISTRATION (measurement arm, zero src/js changes)

Run: fleshout-loop-b-20261028T0530Z, axis food-economy, arm: once-a-day
predictor scope + `_actionAvailable` target=null button state.
Tracker blank: 2026-10-28 0330Z blank 4 / 0444Z blank 3. Prior arm
sim-onceaday-b (2026-10-28) landed a day-roll-aware once-a-day precheck in
src/js/abilityActions.js only; this arm measures what is still open and
changes NO game code. If a fix looks obvious, it is reported, not landed.

## Canon read first

docs/CANON.md, then the standing rules it carries: "No silent actions"
(every action narrates honestly, including failures) and "If you don't know,
it doesn't show" (knowledge gates surfaces). No canon doc covers
ability-action refusals or pantry ledger accounting generally (2026-10-28
tracker blank 5) — this evidence says so instead of inventing canon.

## Questions (the blank, in two legs)

(a) PREDICTOR SCOPE — when the game/UI predicts whether a once-a-day action
is available or what it costs, does that prediction itself advance the clock,
burn ticks, or burn kcal? Pin, per predictor path, whether it is pure (no
state change) or clock-advancing, with fixture numbers. Name every
once-a-day action the predictor covers vs misses.

(b) TARGET=NULL — what does `_actionAvailable` (or its UI caller) do when
target is null: what button state results (enabled/disabled/absent/
misleading), and is that state honest under the no-silent-actions rule?
Fixture it, don't just read the code.

## Predictor paths to pin (code audit, function names; line numbers drift)

- `_onceADayPostPaymentDay` (src/js/abilityActions.js, private): the only
  day-roll predictor. Called only by the `war_cry.challenge` and
  `intimidating_presence.end_it_before` prechecks. Claims "Pure reads only".
- `_actionAvailable` (abilityActions.js): button-state path. Hard-calls
  every precheck with target=null (`preFn(this, null)`); wrapped by
  foodPower.js with the hunger gate (`foodPowerGate`, a kcal read).
- `activatableAbilities` (abilityActions.js): the UI button list. Sets
  `target: 'none'` on every row and calls `_actionAvailable` (target null).
  Cost shown is the data cost verbatim; no cost computation runs here.
- `useAbility` (abilityActions.js): tap path. Calls the same precheck with
  the REAL tap target (the bar passes none, so undefined in practice).
- `godActivatables` (godverbs.js) / keepsake activatables (keepsakes.js):
  call `_actionAvailable('god'/'keepsake', act)` with no target; no
  god/keepsake precheck keys exist, so the predictor never runs there.
- `_legacyActivatables` (abilityActions.js): legacy buttons (time_skip 1/day,
  echo_location 1/day) bypass `_actionAvailable` entirely; they read the
  pre-action day flag directly.

## Fixtures (scripts/test-onceaday-scope-b.js, seeds 9981, 9982)

Reuses the sim-onceaday-b fixture pattern (sim-harness loadGame + setupGame,
grant ability, roster partner, convo fixture, dayTicks positioning), adapted
— not copied blindly — to the scope questions:

- P1 purity: repeated predictor-path reads (10x `_actionAvailable` +
  3x `activatableAbilities`) at dayTicks 508 and 509, flag set and unset,
  for challenge and end_it_before. Record day/dayTicks/kcal before/after
  EVERY call batch. Pure iff all deltas are 0.
- P2 tap contrast: boundary (509) and non-boundary (508, 100) taps for
  challenge/end_it_before, recording day/ticks/kcal before/after, so the
  predictor numbers sit next to the real payment numbers (3 ticks, 40 kcal
  tier burn on success per the prior arm).
- P3 missed-coverage probe: `water_breathing.dive_deep` (time_min 30 -> 15
  ticks, once per tile per day) at boundary dayTicks 500 with today's
  tile flag set: button read + tap. If the pre-payment-day precheck refuses
  a tap the post-payment-day impl would accept, that is a missed-coverage
  finding, stated as a blank, not fixed.
- P4 target=null matrix: `_actionAvailable` (forced null) for every
  target-sensitive action — challenge, end_it_before, animal_ken.calm_beast,
  mediator.mediate_dispute, field_dressing.dress_game — plus the
  target-independent daily gates (scream_cheese.scream, cheese_wheel.hurl,
  green_thumb.ask, water_breathing.dive_deep) — in states where the action
  WOULD succeed with a real target, and in states where it would not.
  Record the button state verbatim (ok + why string). Judge each honest or
  dishonest in plain words under the no-silent-actions rule.
- P5 legacy buttons: time_skip / echo_location button state via
  `activatableAbilities` with flag set/unset (pure-read check by state
  comparison only; no tap, since legacy tap paths are out of scope).

## Primary metric and GO threshold (binding)

Primary metric: diagnostic completeness, two legs.
DIAG-GO iff BOTH:
(a) predictor cost scope is pinned with before/after ticks+day+kcal numbers
    for challenge and end_it_before on at least two seeds, AND
(b) the target=null button state is documented with a fixture result and
    judged honest or dishonest in plain words.
Otherwise DIAG-NO-GO: document exactly which leg failed as a blank, do not
re-score against a friendlier metric mid-run.

## Horizon, seeds, policies

- Horizon: none — this is a fixture measurement, not a survival sim. No
  fixed-day band, no death-aware horizon applies; the "horizon" is one
  tap per fixture at a positioned dayTicks.
- Pilot band: NOT run. A pilot band (8 seeds) is only needed when the
  prereg judges a band effect; this prereg judges fixture-level scope and
  button state, so the budget goes to fixtures instead. No meaningless band
  is padded in.
- Seeds: 9981, 9982 (the onceaday-b seed family; two seeds satisfy leg (a)).
- Policies: none (fixture harness, not a policy sim). No wall numbers are
  expected; if no band runs, the report says so rather than inventing them.
- Change: zero src/js changes. Evidence + one proof script only.

## Metric review

(To be filled at evidence time. Doubts about the metric itself — e.g.
whether "honest" should be judged against the UI tap path only, or against
any programmatic caller — go here, and any revision applies to the NEXT run,
never to re-score this one.)
