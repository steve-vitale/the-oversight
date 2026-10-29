# sim-blockscreen2-b — direct refused-evening census: BANKED (12 seeds, 81 refused evenings, 0 uncovered)

Run: oversight-flesh-out-loop-b, arm sim-blockscreen2-b, axis
food-economy. Worktree sim-blockscreen2-b. POLICY-SIDE DIAG
ONLY: scripts/policies/blocktype-diag.js recorder (default
OFF, UNCHANGED from the 1130Z and 1330Z arms) + trace/
analyzer/proof instruments. Zero src/js changes, zero
default flips, no driver adopts the recorder. This worker
does NOT merge to master — coordinator merges. Prereg
(committed BEFORE any judged leg):
evidence/2026-10-29/sim-blockscreen2-b-prereg.md, commit
7b5986646.

## Verdict: BANKED — the census is complete on its own terms

The pre-registered bar is met exactly: 12 refused-prone
seeds banked, 81 refused evenings, unclassified = 0,
OFF-vs-ON deep-equal on the validation subset, partition
sums hold, recorder errors = 0. Proof:
scripts/test-blockscreen2-b.js PROOF-GREEN (V1 prior-
corpus reproduction, S1–S6 screen staging, C1 corpus
identity, P1 partitions, U1 unclassified, G0 errors,
G1 deep-equal, D1 determinism on 3 re-run seeds).
This is the first arm in the blockage-census chain to
reach a census verdict rather than INSUFFICIENT-DATA —
because the screen finally selected directly on the
census's own conditioning variable instead of a proxy
(away-proneness) or nothing at all (blind band).

The census answer, quoted exactly as preregistered —
"among refused evenings on refused-prone seeds from a
direct refused-prone screen on fresh band 13000+", NEVER
as a blind-band rate: all four blockage types occur,
every refused evening has a BFS route-around, and the
genuinely-uncovered set is EMPTY (0 of 81). The
eveningdetour lever's coverage claim therefore holds on
this bank: no refused evening in the census needed
anything beyond a route-around. One qualification, kept
in the verdict rather than footnoted away: one
"covered" route is 12 steps long (see below) — covered
by the BFS judge, but a long walk, not a hop.

## Screen (direct, fresh band, stop rule honored)

Screen legs = census legs (blocktype driver,
POLICY=nighttravel, BLOCKTYPE_DIAG=1, DAYS=30,
substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, detour OFF). Consecutive 40-seed blocks
from 13000; scanning stopped at the end of the first
block reaching >= 12 qualifiers, per prereg — no
further block was run after the bar.

| Scan block | Seeds | Qualifiers (cumulative) |
|---|---|---|
| 13000–13039 | 40 | 3 |
| 13040–13079 | 40 | 4 |
| 13080–13119 | 40 | 5 |
| 13120–13159 | 40 | 6 |
| 13160–13199 | 40 | 6 |
| 13200–13239 | 40 | 7 |
| 13240–13279 | 40 | 12 — STOP (>= 12 reached) |
| Pooled scan | 280 | 12/280 = 4.29% |

Qualifier = >= 1 travel-refused evening in the 30-day
leg (N = 1, as preregistered — same definition as both
prior arms, so the rate stays comparable). The last
block contributed 5 qualifiers at once (13248, 13255,
13261, 13268, 13276) after a 40-seed block with zero —
seed-level clustering, live: refused-proneness arrives
in clumps of geography, not evenly spread. The
4.29% direct-screen qualifier rate sits above the
blocktype arm's 2.5% blind rate (2/80); both are small
counts on different bands, so no rate-movement claim
is made — the pooled blind-ish count across both arms
is 14/360 = 3.9%, reported as context only.

Banked seeds (scan order, = all qualifiers, none added
or dropped): 13012, 13025, 13029, 13067, 13111, 13157,
13224, 13248, 13255, 13261, 13268, 13276. These are
published for the next pilot run, per prereg.

Scanned-pool context (selection data, 280 seeds, 8332
evenings): already-inside 873, completed 7141,
out-of-reach 199, blocked-combat 32, travel-refused
81, walk-interrupted-combat 5, walk-no-path 1. The
single walk-no-path evening (13096 day 8, at haven
tile, "Need 10 kcal, have 0") is a starvation-adjacent
evening, not a blockage refusal, and is correctly
outside the census (classification applies to refused
evenings only).

## Census table — BOTH countings (prereg-required)

81 refused evenings on 12 banked seeds, 17 episodes,
all classified, all covered, 0 uncovered. Seeds-per-
type counts seeds contributing >= 1 evening of that
type; the incidences sum to 13 across 12 seeds because
13111 contributes two types (fallen_tree 6 +
washed_out 6) — the only mixed-type seed.

