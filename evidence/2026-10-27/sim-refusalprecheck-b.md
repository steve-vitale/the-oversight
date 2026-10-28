# sim-refusalprecheck-b — adopted arm report (loop-B run fleshout-loop-b-20261027T2352Z, adopted after the original worker died)

Axis: food-economy. Arm: pre-payment prechecks for the three
post-payment refusal ability taps (challenge, end_it_before, trophy
mark). Prereg: evidence/2026-10-27/sim-refusalprecheck-b-prereg.md
(committed as fbe5d42a8 BEFORE any judged probe — binding, see
"metric review" for the one disclosed deviation).

## Adoption note

Adopted by a fresh worker after the original worker's tree heartbeat
went 55+ min stale. Re-verified on adoption before acting: branch
sim-refusalprecheck-b, 1 commit ahead of base (fbe5d42a8, the
prereg); src/js/abilityActions.js unmodified; test script
scripts/test-refusalprecheck-b.js + before-corpus uncommitted, as
the coordinator reported. The sibling arm sim-raidcapture-b already
landed on master and was NOT redone. No other worktree was touched.

## The change (one mechanism, three entries, world-state only)

src/js/abilityActions.js, ABILITY_ACTION_PRECHECKS, three new
entries (49 insertions, no other src/js change):

- war_cry.challenge: refuse when no audience resolves — explicit
  target, else the active conversation partner (v.conv entry with
  active=true, on the village roster, not the scholar's own id).
  Mirrors the impl code exactly (roster + not-self; NO liveness
  check, per the prereg's deliberate code-not-narration rule).
- intimidating_presence.end_it_before: same audience resolution.
- trophy_room.mark: refuse when state.villageSlain has no type
  with a count > 0. No target-type validation (the impl marks
  the passed type, or the most-killed type, whenever kills exist).

The why strings reuse the impls' refusal sentences, so the
narrated refusal is the same sentence; useAbility appends the
standard " (action name)" wrapper all pre-payment refusals get.
One disclosed wrinkle: the trophy impl's sentence carries no
action-name suffix, so the after-run line reads "...mark it.
(Mark Trophy)" — reason text identical, standard wrapper added
(see metric review). No impl text changes, no cost changes, no
dedup/ledger changes, no direct-impl callers touched. Prechecks
are pure reads (roster lookup, v.conv scan, villageSlain key
scan), so the button-disabled check (_actionAvailable,
target=null) cannot change game state. Intended disabled-state
consequence (prereg): with no active conversation and no
explicit target, the challenge / end_it_before buttons now show
disabled with the audience reason, as mediator/peacemaker
buttons already do when no dispute exists.

## Verdict: GO on the narrowed scope — NOT a clean prereg GO

- Leg (a) WORLD-STATE REFUSAL TIMING: GO. 24/24 prereg leg-(a)
  instances (R1/R2/R3 x 8 pilot seeds) refuse pre-payment: day
  unchanged, ticks unchanged, kcal unchanged, result false,
  refusal sentence present. (Self-target R11 also passes 8/8.)
- Leg (b) SUCCESS INVARIANCE: GO. Every success fixture is
  byte-identical before/after on result, day crossing, ticks,
  kcal, flags, and narration (see diff table). The only
  success-side movement is the intended button-disabled read
  (availOk) explained below — not a game-effect movement.
- Leg (c) POLICY DET-GATE: GO on both instruments (see below).
- Overall: GO for landing the three world-state prechecks.
  This is NOT a clean prereg GO, because the prereg as written
  also expected once-a-day taps to refuse pre-payment, and they
  do not (see deviation). The once-a-day residual stays
  post-payment and is a named next blank, not a hidden failure.
  Judged as NO-GO it would have been only if the delivered
  mechanism itself moved a success path or a headline; it moves
  neither. Landing the world-state prechecks while naming the
  residual is the honest verdict.

## The prereg deviation, confirmed empirically (not taken on faith)

The dead worker's test script encodes a decision that departs
from the prereg: once-a-day is NOT prechecked, only world-state
conditions (audience, kills). First job on adoption was to
confirm it, and the before-run on unmodified code confirms it
exactly:

- Boundary once-a-day (R9/R10, flag preset to the current day,
  tap at the last hour): baseline result TRUE on all 8 seeds,
  day 1->2, flag stamped 1->2. The tap lands on the NEXT day
  (payment rolls the day before the impl checks the flag), so
  it IS that new day's dare/posture — a success, not a
  refusal. A naive precheck (flag === current day) would refuse
  these taps: a success-path regression under leg (b).
- Non-boundary once-a-day (R13/R14, flag preset, tap at
  dayTicks 100): baseline result FALSE on all 8 seeds, day
  unchanged, ticks 100->103, kcal 5000->4960 — the post-payment
  refusal, including the silent 40 kcal foodPower tier burn
  (payActionCost deducts before dispatch; only precheck
  refusals avoid it). This residual is pinned by the test, not
  fixed by this arm.

So leg (a) as written cannot pass for once-a-day: the boundary
case is provably a success, and the non-boundary case cannot be
prechecked without day-roll awareness (a precheck would need
to predict whether payment rolls the day — a different
mechanism from the prereg's "mirror the impl conditions
exactly", and a new design decision, not a quiet extension).
Once-a-day stays post-payment in full. See "metric review".

## Before/after numbers — pilot (seeds 9981-9988, 112 fixtures)

Run before any game change (dump mode, unmodified code):
evidence/2026-10-27/sim-refusalprecheck-b-corpus/before-adopt.json.
Run after the change (assert mode exit 0 + dump):
evidence/2026-10-27/sim-refusalprecheck-b-corpus/after-adopt.json.

Refusal fixtures (R1 challenge no-audience, R2 end_it
no-audience, R3 trophy no-kills, R11 challenge self-target),
8 seeds each:

| fixture | BEFORE (unmodified) | AFTER (prechecks) |
| --- | --- | --- |
| R1/R2/R11 | result false, day 1->2, ticks 509->0, kcal 5000->2360 | result false, day 1->1, ticks 509->509, kcal 5000->5000 |
| R3 | result false, day 1->2, ticks 507->0, kcal 5000->2360 | result false, day 1->1, ticks 507->507, kcal 5000->5000 |

Before, a refused tap at the last hour swallowed the whole
night: the day rolled and 2640 kcal of night meals went with
it. After, the same tap refuses before anything is paid.
Refusal sentences present on all 32 refusal rows before and
after (R3 gains only the standard " (Mark Trophy)" wrapper —
see above). Buttons: R1/R3 read disabled after (availOk
false), as intended.

Success fixtures (R4/R5 explicit-target, R6/R7
conversation-partner, R8 trophy kills, R12 trophy kills +
explicit type), 8 seeds each: result true, day 1->2, ticks
509/507->0, kcal 5000->2360, success narration present,
challengeDay/postureDay stamped to the new day — identical
before and after on every row.

Boundary once-a-day (R9/R10): result true, day 1->2, flag
1->2, success narration — identical before and after. This
is success-path preservation, not a refusal: the arm must
not (and does not) refuse these.

Non-boundary once-a-day residual (R13/R14): result false,
day 1->1, ticks 100->103, kcal 5000->4960 (the 40 kcal tier
burn), once-a-day sentence present — identical before and
after. Still post-payment; named next blank.

Fixture-by-fixture diff (before-adopt vs after-adopt, all 112
rows): 32 rows identical (R6/R7/R8/R12 success rows); 80 rows
moved, all explained — 32 intended refusal-timing changes
(R1/R2/R3/R11) and 48 button-disabled-read-only changes
(availOk true->false on R4/R5/R9/R10/R13/R14, where the test's
avail probe calls _actionAvailable with target=null and a
cleared conversation: with no conversation there is no
audience, so the button correctly reads disabled; the actual
taps with an explicit target or a conversation partner still
succeed or refuse exactly as before). No other field moved on
any row. Say-line content for successes is byte-identical;
refusal say-lines differ only by the night events the
before-run's day roll produced (see sense read) plus the R3
wrapper suffix.

Corroboration: the dead worker's own before dump
(sim-refusalprecheck-b-corpus/before-fixtures.json, left
uncommitted — see leftovers) matches this run's
before-adopt.json on all 112 rows across every compared
field (result, days, ticks, kcal, availOk). Two independent
runs, one baseline.

## Confirm band (pilot GO, fresh seeds 9991-10002)

Assert mode with SEEDS=9991..10002: PASS, all 168 fixtures,
exit 0. Dump:
evidence/2026-10-27/sim-refusalprecheck-b-corpus/after-confirm.json.
Refusals pre-payment, successes unchanged, boundary
once-a-day successes, non-boundary once-a-day residual —
all as in the pilot.

## Leg (c) policy det-gate — competent only, seeds 9981-9988, 60d death-aware

Standard sweep-compare, identical seeds/policies/days, no
COMPETENT_* overrides (defaults in both legs; COMPETENT_TALK
off by default, as the prereg notes):

- BEFORE (pre-change code, temporarily restored, then the
  change restored and re-verified byte-identical by diff):
  evidence/2026-10-27/sim-refusalprecheck-b-corpus/detgate-before.json
- AFTER:
  evidence/2026-10-27/sim-refusalprecheck-b-corpus/detgate-after.json

Per-seed rows are identical on every field except the run
label string itself (my LEVER label, not a game outcome):
days, end reason, wave, arc, rank, table, won, and the
by-policy aggregates match exactly. Headlines (both legs):
won 0/8, median survival 60 (at cap), max 60, max wave 3,
national 0%, vests 0, deliberations/day 21, death-cause shares
monster:combat 19, monster:villager combat 51,
monster:expedition 8, player:the arena 6, villager:sickness 9,
villager:a wound that wouldn't close 5, person:ambush 4,
villager:starvation 3, player:contest 2, villager:monster 2,
player:starvation 1, villager:Choir Toad 1, villager:The
Paparazzo 1.

Balanced panel (MEASUREMENT.md §15): built and validated on
both roots (competent, 8 seeds, 60d; panels-before and
panels-after under sim-refusalprecheck-b-corpus/, panel.json.gz
committed, cases/ caches NOT committed). Compare:
evidence/2026-10-27/sim-refusalprecheck-b-corpus/panels-compare.md
(+ .json). Panel decision, verbatim: "review_required".
That label is NOT a movement signal: every paired metric delta
is exactly 0 with a 0-to-0 interval (win rate 0->0, table entry
0->0, national 0->0, player deaths 1.125->1.125, community
loss 0.125->0.125, and so on across all 26 rows). The panel's
decision rule marks a policy review_required whenever any
metric carries a descriptive / insufficient / not_observed
status by contract (win rate, corpse-weapon access,
nourishment share, bearer counts, ability events, luck
percentiles) — those statuses apply regardless of delta, and
here every one of them sits on a zero delta. The prereg's leg
(c) criterion is headline rows matching seed-for-seed, and
they do, on both instruments. No headline moved; nothing
needed attribution because nothing moved.

## Wall numbers (judged policy band only)

Competent, 8 seeds, 60d death-aware, identical before/after:
national 0/8, table 0/8, wins 0/8, wave 4-5 reach 0/8 (max wave
3), median survival 60 AT CAP (7 villages survived to the
60d cap; seed 9983 village-lost day 12), max 60. Probe
fixtures carry no wall numbers (single day-1 setups, not
villages) and none are estimated for them.

## Sense read (SENSE-TESTING LAW — read end-to-end, plain words)

Seed 9981, R1 challenge with nobody to challenge, before vs
after, same seed and key:

- BEFORE: the refusal sentence comes last, after 22 lines of
  a whole night happening — the bank burning 520 kcal, the
  village meal, villagers coming back with food, someone
  getting hurt, couples lingering by the fire, a technique
  learned, dawn breaking, shop talk, a journal note, a sky
  reading — and only then, "A challenge needs someone to
  challenge... Talk to them first." The player paid a night
  and 2640 kcal to be told there was nobody there. The
  refusal reads as an afterthought to a night the player
  never chose to spend.
- AFTER: one line, nothing else. "A challenge needs someone
  to challenge — and they have to be here, alive, and one of
  yours. Talk to them first. (Issue Challenge)" A person is
  not addressed (there is nobody to address — that is the
  point), a reason is given, and nothing is taken: no night,
  no food, no day. It reads as a refusal now, not as a
  receipt for a wasted night.

The R3 trophy refusal reads the same way after the change:
"no kills recorded yet — hunt something first, then mark it"
with nothing taken. The success taps still read as public
moments (the dare pointed at a named villager, the room
hearing it), unchanged from before.

## Village assessment (what the judged band shows)

The 60d competent villages are early-game villages: max wave
3, no national reach, no table, no wins — the same picture
before and after, which is exactly what a det-gate should
show for a change that only re-times refusals. Seven of eight
villages hold to the 60d cap; one (seed 9983) is lost on day
12. Deaths inside the villages are dominated by villager
combat (51) and monster combat (19) — the world kills
villagers in fights, not the refusal change. Nothing in this
band taps challenge / end_it_before / trophy mark through
useAbility under competent policy (COMPETENT_TALK off by
default), which is why the gate is an identity gate: the
change cannot move these headlines, and it does not.

## Metric review (binding section — doubts for the NEXT run, not re-scores here)

1. PREREG DEVIATION (the big one): the prereg's legs (a)/(b)
   as written included once-a-day in the pre-payment set
   ("a second same-day tap with an audience present refuses
   pre-payment after the change"). Delivered instead:
   world-state prechecks only; once-a-day stays post-payment
   in full (boundary taps succeed, non-boundary taps refuse
   post-payment with the 40 kcal tier burn). Reason, proven
   by the baseline: the once-a-day condition is evaluated
   against the POST-payment day, so it is not faithfully
   knowable pre-payment without day-roll prediction. The
   verdict above is GO on the narrowed scope, NOT a clean
   prereg GO. A future arm that wants once-a-day pre-payment
   must decide the day-roll rule explicitly (e.g. precheck
   the flag only when payment cannot roll the day) and
   pre-register that rule — it must not silently extend this
   arm's prechecks.
2. TEST-SCRIPT FIX (dead worker's script, corrected on
   adoption with baseline proof): the assert mode's
   success-fixture flag check expected challengeDayAfter /
   postureDayAfter to equal dayBefore. The baseline proves
   the impl stamps the POST-payment day (before-run R4-R7:
   flag undefined->2 while dayBefore is 1), so the check
   failed on 32 rows that were identical before/after. Fixed
   to expect the new day (dayAfter), matching the script's
   own correct R9/R10 logic. This changes no judged outcome:
   the flag value is identical before and after; only the
   assertion was miscalibrated for boundary successes.
3. R3 NARRATION SUFFIX: the trophy refusal line gains the
   standard " (Mark Trophy)" action-name wrapper after the
   change (the impl's sentence had no suffix; the precheck
   path always appends one). Reason text identical. The
   prereg anticipated the wrapper for pre-payment refusals
   generally; the trophy case is where it becomes visible.
   Not a leg failure (leg (a) requires the refusal sentence
   present, which it is), but stated, not smoothed over.
4. PANEL DECISION LABEL: "review_required" is the panel's
   standing label when descriptive/insufficient metrics
   exist, not a movement verdict — every paired delta is 0.
   Reported verbatim above; the leg (c) criterion (rows
   match seed-for-seed) is met on both instruments.
5. AVAILOK ARTIFACT: success-fixture availOk flips
   true->false on R4/R5/R9/R10/R13/R14 because the test's
   button probe calls _actionAvailable with target=null and
   a cleared conversation. That is the intended disabled
   state for "no audience", not a success regression: the
   actual taps (explicit target, or a live conversation
   partner) behave identically before/after. A future test
   revision could probe avail with the fixture's own target
   to avoid this known artifact.
6. PRE-EXISTING, NOT THIS ARM: the impl/narration liveness
   gap (narrations say "here, alive, and one of yours" but
   the code checks only roster + not-self) is unchanged by
   this arm and was filed to the findings backlog, not
   widened here, per the prereg.

## Next blanks (named, not hidden)

1. Once-a-day residual: non-boundary once-a-day taps still
   refuse post-payment (ticks + silent 40 kcal tier burn).
   Needs an explicit day-roll-aware precheck design + its own
   prereg (see metric review 1). Do not extend this arm's
   prechecks silently.
2. The liveness gap (metric review 6): impl accepts a roster
   member whose dead flag is set; narration promises otherwise.
   Backlog item, separate arm.
3. The R3 wrapper suffix is cosmetic and consistent with the
   other pre-payment refusals; no action unless Steve wants
   the trophy impl sentence to carry its own suffix.

## Convergence line

refusalprecheck — world-state prechecks for the three
post-payment refusals (challenge, end_it_before, trophy
mark): pilot legs (a)+(b) GO on the narrowed scope,
confirm 168/168 GO, policy det-gate (c) GO on sweep-compare
+ panel (all deltas 0). Once-a-day scope narrowing disclosed
as a prereg deviation (metric review 1); NOT a clean prereg
GO. No further seeds would change the verdict: the mechanism
is proven on identical fixtures and the gate is an identity
gate.

## Files committed in this run (see commit hashes in the report)

- src/js/abilityActions.js (the three prechecks only)
- scripts/test-refusalprecheck-b.js (adopted script + the
  one assert fix, metric review 2)
- evidence/2026-10-27/sim-refusalprecheck-b.md (this file)
- evidence/2026-10-27/sim-refusalprecheck-b-corpus/before-adopt.json
  (pilot before, 112 rows, unmodified code)
- evidence/2026-10-27/sim-refusalprecheck-b-corpus/after-adopt.json
  (pilot after, 112 rows)
- evidence/2026-10-27/sim-refusalprecheck-b-corpus/after-confirm.json
  (confirm after, 168 rows, seeds 9991-10002)
- evidence/2026-10-27/sim-refusalprecheck-b-corpus/detgate-before.json
  + detgate-after.json (sweep-compare, competent 8x60d)
- evidence/2026-10-27/sim-refusalprecheck-b-corpus/panels-before/panel.json.gz
  + panels-after/panel.json.gz + panels-compare.md/.json
  (balanced panel; cases/ caches NOT committed, per §15)

## Left uncommitted (reported, NOT swept into a commit)

- evidence/2026-10-27/sim-refusalprecheck-b-corpus/before/
  (40 spandraw probe files from the dead worker) and
  before-fixtures.json (its 112-row before dump — matches
  before-adopt.json 112/112, cited above as corroboration).
  Adopted state, not this worker's output; coordinator to
  decide.
- .refusalprecheck-panels/before/cases/ (1 panel case cache
  file from the dead worker; caches are never committed).
- evidence/2026-10-27/sim-refusalprecheck-b-corpus/panels-before/cases/
  and panels-after/cases/ (this run's panel case caches;
  never committed per §15; results preserved in
  panel.json.gz + panels-compare).
