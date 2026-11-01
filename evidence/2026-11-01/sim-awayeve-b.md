# sim-awayeve-b — DIAG: the away evening censused — deed-seeking lives out (65%), competent ends days at home (5%), and the nighttravel evening step turns no-attempt nights into attempted nights

Run: oversight-flesh-out-loop-b, arm sim-awayeve-b, run
fleshout-loop-b-20261101T0330Z, axis food-economy (away-
evening census). Worktree sim-awayeve-b, branch
sim-awayeve-b. Base commit 6409c13128f3f986f9a7f6b75648
3a8aeb07d18c (worktree HEAD at prereg writing time).
DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only: prereg,
awayeve analyzer + pure proof test, evidence, compare,
corpora, censuses. The absencehunt driver, creekseek
driver, absencehunt analyzer, confirmednight analyzer,
and strandtile analyzer are REUSED VERBATIM from the
base. This worker does NOT push, bump, verify live, or
merge into master; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator
merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-awayeve-b-prereg.md, commit 0596f9716, written
BEFORE any judged leg) set four bars, ALL of which
must hold:

(a) INSTRUMENT GATE: every judged leg errs 0,
decisions == evenings, loop-days complete or
game-over with day recorded — PASSED, 96/96 judged
legs (pilot 32 + confirm 64; the 2 base-check legs
are also clean, 98/98 including them). The only
death-aware horizons are seed 17549, village-lost
on P1 day 24, creekseek day 24, and BARE day 18
(P3 17549 survives the window).
(b) CLASSIFICATION COMPLETENESS: >= 95% of away
evenings carry a return story — PASSED at 100%
(574/574: 0 UNCLASSIFIED on any policy, either
band; ended-other always carries its subkind).
(c) CENSUS DELIVERED: away-evening counts AND shares
by policy on identical seeds, with per-policy
breakdowns by evening tile, by start
(departure/continuation), by end-cause (with the
travel-refused vs out-of-reach split), and by
return story — PASSED; the tables below plus the
compare file carry every breakdown, and the
"what ends them" contrasts (P1-vs-BARE,
P3-vs-BARE, creekseek-vs-P1) are stated in numbers.
(d) SENSE PASS: at least one away-evening episode
read end to end, judged as a person away from home
— PASSED (see sense test; the 17545 episode reads
as a person stuck working a creek line, with two
honesty gaps stated, not hidden).

GO is therefore the verdict. GO here is still DIAG:
it authorizes NO src/js fix and NO default change.
What the arm delivers is the census strandwide asked
for: the away evening itself, measured — which
policies end days away, how often, on what tiles,
by what ending, and with what return story.

## Definitions (prereg, exact)

Away evening = evening snap NOT atHaven (absencehunt
haven-checked definition: insideHaven true OR tile
'haven' OR map position equals the village node) AND
NOT on road (roadActive/roadOnRoad false). Road
evenings are a separate class in every table, never
pooled into away. Haven + away + road = 100% of
evenings in every cell. End-cause, in order:
blocked-combat (inCombat) > tent-camp (insideTent)
> return-attempted (eveningOutcome in the
confirmednight FAILED_OUTCOMES set, or
tripHomeDetours > 0; subkinds travel-refused /
out-of-reach / detour-* / tripHomeDetours kept
separate) > no-return-step ('policy-no-record')
> other (verbatim outcome). Return story, in
order: still-away-at-horizon (no next day,
survived) / ended-other (village-death, succession,
woke-at-haven-same-vessel, road-transition, or
other-continuation, always with subkind) /
walked-home-next-day (next day starts away, same
vessel, ends at haven) / failed-return (next
evening away, end-cause return-attempted) /
no-attempt (next evening away, end-cause
no-return-step) / UNCLASSIFIED (missing or
inconsistent record — instrument failure only).
Away episode = maximal run of consecutive away
evenings for one morning vessel; ends classified
WALK-HOME / WOKE-AT-HAVEN-SAME-VESSEL / SUCCESSION
/ HORIZON / VILLAGE-DEATH / ROAD-TRANSITION /
ENDED-OTHER. BARE means competent.daily ALONE (no
evening step) everywhere in this file — NOT
refusedband's nighttravel-without-wood stack (see
the prereg's Naming Note).

## THE CENSUS (judged) — 96 legs, 2,856 evenings, 30d

Instrument gate: every leg errs 0, decisions ==
evenings in count (30/30, or 24/24 and 18/18 on the
village-lost 17549 legs), loop-days complete or a
game-over with its day recorded. Gate passed on all
eight cells (4 policies x 2 bands). Horizons
death-aware (harness stops at Game.over).

