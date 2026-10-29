# sim-homebody-a — HOMEBODY CENSUS: DIAG-GO

Run: flesh-out loop, run fleshout-20261029T1215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-homebody-a.
MEASUREMENT ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes, zero lever builds. This arm
sizes backlog item #1409 (sim-findings.md, steve-call): homebody
villagers (maxD 0) can never be offered a HUNT under
objHuntCandidate; no lever may assume otherwise until Steve
rules. This census measures the block. It does NOT rule on it
and does NOT build a fix. It does NOT rebuild the lottery lever
(killed today, sim-lottery-a), the HUNT-holds lever
(build-pickdepart owns it), or trail-follow (build-returns
owns it).
Preregistration (binding, committed BEFORE any judged row
existed): evidence/2026-10-29/sim-homebody-a-prereg.md (commit
00549bd30). Instruments: commit 1dd5ebe80, sense wording fix
2542b392e. No metric was changed mid-run. The one correction
made after the census ran (sense wording: 174's fresh picks
are three, not two; 138's first six picks are four fresh plus
two stale) changed words only — no count, no flag, no GO leg
moved. It is documented here, not hidden.

VERDICT: DIAG-GO — all three prereg GO legs pass (19/19
triples range-classified, OTHER 0; determinism byte-identical;
neutrality exact), the structural prediction holds (0 offered
picks at maxD 0 over 59 maxD-0 picks), and the sense bar
passes. No wall movement is claimed from re-analysis.

## Plain words first

Sixteen villages, nineteen villagers who survived a wave-4
fight with a memory to act on. Two of the nineteen are
homebodies — people whose roaming range is zero tiles. Both
of them fought a beast ONE tile from haven, came home with a
fresh memory, and were never once offered the trip back.
Not refused, not outvoted by dinner — never asked. The
game cannot ask them: no distance satisfies "between 1 and
0," so the hunt offer is structurally impossible for them,
on any memory, at any pick, forever, until the range rule
itself is ruled on.

So the size of the homebody block on this band is exactly
two survivor stories out of nineteen — about one in ten.
That is the whole of it, and it is worth saying plainly
because the number is small enough to misread in both
directions. It is NOT the funnel's binding break: the
funnel's binding break is still the lottery (9 of 19
offered the hunt and chose food and water instead) and
same-day death (5 of 19 never lived to the next pick).
A ruling that let homebodies hunt could, at most, put
two more triples into the lottery — and the lottery
currently takes about 2 of 36 offered picks, departs
about 1 of 2 takes, and meets 0 of 1 departures. The
upper bound on what a homebody ruling unlocks here is
two lottery entries, not two returns, not two kills,
not a wave-5 door.

But the two are not noise either. Both blocked memories
are adjacent-tile fights — the closest a beast can be
without standing in the haven itself. If the design
intent is "homebodies stay home," the census says the
rule already does that perfectly (59 maxD-0 picks, zero
offers — the rule never leaks). If the intent is "anyone
who survives a fight can go back for the beast," the
census says the rule silently vetoes exactly the people
who fought closest to home. Either way, the ruling now
has a number attached: 2 of 19 triples, 2 of 11
pick-recorded villagers, 2 of 14 wave-4 memories held
at pick time, 0 of 59 maxD-0 picks ever offered.

## Header (pre-registered) vs result

- GO LEG 1 — all 19 funnel triples re-derived by the
  funnel rule and classified by range class, OTHER <= 1:
  RESULT 19/19 triples, every triple carries villagerMaxD
  + homebodyFreshBlocked + outOfRangeFreshBlocked +
  otherGateFresh + offeredFresh, funnel OTHER 0 -> PASS.
- GO LEG 2 — determinism, seed 75106 re-run into a
  scratch dir inside this worktree: RESULT byte-identical
  (cmp clean), scratch dir removed after the diff -> PASS.
- GO LEG 3 — neutrality, this sweep reproduces the
  funnel-a corpus wall numbers on identical seeds:
  RESULT exact (see guards) -> PASS.
- STRUCTURAL PREDICTION (stops the census if violated):
  zero offered picks with gates.maxD == 0: RESULT 0
  offered over 59 maxD-0 picks -> HOLDS.
- SENSE BAR: >= 1 homebody-blocked triple trace quoted
  verbatim (S1) with a plain-words judgment -> PASS
  (both homebody triples quoted below).
