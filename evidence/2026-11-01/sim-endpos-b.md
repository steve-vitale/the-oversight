# sim-endpos-b — DIAG: the daytime end-position distribution — days almost never end far, and when they do, a creek they cannot cross is the reason

Run: oversight-flesh-out-loop-b, arm sim-endpos-b, run
fleshout-loop-b-20261101T0730Z, axis food-economy
(daytime end-position distribution). Worktree
sim-endpos-b, branch sim-endpos-b. Worktree HEAD at
prereg writing time 3a8d913ea; prereg commit 19cd414a5
(committed BEFORE any judged census); instruments +
evidence commit: the commit on branch sim-endpos-b
whose message names this arm (see git log; the
coordinator's merge report carries the hash).
DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only: prereg, endpos
analyzer + proof test, evidence, census, day dumps.
The offergeo analyzer is REQUIRED verbatim (not edited)
for manhattan / bandOf / classifyOffer / departureOf.
This worker does NOT push, bump, verify live, merge
into master, or touch the sibling Loop A tree/branch,
any journey-* tree/branch, the sim-h56-b tree, or the
main tree; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator
merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-endpos-b-prereg.md, commit 19cd414a5, written
BEFORE any judged census) set four bars, ALL of which
must hold:

(a) INSTRUMENT GATE CLEAN — PASSED. All 240 legs
    errCount 0; 0 surprises; 0 haven-coordinate
    violations; row totals reconcile exactly (see
    Proof).
(b) TABLES ON >= 2000 evenings across >= 2 stacks —
    PASSED. 7,178 evenings, 2 stacks (nighttravel
    3,589 + creekseek 3,589).
(c) DOMINANT MECHANISM >= 30% of away d>=4 evenings
    — PASSED BY MEASUREMENT, not by the fallback
    clause. CREEK-BLOCKED = 107/240 = 44.6%. The
    fallback (fresh legs) was therefore NOT invoked,
    and no fragmentation statement was needed.
    OTHER = 0, so cause-separation did not fail
    either.
(d) PROOF TEST GREEN + re-readable censuses — PASSED.
    scripts/test-endpos-b.js 27/27 green; every
    number below is analyzer output over the
    committed corpora listed in Files.

GO is therefore the verdict. GO here is still DIAG:
it authorizes NO src/js fix and NO default change.
What the arm delivers is the 0630Z closeout's blank
(1): where days end, measured over ALL evenings —
and the mechanism behind far endings, measured, not
guessed.

## The answer, in one paragraph

Days almost never end far from home at all. Of 7,178
evenings, 6,860 (95.6%) end at haven inside, 20
(0.3%) end at haven outside, and only 298 (4.2%)
end away — 58 within 3 tiles, 183 at 4-5 tiles, 57
at 6+ tiles. So the reason days "so rarely end at
d<=3" is NOT that days end far instead: days end
AT home, overwhelmingly. The far-ending tail is
tiny (240 evenings at d>=4, 3.3% of all evenings),
and inside that tail the dominant mechanism is a
creek the villager cannot cross: 107 of the 240
far evenings (44.6%) carry the daytime line "The
creek runs fast here — no crossing without a bridge
or a swim." The second mechanism, nearly tied, is
camping: 104 (43.3%) end on the tile they woke on,
in an away stretch (84.6% of far evenings sit in a
run of 2+ consecutive away evenings). Together the
creek block and the camp explain 87.9% of far
endings. Only 24 far evenings (10.0%) are the
out-and-not-back shape — a day that started at
haven, walked out, and did not return. Roads
account for none (0), combat for one (0.4%),
wound/rest lines for almost none (5/240, 2.1%).
The offer table's mystery dissolves: Band A
evenings are rare because AWAY evenings are rare,
and away evenings are rare because the daily
itinerary brings the villager home or keeps her
camped — not because days routinely strand her
far out.

## Endpos classes, read off the code (prereg, verified by the data)