### Pooled shares (A1+A2, identical seeds)

| policy | legs | evenings | haven | road | away | share | seeds w/ away |
|---|---|---|---|---|---|---|---|
| P1 nighttravel-stack | 24 | 714 | 683 | 0 | 31 | 4.3% | 6/24 |
| P3 deed-seeking | 24 | 720 | 249 | 0 | 471 | 65.4% | 23/24 |
| BARE competent-only | 24 | 708 | 671 | 0 | 37 | 5.2% | 6/24 |
| creekseek-stack | 24 | 714 | 679 | 0 | 35 | 4.9% | 6/24 |

### Per-band split (never pooled away)

| policy | A1 away / evenings | A2 away / evenings |
|---|---|---|
| P1 | 21 / 234 (9.0%) | 10 / 480 (2.1%) |
| P3 | 170 / 240 (70.8%) | 301 / 480 (62.7%) |
| BARE | 13 / 228 (5.7%) | 24 / 480 (5.0%) |
| creekseek | 21 / 234 (9.0%) | 14 / 480 (2.9%) |

### What ends days away, by policy (pooled)

P1 (31 away): tiles creek 20, forest_floor 11.
Start: departure 7, continuation 24. End-cause:
return-attempted 30 (ALL out-of-reach as a
subkind) + blocked-combat 1. The single
travel-refused OUTCOME in the judged corpus
(17563 day 4, P1 and creekseek — the same fight)
sits under blocked-combat by the prereg's ordering
rule (inCombat true at the evening snap); the
outcome itself is preserved in the record, and the
outcome-level travel-refused count is 2 evenings
(one per stack, same seed-day), not 0. No detour
outcomes, no tripHomeDetours signals anywhere.
Return stories: failed-return 24, ended-other 5
(all succession), walked-home-next-day 2.
Episodes: 7 (SUCCESSION 5, WALK-HOME 2; lengths
1:1, 2-4:3, 5+:3). Genuine absences 7 (= departures
7). Creek away evenings 20. Day shape among away
evenings: forage delta > 0 on 30/31, patrol delta
> 0 on 0/31, travel lines on 31/31, blocked-
crossing flag on 14/31.

P3 (471 away): tiles forest_floor 255, grove 56,
trail_edge 55, creek 68, ruin 32, meadow 2,
wetland 2, thicket 1. Start: departure 116,
continuation 355. End-cause: no-return-step 465
+ blocked-combat 6. Return stories: no-attempt
352, walked-home-next-day 56, ended-other 52
(succession 49, blocked-combat-continuation 3),
still-away-at-horizon 11. Episodes: 116
(WALK-HOME 56, SUCCESSION 49, HORIZON 11;
lengths 1:4, 2-4:81, 5+:31). Genuine absences 114
vs departures 116: the gap is exactly 2
sleep-return-class evenings that are succession
mornings (17555 day 10 ruin, 17559 day 22
forest_floor) — vessel-changed haven mornings,
not walks home. Creek away evenings 68; creek
camps 12. Day shape: forage > 0 on 468/471,
patrol > 0 on 162/471, travel lines on 471/471,
blocked-crossing flag on 80/471.

BARE (37 away): tiles forest_floor 28, creek 9.
Start: departure 7, continuation 30. End-cause:
no-return-step 35 + blocked-combat 2. Return
stories: no-attempt 28, ended-other 7 (succession
5, blocked-combat-continuation 2),
still-away-at-horizon 2. Episodes: 7
(SUCCESSION 5, HORIZON 2, WALK-HOME 0; lengths
2-4:3, 5+:4). Genuine 7 (= departures 7). Creek
away 9; camps 2. Day shape: forage > 0 on 36/37,
patrol > 0 on 0/37, travel lines on 37/37,
blocked-crossing flag on 16/37.

Creekseek (35 away): tiles creek 24, forest_floor
11. Start: departure 7, continuation 28.
End-cause: return-attempted 34 (all out-of-reach)
+ blocked-combat 1 (the same 17563 day-4 evening
as P1). Return stories: failed-return 28,
ended-other 5 (all succession),
walked-home-next-day 2. Episodes: 7 (SUCCESSION
5, WALK-HOME 2; lengths 1:1, 2-4:2, 5+:4).
Genuine 7. Creek away 24; camps 4. Day shape:
forage > 0 on 34/35, patrol > 0 on 0/35, travel
lines on 35/35, blocked-crossing flag on 18/35.

