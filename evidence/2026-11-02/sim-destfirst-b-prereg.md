# sim-destfirst-b — PREREG (committed BEFORE any judged sim, and before screening)

Run: oversight-flesh-out-loop-b, arm sim-destfirst-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1730Z, axis food-economy).
Worktree sim-destfirst-b, branch sim-destfirst-b.
This worker does NOT push, bump, verify live, merge, or
rebase; the coordinator lands the branch. Status to
coordinator: committed in worktree, pending coordinator
merge.

## Predecessors (read, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-homewardac-b.md + prereg
  (1636Z arm): shape A SUBSTRATE-FAIL (0 candidate
  episodes, 2/8 integrity-ok) and shape C NO-GO
  (0 episodes, 5/8 integrity-ok, every attempt hop
  E-PASSED so the guard had nothing to veto) because
  fixed forced routes landed on destinations pocketed
  on 0/16 trips. Its metric review names this run:
  construct DESTINATION-FIRST — screen seeds/tiles
  for the shape precondition BEFORE forcing the trip.
- evidence/2026-11-02/sim-food-round-1636.md (Loop B
  1636Z coordinator evidence): next blank (1) is this
  run; backlog item "construction-method" claimed by
  this run's coordinator brief.
- evidence/2026-11-02/sim-homeward-shapes-b.md (1505Z):
  A/C episode definitions and the veto E table are
  inherited verbatim; scripts/analyze-homeward-shapes-b.js
  is reused UNCHANGED for episode counts.
- evidence/2026-11-02/sim-homeward-substrate-b.md
  (1345Z): shadow E validated; full guard reproduces
  veto-for-veto.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way
home as travel through the same travelTo pipeline.
No canon doc covers the pocket guard itself: it is
a policy-side sim instrument (a competent variant),
not a game system, so there is no canon to invent
from — the guard's E(D) model is inherited verbatim
from the predecessors. This run is INSTRUMENT +
SCREEN + JUDGED PILOT: zero src/js changes, zero
edits to scripts/policies/competent.js, zero edits
to any reused script/policy, zero policy-default
flips, zero bundled fix. New files only (screener,
generalized analyzer, stage-2 confirmation checker,
proof test). If GO, it is reported as SCREEN-GO /
DIAG-GO for a follow-up build naming the extension
— NOT a game-change verdict, NOT a landing.

## Question

Does destination-first construction produce the
trips the fixed routes could not — at least 4
integrity-ok constructed trips with at least 1 true
A setup and 1 true C setup on a fresh screened
band — and, on such trips, does the homeward guard
rescue shape A and fence shape C under the inherited
episode definitions?

## Stage 1 — screen (NOT judged, but fixed here before it runs)

Band: seeds 69701-69740 (40 seeds). Freshness
verified before this prereg was written: zero
mentions of any 69701-69740 seed in any *.md under
evidence/2026-11-02/; zero filenames under
evidence/2026-11-02/ matching 697/698; the band is
outside every banned band in the proof test (which
extends the homewardac list with 69501-69508,
69601-69608, 76701-76712). Disclosure, per the
prior band-reuse lesson: a whole-evidence grep for
"6970|6971|6980" matched only unrelated numbers
inside 2026-10-13 JSON telemetry files (substrings
of longer numbers, not seed bands); no seed band
uses 697xx anywhere found. BANNED (never screened,
never judged): all bands banned by the shapes-b /
homewardac preregs, plus 69301-69308, 69401-69408,
69501-69508, 69601-69608, 76701-76712, prototypes
67105 and 68001.

Instrument: scripts/destfirst-b-screen.js (new).
Per seed: fresh game, day-1-start E-map over all
81 home-board tiles (escapeCheck, read-only — it
simulates returns against live revealed/stock state
and mutates nothing), then competent days 1-4,
then day-5-start E-map. Screen classes, per state,
reported separately, never pooled without labels:
- A-LAT: directOk=false, ok=true (via lateral) —
  the direct escape fails but a lateral escape
  passes. This is the time-sensitive A mechanism:
  the lateral passes at walk-out time and may die
  during the day's foraging.
- A-POCKET: ok=false — no direct or lateral escape.
- C-PAIR: adjacent (O,D) with E(O).ok=true and
  E(D).ok=false at the SAME probed state.
A screen hit is a CANDIDATE, never a setup. The
screen output is evidence/2026-11-02/
sim-destfirst-b-screen.jsonl (40 lines).

## Stage 2 — dynamic confirmation (shadow-only, NOT judged)

