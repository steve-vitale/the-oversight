# sim-homewardac-b — Judged pilot of homeward shapes A and C via constructed trips

Run: oversight-flesh-out-loop-b, arm sim-homewardac-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1636Z, axis food-economy).
Worktree sim-homewardac-b, branch sim-homewardac-b.
Prereg: evidence/2026-11-02/sim-homewardac-b-prereg.md
(committed 951628f3c BEFORE any judged sim).
Instruments: committed 934467c64 (proof 15/15) before
the pilot bands ran. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands
the branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Verdicts (judged against the prereg header, never re-scored)

- Shape A: SUBSTRATE-FAIL (DIAG, NOT a guard verdict).
  0 candidate episodes, 2/8 integrity-ok trips (< 4
  threshold). The construction did not establish the
  shape often enough to judge the guard, and the loss
  is documented per-trip below instead of forced.
- Shape C: NO-GO (0 candidate episodes, 5/8
  integrity-ok trips, meeting the prereg's NO-GO
  threshold) — with the mechanism stated sharply:
  on all 5 integrity-ok trips the attempt hop PASSED
  E, so the guard correctly had nothing to veto. The
  NO-GO means the C shape did not occur on this band;
  fencing behaviour on a TRUE C setup (pocketed
  destination from escapable origin) remains
  unjudged, and is NOT claimed as judged here.
- Homeward vetoes: 0 on all 32 legs. Outward vetoes
  (secondary, not the judged shape): 5 total — 4 on
  the A band (69501, 69504: 2 each, 1 spoken + 1
  silent), 1 on the C band (69604 day 5, spoken).
  The guard's outward prevention fired; its homeward
  rescue/fence never had a qualifying trip.

## What was built (new files ONLY, zero game-code change)

- scripts/policies/competent-homewardconstruct-b.js —
  constructed-trip policy: on a pre-registered day it
  forces a prescribed walk-out (A) or walk-out +
  attempt hop (C) through the engine's OWN travelTo,
  then runs competent.daily normally. No teleports,
  no state edits. The guard is installed ONLY on
  construction days (prereg instrument, disclosed):
  veto decisions are memory-independent, so trip-day
  guard behaviour given the same state equals the
  always-on guard's, and pre-trip identity between
  legs is guaranteed by construction.
- scripts/homeconstruct-b-driver.js — homext-shaped
  driver (same day-record fields, so the shapes
  analyzer reads these legs unchanged) plus a
  day.construct report per construction day.
- scripts/analyze-homeconstruct-b.js — day-1 identity
  + construction-day-start identity + per-trip
  integrity + established setups, per the prereg.
- scripts/test-homewardconstruct-b.js — proof 15/15.
- UNCHANGED, verified by the proof test's git check:
  homext driver, shapes analyzer, guard policy
  (installGuard/escapeCheck imported verbatim),
  competent.js. Zero src/js changes, zero default
  flips, zero bundled fix.

## Construction (as pre-registered)

- A: loopDay 5, adjacent-step walk-out from haven
  (4,4): 5,4 -> 6,4 -> 7,4 -> 7,3 -> 7,2 -> 7,1.
  Band 69501-69508.
- C: loopDay 5 walk-out (4,4): 4,5 -> 4,6 -> 4,7 ->
  4,8 -> 3,8 -> 2,8; loopDay 6 forced attempt hop
  (2,8)->(4,8), attempted only if engine-offered.
  Band 69601-69608.
- Substrate: competent, 30d, DEPOSITGATE=0,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  packcomp *=1 flags not 1 (driver-enforced).
- Live smoke on throwaway seed 69599 (never judged,
  never screened) validated the instrument
  end-to-end first: day-1 identity PASS, walk-out
  completed both legs, (7,1) escapable that seed
  (day-end passing both legs, 0 vetoes) — a clean
  non-candidate trip, exactly as designed.

## Day-1 identity (STOP condition — PASSED, all 16 seeds)

Day-1 records (start/end pos/kcal/hydration, forage
additions, day-end return sim) IDENTICAL between
legs on every pilot seed, both bands: 16/16 PASS.
No substrate drift; every judged number below is
fresh-baseline vs armed on identical seeds. The
guard-days instrument delivers the identity the
1536Z lesson demands.

## A band ledger (69501-69508, construction day 5)

Integrity-ok = day-5 start haven on both legs AND
forced walk-out completes to (7,1) on both legs.
Established = integrity-ok AND shadow day-5 day-end
fails (the pocket actually formed).