Zeros that are findings, not gaps, across all
2,856 judged evenings: road evenings 0; tent-camp
evenings 0; woke-at-haven-same-vessel stories 0;
detour outcomes 0; tripHomeDetours signals 0;
UNCLASSIFIED evenings 0. The sleep step never
teleports a villager home same-vessel on this
corpus, and no judged villager ever camps in a
tent at the evening snap.

### Per-seed away counts (pooled; a = away evenings, h = haven evenings)

| seed | P1 a/h | P3 a/h | BARE a/h | CS a/h |
|---|---|---|---|---|
| 17543 | 3/27 | 21/9 | 0/30 | 3/27 |
| 17544 | 0/30 | 19/11 | 0/30 | 0/30 |
| 17545 | 8/22 | 24/6 | 5/25 | 8/22 |
| 17546 | 0/30 | 19/11 | 0/30 | 0/30 |
| 17547 | 0/30 | 20/10 | 0/30 | 0/30 |
| 17548 | 0/30 | 19/11 | 0/30 | 0/30 |
| 17549 | 3/21* | 24/6 | 8/10* | 3/21* |
| 17550 | 7/23 | 24/6 | 0/30 | 7/23 |
| 17551 | 0/30 | 19/11 | 0/30 | 0/30 |
| 17552 | 0/30 | 19/11 | 3/27 | 0/30 |
| 17553 | 0/30 | 19/11 | 0/30 | 0/30 |
| 17554 | 0/30 | 23/7 | 0/30 | 0/30 |
| 17555 | 0/30 | 20/10 | 2/28 | 0/30 |
| 17556 | 0/30 | 24/6 | 0/30 | 0/30 |
| 17557 | 0/30 | 0/30 | 0/30 | 0/30 |
| 17558 | 0/30 | 23/7 | 0/30 | 0/30 |
| 17559 | 0/30 | 18/12 | 0/30 | 0/30 |
| 17560 | 0/30 | 18/12 | 0/30 | 0/30 |
| 17561 | 0/30 | 18/12 | 0/30 | 0/30 |
| 17562 | 0/30 | 23/7 | 0/30 | 0/30 |
| 17563 | 4/26 | 15/15 | 15/15 | 8/22 |
| 17564 | 0/30 | 19/11 | 0/30 | 0/30 |
| 17565 | 6/24 | 19/11 | 4/26 | 6/24 |
| 17566 | 0/30 | 24/6 | 0/30 | 0/30 |

(* 17549: village-lost legs — P1/CS 24 evenings,
BARE 18 evenings; P3 survives the window.)
Episodes for the non-P3 policies (P3's 116 episodes
are in the compare file and the pooled census):
P1 — 17543 [8-10] SUCCESSION; 17545 [4-11]
SUCCESSION; 17549 [9-11] WALK-HOME; 17550
[10-16] SUCCESSION; 17563 [4] WALK-HOME,
[6-8] SUCCESSION; 17565 [7-12] SUCCESSION.
BARE — 17545 [4-8] SUCCESSION; 17549 [6-13]
SUCCESSION; 17552 [28-30] HORIZON; 17555 [29-30]
HORIZON; 17563 [4-9], [11-19] SUCCESSION;
17565 [10-13] SUCCESSION. Creekseek — identical
to P1 except 17563: [4] WALK-HOME, [6-12]
SUCCESSION (the second episode runs 4 days longer).

## The causal reads

### 1. P1 vs BARE: the evening step changes the story, not reliably the share

Pooled P1 31 away vs BARE 37 — but the band split
flips (A1: P1 21 vs BARE 13; A2: P1 10 vs BARE
24), so the stack contrast is seed-driven, not a
systematic share effect. Matched seeds share the
RNG seed, not the trajectory: the woodcarry
morning carry, evening bridge, and woodwarm
actions run during daily on P1, so days diverge
from day 1, and a pooled share difference must
never be read as "the evening step created N away
evenings." What the evening step DOES do,
systematically: it puts a return attempt on the
night (P1 away nights return-attempted 30/31 vs
BARE no-return-step 35/37), and it ends episodes
by walking home (P1 WALK-HOME 2/7 episodes vs
BARE 0/7 — BARE episodes end only by succession
or horizon). One clean same-seed-day contrast
exists: 17563 day 5. On BARE the villager ends day
5 at forest_floor (5,3) (away evening, part of
the [4-9] episode); on P1 the same villager, same
morning tile, ends day 5 at haven (outcome
walk-no-path) — the evening step walked her home
that day, breaking what would have been a longer
episode. Day 4 on the same seed is the corpus's
only travel-refused outcome (both stacks, same
fight live at the evening snap).

