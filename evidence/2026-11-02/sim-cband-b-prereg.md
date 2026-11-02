# sim-cband-b — prereg (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-cband-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T2233Z, axis food-economy).
Worktree sim-cband-b, branch sim-cband-b.
This worker does NOT push, bump, verify live, merge,
or rebase; the coordinator lands the branch. Status
to coordinator: committed in worktree, pending
coordinator merge.

## Canon

docs/CANON.md read first; docs/MAP.md §6 (the way
home: travel through the same travelTo pipeline)
is the relevant canon. No canon doc covers the
pocket guard itself: it is a policy-side sim
instrument (a competent variant), not a game
system, so there is no canon to invent from — the
guard's E(D) model is inherited verbatim from the
predecessors. This run is INSTRUMENT + JUDGED-BAND
ONLY: zero src/js changes, zero edits to
scripts/policies/competent.js, zero edits to any
reused script/policy/driver/analyzer, zero
policy-default flips, zero bundled fix, unless a
genuinely separate instrument bug is found and
documented as its own finding. New files only
(judged-leg analyzer delta, proof test, evidence).

## Predecessors (read, never re-judged)

- evidence/2026-11-02/sim-destfirst-b.md +
  sim-destfirst-b-prereg.md (1730Z, merged):
  DIAG-NO-BAND. Stage-2 confirmed C destinations
  (STAGE-2 ONLY, no armed legs, no origin-E
  verification, no episodes — "constructible", not
  judged). NO re-screening, NO substitutions.
- evidence/2026-11-02/sim-homeward-shapes-b.md
  (1505Z): A/C episode definitions + veto E table,
  inherited verbatim; scripts/
  analyze-homeward-shapes-b.js reused UNCHANGED
  for episode counts.
- evidence/2026-11-02/sim-homewardac-b.md (1636Z):
  C integrity/established definitions (see
  "definition applicability" below — the literal
  originSimOk clause is structurally inapplicable
  to this band's outward attempts, and this prereg
  fixes the band reading BEFORE any leg runs).
- evidence/2026-11-02/sim-gatedisengconf-b.md:
  gatediseng cost PASS stands; this arm judges a
  different leg (judged C band for the homeward
  guard), not timeliness.
- evidence/2026-11-02/sim-collapseband-b.md:
  timeliness TIMELINESS-FAIL — do NOT cite this
  arm for timeliness, do NOT re-judge it.

## Question

On the 8 confirmed C destinations, do armed
judged legs produce judgeable episodes, and does
the homeward guard fence shape C (veto where the
inherited episode definition says veto) without
breaking integrity?

## The band (fixed, no substitutions, no re-screening)

C-only judged band from the 8 confirmed C
destinations of the merged 1730Z destfirst arm.
Pilot = one judged leg pair (shadow + armed) per
destination = 8 pairs. No confirm spend beyond
the pilot in this run.

| Seed | Screened origin | Dest | Route env CONSTRUCT_ROUTE_C1 (BFS haven->origin, destfirst-b-screen.js bfsRoute, proof-verified) | Hop env CONSTRUCT_HOP_C2 (label origin>dest; policy uses only dest) | Stage-2 actual day-6 start |
| 69702 | 0,6 | 0,7 | 4,5;4,6;3,6;2,6;1,6;0,6 | 0,6>0,7 | (0,6) |
| 69704 | 0,7 | 1,7 | 4,5;4,6;4,7;3,7;2,7;1,7;0,7 | 0,7>1,7 | (2,7) |
| 69706 | 0,2 | 0,1 | 3,4;2,4;1,4;0,4;0,3;0,2 | 0,2>0,1 | (1,1) |
| 69707 | 7,3 | 8,3 | 5,4;6,4;7,4;7,3 | 7,3>8,3 | (7,3) |
| 69709 | 1,2 | 1,1 | 3,4;2,4;1,4;1,3;1,2 | 1,2>1,1 | (1,2) |
| 69713 | 7,4 | 8,4 | 5,4;6,4;7,4 | 7,4>8,4 | (6,4) |
| 69714 | 0,4 | 0,3 | 3,4;2,4;1,4;0,4 | 0,4>0,3 | (1,4) |
| 69717 | 0,4 | 0,3 | 3,4;2,4;1,4;0,4 | 0,4>0,3 | (0,4) |