| Seed | Integrity | Shadow day-5 end / endOk | Armed day-5 end / endOk | Armed vetoes day 5 |
|---|---|---|---|---|
| 69501 | FAIL armed-walkout-incomplete (armed stops (7,4)) | (7,1) / false | (7,5) / true | 2, both outward (7,4)->(7,3) |
| 69502 | FAIL shadow-walkout-incomplete (both stop (7,2)) | (7,2) / true | (7,2) / true | 0 |
| 69503 | FAIL shadow-walkout-incomplete (both stay (4,4)) | (4,4) / true | (4,4) / true | 0 |
| 69504 | FAIL armed-walkout-incomplete (armed stops (7,4)) | (7,1) / false | (7,4) / true | 2, both outward (7,4)->(7,3) |
| 69505 | OK, established=false | (7,1) / true | (7,1) / true | 0 |
| 69506 | OK, established=false | (7,1) / true | (7,1) / true | 0 |
| 69507 | FAIL shadow-walkout-incomplete (both stop (5,4)) | (5,4) / true | (5,4) / true | 0 |
| 69508 | FAIL shadow-walkout-incomplete (both stay (4,4)) | (4,4) / true | (4,4) / true | 0 |

A totals: integrity-ok 2/8, established 0/2 (both
integrity-ok trips escapable all day), A episodes 0.
Route-blockage names from the day-5 say stream:
69502 (7,2)->(7,1) creek (4 creek lines);
69503/69508 (4,4)->(5,4) creek; 69507 (5,4)->(6,4)
washed out. Creeks cut the east route on 3 of the
4 engine-blocked trips.

## C band ledger (69601-69608, construction days 5-6)

Integrity-ok = day-6 start != haven on both legs,
starts match, attempt hop offered + attempted on
both legs. Established = integrity-ok AND shadow
day-6 attempt hop simOk === false.

| Seed | Integrity | Day-6 start (both) | Attempt hop (shadow E / armed outcome) | Armed day-6 hv |
|---|---|---|---|---|
| 69601 | OK, established=false | (2,8) | (2,8)->(4,8) E pass, engine-accepted both legs, ends (4,8) passing | 0 |
| 69602 | OK, established=false | (2,8) | (2,8)->(4,8) E pass, engine-accepted both legs, ends (4,8) passing | 0 |
| 69603 | OK, established=false | (3,8) (walk-out stopped (3,8): (3,8)->(2,8) fallen tree) | (3,8)->(4,8) E pass, engine-accepted both legs, ends (4,8) passing | 0 |
| 69604 | FAIL start-at-haven (armed day-6 start (4,4): see divergence below) | shadow (2,8) / armed (4,4) | shadow attempted + moved; armed not offered | 0 |
| 69605 | OK, established=false | (3,8) (same fallen-tree stop as 69603) | (3,8)->(4,8) E pass, engine-accepted both legs, ends (4,8) passing | 0 |
| 69606 | FAIL attempt-not-offered (walk-out stopped (4,5): (4,5)->(4,6) creek) | (4,5) both | not offered either leg | 0 |
| 69607 | FAIL start-at-haven (walk-out refused at first hop: (4,4)->(4,5) creek) | (4,4) both | not offered either leg | 0 |
| 69608 | OK, established=false | (2,8) | (2,8)->(4,8) E pass, engine-accepted both legs, ends (4,8) passing | 0 |

C totals: integrity-ok 5/8, established 0/5, C
episodes 0, C-loose days 0.

## The 69604 divergence (guard effect through succession — reported, not chased)

Day-5 walk-out completes to (2,8) on both legs and
both legs end day 5 at (2,8) passing. The ONLY
day-5 difference: the armed leg vetoes one outward
hop, (2,8)->(1,8) (E-fail, spoken line), and reroutes
(2,8)->(2,6)->(2,8); the shadow leg walks
(2,8)->(1,8)->(0,8)->(2,8). By day-6 start the legs
have split completely: the shadow scholar wakes at
(2,8) on 234 kcal, hungry but alive; the armed
scholar is DEAD — day-6 death record "villager,
the wild, player=true" — and its successor starts
day 6 at haven on 1500 kcal. One vetoed hop
re-routed the day, the re-routed day re-rolled the
RNG cascade, and the armed scholar died in the wild
while the shadow scholar camped on. This is a real
guard trajectory effect (veto -> divergence ->
succession), and it is exactly why 69604 fails C
integrity: the legs no longer share a day-6 start.
It is not a C verdict input — the trip never got
to the attempt hop on both legs.

## Veto E table (pre-registered divergence report)