### 2. P3 vs BARE: deed patrols are the away-evening machine

P3 ends 65.4% of evenings away; BARE ends 5.2%.
The patrol rhythm is visible in the episode
starts: P3's away life starts on day 5 on nearly
every seed and cycles in ~5-day shapes ([5-7],
[10-12], [15-17], [19-21], [22-24], [26-29]
recur across seeds) — the villager goes out on
patrol, stays out 2-4 days foraging and working,
then either walks home in daytime (56 episodes,
narrated "You walk back into Haven — 3 days gone.
The fire's still going. Somebody looks up from
the work and nods. Back is back.") or dies out
there (49 episodes end by succession). The one
seed where patrols add nothing is 17563: BARE and
P3 away days and episodes are IDENTICAL ([4-9],
[11-19], both SUCCESSION) — the villager is
already out all day at (5,3), so patrol targets
change no evening. The P3 away tile spread (8
types, forest_floor dominant at 255) vs BARE's 2
types (forest_floor 28, creek 9) says patrols
don't just add away evenings — they add away
PLACES (groves, ruins, trail edges).

### 3. Creekseek vs P1: one move in 714 evenings, one extended episode

Creekseek move records, pooled (714 evenings):
at-haven skip 676, already-creek 24, combat skip
2, no-creek-offered 10 (all pilot), attempted-but-
refused 1 (17563 day 4, the (4,3) hop refused),
moved-to-creek 1 (17563 day 5). Pilot: creekseek
is byte-identical to P1 on every number (21 away,
same days, same episodes) — zero moves, because
the 10 pilot forest_floor away evenings had no
creek offered and the 11 creek away evenings
needed no move. Confirm: the whole +4 delta sits
on 17563. Day 5's move (forest_floor (5,3) ->
creek (4,3)) is a VISIT — the evening is at haven
on both policies — but it precedes the divergence:
same vessel gen_ocpths4 survives days 9-12 at the
(2,0) creek on creekseek, while on P1 the
successor wakes at haven on day 9 (the day-5
visit's "You make for the creek to drink before
night." + "Cold, clear, moving. The best thing
you've seen all day." lines are the only policy
difference before the split). The mechanism that
kept her alive 4 extra days is NOT isolated here
— the extra travelTo also steps the world (NPC
batch turn, tile events, woodpile state differs:
P1 day 9 "10 left for the hearth" vs creekseek
day 13 "13 left") — so the claim is exactly
"one visit precedes one extended episode," never
"drinking saved her." Strandwide's conclusion
stands, now measured on away evenings: creekseek
converts away evenings it is offered, and on fresh
bands it is offered almost none.

### 4. Seed 17549: the village that dies on three policies

17549 is village-lost on P1 (day 24), creekseek
(day 24), and BARE (day 18), and survives on P3.
Its P1/creekseek episode [9-11] ends WALK-HOME —
the villager gets home — and the village still
dies two weeks later. The death cause is not
investigated here (out of scope for this census);
the seed is named so a death-cause arm can pick
it up without re-hunting.

### 5. Seed 17557: the always-home seed

Zero away evenings on all four policies (30/30
haven evenings each). The counterpart to 17563:
some seeds never end a day away under any stack
in 30 days. The away-evening population is
seed-concentrated on every policy (P1/CS: 6/24
seeds carry all away evenings; BARE: 6/24; P3:
23/24 — the exception that proves the patrol
effect).

## Base check — ZERO DRIFT (not judged)

P1 17523 + creekseek 17523, 30d, strandtile
analyzer verbatim, on this base: P1 8 creek
evenings, 7 confirmed, 7 FAILED-RETURN, episode
days 7-13 SUCCESSION; creekseek 13 / 11 / 11,
episodes days 7-13 and 18-21, both SUCCESSION.
Identical to strandwide on ee159dbc3, count for
count, day for day. No substitution, no retirement.
Awayeve cross-read on the same legs: P1 10 away
evenings (8 creek + 2 trail_edge, all
return-attempted, stories failed-return 8 +
ended-other 2); creekseek 13 away (all creek, all
return-attempted, failed-return 11 + ended-other
2). The away-evening instrument agrees with the
strandtile instrument where they overlap.

## SENSE TEST (law) — PASS, with two honesty gaps stated

Read end to end from THIS arm's pilot P1 corpus,
seed 17545, episode days 4-11 (+ day 12 succession
morning), same vessel gen_oxv38fn, creek (3,0)
every evening, outcome out-of-reach every night:

