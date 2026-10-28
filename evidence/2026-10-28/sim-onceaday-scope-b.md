# sim-onceaday-scope-b — once-a-day predictor scope + target=null button state

Run: fleshout-loop-b-20261028T0530Z, axis food-economy. MEASUREMENT arm:
zero src/js changes. Proof script: scripts/test-onceaday-scope-b.js
(76 rows, PASS on seeds 9981 + 9982; dive pair re-confirmed on seed 9983).
Prereg: evidence/2026-10-28/sim-onceaday-scope-b-prereg.md (committed
before any judged fixture ran).

## Verdict: DIAG-GO

Both pre-registered legs hold:
(a) Predictor cost scope pinned with before/after ticks+day+kcal numbers
for challenge and end_it_before on two seeds (9981, 9982) — see §1.
(b) Target=null button state documented with a fixture result for every
relevant action and judged honest or dishonest in plain words — see §2.
No band ran (per prereg: this judges fixtures, not a band effect), so no
wall numbers are claimed here.

Canon note (as tasked): no canon doc covers ability-action refusals or
pantry ledger accounting generally (2026-10-28 tracker blank 5). The
judgments below use only the two standing canon rules: "No silent actions"
(every action narrates honestly, including failures) and "If you don't
know, it doesn't show."

## 1. Predictor scope — the prediction itself costs nothing

The only day-roll predictor is `_onceADayPostPaymentDay`
(src/js/abilityActions.js, private). It is called ONLY by the
`war_cry.challenge` and `intimidating_presence.end_it_before` prechecks.
It reads the action's `time_min` cost, converts it the same way payment
does (max(1, round(min/2)) ticks), and returns the day the impl will see
after payment — day+1 only when dayTicks + ticks >= 512 and no fight /
nested tick / game-over. Code comment claims "Pure reads only."

Fixture proof (group A: 10x `_actionAvailable` + 3x `activatableAbilities`,
flag set and unset, dayTicks 508 and 509, both seeds — 16 rows):
every single delta is 0. Day, dayTicks, and kcal do not move, and the
button read is identical across all 10 repeats. The prediction paths —
button read, full button list, and the hunger-gate wrapper in foodPower.js
(a kcal read) — are pure. Nothing the UI does to PREDICT availability
advances the clock, burns ticks, or burns kcal.

The real payment numbers, for contrast (group B, both seeds identical):
- Non-boundary flag-set tap (508): refuses BEFORE payment — day, ticks,
  kcal all unchanged (0/0/0). The silent 40 kcal burn the prior arm killed
  stays dead.
- Non-boundary no-flag tap (508): succeeds, +3 ticks (508 -> 511), same
  day, -40 kcal tier burn (5000 -> 4960).
- Boundary flag-set tap (509): succeeds on the NEW day — day 1 -> 2,
  ticks 509 -> 0 (the day roll resets dayTicks to 0; the remainder is
  discarded, not carried), kcal 5000 -> 2360. That -2640 is the day-roll
  metabolism of the TAP, not of any prediction: the predictor rows above
  show 0 at the same positions. A boundary tap is expensive because the
  day turns, not because the button was read.

### Covered vs missed: every once-a-day action in the game

| Action | Daily gate | Predictor covers it? | Why it matters |
|---|---|---|---|
| war_cry.challenge | challengeDay | YES — day-roll-aware | The prior arm's fix; boundary taps succeed |
| intimidating_presence.end_it_before | postureDay | YES — day-roll-aware | Same fix |
| water_breathing.dive_deep | diveDayTiles (tile+day) | NO — precheck reads the PRE-payment day | PROVEN gap (§3): boundary dive refused though the impl would accept it |
| scream_cheese.scream | screamDay | NO, but no gap | Combat turn cost; payment cannot roll a day mid-fight (tickAction no-ops under a fight), so pre-payment day always equals post-payment day |
| cheese_wheel.hurl | _cheeseWheelDay | NO, but no gap | Same combat reason as scream |
| green_thumb.ask | _askPlantsDay | NO, but no gap | kcal-only cost; payment advances nothing, so the day cannot roll under the tap |
| time_skip (legacy button) | timeSkipDay | N/A — legacy path bypasses _actionAvailable | Its action IS the day-part advance; no clock-advancing payment precedes the flag check |
| echo_location (legacy button) | echoDay | N/A — legacy path | Same legacy class; button reads the pre-action flag directly |
| molt.shed_skin | weekly (moltWeek), not daily | N/A | Not a once-a-day action |
| blood_magic (legacy) | 2/day part | N/A | Day-part cap, not a day-roll question |

