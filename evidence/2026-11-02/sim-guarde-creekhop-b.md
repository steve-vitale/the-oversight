# sim-guarde-creekhop-b — Guard-E creek-hop fidelity, judged pilot

Run: oversight-flesh-out-loop-b, arm sim-guarde-creekhop-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261103T013651Z, axis food-economy).
Worktree sim-guarde-creekhop-b, branch sim-guarde-creekhop-b.
Base commit (pinned in prereg): 90637bc7c.
Prereg: evidence/2026-11-02/sim-guarde-creekhop-b-prereg.md
(committed 08719a1f BEFORE any judged sim).
Instruments: committed d943fcc5 (proof 17/17) before
the pilot band ran. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands
the branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **DIAG — mechanism named: entry-blindness.**
  E-pass fidelity 24/28 = 85.71% (< 95% GO bar),
  4 E-pass + refused disagreements, ALL 4 classified
  as destination-entry blockages, 0 unclassified.
  The guard's E(D) evaluates escape FROM the
  destination and never checks entry INTO it — so
  it allows hops the engine refuses. This is a
  scope gap in E, not an E-computation error.
- **Origin-asymmetry hypothesis REFUTED.** The
  homewardac evidence hypothesized that creek
  blockage depends on entry origin and that the
  engine's d=1 check (no origin parameter) differs
  from the guard's checkHop (explicit origin).
  Measured on all 34 pilot hops, the guard's
  checkHop with explicit origin predicts the engine
  outcome EXACTLY (34/34, including all 4
  refusals and all 30 crossings). The engine's
  d=1 check defaults its origin to the player's
  live tile, which IS the hop origin for a real
  hop — so both models see the same creek. No
  origin asymmetry exists on this band.
- **Not DIAG-ERROR.** No disagreement has an empty
  entry model and a null engine block; the guard's
  hop model itself is faithful. What is unfaithful
  is using E alone as an allow signal.
- **Prior veto verdicts stand.** Entry-blindness
  touches only ALLOWS (E pass). Every prior veto
  fired on E fail; nothing here revisits a veto.
  A veto says "don't step into a pocket" — the
  engine allowing that step is the reason to fence
  it, not a contradiction.

## What was built (new files ONLY, zero game-code change)

- scripts/creekhop-b-recorder.js — recorder leg:
  competent days 1-4, day-5 homewardac shape-A
  forced walk-out (5,4 -> 6,4 -> 7,4 -> 7,3 ->
  7,2 -> 7,1) through the engine's own travelTo,
  stopping at the first refusal. No guard
  installed (shadow guard cannot change a
  trajectory); the guard's numbers are computed
  directly per hop via verbatim escapeCheck +
  checkHop imports. Per hop: E, entry blockers,
  engine travelBlockage with the same explicit
  origin, destination tile at hop time (type /
  needsBridge / bridged / blockFrom), swimmer,
  moved, and say lines spoken during the call.
- scripts/analyze-guarde-creekhop-b.js — fidelity
  analyzer: per-seed moved-pattern, control-gate
  comparison vs a prior jsonl, fidelity table,
  blockType census, verdict inputs.
- scripts/test-guarde-creekhop-b.js — proof 17/17
  (reused-files-unmodified, route, pilot seeds,
  69502 reproduction + classification + tile
  capture + say capture).
- UNCHANGED, verified by the proof test's git
  check: guard policy, competent.js, construct
  policy/driver, shapes analyzer, src/js. Zero
  src/js changes, zero default flips, zero
  bundled fix.

## Control gate: base equality (STOP condition — PASSED, 8/8)

Recorder legs on base 90637bc7c reproduce the
prior homewardac shadow legs exactly:

| Seed | Day-5 start | Moved-pattern | Control |
| 69501 | (4,4) | T T T T T T | PASS |
| 69502 | (4,4) | T T T T T F | PASS |
| 69503 | (4,4) | F | PASS |
| 69504 | (4,4) | T T T T T T | PASS |
| 69505 | (4,4) | T T T T T T | PASS |
| 69506 | (4,4) | T T T T T T | PASS |
| 69507 | (4,4) | T F | PASS |
| 69508 | (4,4) | F | PASS |

Day-5 start haven on 8/8 legs; moved-pattern
identical to the prior corpus hop for hop. No
substrate drift. Every judged number below is
fresh-recorder on current base, not reused
prior numbers (the prior corpus served only as
the control comparison).

## 69502 reproduction (the named seed — REPRODUCED)

