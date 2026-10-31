# sim-absencehunt-b — DIAG: genuine overnight absence EXISTS on current master (GO — band reported, strand designs stay parked pending their own prereg)

Run: oversight-flesh-out-loop-b, arm sim-absencehunt-b, axis food-economy.
Worktree sim-absencehunt-b, branch sim-absencehunt-b. Base commit
a3e57bfc17a95d90773634d24f7d39b8c34123c3 (worktree HEAD at prereg
writing time). DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy file or
existing script. New files only. This worker does NOT push, bump, or
verify live; the coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: ABSENCE FOUND — the strand road is NOT dead, it was narrow

The binding prereg (evidence/2026-10-31/sim-absencehunt-b-prereg.md,
commit ee32cfc42, written BEFORE any judged leg) ordered exactly
this: a wide search for a genuine overnight absence (a vessel ending
the day away from Haven, haven-checked, confirmed by the following
morning) on current master, across 4 policies, 2 fresh seed bands,
and 30d + 60d horizons — 96 legs total, run exactly as declared.
The GO bar was >= 3 seeds with >= 1 genuine haven-board overnight
absence AND a named band/policy the next strand arm can use. The
search clears that bar on EVERY policy family, and floods it on one:

- P3 deed-seeking: 15 of 16 distinct 30d seeds with >= 1 genuine
  absence (F1 8/8, F2 7/8; the single exception, 17515 F2, is
  explained below). 78 genuine departure-days across the two 30d
  bands; 80 in the F1 60d legs (which include the 30d prefix).
- P1 nighttravel stack (the original strand stack): 3 of 16
  distinct 30d seeds (17507, 17511, 17513) — the GO bar met on the
  stack itself, not only on the patrol policy.
- P2 competent: 3 of 16 distinct 30d seeds (17507, 17513, 17518).
- P4 nomadseek: 2 of 16 distinct 30d seeds by genuine transition
  (17501, 17514), PLUS 25 unexplained away mornings (see below)
  that make the genuine count a conservative lower bound on that
  policy.

This overturns the shape of the last two rounds' picture without
contradicting their measurements: departdiag's band (8 seeds,
nighttravel stack, 30d) genuinely had 0 departures, and
strandbank's wider sweep (18 seeds) genuinely had 0 creek
evenings. But 0 departures on 8 seeds was never 0 on all bands,
and 0 creek evenings is not 0 overnight absences — the absences
found here on the nighttravel stack are forest_floor
out-of-reach nights, not creek nights (raw creek evenings: 0 on
all 12 P1 cells... on all 12 censuses in fact). Departdiag's
metric-review doubt is answered directly: walkHome +
nighttravel-hop do NOT succeed on every band. On 17507 the
nighttravel hop fails 9 nights running (out-of-reach), and the
vessel sleeps in the forest. The return-failure substrate
departdiag said strand work needed first EXISTS on current
master — it just lives on fresh seeds, not on the old band.

What this arm does NOT do (per the brief): it revives no parked
strand design. Fedevening branch-fire and axefirst joint proof
stay PARKED until a strand arm with its own new prereg judges on
a band reported here. This arm only reports the band. And absence
is not creek-strand: no leg in this search produces a woodcarry
creek evening (raw creek 0 everywhere), so a strand arm that
wants creek nights must define its creek-evening criterion on
its own stack in its own prereg — the deed-seeking creek-tile
nights below are the shape of that substrate, not the
woodcarry-bucket measurement.

## Pinned base + substrate

Base commit a3e57bfc1 for every leg. Substrate asserted FATAL in
the driver: COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/
FEDEVENING unset/0. P1 additionally WOODCARRY=1, WOODWARM=1;
P2/P3/P4 WOODCARRY/WOODWARM unset/0 (no woodcarry bucket on
those legs — stated, not hidden). Diff guard at evidence time:
`git diff --name-only a3e57bfc1 -- src/ scripts/policies/` is
EMPTY — no game code, no policy file moved under measurement.

## BASECHECK (instrument verification, never judged)

Verbatim scripts/morningcarry-trace-b.js, seed 15215, guard + ON,
DAYS=30, strandbank substrate env. Result, both legs: 30
evenings, 30 days survived, errs 0, raw creek [] / still [] /
rescued [] (haven-checked also []), vessel at haven all 30
evenings, spawn vessel gen_gyft62f. The verbatim instrument
reproduces the current-base [] / [] reading, so the prereg's
STOP condition did not trigger and judged legs proceeded.
These corpora (sim-absencehunt-b-basecheck-{guard,on}) are
never mixed into judged corpora.

