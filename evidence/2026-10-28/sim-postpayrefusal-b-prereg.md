# sim-postpayrefusal-b — prereg (loop-B run fleshout-loop-b-20261028T1330Z)

Axis: food-economy. Assigned blank (from evidence/2026-10-27/
sim-spandraw-design-b.md and sim-findings line 1280): end_it_before,
war_cry.challenge, and trophy_room.mark had NO precheck, so the paid
time tick fired endDay before the impl refused — a failed tap at
day's end still swallowed the night's meals in a naive tally.

## Scope correction, recorded BEFORE any judged run

On reading the code, this blank is ALREADY FIXED on current HEAD,
in two landed commits:

- 10ef1e627 (sim-refusalprecheck-b, 2026-10-27): pre-payment
  prechecks for the three world-state conditions (audience for
  challenge / end_it_before, kill record for trophy mark), in
  src/js/abilityActions.js ABILITY_ACTION_PRECHECKS only.
- 8118c0be1 (sim-onceaday-b, 2026-10-27): day-roll-aware
  prechecks for the once-a-day legs (challengeDay / postureDay),
  closing the residual the first arm disclosed.

Both are ancestors of this worktree's HEAD (verified with
`git merge-base --is-ancestor`). Re-implementing them would
duplicate landed code, so this run makes NO src change unless
the re-proof below fails. If it fails, the run stops, the
failure is reported, and no silent rework is substituted.

What this run IS: an independent re-proof, on current HEAD, that
the three actions refuse BEFORE payment on day-end fixtures
(0 time tick, no endDay, no meal draw), plus a pilot guardrail
sweep and a backlog correction (sim-findings line 1280 still
reads `[open]` although its fix landed — corrected in this
run's commit if the re-proof passes).

## Method

New script scripts/test-postpayrefusal-b.js (own fixtures, shared
sim-harness only — no copied eval boilerplate): fresh day-1
setups, one useAbility tap per fixture, seeds 9981-9988 (the
same pilot seeds the two landed arms used, so numbers are
comparable to their published corpora).

Fixtures per seed (boundary position = dayTicks 512 - ticks(cost);
challenge / end_it_before cost 5 min -> 3 ticks, so 509;
trophy mark cost -> 5 ticks, so 507):

- F1 war_cry.challenge, no audience (no convo, no target):
  must refuse pre-payment.
- F2 intimidating_presence.end_it_before, no audience: same.
- F3 trophy_room.mark, no kills recorded: same.
- F4 war_cry.challenge, once-a-day flag preset, NON-boundary
  (dayTicks 100), explicit partner: must refuse pre-payment
  (the onceaday closure — before that arm this refused
  post-payment with ticks + a silent 40 kcal tier burn).
- F5 intimidating_presence.end_it_before, same as F4.
- F6 war_cry.challenge, explicit partner, no flag: success
  control — must cross the day (boundary position).
- F7 intimidating_presence.end_it_before, explicit partner,
  no flag: success control — must cross the day.
- F8 trophy_room.mark, kills present: success control — must
  cross the day.
- F9 war_cry.challenge, flag preset, BOUNDARY position,
  explicit partner: success control — the tap lands on the
  new day, so it is that day's challenge (must succeed and
  stamp the new day, NOT refuse).

Refusal assertion (all must hold): result false, day
unchanged, dayTicks unchanged, scholar kcal unchanged,
village pantry kcal unchanged (pantry unchanged is the meal
proof: endDay draws the night's meals from the pantry, so a
tap that fired endDay could not leave the pantry untouched),
refusal sentence present in narration.

## Pre-registered GO (binds this run)

- Leg A (world-state refusals F1-F3): 24/24 refuse
  pre-payment with the full zero-payment assertion above.
- Leg B (once-a-day non-boundary refusals F4-F5): 16/16
  refuse pre-payment with the same assertion.
- Leg C (success invariance F6-F9): 32/32 behave as stated
  (F6-F8 cross the day; F9 succeeds and stamps the new day).
- Leg D (pilot guardrail): competent policy, seeds
  9981-9988, 60d death-aware, on HEAD. Compared against the
  published refusalprecheck/onceaday det-gate after-corpus
  headlines (median survival 60 at cap; starvation total 4;
  max wave 3; national/table/wins 0): no NEW death-cause
  category, median survival >= 0.8x control (>= 48d),
  starvation total <= control + 2 (<= 6). A miss here is
  HEAD drift to investigate, not a NO-GO on a change this
  run does not make — the run reports it loudly either way.

Overall verdict: GO if legs A-D all pass. GO means "the
assigned blank is confirmed fixed on current HEAD; no new
game change needed." It does NOT mean this run landed a fix.

## Horizon + why

Fixtures are single day-1 setups (no horizon question); the
guardrail uses 60d death-aware because that is the band the
landed arms used and the only band where a refusal-timing
change could show up in village outcomes. Dead villages stop
simulating (+10d tail max, per the harness default).

## Policies / seeds

Fixtures: seeds 9981-9988. Guardrail: competent policy only
(the landed arms' det-gate policy), seeds 9981-9988, 60d.

## Balanced panel (§15)

Attempted on the guardrail corpus with scripts/balance-panel.js
against the refusalprecheck after-corpus as the comparison
root. If the panel cannot ingest the corpus (known ingest
gap), the attempt and its output are attached and the gap is
stated explicitly — never silently skipped.

## Metric review (for the NEXT run, not a re-score here)

- The task's suggested GO assumed a fresh before/after code
  change; the before leg is replaced by the two landed arms'
  published before-corpora (pre-change code crossed on every
  refusal fixture). A fresh code revert for a "before" was
  judged wasteful and risky on a hot tree and is NOT done.
- The task's "identical seeds before vs after" is satisfied
  at fixture level (same seeds, same fixture definitions as
  the landed arms' scripts) rather than by re-running a
  reverted tree.
- If a future arm touches these prechecks again, its prereg
  should re-run scripts/test-onceaday-b.js in assert mode
  first: that script already pins the full R1-R20 behavior
  including the 508/509 straddle, and any regression there
  is the tripwire.