For each screening seed in ascending order, build
candidate tries from its screen hits (dedup by
tile/dest; 1 trip per seed per shape at most — the
first confirmed tile per seed per shape counts):
- A tries (max 2 per seed, in this priority order):
  A-LAT day-5-start tiles, then A-LAT day-1 tiles,
  then A-POCKET day-5-start tiles, then A-POCKET
  day-1 tiles; tile order ascending within a class.
  Route = BFS adjacent path haven->P (scripts/
  destfirst-b-screen.js bfsRoute, deterministic).
  Run: homeconstruct driver, POLICY=construct-shadow,
  CONSTRUCT_SHAPE=A, CONSTRUCT_DAY_A=5,
  CONSTRUCT_ROUTE_A=<bfs route>, 30d, homewardac
  substrate flags. Confirm with scripts/
  destfirst-b-confirm.js: walk-out completes to P
  AND every shadow walk-out hop simOk AND shadow
  day-5 dayEndReturnSim.ok === false. (The walk-out
  clause is load-bearing: a tile pocketed at hop
  time cannot be a true A setup, per homewardac.)
- C tries (max 2 per seed, in this order): C-PAIRs
  day-5-start, then day-1; pair order ascending by
  (origin, dest); origin==haven pairs EXCLUDED (a
  walk-out to haven cannot produce a day-6
  off-haven start). Route = BFS haven->O; attempt
  dest D. Run: homeconstruct driver, POLICY=
  construct-shadow, CONSTRUCT_SHAPE=C, days 5-6,
  CONSTRUCT_ROUTE_C1=<bfs route>, CONSTRUCT_HOP_C2
  =<O>><D> (the policy uses only the destination;
  the origin in the env string is a label). Confirm
  with destfirst-b-confirm.js: day-6 start != haven
  AND attempt to D attempted AND shadow day-6 hop
  to D simOk === false. Origin escapability is NOT
  confirmed here — it is verified at the judged
  stage via the armed veto's originSimOk; a C
  confirmation is destination-only until then.
- Stop rules: stop trying a shape once 8 trips of
  that shape are confirmed. Hard caps: 40 A tries,
  40 C tries (a try = one 30d shadow run). Stage-2
  files: evidence/2026-11-02/
  sim-destfirst-b-stage2-<shape>-<seed>-<dest>.jsonl
  (one line each, shadow only).

## Judged band — selection rule (mechanical, fixed here)

Judged band = first 8 confirmed A trips + first 8
confirmed C trips, in (seed, tile/dest) order (the
order stage 2 confirmed them). If a shape confirms
fewer than 8, take all its confirmations. If total
confirmations < 4, or either shape confirms 0, the
verdict is DIAG-NO-BAND and NO judged legs run.
Otherwise judged legs run per trip, fresh both
legs, homeconstruct driver, 30d, homewardac
substrate (competent, DEPOSITGATE=0,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
packcomp *=1 flags not 1, driver-enforced), with
the trip's own route/destination env. Judged files:
evidence/2026-11-02/sim-destfirst-b-judged<shape>-
<seed>-<dest>-{shadow,armed}.jsonl, plus per-shape
band concatenations for the episodes analyzer
(seeds distinct within a shape, so concatenation
is safe).

Horizon reason: the judged days are 5 (A) / 5-6
(C); the 30d window is kept so wall numbers are
comparable to predecessor runs. Death-aware, never
a fixed 200d: runDays stops at Game.over and
daysAlive is recorded per leg; dead villages stop
simulating (+10d tail max is not applicable — the
driver ends the leg at death).

## What counts (decided now)

Per-trip integrity + established, computed by
scripts/analyze-destfirst-b.js (new; same
definitions as analyze-homeconstruct-b.js with the
destination as a parameter, plus the walk-out E
clause for A):
- A integrity-ok: day-5 start == haven both legs
  AND forced walk-out completes to P both legs.
  Failure reasons: start-not-haven,
  shadow-walkout-incomplete, armed-walkout-incomplete
  (armed walk-out vetoed = outward prevention, not
  a rescue verdict).
- A established ("true A setup"): integrity-ok AND
  shadow day-5 dayEndReturnSim.ok === false AND
  walkOutEallPass === true on the shadow leg.
- C integrity-ok: day-6 starts match AND != haven
  AND attempt hop to D attempted both legs.
  Failure reasons: start-at-haven, start-mismatch,
  attempt-not-offered.
- C established ("true C setup"): integrity-ok AND
  shadow day-6 attempt hop to D simOk === false
  AND armed veto originSimOk === true (the
  escapable-origin clause; if the armed origin
  fails, the trip is reported as
  established-destination-only, NOT as a true C
  setup).

Day-1 identity check (STOP condition, before any
judged number is read): for every judged trip, the
day-1 record must be IDENTICAL between legs. Any
mismatch: stop, report substrate drift with the
diverging fields, do not judge.

## Primary metric, GO thresholds, verdicts (decided now)

Primary metric: count of integrity-ok constructed
trips on the judged band, with established counts
per shape alongside (never integrity alone — the
homewardac lesson).
- SCREEN-GO: judged band yields >= 4 integrity-ok
  trips AND >= 1 established A AND >= 1 established
  C. The screen works: destination-first construction
  produced judgable trips of both shapes.
