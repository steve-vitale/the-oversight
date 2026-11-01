# sim-eveningstep-b — DIAG: the evening step, leg by leg — the hop decides, the entry does not, and most "evening-step" homecomings are daytime walks

Run: oversight-flesh-out-loop-b, arm sim-eveningstep-b, run
fleshout-loop-b-20261101T0545Z, axis food-economy
(evening-step leg decomposition). Worktree sim-eveningstep-b,
branch sim-eveningstep-b. Worktree HEAD at prereg writing
time 2debb6756. DIAG ONLY (measurement): zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. New files only:
prereg, eveningstep analyzer + pure proof test, evidence,
compare, censuses, drift-check corpora. The absencehunt
driver, creekseek driver, absencehunt analyzer, awayeve
analyzer, confirmednight analyzer, and strandtile analyzer
are REUSED VERBATIM from the base. This worker does NOT
push, bump, verify live, merge into master, or touch the
sibling Loop A tree/branch, any journey-* tree/branch,
or the main tree; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator
merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-eveningstep-b-prereg.md, commit 3c6b08d13, written
BEFORE any judged leg and before any drift-check leg)
set four bars, ALL of which must hold:

(a) PAIR 0 COMPLETE: 17563 day 5 fully decomposed on
  P1 vs BARE vs creekseek, deciding leg named, with a
  transcript quote for each leg — PASSED. Deciding
  leg: L3 HOP (see below). Day 4 (travel-refused
  context) and the [4-9] episode context (days 6-9)
  are decomposed alongside.
(b) TWO MORE PAIRS: pairs 1 (17549 day 12) and 2
  (17549 day 6), selected by the prereg's rules,
  decomposed the same way, each with its deciding leg
  named and transcript quotes — PASSED. Deciding
  legs: daytime-divergence on BOTH (see below).
(c) INSTRUMENT COMPLETENESS: every evening in every
  judged pair day carries exactly one leg path, zero
  UNISOLATED pairs, zero instrument-surprise outcomes
  on judged pair days — PASSED. Pooled leg-path
  census over all 2,856 awayeve evenings: surprises 0.
(d) SENSE PASS: the decomposed days read end to end
  as a person coming home or failing to come home —
  PASSED, with two honesty gaps stated, not hidden
  (see sense test).

GO is therefore the verdict. GO here is still DIAG:
it authorizes NO src/js fix and NO default change.
What the arm delivers is the decomposition the 0435Z
closeout's blank (1) asked for: which evening-step
leg moves a seed's evenings, shown on three
seed-day pairs with transcript evidence, plus a
pooled leg-path census that bounds how far the
answer generalizes.

## The answer, in one paragraph

On the only same-morning-tile evening-hop conversion
in 24 seeds, the HOP decides and the lodge entry does
not: on 17563 day 5 the evening step offers haven,
the hop moves the villager from (5,3) to the haven
node, the lodge entry then FAILS (walk-no-path, she
sleeps outside on the haven tile) — and the evening
is still a haven evening, because the census's
atHaven is position-based. The entry leg is never
necessary for a haven evening; only the hop is. And
the hop almost never fires: across the whole pooled
corpus the evening hop converts exactly ONE evening
in 714 (17563 day 5 itself), and NO hop on this
corpus is ever followed by a successful lodge entry
(L3-hop-yes-entry-yes = 0). The other two judged
pairs show the opposite shape: 17549's episode end
(day 12) and its day-6 contrast are DAYTIME walks
home — "Travel 2 tiles to Haven." in the day's own
lines, evening entry only, travelledHome false —
so the evening step moved nothing on those days,
and reading them as evening-step conversions would
be wrong. The evening step's systematic work on this
corpus is not bringing villagers home; it is
ATTEMPTING to, night after night, and being told
home is not offered (30/31 P1 away nights are
offer-no, 1 is hop-no).

## Leg taxonomy used (code branches, not invented classes)

