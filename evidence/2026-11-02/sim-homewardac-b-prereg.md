# sim-homewardac-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b, arm sim-homewardac-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1636Z, axis food-economy).
Worktree sim-homewardac-b, branch sim-homewardac-b.
This worker does NOT push, bump, verify live, merge, or
rebase; the coordinator lands the branch. Status to
coordinator: committed in worktree, pending coordinator
merge.

## Predecessors (read, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-food-round-1536.md (Loop B
  1536Z coordinator evidence): next blank (1) is this
  run — a JUDGED pilot of homeward shapes A and C via a
  constructed-trip substrate, prototype loss budgeted,
  plus the shape D design question as STEVE-CALL.
- evidence/2026-11-02/sim-homeward-shapes-b.md (1505Z
  arm): natural-band hit rate for A/C candidate
  episodes is 0/16 fresh seeds (0/64 for the entry
  shape at 1345Z); both 1345Z prototypes (67105 shape
  A, 68001 shape C) no longer reproduce on current
  master (r72 re-routed both before their prototype
  days); shape D named (A-entry walk-out, no passing
  step out, scholar starves under vetoes). The A/C
  episode definitions and the veto E table are inherited
  verbatim from that prereg; the analyzer
  scripts/analyze-homeward-shapes-b.js is reused
  UNCHANGED.
- evidence/2026-11-02/sim-homeward-substrate-b.md
  (1345Z): shadow E validated; full guard reproduces
  veto-for-veto; homeward extension measured exactly
  zero added prevention on the qualifying band.
- Stepping-walk evidence (cited by 1536Z): the
  stepping walk prevented 8/8 staying-type seeds
  across three bands. Abandonment narration + 120d
  reopen settled (1536Z).

## Canon note

docs/CANON.md read first; docs/MAP.md states the way
home as travel through the same travelTo pipeline. No
canon doc covers the pocket guard itself: it is a
policy-side sim instrument (a competent variant), not
a game system, so there is no canon to invent from —
the guard's E(D) model is inherited verbatim from the
predecessors. This run is INSTRUMENT + JUDGED PILOT:
zero src/js changes, zero edits to
scripts/policies/competent.js, zero policy-default
flips, zero bundled fix. New files only (construct
policy, construct driver, construct analyzer, proof
test). If GO, it is reported as DIAG-GO for a
follow-up build naming the extension — NOT a
game-change verdict, NOT a landing.

## Question

Given a CONSTRUCTED trip — a prescribed walk-out the
scholar is forced to take, through the engine's own
travelTo, on identical seeds — does the homeward guard
rescue shape A (shadow strands, armed steps out
passing) and fence shape C (mid-trip homeward attempt
vetoed from escapable ground, both day-ends passing),
judged by the inherited A/C episode definitions?

## The construction (decided now, before any sim)

Mechanism faithfulness, established from the engine
before writing this prereg (not assumed): node travel
is FREE (game.js travelTo: no tick or kcal cost for
the boundary itself) — so a forced travelTo hop costs
exactly what a natural trip hop costs: nothing but
the step. travelTo accepts only engine-offered
destinations (travelTargets: d<=3 revealed, or
d==1). Adjacent (d==1) hops are therefore ALWAYS
offered, and a walk-out built from adjacent hops is
mechanically identical to a villager walking tile by
tile; only the DESTINATION CHOICE is prescribed, never
the movement mechanism. No position teleportation, no
state edits, no stubbed sims. Forced hops run INSIDE
the guarded window (guard installed, then forced hops,
then competent.daily, then guard restored), so forced
hops are guard-evaluated and guard-logged exactly like
natural hops, and the rest of the day (forage, walk
home) plays out through normal competent.daily.

Shape A construction (one day):
- LoopDay 5. Forced walk-out, adjacent steps, from
  haven (4,4): 5,4 -> 6,4 -> 7,4 -> 7,3 -> 7,2 -> 7,1.
  End tile P = (7,1), the 67105 shape-A pocket tile;
  the route geometry is adjacent steps rather than
  the prototype's jumps (the tile is what the pocket
  story is about, and adjacent steps are the
  always-offered form). Each forced hop is attempted
  via Game.travelTo; a hop refused by the engine
  (blockage) ends the walk-out at that tile.
- Then competent.daily runs normally from wherever
  the walk-out ended (forage, walk-home attempts).

Shape C construction (two days):
- LoopDay 5. Forced walk-out, adjacent steps, from
  haven (4,4): 4,5 -> 4,6 -> 4,7 -> 4,8 -> 3,8 -> 2,8.
  End tile M = (2,8), the 68001 shape-C tile. Then
  competent.daily runs normally.
- LoopDay 6. Forced attempt hop (2,8)->(4,8), the
  prototype's vetoed hop — attempted ONLY if (4,8)
  is engine-offered from the scholar's day-6 start
  tile (a non-offered "attempt" is not something real
  play can do, so it is recorded as attempt-skipped,
  never forced through a non-offered call). Then
  competent.daily runs normally.