Note the screened origin is often NOT the actual
day-6 start (the scholar's day-5 competent.daily
moves them after the walk-out; 69706's day-5
start itself is (1,1), not haven, so its walk-out
is refused at the first step and the scholar camps
at (1,1)). Judged legs reproduce the stage-2
trip exactly (same route env above) so the day-6
start matches; the armed veto's originSimOk is
verified on the ACTUAL start, not the screened
origin.

## Judged-leg procedure (fixed now)

Per destination, fresh both legs, scripts/
homeconstruct-b-driver.js UNCHANGED, 30d,
homewardac substrate (COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=0,
packcomp *=1 flags NOT 1, driver-enforced):
POLICY=construct-shadow then construct-armed,
CONSTRUCT_SHAPE=C, CONSTRUCT_DAY_C1=5,
CONSTRUCT_ROUTE_C1=<route above>,
CONSTRUCT_DAY_C2=6, CONSTRUCT_HOP_C2=<hop
above>, SEEDS=<seed>.
Horizon: death-aware, never fixed 200d — the
judged days are 5-6; the 30d window is kept so
wall numbers are comparable to predecessor runs.
runDays stops at Game.over; daysAlive recorded
per leg.
Filenames MUST include origin AND destination
(the destfirst caveat): evidence/2026-11-02/
sim-cband-b-judged-<seed>-<origin>-to-<dest>-
{shadow,armed}.jsonl. Band concatenations (seeds
distinct, so concatenation is safe):
sim-cband-b-band-{shadow,armed}.jsonl, read by
scripts/analyze-homeward-shapes-b.js UNCHANGED
(--episodes) for episode counts + the veto E
table. Per-destination integrity/established by
scripts/analyze-cband-b.js (new delta; the
1636Z analyzer hardcodes the (2,8)->(4,8) hop).

## What counts (decided now)