- Endpos = the villager's map position when nightStep
  starts (after competent.daily; after the creek
  visit on creekseek). Recovery: offer-evaluated
  evenings use offergeo's departureOf verbatim
  (evening snap for offer-no, woodcarry step record
  for travel-refused, morning-gated cross-stack pin
  or day-line distance for hops); guard evenings
  (blocked-combat / blocked-tent) use the evening
  snap (the guard fires before any travel); all
  other non-evaluated evenings are haven evenings by
  construction (the step delegates to the entry leg
  only on the haven tile or already inside).
- Haven is (4,4): 0 haven-coordinate violations in
  7,178 evenings.
- A hop evening's class is its DEPARTURE band, not
  its haven evening snap. A travel-refused evening
  whose retry rescued it to haven is STILL its
  departure band (the day ended away; the rescue is
  the step's work, not the day's end).

## Table (a): evening-outcome x endpos-class (pooled, 7,178 evenings)

| eveningOutcome | H-IN | H-OUT | A d<=3 | B d=4-5 | C d>=6 | total |
|---|---|---|---|---|---|---|
| already-inside | 755 | 0 | 0 | 0 | 0 | 755 |
| completed | 6103 | 0 | 6 | 0 | 0 | 6109 |
| out-of-reach | 0 | 0 | 0 | 182 | 57 | 239 |
| travel-refused | 0 | 0 | 39 | 0 | 0 | 39 |
| walk-no-path | 0 | 0 | 2 | 0 | 0 | 2 |
| walk-interrupted-combat | 0 | 6 | 0 | 0 | 0 | 6 |
| blocked-combat | 2 | 14 | 11 | 1 | 0 | 28 |
| TOTAL | 6860 | 20 | 58 | 183 | 57 | 7178 |

Class shares (pooled): H-IN 95.6%, H-OUT 0.3%,
A 0.8%, B 2.5%, C 0.8%. Away total 298 (4.2%);
away d>=4 = 240 (3.3%). UNPINNED = 0 rows (no hop
lacked both a line distance and a cross record).

Reconciliation with offergeo (must hold, and does):
offer-evaluated bands were A 47 / B 182 / C 57
(286). Endpos bands are A 58 / B 183 / C 57 (298).
The difference is exactly the 12 guard-away
evenings the offer table excludes by design:
blocked-combat away at A 11 + B 1. The 8 hop
departures (6 completed-travelled + 2 walk-no-path)
are all Band A, as offergeo reported. Haven
evenings: H-IN 6,860 = already-inside 755 +
completed-not-travelled 6,103 + blocked-combat
haven-inside 2; H-OUT 20 = blocked-combat haven
14 + walk-interrupted-combat 6.

Per-stack matched tables (identical seeds, two
stacks — the §15 comparison in table form, not a
panel):

nighttravel-stack (3,589 evenings): already-inside
379 H-IN; completed 3,055 H-IN + 3 A; out-of-reach
89 B + 17 C; travel-refused 28 A; walk-no-path 1 A;
walk-interrupted-combat 3 H-OUT; blocked-combat
1 H-IN + 7 H-OUT + 6 A. Away d>=4 = 106.
creekseek-stack (3,589 evenings): already-inside
376 H-IN; completed 3,048 H-IN + 3 A; out-of-reach
93 B + 40 C; travel-refused 11 A; walk-no-path 1 A;
walk-interrupted-combat 3 H-OUT; blocked-combat
1 H-IN + 7 H-OUT + 5 A + 1 B. Away d>=4 = 134.
The creek visit moves the departure and usually
moves it FARTHER: creekseek has 28 more far
evenings than P1 (134 vs 106) and 23 more at C
(40 vs 17) — the same contrast offergeo saw in
offer rates, now visible in end positions.

## Table (b): departure-tile histogram (away endpos rows only, 298)

42 distinct away tiles. Top rows (tile: n, bands):
- (0,5) grove 28 (B) + forest_floor 22 (B) = 50 —
  the board-edge tile, d=5, is the single most
  common far endpos on both kinds (ground kind
  varies by seed at the same coordinate).