From scripts/policies/nighttravel.js nightStep and
scripts/policies/insideevening.js eveningStep, in
code order: L1 guard (game-over / blocked-combat /
blocked-tent — no travel, no entry); L2 offer (haven
in travelTargets? no -> out-of-reach, sleep away);
L3 hop (one travelTo, judged by position change:
refused -> travel-refused; moved -> travelledHome);
L4 entry (lodge walk + 'Go inside': completed /
already-inside, or walk-no-path / no-go-inside-button
/ entry-refused / walk-interrupted-combat); L5
wood-wrapper daytime costs (morning carry pre-daily
only from haven; evening bridge post-daily only on
travel-refused evenings; warmth post-daily only on
travel-refused creek evenings); LX other
(travel-arrived-combat, travel-died, haven-unknown,
step-error, detour-* — the detour gate is OFF).
Each corpus outcome is reachable by exactly one
branch, so outcome + travelledHome + positions
recovers the leg path exactly. One implementation
note, stated because it bounds a claim: the
corpus's havenPx/havenPy are null, so atHaven's
third clause (map position equals the village node)
never fires in this corpus; node evenings are
covered by tile 'haven' instead. No judged pair is
affected (every judged haven evening carries tile
'haven').

## Pooled leg-path census (awayeve corpora, 24 seeds x 30d)

| policy | evenings | L4-entry-only | L2-offer-no | L3-hop-no | L3-hop-yes-entry-no | L1-guard-combat | L0-no-step | travelledHome |
|---|---|---|---|---|---|---|---|---|
| P1 | 714 | 680 | 30 | 1 | 1 | 2 | 0 | 1 |
| creekseek | 714 | 676 | 34 | 1 | 1 | 2 | 0 | 1 |
| BARE | 708 | 0 | 0 | 0 | 0 | 0 | 708 | 0 |
| P3 | 720 | 0 | 0 | 0 | 0 | 0 | 720 | 0 |

Cross-checks: P1 away evenings 31 = 30 offer-no + 1
hop-no; creekseek away 35 = 34 offer-no + 1 hop-no
— exact agreement with awayeve's away counts, now
split by leg instead of by end-cause. Creekseek's
+4 offer-no over P1 is exactly the extended 17563
episode (days 9-12 at the (2,0) creek, where P1's
camper had already died). The 2 guard-combat
evenings per stack (17546 day 28, 17559 day 30,
same seed-days on both stacks) are HAVEN evenings
with a fight live at step time: the guard leg fires
on haven days too, and the evening stays haven by
position. Zero surprises anywhere: no detour, no
haven-unknown, no step-error, no unknown outcome
in 2,856 evenings.

## PAIR 0 — 17563 day 5: the hop decides, the entry fails, the evening is haven anyway

Same vessel gen_ocpths4. Morning tile matches on
all three policies — forest_floor (5,3) — while
morning kcal/ticks already diverge (P1/CS 0 kcal,
256 ticks; BARE 207 kcal, 384 ticks), the
trajectory divergence from earlier days (days 1-3
mornings are identical at 2190/2400/2400 kcal; day
4 morning already splits, P1 2322 vs BARE 980,
after P1's day-3 evening completed inside while
BARE's ended outside on the haven tile — reported
as divergence, not assigned a mechanism).

Leg by leg, day 5:

- L1 GUARD: passed on all three stacks. No combat
  live at step time, no tent, no game-over. (BARE
  has no step at all: L0.)
- L2 OFFER: offered on P1 and creekseek — proven
  by what follows (a hop happened). On BARE there
  is no offer because there is no step.
- L3 HOP (DECIDING LEG): P1's day lines carry
  "Travel 2 tiles to Haven." — the (5,3) -> (4,4)
  hop, Manhattan distance 2 — followed by "You
  come home after 2 days. The smell of the
  cookfire does something to your chest you don't
  examine. 'You're thinner,' someone says. 'You're
  still here,' you say." Evening snap: haven
  (4,4), travelledHome true. BARE's day 5 lines
  end with a raccoon tease and no travel home;
  evening snap: (5,3), policy-no-record. The hop
  is the first and only leg whose success is
  necessary for the haven evening — and it is
  sufficient by itself, as the next leg proves.
- L4 ENTRY: FAILED on P1 and creekseek (outcome
  walk-no-path, inside false at the snap — no
  lodge-adjacent walk found, or no adjacent lodge
  pick, per insideevening.js). The evening is
  haven ANYWAY, because atHaven is position-based
  (tile 'haven', node (4,4)). Entry is therefore
  PROVEN unnecessary for the haven classification
  on this pair — not merely unneeded in theory.
  She sleeps outside on the haven tile; the
  following morning (day 6) she wakes at haven
  (4,4), kcal 1190, on both P1 and creekseek —
  the haven evening STICKS overnight. BARE wakes
  day 6 at (5,3), kcal 35.