- Day 4 leaves haven in the morning, works forest
  floor, ruin (learns Old World Caches), creek
  ("The creek braids around gravel bars. Crawdads
  flick backward into the shadows of rocks."),
  and ends at the creek out-of-reach. Days 5-11
  repeat the shape: each morning opens with the
  blocked-crossing line THREE times ("The creek
  runs fast here — no crossing without a bridge
  or a swim."), then real work — foraging unknown
  nuts and berries, learning the counter for
  "something displaced a LOT of water" ("Strike
  the head as it coils..."), meeting named people
  ("Thabo," they say, touching their chest. "I'm
  Thabo."; "Kenneth," likewise), gaining Green
  Thumb, Literally on day 8 ("The plants lean
  toward you. They're gossiping."). Evening kcal
  falls 2300 (day 4) -> 70 (day 5) -> 0 (days
  6-11), yet the foraging, travel, and learning
  lines continue undiminished. Day 12 dawns at
  haven with a different vessel (pavel_dubini) —
  the episode ends by succession, not by return —
  and the successor's day is narrated as a
  homecoming ("You walk back into Haven. 15 Codex
  entries. The village is glad to see you.") plus
  a village debrief ("You were out when it
  happened... Liam is crying. Hannah is
  laughing.") that belongs to the successor, not
  the camper.
- Judgement: the episode reads as a person stuck
  working a creek line — she forages, learns,
  meets people, gains an ability, and never gets
  home — SENSE PASS. Two honesty gaps, stated
  plainly: (1) the fire-gossip texture ("You catch
  fragments by the fire — ...") fires on days 5-9
  while she sleeps rough at (3,0), days from any
  fire — the recurring #1660 note, observed here
  again, not re-filed (coordinator owns the
  backlog); (2) six days at 0 kcal with
  undiminished foraging and travel, then death
  overnight with no starvation narration in the
  transcript — the kcal semantics behind that run
  are not established by this census, so it is
  recorded as an observation, not a verdict.
- The sense pass rests on the stuck days (blocked
  crossings + repetition + learning + the
  succession end), not on the homecoming lines —
  the same standing caveat as strandtile and
  strandwide: succession mornings are narrated as
  returns while the census classifies them as
  deaths.
- Second voice, for the walk-home story: P3 17551
  confirm, episode days 5-7 WALK-HOME. Day 8:
  "Travel 3 tiles to Haven. You walk back into
  Haven — 3 days gone. The fire's still going.
  Somebody looks up from the work and nods. Back
  is back." A daytime walk home, same vessel,
  narrated with its own line — distinct from the
  succession homecoming line, which is why the
  census's walked-home vs succession distinction
  is not definitional only: the transcripts
  distinguish them too.

## Villager behavior sample (beyond the sense episode)

Out of the same corpora, villagers show goals
(forage named patches, learn counters, gain
abilities, patrol for deeds on P3), routines
(daily foraging loops; garden work at haven by
Tomas/Hannah while the scholar is out; woodpile
draws "for the road home"), and dialogue with
consequences (introductions that stick as names —
Tashi, Thabo, Kenneth — replacing "A man, maybe
40s" descriptors; the Stonebridge runner's
confrontation "Your foragers are stripping our
side of the northwest ground. Back off — or
we'll talk with teeth." (Trust -3); the sky-split
village debrief with distinct voices). Robotic /
repeated texture, flagged: the triple identical
blocked-crossing line every morning of a strand
(no distinction between attempts); "You catch
fragments by the fire" while camped away (above);
monster teases ("Something moves out there — ...")
that repeat verbatim across days. Decisions read
as person-like; the repetition lives in narration
templates, not in the choices.

## Reachability verdict

Away evenings ARE reached on current master — on
6/24 seeds for the nighttravel stacks, 6/24 for
BARE, 23/24 for deed-seeking. Walk-home episode
ends are reached (P1 2, P3 56, BARE 0, creekseek
2). Road evenings are NOT reached in this window
(0/2,856) on any of these policies — the road
class is empty here, which bounds any claim that
road nights feed the away population in 30d
competent/deed windows. Waves 1-5, Arc II/III/IV,
regional -> national, the table, and the win flag
are not in scope of this census and none is
claimed either way (see wall numbers for what
was observed on these legs).

## Village assessment, in plain words

Picture twenty-four villages, each run four ways
for a month. Left to themselves, the scholars
almost always come home: on the nighttravel
villages, only six villages ever sleep out, and
when they do they sleep out for days at a creek
or a forest floor, trying the way home every
evening and being told the way will not open,
until they die out there and someone else wakes
up in the hall. Take the evening step away and
the picture barely changes — same six-ish
villages, same creek and forest floors — except
now nobody ever tries to come home in the
evening, so the nights out there are just nights
spent out, ending the same way, by death or by
the month running out. Send the same villagers
out hunting deeds and everything flips: nearly
every village sleeps out most nights — twenty
nights out of thirty, in forests and groves and
ruins and creeks — going out on patrol, staying
out for days, foraging and learning as they go,
then walking home in daylight (or dying out
there) and doing it again five days later. And
the creek-seeking trick from the last round?
On fresh ground it almost never fires: in seven
hundred evenings it moved one villager, once, to
a creek for a drink before night — and that one
drink came with four extra nights stuck at a
creek, because the villager who drank lived
longer out there than the one who didn't. So the
answer to the strand program's question is
plain: what ends days away is not the creek, and
not the evening step. It's whether the day's work
takes you far enough that home won't open — the
patrols do it on purpose, competent days do it
rarely and by accident, and the evening step
only decides whether the night out there is a
night you tried to leave.

## Named seeds (unchanged + new, no substitution)

- 17523: P1 episode days 7-13 SUCCESSION;
  creekseek episodes days 7-13 and 18-21
  SUCCESSION. Reproduced exactly on this base.
  Unchanged.
- 17545: P1/CS episode days 4-11 SUCCESSION
  (sense-read episode); BARE episode days 4-8
  SUCCESSION (same seed, shorter). NEW named
  away seed (pilot).
- 17563: P1 episodes [4] WALK-HOME, [6-8]
  SUCCESSION; creekseek [4] WALK-HOME, [6-12]
  SUCCESSION (extended episode); BARE and P3
  episodes [4-9], [11-19] SUCCESSION, IDENTICAL
  across the two policies. NEW named seed
  (confirm) — the cleanest evening-step contrast
  (day 5 walk home) and the only creekseek move
  in the judged corpus.
- 17549: village-lost on P1 (day 24), creekseek
  (day 24), BARE (day 18); survives on P3. NEW
  named seed (pilot) — death-cause candidate.
- 17557: zero away evenings on all four policies.
  NEW named seed (confirm) — the always-home
  seed.
- Retired: none.

## Wall numbers (observed on these legs, report-only)

Judged legs: 96; survived window 93; village-lost
3 (all seed 17549, above). Median survival is
window-censored (median daysAlive 30; minimum
18). Per-leg maxWaveUnlocked: wave 1: 18 legs,
wave 2: 72, wave 3: 6, wave 4: 0, wave 5: 0.
National / table / wins are NOT measured by this
census and are not reported as wall numbers here
— no values are invented for them. The wave
numbers above are observed leg maxima from these
30d pre-seat legs, not a wall measurement.

## Blanks filled or documented

- Filled (this arm, measured): the away-evening
  census strandwide asked for — counts, shares,
  tiles, starts, end-causes, return stories, and
  episodes for four policies on identical seeds
  (96 legs, 2,856 evenings, 574 away evenings,
  100% classified).
- Filled (this arm, measured): the policy answer —
  deed-seeking ends 65.4% of evenings away vs
  5.2% BARE and 4.3% P1; the evening step changes
  the night's story (attempted vs no-attempt) and
  its episode ends (walk-home 2/7 vs 0/7), not
  reliably the share (band split flips).
- Filled (this arm, measured): creekseek's fresh-
  band yield on away evenings — 1 successful move
  in 714 evenings, 0 new seeds, 1 extended episode
  (+4 creek evenings on 17563). The policy's
  scarcity is away evenings near a creek, and on
  fresh bands those barely occur.
- Filled (this arm, measured): ZERO DRIFT between
  ee159dbc3 and 6409c1312 on the named seed
  17523 (strandtile counts identical).
- Filled (this arm, measured): road evenings are
  empty in this window (0/2,856) and tent-camp
  evenings are empty (0) — two classes future
  arms need not hunt here.
- Filled (this arm, measured): the P3
  departure/genuine gap is exactly 2 succession
  mornings (17555 day 10, 17559 day 22) — no
  sleep-step teleport home exists on this corpus
  (woke-at-haven-same-vessel 0).
- Documented (this arm, NOT a fix): the
  succession-narration gap recurs (homecoming
  lines on vessel-changed mornings); the
  fire-gossip-while-away texture (#1660 class)
  recurs in the sense read; six days at 0 kcal
  with undiminished activity is an open kcal-
  semantics observation, not a verdict.
- Documented (this arm, NOT investigated): seed
  17549's village death on three policies
  (death cause out of scope); the mechanism by
  which creekseek's day-5 visit extended 17563's
  episode by 4 days (not isolated — reported as
  precedence, never as "drinking saved her").

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (gate + >= 95% classification +
  census delivered + sense pass): FOUR OF FOUR MET
  (gate 96/96 judged, completeness 100%, all
  breakdowns delivered, sense pass with quotes).
  No metric was re-scored mid-run. The grid ran
  exactly as declared (pilot 32 + confirm 64 =
  96 legs); the base check ran first and did not
  gate the judged legs, as pre-registered.
- Whether out-of-reach should group with
  travel-refused under "return-attempted": YES
  under this prereg (confirmednight's signal set),
  with the subkind split always reported — and
  the corpus vindicates the split: the only
  travel-refused outcome (17563 day 4) would have
  been invisible inside a pooled attempted count
  without the ordering note (it sits under
  blocked-combat because a fight was live).
- Whether a woke-at-haven-same-vessel morning
  should count as walked-home: NO under this
  prereg, and the subkind fired ZERO times, so
  the question is moot on this corpus — a future
  arm that finds it non-zero must argue it with
  that evidence.
- Whether road evenings should ever pool into
  away evenings: NO under this prereg, and the
  road column is 0 everywhere here, so pooling
  would have changed nothing and hidden nothing.
- Whether BARE should have meant refusedband's
  nighttravel-without-wood stack: NO under this
  prereg (see Naming Note) — competent-only
  isolates the evening step, and the P1-vs-BARE
  story split (attempted vs no-attempt) is the
  proof the isolation worked.
- Carried doubt for the NEXT run: if the evening
  step's share effect is seed-driven while its
  story effect is systematic, the next question is
  which evening-step leg (the hop offer, the hop
  itself, the lodge entry, or the wood wrappers'
  daytime costs) moves a given seed's evenings —
  but that decomposition is for the NEXT run;
  this run is judged on the census it
  pre-registered. A second carried doubt: P3's
  day-5 start and ~5-day patrol rhythm suggests
  the deed-patrol schedule itself sets the away
  calendar — a future arm could vary the patrol
  schedule, but that is a lever comparison, not
  this census.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack,
a 30-day per-day away-evening census, away-evening
tiles/outcomes/return stories, or policies that
are not in the registry (creekseek,
BARE-competent as a census stack) — the same
declaration every prior strand arm made, stated
in the prereg. The comparison here is a
matched-seed census across bands and across
policies on identical seeds through the new
awayeve analyzer (which reuses the absencehunt
classifier verbatim), attached as
evidence/2026-11-01/sim-awayeve-b-compare.md,
never labeled a panel comparison. No panel result
is fabricated; the panel tool was not invoked on
this corpus.

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-awayeve-b-census-pooled-p1-30d.json --metrics
national,table,wins,exiled` prints LOUD
"national/table/wins disappeared: baseline
12/16/16 -> current 0 (n=1 files)". Investigated
as a missing-field artifact, same class as
strandwide's and confirmednight's rounds: this
census carries no national/table/wins/exiled
fields at all — the check ingests a census file
where the baseline expects per-seed sweep rows, so
0 means "field absent", not "wall moved". No
genuine LOUD signal. Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit EVERY commit in
   this arm (prereg, instruments, base check,
   pilot — committed files showing staged-as-
   deleted while byte-identical in the worktree).
   Repaired each time via `git update-index --add
   --cacheinfo` from HEAD blobs; `git status
   --short` empty + `git diff HEAD` empty verified
   after each repair. The commits themselves were
   never in doubt (blob hashes match). The
   coordinator should verify the same way after
   the final commit below.
2. safe-commit.sh does NOT accept directory paths
   ("fatal: Unable to add <dir> to database") —
   corpus dirs must be expanded to file lists
   first (known lesson, hit again on the base-
   check commit).
3. EPERM flap: NOT observed on file writes in this
   window (all sim transports, splits, and census
   writes landed first-try).
4. Judged corpora were never staged in /tmp (jsonl
   lived in evidence/ until split, then deleted,
   per the rule — no .jsonl leftovers of this arm
   at evidence time).
5. Diff guard at evidence time: `git diff --name-only
   6409c1312 -- src/ scripts/policies/` must show
   NOTHING (no game code, no existing policy file
   moved under measurement; the only new scripts
   are scripts/analyze-awayeve-b.js and
   scripts/test-awayeve-b.js, neither under
   scripts/policies/).

## Proof

scripts/test-awayeve-b.js: pure 39/39 (end-cause
ordering incl. combat > tent > return-attempted >
no-return-step > other, with the travel-refused /
out-of-reach subkind split; return-story cases
incl. walked-home-next-day, failed-return,
no-attempt, still-away-at-horizon, succession,
woke-at-haven-same-vessel, road-transition,
village-death, UNCLASSIFIED on missing next
evening; away-episode grouping and ends;
atHaven variants; gate predicate cases;
analyzeDir wiring on a synthetic corpus dir).
Corpus checks: every judged leg errs 0, decisions
== evenings (30/30, or 24/24 / 18/18 village-lost
on 17549), 96/96 judged legs gateOk (98/98 incl.
base check). Pooled consistency: P1 away 31 =
A1 21 + A2 10; P3 471 = 170 + 301; BARE 37 =
13 + 24; creekseek 35 = 21 + 14; total judged
evenings 2,856 = 714 + 720 + 708 + 714; creekseek
move records sum to 714 (676 + 24 + 2 + 10 + 1 +
1). Causal pairs: 17563 day 5 (BARE away vs P1
haven, same morning tile); 17563 day 5 creekseek
move (moved-to-creek, evening haven) preceding
the 4-day episode extension; 17563 BARE ≡ P3 away
days identical. Diff guard: see infrastructure
note 5.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-awayeve-b-prereg.md
  (commit 0596f9716)
- Evidence (this file): evidence/2026-11-01/
  sim-awayeve-b.md
- Compare (matched-seed census, not a panel
  comparison): evidence/2026-11-01/
  sim-awayeve-b-compare.md
- Instruments: scripts/analyze-awayeve-b.js,
  scripts/test-awayeve-b.js (instruments commit
  f2362bc7c; absencehunt/creekseek drivers and
  absencehunt/confirmednight/strandtile analyzers
  reused verbatim from the base)
- Base check (not judged): corpora
  evidence/2026-11-01/sim-awayeve-b-corpus-
  basecheck-p1-30d,
  sim-awayeve-b-corpus-basecheck-creekseek-30d;
  censuses sim-awayeve-b-census-basecheck-p1-30d.
  json, sim-awayeve-b-census-basecheck-creekseek-
  30d.json, sim-awayeve-b-census-away-basecheck-
  p1-30d.json, sim-awayeve-b-census-away-
  basecheck-creekseek-30d.json (commit 76acec51f)
- Judged corpora (per-seed files + stderr logs):
  evidence/2026-11-01/sim-awayeve-b-corpus-pilot-
  p1-30d, sim-awayeve-b-corpus-pilot-p3-30d,
  sim-awayeve-b-corpus-pilot-bare-30d,
  sim-awayeve-b-corpus-pilot-creekseek-30d,
  sim-awayeve-b-corpus-confirm-p1-30d,
  sim-awayeve-b-corpus-confirm-p3-30d,
  sim-awayeve-b-corpus-confirm-bare-30d,
  sim-awayeve-b-corpus-confirm-creekseek-30d
  (pilot commit 93b3729cd; confirm commit below)
- Censuses (analyzer output, one per corpus, plus
  pooled merges): evidence/2026-11-01/
  sim-awayeve-b-census-pilot-<p>-30d.json,
  sim-awayeve-b-census-confirm-<p>-30d.json,
  sim-awayeve-b-census-pooled-<p>-30d.json
  (p in p1, p3, bare, creekseek)
- No sim-findings.md append by this worker
  (coordinator owns the backlog): out-of-scope
  gaps are noted in the "Blanks" section and in
  the coordinator notes below for the coordinator
  to file.

## Coordinator notes (out-of-scope gaps, for the backlog — NOT filed by this worker)

- Seed 17549 village death on P1/CS (day 24) and
  BARE (day 18), survival on P3: death-cause
  candidate, no re-hunt needed.
- Fire-gossip-while-away texture (#1660 class)
  observed again in the sense read (17545 days
  5-9); succession mornings narrated as returns
  (standing caveat, same as strandtile/strandwide).
- Six days at 0 kcal with undiminished activity
  (17545 days 6-11): kcal-semantics observation,
  not a verdict — needs a kcal-mechanics read
  before anyone files it as a bug.
- P3's day-5 start + ~5-day patrol rhythm sets
  the away calendar: a patrol-schedule lever
  comparison is the natural next measurement if
  the program wants away evenings as a lever
  rather than a census.
- Next-blank candidate from this census: which
  evening-step leg (hop offer, hop, lodge entry,
  wood-wrapper daytime costs) moves a given seed's
  evenings — the P1-vs-BARE share effect is
  seed-driven while the story effect is systematic,
  so the decomposition needs seed-day pairs like
  17563 day 5, not pooled shares.