- DIAG-NO-BAND (not a guard verdict): stage 2
  confirms < 4 trips total or 0 of either shape
  (no judged legs run), OR the judged band yields
  < 4 integrity-ok trips, or 0 established of
  either shape. Report screen hit counts,
  confirmation counts, and per-trip failure reasons
  instead of forcing the run.
Secondary guard verdict, ONLY if SCREEN-GO, per
shape, from scripts/analyze-homeward-shapes-b.js
episodes mode on the shape's judged band, with the
homewardac thresholds: >= 2 candidate episodes
DIAG-GO (for a follow-up build naming the
extension, NOT a game-change verdict); exactly 1
DIAG-ONE; 0 episodes with >= 4 integrity-ok trips
NO-GO; < 4 integrity-ok trips SUBSTRATE-FAIL (DIAG,
not a guard verdict). Judge the run against this
header. A miss is NO-GO / DIAG-NO-BAND /
SUBSTRATE-FAIL as defined, never re-scored against
a friendlier metric mid-run (MEASUREMENT.md §14).
Metric doubts go under "metric review" for the
NEXT run.

## Balanced panel (§15)

Attempt scripts/balance-panel.js as CONTEXT only on
the A-shape judged seeds (combined campaign,
policies competent + competent-homewardstep-b, 30
days), as the homewardac run did. No split-panel
compare is claimed, and no panel verdict is needed
for a diagnostic run. The panel expresses the guard
policies, NOT the construct instrument — stated
deliberately: that is why it is context, never
verdict. If the panel refuses the corpus, record
the refusal as-is; never fabricate a compare.

## Sense-testing law

Read the sayLines transcripts for the confirmed and
judged trips (veto lines, travel lines, day-end
state) and judge whether the guard's behaviour
reads as a person deciding, not a rule firing.
Quote at least one trip transcript/dialogue sample
in the evidence file. The evidence file carries a
village assessment in plain words, wall numbers
for the judged band (national / table / wins, wave
4-5 unlocks, median survival) with the 30d pre-seat
profile stated as expected, not a regression, and a
"metric review" section.

## Shape D (STEVE-CALL, not implemented)

Carried, not answered: should the guard offer an
escape when it can only say no? Do NOT implement
any escape shape in this run.

## Census (proof, not judged evidence)

BEFORE screening runs, scripts/test-destfirst-b.js
must show: (a) screener classification (A-LAT /
A-POCKET / C-PAIR, error tiles skipped); (b) BFS
route shape (Manhattan length, adjacent steps,
determinism); (c) generalized analyzer on fixture
legs with NON-homewardac destinations (A ok +
established + walkOutEallPass, A vetoed-walkout
failure, C ok + established + armed origin pass,
C attempt-not-offered failure); (d) stage-2
confirmation checker true/false on fixture legs;
(e) screening band outside the banned set; (f)
reused files unmodified (construct policy,
homeconstruct driver, homeconstruct analyzer,
shapes analyzer, guard policy, competent.js,
homext driver). A live smoke on throwaway seed
69799 (never screened, never judged) validates the
driver record shape + construction fields + day-1
identity before the judged bands run; the smoke is
instrument validation, never judged evidence.
Predecessor proof tests scripts/
test-homewardconstruct-b.js, scripts/
test-homeward-shapes-b.js, scripts/
test-homext-abl-b.js, scripts/
test-homeveto-screen-b.js, and scripts/
test-homeward-substrate-b.js are re-run post-commit
as regression checks, not re-authored. Any proof
failure is a proof failure: fix the instrument, do
not judge legs against a failing one.

## Deliverable

Evidence file evidence/2026-11-02/sim-destfirst-b.md
(prereg header, screen hit counts per class and
state, stage-2 confirmation ledger, judged per-trip
integrity ledger per shape, candidate episode list
or DIAG-NO-BAND verdict, veto E table, village
assessment in plain words, wall numbers, metric
review section, shape D design question,
out-of-scope findings list for the coordinator's
backlog), plus the screener + generalized analyzer
+ confirmation checker + proof test, all committed
on branch sim-destfirst-b. Report to coordinator:
verdict (SCREEN-GO / DIAG-NO-BAND, plus per-shape
guard verdict if SCREEN-GO), before/after numbers,
wall numbers, sense reading, commit hashes,
proof-test results, anything left uncommitted or
failed.

## Explicitly excluded

No reuse of any banned band; no screening past the
40-seed stage-1 budget or the 40+40 stage-2 try
caps; no re-judging the 1345Z/1505Z/1636Z screens
or corpora; no re-litigation of shape B beyond
context; no src/js changes; no edits to
competent.js, the guard policy, the construct
policy, the homeconstruct driver, the homeconstruct
analyzer, or the shapes analyzer; no default flip;
no bundled fix; no landing of a game change on a
GO; no escape shape (shape D) implementation; no
other worktree touched; no push, bump, live
verification, merge, or rebase.