| Type | Evenings | Evenings share | Seeds | Seeds share | Covered | Uncovered | Route lengths | Blocked tiles |
|---|---|---|---|---|---|---|---|---|
| creek | 47 | 58.0% | 4/12 | 33.3% | 47 | 0 | 2 (×47) | (4,3) ×22, (3,4) ×25 |
| washed_out | 14 | 17.3% | 3/12 | 25.0% | 14 | 0 | 2 (×2), 3 (×6), 4 (×6) | (5,4) ×6, (4,3) ×8 |
| fallen_tree | 11 | 13.6% | 3/12 | 25.0% | 11 | 0 | 4 (×8), 5 (×3) | (4,3) ×8, (3,4) ×3 |
| rubble | 9 | 11.1% | 3/12 | 25.0% | 9 | 0 | 3 (×2), 4 (×5), 12 (×2) | (4,3) ×7, (5,4) ×2 |
| Total | 81 | 100% | 12 seeds | — | 81 | 0 | — | — |

Per seed: 13012 fallen_tree 2 (episode days 29–30);
13025 creek 12 (episodes 14–16, 20–21, 24–30);
13029 rubble 5 (19–23); 13067 creek 2 (4–5);
13111 fallen_tree 6 + washed_out 6 (4–9, 11–16);
13157 fallen_tree 3 (6–8); 13224 rubble 2 (4–5);
13248 washed_out 2 (29–30); 13255 rubble 2 (10–11);
13261 washed_out 6 (18–23); 13268 creek 23
(5–10, 12–20, 23–30); 13276 creek 10 (4–13).
Longest episodes: 13276 (10 evenings), 13268
(9 evenings, days 12–20), 13025 (7 evenings,
days 24–30).

Read the two countings together, or misread the
census: by evenings, creek looks dominant (58%);
by seeds, creek is 4 of 12 villages, and every type
touches 3–4 seeds. The evening share is geography,
not population: 45 of the 47 creek evenings sit on
just 3 seeds (13268: 23, 13025: 12, 13276: 10), all
at the two haven-adjacent crossing tiles (4,3) and
(3,4). The seeds-per-type column is the guard the
1330Z arm asked for, and it works — no type here is
a one-seed artifact (minimum 3 seeds per type), but
no evening share should be quoted without its seed
count beside it.

## The uncovered set: EMPTY — with one long-route qualification

Uncovered (no BFS route-around): 0 evenings, all
types. The census question from blocktype-b is
therefore ANSWERED on this bank: no refused evening
needed anything beyond a route-around. The
qualification: seed 13224's two rubble evenings
(days 4–5, departure creek (4,2), blocked (4,3))
have a 12-step route-around via the map's top edge
[(4,2)–(3,2)–(3,1)–(3,0)–(4,0)–(5,0)–(6,0)–(6,1)–
(6,2)–(6,3)–(6,4)–(5,4)–(4,4)] — structurally valid
(consecutive orthogonal steps, ends at haven), so
covered under the preregistered BFS judge, but a
12-step night walk around the edge of the world is
a different proposition from the 2–5 step hops
every other evening shows. Whether the eveningdetour
lever walks the full BFS path on such a case (and
whether a 12-step night walk reads sensibly) is NOT
answered by this census — it is the next arm's
check, reported as a finding below, not folded into
the verdict.

## Guard legs (validation subset, preregistered)

First 4 banked seeds (13012, 13025, 13029, 13067)
re-legged recorder-OFF: refused counts reproduce
exactly (2, 12, 5, 2), OFF-vs-ON deep-equal with the
blocktype field stripped shows zero diffs (G1).
Determinism: re-running screen legs for 13012,
13025, 13029 reproduces byte-identical files and
identical qualifier classifications (D1); the rerun
scratch directory was deleted before handoff, per
prereg. Prior-corpus validation (V1): the
blockscreen-b 5-seed set re-classifies to exactly
creek 23 / washed_out 17 / fallen_tree 8 / rubble 0,
unclassified 0, uncovered 0 — the recorder classifies
known refused evenings identically before any new
census number is trusted.

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in 30-day position traces — reported,
not claimed. What IS in the files: scanned seeds
maxWaveUnlocked — wave 3 on 11/280, wave 2 on 212/280,
wave 1 on 57/280; wave 4–5 unlocks 0/280 scanned,
0/12 banked. Banked seeds: wave 1 on 3/12 (13012,
13224, 13276), wave 2 on 9/12, wave 3 on 0/12. No
national/table/win movement is claimed from this run;
the census is a nightly-position instrument, and a
30-day trace cannot move a scale-wall number.