- (1,2) forest_floor 18 (B); (3,0) creek 16 (B) +
  forest_floor 14 (B); (1,1) creek 14 (C);
  (2,6) forest_floor 14 (B); (3,1) creek 12 (B);
  (8,2) forest_floor 12 (C); (2,0) grove 11 (C) +
  creek 10 (C); (4,2) meadow 10 (A) — the
  offergeo refusal tile; (2,3) creek 8 (A);
  (4,1) grove 7 (A); (6,7) forest_floor 6 (B);
  (1,7) creek 6 (C); (2,6) creek 6 (B).
Full histogram (all 42 tiles, with bands) is in
the census JSON; no tile appears in both a haven
class and an away band, and no away tile crosses
the A/B boundary (distance is a function of
coords, so a tile's band is fixed — the histogram
is a distance map, not a second mechanism).
Band-A away tiles are exactly offergeo's offered
tiles (plus the 11 guard rows at (0,5)-class
distances — see reconciliation above).

## Table (c): day-bucket trend (endpos class share per bucket)

| bucket | evenings | H-IN | H-OUT | A | B | C | away d>=4 share |
|---|---|---|---|---|---|---|---|
| days 1-10 | 2400 | 2264 (94.3%) | 0 | 22 | 82 | 32 | 114 (4.8%) |
| days 11-20 | 2400 | 2293 (95.5%) | 2 | 20 | 73 | 12 | 85 (3.5%) |
| days 21-30 | 2378 | 2303 (96.9%) | 18 | 16 | 28 | 13 | 41 (1.7%) |

Far endings DECLINE across the window (4.8% ->
3.5% -> 1.7%): early days strand villagers out;
later days end at home more reliably. The H-OUT
class is a late-window phenomenon (18 of 20 in
days 21-30) — haven-tile combat/entry interruption
arrives late, not early. The 22-evening shortfall
in days 21-30 is the death-aware horizon (6
village-lost legs end before day 30; see Wall
numbers).

## Table (d): mechanism distribution over away d>=4 evenings (n=240)

Priority order ROAD > COMBAT > CREEK-BLOCKED >
CAMPED > OUT-AND-NOT-BACK > AWAY-MOVED > OTHER
(prereg; first match wins; exhaustive — OTHER is
counted, not hidden).

| mechanism | pooled | share | P1 (n=106) | CS (n=134) |
|---|---|---|---|---|
| CREEK-BLOCKED | 107 | 44.6% | 42 (39.6%) | 65 (48.5%) |
| CAMPED | 104 | 43.3% | 52 (49.1%) | 52 (38.8%) |
| OUT-AND-NOT-BACK | 24 | 10.0% | 11 (10.4%) | 13 (9.7%) |
| AWAY-MOVED | 4 | 1.7% | 1 | 3 |
| COMBAT | 1 | 0.4% | 0 | 1 |
| ROAD | 0 | 0% | 0 | 0 |
| OTHER | 0 | 0% | 0 | 0 |

DOMINANT MECHANISM (prereg bar (c)): CREEK-BLOCKED,
107/240 = 44.6% pooled. Honest qualifier: the
plurality DIFFERS by stack — P1's plurality is
CAMPED (49.1% vs creek 39.6%), creekseek's is
CREEK-BLOCKED (48.5% vs camped 38.8%). The pooled
bar is met, but the two stacks tell slightly
different stories: the creek visit itself pushes
villagers onto creek tiles where the crossing
refusal strands them, so creekseek manufactures
more creek-blocked far evenings than P1 does.
CAMPED is 52 on BOTH stacks exactly — a
coincidence in the counts, not a shared event set
(the seeds match but the stacks' camped days
differ; the equality is arithmetic, not identity).

