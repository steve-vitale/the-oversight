# sim-refusalprecheck-b — pre-registration (committed BEFORE any judged probe or game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T2352Z,
axis food-economy. Arm: the precheck gap for the three post-payment
refusal ability taps, blank (3) from the 2026-10-27 2150Z loop-B review.

## Background (already on master, not re-judged here)

evidence/2026-10-27/sim-spandraw-design-b.md proved that three keys
refuse AFTER payment: intimidating_presence.end_it_before,
war_cry.challenge, and trophy_room.mark. useAbility pays the time
cost first (the tick that fires endDay inside the span) and only
then does the impl refuse, so a failed tap at day's end still holds
the night (and swallows the night's meals in a naive ledger).
Contrast the five pre-payment refusals whose ABILITY_ACTION_PRECHECKS
entries refuse before any cost is paid: field_dressing.dress_game,
grave_robber.rob_grave, mediator.mediate_dispute,
peacemaker.make_friends, water_breathing.dive_deep. The dedup rule
already covers both cases (it scopes by span, not by success), so
no ledger verdict changes either way.

## Design decision (made here from standing intent, not asked)

Failed taps should refuse before payment, like the other five.
Reasons, all from standing rules: consistency across refusals;
"expensive buttons name their cost" — a tap that does nothing
should not silently eat a night; canon's "no silent actions"
(every action narrates honestly, including failures — the
refusal narration itself is unchanged, only its timing moves).
If investigation finds counter-evidence (a design doc saying
posturing is meant to cost a night, or a precheck that cannot
know the condition without side effects), the arm reports NO-GO
and lands no game change — a killed arm leaves no trace.

## The change (one mechanism, three entries)

Add three entries to ABILITY_ACTION_PRECHECKS in
src/js/abilityActions.js, mirroring the impls' refusal conditions
EXACTLY (code-read 2026-10-27, before any judged probe):

- war_cry.challenge (~line 1393): audience = explicit target, else
  the active conversation partner (v.conv entry with active=true,
  on the village roster, not the scholar's own villager id).
  Refuse when no such audience resolves. ALSO the once-a-day
  refusal (s.challengeDay === s.day) — knowable pre-payment with
  no side effects, same shape as the posture once-a-day below,
  and the impl checks it in the same order (audience first,
  then once-a-day). Order in the precheck matches the impl:
  audience, then once-a-day.
- intimidating_presence.end_it_before (~line 1577): same audience
  resolution. Refuse when no audience resolves; then the
  once-a-day refusal (s.postureDay === s.day), same order as
  the impl.
- trophy_room.mark (~line 2057): refuse when state.villageSlain
  has no type with a count > 0. No other condition: the impl
  does NOT validate a passed target type against the kill
  record (it marks the passed type, or the most-killed type),
  so a precheck that refused a targeted mark while kills exist
  would refuse a tap the impl accepts — that is a success-path
  regression and fails leg (b).

Deliberate NON-mirror, documented: the impl narrations say a
challenge/posture target must be "here, alive, and one of yours",
but the impl code checks only roster + not-self — it does NOT
check liveness. The precheck mirrors the CODE, not the narration,
because mirroring narration would refuse taps the impl accepts
(a roster member whose dead flag is set is still accepted by the
impl). If that code/narration gap matters, it is a separate
finding for the backlog, not something this arm silently widens.

Other deliberate non-changes: no impl text changes (the refusal
narrations stay byte-identical; useAbility wraps the precheck
reason as "<why> (<action name>)", which is the same wrapper the
five existing pre-payment refusals already get); no cost changes;
no dedup/ledger changes; no direct-impl callers touched
(prechecks run only in useAbility and in _actionAvailable's
button-disabled check, exactly like every existing entry —
a test that calls the impl table directly bypasses prechecks by
design, as before).

Precheck side-effect audit (done pre-probe, from the code):
all three prechecks are pure reads (roster lookup, v.conv scan,
villageSlain key scan, day-flag compare). None writes state,
seeds gossip, bumps trust, or advances time — so running them
in the button-disabled check (_actionAvailable, target=null)
cannot change game state. Note the disabled-state consequence,
which is INTENDED and matches the five existing refusals: with
no active conversation and no explicit target, the social buttons
for challenge / end_it_before now show disabled with the
audience reason, instead of tappable-then-refusing-after-payment.
That is the same behaviour mediator/peacemaker buttons already
have when no dispute exists.

## Primary metric

REFUSAL TIMING: whether a boundary-position refusal of each of
the three keys consumes time/kcal/day before refusing.

## GO legs (binding — judged exactly as written; doubts go under
"metric review" for the NEXT run, never re-scored here)

- (a) REFUSAL TIMING (pilot first, probe fixtures): on all pilot
  seeds, boundary-position refusals of all three keys refuse
  pre-payment — zero time ticks consumed, no day crossing, zero
  kcal paid, with the same refusal narration as before.
  Pilot = the spandraw probe fixture set, reused unchanged
  (scripts/probe-spandraw-design-b.js, ACTIONS = the three keys,
  POSITIONS=A, seeds 9981-9988): untargeted social taps (no
  audience: no explicit target, no active conversation) for
  challenge and end_it_before; untargeted trophy mark (no
  villageSlain kills). 8 seeds x 3 keys, untargeted attempts
  only for leg (a) (social keys also carry a villager-targeted
  attempt in the probe; those are success fixtures for leg (b),
  not refusal fixtures). PASS = 24/24 refusal instances show
  dayBefore == dayAfter, dayTicks unchanged, kcal unchanged,
  result false, and the impl's refusal sentence present in the
  say lines. Any instance consuming a tick, crossing a day, or
  paying kcal is a leg failure.
- (b) SUCCESS INVARIANCE: before/after on IDENTICAL probe
  fixtures — boundary success taps of all three keys cross the
  day and produce identical effects, narration, and costs with
  the change as without. Success fixtures: challenge and
  end_it_before with an explicit living roster-villager target;
  challenge and end_it_before with an active conversation
  partner and no explicit target; trophy mark with
  villageSlain = {<type>: 1+} set (most-killed type marked).
  Also the once-a-day fixtures: a second same-day tap with an
  audience present refuses pre-payment after the change (new
  behaviour, intended) — judged under leg (a)'s timing rule,
  NOT as a leg (b) regression, because the impl already
  refused it (post-payment) before the change; the narration
  sentence is unchanged. Any other success-path movement
  (different result, different narration, different day
  crossing, different state effects, different costs) is NO-GO
  and kills the arm: NO game change is committed.
- (c) POLICY DET-GATE: a competent-policy band (8 seeds,
  death-aware horizon — see below) shows IDENTICAL headlines
  before/after the change: national reach, table reach, wins,
  wave 4-5 reach, median survival, death-cause shares. Rationale:
  refusals of these three keys rarely fire under competent
  policy, so any headline movement must be fully attributed or
  the arm is NO-GO. "Identical" means the sweep-compare /
  balance-panel headline rows match seed-for-seed; a single
  moved headline with a full attribution to a mechanism this
  change cannot touch (e.g. a policy-path difference the
  before/after roots share) is reported, not waved through —
  attribution must name the mechanism, not the seed.

Confirm band: 12-16 seeds ONLY if the pilot (legs (a)+(b) on
8 seeds) passes. Confirm = fresh probe seeds 9991-10002,
boundary position, same three keys, refusal + success fixtures;
det-gate confirm repeats the policy band on the same 8 seeds
(it is a determinism check, not a new sample — a second policy
sample would measure policy noise, not this change).

## Horizon + why

- Probe fixtures: NO horizon — each instance is one day-1
  setup tapped once at the last hour (spandraw position A:
  dayTicks = 512 - ticks(cost), dayPart = floor(dayTicks/128),
  the consistent pair the spandraw probe already uses). The
  question is timing within one tap, not survival; a horizon
  would add nothing and could only add noise.
- Policy det-gate band: 60 days, death-aware (a dead/scattered
  village stops simulating; +10d tail max, per MEASUREMENT.md
  §10). 60d is the early-game horizon: this change cannot move
  late-game reach, and the gate's job is detecting accidental
  movement, not measuring reach. The gate is judged on
  identity of headlines, not on reach numbers, so horizon
  length cannot manufacture a pass.

## Seeds and policies

- Probe pilot seeds: 9981,9982,9983,9984,9985,9986,9987,9988
  (the spandraw pilot band, reused so before/after fixtures are
  identical by construction).
- Probe confirm seeds (only on pilot GO): 9991-10002 (the
  spandraw confirm band).
- Policy det-gate: competent policy only, seeds
  9981-9988 (same literals as the probe pilot, for one
  seed list across the run), 60 days.
- No other policies: the gate tests accidental movement, and
  competent is the policy the census and spandraw arms used
  for the baseline village picture.

## Full env set + substrate-activation gate (prior rounds' lesson:
list every inherited gate, or the pilot measures nothing)