Forced hop (7,2)->(7,1), day 5, fresh recorder
leg on base 90637bc7c:
- E: ok=true, via=direct, directOk=true, legs=0.
- Entry (checkHop, origin (7,2) explicit):
  blocker [{x:7, y:1, blockType:'creek'}].
- Engine (travelBlockage, origin (7,2)
  explicit): {kind:'blockage', blockType:'creek'}.
- Destination tile at hop time: type creek,
  needsBridge=true, bridged=false, blockFrom
  {dx:1, dy:0, type:'fallen_tree'} (guards entry
  from the EAST (8,1), not from the south — the
  fallen tree is NOT the cause here; the
  needsBridge creek rule is).
- Swimmer: false. Moved: false.
- Say line during the call: "The creek runs
  fast here — no crossing without a bridge or a
  swim."

The prior finding reproduces exactly, and the
classification is now complete: both models see
the creek, E does not ask about it.

## Pilot fidelity table (8 legs, 34 forced hops)

E-pass fidelity = moved / E-pass hops = 24/28
= 85.71%. E-fail hops: 6, all moved (pocket
entries on 69501/69504 — the guard would veto
them on armed legs, as homewardac showed).
E-fail + refused: 0. Entry model == engine
outcome on 34/34 hops.

Per-hop table (E = escapeCheck ok; entry =
checkHop blockTypes; engine = travelBlockage
blockType or —):

| Seed | Hop | E | Moved | Entry | Engine |
| 69501 | 4,4->5,4 | pass | yes | — | — |
| 69501 | 5,4->6,4 | pass | yes | — | — |
| 69501 | 6,4->7,4 | pass | yes | — | — |
| 69501 | 7,4->7,3 | FAIL | yes | — | — |
| 69501 | 7,3->7,2 | FAIL | yes | — | — |
| 69501 | 7,2->7,1 | FAIL | yes | — | — |
| 69502 | 4,4->5,4 | pass | yes | — | — |
| 69502 | 5,4->6,4 | pass | yes | — | — |
| 69502 | 6,4->7,4 | pass | yes | — | — |
| 69502 | 7,4->7,3 | pass | yes | — | — |
| 69502 | 7,3->7,2 | pass | yes | — | — |
| 69502 | 7,2->7,1 | pass | NO | creek | creek |
| 69503 | 4,4->5,4 | pass | NO | creek | creek |
| 69504 | 4,4->5,4 | pass | yes | — | — |
| 69504 | 5,4->6,4 | pass | yes | — | — |
| 69504 | 6,4->7,4 | pass | yes | — | — |
| 69504 | 7,4->7,3 | FAIL | yes | — | — |
| 69504 | 7,3->7,2 | FAIL | yes | — | — |
| 69504 | 7,2->7,1 | FAIL | yes | — | — |
| 69505 | 4,4->5,4 | pass | yes | — | — |
| 69505 | 5,4->6,4 | pass | yes | — | — |
| 69505 | 6,4->7,4 | pass | yes | — | — |
| 69505 | 7,4->7,3 | pass | yes | — | — |
| 69505 | 7,3->7,2 | pass | yes | — | — |
| 69505 | 7,2->7,1 | pass | yes | — | — |
| 69506 | 4,4->5,4 | pass | yes | — | — |
| 69506 | 5,4->6,4 | pass | yes | — | — |
| 69506 | 6,4->7,4 | pass | yes | — | — |
| 69506 | 7,4->7,3 | pass | yes | — | — |
| 69506 | 7,3->7,2 | pass | yes | — | — |
| 69506 | 7,2->7,1 | pass | yes | — | — |
| 69507 | 4,4->5,4 | pass | yes | — | — |
| 69507 | 5,4->6,4 | pass | NO | washed_out | washed_out |
| 69508 | 4,4->5,4 | pass | NO | creek | creek |

Disagreement census: entry[creek] engine[creek]
3 (69502, 69503, 69508); entry[washed_out]
engine[washed_out] 1 (69507). Unclassified: 0.

The 4 disagreements, tile by tile:
- 69502 (7,2)->(7,1): creek, needsBridge true,
  unbridged, swimmer false. (The 69502 shape.)
- 69503 (4,4)->(5,4): creek, needsBridge true,
  unbridged, blockFrom null, swimmer false —
  the very first step out of haven is a bridged
  creek. Same shape, different tile.
- 69508 (4,4)->(5,4): identical to 69503 —
  creek, needsBridge true, unbridged, swimmer
  false. The shape is not a one-seed artifact:
  it recurs on 3 seeds for creeks alone.
