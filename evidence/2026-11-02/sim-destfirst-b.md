# sim-destfirst-b — Destination-first construction: screen first, then force the trip

Run: oversight-flesh-out-loop-b, arm sim-destfirst-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1730Z, axis food-economy).
Worktree sim-destfirst-b, branch sim-destfirst-b.
Prereg: evidence/2026-11-02/sim-destfirst-b-prereg.md
(committed 46dd58913 BEFORE screening and before any
judged sim; instruments committed 7fa2d14a9 first).
This worker does NOT push, bump, verify live, merge,
or rebase; the coordinator lands the branch. Status
to coordinator: committed in worktree, pending
coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **DIAG-NO-BAND — not a guard verdict.** Stage 2
  confirmed 0 true A setups in 40 tries (the cap)
  and 8 true C destinations in 31 tries. The
  prereg's bar is conjunctive: >= 4 integrity-ok
  trips AND >= 1 established A AND >= 1 established
  C. With A at zero, no judged band exists and NO
  judged legs ran, per the prereg's stop rule. No
  guard verdict (GO / NO-GO / episode count) is
  claimed for either shape.
- The split result matters and is reported exactly:
  destination-first construction SOLVES the C
  construction problem at stage-2 level (8
  confirmed C destinations, vs 0 established on the
  fixed-route C band at 1636Z) but does NOT solve
  the A construction problem (0/40). The C
  confirmations are shadow-leg only — no armed
  legs, no origin-E verification, no episode counts
  — so C is "constructible", not "judged". A
  follow-up may pre-register a C-only judged band
  from these 8 trips; this run does not judge them.
- Before/after, construction level (not a lever
  effect — no judged legs exist to compare): fixed
  routes at 1636Z produced 0 pocketed destinations
  on 16 trips; destination-first screening produced
  screen hits on 39/40 seeds and stage-2
  confirmations of 8 C destinations on 31 tries and
  0 A setups on 40 tries.

## What was built (new files ONLY, zero game-code change)

- scripts/destfirst-b-screen.js — probe-only
  screener: per seed, day-1-start and day-5-start
  E-maps over all 81 home-board tiles (escapeCheck
  is read-only; probing mutates nothing), plus the
  screen classification (A-LAT / A-POCKET / C-PAIR)
  and a deterministic BFS route helper.
- scripts/analyze-destfirst-b.js — generalized
  constructed-trip analyzer: the homewardac
  definitions with the destination as a parameter
  (plus the walk-out E clause for A), day-1
  identity, integrity, established.
- scripts/destfirst-b-confirm.js — stage-2
  confirmation reader for single shadow legs
  (A: walk-out completes + walk-out E all-pass +
  shadow day-5 day-end E false; C: day-6 start off
  haven + attempt to D attempted + shadow hop E
  false; origin escapability explicitly NOT
  confirmed here).
- scripts/test-destfirst-b.js — proof 21/21.
- UNCHANGED, verified by the proof test's git
  check: construct policy, homeconstruct driver,
  homeconstruct analyzer, shapes analyzer, guard
  policy, competent.js, homext driver. Zero src/js
  changes, zero default flips, zero bundled fix.

## Stage 1 — screen (40 fresh seeds, 69701-69740)

Probe states: day-1 start and day-5 start (after
four competent days). Classes per state: A-LAT
(direct fails, lateral passes), A-POCKET (E
fails), C-PAIR (adjacent origin-passing /
destination-failing pair, same state).