Every ARMED homeward veto in the pilot bands: NONE.
VETO-TOTALS on both bands: total=0, disagree=0,
hopExplains=0, agreeFail=0, agreePass=0. There is
no hop-time vs day-end E divergence to report
because no homeward veto fired anywhere.
Secondary (not the judged shape): 5 outward vetoes
total — A band 4 (69501/69504 day 5, each 2 vetoes
of (7,4)->(7,3), first spoken, second silent per
veto memory), C band 1 (69604 day 5, (2,8)->(1,8),
spoken). All 5 outward vetoes have hop-time E false.

## Why the shapes never occurred (the mechanism, per band)

Shape A needs a tile that is E-PASSING at walk-out
time and E-FAILING at day-end (the 67105
time-sensitivity: hop-time pass, day-end fail).
This band produced the two halves separately, never
together:
- E-failing at ENTRY (69501, 69504): shadow
  walk-out hops from (7,4) onward all carry
  simOk=false (TTTFFF pattern) — the pocket ground
  is E-failing before the scholar steps on it, so
  the guard vetoes the outward step (7,4)->(7,3)
  and the pocket never forms on the armed leg.
  This is outward prevention working as designed,
  not a homeward rescue, and these trips cannot
  meet the A definition (its walk-out clause
  requires all simOk=true).
- E-passing all day (69505, 69506): full walk-out,
  day-end passing both legs — no trap forms during
  the day (the escape from (7,1) here is direct,
  not stock-dependent lateral, so a day of foraging
  cannot kill it).
- Engine-blocked route (69502, 69503, 69507,
  69508): creeks and a washout cut the fixed east
  route before (7,1).
Shape C needs a destination tile that is E-FAILING
from an escapable origin. On all 5 integrity-ok
trips the destination (4,8) (or (4,8) from (3,8))
was E-PASSING and engine-accepted: the scholar
simply walks to (4,8) and ends passing. The fence
has nothing to fence. The fixed destination was
escapable on every seed where the trip established.

## Wall numbers (in-window only, never pooled across arms)

Driver substrate, all 32 legs: survived 30/30 days
on every leg (endReason survived, 16/16 seed-legs
per band per leg); median survival 30d; maxWave
never above 3 (A: shadow wave-3 on 6/8, armed 7/8;
C: wave-3 on 6/8 both legs); wave 4-5 unlocks 0 on
all 16 pilot seeds on both legs. Driver all-deaths
(telemetry-captured, villagers + monsters): A
shadow 176 vs armed 181; C shadow 164 vs armed
169 — small armed excesses from veto-cascade
trajectories (including the 69604 succession), not
a verdict item. Panel substrate (context only, A
band): survived 8/8 both policies; won / national /
table / vests 0 on both legs; waveReach 2-3, maxArc
3. No wall movement is shown or claimed: this run
judges shapes on constructed trips, it does not
move the scale wall.

## Balanced panel (§15, context never verdict)

Combined campaign on the A band (`node
scripts/balance-panel.js --out /tmp/homewardac-b-panel
--policies competent,competent-homewardstep-b --seeds
69501,...,69508 --days 30 --par 4` — 16 cases, 0
reused, sourcesStable true, neutrality matched on
both policies, 0 warnings). Raw panel archived as
evidence/2026-11-02/sim-homewardac-b-panel.json.gz.
Per-policy panel rows identical in the large (see
wall numbers above). No split-panel compare is
claimed: the panel expresses the guard policies, not
the construct instrument — stated deliberately, per
the prereg: that is why it is context, never
verdict.

## Sense-testing (transcripts, not just counts)

- The veto line reads as a person deciding wherever
  it speaks. 69501-armed day 5, in sequence: the
  scholar walks meadow -> forest floor -> forest
  floor, the guard says "You don't walk there —
  you couldn't get home from there.", then the
  scholar walks on to another forest floor tile and
  meets "A fallen tree blocks the path." The refusal
  is second-person, reason-giving, with no mechanism
  words or coordinates — one voice among village
  life (the same day's stream has Niamh hauling
  creek water and stone-piling), not a system
  announcement. Its second firing the same day is
  silent per veto memory: the village hears the
  fence go up once, then nothing. On 69501/69504
  that silence is fine (the scholar reroutes and
  comes home days 9-12); the shapes-b silent-
  repetition question (63 vetoes, 6 lines, then
  starvation silence on 69307) does not recur here
  because these vetoes are few and the scholars
  reroute.
