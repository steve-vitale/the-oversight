# sim-cband-newdef-b — prereg (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-cband-newdef-b
(coordinator brief 2026-11-03, axis food-economy).
Worktree sim-cband-newdef-b, branch sim-cband-newdef-b.
This worker does NOT push, bump, verify live, merge,
or rebase; the coordinator lands the branch. Status
to coordinator: committed in worktree, pending
coordinator merge.

## Canon

docs/CANON.md read first; docs/MAP.md §6 (the way
home: travel through the same travelTo pipeline)
is the relevant canon. NO canon doc covers the
C (fences-shape-C) rule itself: it is a
policy-side sim instrument definition (a
competent variant + analyzer definitions), not a
game system, so there is no canon to invent from
— the rule's two forms are inherited verbatim
from the predecessors plus the coordinator's
decided metric call below. This run is
INSTRUMENT + DIAGNOSTIC RE-JUDGE ONLY: zero
src/js changes, zero edits to scripts/policies/
competent.js, zero edits to any reused script /
policy / driver / analyzer, zero policy-default
flips, zero bundled fix. New files only, all
named *-cband-newdef-b.* (decided-definition
analyzer delta, proof test, evidence, leg files).

## Predecessors (read, never re-judged)

- evidence/2026-11-02/sim-cband-b.md +
  sim-cband-b-prereg.md (merged): PILOT-GO with
  0 episodes under the OLD definition. Judged
  band: 7 integrity-ok pairs, 7 established-band
  trips, 0 established-strict, 0 shapes-C
  episodes, all vetoes outward. That verdict
  STANDS and is NOT re-scored here — this arm
  re-judges the same band under the DECIDED
  definition on FRESH legs, and reports its own
  DIAG counts.
- evidence/2026-11-02/sim-homeward-shapes-b.md
  (1505Z): A/C episode definitions + veto E table,
  inherited verbatim; scripts/
  analyze-homeward-shapes-b.js reused UNCHANGED
  for the homeward leg of the decided count.
- evidence/2026-11-02/sim-homewardac-b.md (1636Z):
  C integrity/established definitions, inherited
  verbatim via scripts/analyze-cband-b.js, reused
  UNCHANGED for the ledger.
- Convergence-tracker.md, run
  fleshout-loop-b-20261103T0856Z entry, "C prereg
  metric call — DECIDED": the NEXT C prereg's
  "fences shape C" INCLUDES outward attempt
  vetoes, via the outward-attempt form (armed
  attempt vetoed + armed day-6 stay on escapable
  ground), RETAINING the homeward form (vetoed
  homeward hop) for the still-open homeward-
  rescue question. That decision governs THIS
  prereg. It does NOT re-score cband's PILOT-GO.

## Question

On the 8 confirmed C destinations, re-run fresh,
how many episodes does the DECIDED definition
count — outward-attempt form and homeward form
separately and combined — and does the C
question stay open under both definitions if the
combined count is 0?

## The band (fixed, no substitutions, no re-screening)

C-only judged band from the 8 confirmed C
destinations of the merged 1730Z destfirst arm,
identical to the cband prereg table. One judged
leg pair (shadow + armed) per destination = 8
pairs, FRESH on the current base — the archived
cband corpus is a base-move comparison only,
never pooled with fresh legs.

| Seed | Screened origin | Dest | Route env CONSTRUCT_ROUTE_C1 (BFS haven->origin, destfirst-b-screen.js bfsRoute, proof-verified) | Hop env CONSTRUCT_HOP_C2 (label origin>dest; policy uses only dest) | Stage-2 actual day-6 start |
| 69702 | 0,6 | 0,7 | 4,5;4,6;3,6;2,6;1,6;0,6 | 0,6>0,7 | (0,6) |
| 69704 | 0,7 | 1,7 | 4,5;4,6;4,7;3,7;2,7;1,7;0,7 | 0,7>1,7 | (2,7) |
| 69706 | 0,2 | 0,1 | 3,4;2,4;1,4;0,4;0,3;0,2 | 0,2>0,1 | (1,1) |
| 69707 | 7,3 | 8,3 | 5,4;6,4;7,4;7,3 | 7,3>8,3 | (7,3) |
| 69709 | 1,2 | 1,1 | 3,4;2,4;1,4;1,3;1,2 | 1,2>1,1 | (1,2) |
| 69713 | 7,4 | 8,4 | 5,4;6,4;7,4 | 7,4>8,4 | (6,4) |
| 69714 | 0,4 | 0,3 | 3,4;2,4;1,4;0,4 | 0,4>0,3 | (1,4) |
| 69717 | 0,4 | 0,3 | 3,4;2,4;1,4;0,4 | 0,4>0,3 | (0,4) |

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
(the destfirst caveat): evidence/2026-11-03/
sim-cband-newdef-b-judged-<seed>-<origin>-to-
<dest>-{shadow,armed}.jsonl. Band
concatenations (seeds distinct, so concatenation
is safe): sim-cband-newdef-b-band-{shadow,
armed}.jsonl, read by scripts/
analyze-homeward-shapes-b.js UNCHANGED
(--episodes) for the homeward leg + veto E table.
Per-destination integrity/established by scripts/
analyze-cband-b.js UNCHANGED. Per-destination
outward episodes by the NEW scripts/
analyze-cband-newdef-b.js (this arm's only
analyzer delta).

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
ESTABLISHED-BAND (cband prereg reading):
integrity-ok AND shadow day-6 attempt hop (first
day-6 hop to D) simOk === false AND armed day-6
attempt hop vetoed === true.
ESTABLISHED-STRICT (homewardac literal):
established-band AND armed attempt hop
originSimOk === true. Reported alongside every
destination, never substituted mid-run. Still
structurally expected 0 on outward attempts
(originSimOk recorded only on homeward vetoes).