## Instrument notes (disclosed, verdict-neutral)

1. Analyzer metadata rename (after P1 pilot, before Stage B):
   classifySeed's horizon field collided with its per-day array
   under the key `days` (the console print showed [object
   Object]); renamed to `horizonDays`. Counts are untouched —
   the P1 pilot census regenerated with the fixed analyzer is
   identical (genuine 1, dayTrips 204, multiHop 0, rawCreek 0).
2. Diagnostic added (before Stage B, no definition change):
   `unexplainedAwayMornings` — mornings away whose previous
   evening was at haven (the vessel moved out in the
   sleep/upkeep window between the evening snap and the next
   daily-start snap). Pilot censuses were regenerated with it;
   judged definitions (genuine / day-trip / multi-hop / road)
   are unchanged.
3. The morning snap is taken at the START of daily(), after
   that day's 3 upkeep parts (the harness's day shape, same as
   departdiag). An episode that starts in the sleep/upkeep
   window therefore shows up as away-continuation days with no
   preceding genuine day — which is why the genuine count is a
   conservative lower bound on nights away, and why the
   unexplained-morning diagnostic exists (P4: 25 across the
   grid; P1/P2/P3: 0).

## THE CENSUS (judged) — 96 legs, 4 policies x 2 bands x 30/60d

Policies: P1 nighttravel-stack (withWoodwarm(withWoodcarry(
nighttravel)), ON); P2 competent (plain); P3 deed-seeking
(competent.daily + far patrol, no walk home after); P4 nomadseek
(capable base + road drive). Bands: F1 17501-17508, F2
17511-17518 (fresh 175xx range, disjoint from all prior strand
bands). Stage A pilot (F1 30d, all policies) passed its
instrument gate (every leg errs 0, decisions == evenings,
loop-days complete or a game-over with its day recorded), so
Stage B ran as declared: F2 30d + F1 60d, all policies.
Horizons death-aware (harness stops at Game.over).

Per-cell totals (genuine = genuine departure-days; seeds =
seeds with >= 1 genuine; DT = day trips; MH = multi-hop;
road = road absences; SR = sleep-returns; unex = unexplained
away mornings; AO = away-origin days; rawCr = raw creek
evenings):

| cell | legs | genuine | seeds | DT | MH | road | SR | unex | AO | rawCr |
|------|------|---------|-------|----|----|------|----|------|----|-------|
| P1 F1 30d | 8 | 1 | [17507] | 204 | 0 | 0 | 0 | 0 | 8 | 0 |
| P1 F2 30d | 8 | 2 | [17511,17513] | 198 | 0 | 0 | 0 | 0 | 10 | 0 |
| P1 F1 60d | 8 | 1 | [17507] | 380 | 0 | 0 | 0 | 0 | 8 | 0 |
| P2 F1 30d | 8 | 1 | [17507] | 203 | 0 | 0 | 0 | 0 | 5 | 0 |
| P2 F2 30d | 8 | 2 | [17513,17518] | 215 | 0 | 0 | 0 | 0 | 5 | 0 |
| P2 F1 60d | 8 | 2 | [17507] | 388 | 0 | 0 | 0 | 0 | 9 | 0 |
| P3 F1 30d | 8 | 41 | all 8 F1 | 39 | 0 | 0 | 5 | 0 | 139 | 0 |
| P3 F2 30d | 8 | 37 | all but 17515 | 61 | 0 | 0 | 1 | 0 | 120 | 0 |
| P3 F1 60d | 8 | 80 | all 8 F1 | 62 | 0 | 0 | 9 | 0 | 310 | 0 |
| P4 F1 30d | 8 | 1 | [17501] | 178 | 0 | 0 | 0 | 8 | 34 | 0 |
| P4 F2 30d | 8 | 1 | [17514] | 177 | 0 | 0 | 0 | 6 | 28 | 0 |
| P4 F1 60d | 8 | 2 | [17501,17507] | 295 | 0 | 0 | 0 | 11 | 101 | 0 |
| TOTAL | 96 | 171 | — | 2400 | 0 | 0 | 15 | 25 | — | 0 |