Harness (scripts/sim-harness.js, shared — never copied):
SIMOPT default ON in both legs (the harness's UI-only slimming;
it does not touch useAbility, costs, or endDay, and it is
identical before/after, so it cannot manufacture a leg (a)
or (b) difference). TELEMETRY_FULL off for probe fixtures
(fullTelemetry: false, as the spandraw probe uses). No other
harness env is set; in particular FORCE_OCC is unset (the
harness throws if it is set — occupation cohorts are not
part of this arm).

Policy env (scripts/policies/competent.js): all COMPETENT_*
gates left at their defaults in both legs (no COMPETENT_*=0/1
overrides). Defaults that matter here: COMPETENT_TALK is OFF
by default (talkOn() requires COMPETENT_TALK=1) — which is
why the det-gate expects refusals to rarely fire under
competent policy, and why leg (c) is an identity gate rather
than a refusal-count gate. Any COMPETENT_* override in either
leg would invalidate leg (c) and must be disclosed as a
prereg breach, not silently carried.

Game-code gates (verified by code-read, none set by env):
useAbility's own gates run in order before the precheck and
are identical before/after — ability held (grant fixture:
abilities-push onto scholar.abilities, recorded per instance
by the probe), context valid (social/explore/camp contexts
are generally available out of combat per actionContextValid;
trophy mark is camp context, which only blocks in combat),
impl wired (all three have hand-written impls). Cost gates:
the probe tops scholar kcal to 5000 and health to 100, so a
cost refusal can never masquerade as a world-state refusal.
Substrate fixtures that MUST be true for each leg, and are
set explicitly in the test script (never assumed):
leg (a) refusal fixtures — NO explicit target, NO active
conversation (v.conv cleared of active entries), roster
present but unaddressed; trophy fixture — villageSlain = {}
(or absent). Leg (b) success fixtures — explicit living
roster-villager target, OR one active conversation partner;
trophy fixture — villageSlain with at least one type > 0;
once-a-day fixtures — challengeDay/postureDay preset to the
current day with an audience present. If any fixture fails
its own setup assertion, the instance is a SETUP FAILURE,
not a leg result, and the run stops until the fixture is
fixed — a leg is never judged on a fixture that did not
stage what it claims.

