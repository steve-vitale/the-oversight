# sim-firenarr-deploy-b — PREREGISTRATION (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261104T0130Z,
axis food-economy, arm sim-firenarr-deploy-b (the firing-evening
narration deploy). Worktree sim-firenarr-deploy-b, branch
sim-firenarr-deploy-b.

Canon read first: docs/CANON.md in full. NO canon doc covers the
(v**) sensor itself — it is a policy-side sim instrument, not a
game system; no canon is invented for it. docs/PRESERVATION.md is
adjacent only (the food ladder governs how food lasts, not how a
collapse warning is computed). Standing canon rules that bear on
this deploy and are cited, not invented: "No silent actions" and
"If you don't know, it doesn't show."

Spec lifted VERBATIM from evidence/2026-11-03/sim-firenarr-b.md
§3 (trigger, templates, first/repeat/escalation/again rules,
prohibitions), plus the coordinator evidence
evidence/2026-11-03/sim-food-round-0046-b.md (arm 2 section).
The rule being narrated: (v**) = (e**) OR (F), first firing wins,
ties to (e**); stretches are consecutive evenings with the
deposit gate NOT engaged; (e**): first evening D in a stretch
with D > S, D >= 8, hungryStreak >= 1, where (E1) falls >= 2 AND
store <= 0.85 x peak, or (E2) store <= 0.65 x peak; (F):
falls >= 3 AND store <= 0.80 x peak, no streak condition.
Store = Game.pantryKcal() read in the evening after meals.
Emission: end of endDay(), after the villageEats() call, via
this.say() — NOT the returnToVillage() unload line.

## The deploy (what changes, and what does NOT)

- NARRATION ONLY. One new Game method (the stretch state +
  template selection) called once from endDay() immediately
  after the villageEats() call. No throttle, gate, price, deed,
  readiness, or gameplay-effect change of any kind. The method
  uses NO RNG. If the deploy changes any game outcome besides
  added say lines, that is a loud failure, not a trade-off.
- The E1 fraction is implemented as ONE named constant
  defaulting to 0.85 (the currently judged value), with a
  comment that the sibling sim-fracchoice-b arm owns the
  fraction decision. This arm does NOT block on the sibling
  and does NOT pick a new fraction.
- Mobile render at 390px stays UNTESTED by this arm (node
  cannot prove it) — the evidence file will say so plainly,
  never claim mobile-verified.

## Primary metric

Narration emission correctness + trajectory identity, on the
deploy's OWN evening reads (see "Traced series" below):

1. Emission correctness: on every judged leg, the narration
   lines emitted by the deploy match, evening by evening, the
   firings predicted by re-running the (v**) rule over that
   leg's deploy-input series: same first-firing evenings,
   same winning clause, same template (including tie-to-(e**),
   escalation-once-per-stretch, silence on repeats, and
   "again" variants on later stretches).
2. Trajectory identity: on every judged leg, the game-state
   trace with narration ON is identical to the trace with
   narration OFF (ablation: the driver replaces the hook
   method with a no-op before the run; identical game code
   otherwise), except for the added say lines themselves.

## GO threshold (all must hold; a miss is NO-GO, never re-scored)

- GO = narration emits on ALL traced firing evenings in a
  sample of >= 8 firing legs (pilot, see below), INCLUDING
  >= 1 real (F)-first evening read from a real transcript
  (not a synthetic one), all template constraints hold
  (every emitted line <= 85 chars, says "store" and "recent
  high", no digit, no percent sign, no "days" claim, no
  hunger word, no stand-down/gate language, no number of
  any kind), AND zero trajectory divergence on those same
  8 identical seeds run with/without the narration (same
  game-state traces except the added say lines).
- Template constraints are also proved on synthetic fixtures
  (reused/updated scripts/test-firenarr-20261104.js table),
  but the synthetic proof alone never satisfies GO — the
  judged legs are real sims.
- Death-knell placement and repeat/escalation/"again"
  coverage are reported per leg; a pilot with no
  escalation leg and no two-stretch leg still GOES on the
  emission + identity bars above ONLY if the evidence file
  names those variants as still-open (tested-in-synthetic
  only) rather than claiming live coverage. A pilot with
  zero (F)-first legs is NO-GO (the F-first template would
  ship untested against a real transcript).

## Horizon + why

30d instrument window, death-aware: dead villages stop
simulating, +10d tail max. This is an INSTRUMENT window
for narration emission, NOT a wall-movement claim: no
national / table / win claim is judged here. The 30d
window is the window the (v**) rule was judged in, so
firing evenings are comparable to the spec's corpus.

## Seeds and policies

- Policy: competent (scripts/policies/competent.js), the
  policy the (v**) rule was judged under. No policy change.
- Screen (NOT judged): fresh seeds 83601-83800 (never
  judged before; the 83201-83400 and 83401-83600 bands are
  already judged and are NOT reused in any judged
  denominator). Screen driver records the deploy-input
  series (see below) + say lines, 30d, competent.
- Pilot judged sample: the first 8 FIRING legs from the
  screen in seed order, PLUS the first (F)-first leg if it
  is not already among those 8 (sample >= 8 either way).
  If the screen yields fewer than 8 firing legs, the
  sample is all firing legs found and the verdict is
  INSUFFICIENT-DATA, not GO.
- Coverage legs (reported, not part of the 8 unless they
  fall in it): the first screen leg showing an escalation
  firing, the first showing two stretches with two
  firings ("again"), and the first showing a first firing
  on a first-starvation-death day (death-knell), each read
  in transcript. If the screen yields none of a kind, the
  evidence file says so and that variant stays open.
- Confirm: none in this arm beyond the pilot. Pilot gate:
  8 seeds before ANY confirm spend; this arm runs no
  12-16 seed confirm (the deploy's claim is emission
  correctness, proved leg by leg, not a rate).

## Traced series (ordering definition — fixed here, before any leg)

The deploy's evening read is INSIDE endDay(), after
villageEats(): post-meal store, post-meal hungryStreak,
gate read at that same point. The old tracer read
(policy.daily, BEFORE Game.sleep() and therefore before
that night's endDay) is a DIFFERENT read point: pre-meal
store, pre-update streak. The judged "traced firing
evenings" are therefore computed over the DEPLOY-INPUT
series recorded by the driver wrapping Game.villageEats
(record, after the original returns: scholar.day, pantry
via Game.pantryKcal(), hungryStreak via progState(),
gate via Game._depositGateEngaged(), plus the night's
say lines in order). The analyzer over that series is
the (v**) rule verbatim (same fractions, same stretch
definition, same tie rule). A separate ordering-drift
comparison (deploy firings vs old-tracer firings on the
same seeds) is reported descriptively in the evidence
file; it is NOT the GO bar, because the two read points
are known to differ by the night's meals. Claiming the
deploy "matches the tracer" evening-for-evening without
this distinction would be false precision.

## Ablation (trajectory identity)

OFF legs run identical code with the driver replacing
Game._firenarrEvening (the hook method) with a no-op
before runDays. ON and OFF traces compared: deploy-input
series (day, store, streak, gate), deaths, endReason,
daysAlive, and final alive count must be identical; say
streams must differ ONLY by the firenarr lines. Any
other difference is a loud failure.

## Metric review

If the metric proves wrong, the miss is written under
"metric review" in the evidence file and a revision is
proposed for the NEXT run — the run is never re-scored
against a friendlier metric mid-run.

## Base

Prereg committed before the deploy code commit and
before any screen or judged leg. Screen and judged legs
both run on the deploy commit; the base does not move
during the run.