- No re-scoring: no metric was changed mid-run.

## The census

### (a) Band-wide maxD distribution (scoped — read this first)

SCOPE, per the prereg: the funnel recorder records picks
ONLY for wave-4 memory holders, so "band-wide" here means
the corpus's PICK-RECORDED villagers — every villager who
picked while holding a wave-4 memory. Villagers who never
held a wave-4 memory never pick on the record, and their
maxD is unobserved. That scoped population is the one
that matters for the ruling (it is the population that
could ever be offered a wave-4 HUNT), and every number
below is scoped to it unless labeled otherwise.

- Pick-recorded villagers: 11 distinct (seed, vid).
  maxD 0 (homebody): 2 (18%). maxD 1: 7 (64%).
  maxD 2: 0. maxD >= 3: 2 (18%). Mixed maxD across a
  villager's picks: 0 — every villager's maxD was
  stable across its picks, so the class is a person
  trait on this band, not a pick-time accident.
  The two homebodies are both on seed 75109:
  visjoin_138 and visjoin_174.
- Wave-4 memories held at pick time: 14 distinct
  (seed, vid, mid) pairs appearing in a pick's
  preSightings with a wave-4 mid. Held by maxD-0
  villagers: 2 (14%) — exactly the two triples'
  memories (138/algorithm, 174/eulogy).
- Wave-4 memories formed: 32 distinct (seed, vid, mid)
  pairs in funnel notes with a wave-4 mid. Of those,
  17 belong to pick-recorded villagers (known maxD);
  maxD-0 among the known: 2 (12% of known). The other
  15 formed memories belong to villagers with no pick
  record — they fought a wave-4 beast and never picked
  again while holding the memory on the record (died,
  left, or never idle at haven after the fight); their
  maxD is unobserved and they are NOT counted as
  homebody or non-homebody anywhere in this census.

### (b) Per-triple range classification (19 triples)

How to read this table: funnelCls is the funnel-a
headline (windowed, binding). The flag columns are
WINDOW-FREE occurrence flags over all picks carrying
the triple mid (see metric review): homebodyBlock means
a fresh pick existed with candidate null, maxD 0, and
other gates green — the census's binding question.
outOfRange/otherGate flags can co-occur with offered
picks from other episodes (a villager can be blocked
on one fresh pick and offered on another); they do
NOT overturn the funnel class. Only homebodyBlock is
judged as a binding range fact, and it is true for
exactly 2 triples and false for the other 17.

| triple | funnelCls | maxD | picks w/ mid | fresh | homebodyBlock | outOfRange | otherGate | offeredFresh |
|---|---|---|---|---|---|---|---|---|
| s75106 catalina/influencer | LOTTERY-LOST | >=3 | 21 | 5 | no | yes | yes | 2 |
| s75106 catalina/eulogy | LOTTERY-LOST | >=3 | 7 | 2 | no | no | no | 2 |
| s75106 visjoin_102/eulogy | LOTTERY-LOST | 1 | 23 | 3 | no | no | no | 3 |
| s75106 visjoin_113/eulogy | PICKED-NEVER-DEPARTED | 1 | 17 | 6 | no | no | no | 6 |
| s75106 visjoin_115/eulogy | DEPARTED-EMPTY-TILE | 1 | 20 | 10 | no | yes | yes | 8 |
| s75108 app_mgpsphm923/eulogy | LOTTERY-LOST | 1 | 2 | 1 | no | no | no | 1 |
| s75108 app_mgpsphm923/reunion | LOTTERY-LOST | 1 | 1 | 1 | no | no | no | 1 |
| s75108 ava_garcia/eulogy | LOTTERY-LOST | 1 | 7 | 4 | no | no | yes | 3 |
| s75108 diana_osei/eulogy | GATE-BLOCKED-AT-PICK | >=3 | 2 | 2 | no | no | yes | 0 |
| s75108 diana_osei/reunion | DIED-BEFORE-PICK | >=3 | 0 | 0 | no | no | no | 0 |
| s75109 visjoin_109/suburb | DIED-BEFORE-PICK | unknown | 0 | 0 | no | no | no | 0 |
| s75109 visjoin_138/algorithm | MEMORY-OVERWRITTEN | 0 | 54 | 4 | YES | no | no | 0 |
| s75109 visjoin_156/eulogy | DIED-BEFORE-PICK | unknown | 0 | 0 | no | no | no | 0 |
| s75109 visjoin_174/eulogy | GATE-BLOCKED-AT-PICK | 0 | 5 | 3 | YES | no | no | 0 |
| s75115 app_mgpspj23354/algorithm | LOTTERY-LOST | 1 | 29 | 3 | no | no | yes | 2 |
| s75115 app_mgpspj23354/reunion | LOTTERY-LOST | 1 | 19 | 5 | no | no | no | 5 |
| s75115 chantal_mukendi/reunion | LOTTERY-LOST | 1 | 3 | 3 | no | no | no | 3 |
| s75115 priya_nair/reunion | DIED-BEFORE-PICK | unknown | 0 | 0 | no | no | no | 0 |
| s75116 app_mgpsphcq161/reunion | DIED-BEFORE-PICK | unknown | 0 | 0 | no | no | no | 0 |