DAY1-IDENTITY: day-1 record identical between
legs. A FAIL pair is a STOP condition (homewardac
prereg) — that pair is not judged.
REPRO: shadow day-6 start equals the stage-2
actual day-6 start above. A REPRO FAIL is
DIAG-INSTRUMENT (the band did not reproduce;
verdict suspended, reported loudly), never
silently pooled.
INTEGRITY-OK (homewardac C, verbatim): day-6
start != haven on BOTH legs AND day-6 starts
MATCH AND the attempt hop to D attempted on
BOTH legs. Reasons: start-at-haven,
start-mismatch, attempt-not-offered,
missing-day6.
ESTABLISHED-BAND (this run's fixed reading):
integrity-ok AND shadow day-6 attempt hop (first
day-6 hop to D) simOk === false AND armed day-6
attempt hop vetoed === true (the fence actually
fired on the attempt).
ESTABLISHED-STRICT (homewardac literal):
established-band AND armed attempt hop
originSimOk === true. Reported alongside every
destination, never substituted mid-run.

### Definition applicability (found BEFORE any judged leg — read this)

All 8 band attempt hops are OUTWARD: the
destination is farther from haven (4,4) than the
actual day-6 start on every trip (e.g. 69702
(0,6)->(0,7): 6->7; 69707 (7,3)->(8,3): 4->5).
The guard code (scripts/policies/
competent-homewardstep-b.js, installGuard)
records originSimOk ONLY on homeward vetoes;
outward vetoes keep originSimOk null. The
homewardac literal clause (armed veto
originSimOk === true) is therefore structurally
expected to be 0 on this band — NOT because the
fence failed, but because the clause's record
does not exist for outward vetoes. This prereg
fixes the pilot threshold on established-band
and reports established-strict beside it, so the
coordinator can apply either reading without
re-running. If the coordinator judges that only
the literal clause counts as "established", this
band's verdict under that reading is DIAG
(definition inapplicable to outward attempts),
and the evidence file will say so in those words.

### Primary metric + GO threshold (fixed now)

Primary metric: integrity-ok pair count (of 8)
+ established-band trip count.
Pilot GO = integrity-ok >= 4 AND established-band
>= 1 AND the episodes analyzer runs clean (exit
0, EPISODES + VETO-TOTALS lines printed).
Verdict mapping (judged against this header,
never re-scored mid-run, MEASUREMENT.md §14):
- Any REPRO FAIL -> DIAG-INSTRUMENT.
- Integrity-ok < 4 -> DIAG-SUBSTRATE (no judged
  band; not a guard verdict).
- Integrity-ok >= 4 but established-band = 0 ->
  DIAG-NO-BAND (not a guard verdict).
- Otherwise -> pilot GO.
The episode count is a SECONDARY guard-shape
read, not a pilot threshold: >= 1 C episode
means the guard fences shape C on this band per
the inherited definition; 0 C episodes on a GO
band means the guard vetoed attempts (outward
vetoes) but produced no shapes-C episode under
the inherited definition (which demands a vetoed
HOMEWARD hop) — reported as that finding, not
as a pilot failure and not as a guard NO-GO.
The veto E table (VETO lines + VETO-TOTALS from
the unchanged shapes analyzer) is reported in
full.

## Balanced panel (§15)

VACUOUS by prereg design, stated deliberately:
the panel expresses the guard policies
(competent vs competent-homewardstep-b) on
natural campaigns; this band's legs are
constructed trips whose before/after comparison
IS the shadow/armed pair on identical seeds and
route env. Running the panel on these seeds
would express the guard on non-judged natural
play and prove nothing about this run's
question (same reasoning as destfirst §"Balanced
panel"). No compare file is fabricated.

## Sense-testing law

Read transcripts. Sample at least one judged C
leg transcript (sayLines, days 5-6) for human
sense and report it: meaning, coherence,
relevance, consequences — never just counts.

## Wall numbers

Honestly-limited: 30d construction legs, not
natural play. Report survival in-window, wave
reach in-window, and national / table / wins
in-window only if the horizon reaches them;
otherwise state the window limit (30d
construction substrate — no wall movement is
shown or claimed).

## Metric review (doubts for the NEXT run, not this one)

- The homewardac literal established clause
  (originSimOk === true) does not transfer to
  outward attempts: the guard never records
  originSimOk there. Either the clause needs an
  outward-attempt form (e.g. armed attempt
  vetoed + armed day-6 stay on escapable ground),
  or the guard needs to record origin E on
  outward vetoes too. Proposed for the next run's
  prereg, NOT applied here.
- The shapes-C episode definition demands a
  vetoed homeward hop; a band whose fence fires
  only on outward attempts can be GO with 0 C
  episodes. Whether "fences shape C" should
  include outward attempt vetoes is a coordinator
  question for the next run, not a re-score here.
- 69702 is predicted fragile: its shadow day-5
  walk-out hops (3,6)->(2,6), (2,6)->(1,6),
  (1,6)->(0,6) all have simOk=false, so the armed
  guard should veto the walk-out at (3,6)->(2,6)
  and diverge day-6 starts (integrity
  start-mismatch). Prediction only — the legs
  decide.

## Deliverable

Evidence file evidence/2026-11-02/sim-cband-b.md
(prereg header, per-destination integrity /
established / repro ledger, episodes + veto E
table, sense reading, village assessment in plain
words, wall numbers, metric review section,
out-of-scope findings list for the coordinator's
backlog in sim-findings format), plus the judged
leg files above, the band concatenations, the
analyzer outputs, and the proof test, all
committed on branch sim-cband-b. Report to
coordinator: verdict (GO / DIAG-* per the header
above), per-destination results + failure reasons,
episode + veto counts, proof-test results, commit
hashes, anything left uncommitted or failed.

## Explicitly excluded

No re-screening, no substitutions, no re-judging
of destfirst / homewardac / shapes; no src/js
changes; no edits to competent.js, the guard
policy, the construct policy, the homeconstruct
driver, the homeconstruct analyzer, the shapes
analyzer, or the destfirst scripts; no default
flip; no bundled fix; no landing of a game change
on a GO; no other worktree touched; no push,
bump, live verification, merge, or rebase; no
writes to hidden_files/sim-findings.md (0-byte
truncation pending another lane's restoration —
findings go in the evidence file instead) or to
convergence-tracker.md (coordinator only).