## Wall numbers (every run)

- National: NOT OBSERVABLE in 30d traces (no field).
- Table: NOT OBSERVABLE in 30d traces (no field).
- Wins: NOT OBSERVABLE in 30d traces (no field); 0 win
  flags present.
- Wave 4–5 unlocks: 0/280 scanned, 0/12 banked.
- Median survival: 30 days scanned (median 30; 9/280
  villages lost, days 16–27) and 30 days banked
  (11/12 survived 30 days; 13261 village-lost day 27).

## Village assessment (plain words)

Twelve refused-prone villages, thirty days in: alive
and thin in the familiar way, and the refused nights
are the exception even here (233 completed evenings
vs 81 refused on the banked seeds). The refused
villager spends nights camped one short walk from
home — usually 2 steps, once 12 — while the village
goes on losing people to everything else: monsters,
sickness, starvation, the wild. On 13268, one
villager spends 23 of 30 nights refused at the same
creek crossing, in three long episodes, while the
player character dies twice mid-stranding (day 10,
sickness; day 21, contest) and the village still
survives — the stranding is a long inconvenience
endured, not a village-killer, on this seed. On
13261 the story runs the other way and must be told
carefully: a 6-night washed_out episode (days 18–23)
is followed by starvation deaths on days 25–27 and
the village lost on day 27 — but that village had
been losing people since day 4 (monster, wild,
sickness), so the episode precedes the final slide
without proving it caused it; correlation documented,
causation NOT claimed. On 13224, the villager wakes
the morning after the rubble episode still camped at
the creek with 182 kcal — thin, away, and alive —
which is exactly the state the detour lever exists
to shorten. What was missing on those nights was,
again, the walk: on 79 of 81 evenings a 2–5 step
walk home existed unnamed; on 2 evenings the walk
existed but ran 12 steps around the map edge. The
blank this run fills is the census itself — type
shares under both countings, and an empty uncovered
set, on current master — plus a bank of 12 named
seeds the next pilot can use without re-screening.
The blank it documents but does not fill is whether
the detour lever actually walks a 12-step route, and
whether it should.

## Sense-testing (read transcripts, judged for meaning)