Totals: day-1 A-LAT 402, A-POCKET 574, C-PAIR 467;
day-5-start A-LAT 431, A-POCKET 562, C-PAIR 422.
Seeds with at least one hit in either state: A-LAT
39/40, A-POCKET 35/40, C-PAIR 35/40. The screen is
NOT the bottleneck — hits are abundant on nearly
every seed. One curiosity: seed 69729 has ZERO hits
in every class at both states — a map on which
every tile escapes at both probed times (the
screen's negative control, in effect).

Per-seed screen counts (day1 aLat / aPocket /
cPairs | day5 aLat / aPocket / cPairs):

| Seed | d1 aLat | d1 aPocket | d1 cPairs | d5 aLat | d5 aPocket | d5 cPairs |
| 69701 | 6 | 1 | 3 | 9 | 3 | 5 |
| 69702 | 8 | 8 | 7 | 7 | 17 | 15 |
| 69703 | 9 | 7 | 13 | 9 | 4 | 7 |
| 69704 | 24 | 5 | 13 | 30 | 5 | 9 |
| 69705 | 9 | 0 | 0 | 7 | 0 | 0 |
| 69706 | 15 | 16 | 23 | 20 | 10 | 17 |
| 69707 | 13 | 7 | 13 | 13 | 1 | 3 |
| 69708 | 3 | 0 | 0 | 4 | 3 | 5 |
| 69709 | 8 | 23 | 15 | 12 | 22 | 13 |
| 69710 | 6 | 13 | 10 | 13 | 10 | 8 |
| 69711 | 4 | 0 | 0 | 9 | 3 | 5 |
| 69712 | 4 | 2 | 4 | 10 | 4 | 6 |
| 69713 | 7 | 5 | 6 | 8 | 5 | 6 |
| 69714 | 14 | 3 | 9 | 8 | 6 | 10 |
| 69715 | 13 | 18 | 28 | 16 | 17 | 18 |
| 69716 | 18 | 37 | 30 | 21 | 37 | 33 |
| 69717 | 9 | 38 | 17 | 12 | 39 | 17 |
| 69718 | 5 | 0 | 0 | 7 | 0 | 0 |
| 69719 | 7 | 53 | 27 | 3 | 56 | 15 |
| 69720 | 16 | 2 | 5 | 15 | 5 | 10 |
| 69721 | 6 | 0 | 0 | 1 | 0 | 0 |
| 69722 | 8 | 1 | 2 | 10 | 2 | 5 |
| 69723 | 17 | 45 | 24 | 11 | 40 | 19 |
| 69724 | 4 | 0 | 0 | 4 | 0 | 0 |
| 69725 | 14 | 6 | 8 | 21 | 4 | 4 |
| 69726 | 17 | 20 | 29 | 19 | 24 | 26 |
| 69727 | 8 | 3 | 11 | 14 | 2 | 7 |
| 69728 | 13 | 36 | 14 | 4 | 35 | 11 |
| 69729 | 0 | 0 | 0 | 0 | 0 | 0 |
| 69730 | 3 | 48 | 15 | 3 | 48 | 15 |
| 69731 | 5 | 4 | 8 | 5 | 4 | 8 |
| 69732 | 6 | 40 | 18 | 5 | 37 | 16 |
| 69733 | 11 | 25 | 17 | 13 | 16 | 16 |
| 69734 | 19 | 21 | 18 | 18 | 14 | 14 |
| 69735 | 14 | 6 | 13 | 16 | 6 | 11 |
| 69736 | 15 | 15 | 15 | 15 | 22 | 21 |
| 69737 | 5 | 18 | 14 | 11 | 20 | 17 |
| 69738 | 8 | 1 | 2 | 4 | 1 | 2 |
| 69739 | 14 | 38 | 18 | 11 | 35 | 14 |
| 69740 | 17 | 9 | 18 | 13 | 5 | 14 |

Screen output: evidence/2026-11-02/
sim-destfirst-b-screen.jsonl (40 lines). All 40
screen legs survived their 4 competent days
(daysAlive 4/4 on every seed).

## Stage 2 — dynamic confirmation (shadow-only)

Tries in seed order, max 2 per seed per shape,
per the prereg priority (A: day-5 A-LAT, day-1
A-LAT, day-5 A-POCKET, day-1 A-POCKET; C: day-5
pairs, day-1 pairs, origin==haven excluded).
Stop rules honored: A hit its 40-try cap with 0
confirmations; C stopped at 8 confirmations after
31 tries (39 listed C tries never ran).

### A tries: 0/40 confirmed (the cap, not a sample)

Failure modes (walkout = forced walk-out reached
the destination; walkE = every shadow walk-out
hop simOk; dayEndOk = shadow day-5 day-end E):

- walkout=true, walkE=true, dayEndOk=true: 14 —
  clean entry, scholar camped at the destination
  at day-end, escape still passes.
- walkout=true, walkE=false, dayEndOk=false: 2 —
  pocket at day-end, but the entry hop E already
  failed (see near-misses below).
- walkout=true, walkE=false, dayEndOk=true: 2 —
  an intermediate walk-out hop E failed; scholar
  moved on, day-end passes elsewhere.
- walkout=false (engine-blocked route): 22 —
  creeks/washouts/trees cut the BFS route; day-end
  passes in all 22 (the scholar never reached the
  tile).

Full A ledger (seed | dest | walkout | walkE |
dayEndOk | confirmed):

| 69701 | 6,2 | true | true | true | false |
| 69701 | 6,6 | false | null | true | false |
| 69702 | 0,4 | false | null | true | false |
| 69702 | 0,5 | false | null | true | false |
| 69703 | 0,0 | true | true | true | false |
| 69703 | 1,5 | true | true | true | false |
| 69704 | 0,0 | false | null | true | false |
| 69704 | 0,2 | false | false | true | false |
| 69705 | 5,7 | false | null | true | false |
| 69705 | 5,8 | false | null | true | false |
| 69706 | 0,2 | false | null | true | false |
| 69706 | 0,3 | false | null | true | false |
| 69707 | 5,2 | true | true | true | false |
| 69707 | 5,3 | true | true | true | false |
| 69708 | 5,0 | false | null | true | false |
| 69708 | 6,0 | true | true | true | false |
| 69709 | 5,8 | true | false | false | false |
| 69709 | 6,3 | false | null | true | false |
| 69710 | 5,0 | false | null | true | false |
| 69710 | 5,1 | false | null | true | false |
| 69711 | 0,5 | true | true | true | false |
| 69711 | 0,6 | true | true | true | false |
| 69712 | 5,0 | true | true | true | false |
| 69712 | 5,1 | true | true | true | false |
| 69713 | 6,8 | false | null | true | false |
| 69713 | 7,1 | false | null | true | false |
| 69714 | 0,5 | false | true | true | false |
| 69714 | 0,6 | true | true | true | false |
| 69715 | 0,2 | false | null | true | false |
| 69715 | 1,4 | false | null | true | false |
| 69716 | 0,5 | true | false | false | false |
| 69716 | 1,4 | false | null | true | false |
| 69717 | 5,5 | false | true | true | false |
| 69717 | 5,6 | false | null | true | false |
| 69718 | 0,1 | true | true | true | false |
| 69718 | 0,8 | false | null | true | false |
| 69719 | 5,6 | true | true | true | false |
| 69719 | 7,7 | true | true | true | false |
| 69720 | 0,0 | true | false | true | false |
| 69720 | 0,2 | true | false | true | false |

Walk-out-complete detail (18 trips): on all 14
clean-entry trips the scholar's day-end position
IS the destination and day-end E passes — via
LATERAL (directOk=false, legs=1 on the three
trips inspected in full: 69701 6,2; 69703 0,0;
69707 5,2). The lateral leg that the screen saw
at day-5 start is still alive at day-end. One day
of foraging does not kill it.

Near-misses, dissected (both fail the walk-out
clause, so neither is a true A setup):
- 69709 dest 5,8: final walk-out hop (5,7)->(5,8)
  E-fails at hop time; scholar camps at (5,8) and
  day-end E fails there. A real pocket at the
  destination — but it was already pocketed on
  entry, so the armed leg would have vetoed the
  outward step (outward prevention, as at 1636Z),
  not rescued anyone homeward.
- 69716 dest 0,5: intermediate walk-out hop
  (4,5)->(3,5) E-fails; scholar does not camp at
  the destination (day-end position (1,0), day-end
  E fails THERE, not at the destination). Not an A
  setup at the destination at all.

### C tries: 8/31 confirmed (construction solved at stage-2 level)

Failure modes: off-haven + attempted + hop E
false (confirmed): 8; off-haven + attempted + hop
E true (destination escapable, fence has nothing
to fence — the 1636Z C pattern): 7; off-haven +
attempt not offered (destination beyond offer
range from the actual day-6 start): 13, of which
one logged a natural E-failing hop to the
destination during competent.daily; start at haven
(walk-out failed entirely): 3.

Confirmed C destinations (stage-2 only — origin
escapability NOT yet verified; see verdict):

| Seed | Screened origin | Dest | Actual day-6 start | Attempted | Hop E |
| 69702 | 0,6 | 0,7 | (0,6) | true | false |
| 69704 | 0,7 | 1,7 | (2,7) | true | false |
| 69706 | 0,2 | 0,1 | (1,1) | true | false |
| 69707 | 7,3 | 8,3 | (7,3) | true | false |
| 69709 | 1,2 | 1,1 | (1,2) | true | false |
| 69713 | 7,4 | 8,4 | (6,4) | true | false |
| 69714 | 0,4 | 0,3 | (1,4) | true | false |
| 69717 | 0,4 | 0,3 | (0,4) | true | false |

Note the screened origin is often NOT the actual
day-6 start (the scholar's day-5 competent.daily
moves them after the walk-out) — confirmation is
on the ACTUAL trip, which is why the screened
pair is only a prioritization, never the verdict.
Full C ledger (seed | screened origin | dest |
day-6 start | attempted | hop E | confirmed):

| 69701 | 6,7 | 7,7 | (6,4) | false | absent | false |
| 69701 | 6,8 | 7,8 | (6,4) | false | absent | false |
| 69702 | 0,3 | 0,2 | (2,4) | false | absent | false |
| 69702 | 0,6 | 0,7 | (0,6) | true | false | true |
| 69703 | 0,0 | 1,0 | (0,0) | true | true | false |
| 69703 | 1,1 | 1,0 | (1,1) | true | true | false |
| 69704 | 0,7 | 0,8 | (2,7) | false | absent | false |
| 69704 | 0,7 | 1,7 | (2,7) | true | false | true |
| 69706 | 0,2 | 0,1 | (1,1) | true | false | true |
| 69706 | 0,7 | 1,7 | (1,1) | false | absent | false |
| 69707 | 7,3 | 8,3 | (7,3) | true | false | true |
| 69707 | 8,2 | 8,3 | (4,4) | false | absent | false |
| 69708 | 6,1 | 7,1 | (6,1) | true | true | false |
| 69708 | 7,0 | 7,1 | (7,0) | true | true | false |
| 69709 | 0,2 | 0,1 | (0,2) | true | true | false |
| 69709 | 1,2 | 1,1 | (1,2) | true | false | true |
| 69710 | 6,5 | 7,5 | (5,4) | false | absent | false |
| 69710 | 6,6 | 7,6 | (5,4) | false | absent | false |
| 69711 | 0,7 | 0,8 | (0,7) | true | true | false |
| 69711 | 0,7 | 1,7 | (0,7) | true | true | false |
| 69712 | 7,0 | 8,0 | (6,3) | false | absent | false |
| 69712 | 7,1 | 8,1 | (6,3) | false | false | false |
| 69713 | 7,4 | 8,4 | (6,4) | true | false | true |
| 69713 | 7,5 | 8,5 | (6,4) | false | absent | false |
| 69714 | 0,4 | 0,3 | (1,4) | true | false | true |
| 69714 | 0,8 | 1,8 | (4,7) | false | absent | false |
| 69715 | 0,2 | 0,3 | (4,4) | false | absent | false |
| 69715 | 1,3 | 0,3 | (4,4) | false | absent | false |
| 69716 | 0,5 | 0,4 | (1,0) | false | absent | false |
| 69716 | 0,5 | 0,6 | (1,0) | false | absent | false |
| 69717 | 0,4 | 0,3 | (0,4) | true | false | true |

Stage-2 files: evidence/2026-11-02/
sim-destfirst-b-stage2-<shape>-<seed>-<dest>.jsonl
(68 files covering 71 tries; see the filename
disclosure below).

### Filename disclosure (instrument flaw, repaired, ledger authoritative)

Stage-2 filenames omit the C origin, so 4 pairs
of C tries on the same seed with the same
destination overwrote each other's files
(69703-1,0; 69707-8,3; 69708-7,1; 69715-0,3).
The per-try CONFIRM lines were computed at run
time before any overwrite, so the ledgers above
are authoritative; the archived files held only
the later try for those 4 pairs. Repair: the
69707-8,3 file (the only overwritten file holding
a CONFIRMED first try) was restored by re-running
that exact try (route 5,4;6,4;7,4;7,3, hop
7,3>8,3) — it reproduced byte-for-byte in outcome
(day-6 start (7,3), hop E false, confirmed=true),
proving determinism — and the later try was kept
as ...-8,3-origin-8,2.jsonl. The other 3 pairs
were both-false tries; their first runs are
ledger-only. Next run's filenames must include the
origin (see metric review).

## Why A never confirmed (the mechanism, sharply)

Destination-first removed the fixed-route failure
(the destination is now screened pocket-plausible
before the trip), but the A shape needs something
stronger than a plausible tile: a pocket that
CLOSES DURING the trip day. In 40 tries that never
happened. The observed partition is exhaustive:
- Pockets exist at entry (walk-out hop E fails):
  the guard would fence outward, not rescue
  homeward — 4 walk-out-complete trips, 2 with
  day-end failure.
- Pockets never form by day-end (clean entry, camp
  at the destination, lateral escape alive at
  day-end): 14 trips, day-end escape via lateral
  legs=1, direct still failing.
- The route itself is cut (22 trips): the BFS
  shortest path crosses creeks/washouts/trees.
A one-day window does not deplete the lateral
chain: the scholar's day-5 foraging from the
destination leaves the lateral escape intact. The
1636Z prototype-A story (a pocket closing over
days, scholar stranding) is a MULTI-day formation
story, and this run only ever looked at one
day-end. That is the next run's question, not a
claim made here.

## Wall numbers (context only, never pooled as a verdict)

Archived stage-2 legs (68 files; construction
legs, not natural play): 67 survived 30d, 1
village-lost; maxWave 3 (wave-2 on 19, wave-3 on
49); national / table / wins 0 on every leg.
Window-limited 30d construction substrate — no
wall movement is shown or claimed. The 3
superseded first-tries (see disclosure) are absent
from the file count; their ledger outcomes were
all non-confirmed, so no wall number turns on
them.

## Balanced panel (§15, context never verdict)

VACUOUS, stated deliberately: the prereg's panel
attempt is defined on the A-shape judged seeds,
and no judged band exists (DIAG-NO-BAND, no
judged legs ran). Running the panel on stage-2
shadow seeds would express the guard policies on
non-judged trips and prove nothing about this
run's question, so no panel is claimed and no
compare file is fabricated. The panel expresses
the guard policies, NOT the construct instrument.

## Sense-testing (transcripts, not just counts)

- The confirmed C trip reads as a person out in
  the world, not a mechanism. 69702-C (dest 0,7):
  day 5 the scholar walks west along row 6 to
  (0,6) — every hop past (3,6) E-failing in the
  shadow log, i.e. already on pocketed ground —
  and day 6 stays at (0,6) on 487 kcal, the
  attempt hop to (0,7) E-failing. Around it, the
  village is alive: "Hussein Al-Bishi reads the
  sky: clear tomorrow, cold." / "Hunger gnaws. The
  pack is thin — work the green, haul it back, get
  it named at camp. That's the whole game." /
  "Nobody walks alone today." / "A man, maybe 40s,
  with tattooed arms checks the pantry before
  heading out — the shelves are full, ~8 days of
  fresh on hand… leaves the harvest standing and
  turns to the stone pile instead." Nothing
  robotic appears in the trip; the strangeness is
  the same as at 1636Z — absence (no veto line,
  because shadow legs never veto), not
  incoherence.
- Honest limit: the forced walk-out leaves NO
  narrative trace — the say stream never says the
  scholar chose to walk west, it just finds them
  out at (0,6). That is instrument behavior (a
  policy prescribing destinations), not a game
  verdict: a real villager's trip would need a
  reason in dialogue, and construction cannot
  supply one.
- What the transcripts never contain in this run:
  a homeward veto line — because no armed legs
  ran. The guard's homeward voice remains unheard
  on a true C setup, which is exactly what the
  DIAG-NO-BAND verdict preserves as unjudged.

## Village assessment (plain words)

Forty villages screened, seventy-one forced trips
walked, and the map turns out to be full of
pockets — just not the kind shape A needs. Nearly
every seed has ground you cannot get home from,
and a third of the forced C trips walk straight
into a failing hop on day 6: the fence, if it
were armed, would have something real to fence.
But shape A's story — walk out clean in the
morning, find the door shut behind you by night —
never happens in a single day. Fourteen scholars
walk out clean, sleep at the far tile, and wake
with the way home still open through a side step;
the side step survives the day's foraging every
time. Two scholars find the door already shut
when they arrive, and the rest never get there
because a creek or a fallen tree cuts the road.
Nothing reaches national, the table, or a win —
that wall was never this run's question, and it
did not move. What is still missing is a trip
that walks out clean and strands — and this run
shows that trip will not be found by screening
harder on one day. It needs more days, or a
different closing mechanism, and that is the next
run's work, not this run's verdict.

## Metric review (for the NEXT run, never a re-score)

- The single-day A confirmation window is spent.
  A-LAT tiles are plentiful (431 at day-5 start
  across 40 seeds) and 14 clean-entry trips all
  kept their lateral escape to day-end. The next
  A construction should walk out on day 5 and
  check day-ends on days 5-8 (or longer): a pocket
  that closes through accumulated foraging, with
  the scholar camping at the destination, is the
  formation story the 67105 prototype implies.
  The confirmation must still require day-end
  position == destination (the 69716 lesson: a
  day-end failure elsewhere is not a setup at the
  destination) and the walk-out clause intact.
- Screen at more times, not just two: day-1 and
  day-5 start bracket the trip, but the lateral
  chain's life during day 5 is the variable that
  matters; probing mid-day-5 states (post
  walk-out, post forage) would show whether the
  lateral ever dies intraday on any seed.
- C filenames must carry the origin (the
  collision flaw above). More importantly, the
  next C prereg can be C-only: 8 confirmed
  destinations already exist (69702 0,7; 69704
  1,7; 69706 0,1; 69707 8,3; 69709 1,1; 69713 8,4;
  69714 0,3; 69717 0,3), and a judged band needs
  only armed legs + origin-E verification +
  episode counts on them. The conjunctive bar
  served this run (it forced the A result into
  the open); it should not block a C-only
  follow-up from judging what is already built.
- Route construction should avoid creek lines,
  not just take BFS-shortest: 22/40 A tries died
  on engine blockages. A blockage-aware route
  (BFS over hop-feasible steps, or screening the
  route's hops for E-pass at day-5 start) would
  raise the walk-out completion rate without
  changing any definition.
- The panel clause needs a DIAG-NO-BAND branch:
  when no judged band exists, the prereg should
  say "panel vacuous" up front instead of leaving
  an attempt defined on an empty seed set.

## Shape D design question (STEVE-CALL, not implemented)

Carried, not answered: should the guard offer an
escape (a lateral step, a wait-out, a call for
help) when it can only say no? No escape shape
was implemented in this run. New supporting note:
the 14 clean-entry A trips show scholars camping
out with an open lateral escape — the guard's
refusal, when it comes on a true C setup, strands
nobody by itself (the scholar is already camped
out); the starvation case for shape D remains the
shapes-b 69307 story, unchanged by this run.

## Findings backlog notes (for the coordinator to append to hidden_files/sim-findings.md)

- [open] 2026-11-02 — guard-shapes / A-timescale —
  destination-first A construction: 0/40 stage-2
  tries confirm a true A setup (clean entry +
  pocket by day-end); on all 14 clean-entry trips
  the day-end escape survives via lateral (legs=1,
  direct still failing). One day of foraging does
  not kill the lateral chain. Next construction
  should check day-ends over days 5-8 with
  day-end position == destination required (this
  run's evidence: sim-destfirst-b.md).
- [open] 2026-11-02 — guard-shapes / C-constructible —
  destination-first C construction: 8/31 stage-2
  tries confirm a pocketed destination from an
  off-haven day-6 start (shadow-only; origin-E and
  episodes unjudged). A C-only judged band can be
  pre-registered from these 8 trips without
  re-screening (this run's evidence).
- [open] 2026-11-02 — instrument / C-filename-origin —
  stage-2 C filenames omitted the origin, so 4
  same-seed/same-destination try pairs overwrote
  each other's files (ledger authoritative; the
  one confirmed file restored by deterministic
  re-run). Next run's filenames must include the
  origin (this run's evidence).

## Census (proof, not judged evidence)

scripts/test-destfirst-b.js: ALL PASS (21 checks
— screener classification, BFS shape, generalized
analyzer on non-homewardac destinations, stage-2
confirmation true/false, screening band outside
the banned set, reused files unmodified).
Predecessor proof tests re-run post-commit as
regression checks, all green: scripts/
test-homewardconstruct-b.js 15/15, scripts/
test-homeward-shapes-b.js ALL PASS, scripts/
test-homext-abl-b.js census agreement 100%,
scripts/test-homeveto-screen-b.js ALL PASS,
scripts/test-homeward-substrate-b.js ALL PASS.
No proof test was re-authored. Live smoke on
throwaway seed 69799 (never screened, never
judged): day-1 identity PASS, construct fields
present, walk-out stopped at (7,3) on an engine
blockage — instrument validation, never judged
evidence. Determinism re-proof: the restored
69707 C try reproduced its ledger CONFIRM line
exactly (day-6 start (7,3), hop E false,
confirmed=true).

## Corpora

- evidence/2026-11-02/sim-destfirst-b-prereg.md
- evidence/2026-11-02/sim-destfirst-b.md (this file)
- evidence/2026-11-02/sim-destfirst-b-screen.jsonl
  (40 screen lines, seeds 69701-69740)
- evidence/2026-11-02/
  sim-destfirst-b-stage2-<shape>-<seed>-<dest>.jsonl
  (68 files covering 71 tries; plus
  sim-destfirst-b-stage2-C-69707-8,3-origin-8,2.jsonl
  for the second 69707 try — see disclosure)
- scripts/destfirst-b-screen.js
- scripts/analyze-destfirst-b.js
- scripts/destfirst-b-confirm.js
- scripts/test-destfirst-b.js