Secondary descriptors (non-exclusive, n=240):
morning on haven tile 39 (16.3%); morning same
tile as endpos 188 (78.3%); previous evening
endpos same tile 188 (78.3%); forageTrips > 0
231 (96.3%); creek-block line present 107
(44.6%); wound/rest standalone-word line 5
(2.1%); road flag 0; inCombat at step 1 (0.4%);
in a run of >= 2 consecutive away evenings 203
(84.6%). Last "Travel N tiles to X" destination:
forest floor 117 (48.8%), creek 81 (33.8%),
grove 40 (16.7%), no travel line 2 (0.8%).
Two descriptor cautions, stated plainly:
(i) creek-block-line share EQUALS the CREEK-BLOCKED
share by construction (priority puts every
creek-line row in CREEK-BLOCKED, so CAMPED rows
carry 0 creek lines by definition) — the
independent evidence is that 107 far days carry
the line at all, not the equality.
(ii) morning-same-tile and previous-endpos-same
are the SAME fact counted twice for away rows:
the night step moves nothing on an away evening
(except A-band rescues), so the next morning IS
the previous evening's endpos by construction.
The single informative number is 188/240 (78.3%):
over three quarters of far evenings end where
the villager woke. The remaining 52 are days with
net movement: the 24 out-and-not-back days, the
4 away-moved days, and 24 creek-blocked days that
started elsewhere and walked INTO the blocking
creek during the day.