Grid totals: 171 genuine departure-days, 2400 day trips,
0 multi-hop excursions, 0 road absences, 15 sleep-returns,
25 unexplained away mornings, 0 raw creek evenings, errs 0
on all 96 legs. Distinct 30d seeds with >= 1 genuine: P1 3/16,
P2 3/16, P3 15/16, P4 2/16 (P4's true away-seed count is higher
— see unexplained mornings).

Game-overs (death-aware horizons working as designed): 5 of
96 legs ended village-lost instead of surviving the window —
P4 F1-30d 17501 (day 25; same trajectory ends the 60d leg at
day 25), P3 F2-30d 17518 (day 25), P4 F2-30d 17518 (day 21,
20 loop-days), P3 F1-60d 17506 (day 57). All other legs
survived their windows. Median survival is window-censored
(most legs survive the full window) and is NOT reported as a
wall number.

Determinism check (not in the prereg, reported as instrument
evidence): the F1 60d legs' first-30-day evening records
(tile / inside / outcome) were compared against the F1 30d
legs' evenings — 955 evenings compared, 0 mismatches. The 60d
horizon extends the same trajectory; it does not re-roll it.

## The absences, episode by episode (what the next arm inherits)

### P1/P2 — the return-failure episode (seed 17507, both stacks)

The same seed goes absent on both the nighttravel stack and
plain competent, with the same shape and a one-day offset
(policy trajectories diverge slightly):

- P1 17507 (vessel gen_mollqg4): genuine day 14, away
  evenings days 14-22 (9 nights), returns morning day 23,
  survives. Every away evening outcome out-of-reach, tile
  forest_floor, map (1,3): the nighttravel hop home was not
  offered, night after night. Day 14 itself is a long
  wandering day (creek, wetland, forest, washed-out paths
  twice, other villages' smoke — Thornfield, Emberhold —
  companion Bill chattering, counters learned) that simply
  walked too far to get home. No new episode in days 31-60
  (60d genuine still 1).
- P2 17507: genuine day 15, away evenings days 15-20
  (6 nights), returns morning day 21; a SECOND genuine day
  appears in days 31-60 (60d genuine 2, same seed only).
- P1 F2: 17511 genuine day 8 (5 away-origin days),
  17513 genuine day 5 (5 away-origin days). P2 F2: 17513
  genuine day 5 (2 away-origin days — same seed, shorter
  episode on the plain policy), 17518 genuine day 8.

Named band for a strand arm on the ORIGINAL stack: P1,
bands F1+F2, seeds 17507, 17511, 17513 (3 seeds, each with a
documented out-of-reach episode). This is the narrowest,
most conservative next step: same stack strandbank and
departdiag used, no policy change, just fresh seeds.

### P3 — the patrol flood (the band to use)

Deed-seeking's patrol (day%7 in 1,3,5; up to 4 farthest-first
tiles; no walk home after) ends the day away on nearly every
patrol day, and the vessel then stays out for days: F1 30d
41 genuine days on 8/8 seeds, F2 30d 37 on 7/8, F1 60d 80
on 8/8. Nearly every genuine day carries patrolDelta 1 —
the patrol IS the departure mechanism, not a coincidence
alongside it. Away stays run 2-6 nights typically, with
longer creek camps (below). Day trips collapse on this
policy (39-62 per cell vs ~200 on P1/P2) because patrol
days that would have been day trips become absences instead.

Creek-tile nights (the strand-shaped substrate): across the
two 30d bands (16 legs), P3 logs 100 creek-tile away
evenings (tile 'creek', vessel outside). Examples:

- 17505 F1: genuine day 5 at creek, then creek mornings
  days 6-9 (creek camp), genuine again days 10, 17, 24 —
  the vessel lives at the creek for most of the month
  (days 5-30 nearly all creek/forest away evenings).
- 17504 F1: creek evenings days 11-16, then 19-28 (a
  second long creek camp after a trail_edge genuine day 17).
- 17506 F1: creek evenings days 5-6, 8, 15-18, 24-25, 29-30.
- 17501 F1: wetland camps (days 3-5, 8-10, 15-18, 22-27)
  rather than creek — the patrol's far tile varies by map.

Caveat, stated plainly: these are creek-TILE evenings, not
woodcarry-bucket creek evenings — P3 runs no woodcarry
wrapper, so no bucket classification exists for them. A
strand arm that wants the woodcarry creek criterion must
run deed-seeking WITH the woodcarry stack in its own prereg
and re-derive the bucket reading there; it cannot cite this
arm's tile counts as bucket counts.