- 69507 (5,4)->(6,4): forest_floor, blockFrom
  washed_out guarding entry from (5,4) — and
  the scholar HAS swimmer (true). Swimming does
  not help a washout, correctly; E passes because
  escape from (6,4) never re-enters (6,4) from
  (5,4). Entry-blindness is not creek-specific:
  any entry blockage on the destination fools an
  E-only allow.

Side-specificity works in both models: several
crossed tiles carry blockFrom guarding OTHER
sides (e.g. 69501 (7,4) fallen_tree from the
south, entered from the west; 69502 (7,4)
rubble from the east, entered from the north)
— entry and engine agree these are crossable,
and they are crossed. The models are not
over-blocking; they are exactly right about
entry. E simply never consults them.

## Why E passes a hop the engine refuses (the mechanism, precisely)

installGuard evaluates ONLY escapeCheck(x, y)
— a simulation that STARTS on the destination
tile and walks home. The destination tile's own
enterability from the hop origin is never an
input to that simulation: the sim never
"enters" its start tile. On 69502, from (7,1)
the direct sim walks (7,1)->(7,2)->…->haven
without re-crossing (7,1) from (7,2), so E
passes — while the real hop must enter (7,1)
from (7,2) across an unbridged needsBridge
creek, which the engine refuses. The guard's
allow therefore means "IF you were standing on
that tile, you could get home" — not "you can
step onto that tile." On an armed leg the allow
is vacuous: the scholar stays, and (per the
prior corpus) competent.daily retries through
the same blocked tile (69502: 3 further creek
lines the same day via (7,2)->(7,0) jumps whose
intermediate scan hits (7,1)).

Fix shape named, NOT landed (follow-up build
decision): an allow should additionally require
the hop itself to be engine-crossable — the
guard's own checkHop already computes exactly
that (34/34 agreement here), so a pre-allow
entry check reusing checkHop would be faithful
and would not change any veto (vetoes fire on
E fail regardless of entry). Whether the guard
should ALSO speak when an allowed hop is
engine-refused (so the player hears the guard's
voice, not just the engine's) is a narration
question for that build, not answered here.

## Sense-testing (transcripts, not just counts)

69502 day-5 walk-out, in the scholar's own
steps: trail edge, meadow, then three creek
tiles in a row — kingfisher on the far bank,
crayfish under the rocks, a striped beast
pacing at the treeline — then the refusal:
"The creek runs fast here — no crossing without
a bridge or a swim." The land teaches its own
distinction: the first creeks are waded without
comment (needsBridge false — crossable water),
the fourth is fast water with a named remedy
(bridge or swim). A player reading this learns
WHY the step failed and WHAT would fix it, in
one line, with no mechanism words. The washout
refusal on 69507 reads the same way, shorter:
"The path is washed out." — obstacle named,
remedy unstated (clearing/going around is the
game's general answer, not this line's job).

The guard's part in the scene is silence — and
that silence is honest, not misleading. In
shadow mode the guard never speaks by design;
on an armed leg it would also stay silent on an
allow, and the engine's refusal line would be
the only voice. The player is never told
something false; what the player is NOT told is
that the guard thought the hop fine. The gap
found here is analytic (the guard's model
scope), not narrative: no line on the page
contradicts another line. One corroborating
wrinkle from the prior corpus (not new here):
after the 69502 refusal, the scholar's day
retries the blocked crossing 3 more times
through (7,2)->(7,0) jumps — the same dogged
retry loop cband noted on 69706. The retries
belong to competent.daily's walk-home, not to
the guard, and are noted here, not fixed here.

## Village assessment (plain words)

Eight villages, five days each, and the same
east road walked eight times. On four roads the
scholar walks all the way to the far tile and
nothing stops them — open ground, groves, and
creeks shallow enough to wade. On two roads the
scholar walks into ground the guard would fence
— pocket ground past (7,4) — and keeps walking,
because on these legs the guard only watches
and never says no. On the other four roads the
land itself says no: three times a fast creek
with no bridge (twice on the very first step
out of haven, once at the far end after three
wadable creeks), once a washed-out path even a
swimmer cannot take. The guard, watching all
eight roads, calls every one of those refused
steps fine — not because its map is wrong (its
hop-by-hop map matches the engine exactly) but
because it only ever asks "could you get home
from there?" and never "can you step there at
all?" Nothing here reaches national, the table,
or a win — the recorder stops on day 5 by
design, so no wall numbers beyond day-5
survival (8/8 legs reached the walk-out) are
claimed, and no wall movement is shown.

## Metric review (for the NEXT run, never a re-score)

- The prereg's fidelity definition (moved /
  E-pass hops) was the right one: the naive
  agreement share (simOk == moved) would have
  counted the 6 pocket entries (E fail + moved)
  as disagreements, but those are the guard
  working as designed (fencing pockets). Future
  fidelity preregs should keep the E-pass
  denominator and report pocket entries
  separately, as here.
