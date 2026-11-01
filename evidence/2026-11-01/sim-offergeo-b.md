# sim-offergeo-b — DIAG: offer geometry — haven is offered at 3 tiles and never at 4, and a failed lodge entry costs the inside morning

Run: oversight-flesh-out-loop-b, arm sim-offergeo-b, run
fleshout-loop-b-20261101T0630Z, axis food-economy
(offer geometry + lodge-entry-failure cost). Worktree
sim-offergeo-b, branch sim-offergeo-b. Worktree HEAD at
prereg writing time 4d3868feb; prereg commit 6b743e467
(committed BEFORE any judged census); instruments
commit a094fde24 plus amendment commit a13540f72
(analyzer correction + success-row emission, no
classification change — see metric review). DIAG ONLY
(measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or
existing script. New files only: prereg, offergeo
analyzer + proof test, evidence, compare, censuses,
new-base corpora, day dumps, stderr logs. The
absencehunt driver, creekseek driver, absencehunt
analyzer, awayeve analyzer, eveningstep analyzer, and
strandtile analyzer are REUSED VERBATIM from the base.
This worker does NOT push, bump, verify live, merge
into master, or touch the sibling Loop A tree/branch,
any journey-* tree/branch, or the main tree; the
coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-offergeo-b-prereg.md, commit 6b743e467, written
BEFORE any judged census) set three bars, ALL of which
must hold:

(a) OFFER-BY-DISTANCE TABLE: at least 3 distance
  bands, each n >= 20 pooled, OR a proven statement
  of why a band cannot reach n >= 20 plus new-base
  legs run to close it — PASSED BY MEASUREMENT, not
  by the alternative clause. Pooled over committed +
  two new-base blocks (120 seeds x 2 stacks, 7,178
  evenings): Band A d<=3 n=47, Band B d=4-5 n=182,
  Band C d>=6 n=57 — all three above 20. The
  committed block alone did NOT meet this bar
  (A 4, B 48, C 16); the prereg-authorized new-base
  legs closed both short bands (A 4 -> 47, C 16 ->
  57). No re-banding happened mid-run.
(b) ENTRY-FAILURE COST on at least 5 entry-fail
  evenings (cohort A), with the haven-evening rate
  stated; cohort H reported with its entry-yes count
  or the proven-zero statement — PASSED. Cohort A
  fail n=8 rows (4 underlying seed-day events, each
  seen on both stacks), haven-evening rate 8/8 =
  100% with the definitional note (entry is only
  attempted on the haven tile). Cohort H: hop-entry-
  no 2 rows (17563 day 5, the committed event) vs
  hop-entry-yes 6 rows (4 new-base events) — the
  committed-corpus zero is superseded, not hidden
  (see below).
(c) PROOF TEST green + every census number re-readable
  from a committed corpus file — PASSED.
  scripts/test-offergeo-b.js 29/29 green (Manhattan
  cases incl. (5,3)->(4,4)=2 and (4,3)->(4,4)=1; offer
  classification for every taxonomy outcome; departure
  recovery incl. the woodcarry-departure correction
  and the morning-gate fallback; band boundaries;
  next-morning pairing incl. the day-30 exclusion;
  analyzer wiring on a synthetic corpus dir; haven-
  coordinate violation flag). Census numbers below
  are analyzer output over the committed corpora
  listed in Files; the analyzer is deterministic over
  those files.

GO is therefore the verdict. GO here is still DIAG:
it authorizes NO src/js fix and NO default change.
What the arm delivers is the 0545Z closeout's blank
(1): the offer geometry, measured, and the entry-
failure cost, measured — with two instrument
corrections found and documented mid-run (metric
review), neither of which moves a verdict bar.

## The answer, in one paragraph

Haven is offered at 3 tiles and never at 4. Across
286 evenings on which the step actually evaluates the
offer, the offer rate is 47/47 at Manhattan distance
<= 3 and 0/239 at distance >= 4 — a perfect cliff
that matches the engine's own rule (travelTargets
offers a revealed home tile iff d <= 3) with zero
exceptions on any block or stack. What the offer
buys is usually nothing: 39 of the 47 offered
evenings are hop-REFUSED — the villager is offered
home and blocked on the way, night after night, by a
fallen tree, a washed-out crossing, or a creek in
the hop's path, while a walkable way around exists
in the record and the step does not take it (the
detour gate is OFF). Only 8 offered evenings hop at
all, and 6 of those enter the lodge successfully. A
failed lodge entry, when it happens, costs the
inside morning: entry-fail villagers wake inside
the next morning only 25% of the time against 99.5%
for entry successes, and the one hop-entry failure
(17563 day 5, both stacks) wakes outside on the
haven tile and walks back out the next day — while
hop-entry successes wake inside 6/6 and stay haven
the next evening 6/6. Overnight calories do NOT
separate fail from success (+130 vs +140 on
average): the starving arrival's +1190 overnight
gain is the dawn-feeding trace that low-kcal entry
successes show even more strongly, not an entry
effect. And the haven-evening rate for entry-fail
evenings is 100% — by definition, since entry is
only attempted on the haven tile; the cost lives in
the morning after, not in the evening class.