- L5 WRAPPERS, day 5 itself: NONE. P1 woodcarry
  null, warmth miss not-creek-refused; the
  wrappers did no work on day 5. Their only
  contribution is the prior-days trajectory
  divergence (morning kcal/ticks above). A wrapper
  action on the pair day itself cannot be the
  deciding leg here, because there was none.
- CREEKSEEK CONTRAST, day 5: the visit runs first
  — record moved-to-creek, (5,3) -> creek (4,3),
  lines "Travel 1 tile to creek." / "Cold, clear,
  moving. The best thing you've seen all day." /
  "You make for the creek to drink before night."
  — and then the hop is 1 tile, not 2: "Travel 1
  tile to Haven." Same outcome (walk-no-path),
  same evening (haven, travelledHome true), same
  following morning (haven, kcal 1190). The visit
  shortens the hop; it does not change the
  evening. The visit's downstream difference is
  the one awayeve already reported as precedence,
  not mechanism: creekseek's camper survives at
  the (2,0) creek days 9-12 while P1's camper dies
  after day 8 (P1 day 9 morning: successor
  gen_8tyqfs5 at haven; creekseek day 9 morning:
  still gen_ocpths4 at the creek).

Day 4 context (the travel-refused night): P1/CS
morning haven (4,4), kcal 2322; the day works
(5,3), meets Nathan and Faten (names learned),
learns Green Thumb, builds a bridge in daytime
("You lash logs together. A rough bridge spans
the gap."); a stripes fight starts and ends via
the barrier ("Not mid-fight — the barrier is the
way out."); then the evening step runs, offers
haven, and the hop is refused — block:creek at
the intermediate tile (4,3), woodcarry
classification hopReturnKind block:creek,
routeAroundPath [[5,3],[5,4],[4,4]] (the way
around exists as a 2-step route; the single hop
does not take it). Evening: (5,3), travel-refused,
travelledHome false. BARE day 4 ends at the same
(5,3) with no step. Deciding leg day 4: L3-hop-no
— the hop was offered and failed, so the villager
stays out; the bridge the wrappers built that
evening (built true, 96 ticks: snap ticks
403 -> 499; 60 kcal: 2232 -> 2172; retry arrived
false, narration "The bridge stands, but the way
home still refuses — block:creek.") does not
rescue her, because the retry hop hits the same
creek block.

STEP-PATH vs END-CAUSE, day 4 (stated, not
smoothed): awayeve's end-cause ordering labels
day 4 blocked-combat, because the evening SNAP
reads inCombat true. The STEP's own record says
travel-refused. Both are true at different times,
and the corpus lets us order them: woodcarry's
classification (post-step, pre-bridge) records
combatLive FALSE; the bridge is built; the retry
travelTo runs (woodcarry.js:261 — the only
travelTo between classify and the snap); warmth
then misses on combat; the snap reads inCombat
true. The retry hop's arrival processing is the
candidate mechanism for the flag (arrival runs
treelineAmbush/checkEncounter by engine law), but
no fight lines follow the retry narration, so the
mechanism is reported as a candidate, not a
proof. What IS proven: the step-path view
(L3-hop-no) and the end-cause view
(blocked-combat) disagree on this exact seed-day,
and any census that orders combat first HIDES a
hop refusal. Future arms that count refusals must
use the step record, not the snap flag.

Episode context, days 6-8: P1/CS go out again
(day 6 morning haven -> evening creek (2,0),
out-of-reach) and sit at the creek three nights
running, each night L2-offer-no — the step runs,
home is not offered, no hop is attempted. BARE
sits at (5,3) all three nights by no-step. The
day-5 hop broke the [4-9] episode for exactly
one night; it did not end the villager's time out
— she went back out the next morning and died
out there (P1 succession day 9; BARE succession
day 10, its camper lasting one night longer at
(5,3)).

## PAIR 1 — 17549 day 12: a daytime walk home, not an evening hop

Same vessel gen_vl0pol1. Days 9-11 on P1/CS:
morning (6,7) -> evening (6,7), out-of-reach all
three nights — L2-offer-no, the step running and
finding home unoffered, the villager staying put
at the same tile. Day 12: morning (6,7), kcal 39;
the DAY's lines carry "Travel 2 tiles to Haven."
and "Haven. 4 days. The palisade looks smaller
than you remembered, or you got bigger. Somebody
by the fire: 'Knew you'd walk back in. You always
do.'" — a daytime return, narrated as one — and
the evening step then runs only the entry leg
(outcome completed, inside true, travelledHome
FALSE). Deciding leg: daytime-divergence. BARE
day 12, from its diverged morning (7,8), kcal 105,
ends at (7,8), kcal 35, policy-no-record. CS day
12 is identical to P1 through the homecoming (then
works: cistern fill, a grove trip, a second
haven return, "You step into the Haven hall.").
The awayeve WALK-HOME label on episode [9-11] is
therefore NOT, on this seed, an evening-step
conversion at all: the episode ends because
competent.daily walks her home in daylight after
three offer-no nights. The village still dies on
day 24 on P1/CS (awayeve) — the walk home did not
save it. That death cause is blank (2), not
investigated here.

## PAIR 2 — 17549 day 6: same morning tile, different day, evening step idle

First same-morning-tile P1-haven / BARE-away
seed-day in seed order, excluding 17563 and the
pair-1 days (17549 day 6; the other such pairs
are 17552 day 28, 17555 day 29, 17563 day 11 —
all haven-morning days, all travelledHome false).
P1 day 6: morning haven (4,4), kcal 2400; a day
out (forest floor travels, a trail-edge leg),
then in DAYTIME "Travel 2 tiles to Haven." +
"You walk back into Haven. 9 Codex entries. The
village is glad to see you.", a grove trip, a
second haven return, "You step into the Haven
hall." Evening: completed, inside true,
travelledHome FALSE — L4-entry-only. BARE day 6:
morning haven (4,4), kcal 1193; wanders out to
(0,5) and stays there, policy-no-record.
Deciding leg: daytime-divergence. The evening
step moved nothing on day 6; the day's itinerary
did. Same morning tile, different morning kcal
(2400 vs 1193), different daytime route (the RNG
stream has diverged by day 6 on the two stacks),
different evening. Counting this pair as an
evening-step effect would be exactly the pooled-
share error awayeve warned against, in miniature:
5 same-morning-tile P1-haven / BARE-away pairs
exist in the pooled corpora, and only ONE of them
(17563 day 5) involves a hop at all.

## SENSE TEST (law) — PASS, with two honesty gaps stated

Read end to end from the corpora: 17563 days 4-5
(P1), 17549 days 9-12 (P1), 17549 day 6 (P1).

- 17563 day 5 reads as a person coming home:
  foraging the same floor she slept on, learning
  a counter from Salvador ("Stand tall and shout.
  When it crouches to pounce, STAND TALL and
  SHOUT — bang metal, wave your arms, be loud and
  enormous."), then the 2-tile walk and the
  cookfire homecoming line above. The hop itself
  is narrated as ordinary travel ("Travel 2 tiles
  to Haven."), not as a system move — the reader
  cannot tell from the lines alone that a policy
  step, rather than the day's itinerary, brought
  her home; only the travelledHome flag + outcome
  say so. That is a narration gap, not a sense
  failure: the walk reads true, its cause is
  invisible.
- 17549 day 12 reads as a person returning after
  being stuck: three nights at (6,7) with the
  step finding no way home, then a daylight walk
  and the palisade line ("Knew you'd walk back
  in. You always do."). The three offer-no nights
  have no distinct narration — the step's failure
  is silent on those nights (no "the way home
  won't open" line on out-of-reach evenings),
  which is the same silence awayeve noted for
  return-attempted nights generally.
- Honesty gap 1: 17563 day 5's aftermath. She
  arrives home with 0 kcal, and the transcript
  runs TWELVE identical "Need N kcal, have 0. Eat
  first." refusals (10, 4, 6, 6, 8, 8, 10, 10, 10,
  10, 12, 12) after the fire-side lines ("Someone
  by the fire nods at the counter. 'We pool food
  here...'"). The homecoming reads as a person;
  the twelve refusals read as a loop. And they
  fire while inside is FALSE (walk-no-path) — fire-
  side dialogue on an outside-haven evening, the
  same class as the fire-gossip-while-away texture
  (#1660) awayeve flagged, now on the haven tile
  itself. Stated as an observation, not a verdict:
  whether haven-tile fire dialogue requires inside
  is a design question for the coordinator's
  backlog, not a finding of this arm.
- Honesty gap 2: 17563 days 6-8 repeat the triple
  identical blocked-crossing line every morning
  ("The creek runs fast here — no crossing without
  a bridge or a swim." x3), the same repetition
  awayeve's sense read flagged. Decisions read as
  person-like; the repetition lives in narration
  templates, not in the choices.

## Villager behavior sample (beyond the sense days)

Out of the decomposed days: goals (forage named
patches, learn counters, return home after days
out); routines (daily foraging loops; garden work
— "Maja will work the garden once each day while
at Haven" on 17549 day 6; woodpile draws "for the
road home"); dialogue with consequences
(introductions that stick as names — Nathan,
Faten, Salvador's counter-teaching; the
homecoming lines that differ by absence length —
"after 2 days" vs "4 days" vs "9 Codex entries").
Robotic / repeated texture, flagged: the triple
blocked-crossing line; the x12 "Eat first"
refusals; monster teases repeating verbatim
across days. Nothing here suggests villagers
choosing non-personally; the robotic surface is
narration templates, as in awayeve.

## Reachability verdict

Not re-measured by this arm: a leg decomposition
is not a reachability census. Nothing in this arm
changes awayeve's reachability verdict (away
evenings reached; walk-home episode ends reached;
road evenings 0/2,856 in the 30d window). The one
reachability-relevant bound this arm ADDS: the
evening hop, the only mechanism by which the
evening step itself brings a villager home, fired
exactly once in 714 P1 evenings and once in 714
creekseek evenings, both the same seed-day. Any
future claim that the evening step "brings
villagers home" must reckon with that rate, not
with the 680 entry-only haven evenings — those
are days that ended at home on their own.

## Village assessment, in plain words

Picture one villager, out on the forest floor,
trying to get home. On the first night the way
home is offered and blocked by a creek — she has
a bridge by then, it doesn't matter, the creek
still refuses, and she sleeps out. On the second
night the way home is offered and open — she
walks the two tiles home, arrives outside the
hall with the door somehow not opening for her,
and sleeps on the haven ground anyway, which
counts as home. The next morning she walks back
out to a creek and gets stuck there for three
nights, each night the step looking for home and
not finding it offered, until she dies out there
and someone else wakes up in the hall. That is
the whole evening-step story on the one seed
where it does anything. On the other seed, the
story is quieter: three nights stuck at the same
forest floor with home unoffered, then a walk
home in broad daylight — no evening magic at
all, just a person deciding the day's walk ends
at home. And on most days, on most seeds, the
evening step does nothing but confirm the
villager is already home: six hundred and eighty
nights of "you ended the day at home, come
inside." The step is a night watchman who almost
never opens the gate, and on the one night he
does, the door behind him doesn't open either —
but the yard counts as home, so the night counts
as a return.

## Wall numbers (observed on these legs, report-only)

NOT measured by this pre-seat census: national /
table / wins are not reported as wall numbers here
— no values are invented for them. What was
observed on these legs: 24 seeds x 30d, awayeve
corpus; the drift check re-derived 17563 on the
current base with zero drift. Per-leg maxWave
numbers are awayeve's (wave 1: 18 legs, wave 2:
72, wave 3: 6, wave 4: 0, wave 5: 0 on the 30d
pre-seat legs), not a new wall measurement.

## Blanks filled or documented

- Filled (this arm, measured): the 0435Z
  closeout's blank (1) — the evening-step leg
  decomposition via seed-day pairs. Deciding legs
  isolated with transcript evidence on 3 pairs:
  17563 day 5 = L3-hop (entry failed, haven
  anyway); 17549 day 12 = daytime-divergence
  (daytime walk, entry only); 17549 day 6 =
  daytime-divergence (day ended home on its own).
- Filled (this arm, measured): the pooled leg-path
  census — 2,856 evenings, 0 surprises; the hop
  fires once per stack-corpus; hop-then-entry-
  success is zero; offer-no is the modal away
  leg (30 P1, 34 creekseek).
- Filled (this arm, measured): the step-path vs
  end-cause disagreement on 17563 day 4 — the
  step record (travel-refused) vs the snap flag
  (inCombat), ordered through the wrapper chain
  (classify combatLive false -> bridge built ->
  retry travelTo -> warmth miss combat -> snap
  inCombat true), with the retry hop as the
  candidate mechanism, stated as candidate.
- Filled (this arm, measured): ZERO DRIFT between
  the awayeve base (6409c1312) and this base
  (2debb6756 + this arm's commits) on 17563, all
  three policies, all 30 days, on evening tile,
  position, outcome, travelledHome, and morning
  tile/position.
- Documented (this arm, NOT a fix): fire-side
  dialogue on an outside-haven evening (17563 day
  5, inside false, twelve "Eat first" refusals
  after fire lines) — #1660 class, for the
  coordinator's backlog; the silent out-of-reach
  night (no narration when home is unoffered);
  the hop's cause invisible in narration (the
  homecoming line does not distinguish a step hop
  from a daytime walk — only travelledHome does).
- Documented (this arm, NOT investigated): 17549's
  village death on P1/CS day 24 (blank (2));
  whether entry failure on the haven node has any
  gameplay consequence at all (the villager
  sleeps outside on the haven tile — carried
  doubt from the prereg, now sharpened by pair 0:
  on the only hop pair, entry failure changed
  nothing about the evening class or the next
  morning).

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars: FOUR OF FOUR MET (pair 0
  complete with deciding leg + quotes; pairs 1
  and 2 complete the same way; instrument
  completeness with zero UNISOLATED and zero
  surprises on judged pair days and pooled;
  sense pass with quotes). No metric was
  re-scored mid-run. The pilot gate (pairs 0+1)
  passed before the confirm spend (pair 2): zero
  surprises on both pilot pairs.
- Whether outcome + travelledHome + positions
  recovers the leg path exactly: YES on this
  corpus — every judged pair day resolved to one
  path, and the pooled census ran 2,856 evenings
  with 0 surprises. The one anticipated ambiguity
  (walk-no-path with travelledHome false on an
  away morning) did not occur on judged days.
- Whether snap inCombat differing from step-time
  combatLive undermines the guard leg: NO for
  the deciding leg (the step's own outcome is the
  record), but the day-4 ordering result stands:
  end-cause orderings that put combat first hide
  hop refusals. A future refusal census must use
  the step record.
- Whether wrapper daytime costs can be the
  deciding leg on a pair day: NOT on any judged
  pair — day 5 has no wrapper action on the day
  itself, and days 6/12's wrapper records are null
  or miss-only. Prior-day trajectory divergence
  (morning kcal/ticks) is real but is divergence,
  never a day-of leg, per the prereg.
- Carried doubt for the NEXT run: if entry
  failure on the haven node changes nothing about
  the evening class or the next morning (pair 0),
  what, if anything, does the lodge entry leg DO
  for a hopped-home villager? And: the hop's
  offer geometry (which tiles offer haven, which
  do not) is now the binding question — 30
  offer-no nights vs 1 hop-no vs 1 hop-yes says
  the offer, not the hop or the entry, is where
  evenings are decided. A future arm could census
  offer-no by departure tile and distance.
- Panel §15: see below.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack,
a per-seed-day leg decomposition, evening-step leg
paths, or policies that are not in the registry
(creekseek, BARE-competent as a census stack) —
the same declaration every prior strand arm made,
stated in the prereg. The comparison here is a
matched seed-day pair decomposition across
policies on identical seeds through the new
eveningstep analyzer, attached as
evidence/2026-11-01/sim-eveningstep-b-compare.md,
never labeled a panel comparison. No panel result
is fabricated; the panel tool was not invoked on
this corpus.

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-eveningstep-b-census-p1.json --metrics
national,table,wins,exiled` prints LOUD
"national/table/wins disappeared: baseline
12/16/16 -> current 0 (n=1 files)". Investigated
as a missing-field artifact, same class as
awayeve's and strandwide's rounds: this census
carries no national/table/wins/exiled fields at
all — the check ingests a leg-path census where
the baseline expects per-seed sweep rows, so 0
means "field absent", not "wall moved". No
genuine LOUD signal. Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH commits in
   this arm (prereg, instruments — committed files
   showing staged-as-deleted while byte-identical
   in the worktree). Repaired each time via `git
   update-index --add --cacheinfo` from HEAD blobs;
   `git status --short` empty + `git diff HEAD`
   empty + hash-object matches verified after each
   repair. The commits themselves were never in
   doubt (blob hashes match). The coordinator
   should verify the same way after the final
   commit below.
2. EPERM flap: NOT observed on file writes in this
   window (all sim transports, splits, and census
   writes landed first-try).
3. Judged pairs were never staged in /tmp (pair
   JSONs and censuses lived in evidence/; drift-
   check jsonl deleted after split, per the rule —
   no .jsonl leftovers of this arm at evidence
   time).
4. Diff guard at evidence time: `git diff
   --name-only 2debb6756 -- src/ scripts/policies/`
   must show NOTHING (no game code, no existing
   policy file moved under measurement; the only
   new scripts are scripts/analyze-eveningstep-b.js
   and scripts/test-eveningstep-b.js, neither under
   scripts/policies/).

## Proof

scripts/test-eveningstep-b.js: pure 36/36 (leg-path
classification for every taxonomy outcome incl.
detour/haven-unknown/step-error surprises;
deciding-leg cases incl. hop-decides-with-failed-
entry, daytime-divergence, offer-no, hop-no,
guard-combat, daytime-walk vs evening-hop
distinction, UNISOLATED on surprise; pairDay
wiring on a synthetic 17563-day-5 shape; census
wiring on a synthetic corpus dir).
Corpus checks: pooled leg-path census 2,856
evenings, surprises 0; P1 away 31 = 30 offer-no +
1 hop-no; creekseek away 35 = 34 offer-no + 1
hop-no; P1 travelledHome 1; L3-hop-yes-entry-yes
0 on both stacks; drift check 90/90 leg-days
match (17563, 3 policies, 30 days, current base).
Pilot gate: pairs 0+1 classified with zero
surprises before pair 2 was spent. Diff guard:
see infrastructure note 4.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-eveningstep-b-prereg.md
  (commit 3c6b08d13)
- Evidence (this file): evidence/2026-11-01/
  sim-eveningstep-b.md
- Compare (matched seed-day decomposition, not a
  panel comparison): evidence/2026-11-01/
  sim-eveningstep-b-compare.md
- Instruments: scripts/analyze-eveningstep-b.js,
  scripts/test-eveningstep-b.js (instruments
  commit 4ab3ac8d0)
- Censuses (analyzer output, pooled pilot+confirm
  per policy): evidence/2026-11-01/
  sim-eveningstep-b-census-p1.json,
  sim-eveningstep-b-census-bare.json,
  sim-eveningstep-b-census-creekseek.json,
  sim-eveningstep-b-census-p3.json
- Pair decompositions (analyzer output, full
  dayLines + records per pair day):
  evidence/2026-11-01/sim-eveningstep-b-pair-
  17563.json (days 4-9), sim-eveningstep-b-pair-
  17549.json (days 9-13), sim-eveningstep-b-pair-
  17549d6.json (days 5-7)
- Drift check (not judged): corpora
  evidence/2026-11-01/sim-eveningstep-b-corpus-
  driftcheck-p1-30d,
  sim-eveningstep-b-corpus-driftcheck-bare-30d,
  sim-eveningstep-b-corpus-driftcheck-creekseek-30d;
  stderr logs sim-eveningstep-b-driftcheck-{p1,
  bare,cs}.stderr.log
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
- New candidate from this arm: the OFFER geometry
  — which departure tiles/distances offer haven
  and which do not (30 offer-no vs 1 hop-no vs 1
  hop-yes on P1) — is now the binding question
  for evening-step evenings, replacing the hop/
  entry question this arm answered.
- New candidate from this arm: what, if anything,
  lodge-entry failure on the haven node costs a
  hopped-home villager (pair 0: nothing visible
  in evening class or next morning).
- Fire-side dialogue on an outside-haven evening
  (17563 day 5, inside false) — #1660 class, for
  the backlog; the silent out-of-reach night (no
  narration when home is unoffered) likewise.
- Step-record vs snap-flag ordering (17563 day 4):
  future refusal censuses must use the step
  record, not the snap inCombat flag.