- The control gate worked exactly as intended:
  base equality was proven hop-for-hop before
  any fidelity number was read, so the pilot
  numbers are fresh-base measurements, not
  prior-corpus echoes — even though they match
  the prior corpus exactly (which is itself the
  strongest base-equality evidence available).
- The 95% GO bar was honest but, in hindsight,
  nearly unreachable for an E-only allow on any
  band with blocked destinations: any band with
  >= 1 blocked destination in ~20 E-pass hops
  fails it. That does not make the bar wrong —
  it makes the DIAG verdict the expected one
  whenever destinations are entry-blocked, which
  is the finding. A follow-up band testing a
  FIXED guard (entry-checked allow) should keep
  the same 95% bar: then it measures the fix.
- The north (C) route's creek blocks (69606
  (4,5)->(4,6) creek, 69607 (4,4)->(4,5) creek,
  per homewardac) were
  NOT re-measured here; the pilot band was the
  A route only, per the brief. If a follow-up
  wants the creek-hop census beyond the east
  road, the recorder takes any route via
  CONSTRUCT_ROUTE_A — the north route is a
  one-command re-run, not a new instrument.

## Balanced panel (§15)

VACUOUS by prereg design: the panel expresses
guard policies on natural campaigns; this run's
before/after IS the recorder leg vs the prior
shadow leg on identical seeds (the control
gate). No compare file is fabricated.

## Findings for the coordinator (sim-findings format; NOT
written to hidden_files/sim-findings.md — coordinator appends)

- [open] 2026-11-02 — guard-E-fidelity — guard-E
  entry-blindness (DIAG, this run): E(D) evaluates
  escape FROM the destination and never checks
  entry INTO it, so it allows hops the engine
  refuses: E-pass fidelity 24/28 = 85.71% on the
  69501-69508 A band, 4 refusals (3 creek
  needsBridge-unbridged, 1 washed_out), 0
  unclassified. Fix shape (not landed): a
  pre-allow entry check reusing the guard's own
  checkHop, which predicts the engine exactly
  (34/34 hops here).
- [open] 2026-11-02 — guard-E-fidelity —
  origin-asymmetry hypothesis refuted (this run):
  checkHop with explicit origin matches the engine
  on all 34 pilot hops; the engine's d=1 check
  defaults origin to the live tile, which IS the
  hop origin. The homewardac "creek blockage
  depends on entry origin" hypothesis does not
  survive measurement; do not build on it.
- [open] 2026-11-02 — guard-narration — dogged
  retries through a refused crossing (prior
  corpus corroboration, this run's sense-test):
  after the 69502 refusal, competent.daily
  retries the blocked tile 3 more times the same
  day ((7,2)->(7,0) jumps, intermediate scan
  hits (7,1)); same retry-loop class as cband
  69706. Belongs to competent.daily's walk-home,
  not to the guard.

## Census (proof, not judged evidence)

scripts/test-guarde-creekhop-b.js: ALL PASS (17
checks — reused-files-unmodified, route parse,
pilot seeds, recorder exit + 69502 leg, day-5
start haven, moved-pattern 5 ok + 1 refused,
target hop identity, E pass + moved false,
entry blockers named, engineBlock named,
models agree, tile captured, say captured,
no recorder error). Predecessor proof tests
re-run post-pilot as regression checks, all
green, not re-authored:
test-homewardconstruct-b 15/15,
test-homeward-shapes-b ALL PASS,
test-homext-abl-b census 100% (21 checks),
test-homeveto-screen-b ALL PASS,
test-homeward-substrate-b ALL PASS,
test-cband-b 25/25, test-destfirst-b 21/21.

## Corpora

- evidence/2026-11-02/sim-guarde-creekhop-b-prereg.md
- evidence/2026-11-02/sim-guarde-creekhop-b.md (this file)
- evidence/2026-11-02/sim-guarde-creekhop-b-pilot.jsonl
- evidence/2026-11-02/sim-guarde-creekhop-b-pilot.log
- evidence/2026-11-02/sim-guarde-creekhop-b-fidelity.txt
- scripts/creekhop-b-recorder.js
- scripts/analyze-guarde-creekhop-b.js
- scripts/test-guarde-creekhop-b.js