## Balanced panel (MEASUREMENT.md §15 — standing exception,
stated before any judged run)

This IS a game change, so §15 applies in form: the before/after
comparison runs through scripts/balance-panel.js for the
det-gate sim band (competent, 8 seeds, 60 days) IF the panel
builds and validates on both roots; the compare .md is then
attached to the evidence file. The panel has NO corpus-ingest
mode for probe-fixture corpora — probe instances are single
day-1 setups, not villages, and panel metrics (national /
table / wins) do not exist for them, exactly as the spandraw
arm stated. So the panel covers leg (c) only; legs (a) and
(b) are judged on the probe corpora + the test script, and
running a panel compare on fixture corpora would be
fabrication. If the panel fails to build or validate on
either root for reasons unrelated to this change, that failure
is reported verbatim and the sweep-compare det-gate band
(identical seeds/policies/days) stands as the leg (c)
comparison — the prereg det-gate, not a substitute metric.
Panel cases/ caches are NEVER committed (only panel.json.gz
+ the compare .md, per §15).

## Sense-testing (SENSE-TESTING LAW)

At least one before/after refusal transcript is read
end-to-end (probe sayLines + span events for the same seed
and key) and judged on meaning — does the refusal read as a
refusal (a person addressed, a reason given, nothing taken),
not a silent nothing — and reported in plain words in the
evidence file. Counts alone never pass a leg.

## Wall numbers

Reported for the judged policy band only (leg (c)):
national / table / wins, wave 4-5 reach, median survival.
Probe fixtures carry no wall numbers (single day-1 setups,
not villages) and none are estimated for them.

## Convergence line

refusalprecheck — pre-payment prechecks for the three
post-payment refusals (challenge, end_it_before, trophy
mark): pilot legs (a)+(b) + policy det-gate (c) decide
GO / NO-GO; confirm only on pilot GO.