The single P3 exception: 17515 F2 patrols 10 times and ends
all 30 days at haven (28 day trips, 2 stays, 0 away
evenings). Its patrol days' lines show the mechanism:
repeated "The creek runs fast here — no crossing without a
bridge or a swim" + "Nothing left to take here today" —
the patrol's farthest-first candidates were creek tiles
blocked by the unbridged crossing, so the patrol never
actually moved the vessel (the patrol counter counts
attempts — visited++ follows the travelTo call whether or
not it moved the vessel — so 10 patrols with 0 away
evenings is consistent, not contradictory). Hypothesis,
not a traced code claim: on maps where the far tiles sit
behind the unbridged creek, the patrol is a day-trip
policy; where they don't, it is an absence policy. A
strand arm using P3 should avoid 17515-class maps or
expect day trips there.

Named band for a strand arm on the patrol policy: P3,
band F1, seeds 17501-17508 (8/8 with absences in 30d;
17505 and 17504 first for creek camps), plus F2 seeds
17511-17514, 17516-17518 (17515 excluded — the blocked-
creek exception). The next arm needs its own prereg; this
arm only reports the band.

### P4 — genuine transitions plus the sleep/upkeep window

P4's genuine transitions are sparse (17501 F1 days 17-20,
17514 F2 day 28, 17507 60d), but its away-origin days are
large (34/28/101 per cell) because of the unexplained
mornings: 25 mornings across the grid where the previous
evening was at haven and the morning snap is away. Worked
example, 17502 F1: day 22 evening haven tile (4,4);
day 23 morning ruin tile (4,3) — the vessel moved out in
the sleep/upkeep window, then spends days 23-27 at the
ruin (looting a body, Emma becoming Scout) before
returning morning day 28. No narrated leg covers the
haven->ruin move itself. The genuine count therefore
UNDERCOUNTS P4's nights away: episodes that start in the
window have no genuine day, only continuations. A future
arm that needs P4's episodes should instrument the
sleep/upkeep window (as morningcarry instrumented sleep)
rather than citing P4's genuine count as its away total.

Road absences: 0 on all 96 legs, all policies including
P4. The nomad gate (Game.nomad.canLeave()) never fired in
30/60d on these seeds, so no road day exists in any corpus
to count. Road absence is unobserved on this grid, not
disproven generally.

Multi-hop excursions: 0 on all 96 legs under the prereg's
definition (>= 4 travel-leg lines, zero forage/patrol
delta, ends at haven). Departdiag's 15221 days 27-28
residue pattern does not reproduce on any leg here:
competent days with >= 4 travel lines also carry forage
deltas (they classify as day trips), and patrol days carry
patrol deltas. Either the pattern is seed-specific to
15221's band, or the travel-line definition is too narrow
to catch it — the class is reported as 0, not explained
away, and the residue stays open for an arm that records
stoneRun/fogSteps counters per day (departdiag's own
carried item).

## SENSE TEST (law) — PASS on what exists, with gaps stated

Read end to end: P1 17507 days 14-15 (departure + first away
day) and day 23 (return); P3 17505 days 5-6, 9-10 (patrol
departure, creek camp, re-departure); P4 17502 days 22-23
(unexplained away morning). Judgement:

- The away days read as people living days, not counters
  incrementing. P1's departure day is a genuine ramble:
  creek cold enough to hurt teeth, a fairy ring stepped
  around ("Some rules are older than knowledge"), smoke
  from Thornfield and Emberhold with plant counts the
  vessel doesn't know, Bill's repeated "Huh. Never been
  this way before" / "Stay close, yeah?", counters learned
  from survived encounters (Hushpuppy, Nevermore,
  Drum-Belly, Highbeam Deer). The away mornings continue
  the same texture: drinking upstream of whatever drank
  there, a mink, an opossum playing dead badly, unknown
  berries into the bag. Nothing claims a return that didn't
  happen; the out-of-reach outcome matches the wandering.