Guard-days instrument (decided now, disclosed): the
guard (imported verbatim — installGuard/escapeCheck
from scripts/policies/competent-homewardstep-b.js,
zero changes to that file) is installed ONLY on
construction days (A: day 5; C: days 5-6). On all
other days the policy is pure competent.daily with no
guard at all. Justification, all three parts: (1) the
judged question is the guard's behavior ON the
constructed trip, not its month-long side effects;
(2) veto decisions are memory-independent (veto
memory affects narration only, never the decision),
so trip-day guard behavior given the same state
equals the always-on guard's trip-day behavior; (3)
it GUARANTEES pre-trip identity between legs (same
policy, same RNG stream, no guard anywhere before
the trip), which the 1536Z lesson demands be checked
rather than assumed. The cost is disclosed: this
pilot cannot see natural vetoes on other days, and
cannot see an always-on guard's pre-trip trajectory
divergence — that is the control the construction
buys, not a hidden assumption.

Legs per seed: construct-shadow (guard in shadow
mode on construction days: evaluates + logs, never
vetoes) vs construct-armed (guard in veto mode on
construction days). Fresh BOTH legs on current master
(standing lesson: never reuse a prior run's baseline
leg). Day-1 pantry identity check FIRST (see below);
if day-1 identity fails, STOP and report substrate
drift, do not judge.

Bands (freshness verified before this prereg was
written: zero mentions of 69501/69601/69502/69602 in
any *.md under evidence/; the only 6950/6960 hits are
the substring "16960" in two 2026-10-20 files):
- A band: 69501-69508 (8 trips, shape A construction)
- C band: 69601-69608 (8 trips, shape C construction)
BANNED (never screened, never judged): all bands and
seeds banned by the shapes-b prereg, plus 69301-69308
and 69401-69408 (the shapes-b pilot bands), plus the
prototype seeds 67105 and 68001 (reproduction only in
the prior run, never judged here either).

Substrate, identical to predecessors: competent, 30d,
DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, packcomp *=1 flags not 1
(driver-enforced, FATAL otherwise). Horizon reason:
the judged days are 5 (A) / 5-6 (C); the 30d window
is kept so wall numbers are comparable to predecessor
runs and so the analyzer can confirm no episodes occur
outside construction days (guard off there implies
none; the analyzer output must show it, not assume
it).

## What counts as a constructed trip (decided now)

Per-trip integrity, computed from the driver records
(day.start.pos, day.end.pos, day.construct report,
day.hops) by scripts/analyze-homeconstruct-b.js:

- A trip integrity-ok iff ALL hold: (a) day-5
  start.pos == haven (4,4) on BOTH legs; (b) shadow
  leg forced walk-out completes (pos after forced
  hops == (7,1)); (c) armed leg forced walk-out
  completes (pos after forced hops == (7,1)). Failure
  reasons recorded per trip: start-not-haven,
  shadow-walkout-incomplete, armed-walkout-incomplete
  (armed walk-out vetoed = guard prevention on the
  way OUT, not a rescue verdict — it cannot test A).
- C trip integrity-ok iff ALL hold: (a) day-6
  start.pos != haven on BOTH legs; (b) day-6 start
  positions MATCH between legs; (c) the attempt hop
  (2,8)->(4,8) is engine-offered and attempted on
  BOTH legs. Failure reasons recorded per trip:
  start-at-haven, start-mismatch, attempt-not-offered
  (day-5 walk-out completion on each leg also
  reported; a day-5 walk-out failure explains a later
  start failure but is not itself the C integrity
  verdict).

Secondary, never the verdict: established setups.
- A established: integrity-ok AND shadow day-5
  dayEndReturnSim.ok === false (the pocket actually
  formed under the shadow leg).
- C established: integrity-ok AND the shadow day-6
  attempt hop has simOk === false (the fence has a
  failing hop to veto).
Rescue/fence rates among established setups are
reported alongside the episode counts, never as a
substitute verdict.

## Primary metric, GO thresholds, verdicts (decided now)

Primary metric per shape: count of candidate episodes
under the inherited A/C definitions
(scripts/analyze-homeward-shapes-b.js, UNCHANGED,
episodes mode) across the shape's 8 constructed
trips. The analyzer judges ALL days; episodes can
only occur on construction days (no guarded hops
exist on other days), and the output must show that.
- GO (DIAG-GO): >= 2 candidate episodes of that
  shape. Reported as DIAG-GO for a follow-up build
  naming the extension — NOT a game-change verdict.
- DIAG-ONE: exactly 1 candidate episode — reported
  as-is, never rounded up or down.
- NO-GO: 0 candidate episodes WITH >= 4 integrity-ok
  trips (the guard genuinely did not produce the shape
  on trips that established it).