Notes on the table:
- The two YES rows are the census. 174's headline is
  already GATE-BLOCKED; the census confirms the gate is
  range, and homebody range specifically. 138's headline
  is MEMORY-OVERWRITTEN (last episode closed by eviction
  on d176); the census confirms the funnel evidence's
  metric-review reading — her fresh window (d142-d144)
  was homebody-blocked, and the eviction 32 days after
  staleness is an epilogue, not the block. Under the
  prereg's last-episode rule her headline stays
  MEMORY-OVERWRITTEN; under a fresh-window rule she
  would be HOMEBODY-RANGE. Either way she counts once
  in the upper bound, and the evidence does not double-
  count her.
- The four DIED-BEFORE-PICK triples with maxD unknown
  (109, 156, priya_nair, app_mgpsphcq161) never picked
  after the anchor, so no fresh block could occur for
  them and none is claimed. Their maxD is unobserved;
  they are NOT in the upper bound (see (d)).
- diana_osei/eulogy is the control that proves the
  distinction works: GATE-BLOCKED like 174, but her
  fresh pick is post-flee (otherGate yes, homebodyBlock
  no) with maxD >= 3. Same headline class, different
  mechanism — the census separates them.
- catalina/influencer and visjoin_115 show outOfRange
  and otherGate occurrence flags alongside offered
  picks: a villager can hold two entries for one mid
  (different tiles/days) and be blocked on one fresh
  pick and offered on another. Those flags are
  occurrence facts, not binding reclassifications.

### (c) Offered-pick counts by range class (all corpus picks)

Distinct corpus picks: 183 (the funnel corpus's count,
reproduced exactly). Offered = candidate non-null.

| per-pick maxD class | picks | offered | offered share | HUNT chosen among offered* |
|---|---|---|---|---|
| 0 (homebody) | 59 | 0 | 0% | 0 |
| 1 | 101 | 45 | 45% | 7 |
| >=3 | 23 | 12 | 52% | 2 |
| 2 / unknown | 0 | 0 | — | 0 |
| TOTAL | 183 | 57 | 31% | 9 |