- P3's creek camp reads as camping, not teleporting: day 5
  walks home mid-day ("You walk back into Haven. 4 Codex
  entries. The village is glad to see you.") and THEN
  patrols back out to the creek — the two movements are
  both narrated, in order, so the evening at creek is
  earned by the transcript, not just the position. Day 6
  from the creek is a working day: drink upstream, forage,
  gossip, creatures. The village's "while you were gone"
  beat on day 10 (Ryan killed the Murkcap alone) shows
  the village living while the vessel is out — exactly the
  consequence an absence should have.
- Gaps stated, not hidden: (a) NO line narrates the night
  out itself — the vessel's position says "slept away",
  but no say line says "you sleep under the trees" or
  equivalent; the absence is real in positions and
  un-narrated as an event. (b) "Fragments by the fire"
  gossip lines fire while camped at the creek — ambient
  narration that reads slightly off out there (whose
  fire?), a texture note, not a contradiction. (c) P4's
  sleep/upkeep-window moves (haven->ruin overnight) have
  no narrated leg at all. None of these overturns the
  census — the positions, outcomes, and day transcripts
  agree — but the night-out narration is untested
  alongside the mechanism, as departdiag also noted.

## Reachability verdict

Overnight-absence content IS reached on this grid: 171
genuine departure-days, 15/16 P3 seeds, 3/16 P1 seeds, 3/16
P2 seeds. Creek-tile nights (100 in the 30d P3 bands) are
reached on the patrol policy; woodcarry-bucket creek
evenings are NOT reached on any leg (raw creek 0
everywhere, including all P1 cells) — the old strand
criterion and the new absence criterion are different
claims, and only the absence criterion is met here. No
wave-4/5 reach, no regional/national/table content is in
scope of this census, and none is claimed either way.

## Village assessment, in plain words

Picture what the last two rounds saw: a village that always
comes home for supper. That village still exists — on the
nighttravel stack, thirteen of sixteen fresh villages never
sleep out in thirty days, and they look exactly like
departdiag described: out every morning on a day trip,
home every night, pantry beans and gossip and fish
assignments. But it was never the whole picture. On three
of those sixteen villages, the walk home fails: one
scholar walks too far through washed-out paths, past two
other villages' smoke, learning counters as she goes, and
simply cannot get back — she sleeps in the forest nine
nights, foraging her way through, and walks home on the
tenth morning as if nothing happened. And on a different
kind of village entirely — one whose scholar patrols far
ground looking for deeds — sleeping out is not the
exception but the routine: she patrols out, sleeps at the
creek or the wetland, works that ground for days, comes
home, patrols out again. One village in sixteen even
refuses the pattern in the other direction: its patrols
keep running into an unbridged creek it cannot cross, so
its scholar tries ten times and sleeps home every night.
The strand story the old arms hunted — a night away that
something can catch on — was never gone. It was waiting
on fresh ground, and on a scholar who walks far enough
that the road home stops working, or who patrols far
enough that home stops being the plan.

## Wall numbers

NOT OBSERVABLE on a 30/60-day pre-seat census — reported,
never fabricated. Observed counts on all judged legs: 91
of 96 legs survived their window; 5 ended village-lost
(listed above). National 0, table 0, wins 0 (structurally
unreachable in this band, not a wall measurement); median
survival is window-censored (most legs survive the full
window). Wave reach is not reported as a wall number here
because this census measures absence, not wave progression;
maxWaveUnlocked per leg is in the corpora, not summarized
as reach.

## Blanks filled or documented

- Filled (this arm, measured): A GENUINE OVERNIGHT ABSENCE
  EXISTS ON CURRENT MASTER. 171 genuine departure-days on
  96 legs; GO bar cleared on all four policies by seed
  count on P3 (15/16) and met exactly on P1 (3/16) and P2
  (3/16). The next strand arm's precondition ("an overnight
  absence must be producible") is SATISFIED — with named
  bands: P3 F1 17501-17508 (creek camps: 17505, 17504
  first) or P1 F1+F2 17507/17511/17513 (original stack,
  out-of-reach episodes). The next arm still needs its own
  prereg; this arm judges no strand fix.
- Filled (this arm, measured): DEPARTDIAG'S DOUBT ANSWERED.
  walkHome + nighttravel-hop do NOT succeed on every band:
  P1 17507 fails the hop 9 nights running (out-of-reach).
  The return-failure substrate exists on the original
  stack; it was the old 8-seed band that was narrow, not
  the mechanism that was absent.
- Filled (this arm, measured): THE PATROL IS A DEPARTURE
  MECHANISM. Deed-seeking's patrol ends the day away on
  nearly every patrol day (patrolDelta 1 on ~all genuine
  days); the vessel's away stays are multi-night by
  default. Any future absence lever that assumes competent
  routine shape must account for post-daily legs that
  don't walk home.
- Documented (this arm, mechanism hypothesis): the 17515
  F2 exception — patrol blocked at the unbridged creek
  crossing ("no crossing without a bridge or a swim"),
  patrol counter counting attempts not arrivals. A P3
  strand arm should expect day trips, not absences, on
  blocked-creek maps.
- Documented (this arm, residue): P4's sleep/upkeep-window
  moves (25 unexplained away mornings) — the genuine count
  undercounts P4's nights away; the window needs its own
  instrument (sleep bracket, as morningcarry did) before
  P4's away total is citable.
- Documented (this arm, residue carried): departdiag's
  15221 multi-hop leg stays unidentified — the multi-hop
  class is 0 on all 96 legs here, so neither stoneRun nor
  any other leg is confirmed or excluded by this search.
- Documented (this arm, texture): no say line narrates the
  night out itself; fire-gossip lines fire while camped
  away; P4's window moves are unnarrated. Narration of an
  overnight absence is still untested as an event.
- NOT re-derived (this arm, stated): woodcarry-bucket creek
  evenings remain 0 everywhere. A strand arm wanting the
  bucket criterion must re-derive it on its own stack.
- Carried, NOT re-judged: fedevening branch-fire and
  axefirst joint proof stay PARKED pending a strand arm
  with its own new prereg on a band reported here.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg definition (genuine = haven-checked evening away +
  following morning away or run ended): HELD, and it
  proved its worth — the sleep-return class (15, all P3)
  shows the confirmation step catches real cases where the
  night ends back at haven, and the haven-checked primary
  never diverged from raw on P1 (raw creek 0, checked
  creek 0 — no 16506-class artifact on this grid, though
  the dual reporting stands for future runs).
- Prereg GO bar (>= 3 seeds + named band/policy): MET on
  P1, P2, and P3 by seed count; the bar did not need
  loosening, and no metric was re-scored mid-run. The
  grid ran exactly as declared (96 legs; Stage B
  unconditional on results, conditional only on the
  Stage A instrument gate, which passed).
- New doubt for the NEXT run: whether the morning snap
  should move earlier (before upkeep) so sleep-window
  moves become genuine transitions instead of
  continuations — the P4 diagnostic sizes that gap at 25
  mornings, and a pre-upkeep snap would change the
  genuine count on P4-class policies. The definition
  should be argued in the next prereg, not changed here.
- New doubt for the NEXT run: whether "genuine" should
  require the absence to survive the sleep step itself
  (a sleep-bracket instrument, as morningcarry did) —
  the current evening+morning confirmation already
  approximates this, but a bracket would separate
  sleep-returns from upkeep-returns, which the present
  instrument cannot distinguish.
- Prereg Q (road absence counts toward a strand band): NO
  under this prereg, and moot on this grid — road
  absences are 0 everywhere because the nomad gate never
  fired. The question stays open for a band where the
  road actually runs.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm stack, the
deed-seeking far patrol, the nomad road, a 30/60-day per-day
absence census, or a census with no variant — the same
declaration every prior strand arm made. The comparison here
is a census across policies on identical seeds through the
census analyzer, never labeled a panel comparison. No panel
result is fabricated; the panel tool was not invoked on this
corpus. No lever comparison arose (DIAG only).

## Telemetry deviation check (step 10 — investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-absencehunt-b-census-p1-f1-30d.json --metrics
national,table,wins,exiled` prints LOUD "national/table/wins
disappeared: baseline 12/16/16 -> current 0 (n=1 files)".
Investigated as a missing-field artifact, same class as the
1630Z round: the census carries no national/table/wins/exiled
fields at all (keys: corpusDir, policy, horizonDays, legs,
seeds, totals, perSeed) — the check ingests a census file
where the baseline expects per-seed sweep rows on a
reachability stack, so 0 means "field absent", not "wall
moved". No genuine LOUD signal. Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH pre-leg commits (prereg
   file, then all 4 instrument files: committed files showing
   staged-as-deleted while byte-identical in the worktree).
   Repaired each time via `git update-index --add
   --cacheinfo` from HEAD blobs; `git status --short` empty
   + `git diff HEAD` empty verified after each repair. The
   commits themselves were never in doubt (blob hashes
   match). The coordinator should verify the same way after
   the final commit below.
2. No EPERM flap observed in this window: the verbatim
   file-mode basecheck wrote first-try, all stdout
   transports split first-try, all splitter writes landed
   first-try. The stdout transport rule was followed anyway
   (judged legs never wrote from a game-loaded process).
3. Judged corpora were never staged in /tmp (jsonl lived in
   evidence/ until split, then deleted, per the rule — no
   .jsonl leftovers at evidence time).
4. Analyzer fixes after the instruments commit (horizonDays
   rename; unexplainedAwayMornings diagnostic) are committed
   WITH this evidence, not rewritten into the instruments
   commit; counts from the pre-fix census were verified
   identical after regeneration.

## Finisher verification (orphaned-arm closeout, 2026-10-31)

The prior worker's draft above was completed, not re-run: all
96 judged legs were already present when this finisher took
over, and no judged leg was re-run or re-scored. What the
finisher independently verified before committing:

- All 12 census JSONs re-read: every cell total in the table
  above matches its census file exactly (genuine, day trips,
  multi-hop, road, sleep-returns, unexplained mornings,
  away-origin days, raw creek; errs 0 on all 96 legs, 8 legs
  per cell). Grid totals re-summed: 171 genuine, 2400 day
  trips, 0 multi-hop, 0 road, 15 sleep-returns, 25
  unexplained mornings, 0 raw creek. Judged legs: COMPLETE
  (96/96), not partial.
- Analyzer diff (horizonDays rename + unexplainedAwayMornings
  diagnostic) is real instrument work, not scratch: the
  committed censuses already carry both fields, and
  re-running the fixed analyzer on the P1-F1-30d and
  P3-F1-30d corpora reproduces their census files
  byte-identically. Committed with this evidence.
- Basecheck re-read: both 15215 legs show 30 evenings, all
  haven tiles, errs 0, spawn vessel gen_gyft62f, 0 classified
  woodcarry records — consistent with the [] / [] reading
  in the draft.
- Sense spot-read by the finisher (not a replacement for the
  prior worker's end-to-end sense test above): P1 17507
  evenings confirm forest_floor days 14-22 and haven day 23;
  day-15 dawn reads "You wake stiff and cold... Exposed",
  which matches a night slept out, and day-23 dawn shows
  the Haven-well return. No contradiction found; the
  draft's "no line narrates the night out itself" note
  stands as a narration gap, not a position contradiction.
- Verdict judged ONLY against the prereg GO bar (>= 3 seeds
  with >= 1 genuine haven-board absence + named band):
  met on P1 (3/16), P2 (3/16), and P3 (15/16). No metric
  was re-scored. P4's 2/16 genuine seeds do not meet the
  bar alone and are not counted toward it.

## Proof

scripts/test-absencehunt-b.js: pure 24/24; corpus checks 41/41
per corpus x 12 corpora (decisions == evenings, errs 0,
loop-days contiguous, mornings + eveningOutcomes present),
all re-run by the finisher.
60d-prefix determinism: 955 evenings compared, 0 mismatches.
Diff guard: `git diff --name-only a3e57bfc1 -- src/
scripts/policies/` EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-absencehunt-b-prereg.md
  (commit ee32cfc42)
- Evidence (this file): evidence/2026-10-31/sim-absencehunt-b.md
- Instruments: scripts/absencehunt-trace-b.js,
  scripts/split-absencehunt-jsonl-b.js,
  scripts/analyze-absencehunt-b.js,
  scripts/test-absencehunt-b.js (instruments commit a17f0a77;
  analyzer fixes committed with this evidence)
- Basecheck (verbatim prior instrument, 15215, never judged):
  evidence/2026-10-31/sim-absencehunt-b-basecheck-{guard,on}
  (1 file each + stderr logs)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-absencehunt-b-corpus-{p1,p2,p3,p4}-{f1,f2}-30d,
  sim-absencehunt-b-corpus-{p1,p2,p3,p4}-f1-60d
- Censuses (analyzer output, one per corpus):
  evidence/2026-10-31/sim-absencehunt-b-census-{p1,p2,p3,p4}-{f1,f2}-30d.json,
  sim-absencehunt-b-census-{p1,p2,p3,p4}-f1-60d.json
- No compare .md exists (no paired lever comparison — this is
  a DIAG census, never labeled a panel comparison).