## Geometry, read off the code (prereg, verified by the data)

- Distance is Manhattan, exactly as nighttravel.js
  computes havenDistance and travelTargets computes
  d. Haven is (4,4): the nighttravel default, the
  MAP.md village coordinate, and the coordinate of
  every haven evening snap — the analyzer asserts
  this, and there are 0 haven-coordinate violations
  in 7,178 evenings.
- The offer rule in code: a home tile is offered iff
  d > 0 AND (d <= 3 AND tile.revealed OR d === 1).
  The census cannot see "revealed" directly, but the
  observed cliff (47/47 vs 0/239) is consistent with
  haven being revealed in all these legs — no
  d<=3 evening was ever unoffered, so no hidden
  unrevealed-haven case appears.
- Departure = the villager's map position when
  nightStep starts. Recovery (prereg, corrected —
  see metric review): offer-no / guard evenings use
  the evening snap (the step moves nothing);
  travel-refused evenings use the woodcarry
  classification.departure (the step's own record);
  hop evenings use the creekseek cross-stack pin
  when the morning gate passes, else the day-line
  hop distance (band exact, tile unpinned).

## Offer-by-distance table (pooled, 120 seeds x 2 stacks)

| band | n | offered | offer rate |
|---|---|---|---|
| A d <= 3 | 47 | 47 | 100% |
| B d = 4-5 | 182 | 0 | 0% |
| C d >= 6 | 57 | 0 | 0% |
| TOTAL evaluated | 286 | 47 | 16.4% |

By stack: P1 138 evaluated, 32 offered (all Band A);
creekseek 148 evaluated, 15 offered (all Band A).
By block: committed 68 evaluated / 4 offered; newbase-1
64 / 17; newbase-2 154 / 26. The cliff holds on every
block and both stacks — no block, stack, or seed
breaks it.

## Departure-tile table (pooled; full table in the census JSON)

Offered tiles (all d <= 3) — tile (n, offered, kinds):
- (4,1) grove: 7, 7, hop-refused 7 (one villager,
  17567, stuck 7 nights)
- (4,2) grove: 5, 5, hop-refused 5 (17567, 5 more
  nights at the next grove)
- (4,2) meadow: 10, 10, hop-refused 10 (17637, 5
  nights x 2 stacks)
- (3,2) forest_floor: 5, 5, hop-refused 5 (17629,
  5 nights)
- (2,3) creek: 8, 8, hop-refused 8 (17631, 4 nights
  x 2 stacks)
- (5,3) forest_floor: 3, 3, hop-refused 2 +
  hop-yes-entry-no 1 (17563 days 4-5)
- (3,3) meadow: 2, 2, hop-refused 2 (17606 day 4,
  retry-rescued — see below)
- (4,3) forest_floor: 1, 1, hop-yes-entry-yes 1
  (17576 day 16 P1)
- (4,3) grove: 1, 1, hop-yes-entry-yes 1 (17650 day
  19 P1)
- (4,3) tile-unrecorded: 2, 2, hop-yes-entry-no 1
  (17563 day 5 CS) + hop-yes-entry-yes 1 (17650 day
  19 CS) — creekseek arrival records carry no tile
- (4,2) tile-unrecorded: 1, 1, hop-yes-entry-yes 1
  (17576 day 16 CS)
- unpinned: 2, 2, hop-yes-entry-yes 2 (17576 day 24
  P1, morning-gate failed; 17629 day 25 CS, no cross
  record) — distance from the day line (1 and 2),
  tile honestly unpinned
Unoffered tiles (all d >= 4, offer-no only): (0,5)
forest_floor 22 + grove 28; (3,0) creek 16 +
forest_floor 14; (1,1) creek 14; (2,0) creek 10 +
grove 11; (1,2) forest_floor 18 + creek 5; (3,1)
creek 12; (6,7) forest_floor 6; (2,6) creek 6 +
forest_floor 14; (1,7) creek 6; (2,2) creek 4 +
forest_floor 7; (2,1) creek 7; (1,5) forest_floor 8;
(1,0) forest_floor 4; (4,0) creek 2; (5,0)
forest_floor 2; (5,1) forest_floor 8; (2,7) creek 1;
(8,2) forest_floor 12; (8,5) forest_floor 2.
No tile appears on both sides of the offer line:
every tile's offered share is 0% or 100%, and the
split is exactly the d<=3 boundary. (Tile (0,5)
appears as both forest_floor and grove across seeds
because different seeds generate different ground at
the same coordinate — the tile KIND varies by seed,
the distance does not.)

## Offered evenings: refused is the modal outcome

Of 47 offered evenings: hop-refused 39 (83%),
hop-yes 8 (17%). Refusals are sticky, not scattered:
the same villager is refused night after night at
the same tile — 17567 at grove (4,1) days 5-11 then
(4,2) days 19-23 (12 refusals, one fallen_tree at
(4,3) intermediate, 5-step and 4-step routes around
it in the record, never walked); 17637 at meadow
(4,2) 5 nights x 2 stacks; 17629 at (3,2) 5 nights;
17631 at creek (2,3) 4 nights x 2 stacks. Refusal
blockages (woodcarry classification, all 39):
fallen_tree intermediate 27, washed_out intermediate
8, creek intermediate 4. Every refusal is an
INTERMEDIATE block — the hop's path box, never the
destination. The step offers, the hop hits the
block, the wrapper may build a bridge and retry
(17606 day 4: the retry SUCCEEDS — the villager
ends the evening at haven inside, while the step
record still reads travel-refused), and otherwise
the villager sleeps where she stood. The evening
step's systematic work, on this corpus, is offering
home to villagers who cannot use the offer — not
because home is far, but because something lies
across the single hop.

## Entry-failure cost (cohorts kept separate)

COHORT A — all haven-tile evenings by entry outcome
(pooled): fail n=8 rows, success n=6,864 rows.
Fail rows (4 events x 2 stacks): 17563 day 5
walk-no-path after a hop; 17569 day 25, 17625 day
20, 17626 day 27 walk-interrupted-combat after a
daytime arrival. No no-go-inside-button, no
entry-refused anywhere in 7,178 evenings.
- Haven-evening rate, fail: 8/8 = 100% —
  DEFINITIONAL (entry is only attempted on the
  haven tile; a fail evening IS a haven evening by
  construction). The empirical cost is below, not
  here.
- Still at haven next morning: fail 8/8 = 100%,
  success 100% — entry failure never costs the
  haven morning position.
- Inside next morning: fail 2/8 = 25%, success
  99.5% (6,600/6,631 with next morning). THIS is
  the cost. The 2 inside mornings are the 17569
  pair — where the villager's vessel CHANGED
  overnight (succession after the combat-
  interrupted night: evening inCombat true, detail
  (4,5) lodge-adjacent, morning vessel different,
  morning inside true). The other 6 fail rows wake
  outside on the haven tile.
- Vessel same next morning: fail 6/8 = 75%,
  success 98.9%.
- Next evening haven: fail 6/8 = 75%, success
  99.1%. The 2 away next evenings are the 17563
  pair: she walks back out the morning after the
  failed-entry night and ends day 6 at the (2,0)
  creek, offer-no.
- Next evening inCombat: fail 0/8, success 0.5%.
- Mean overnight kcal delta: fail +130, success
  +140 — NO separation. Fail deltas: +1190, +1190,
  +200, +200, -1117, -1117, +246, +246. Success
  deltas by evening kcal: 51-200 kcal n=2 mean
  +2083; 201-500 n=2 mean +1815; 501-1200 n=240
  mean +1258; 1201-2400 n=6,387 mean +97. (No
  success row ends an evening at <= 50 kcal in
  6,864 rows — haven evenings are fed evenings.)
  The +1190 on 17563 is therefore the starvation/
  dawn-feeding trace — a villager who arrives home
  at 0 kcal wakes fed — not an entry effect. Any
  future claim that entry failure "costs calories"
  must reckon with this scan: calories track
  evening hunger, not entry outcome.
COHORT H — hop arrivals only (pooled): hop-entry-no
2 rows (17563 day 5, 1 event) vs hop-entry-yes 6
rows (4 events: 17576 day 16 both stacks, 17576 day
24 P1, 17650 day 19 both stacks, 17629 day 25 CS).
- Hop-entry-no next morning: inside 0/2, vessel
  same 2/2, next evening away 2/2, overnight delta
  +1190 (from 0 kcal).
- Hop-entry-yes next mornings: inside 6/6, vessel
  same 6/6, next evening haven 6/6, overnight deltas
  from evening kcal 140-2,352 (17650 day 19 at 140
  kcal still wakes inside and stays haven — the
  inside morning separates even at low kcal).
- Eveningstep's committed-corpus zero
  (hop-yes-entry-yes = 0) is SUPERSEDED on new-base
  legs, not contradicted: on the committed corpora
  the zero is still true (2 hop rows, both entry-
  no); on new-base legs hops enter successfully 6
  of 6 times. The honest pooled rate is hop-entry
  failure 2/8 = 25% — on one event, so a case rate,
  not a population rate.

## SENSE TEST (law) — PASS, with the silence stated

Read end to end from the corpora (day dumps in
Files): 17563 days 4-6 (P1), 17563 day 5 (CS),
17549 days 9-12 (P1).

- OFFER DAY, hop-yes + entry-fail (17563 day 5,
  P1): foraging the same floor she slept on,
  learning a counter from Salvador, then "Travel 2
  tiles to Haven." and "You come home after 2 days.
  The smell of the cookfire does something to your
  chest you don't examine. 'You're thinner,'
  someone says. 'You're still here,' you say."
  Then the fire-side lines ("Someone by the fire
  nods at the counter. 'We pool food here. Keep
  what you need for the road — the rest feeds
  everyone, once it's food.'") and TWELVE identical
  "Need N kcal, have 0. Eat first." refusals (10,
  4, 6, 6, 8, 8, 10, 10, 10, 10, 12, 12) — the
  homecoming reads as a person, the twelve refusals
  read as a loop, and they fire while inside is
  FALSE (walk-no-path): fire-side dialogue on an
  outside-haven evening, the #1660 class eveningstep
  flagged, now with the cost attached (she wakes
  outside and leaves the next day).
- OFFER DAY, hop-refused (17563 day 4, P1): a day
  of foraging, meeting Nathan and Faten ("'Nathan,'
  they say, touching their chest. 'I'm Nathan.'
  You'll remember that."), learning Green Thumb,
  building a bridge ("You lash logs together. A
  rough bridge spans the gap."), a stripes fight
  ending via the barrier ("Not mid-fight — the
  barrier is the way out."), then the step's own
  line: "The bridge stands, but the way home still
  refuses — block:creek." The refusal is narrated
  honestly — the one offered-and-blocked night in
  the corpus that TELLS you it was blocked. (The
  39 pooled refusals mostly do NOT get this line:
  on 17567's 12 grove nights the refusal is silent
  in the day lines; only the woodcarry record says
  fallen_tree. The day-4 narration is the
  exception, not the rule.)
- OFFER DAY, hop-yes via creek (17563 day 5, CS):
  the same day through the visit — "Travel 1 tile
  to creek. / Cold, clear, moving. The best thing
  you've seen all day." / "You make for the creek
  to drink before night." / "Travel 1 tile to
  Haven." — then the same homecoming line and the
  same twelve refusals. The visit shortens the hop
  from 2 tiles to 1; it changes nothing else about
  the evening, including the entry failure.
- REFUSAL DAY, offer-no (17563 day 6, P1): she
  wakes at haven (4,4), kcal 1190, takes wood "for
  the road home," learns Old World Caches, walks
  out through forest floor, wetland, and creek
  ("Travel 1 tile to creek. / The creek braids
  around gravel bars."), meets Natalie and Priya,
  runs Marisol's errand ("Marisol wants to know
  what's by the creek. 'Just look. Come back and
  tell me.'"), and ends at the (2,0) creek,
  out-of-reach. No line in the day says home was
  unoffered — the offer-no night is silent, as
  eveningstep noted. The day itself reads as a
  person doing errands and getting caught out; the
  step's silence is a narration gap, not a sense
  failure.
- REFUSAL DAYS, offer-no (17549 days 9-11, P1):
  day 9 walks out from haven to (6,7) ("Travel 3
  tiles to forest floor." ... "Stonebridge's
  clearing. Voices, a cookfire, somebody else's
  home. You're a guest here — act like it."),
  learns a Living Wire counter, and ends at (6,7);
  days 10-11 barely move ("Travel 2 tiles to
  forest floor." x2; "Travel 1 tile to forest
  floor." x2) and end at the same (6,7), offer-no
  each night, kcal bleeding 681 -> 201 -> 39
  across the mornings. Day 12 walks home in
  daylight ("Travel 2 tiles to Haven." / "Haven. 4
  days. The palisade looks smaller than you
  remembered, or you got bigger. Somebody by the
  fire: 'Knew you'd walk back in. You always
  do.'"). Three silent unoffered nights, then a
  daylight walk — no evening magic, just a person
  deciding the day's walk ends at home. The stuck
  days read as stuck, not as broken: the kcal
  bleed is the pressure, the walk home is the
  release.

## Villager behavior sample (beyond the sense days)

Out of the read days and the refusal clusters:
goals (forage named patches, learn counters, run
named errands — Marisol's creek look, Sari's creek
witness); routines (daily foraging loops; woodpile
draws "for the road home" every haven morning;
garden work noted on other seeds); dialogue with
consequences (introductions that stick as names —
Nathan, Faten, Natalie, Priya; counter-teaching
from Salvador; homecoming lines that differ by
absence length — "after 2 days" vs "4 days").
Robotic / repeated texture, flagged: the triple
blocked-crossing line (17563 days 6-8 mornings);
the x12 "Eat first" refusals; the repeated owl
tease ("It waits for YOU to come close — the
stillness is the trap.") verbatim across days;
the silent offer-no and (usually) silent
hop-refused nights. Nothing here suggests
villagers choosing non-personally; the robotic
surface is narration templates and missing
refusal lines, as in awayeve and eveningstep.

## Reachability verdict

The evening hop is reachable but narrow: 8 hops in
286 offer-evaluated evenings (2.8%), 6 of them
entering successfully. The offer itself is the
narrower gate in one direction (only d<=3
departures are ever offered) and a wide gate in
the other (every d<=3 departure IS offered — the
step never withholds an in-range offer on this
corpus). Reachability of waves/Arcs/table is NOT
re-measured by this arm (a per-evening census, not
a reachability sweep); awayeve's 30d pre-seat leg
numbers stand (wave 1: 18 legs, wave 2: 72, wave 3:
6, wave 4: 0, wave 5: 0). What this arm ADDS to
reachability: no content beyond d=3 can EVER be
reached by the evening step — any villager ending
a day at d>=4 is, by engine rule, sleeping out
unless the daytime itinerary walks her home. The
evening step is a 3-tile net, not a rescue service.

## Village assessment, in plain words

Picture the village at nightfall. Anyone who ended
the day within three tiles of home gets the offer:
the step looks at where she stands, and if home is
close enough it tries one honest walk home. Most
nights that walk is blocked — a fallen tree across
the path, a washed-out crossing, a creek running
fast — and the villager sleeps where she stood,
sometimes for seven nights running at one grove
and five more at the next, while the record quietly
notes a way around that nobody walks. Sometimes the walk works, and
then the door usually opens: six times out of eight
she steps into the hall, wakes inside, and stays
the next evening too. Twice — once, on one seed,
seen from both sides — the door does not open: she
sleeps on the haven ground outside the hall, wakes
outside, and walks back out the next morning as if
the homecoming had not quite happened. And anyone
who ended the day four tiles or farther out gets
nothing at all, no line, no offer — she just sleeps
out there, and the step does not even mention home.
That is the whole offer geometry: a three-tile net
that catches whoever is close, mostly trips on
something in the path, and never reaches farther
than three tiles no matter how the night goes.

## Wall numbers (observed on these legs, report-only)

NOT measured by this pre-seat census: national /
table / wins — no such fields exist in these
corpora, so no values are reported for them (never
invented, never zero-filled). What WAS observed on
the new-base legs (192 legs, 30d window, horizon-
capped): maxWaveUnlocked wave 1: 39, wave 2: 139,
wave 3: 14, wave 4: 0, wave 5: 0; endReason
survived 188, village-lost 4; median daysAlive 30
(the window cap, not a survival median — every
surviving leg runs the full 30 days by construction).
The wave wall is unchanged on these legs: wave 3
reached, wave 4 never unlocked in-window.

## Blanks filled or documented

- Filled (this arm, measured): the 0545Z closeout's
  blank (1) — offer geometry. Offered iff d<=3
  (47/47 vs 0/239), by departure tile and by band,
  on 286 evaluated evenings across 120 seeds x 2
  stacks, with the engine rule cited and zero
  exceptions.
- Filled (this arm, measured): the entry-failure
  cost. Cohort A n=8 (haven rate 100%
  definitional; inside-next-morning 25% vs 99.5%;
  overnight kcal NOT separated, with the kcal-band
  scan proving the separation is evening hunger,
  not entry). Cohort H: hop-entry failure 2 rows
  (1 event) vs hop-entry success 6 rows (4 events)
  — the committed-corpus zero superseded by
  new-base evidence, stated as supersession.
- Filled (this arm, measured): the refusal
  mechanism. All 39 refusals are intermediate-leg
  blocks (fallen_tree 27, washed_out 8, creek 4);
  route-around paths exist in the records and are
  never walked (detour gate OFF); the wrapper
  retry rescues exactly 1 refused shape (17606 day
  4, both stacks) and that rescue is now measured
  rather than hidden in the evening snap.
- Filled (this arm, measured): the P1-vs-creekseek
  offer contrast. P1 offers 32/138 evaluated;
  creekseek 15/148 — the pre-step creek visit moves
  the departure tile and usually moves the offer
  away with it (contrast reported, mechanism not
  proven beyond the departure move itself).
- Documented (this arm, NOT a fix): the silent
  offer-no night and the usually-silent hop-refused
  night (17563 day 4's "The bridge stands, but the
  way home still refuses" line is the exception);
  fire-side dialogue on an outside-haven evening
  (17563 day 5, #1660 class, now with its cost:
  wakes outside, leaves next day); the hop's cause
  invisible in narration (the homecoming line does
  not distinguish a step hop from a daytime walk —
  only travelledHome does).
- Documented (this arm, NOT investigated): why
  competent.daily so rarely ends days at d<=3 away
  (Band A evenings are refusals and hops, almost
  never fresh arrivals — the daytime end-position
  distribution is the next question, and the offer
  table alone cannot answer it because it
  conditions on step-evaluated evenings); the
  17569 overnight succession after a combat-
  interrupted entry (vessel changed, morning inside
  true — a death-or-succession story the corpus
  does not fully tell); whether the fallen_tree /
  washed_out intermediate blocks on the hop path
  should be clearable at night (design question —
  the step offers, the block refuses, the bridge
  exists for creeks only in the retry path).

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars: THREE OF THREE MET (bands A 47 /
  B 182 / C 57, all >= 20 pooled; entry-fail n=8
  with haven rate stated; proof 29/29 + re-readable
  censuses). No threshold was re-scored mid-run.
  The committed block alone failed bars (a) on A
  and C and bar (b) on count (2 rows); the prereg-
  authorized new-base legs (2 blocks, 96 seeds x 2
  stacks) closed all three gaps. That is the prereg
  working as written, not a rescue.
- CORRECTION 1 (instrument, documented not hidden):
  the prereg's departure rule ("non-hop evenings =
  evening snap") is WRONG for travel-refused
  evenings whose wrapper retry succeeds. Found on
  new-base seed 17606 day 4 (both stacks): step
  record travel-refused from meadow (3,3), evening
  snap haven (4,4) inside true — the retry hop
  after bridge-building rescued her, and the snap
  is the rescued position. The analyzer now prefers
  the woodcarry classification.departure for refused
  evenings (the step's own record, same principle as
  eveningstep's step-record-over-snap ruling). Effect:
  2 rows moved from (4,4) d0 to (3,3) d2; band
  counts unchanged (both Band A); the (4,4)-as-
  departure artifact is gone. The prereg file itself
  is NOT rewritten — this section is the correction
  record, and the analyzer comment cites it.
- CORRECTION 2 (instrument): the creekseek-from
  cross-stack pin for P1 hop rows is valid ONLY
  under the morning gate (same seed-day morning
  snaps agree on tile, map position, vessel).
  Found on new-base seed 17576 day 24 (P1 morning
  grove (3,4), CS morning haven (4,4) — diverged):
  the ungated pin would have reported a d0 hop from
  haven itself, which is nonsense (a villager at
  haven needs no hop). Gated, the row falls back to
  the day-line distance 1 with tile unpinned. Effect:
  1 row's tile unpinned (band unchanged); the
  17563 day-5 and 17576 day-16 pins pass the gate
  and stand. A further consequence, stated plainly:
  the eveningstep arm's (5,3) attribution for 17563
  day 5 survives this gate (both stacks' day-5
  mornings are (5,3) forest_floor), so that prior
  finding is corroborated, not just repeated.
- Prereg doubt RESOLVED AGAINST the prereg's guess:
  Band A was expected to be structurally unfillable
  (offered evenings convert or refuse, so the band
  "can only ever contain hop-refused, guard, and
  hop-converted evenings"). The data fills it anyway
  (47 rows) — because refusals CLUSTER: one stuck
  villager contributes 12 refused evenings. Band A
  is fillable by stuck campers, not by hops. The
  prereg's alternative clause was therefore never
  needed; the band table is a measurement, not a
  structural excuse.
- Whether cohort A entry-fail evenings are a fair
  cost comparator for cohort H: NO, not directly —
  cohort A mixes 6 daytime-arrival combat-
  interrupted evenings with 2 hop arrivals, and
  their next mornings differ (combat nights end in
  succession or outside-waking by different paths).
  The evidence reports both cohorts side by side
  and never substitutes cohort A's deltas for
  cohort H's cost. Cohort H's cost, on 1 failure
  event vs 4 success events, is a case comparison
  with a following morning, not a rate.
- Whether overnight kcal delta measures entry cost:
  NO — the kcal-band scan (above) shows delta
  tracks evening hunger (low-kcal rows gain most
  overnight on both cohorts). A future cost arm
  must stratify by evening kcal before claiming any
  kcal effect, or drop kcal from the cost set.
- Unobservable, confirmed: HP, energy/rest quality,
  disease/exposure — no corpus snap carries such a
  field, so no such cost is claimed. ADDITIONAL
  unobservable found: next-MORNING inCombat — the
  morning snap carries no inCombat field, so prereg
  dimension 5 is reported via the FOLLOWING
  EVENING's inCombat flag, labeled as such, never
  presented as a morning flag. Next-morning
  gameOver is likewise unobservable except as
  absence (no following morning exists); no fail
  row lacked a following morning except by the
  day-30 exclusion (0 fail rows excluded on day 30
  in the pooled set — all 8 have next mornings).
- Whether creekseek arrival tiles are known: NO —
  the creekseek arrival record carries mapPx/mapPy
  but no tile, so CS hop rows report tile as
  unrecorded (distance exact, tile "?"). Pooled
  tile rows marked "?" (4 rows) are exactly these.
  Unpinned hop tiles (2 rows) are the morning-gate
  failures and the no-cross-record case, flagged
  per row in the census.
- Carried doubt for the NEXT run: the daytime
  end-position distribution (where do days END, by
  distance — the question the offer table conditions
  away); the 17569 succession story (what exactly
  happens on a combat-interrupted entry night);
  whether intermediate-block clearing belongs in
  the evening step at all (the step offers, the
  block refuses, the way around sits unused — a
  design question for the coordinator's backlog,
  not a finding of this arm).

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack, a
per-evening offer-geometry census, departure tiles,
entry-failure cohorts, or policies that are not in
the registry (creekseek-stack, nighttravel-stack as
a census stack) — the same declaration every prior
strand arm made, stated in the prereg. The
comparison here is matched seed-day tables across
policies on identical seeds through the new offergeo
analyzer, attached as evidence/2026-11-01/
sim-offergeo-b-compare.md, never labeled a panel
comparison. No panel result is fabricated; the panel
tool was not invoked on this corpus. No lever change
is panelled here — like the eveningstep arm, the
deliverable is matched seed-day tables, stated
explicitly, not silently skipped.

## Telemetry deviation check

Not run by this worker: the telemetry check is the
coordinator's step (loop body step 10, against the
scale-wall baseline with per-seed sweep rows). This
arm's censuses carry no national/table/wins/exiled
fields, so a telemetry run over them would print
the same missing-field LOUD artifact prior arms
investigated (field absent, not wall moved). Left
for the coordinator with that note.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit all three commits
   in this arm so far (prereg, instruments, and the
   pending evidence commit — verify after it the
   same way: `git status --short` empty + `git diff
   HEAD` empty + hash-object matches HEAD blobs).
   The commits themselves were never in doubt (blob
   hashes match). Repair each time via `git
   update-index --add --cacheinfo` from HEAD blobs.
2. EPERM flap: NOT observed on file writes in this
   window (all sim transports, splits, and census
   writes landed first-try).
3. New-base block 2's creekseek legs ran slow
   (48 seeds in ~13 min vs ~5 min for block 1's
   creekseek legs — long-fight seeds, not a stall:
   stderr shows steady per-seed completion through
   17652 before the final seeds). No action needed.
4. Judged corpora were never staged in /tmp (all
   jsonl lived in evidence/ and was deleted after
   split, per the rule — no .jsonl leftovers of
   this arm at evidence time).
5. Diff guard at evidence time: `git diff
   --name-only <prereg-base> -- src/ scripts/policies/`
   must show NOTHING (no game code, no existing
   policy file moved under measurement; the only
   new scripts are scripts/analyze-offergeo-b.js
   and scripts/test-offergeo-b.js, neither under
   scripts/policies/).

## Proof

scripts/test-offergeo-b.js: pure 29/29 (Manhattan
cases; offer classification for every taxonomy
outcome; departure recovery incl. woodcarry-
departure correction + morning-gate fallback; band
boundaries; cohort split; next-morning pairing incl.
day-30 exclusion; analyzer wiring on a synthetic
corpus dir; haven-coordinate violation flag).
Census checks: pooled 7,178 evenings, 286 evaluated,
47 offered, 0 surprises, 0 haven-coordinate
violations; band sums equal evaluated on every
block and stack (A+B+C = evaluated, per policy and
pooled); offered kinds sum to offered (39 refused +
6 hop-yes-entry-yes + 2 hop-yes-entry-no = 47);
entry cohorts sum (8 fail + 6,864 success = 6,872
haven-tile entry-leg evenings; the rest of the 7,178
is guard 28 + offer-no 239 + hop-refused 39 = 306,
and 6,872 + 306 = 7,178 exactly);
committed block reproduces eveningstep's counts
exactly (P1 away-step 32 = 30 offer-no + 1 hop-no +
1 hop-yes; CS 36 = 34 + 1 + 1; entry-only 680/676;
guard-combat 2/2 on the committed block).
Pilot gate: pilot corpora (8 seeds per stack,
17543-17550 — pilot P1/CS evaluated 21/21, 0
surprises, 0 violations) passed before the confirm
corpora were spent; confirm reproduced the pilot's
instrument behavior (0 surprises, 0 violations)
before the new-base blocks were spent.

## Files

- Prereg (binding, before judged censuses):
  evidence/2026-11-01/sim-offergeo-b-prereg.md
  (commit 6b743e467)
- Evidence (this file): evidence/2026-11-01/
  sim-offergeo-b.md
- Compare (matched seed-day tables, not a panel
  comparison): evidence/2026-11-01/
  sim-offergeo-b-compare.md
- Instruments: scripts/analyze-offergeo-b.js,
  scripts/test-offergeo-b.js (instruments commit
  a094fde24; amendment commit a13540f72 —
  woodcarry-departure correction, morning gate,
  success-row emission)
- Censuses (analyzer output): evidence/2026-11-01/
  sim-offergeo-b-census-committed.json (24 seeds x
  2 stacks), sim-offergeo-b-census-newbase.json
  (48 seeds 17567-17614 x 2 stacks),
  sim-offergeo-b-census-newbase2.json (48 seeds
  17615-17662 x 2 stacks),
  sim-offergeo-b-census-pooled.json (120 seeds x 2
  stacks, 7,178 evenings)
- New-base corpora (verbatim drivers, this base):
  evidence/2026-11-01/sim-offergeo-b-corpus-newbase-
  p1-30d (48 files), sim-offergeo-b-corpus-newbase-
  creekseek-30d (48 files),
  sim-offergeo-b-corpus-newbase2-p1-30d (48 files),
  sim-offergeo-b-corpus-newbase2-creekseek-30d (48
  files); stderr logs sim-offergeo-b-newbase-p1/
  cs.stderr.log, sim-offergeo-b-newbase2-p1/
  cs.stderr.log (all seeds errs=0)
- Sense-day dumps (full dayLines + morning/evening/
  next-morning for quoted days):
  evidence/2026-11-01/sim-offergeo-b-days-17563-p1
  .json (days 4-6), sim-offergeo-b-days-17563-cs.json
  (day 5), sim-offergeo-b-days-17549-p1.json (days
  9-12)
- No sim-findings.md append by this worker
  (coordinator owns the backlog): out-of-scope
  gaps are noted in the "Blanks" section and in
  the coordinator notes below for the coordinator
  to file.

## Coordinator notes (out-of-scope gaps, for the backlog — NOT filed by this worker)

- Next blanks, in tracker order after this arm:
  (2) 17549 death-cause (dies P1/CS day 24, BARE
  day 18, survives P3); (3) H5/H6 refusal cells,
  still UNRUN; (4) patrol-departure narration
  (design surface); (5) a 120d window only if a
  new horizon-cut episode appears.
- New candidates from this arm: the daytime
  end-position distribution by distance (why Band A
  evenings are refusals/hops, almost never fresh
  arrivals — the offer table conditions on
  step-evaluated evenings and cannot answer where
  days end); the silent offer-no / usually-silent
  hop-refused nights (narration gap — 17563 day 4
  proves the line exists for creek blocks);
  intermediate-block clearing at night (the step
  offers, the block refuses, the way around sits
  unused — design question, detour gate OFF by
  design); the 17569 succession story (combat-
  interrupted entry night, vessel changed by
  morning).
- Supersession notice for the tracker: eveningstep's
  "hop-yes-entry-yes = 0" now reads "0 on committed
  corpora, 6 on new-base legs (pooled hop-entry
  failure 2/8)". Any tracker line quoting the zero
  without the new-base qualifier is stale.
- Instrument correction notice: future offer/leg
  censuses MUST use the woodcarry
  classification.departure for travel-refused
  evenings (not the evening snap — retry rescues
  move the villager after the step) and MUST gate
  cross-stack pins on morning-snap agreement.
  Both corrections are in scripts/analyze-
  offergeo-b.js with proof-test cases.