*Corpus-wide HUNT choices on offered picks (any wave-4
memory-holder pick, any hunt target, any window) — NOT
the triple-window take rate. The triple-window take
rate stays 2/36 offered picks in triple windows (the
funnel band's number, reproduced). Do not quote the
corpus-wide 9 as a take rate for the funnel.

Triple-window offered picks by villager maxD (from the
funnel triple table joined to villager class): maxD 0
triples 2, offered 0; maxD 1 triples 9, offered 32;
maxD >= 3 triples 4, offered 4; unknown triples 4,
offered 0. The 36 triple-window offered picks are the
funnel band's 36; the two homebody triples contribute
none of them.

### (d) Counterfactual upper bound (labeled, NOT a lever result)

UPPER BOUND: 2 triples would even become
lottery-eligible if homebodies could hunt:
s75109 visjoin_138/algorithm (MEMORY-OVERWRITTEN) and
s75109 visjoin_174/eulogy (GATE-BLOCKED-AT-PICK).

This is an upper bound on lottery ENTRIES, and nothing
more. It does not claim those triples would take the
hunt (band take rate 2/36), depart (1/2 takes depart),
or meet (0/1 departures meet). A homebody ruling, on
this band, buys at most two more lottery tickets in a
lottery that currently pays out nothing. Separately,
and never folded into the bound: the count of the 19
triples whose villager is maxD 0 is also 2 — the same
two triples, because no died-before-pick triple has a
known maxD 0. On a band where a maxD-0 villager died
before picking, those two counts would differ; here
they happen to agree, and the evidence says so rather
than letting the agreement hide the distinction.

## Sense-testing law (transcripts read, beats quoted)

Verdict: both homebody traces read as played sequences
of a person kept home by range — not as artifacts, not
as refusals, not as lottery losses. The full sense
script output is reproducible with
EVID=<perseed-homebody-a> node
scripts/test-homebody-a-sense.js (HOMEBODY-SENSE PASS).

Transcript S1-primary — s75109 visjoin_174 / eulogy,
verbatim (note first, then picks in corpus order):

- NOTE d176 part=703 visjoin_174 eulogy@(5,4)
  refreshed=false listLenAfter=1 evicted=[] post=
  [["eulogy",5,4,176,3]]
- PICK d177 part=706 chosen=WATER candidate=null
  gates={armed:true,sheltered:false,postFleeResting:
  false,maxD:0} hx,hy=(4,4) pre=[["eulogy",5,4,176,3]]
- PICK d179 part=712 chosen=WATER candidate=null
  (same gates, same memory)
- PICK d179 part=715 chosen=EAT candidate=null
  (same gates, same memory)
- PICK d180 part=717 chosen=SEEK candidate=null
  (memory now age 4 — stale, not a fresh block)
- PICK d180 part=719 chosen=EAT candidate=null
  (same, stale)

Judgment: she fought a eulogy one tile east of haven,
came home, and three times while the memory was fresh
she picked water, water, food — and was never offered
anything else, because the candidate recompute returns
null for a villager with maxD 0. She is armed, not
sheltering, not resting off a fright; the only failing
gate is range, and it fails by arithmetic (1 <= d <= 0
has no solution), not by circumstance. The two d180
picks show the memory aging past freshness without
ever having been offered — the block outlives the
fresh window, it does not expire with it.

Transcript S1-second — s75109 visjoin_138 / algorithm,
first six picks verbatim (four fresh, then two stale):

- PICK d142 part=565 chosen=FORAGE candidate=null
  gates={armed:true,sheltered:false,postFleeResting:
  false,maxD:0} hx,hy=(4,4) pre=[["chorus_line",3,4,
  140,3],["algorithm",3,4,141,3]]
- PICK d143 part=569 chosen=FORAGE candidate=null
  (same gates, same memories)
- PICK d144 part=574 chosen=EAT candidate=null
- PICK d144 part=575 chosen=EAT candidate=null
- PICK d145 part=576 chosen=SEEK candidate=null
  (algorithm memory now age 4 — stale)
- PICK d145 part=578 chosen=HAVEN_CHORE candidate=null
  (same, stale)

Judgment: the same shape with a longer tail — four
fresh picks, zero offers, then 50 stale picks across
32 days (54 picks carrying the mid in total), then a
nightcourt note on d176 pushes the algorithm entry out
of the cap-4 store. The eviction that headlines her
funnel class is the last line of a story that ended
on d144. And like 174's, her blocked memory sits one
tile from haven — (3,4) against haven (4,4). Neither
woman fought far away. Both fought next door, and
neither could ever be asked to walk next door again.

## Fresh-band wall (16 seeds; reported, NOT claimed as movement)

Identical to funnel-a (neutrality is exact, not
approximate): wins 4/16, all lesser, full seat 0/16.
National ever 13/16, final 9/16. Table invited 10/16,
entered 4/16. Wave-4 reach 11/16, wave-5 0/16. Median
days 180 — HORIZON-CAPPED (same caveat as funnel-a:
the median is the cap, not a survival gain). Deaths
600, starvation deaths 4. Death-cause shares match
funnel-a exactly (villager combat 235,
villager-vs-villager combat 160, player the wild 87,
villager expedition 35, villager monster 32, villager
ambush 8, villager wound-that-wouldn't-close 7, player
contest 6, player the arena 6, villager sickness 6,
player sickness 2, villager starvation 2, player
starvation 2, villager alien 2, player a stranger 2,
player the night 2, villager thirst 1, villager a toad
like a war drum 1, villager The Heckler 1, villager
The Algorithm 1, villager Loud-Eyes 1, villager
Big Ugly 1).

## Guards

- NEUTRALITY (exact before any census number is
  judged): per-seed deep equality of fieldparty
  meetings, returns meetings/departures/drops, AND
  funnel picks/notes between perseed-homebody-a and
  perseed-funnel-a; wall fields identical; death totals
  identical; judgedA 42, judgedB 31, classes ACCIDENTAL
  39 / MEMORY-ONLY 3 / DELIBERATE 0, chains 13 all
  STILL-ALIVE, HUNT departures 326 (wave-4 1), HUNT
  true drops 297 (wave-4 1), recorder errs 0 (all three
  recorders), overflow 0, join errors 0 -> PASS. The
  census drew no RNG and wrote no game state; the
  funnel analyzer run against this corpus reproduces
  its own machine legs (census/join/control-shape/
  neutrality/triples/taxonomy PASS) independently.
- STRUCTURAL PREDICTION: 0 offered maxD-0 picks over
  59 -> HOLDS. The range rule never leaks on this band.
- SENSE BAR: S1 primary + second traces quoted verbatim
  with plain-words judgments -> PASS.

## Metric review (for the NEXT run — never a mid-run re-score)

- WINDOW-FREE FLAGS vs WINDOWED HEADLINES: the
  per-triple range flags in (b) deliberately ignore the
  funnel window (they answer "did a fresh homebody
  block ever occur for this triple"), while the funnel
  class carries the window. A fresh homebody block
  after a later accidental meeting would still set the
  flag. On this band no such case occurs (both YES
  triples' fresh blocks fall in their anchor windows:
  174 d177-d179 after anchor d176; 138 d142-d144
  after anchor d141), so the distinction costs nothing
  here — but a future band should report windowed and
  window-free flags side by side rather than relying
  on the coincidence.
- SINGLE-VERDICT PRIORITY (analyzer artifact, not a
  finding): the analyzer's one-word rangeVerdict ranks
  homebody > out-of-range > other-gate > offered, so a
  lottery triple with both offered picks and an
  out-of-range fresh pick elsewhere (catalina/influencer,
  visjoin_115) reads OUT-OF-RANGE in that column. The
  evidence table above therefore reports flags, not
  the single verdict, and the verdict column is not
  quoted as a classification. A future analyzer should
  either drop the single verdict or rank OFFERED above
  occurrence flags when the question is "was this
  triple ever offered."
- SCOPE (standing): the (a) distribution covers
  pick-recorded villagers only. A census over all
  villagers would need a maxD recorder on a broader
  pick population, which this arm deliberately does
  not build (measurement only, recorders verbatim).
  The 15 formed-but-unpicked wave-4 memories are the
  visible edge of that scope limit: their villagers'
  maxD is unknown, and the census does not guess it.
- COUNTERFACTUAL LABEL (standing): the (d) upper
  bound counts lottery-eligibility only. It must never
  be quoted without that label, and never as a take,
  departure, or meeting forecast.
- PANEL NOTE (standing): scripts/balance-panel.js has
  no census-ingest mode; identical-seed before/after
  corpora are the section 15 substitute, as in
  funnel-a. No panel artifact faked, no panel verdict
  claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10):
  corpus path for the coordinator's check is
  evidence/2026-10-29/perseed-homebody-a/*.json
  (metrics national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in funnel-a:
  the baseline's regime does not match this substrate,
  and per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The band's true
  wall numbers are nationalEver 13/16, entered 4/16,
  wins 4/16. Baseline NOT rolled by this arm; the
  coordinator judges any LOUD lines.

## Blanks filled or documented

- FILLED (measurement, not a fix): the #1409 sizing
  blank is now filled on the funnel band — homebody
  range blocks 2/19 survivor triples, 2/11
  pick-recorded villagers, 2/14 memories held at pick
  time, with 0/59 maxD-0 picks ever offered. The ruling
  question is now a numbered question, not an open
  worry: does Steve intend maxD-0 villagers to never
  hunt, including for beasts one tile from haven?
- DOCUMENTED (for the ruling, not built here): (a) the
  rule never leaks (0/59) — if the intent is
  stay-home, it already works perfectly and no lever
  is needed; (b) the upper bound is two lottery
  entries, so a ruling alone moves nothing measurable
  on this band without the lottery/departure/arrival
  work alongside it; (c) the distance-0 edge (a fight
  on the haven tile itself is also un-offerable, 1 <= d
  rule) surfaced in occurrence flags but was not this
  census's question and is not sized here.
- NOT re-judged: funnel-a DIAG-GO, lottery-a NO-GO,
  and all prior verdicts stand as published. Funnel-a's
  numbers are reproduced exactly, not revised.

## Findings note (for the coordinator's backlog maintenance;
this arm does NOT edit the shared sim-findings.md directly)

- Backlog #1409 remains a steve-call item awaiting
  ruling, now sized by this census: homebody range
  blocks 2/19 funnel triples (s75109 visjoin_138/
  algorithm, s75109 visjoin_174/eulogy), 2/11
  pick-recorded villagers, 0/59 maxD-0 picks ever
  offered — upper bound 2 lottery entries, not 2
  returns. Evidence: evidence/2026-10-29/
  sim-homebody-a.md + perseed-homebody-a/.

## Village assessment in plain words

The village does not have a homebody problem at scale.
It has two homebodies, on one seed, who fought two
beasts next door and were never asked to go back. The
rest of the village's story is unchanged from the
funnel: people survive beasts and then choose dinner
and water over revenge, or die the same day they
survive, or pick a hunt and never leave, or leave and
find nothing there. The homebody ruling matters to
those two women — one of whom spent 32 days carrying
a memory of a beast one tile away that the game would
never let her walk back to — and it matters as a
design question about what "homebody" means. But
anyone hoping the ruling unlocks the wave-4 wall
should look at the size first: two lottery tickets
in a lottery that has not yet paid out a single
meeting. The wall is still the lottery, the departure
gate, and the empty tile — in that order — and the
homebody question is a footnote to the lottery, sized
and filed, waiting for Steve's word.

## Test and infrastructure notes

- `node --check` clean on all three new files;
  scripts/test-homebody-a-fixtures.js exits 0 with
  HOMEBODY-FIXTURES PASS (30/30, incl. the maxD-0 vs
  out-of-range vs other-gate separation, distance-0
  edge, and counterfactual counting); scripts/
  test-homebody-a.js exits 0 with HOMEBODY-CENSUS PASS
  (legs 1 + 3; leg 2 + sense in this evidence);
  scripts/test-homebody-a-sense.js exits 0 with
  HOMEBODY-SENSE PASS (both homebody traces verbatim);
  scripts/test-funnel-a-sweep.js --summary equivalent
  (full band run) exits 0 with corpus 16/16 ok.
- Determinism gate: seed 75106 re-run into a scratch
  dir inside this worktree (scratch-homebody-det,
  removed after the diff) byte-identical to the corpus
  row (cmp clean).
- EPERM flap chronology (loud, per the assignment's
  infra notes): safe-commit.sh failed 3x on /tmp index
  locks during the sense-wording commit (13:01 UTC
  attempts 1-2 fatal, attempt 3 clean after ~90 s) —
  waited out with retries, no ref surgery, no force.
  Safe-commit index clobber hit all three prior
  commits (staged-deletion twins, then a staged-old-
  blob twin on the sense commit); repaired via
  HEAD-blob `git update-index --add --cacheinfo` with
  status + diff-HEAD-empty + hash-match verification,
  never `git reset`. No push, no bump, no live
  verification (ship-loop line).
- Zero src/js diff on this branch (verified at
  closeout); zero policy files added or changed (all
  three recorders reused verbatim; the only new files
  are the analyzer, fixtures, and sense script under
  scripts/); no other arm's corpus touched
  (predecessor corpora read-only; the homebody corpus
  lives in its own dir, perseed-homebody-a/). No push,
  no bump, no live verification. Ready for coordinator
  merge, pending ship — via the coordinator.

## Commits (this branch, sim-homebody-a)

- 00549bd30 prereg (binding, before any judged row).
- 1dd5ebe80 instruments (analyzer + fixtures + sense).
- 2542b392e sense wording fix (fresh-pick counts,
  adjacent-tile note; words only).
- Corpus + analysis + this evidence: final commit(s)
  on this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the
homebody block is now sized (2/19 triples, upper bound
2 lottery entries) and filed as a numbered steve-call
question — but no wave-4 field party has yet killed in
the field, the full seat stays 0, wave 5 stays 0, and
the binding breaks remain the lottery, departure, and
arrival. The directive stands until the tracker records
this axis converged on measured evidence.