- REFUSED, creek episode (13025 days 14–16, creek
  (5,3) → blocked (4,3)): the days play fully —
  foraging, learning Old World Caches, meeting
  Olivia and Dwayne — and the refusal ("The creek
  runs fast here — no crossing without a bridge or
  a swim.") is the honest last line each night. By
  day 16 the villager is down to 378 kcal and still
  foraging the same creek bank; nothing robotic,
  but nothing in the narration ever names the
  2-step way around via (5,4), and nothing marks
  the night away. Day 25 brings the Fusion Reactor
  ("You will never be hungry again") mid-episode —
  and the villager still refuses the hop that night,
  correctly: a reactor changes hunger, not a creek.
  The refusal is not an artifact of the recorder
  (the recorder adds no say lines); it is the
  engine's own line, read on a fresh seed.
- REFUSED, rubble 12-step route (13224 days 4–5,
  creek (4,2) → blocked (4,3)): "Rubble chokes the
  path." twice on day 4, amid a creek survey for an
  elder ("Just look. Come back and tell me.") and
  meeting Fiona by name. The blockage type matches
  what the player would see on that tile, and the
  refusal reads as a real blockage — the 12-step
  route exists only in the recorder's BFS, never in
  narration, which is the honest state of the game
  today (detour OFF). Morning after the episode
  (day 6) still finds the villager camped at the
  creek with 182 kcal — the episode's end, like the
  other arms' episodes, is un-narrated: home during
  day 6's daytime walk, no line saying so.
- REFUSED, washed_out episode (13261 days 18–23,
  creek (5,3) → blocked (4,3)): day 18 ends on a
  Stonebridge sighting ("9 people, 18 days in.
  fishing folk") and "The path is washed out."
  twice; day 23 ends on gaining Travel Light
  ("Nothing you carry slows you down") and the same
  refusal — lighter, still blocked, honestly so.
  Morning after the episode (day 24) wakes inside
  at haven with 2355 kcal: the episode ends, the
  trace does not say whether the villager walked
  around in daytime or the wash eased. That
  un-narrated exit is the same small wrinkle the
  1130Z and 1330Z arms flagged — third sighting,
  still a narration gap, not a guard issue.
- No transcript read robotic in the sample; the
  robotic-feeling beat, where it exists, remains
  the absence — no line names the way around, and
  no line marks the night away.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position census of a POLICY-SIDE recorder — zero
src/js changes, so there is no game-root delta for a
panel to compare, and the panel's registry policies
do not include the trace policies this arm measures.
The OFF-vs-ON legs are an instrument-perturbation
check (G-deep-equal), not a game comparison — and
the pre-registered census bar above is the judge. If
a future lever becomes a game change, a panel compare
is run at that point. No telemetry deviation check is
meaningful on these corpora either (no national /
table / wins / exiled fields exist in 30-day position
traces), so none is faked.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The direct screen worked where the blind band and
  the away-prone two-stage screen did not: it hit
  the >= 12 seed bar in 280 seeds (7 blocks) where
  the blind band managed 2 in 80 and the two-stage
  screen managed 5 refused-prone from a 24-seed
  bank after 360 scan seeds. The lesson is narrow
  and should not be over-generalized: direct
  screening is the right tool for a TYPE census
  (whose estimand conditions on the trait), not
  evidence that refused-proneness is common — the
  screen's own rate is 4.29%, and the next arm
  should keep quoting census shares as conditional.
- The seeds-per-type requirement earned its keep:
  the evening share (creek 58%) and the seed share
  (creek 33%) tell different stories, and only the
  pair together is honest. Keep both countings in
  every future census prereg of this kind.
- The BFS judge's one rough edge surfaced: "covered"
  now includes a 12-step edge walk (13224 rubble).
  The judge statement held as written (orthogonal
  BFS, route exists = covered), and the census
  verdict stands — but a future prereg for the
  DETOUR lever should pre-register a route-length
  breakdown (short vs long walks) rather than a
  binary covered/uncovered, since a lever that
  walks 12 steps at night is a different design
  claim from one that walks 2. This is proposed
  here, NOT applied retroactively: the census
  counted 13224 as covered, per its prereg.
- The >= 12 seed bar was met exactly (12, via a
  5-qualifier final block). A future census wanting
  tighter evening shares should raise the bar
  (e.g. >= 20 seeds) rather than raising N — N = 1
  with a seed-count bar is the combination that
  worked, and raising N would bias toward long
  episodes.
- The un-narrated episode exit (morning inside, no
  line saying how) is now a third-sighting wrinkle
  across three arms. It is not a census-guard issue
  (no morning criterion exists), but it belongs on
  the findings backlog as a narration blank, since
  it recurs on every episode that ends inside the
  30-day window.

## Evidence files

- Prereg: evidence/2026-10-29/sim-blockscreen2-b-prereg.md
  (commit 7b5986646, before any judged leg)
- This file: evidence/2026-10-29/sim-blockscreen2-b.md
- Screen/census corpus (recorder ON, 280 seeds):
  evidence/2026-10-29/sim-blockscreen2-b-corpus-on/
  (280 files), sim-blockscreen2-b-scan.json
  (rows + bank + qualifier rate)
- Guard corpus (recorder OFF, validation subset):
  evidence/2026-10-29/sim-blockscreen2-b-corpus-off/
  (4 files: 13012, 13025, 13029, 13067)
- Instruments: scripts/policies/blocktype-diag.js
  (UNCHANGED), scripts/blocktype-trace-b.js,
  scripts/analyze-blocktype-b.js
- Proofs: scripts/test-blockscreen2-b.js (PROOF-GREEN
  on the full census + guards) and
  scripts/test-blocktype-b.js (reused T1–T8 instrument
  proof; the rerun scratch directory was deleted
  before handoff, per prereg)

## Landing note for the coordinator

BANKED, not a lever: the census verdict lands (type
shares under both countings + empty uncovered set on
current master), and the banked seed list below is
published for the next pilot run — no re-screen
needed for a detour-confirm pilot on refused-prone
seeds. What the branch holds: the PROOF-GREEN
default-OFF recorder instrument (unchanged), the
280-seed direct screen (selection + census data),
the 4-seed OFF guard corpus, and the 12-seed bank.
No src/js change, no default flip, no driver adopts
the recorder. New findings for the backlog (reported
here, NOT appended by this worker — coordinator
appends): (1) 12-step rubble route-around on 13224
— does the eveningdetour lever walk the full BFS
path, and should a 12-step night walk be offered?
(2) un-narrated episode exits, third sighting
(13224 day 6 still away at dawn, 13261 day 24 inside
with no return line). (3) 13261 correlation note:
6-night refused episode days 18–23 followed by
starvation deaths days 25–27 and village loss day 27
— correlation documented, causation NOT established.
This worker does NOT merge to master — coordinator
merges. Worktree contains only committed work at
handoff (verified before reporting).
