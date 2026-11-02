# sim-vetobudget-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-vetobudget-b (Loop B,
food-economy axis, run fleshout-loop-b-20261102T1233Z).
Worktree sim-vetobudget-b, branch sim-vetobudget-b.
Coordinator task brief, 2026-11-02. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands the branch.
Status to coordinator: committed on branch, pending coordinator merge.

## Background (the blank, read-only)

Findings backlog item (2026-11-02, sim-homewardstep-rpt-b evidence):
on seed 62808 the same step is silently refused 3x/day for 20+ days
(68 vetoes, 66 silent) while the scholar ends every day home and
fed — competent re-picking of a permanently refused route. This is
the veto-budget / expedition-abort blank: after some budget of
vetoes, the expedition route should be abandoned instead of
re-attempted forever.

Verified from the prior run's pilot file (read-only, NOT re-judged
here): 62808 armed (guard-only) leg — step (4,4)->(4,1): 66 vetoes,
65 silent, across 22 days (days 9-30), exactly 3 silent vetoes/day
after the 1 spoken veto; plus step (4,7)->(2,7): 2 vetoes, 1 silent,
day 8 only. Band total 68 vetoes, 66 silent. The repetition seed
is 62808; the repetition step is (4,4)->(4,1).

## The instrument (what is armed — decided up front)

A NEW policy file scripts/policies/competent-vetobudget-b.js that
wraps the guard policy scripts/policies/competent-homewardstep-b.js
(read-only reuse via its exported installGuard; ZERO edits to it,
ZERO edits to scripts/policies/competent.js, ZERO src/js changes,
ZERO policy-default flips). The budget wrapper sits OUTSIDE the
guard on Game.travelTo during competent.daily and is restored
after, exactly the lineage's wrapper pattern.

### THE ONE DEFINITION (chosen up front, with reason)

**N silent vetoes per expedition, N = 3.**

- "Expedition" = the scholar's ongoing pursuit of ONE route: a
  run-scoped campaign to take a particular step, beginning with
  that step's first veto and ending when the route is abandoned
  (budget exhausted) or the run ends. The budget does NOT reset
  at dawn.
- REASON for per-expedition over per-day: the observed pathology
  IS multi-day (3/day x 22 days). A per-day budget would throttle
  the pattern to N/day but leave the scholar re-attempting the
  same refused route for weeks — that is the "re-attempted
  forever" blank, not its fix. A per-expedition budget ends the
  pursuit: after 3 silent refusals of the same step, the route
  is abandoned.
- "Same step" = the ordered tile pair (from -> to) as observed
  by the travelTo wrapper. (The guard's own veto memory keys on
  destination only; a route is a step — the same destination
  approached from elsewhere is a different approach with
  different escape geometry, so it carries its own budget.)
- Counting: SILENT vetoes only. The first, spoken veto is the
  scholar learning the route is refused; it does not count
  toward N. Silent vetoes are detected via the guard's OWN ctx
  counters (homewardstepSilentVetoes delta across the guarded
  travelTo call) — no re-implementation of the guard's silence
  logic, no return-shape inference.
- N = 3 because 3 is the observed daily re-pick rate: one full
  day of silent re-picks (or a few days of sparser picks) is
  enough to establish "permanently refused" without letting the
  pattern run for weeks. No env override for N (an override
  would invite mid-run re-scoring); N = 3 is hardcoded with a
  comment citing this prereg.

### ABORT BEHAVIOR (precise, decided up front)

The moment a step's Nth silent veto is recorded, that step is
marked ABANDONED (ctx set, run-scoped, permanent for the run —
the expedition is OVER, not paused). Every later travelTo
attempt of an abandoned step is SUPPRESSED by the wrapper: it
returns the guard-veto-shaped block ({blockType:'homewardstep',
vetoed:true}) WITHOUT invoking the guard — no new veto counted,
no narration, no escapeCheck sim. This satisfies "stop
re-attempting that route for the day" a fortiori: the route is
not re-attempted that day or any later day.