What the day's record shows, mechanism by mechanism:
- CREEK-BLOCKED: the day walks to a creek and the
  crossing refuses, once or repeatedly ("The creek
  runs fast here — no crossing without a bridge
  or a swim."). The villager does not route around
  it in the daytime record either — the same
  refusal that blocks the evening hop blocks the
  day. Creek tiles dominate the C-band tile list
  ((1,1), (2,0), (1,7) creeks) and the last-travel
  destinations (creek 81).
- CAMPED: the day is a foraging loop that returns
  to the camp tile (out 2 tiles, back 2 tiles, in
  the 17549 day-10 read) or barely moves at all;
  the villager sleeps where she slept last night,
  night after night, in an away stretch (84.6%
  of far evenings are in a >= 2-night away run).
  Forage trips still register (96.3% of far days
  have forageTrips > 0) — camped days are working
  days, not idle days.
- OUT-AND-NOT-BACK: the minority shape (10.0%) —
  haven morning, a day of walking out through
  trail/forest to a far tile, no return leg. This
  is the shape the blank's phrasing imagined as
  typical; it is in fact the third mechanism.
- ROAD / wound / rest: absent. No far evening is
  on a road leg (these are pre-seat legs; the road
  is never taken), and no far day is explained by
  a wound or a rest — the 5 wound/rest-line rows
  are scattered single lines, not a mechanism.
  "Restless" narration does NOT count (the proof
  test pins this: restless != rest).

## SENSE TEST (law) — PASS, with the stuck-day silence stated

Read end to end from the dumps in Files:

- FAR, creek-blocked, out-and-not-back (17588 day
  25, P1): haven morning, learns Old World Caches,
  walks trail edge -> trail edge -> forest floor
  (bear encounter, "It's not scared — it's
  DECIDING"), sees three other villages' smoke
  (Stonebridge, Red Table, Emberhold — "They've
  been here the whole time"), then "Travel 1 tile
  to creek" and the crossing refusal TWICE. Ends
  at creek (1,7), d=6, out-of-reach. A person
  walking a full day and getting stopped by water
  at the end of it — the far ending has a cause
  in the day's own lines.
- FAR, creek-blocked, camped (17588 day 26, P1):
  the whole day is THREE identical lines — "The
  creek runs fast here — no crossing without a
  bridge or a swim." x3 — morning creek (1,7) to
  evening creek (1,7), kcal 2390 -> 2380. This
  reads as stuck, not as drift: the repetition IS
  the story (she cannot cross, the day produces
  nothing, she sleeps where she woke). But the
  narration is a template loop, flagged as prior
  arms flagged template repetition — a day with
  nothing but its blockage line three times is
  honest, not rich.
- FAR, camped, no creek (17549 day 10, P1):
  morning forest_floor (6,7) kcal 681 -> evening
  same tile kcal 671. "Travel 2 tiles to forest
  floor" (bear, "worked out" patch), "Travel 2
  tiles to forest floor" (Drum-Belly moves,
  Wanjiru speaks only Swahili, "You're starting
  to catch words"). A foraging loop that comes
  home to camp, a stranger met, a language
  learned in fragments. A person's day, not a
  random walk — and the kcal bleed (681 -> 671
  across the day, 681 -> 201 -> 39 across the
  mornings offergeo read on days 9-12) is the
  pressure the camped stretch carries.
- NEAR, hop-yes (17576 day 16, P1): morning
  forest_floor (4,3) d=1, a full day — creek
  visit ("You saw the creek. Luis nods."), counter
  learned from Wolfgang, snare set, 8x Blackberry
  (520 kcal) harvested, delegations given
  (Douglas/Anjali fish, Skylar cook), ability
  gained (Cornered Rat), then "Travel 1 tile to
  Haven" and the hall step. The near day is the
  busiest day in the sample: near endings are not
  lazy days, they are days whose itinerary happens
  to close at home. The contrast with the far days
  is itinerary shape (closed loop vs blocked or
  camped loop), not effort.

Verdict on sense: far days read as a person making
choices inside constraints (a creek she cannot
cross, a camp she works from), never as drift.
The robotic surface is the same as prior arms
found: template repetition on stuck days (17588
day 26 x3) and the silent offer-no night (no line
says home was unoffered — the step's silence,
not a sense failure).

## Villager behavior sample (beyond the sense days)

Out of the read days and the mechanism rows: goals
(forage named patches, learn counters, set snares,
run errands, delegate fish/cook); routines (daily
foraging loops returning to a camp tile; woodpile
draws "for the road home" on haven mornings per
offergeo); dialogue with consequences (introductions
that stick as names; counter-teaching; homecoming
lines by absence length). Nothing here suggests
villagers choosing non-personally; the far-ending
pattern is an itinerary + terrain fact (creeks
without bridges, camps away from home), not a
decision failure.

## Reachability verdict

NOT re-measured by this arm (a per-evening census,
not a reachability sweep); offergeo's and awayeve's
numbers stand (wave 1/2/3 reached, wave 4/5 never
in-window on these legs). What this arm ADDS to
reachability: the evening step's 3-tile net is
almost never the binding constraint in practice,
because only 4.2% of evenings end away at all —
the daytime itinerary, not the evening step, is
where days are won or lost. Any future work on
"why don't villagers come home" should start with
creek crossings (bridges/swimming) and camp
placement, not with the evening offer radius:
widening the offer to d=4-5 would touch at most
the 240 far evenings, and 211 of those are creek-
blocked or camped days whose problem is not
distance.

## Village assessment, in plain words

Picture the village at nightfall. Almost everyone
is home: nineteen evenings in twenty end inside
the hall, because the day's walking brings people
back or because they never left. The few who sleep
out are not scattered across the map — they are
in two places. Some are stuck at a creek they
cannot cross, trying the same water again the
next day and the next, watching the day drain
away in three identical lines about fast water.
The rest are camped: they woke at a grove or a
forest floor away from home, worked the patch
around it, met a stranger or a bear, and slept
there again, night after night, while their food
slowly bled down. Only one far night in ten is
the simple story of walking out from home and
not making it back. So the village's night map is
not a spray of lost villagers — it is a home full
of people, a creek with someone stuck beside it,
and a camp or two out in the dark where people
are living their days a long way from the hall.

## Wall numbers (observed on these legs, report-only)

NOT measured by this pre-seat census: national /
table / wins — no such fields exist in these
corpora, so no values are reported for them (never
invented, never zero-filled). What WAS observed on
the 240 legs (30d window, horizon-capped):
maxWaveUnlocked wave 1: 47, wave 2: 177, wave 3:
16, wave 4: 0, wave 5: 0; endReason survived 234,
village-lost 6; median daysAlive 30 (the window
cap, not a survival median — every surviving leg
runs the full 30 days by construction). The wave
wall is unchanged on these legs: wave 3 reached,
wave 4 never unlocked in-window. (Offerygeo's
192-leg new-base subset reported 39/139/14; the
pooled 240-leg numbers here add the 48 committed
legs.)

## Blanks filled or documented

- Filled (this arm, measured): the 0630Z closeout's
  blank (1) — the daytime end-position
  distribution. Over ALL 7,178 evenings: H-IN
  95.6%, H-OUT 0.3%, A 0.8%, B 2.5%, C 0.8%;
  away d>=4 = 240 evenings with CREEK-BLOCKED
  44.6% dominant, CAMPED 43.3%, OUT-AND-NOT-BACK
  10.0%, ROAD 0, OTHER 0.
- Filled (this arm, measured): the per-stack
  contrast — creekseek manufactures more far
  evenings than P1 (134 vs 106) and more creek-
  blocked ones (65 vs 42), because the pre-step
  creek visit moves the departure onto creek
  tiles where the crossing refusal strands it.
- Filled (this arm, measured): the day-bucket
  trend — far endings decline across the window
  (4.8% -> 3.5% -> 1.7%), and H-OUT is a
  late-window class (18/20 in days 21-30).
- Documented (this arm, NOT a fix): the stuck-day
  narration loop (17588 day 26: one blockage line
  x3, nothing else); the silent offer-no night
  (no line says home was unoffered); the creek
  crossing as the daytime binding constraint (the
  step's hop block and the day's walk block are
  the SAME water — fixing one without the other
  leaves the other strand in place).
- Documented (this arm, NOT investigated): whether
  bridges/swimming should be buildable or learnable
  earlier (design question — the creek block is
  doing real work as terrain, and removing it
  casually would change foraging geography, not
  just evenings); why H-OUT concentrates in days
  21-30 (haven-tile combat/entry interruption late
  in the window — a case set of 20, not a rate);
  the exact identity of the 52-each CAMPED counts
  (equal totals, different days — no shared-event
  claim is made).

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars: FOUR OF FOUR MET (gate clean:
  240/240 legs errs 0, 0 surprises, 0 violations,
  totals reconcile; tables 7,178 evenings / 2
  stacks; dominant CREEK-BLOCKED 44.6% >= 30%;
  proof 27/27 + re-readable census). No threshold
  was re-scored mid-run. The fallback was not
  invoked (dominant found on the committed
  corpora; OTHER = 0, so cause-separation did not
  fail).
- PREREG CORRECTION (definition, fixed BEFORE the
  prereg commit, not mid-run): the prereg draft's
  UNPINNED definition first read "a hop distance
  but no tile" — corrected before commit to "a hop
  with NEITHER a day-line distance NOR a cross-
  stack record (distance unknown)". Line-derived
  hops ARE banded by line distance (band exact,
  tile '?'), as offergeo did. Effect on this run:
  nil — UNPINNED = 0 rows either way, and no
  line-derived hop tile ambiguity touches the
  mechanism table (mechanism reads coords only
  through the band, and line-derived hops are all
  Band A).
- INSTRUMENT CORRECTION (found by the proof test,
  fixed BEFORE the judged census): the analyzer's
  first draft returned endpos class/dist/tile but
  NOT coords, so the mechanism classifier read
  endpos coords as undefined and a clean CAMPED
  synthetic case classified AWAY-MOVED. Fixed by
  returning mapPx/mapPy from endposClass (hop snap
  is haven, so coords must travel with the class,
  never be re-read from the snap). The proof test
  now pins this (synthetic CAMPED case + descriptor
  counts morningSameTile 2 / prevSameTile 1). No
  judged number was produced by the broken draft:
  the census ran only after the proof test went
  27/27.
- Descriptor honesty notes for the NEXT run:
  (i) morning-same-tile and previous-endpos-same
  are one fact counted twice for away rows (night
  step moves nothing) — a future arm should report
  one of them, or report the morning-vs-endpos
  MOVE (the 52 moved days) as the primary figure.
  (ii) creek-block-line share equals the
  CREEK-BLOCKED share by priority construction —
  a future arm that wants an independent creek
  measure must report the line's prevalence WITHOUT
  the priority (e.g. creek lines among CAMPED days
  under a camped-first ordering) or not at all.
  (iii) forageTrips > 0 at 96.3% of far days is a
  weak descriptor (the daily counts trips even on
  stuck days, per the 17588 day-26 shape) — it
  should not be read as "far days are productive
  days" without a kcal or haul companion.
- Carried doubt for the NEXT run: the H-OUT
  late-window concentration (20 rows, 18 in days
  21-30); bridge/swim acquisition timing as the
  creek-block lever (what unblocks a creek, and
  when, in the daily record — not the evening
  step); whether camped stretches end by choice
  (a return walk) or by depletion (kcal bleed to a
  forced return — the 17549 days 9-12 arc suggests
  depletion, but one arc is not a rate).

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack, a
per-evening end-position census, departure tiles,
day-bucket trends, or mechanism classes, and it
cannot run creekseek-stack (not in the registry) —
the same declaration every prior strand arm made,
stated in the prereg. The comparison here is
matched seed-day tables across the two stacks on
identical seeds through the new endpos analyzer
(per-stack tables above), never labeled a panel
comparison. No panel result is fabricated; the
panel tool was not invoked on this corpus. No lever
change is panelled here — like the eveningstep arm,
the deliverable is matched tables, stated
explicitly, not silently skipped.

## Telemetry deviation check

Not run by this worker: the telemetry check is the
coordinator's step (loop body step 10, against the
scale-wall baseline with per-seed sweep rows). This
arm's census carries no national/table/wins/exiled
fields, so a telemetry run over it would print the
same missing-field LOUD artifact prior arms
investigated (field absent, not wall moved). Left
for the coordinator with that note.

## Infrastructure findings (for the coordinator — NOT game findings)

1. EPERM flap, ACTIVE this window on /tmp writes:
   node writeFileSync to /tmp failed repeatedly
   (offerygeo's proof test fails at its mkdtemp
   write step, 3/3 attempts, plus safe-commit's
   /tmp index lock: 28 failed attempts before the
   prereg commit landed, and 37 failed attempts —
   a 12-try loop plus 25 tries of a 30-try loop —
   before the evidence commit landed on the next
   try), while shell and python writes to /tmp
   succeeded in the same minutes — the flap is
   per-moment and per-writer, not a full /tmp
   outage. It cleared in two separate later
   windows, one per commit. This
   arm's proof test writes NOTHING to /tmp (pure
   in-memory analyzeInstances wiring) specifically
   so it stays green through the flap; offergeo's
   test, which mkdtemps, will stay red until the
   flap clears — that is an infrastructure artifact,
   not a regression in offergeo's analyzer.
2. Safe-commit index clobber hit the prereg commit
   (main index showed the prereg file staged-as-
   deleted after a correct commit; worktree file
   byte-identical to HEAD, blob hash verified).
   Repaired via `git update-index --add --cacheinfo`
   from the HEAD blob; verified `git status --short`
   (only the two untracked new scripts remained)
   + `git diff HEAD` empty. The commit itself was
   never in doubt (blob 9cded7c9bfa7339c4b3b22c7b0c8da3a267a4a9a
   matches the worktree file).
3. Judged corpora were never staged in /tmp (all
   corpus files are committed evidence; the census
   writer uses tmp+rename inside evidence/).
4. Diff guard at evidence time: `git diff
   --name-only <prereg-base> -- src/ scripts/policies/`
   must show NOTHING (no game code, no existing
   policy file moved under measurement; the only
   new scripts are scripts/analyze-endpos-b.js and
   scripts/test-endpos-b.js, neither under
   scripts/policies/). Verify after the evidence
   commit the same way as the prereg commit.

## Proof

scripts/test-endpos-b.js: pure 27/27 (Manhattan
cases; band boundaries 3/4 and 5/6; endpos-class
cases incl. hop-departure-not-snap, UNPINNED,
line-derived banding, rescued-refused departure,
H-IN/H-OUT splits, guard-away banding, haven-coord
violation flag; mechanism priority ROAD > COMBAT >
CREEK-BLOCKED > CAMPED > OUT-AND-NOT-BACK >
AWAY-MOVED > OTHER; restless != rest descriptor
rule; analyzer wiring on synthetic legs incl.
table reconciliation, mechanism counts, descriptor
counts, bucket totals, errLeg counting).
Census checks: pooled 7,178 evenings = 240 legs
(120 seeds x 2 stacks); per-policy evenings 3,589
+ 3,589; errLegs 0; surprises 0; haven-coordinate
violations 0; class sums = evenings per policy and
pooled (H-IN 6,860 + H-OUT 20 + A 58 + B 183 +
C 57 = 7,178); outcome totals = evenings (755 +
6,109 + 239 + 39 + 2 + 6 + 28 = 7,178); mechanism
classes sum to B + C (107 + 104 + 24 + 4 + 1 + 0
+ 0 = 240); UNPINNED 0; away total 298 =
evaluated 286 + guard-away 12; bucket totals 2,400
+ 2,400 + 2,378 = 7,178 (the 22 shortfall is the
death-aware horizon, 6 village-lost legs).
Reproduction: `node scripts/analyze-endpos-b.js
--census <the 8 corpus dirs in Files>
evidence/2026-11-01/sim-endpos-b-census-pooled.json`
reproduces every table above deterministically.

## Files

- Prereg (binding, before judged censuses):
  evidence/2026-11-01/sim-endpos-b-prereg.md
  (commit 19cd414a5)
- Evidence (this file): evidence/2026-11-01/
  sim-endpos-b.md
- Instruments: scripts/analyze-endpos-b.js,
  scripts/test-endpos-b.js (this arm's instruments
  commit, same branch, message names this arm)
- Census (analyzer output): evidence/2026-11-01/
  sim-endpos-b-census-pooled.json (240 legs, 7,178
  evenings)
- Sense-day dumps (full dayLines + morning/evening/
  next-morning for quoted days):
  evidence/2026-11-01/sim-endpos-b-days-17588-p1.json
  (days 25-26), sim-endpos-b-days-17549-p1.json
  (day 10), sim-endpos-b-days-17576-p1.json (day 16)
- Corpora reused verbatim (committed, not
  re-committed by this arm): the 8 dirs listed in
  the prereg (awayeve pilot+confirm P1/CS,
  offergeo newbase-1/newbase-2 P1/CS)
- No sim-findings.md append by this worker
  (coordinator owns the backlog): out-of-scope
  gaps are noted in the "Blanks" section and in
  the coordinator notes below for the coordinator
  to file.

## Coordinator notes (out-of-scope gaps, for the backlog — NOT filed by this worker)

- Next blanks, in tracker order after this arm:
  (a) bridge/swim acquisition timing as the creek-
  block lever — what unblocks a creek in the daily
  record, and when (the evening hop block and the
  daytime walk block are the same water; a lever
  here touches foraging geography, not just
  evenings); (b) H-OUT late-window concentration
  (20 rows, 18 in days 21-30 — haven-tile
  combat/entry interruption case set); (c) camped-
  stretch endings — choice return vs depletion
  return (17549 days 9-12 suggests depletion, one
  arc is not a rate).
- Supersession notice for the tracker: the
  "why do days rarely end at d<=3" blank is now
  answered — because days end AT home (95.6%
  H-IN), not because they end far. Any tracker
  line implying far endings are the norm is stale;
  the far tail is 3.3% of evenings, creek-blocked
  44.6% of that tail.
- Instrument notice: future endpos/leg censuses
  MUST carry endpos coords with the class (never
  re-read them from the evening snap — a hop snap
  is haven); the offergeo analyzer's departureOf
  remains the departure authority, and this arm's
  analyzer requires it verbatim.
- Infrastructure notice: offergeo's proof test
  currently fails ONLY on its /tmp mkdtemp write
  during this window's EPERM flap (not an analyzer
  regression); this arm's proof test avoids /tmp
  entirely and stays green through the flap.