### The decided definition (primary)

NEWDEF-OUT episode (outward-attempt form, one
per judged pair, day 6 only): integrity-ok AND
shadow day-6 attempt hop simOk === false AND
armed day-6 attempt hop vetoed === true AND
armed day-6 dayEndReturnSim.ok === true (armed
day-6 stay on escapable ground). The shadow
day-6 end is reported alongside but is NOT a
gate — the decided form is vetoed + armed stay
only, exactly as the coordinator decided it.
NEWDEF-HOME episode (homeward form, retained):
a shapes-C episode from the UNCHANGED shapes
analyzer on the fresh band files (armed start !=
haven, vetoed homeward hop simOk === false +
originSimOk === true, both dayEnds true, shadow
same hop simOk === false; maximal consecutive-
day runs = episodes, any day in the 30d window),
attributed to its destination by seed.
COMBINED decided episodes = NEWDEF-OUT +
NEWDEF-HOME. The two forms are disjoint by
construction (an attempt hop is outward; a
homeward episode requires a vetoed homeward
hop), so a pair carrying both on different days
counts 2 and its table row shows both.
PRIMARY = combined decided episodes.
HOMEWARD-ONLY (= NEWDEF-HOME, the old
definition's count) is reported alongside every
total, never re-scored and never substituted
for the primary.

### Base-move rule (fixed now)

Every fresh pair is compared against its
archived cband leg (same seed, same route/hop
env): day-6 starts, integrity reason,
established-band/strict, armed attempt veto,
armed day-6 end + dayEnd ok. Any divergence is
reported as a base-move note with the divergence
day and field, and the FRESH leg is the judged
one — fresh and archived legs are NEVER pooled
into one count.

### Verdict shape (DIAG, fixed now)

This is a DIAGNOSTIC arm: pre-registered
descriptive verdict, NOT a deploy GO. No deploy
claim may come out of this arm, whatever the
counts.
Verdict mapping (judged against this header,
never re-scored mid-run, MEASUREMENT.md §14):
- Any REPRO FAIL -> DIAG-INSTRUMENT.
- Integrity-ok < 4 -> DIAG-SUBSTRATE (no judged
  band; not a guard verdict).
- Otherwise -> DIAG with counts: combined N,
  OUT n, HOME m, per destination.
- Combined 0 is a DIAG result, not a failure to
  hide: it means the C question stays open
  under BOTH definitions (old 0, decided 0).
- Combined >= 1 means the guard fences shape C
  under the decided definition on this band;
  the homeward-rescue question stays open
  unless HOME >= 1.

## Balanced panel (§15)

INAPPLICABLE by prereg design, stated
deliberately (same reasoning as cband): the
panel expresses the guard policies on natural
campaigns; this band's legs are constructed
trips whose before/after comparison IS the
shadow/armed pair on identical seeds and route
env. Running the panel on these seeds would
express the guard on non-judged natural play
and prove nothing about this run's question.
No compare file is fabricated.

## Sense-testing law

Read transcripts. Around every episode found
(day-6 sayLines on the armed leg, plus the
shadow leg's same beat), judge meaning,
coherence, relevance, consequences — never just
counts. If no episode is found, read around the
closest near-miss vetoes (armed attempt vetoed
but armed day-6 stay failed, or integrity-failed
pairs) and judge whether fences shaping C reads
as people acting, not machinery.

## Wall numbers

Honestly-limited: 30d construction legs, not
natural play. Report survival in-window, wave
reach in-window, and national / table / wins
in-window only if the horizon reaches them;
otherwise state the window limit (30d
construction substrate — no wall movement is
shown or claimed).

## Metric review (doubts for the NEXT run, not this one)

- The decided outward-attempt form drops the
  shadow-end condition: a pair where the shadow
  scholar ALSO ends day 6 on escapable ground
  still counts as an OUT episode (veto + armed
  stay). Whether that over-counts "fencing" is a
  question for the next run, not a re-score here
  — shadow ends are reported alongside so the
  next prereg can apply a stricter form without
  re-running.
- The homeward form's C-qualifying days can
  occur on any day of the 30d window, while OUT
  episodes are day-6 only; a combined count
  therefore mixes a one-day form with a
  thirty-day form. The per-form split in the
  evidence file keeps that visible.
- 69702 is again predicted fragile (same
  mechanism as cband: armed walk-out veto ->
  start-mismatch). Prediction only — the fresh
  legs decide, and any change from archived is a
  base-move note.

## Deliverable

Evidence file evidence/2026-11-03/
sim-cband-newdef-b.md (prereg header,
per-destination integrity / established / OUT /
HOME ledger, combined + homeward-only totals,
base-move notes, episodes + veto E table, sense
reading, village assessment in plain words, wall
numbers, metric review section, out-of-scope
findings list for the coordinator's backlog in
sim-findings format), plus the judged leg files
above, the band concatenations, the analyzer
outputs, and the proof test, all committed on
branch sim-cband-newdef-b. Report to
coordinator: verdict (DIAG counts + what stays
open), per-destination results + failure
reasons, proof-test results, commit hashes,
anything left uncommitted or failed.

## Explicitly excluded

No re-screening, no substitutions, no re-judging
of cband / destfirst / homewardac / shapes; no
src/js changes; no edits to competent.js, the
guard policy, the construct policy, the
homeconstruct driver, the homeconstruct
analyzer, the shapes analyzer, the cband
analyzer, or the destfirst scripts; no default
flip; no bundled fix; no landing of a game
change on any count; no other worktree touched;
no sibling claims touched; no push, bump, live
verification, merge, or rebase; no writes to
hidden_files/sim-findings.md (findings go in
the evidence file instead) or to
convergence-tracker.md (coordinator only).