FALLBACK (named productive home behavior): competent's trip
loop does exactly what it does on a veto — moves to its next
candidate. On 62808 that is near-home forage (observed in the
prior run: "forages near home instead and ends home at
kcal 2130"). If no candidate succeeds, the day's haven chores
already in competent.daily (sort/donate/teach/talk/garden)
still run. No new behavior is invented; the fallback is the
observed post-veto behavior, minus further vetoes.

NEVER SUPPRESSED (safety, decided up front): force calls,
combatExit calls, self-calls (tent-clearing side effects), and
any call while in combat pass through untouched, exactly as
the guard passes them. Suppression applies ONLY to a step that
has already hit its silent-veto budget through real guard
vetoes. On wrapper error, fall back to calling the guarded
travelTo (never break the game on instrument failure).

NO narration is added by this arm. The guard's spoken first
veto still speaks; silent repeats stay silent; suppression
adds no line. Whether an abandoned route deserves a spoken
line is a narration question for a later arm, not this one.

### KNOWN RISK OF PERMANENT ABANDONMENT (named, judged by bars)

E(D) is recomputed per attempt, so a step that is refused
today could pass later (e.g. rubble cleared meanwhile). A
permanently abandoned step stays abandoned even if it later
opens — the scholar never relearns the opened route. That
cost, if real, shows up in the no-harm bars (haul, away,
failed-trip, survival, idling). On 62808 the route stays
refused all 22 days at baseline, so no divergence is expected
there; any divergence on another seed is a finding, not an
excuse.

## Question

Does a 3-silent-vetoes-per-expedition budget eliminate
same-step silent-veto repetition on the band that carries it,
without changing the scholar's haul, survival, or day shape?

## Pilot (judged)

Substrate (identical to the predecessor pilot): competent
lineage, 30d, DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, and the packcomp * =1 flags must NOT be 1.
Death-aware horizon: 30 loop-days max; dead villages stop
simulating (runDays loop breaks on Game.over); no fixed-200d
horizon. Horizon reason: the repetition window on 62808 is
days 9-30, fully inside 30d; pockets are an early far-travel
phenomenon; a longer window adds pre-seat noise without adding
veto information (the budget exhausts within days of the
first silent veto). The 30d pre-seat profile (national /
table / wins 0) is expected, not a regression.

Policies (identical seeds, fresh runs both legs — NO reuse of
the predecessor's JSONL, so per-step per-day veto counts are
recorded by this run's own driver on both legs):
- BASELINE leg: 'competent-homewardstep-b' (guard only — the
  leg that SHOWED the repetition).
- BUDGETED leg: 'competent-vetobudget-b' (guard + budget).
A plain-competent leg would show zero vetoes by construction
(no guard) and cannot be the repetition baseline; the guard
leg is the correct baseline for a budget added to the guard.

Pilot size: 8 seeds, band 62801-62808 (contains 62808; the
band is pre-qualified by the predecessor's pilot — no
screening spend in this run). No confirm spend in this run —
a pilot GO goes to the coordinator for a confirm decision
(12-16 seeds), it is not spent here.

Definitions:
- Away day-end: post-daily snapshot position != haven tile.
- Failed-trip day: >= 1 forage attempt, 0 successes.
- Mean daily haul: band mean of seed mean-daily forage kcal
  (roadguard valuation, as in the predecessor analyzer:
  finished rows at kcalEach x units; lump components at
  plants.json calories, nuts x 0.75; unvalued successes
  flagged, never zero-filled).
- Repetition seed (baseline): a seed where some step
  accumulates >= 6 total silent vetoes at baseline OR
  same-step silent vetoes on >= 4 distinct days. (62808
  qualifies massively: 65 silent on one step, 22 days. A
  1-silent 1-day pattern like (4,7)->(2,7) does NOT qualify.)
- Same-step silent vetoes per seed-day: from the driver's
  per-day hop-log slices (vetoed && silent), grouped by
  from->to step key and loopDay. Budgeted-leg silent vetoes
  are guard vetoes only (suppressions are counted separately
  and are NOT vetoes).
- Suppression: a budgeted-leg travelTo attempt of an
  abandoned step that returns the veto block WITHOUT invoking
  the guard. Counted in ctx.vetobudgetSuppressions and the
  per-day budget log slices; never counted as a veto.

PRIMARY METRIC (binding, conjunction — GO requires ALL three):
- P1: on every repetition seed, max same-step silent vetoes
  per seed-day <= 3 (the budget).
- P2: no step accumulates silent vetoes on more than 3
  distinct seed-days anywhere on the band (kills the 20-day
  pattern; baseline 62808 spans 22 days).
- P3: total same-step silent vetoes <= 3 on every step,
  every seed (the budget honored, not just averaged).
Expected on 62808: day 9: 1 spoken + 2 silent; day 10: 1st
silent reaches the budget (count 3) and the step is
abandoned; remaining day-10 attempts and all days 11-30
attempts suppressed (62 suppressions expected); guard vetoes
for the step total 1 spoken + 3 silent = 4, vs 66 at baseline.

NO-HARM BARS (all binding):
- B1 median survival: armed median daysAlive >= baseline
  median.
- B2 no new deaths: armed death count <= baseline death
  count band-wide, AND no death cause in the armed leg that
  is absent from the baseline leg (death-mode check).
- B3 failed-trip share: armed <= baseline + 0.05. (This arm's
  OWN tolerance, stated now. It is NOT stepwalk's tolerance
  and does not re-plea any exhausted tolerance route.)
- B4 mean daily haul: armed >= 0.95 x baseline (pooled),
  AND per-seed floor: every seed >= 0.50 x its own baseline
  haul. BOTH bind.
- B5 away day-ends: armed <= baseline + 2 band-wide.
- B6 idling: band forageTrips armed >= 0.90 x baseline (the
  fallback must stay productive, not idle); plus the
  sense-test on post-abort days (see below).
- B7 suppression engagement: suppressions > 0 on every
  repetition seed (the mechanism engaged where repetition
  exists); suppressions reported band-wide for every seed.
- B8 veto-created pockets: ZERO — no armed seed with >= 1
  pocket-entry episode (predecessor definition: maximal
  consecutive away day-ends containing >= 1 failed day-end
  return sim, lasting >= 2 day-ends OR strand-linked death)
  where the baseline seed had none.

EXPECTATION (not a bar, stated so a divergence reads as a
finding): suppression returns the same block shape as a guard
veto and changes no game state, so trajectories are expected
to be identical except veto/suppression counters. Any haul,
away, survival, or death divergence is therefore a finding to
investigate (it would mean suppression changed game state,
which the design says it cannot — except via the named
permanent-abandonment risk above, where a later-opening
route stays abandoned).

BALANCED PANEL (§15): run scripts/balance-panel.js on the
pilot seeds/policies (single combined campaign, both
policies, same seeds/days) as CONTEXT, never verdict — the
panel runs its own substrate and its survival/death
definitions differ from the driver's judged bars. Attach the
compare summary to the evidence file. If a compare returns
INVALID by design for policy-split panels (as on the
predecessor run), record it as-is; do not override it.

SENSE-TESTING LAW: read the sayLines transcripts on the
repetition seeds (veto lines, post-abort days) and the
day-end positions/kcal; judge meaning and coherence, never
just counts. The evidence file carries a village assessment
in plain words (what the village looked like, who thrived /
died and why, what was missing), post-abort day-shape notes
(idling? lost haul? new failure modes?), plus wall numbers
for the judged band (national / table / wins, wave 4-5
unlocks, median survival) with the 30d pre-seat profile
stated as expected, not a regression.

METRIC REVIEW (in the evidence file, never a re-score):
metric doubts go here and propose revisions for the NEXT
run only.

## Census (proof, not judged evidence)

BEFORE the pilot is judged, the proof test must show on
synthetic fake-Game cases (guard stub with scripted veto /
pass outcomes driving the wrapper's counter-delta logic):
- a spoken veto (silent-delta 0) does NOT count toward N;
- silent vetoes of the same step accumulate to N, and the
  Nth triggers abandonment;
- post-abandonment attempts of that step are suppressed
  (guard never called, veto-shaped block returned,
  suppression counted);
- a different step key has an independent budget;
- force, combatExit, self-calls, and in-combat calls are
  never suppressed (pass through to the guard);
- non-vetoed hops pass through untouched (guard called,
  result returned, no count);
- a wrapper error falls back to the guarded call.
Target: 100% on the above. Any disagreement is a proof
failure: fix the wrapper, do not judge the pilot against a
disagreeing wrapper.

## Deliverable

Evidence file evidence/2026-11-02/sim-vetobudget-b.md
(prereg header, census numbers, pilot numbers before/after,
veto-budget verdict, village assessment in plain words,
wall numbers, metric review section), plus the policy +
driver + analyzer + proof test files, all committed on
branch sim-vetobudget-b. Report to coordinator: GO / NO-GO
/ DIAG verdict with judged numbers, commit hashes, and
proof-test result.

## Explicitly excluded

No finish lever, no stepwalk landing, no guard-default flip.
This is a behavior instrument, judged on its own prereg.
No pairing with any other arm's confirm.