- The stranded scholar is not frozen. 69501-shadow
  sits at (7,1) days 5-11 (kcal 989 -> 207 -> 0 for
  five days) and its days still contain travel,
  creek visits, stone-piling, water-hauling — the
  village's work goes on around the pocket — and
  day 12 it walks home (kcal 2085). The pocket
  OPENS after a week; the mechanism is unisolated
  (a clearing during days 6-11? a newly revealed
  route?) and is listed below as a finding, not
  claimed. A pocket that ends on its own matters
  to the reopen question: abandonment is not the
  only way a pocket story ends.
- The camped-out morning reads human. 69604-shadow
  day 6 dawn at (2,8), 234 kcal: "Your stomach is a
  fist. Eat — anything real, now." / "Dawn. You wake
  stiff and cold." / "Hunger gnaws. The pack is thin
  — work the green, haul it back, get it named at
  camp. That's the whole game." The trip has
  texture: hunger, cold, and the game's own thesis
  spoken back. Nothing robotic appears in any
  reroute, walk-out, or home-stay; the strangeness
  in this run is absence (the shapes' preconditions
  never arise), not incoherence.
- What the transcripts never contain in this run: a
  homeward veto line — because no homeward veto
  fired on any of the 32 legs. The guard's homeward
  voice is unheard here, which is itself the result:
  on constructed trips, the guard spoke only
  outward (5 lines, 3 spoken).

## Village assessment (plain words)

Sixteen villages, one month each, and the same
story told twice with small differences. Most
scholars walk the forced route a little way and are
stopped by the land itself: creeks run across the
east road and the north road, a washout takes one
more, a fallen tree takes two. Where the road IS
open, two things happen. On the east road, two
scholars walk all the way to the far tile and find
it open ground — they sleep out, come home fed,
nothing happens. On those same two seeds' twins,
the guard stops the scholar one tile short of the
pocket, because the ground past the fence is
already bad ground — the scholar grumbles past a
fallen tree, sleeps a few hungry nights at a
halfway tile, and comes home. The shadow twins of
those two walk into the pocket and sit there a
week with no food, then walk home on their own —
the pocket opens, nobody knows quite why. On the
north road, five scholars reach the far ground and
step homeward across it without any fence firing,
because the ground they step onto is good ground.
One scholar's whole story changes on a single
refused step west: the guard says no to a side
step, the day re-rolls, and by morning the scholar
is dead in the wild while its twin camps on hungry
— a successor wakes at home and the trip is over.
Nothing in any band reaches national, the table, or
a win — that wall was never this run's question,
and it did not move. What is still missing is a
trip that walks out clean, faces its trap on the
way home, and is actually rescued or fenced by the
homeward guard — the shapes as defined, on fresh
seeds, on this substrate. Sixteen constructed trips
did not produce one, because the trap was either
visible at the door (and fenced outward), absent
altogether, or behind a creek.

## Metric review (for the NEXT run, never a re-score)

- The fixed-route construction is spent as a
  screening instrument: engine blockages cut the
  forced walk-out on 7/16 trips (creeks on 5, a
  washout on 1, a fallen tree on 1), and the fixed
  destinations never satisfied either shape's full
  precondition (A: hop-time pass + day-end fail;
  C: destination E-fail from escapable origin).
  A fixed route cannot find a time-sensitive
  pocket; it can only test whether one pre-chosen
  tile happens to be one. The next
  run should construct DESTINATION-FIRST: screen
  seeds/tiles for the shape's precondition FIRST
  (A: direct escape fails but lateral escape passes
  at some time of day; C: destination E-fails from
  an escapable origin), THEN force the trip toward
  a tile that qualifies. Destination screening is
  instrument work, not a verdict change — the
  definitions stay as written.
- Integrity vs established must both be reported,
  as here: integrity says the trip was built;
  established says the shape's precondition held.
  C met integrity (5/8) but not established (0/5)
  — reporting only integrity would have overstated
  how much of C was tested. Future preregs should
  put the established count next to the GO
  threshold, not just integrity.
- The A definition's walk-out clause (all hop-time
  simOk=true) is load-bearing and must stay:
  69501/69504 prove that dropping it would count
  outward-fenced trips as A candidates. The clause
  distinguishes "sneaked in clean, trap closed
  during the day" from "walked into visibly bad
  ground."
- Adjacent-step geometry was NOT the attrition
  cause: every adjacent hop was offered, and the
  failures were blockages (creeks/washout/tree),
  not offer failures. A jump-based route would have
  faced the same blockages (the engine scans
  intermediates). Route choice should avoid creek
  lines, not change step size.