- SUBSTRATE-FAIL (DIAG, NOT a guard verdict): 0
  candidate episodes with < 4 integrity-ok trips, or
  any shape where integrity-ok trips < 4 regardless
  of episodes. This is the budgeted prototype-loss
  outcome: the construction did not establish the
  shape often enough to judge the guard, and the loss
  is documented per-trip (which integrity clause
  failed, on which seeds) instead of forcing the run.
Judge the run against this header. A miss is NO-GO
(or DIAG-ONE / SUBSTRATE-FAIL as defined), never
re-scored against a friendlier metric mid-run
(MEASUREMENT.md §14). Metric doubts go under
"metric review" for the NEXT run.

Day-1 identity check (STOP condition, before any
judged number is read): for every pilot seed, the
day-1 record (start/end pos/kcal/hydration, forage
additions, sayLines count) must be IDENTICAL between
legs. Any mismatch: stop, report substrate drift
with the diverging fields, do not judge. (Expected
to hold exactly: guard off before construction day,
identical policies, identical seeds.)

## Balanced panel (§15)

Attempt scripts/balance-panel.js as CONTEXT only on
the A band (combined campaign, policies competent +
competent-homewardstep-b, 30 days), as the shapes-b
run did. No split-panel compare is claimed, and no
panel verdict is needed for a diagnostic run. The
panel expresses the guard policies, NOT the construct
instrument — stated deliberately, per the shadow-
instrument caveat precedent: that is why it is
context, never verdict. If the panel refuses the
corpus, record the refusal as-is; never fabricate a
compare.

## Sense-testing law

Read the sayLines transcripts for the constructed
trips (veto lines, travel lines, day-end state) and
judge whether the guard's behaviour reads as a person
deciding, not a rule firing. Quote at least one trip
transcript/dialogue sample in the evidence file. The
evidence file carries a village assessment in plain
words, wall numbers for the pilot bands (national /
table / wins, wave 4-5 unlocks, median survival)
with the 30d pre-seat profile stated as expected,
not a regression, and a "metric review" section.

## Shape D (STEVE-CALL, not implemented)

Document as an open design question with the
evidence for/against: should the guard offer an
escape (a lateral step, a wait-out, a call for help)
when it can only say no? Evidence carried: 69307
shape D (armed scholar starves at (7,1) days 5-10
under vetoes, shapes-b evidence). Do NOT implement
any escape shape in this run. The question is listed
for the coordinator's backlog, not answered here.

## Census (proof, not judged evidence)

BEFORE pilot legs are judged, the proof test
scripts/test-homewardconstruct-b.js must show: (a)
route parsing (adjacent-step routes for A and C,
attempt-hop format); (b) the episodes analyzer
counts a constructed A episode exactly from fixture
legs (forced walk-out prefix + shadow fail + armed
veto/pass, grouped as ONE episode); (c) a
constructed C episode exactly from fixture legs
(mid-trip start, origin-passing veto, shadow
corroboration, both day-ends passing); (d) A
rejected when the armed walk-out is vetoed
(integrity, not episode — via the construct
analyzer's fixture); (e) pilot band starts 69501 /
69601 are outside the banned set and overlap no
banned band; (f) the reused files are unmodified in
this worktree (homext driver, shapes analyzer, guard
policy, competent.js — git check). The predecessor
proof tests scripts/test-homeward-shapes-b.js,
scripts/test-homext-abl-b.js,
scripts/test-homeveto-screen-b.js, and
scripts/test-homeward-substrate-b.js are re-run
post-commit as regression checks, not re-authored.
Any proof failure is a proof failure: fix the
instrument, do not judge legs against a failing one.
A live smoke on a NON-pilot throwaway seed (69599,
never judged, never screened) validates the driver
record shape + construction fields + day-1 identity
before the pilot bands run; the smoke is instrument
validation, never judged evidence.

## Deliverable

Evidence file evidence/2026-11-02/sim-homewardac-b.md
(prereg header, per-trip integrity ledger for both
bands, candidate episode list or NO-GO / DIAG-ONE /
SUBSTRATE-FAIL verdict per shape, veto E table,
village assessment in plain words, wall numbers,
metric review section, shape D design question,
out-of-scope findings list for the coordinator's
backlog), plus the construct policy + driver +
analyzer + proof test, all committed on branch
sim-homewardac-b. Report to coordinator: verdict per
shape (GO / NO-GO / DIAG-ONE / SUBSTRATE-FAIL with
the pre-registered threshold), before/after numbers,
wall numbers, sense reading, commit hashes,
proof-test results, anything left uncommitted or
failed.

## Explicitly excluded

No reuse of any banned band; no screening past the
2-band pilot budget; no re-judging the 1345Z/1505Z
screens or corpora; no re-litigation of shape B
beyond context; no src/js changes; no edits to
competent.js, the guard policy, the homext driver,
or the shapes analyzer; no default flip; no bundled
fix; no landing of a game change on a GO; no escape
shape (shape D) implementation; no other worktree
touched; no push, bump, live verification, merge,
or rebase.