So the predictor's scope is exactly two actions, and of the remaining
daily gates only ONE has a live boundary problem: dive_deep.

## 2. Target=null button state — what the button says when no target exists

`_actionAvailable` takes no target at all: it hard-calls every precheck
with null (`preFn(this, null)`). The UI button list (`activatableAbilities`)
likewise stamps `target: 'none'` on every row, and the bar's click handler
calls `activateAbility(id)` with NO target — so for the player, the button
read (null) and the tap (undefined) go through the SAME resolution. That
sameness is what makes most of these honest, and its absence is what
breaks calm_beast. One framing fact first: the bar renders a disabled
button plus the action's effect text — it does NOT render the `why`
reason string anywhere. So "honest" below means the enabled/disabled
state is correct; the reason sentences quoted are the internal state,
narrated aloud only when a tap actually refuses.

### war_cry.challenge / intimidating_presence.end_it_before — HONEST (on the UI path)

- With an active conversation partner: button ENABLED (both seeds).
- With no conversation: button DISABLED, verbatim:
  - "A challenge needs someone to challenge — and they have to be here, alive, and one of yours. Talk to them first."
  - "Posturing needs an audience — someone whose dispute you are ending. Talk to them first."
- The catch: a tap given an explicit roster target WITH no conversation
  SUCCEEDS (both actions, both seeds; tail line: "(−40 kcal — food becomes
  war cry.)"). So button and tap disagree for direct calls — but the UI
  never makes such a call, because the bar passes no target. For the
  player, the button tells the truth about what their tap would do. The
  null is not a missing value here; it IS the UI's target. Judgment: honest
  for players, divergent only for programmatic callers. (This is the prior
  arm's known artifact, now pinned rather than re-litigated.)

### animal_ken.calm_beast — DISHONEST on the UI path (new blank)

The precheck looks up the target as a fighter key (`tbFighter(target)`).
With null there is never a fighter, so the button is ALWAYS disabled from
the bar, verbatim: "Nothing here to calm." — even in a scaffolded fight
with a live hostile villager standing adjacent. But a tap given that
fighter's key genuinely attempts the calm (seed 9981, scaffolded fight
following the repo's own direct-`tbfight` test pattern; result true):
> "You try to calm it, but it's too far gone — hunger or fear has it. It's still coming. (Calm — failed.)"

Read that sentence next to the button's: the button says nothing is
here; the tap finds someone there and tries. Because the bar never passes
a target, Calm can never enable from the bar in any fight — the action is
effectively unreachable from the UI, and its disabled state misdescribes
the room. Judgment: dishonest. This is the target=null finding that
matters most, and it is a NEW blank for the findings backlog (the
coordinator appends): calm_beast needs a targeting path or a
fight-scanning precheck, the way challenge/end_it_before scan
conversations.

### Target-independent actions — HONEST (null changes nothing)

- mediator.mediate_dispute: no open disputes -> disabled, "No open
  disputes."; one known open dispute -> enabled. The button follows the
  world, not a target.
- field_dressing.dress_game: empty pack -> disabled, "No game to dress.
  Hunt or trap something first, then break it down clean."; pack with a
  carcass -> enabled.
- green_thumb.ask: flag set -> disabled, "The plants have told you enough
  today."; unset -> enabled. Honest, and no boundary gap (kcal-only cost).
- scream_cheese.scream / cheese_wheel.hurl (out of combat): disabled,
  "Needs a combat turn." — the generic turn-cost check runs BEFORE the
  precheck, so the flag never even figures out of combat, and the bar's
  context filter hides combat actions out of combat anyway. In-combat
  button state was not fixture-proven (it needs a real fight); by code,
  their prechecks read the pre-payment day, but a turn cost cannot roll a
  day, so no boundary class exists for them. Stated as a limit, not a gap.
- god / keepsake actions: the predictor never runs there (no god/keepsake
  precheck keys exist); a synthetic-action probe of `_actionAvailable`
  returns enabled. Nothing daily to predict on those paths.

### Legacy buttons — correct state, one cosmetic quirk

time_skip and echo_location via `activatableAbilities`: flag unset ->
enabled, flag set -> disabled, with state deltas 0 on the list read
(pure). Quirk: their rows carry `why: 'Used today.'` even when ENABLED
(the legacy code sets why unconditionally). Harmless in the bar, which
renders desc rather than why — but any future surface that renders `why`
would show a refusal reason on a live button.

## 3. The missed coverage, proven: dive_deep at the boundary

Dive costs time_min 30 -> 15 ticks and is once per tile per day, but its
precheck keys on the PRE-payment day (`map.px,map.py + s.day`), while the
impl keys on the POST-payment day. Fixture (real creek tiles found by
scanning the map; seed 9982 has no water tile at all, so dive evidence
rests on 9981 creek@4,0 and 9983 creek@3,0 — same pattern on both):

- Boundary, flag set for today, dayTicks 500 (500+15 = 515 >= 512, the day
  rolls): button DISABLED, "Already worked this water today."; tap
  refuses pre-payment, day/ticks/kcal all unchanged (0/0/0).
- Boundary, flag UNSET, same position: tap SUCCEEDS, day 1 -> 2, ticks
  500 -> 0, kcal 5000 -> 2200 — and the flag stamps the NEW day.
- Non-boundary, flag set, dayTicks 100: refuses pre-payment, all deltas 0
  (correct — no day roll is possible there).

The pair proves the only blocker at the boundary is the pre-payment-day
comparison: had the precheck predicted the post-payment day the way
challenge/posture do, the tap would succeed. Sense judgment: the refusal
sentence is true at the moment of refusal (you HAVE worked this water
today) and it is narrated, not silent — but it denies a legal next-day
dive, exactly the class onceaday-b fixed for challenge/posture. No fix
landed here (measurement arm; change zero src/js). Recommended next arm:
extend the day-roll predictor to dive_deep's precheck, same pattern, and
re-run this script's group C as the proof.

## 4. Village assessment (sense-testing, not counts)

No sim band ran, so there is no village to assess this run — and no
villager dialogue was sampled beyond the ability sentences above, which
are the surfaces this arm judges. What the sentences show: the game's
refusal voice is specific and in-character ("The plants have told you
enough today.", "Posturing needs an audience") EXCEPT where the button
state lies about the room — calm_beast's "Nothing here to calm." said to
a player standing next to a hostile villager, and dive's "Already worked
this water today." said to a player whose tap would have made it
tomorrow. Those two sentences are the blanks this arm fills by
documenting, not by fixing.

## 5. What this run did NOT prove (limits, stated plainly)

- In-combat button states for scream_cheese / cheese_wheel (needs a real
  fight; code argument only, §2).
- The calm tap half rests on a scaffolded fight (repo's own test pattern),
  not a live encounter; the button half (null -> refuse) needs no fight
  and is exact.
- Dive evidence is two seeds, not three (9982's map has no creek/wetland
  tile); the pair design (flag-set vs flag-unset at the same boundary)
  is what makes it conclusive despite that.
- No wall numbers: no band ran, per prereg. National / table / wins,
  wave 4-5 reach, and median survival are not reported rather than
  invented.

## Metric review

- The pre-registered verdict rule held: both legs were provable from
  fixtures, and no re-scoring was needed. The two script "failures" on
  the first run were assertion bugs in the new script (case-sensitive
  match on the dive sentence; expecting dayTicks +15 across a roll that
  resets to 0), fixed in the script, after which all 76 rows pass.
- Doubt for the NEXT run, not this one: "honest" was judged against the
  UI tap path (bar passes no target), which is the path players live on.
  Judged against ANY caller (including direct calls with an explicit
  target), challenge/end_it_before buttons would count as misleading
  too. The evidence keeps the two judgments separate so a future run can
  pick either standard without re-running fixtures.
- Proposed revision for the next scope run: fixture in-combat button
  states for scream/cheese via a real fight, and re-run group C after any
  dive-predictor fix lands.

## Commits (branch sim-onceaday-scope-b, no push, no bump, no live check)

- adf0853 — prereg (committed before judged fixtures).
- (this run) — scripts/test-onceaday-scope-b.js + this evidence file.
  Worktree clean at handoff; all work committed on the branch.