- The guard-days instrument worked: 16/16 day-1
  identity, zero pre-trip divergence except the
  guard's own day-5 veto effect (69604). Keep it
  for destination-first construction; the always-on
  guard's pre-trip divergence is a separate
  question from trip-day behaviour.

## Shape D design question (STEVE-CALL, not implemented)

Question: should the guard offer an escape (a
lateral step, a wait-out, a call for help) when it
can only say no?
Evidence FOR an escape: 69307 shape D (shapes-b)
— the armed scholar starved at (7,1) days 5-10
under vetoes, 6 spoken lines then silence; a guard
that can only refuse leaves a person to starve
behind its own fence. Evidence AGAINST / for
caution: this run's 69501/69504 — the guard's
outward refusal rerouted scholars who came home
hungry but alive days 9-12, and the pocket itself
opened day 12 on the shadow leg; a guard that
injects lateral steps would be deciding the
scholar's route, not refusing it, which is a
different kind of authority (and touches the
perception law: the guard would be choosing ground
the scholar has not chosen). Also 69604: a single
refusal already re-rolls a scholar's fate through
succession — an escape-offering guard would
re-roll fates more often, not less. No escape
shape was implemented in this run, per the brief.
The question stays open for Steve.

## Findings backlog notes (for the coordinator to append to hidden_files/sim-findings.md)

- [open] 2026-11-02 — guard-E-fidelity — creek-hop
  E/engine disagreement: on 69502 the forced
  adjacent hop (7,2)->(7,1) carries hop-time E
  PASS (simOk=true) yet the engine refuses it with
  a creek line. The guard's checkHop passes the
  hop origin to travelBlockage; the engine's d=1
  check does not take an origin. Creek blockage
  evidently depends on entry origin. One hop, one
  seed; not a verdict input (both legs blocked
  identically), but the E model and the engine
  disagree on creek hops (this run's evidence).
- [open] 2026-11-02 — pocket-persistence — 69501
  shadow pocket opens day 12: the scholar strands
  at (7,1) days 5-11 (kcal to 0) with day-end sims
  failing, then walks home day 12 (kcal 2085).
  Mechanism unisolated (a clearing during days
  6-11? a newly revealed route?). Pockets are not
  necessarily permanent (this run's evidence).
- [open] 2026-11-02 — guard-succession-cascade —
  69604: a single outward veto (2,8)->(1,8) on day
  5 re-routes the armed scholar's day; by day 6
  the armed scholar is dead in the wild
  (player=true) while the shadow scholar camps on
  at (2,8); the successor starts at haven and the
  C trip fails integrity. Guard effects propagate
  through succession (this run's evidence).
- [open] 2026-11-02 — construction-method —
  destination-first construction proposed: screen
  seeds/tiles for the shape precondition (A:
  direct-fails + lateral-passes at some time of
  day; C: destination E-fails from escapable
  origin) BEFORE forcing the trip, instead of
  fixed routes whose destinations are pocketed on
  0/16 trips here (this run's metric review).

## Census (proof, not judged evidence)

scripts/test-homewardconstruct-b.js: ALL PASS (15
checks — route/hop parsing, constructed A + C
episodes via the real analyzer, construct-analyzer
integrity ok + vetoed-walkout failure, banned-band
check, reused-files-unmodified, driver FATAL).
Predecessor proof tests re-run post-pilot as
regression checks: scripts/test-homeward-shapes-b.js
ALL PASS, scripts/test-homext-abl-b.js census
agreement 100% (no-credit core vs real walkTo/
travelTo), scripts/test-homeveto-screen-b.js PASS
21 checks, scripts/test-homeward-substrate-b.js ALL
PASS. No proof test was re-authored.

## Corpora

- evidence/2026-11-02/sim-homewardac-b-prereg.md
- evidence/2026-11-02/sim-homewardac-b.md (this file)
- evidence/2026-11-02/sim-homewardac-b-pilotA-{shadow,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homewardac-b-pilotA-integrity.txt
- evidence/2026-11-02/sim-homewardac-b-pilotA-episodes.txt
- evidence/2026-11-02/sim-homewardac-b-pilotC-{shadow,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homewardac-b-pilotC-integrity.txt
- evidence/2026-11-02/sim-homewardac-b-pilotC-episodes.txt
- evidence/2026-11-02/sim-homewardac-b-panel.json.gz
  (A-band panel context, 16 cases)
- scripts/policies/competent-homewardconstruct-b.js
- scripts/homeconstruct-b-driver.js
- scripts/analyze-homeconstruct-b.js
- scripts/test-homewardconstruct-b.js
