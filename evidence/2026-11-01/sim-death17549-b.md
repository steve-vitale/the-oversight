# sim-death17549-b — DIAG: why seed 17549's village dies (and why P3's doesn't)

Run: oversight-flesh-out-loop-b, arm sim-death17549-b, run
fleshout-loop-b-20261101T0545Z, axis food-economy (17549
death-cause trace). Worktree sim-death17549-b, branch
sim-death17549-b. Base of the analyzed corpora:
6409c1312 (the awayeve base); worktree base 2debb6756.
DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy
file or existing script. New files only: prereg,
death17549 analyzer + pure proof test, evidence,
censuses. The absencehunt driver, creekseek driver,
absencehunt analyzer, confirmednight analyzer,
strandtile analyzer, and awayeve analyzer are REUSED
VERBATIM from the base. This worker does NOT push,
bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed
on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-11-01/
sim-death17549-b-prereg.md, commit c85a8c27, written
BEFORE any judged leg) set four bars, ALL of which
must hold:

(a) CHAIN COMPLETE ON >= 2 OF 3 DYING POLICIES —
  PASSED on all three: P1 and creekseek share one
  chain, proven by mechanical identity (sayLines +
  decisions byte-identical, analyzer corporaIdentical
  true), and BARE carries its own complete chain.
  Every link below is dated and quoted.
(b) P3 CONTRAST EXPLAINED — PASSED: P3's pantry
  collapses just as far, but its hungry streak never
  reaches three nights — Day 1 markers on nights 18
  and 25, each followed by a "Haven eats again"
  reset (nights 19, 26), with the away scholar
  drawing no village meal on patrol nights. The one
  honestly opaque point — which inflow resets the
  streak — is stated as unnamed, not invented.
(c) COMPETING CHAINS RESOLVED — PASSED: the sickness
  thread (Imani/James wound fever) and the combat
  thread (monster kills) are both dated and both ruled
  out as the game-over cause, with reasons, below.
(d) SENSE PASS — PASSED: the P1 days 12-24 stretch
  and the BARE days 6-18 stretch read end to end as
  people living and dying in a village (see sense
  test), with the policy-passivity gap stated.

GO is therefore the verdict. GO here is still DIAG:
it authorizes NO src/js fix and NO default change.
What the arm delivers is the dated answer to the
question the census left open: the village does not
die of monsters, sickness, or exposure. It dies of
the scattering — three consecutive nights with an
empty pantry — after its food supply, which arrives
in expedition-sized lumps, stops arriving, while its
daily demand never stops.

## The answer in one paragraph

On P1 and creekseek, the pantry starts at 47,250 kcal
and drains all month: the village eats several
thousand kcal a night, NPC forage returns are a few
hundred kcal a day, the creek is fished out, the
garden never ripens, and the only multi-thousand
injections are two expedition returns on night 17
(Imani +2,554, Devon +7,122). On night 18 the pantry
reads "full" by the fresh-days heuristic, so the
PRODTHROTTLE rule sends foragers to wood and water
runs instead of stocking — fat days are eaten at the
fire, never banked. After night 17 no expedition ever
returns, the pantry falls 11,038 → 6,982 → 4,786 →
3,270 → 2,193 → 0, and nights 22, 23, 24 are three
consecutive hungry nights: "Haven couldn't hold. On
the third hungry day, people started walking — in
different directions. The scattering, again." On
BARE the same scattering fires on night 18, but the
road there runs through the scholar starving to
death out on days 6-13 first. On P3 the pantry falls
just as far (200 on day 22, 0 on days 25-26) — but
the scholar camps wild and draws no pantry meal, and
small overnight inflows break the streak at one night
twice, so the fuse never completes.

## Definitions (prereg, exact)

Village-lost paths, classified ONLY by the narrated
game-over line: SCATTERING (three — or five, at
havenTier >= 3 — consecutive pantry-empty endDays);
EXTINCTION ("Nobody is left…"); NO-SUCCESSOR ("No one
is left to pick up the Codex…"). A deaths-list tally
never classifies a game-over. Pantry numbers are
morning/evening item sums from the corpus snaps;
quoted deposits and meals are gross flows that explain
direction, never substitutes for snapshots. A
succession morning narrated as a homecoming is still
a death, not a return (awayeve precedent).

## Chain 1 — P1 / creekseek: the scattering, day 24 (pilot gate leg, traced first)

P1 and creekseek corpora for 17549 are identical on
sayLines AND decisions (analyzer corporaIdentical
true; same 2,517 say lines, same deaths, same pantry
snaps, same hungry markers). One chain covers both
policies; creekseek adds nothing on this seed, which
is itself consistent with awayeve's finding that
creekseek fires almost never on fresh bands. No
succession occurs on either leg: gen_vl0pol1 is the
vessel all 24 days.

### Pantry trajectory, P1 (morning → evening kcal)

| days | pantry morning → evening |
|---|---|
| 1 | 47,250 → 36,750 |
| 2 | 36,750 → 36,750 |
| 3 | 29,650 → 25,300 |
| 4 | 24,269 → 24,269 |
| 5 | 19,288 → 19,288 |
| 6 | 16,100 → 16,100 |
| 7 | 15,600 → 15,600 |
| 8 | 14,100 → 14,100 |
| 9 | 13,500 → 13,500 |
| 10 | 12,900 → 12,900 |
| 11 | 11,100 → 11,100 |
| 12 | 12,435 → 12,435 |
| 13 | 10,050 → 10,050 |
| 14 | 7,000 → 7,000 |
| 15 | 2,500 → 2,500 |
| 16 | 3,136 → 3,136 |
| 17 | 3,518 → 3,518 |
| 18 | 11,038 → 11,038 |
| 19 | 6,982 → 6,982 |
| 20 | 4,786 → 5,176 |
| 21 | 3,270 → 3,270 |
| 22 | 2,193 → 2,193 |
| 23 | 0 → 430 |
| 24 | 0 → 0 |

Two structural facts jump out. First, daytime deltas
are ~0 almost every day: the village's food does not
arrive during the day. The only daytime gains in 24
days are the scholar's own unloads, day 20 (+390:
"You keep a day's food (1995 kcal) and unload 390
kcal into Haven's pantry.") and day 23 (+430, same
shape). Second, the overnight deltas do all the
damage: typically −2,000 to −4,500 a night (village
consumption during sleep), against NPC forage
returns of +239 to +582 gross. The single reversal
in the whole month is night 17 → morning 18,
+7,520, and it is fully itemized in the transcript:

- "🧭 Imani is back from past the north (+2554 kcal
  for the pantry, 4 stories, a new scar) (Ask them
  what they saw.)"
- "🧭 Devon is back from past the east (+7122 kcal
  for the pantry, 5 stories) (Ask them what they
  saw.)"

Expedition returns are the village's food supply.
Everything else is garnish: all NPC forage returns
combined across 24 days are 474 + 514 + 518 + 418 +
441 + 239 + 582 + 393 = 3,579 kcal — less than one
night's consumption at the late-month rate.

### Days 1-11: the drain, and the episode that is not the cause

The scholar is at haven days 1-8, then away on
forest_floor days 9-11 (the awayeve episode [9-11]),
then walks home on day 12:

- "Travel 2 tiles to Haven."
- "You walk back into Haven. 14 Codex entries. The
  village is glad to see you."

The walk home is real and same-vessel — and
irrelevant to the death, which is the point of the
two-week gap: getting home does not save the
village, because the village's problem is not the
scholar's location. It is the pantry, which falls
from 47,250 to 11,100 across days 1-11 while the
scholar forages 1-3 trips a day and, on the days a
keep/unload line fires, keeps the food for self:
"You keep a day's food (270 kcal) — nothing extra
for the pantry this time." (day 6), same shape days
8, 12, 13, 14, 16, 17, 18, 19, 22. The scholar's
evening kcal tells the same story from the other
side: 2,269 → 671 → 131 across the away days
9-11 (starving out there), then 440 on the walk-home
day, then 2,390 the next night at home — fed from
the pantry. The scholar is fed by the village while
the village starves; the away episode only
interrupts the feeding for three nights.

### Days 12-21: the two weeks between the walk home and the loss

Home, fed, and hand-to-mouth. The scholar draws a
village meal nearly every home night — "Village
meal: +1200 kcal, +1L water from the communal
pantry. (Half ration — they don't trust you yet.)"
(day 1 shape; draws run 1,000-1,485 through day
22) — while the pantry slides 12,435 → 10,050 →
7,000 → 2,500 → 3,136 → 3,518. Two things keep it
from hitting zero sooner, and both stop:

1. Night 17's expedition returns (+9,676), which
   lift the pantry to 11,038 on day 18. No
   expedition returns on any later night.
2. Small NPC forage returns (Maja +518 and Nikos
   +418 on day 16; Maja +441 on day 17; Nikos +582
   on day 19) — then nothing after day 19 except
   Nikos +393 on day 22, which the night's
   consumption swallows whole (overnight 2,193 → 0).

Day 18 is the hinge, and the transcript names the
mechanism. The pantry reads ~8 fresh days, so the
PRODTHROTTLE rule (game.js, 2026-10-13: when the
pantry holds >4 fresh days, duty forage/garden/fish
stops routing fresh surplus into stock and the
villager takes up non-perishable work instead)
engages in full view:

- "🌿 Werner checks the pantry before heading out —
  the shelves are full, ~8 days of fresh on hand…
  leaves the harvest standing and turns to the wood
  run instead. The pantry can't take more; the wild
  will keep."
- "🌿 Brianna returns from foraging the wilds: +239
  kcal to the pantry — the shelves are full, so 238
  kcal is eaten at the fire instead."
- "🍽️ Wanjiru carries the day's surplus to the
  pantry door, thinks better of it, and turns back
  to the fire. 'It'll only rot in there. We eat.'"

Fat days are eaten at the fire, never banked — by
design ("Fresh food keeps days, not weeks. Smoke it
over a fire to make it last."). The village cannot
stockpile its way out of the coming gap because the
rule that protects it from rot also caps its buffer
at a few fresh days. Days 19-21 then drain 11,038 →
6,982 → 4,786 → 3,270 with no new supply, while the
workforce thins: by days 23-24 eight named
villagers are resting instead of ranging out —
"🩹 Werner is still hurting (48 HP) — no healer at
haven. They rest today instead of ranging out."
(same shape for Brianna, Hayden, Maja, Wanjiru,
Nikos, Nathan, Devon; 58 such lines on the leg) —
and the creek is fished out (70 lines: "🎣 Imani
walked the banks — the water's fished out. Nothing
to catch. It'll come back if it rests.") and the
garden never ripens (12 lines: "🌱 Werner works
the garden — watered, weeded, turned. Nothing ripe
yet.").

### Days 22-24: the fuse completes

Night 22: the village meal draws the pantry down
("Village meal: +1293 kcal, +1L water from the
communal pantry."), the HUNGER WINTER crisis fires
("◈ CRISIS — THE HUNGER WINTER. Three days now the
village has gone to sleep hungry. The pantry is an
echo."), relief is offered and never taken ("🛟
Nikos stands up by the fire. 'Another day like this
and we're choosing who eats. Not yet — there's
still moves to make. Here's what we CAN do — pick
one, maybe two, but everything costs something.' …
'(Relief is open — triage, rations, hunt, or rally,
from the beats row. Each option works once; the
moment passes in ~3 days.)'"), and the first
marker fires: "⚠ Haven's pantry is empty. Day 1
of hunger." The policy's day-parts that week are
"You wait. The light changes. Nothing asks anything
of you." — no relief action appears anywhere in
the corpus.

Night 23: the meal draws the last of it ("Village
meal: +430 kcal from the communal pantry." — the
full 430 the pantry held that evening), "⚠ Haven's
pantry is empty. Day 2 of hunger.", and the sickness
thread claims Imani ("📖 The Codex turns a page on
its own. Imani is dead. You didn't ask. It knew."
+ "◈ CRISIS — THE FIRST GRAVE. Imani is dead.").

Night 24: "⚠ STARVING: health and energy falling.
The spiral has started." / "No food in the pantry.
The village is hungry." / "Nathan went to sleep
hungry. Nobody says anything." / "⚠ Haven's
pantry is empty. Day 3 of hunger." /
"Haven couldn't hold. On the third hungry day,
people started walking — in different directions.
The scattering, again." The narrated limit is
three, so famineGraceDays is 3 in-run (havenTier <
3; the five-day granary grace is not active here).
James dies the same night ("📖 The Codex turns a
page on its own. James is dead."), but the
game-over line is the scattering, not an extinction
or a no-successor line — people walk away; they are
not all dead. The scholar is alive at the evening
snap (kcal 1,224) and never dies on this leg.

### Threads ruled out as the cause (competing chains resolved)

- SICKNESS: Imani is feverish on day 22 ("🤒 Imani
  is feverish, a cut gone hot and angry. Rest and
  clean water — or it gets worse.") and dead on day
  23; James dies of sickness on day 24 (deaths list:
  day 23 gen_q2zun5n sickness, day 24 james_okonkwo
  sickness). Per DISEASES.md this is mundane wound
  fever (open cuts left dirty), a parallel thread:
  it kills two villagers but the village still has
  people on night 24 — the game-over line is the
  scattering, and the deaths list shows only 4
  deaths in 24 days against a roster that still
  fields a dozen names at the fire. Sickness is a
  symptom of the same hard weeks (wounds untended,
  no healer), not the mechanism of loss.
- COMBAT: two monster kills in the deaths list
  (living_wire, villager combat, days 9 and 18) and
  waveKills {1: 2}; maxWaveUnlocked 1. No combat
  death after day 18, no combat on the final nights.
  Not the cause.
- EXPOSURE / THE AWAY EPISODE: the scholar survives
  days 9-11 away and walks home day 12; the death
  comes twelve days later at home. Not the cause.
- RAID: Emberhold tramples 2 garden plots on night
  22 ("🌙 Raid — Emberhold came in the night from
  the northeast. They trampled 2 garden plots into
  mud. Nobody's dead…"). A pressure, not the cause:
  the garden was already unripe, and the fuse was
  already lit (Day 1 fires the same night).

## Chain 2 — BARE: the same scattering, day 18, via a starved scholar

BARE is a different road to the same cliff. The
scholar's away episode [6-13] is fatal where P1's
[9-11] was not: evening kcal reads 0 on days 7, 8,
9, 10, 12, 13 (350 on day 11, 35 on day 12 — the
awayeve kcal-semantics observation recurs: six days
at 0 with undiminished foraging and travel lines,
then death with no starvation narration in the day
lines). Day 13 kills two villagers by starvation
(deaths list: gen_vl0pol1 starvation, player true;
gen_q2zun5n starvation, player false), and day 14
dawns with the successor at haven (succession day
14: gen_vl0pol1 → wanjiru_kamau). The successor
inherits a pantry already falling off the cliff:

| days | pantry morning → evening | successor kcal (evening) |
|---|---|---|
| 14 | 2,966 → 2,966 | 2,260 |
| 15 | 400 → 400 | 2,166 |
| 16 | 400 → 400 | 1,107 |
| 17 | 416 → 416 | 592 |
| 18 | 253 → 253 | 399 |

The successor draws village meals of +2,000 (night
13, the succession night) and +2,216 (night 14)
against a ~3,000 pantry, then +667, +400, +416 as
it empties — the meals shrink with the pantry and
still do not cover her: her kcal falls 2,260 →
399 across five home days. No expedition ever
returns on BARE (zero expedition lines); NPC forage
returns are +216 (night 13), +267 (night 15), +416
(night 16), +253 (night 17) — garnish against
2,000+ nightly draws. The creek is fished out
(15 lines), the garden is dead ground ("The garden:
your untended Muscadine Grapes drowned in weeds
and died. (Six untended days. The garden keeps
honest books.)" night 13; "turned soil, nothing
planted. Someone has to sow first." nights 14-17).
The fuse: "⚠ Haven's pantry is empty. Day 1 of
hunger." (night 16, after "Nikos came back with 338
kcal of something edible. The pantry breathes." —
even a 338 inflow does not save the night), Day 2
(night 17), Day 3 + "Haven couldn't hold. On the
third hungry day, people started walking…" (night
18). The successor is alive at the evening snap
(kcal 399) — again, the village scatters, it does
not die out. BARE's extra link, stated plainly: the
scholar's own starvation out on days 6-13 is what
hands the pantry crisis to a successor with no
margin left; the scattering is still the proximate
cause, and the starvation is the prior link, not a
competing chain — the two are sequential, dated,
and both quoted.

## The P3 contrast: the same collapse, a fuse that never completes

P3's pantry is NOT healthier than P1's — it is
lower on most days from day 17 on (day 18: 2,950 vs
P1's 11,038; day 22: 200; days 25-26: 0). P3
survives on a one-night margin, twice:

- Night 18: "⚠ Haven's pantry is empty. Day 1 of
  hunger." Night 19: "Haven eats again. The hollow
  look fades." Morning pantry day 19: 914.
- Night 25: "⚠ Haven's pantry is empty. Day 1 of
  hunger." Night 26: "Haven eats again." Morning
  pantry day 27: 613.

What breaks the fuse, in transcript terms:

1. THE AWAY SCHOLAR DRAWS NO MEAL. Every patrol
   night carries the line "You camp wild tonight —
   no pantry meal. Eat from your pack." P3's
   scholar is out on forest_floor for most of the
   window (24 away evenings per awayeve) and draws
   a village meal only on home nights (days 1-4, 10,
   16, 20, 21). One fewer mouth at the pantry every
   patrol night is the structural difference from
   P1, where the home scholar draws 1,000-1,485
   nightly. The P3 scholar pays for it personally:
   evening kcal reads 0, −60, 71, 128 across the
   window, and the leg burns through four
   successions (days 11, 17, 21, 28) on starvation
   and dehydration (deaths list: gen_vl0pol1
   starvation day 10, gen_3884v73 dehydration day
   16, gen_q2zun5n dehydration day 20, gen_5zrmrq3
   dehydration day 27 — all player-flagged vessels).
   On P1 the scholar stays alive and well-fed at
   home while the village starves; on P3 the
   scholars starve while the village scrapes by.
   That inversion is the contrast in one line.
2. SMALL OVERNIGHT INFLOWS BREAK THE STREAK. The
   resets are observed (morning snapshots 914 and
   613 + the "Haven eats again" lines), but the
   transcript does NOT itemize a deposit on the
   reset nights — no forage-return or expedition
   line matches nights 18→19 or 25→26. Named small
   inflows exist nearby (a 350-kcal trapped squirrel
   on night 18; "(462 kcal of dried meat and clean
   water. Nothing traceable.)" on night 22; "(243
   kcal…)" on night 25; overnight jumps of +3,005
   into morning day 23 and +1,161 into morning day
   29), but none is quoted as the reset deposit, and
   this evidence does not attribute the resets to
   any of them. The honest statement is: P3's
   streak breaks because the endDay check finds
   food on nights 19 and 26, and the itemized
   mechanism of that food is not in the transcript.
   A future arm that wants the reset mechanism must
   instrument the sleep pantry flows; it is not
   filled by invention here.
3. THE ROSTER NEVER EMPTIES. P3's deaths list is
   longer (18 entries) than P1's (4), but
   successors keep coming — four vessels across 30
   days — so neither extinction nor no-successor is
   ever in play. Deaths alone do not kill a village
   on this seed; the scattering fuse does, and P3
   never lets it complete.

P3 also hits the same texture: fished-out lines
(12), garden-unripe (5), wounded-rest (28), and
relief offered on nights 4, 7, 11, 15, 19, 25 and
never taken. The relief passivity is policy-wide,
not P1-specific.

## SENSE TEST (law) — PASS, with the policy-passivity gap stated

Read end to end: P1 days 12-24 and BARE days 6-18.

P1 reads as a village slowly starving in full view
of itself. The scholar walks home on day 12 to
gladness ("The village is glad to see you."), is
fed from the pantry every night while the pantry
falls, watches two neighbors come back from
expeditions with thousands of kcal on night 17
(and hears their stories — "Ask them what they
saw."), watches the pantry read "full" on day 18
while foragers turn to wood runs, watches the
crisis meeting on night 22 where Nikos lays out
the options and nobody picks one, watches Imani
die of a hot cut on night 23 and James on night
24, and then watches everyone walk away — not die,
walk — on the third hungry night. The decisions
read as person-like (expeditions, foraging,
barter, teaching, garden work, water runs); the
repetition lives in narration templates ("walked
the banks — the water's fished out" ×70; "still
hurting — rest today" ×58; "You wait. The light
changes." across idle day-parts), not in the
choices. Two honesty gaps, stated plainly: (1) the
competent policy never takes a relief option it is
repeatedly offered — the village debates rallying
and nobody rallies, which reads as a policy that
cannot act on a crisis it can narrate; (2) the
scholar's nightly village meal (1,000+ kcal, "Half
ration — they don't trust you yet") continues
while named villagers "went to sleep hungry.
Nobody says anything." — the rationing story and
the meal story do not reconcile in the transcript.

BARE reads grimmer and just as coherently: a
scholar who stays out six days at 0 kcal, dies
unremarked in the day lines (the death arrives via
the deaths list and the succession morning, not via
any starvation narration — the same kcal-semantics
observation awayeve filed), a successor who
inherits a 2,966 pantry and eats it down to 253
while her own kcal falls 2,260 → 399, a garden
that "keeps honest books" by killing untended
grapes, and the same walk-away ending. The sense
pass rests on the pantry story (numbers, meals,
returns, and the scattering line all agree), not on
the homecoming lines — and the succession morning
on BARE day 14 is, per the standing caveat, a
death narrated as a return, classified here as a
death.

## Villager behavior sample (beyond the sense stretches)

Out of the same corpora, villagers show goals
(expeditions "past the north/east" with stories
and scars; forage returns; garden work; water
runs; teaching: "Nathan taught Hayden Old World
Caches"), routines (daily forage loops, wood and
stone runs, fishing the same fished-out banks),
dialogue with consequences (the fire-gossip
chains; the Stonebridge/Emberhold/Thornfield/Ashford
raids with Trust −10; the "choosing who eats"
crisis speeches), and reactions to events (the
FIRST GRAVE crisis on Imani's death; "The fire
feels smaller tonight."). Robotic / repeated
texture, flagged: the fished-out fishing line
repeated identically by four villagers a night;
the wounded-rest line repeated per villager per
day-part; "You wait. The light changes." as the
competent policy's default day-part. Decisions read
as person-like; the repetition lives in templates
and in the policy's idleness, not in the villagers'
choices.

## Reachability verdict

Waves 1-5, Arc II/III/IV, regional → national, the
table, and the win flag are not in scope of this
trace and none is claimed either way. What IS
reached, on current master via the awayeve corpora:
the scattering game-over (3 legs, 2 distinct
roads), the HUNGER WINTER crisis with relief
offers, expedition returns, the PRODTHROTTLE
shelves-full behavior, wound-fever sickness deaths,
and succession under starvation. The village-death
content is reachable and, on this seed, common.

## Village assessment, in plain words

Picture one village run four ways for a month. Left
to itself with the evening step, the village eats
its starting pantry down over three weeks, gets one
big lift when two neighbors come home from
expeditions with full packs, then — because nobody
banks surplus when the shelves read full, because
the creek gives nothing, because the garden never
ripens, because the hurt villagers rest instead of
ranging — eats the last of it in four days and, on
the third night of an empty pantry, walks away in
different directions. The scholar is alive and
well-fed through all of it: the village feeds him
while it starves. Take the evening step away and
the same ending comes six days sooner, by a harder
road: the scholar starves out on the wild tiles
first, and the woman who picks up after him
inherits a pantry with days left in it and eats it
down to nothing. Send the same villagers out
hunting deeds and the village still nearly dies
twice — the pantry hits zero just the same — but
the scholar sleeps rough and eats from his pack
instead of the pantry, and a few hundred kcal
shows up overnight on exactly the nights that
matter, so the third hungry night never comes.
The village survives by a one-night margin, twice,
while its scholars die and are replaced. So the
answer to what kills 17549 is plain: not monsters,
not sickness, not the walk home or the failure to
walk home. Hunger, on a three-night fuse, in a
village whose food arrives in lumps and is eaten
as it arrives, never stored against the gap.

## Named seeds (unchanged + new, no substitution)

- 17549: village-lost on P1 (day 24, scattering),
  creekseek (day 24, scattering, corpus-identical
  to P1), BARE (day 18, scattering via scholar
  starvation + succession); survives on P3 (two
  Day-1 hunger markers, two resets, no game-over).
  Unchanged from awayeve; now CAUSED, not just
  named. The awayeve "death cause not investigated"
  note is closed by this arm.
- Retired: none.

## Wall numbers (observed on these legs, report-only)

NOT measured by this pre-seat census: national /
table / wins are not reported as wall numbers here
— no values are invented for them. Observed leg
maxima from these 30d pre-seat legs (report-only,
not a wall measurement): P1/CS maxWaveUnlocked 1,
waveKills {1: 2}; BARE maxWaveUnlocked 1, waveKills
{1: 3}; P3 maxWaveUnlocked 2, waveKills {1: 8,
2: 1}. Survived window: P3 only (30d); village-lost:
P1/CS day 24, BARE day 18.

## Blanks filled or documented

- Filled (this arm, measured): the 17549 death cause
  on all three dying policies, dated and quoted —
  the scattering on a three-night pantry-empty fuse
  (P1/CS night 24, BARE night 18), with the
  expedition-lumpy supply, PRODTHROTTLE no-bank
  behavior, fished-out creek, unripe garden, and
  wounded-rest workforce threads itemized.
- Filled (this arm, measured): the P3 survival
  contrast — same collapse, fuse broken twice at
  one night by an away scholar who draws no meal
  and by overnight inflows.
- Filled (this arm, measured): P1 and creekseek are
  corpus-identical on 17549 (sayLines + decisions),
  so the death chain is one chain, not two.
- Filled (this arm, measured): the sickness and
  combat threads are dated and ruled out as the
  game-over cause (wound fever kills two; monster
  kills stop after day 18; the game-over line is
  the scattering with the scholar alive).
- Documented (this arm, NOT a fix): the relief
  passivity — HUNGER WINTER relief options are
  offered on every policy and never visibly taken
  (no take line in any corpus; competent day-parts
  idle on "You wait."). Whether a policy SHOULD
  take relief is a design question for the
  coordinator backlog, not a verdict here.
- Documented (this arm, NOT resolved): the P3 reset
  mechanism — the streak-breaking inflows on nights
  18→19 and 25→26 are observed (morning snapshots +
  "Haven eats again") but not itemized by any
  deposit line in the transcript. A future arm must
  instrument sleep pantry flows to name them.
- Documented (this arm, recurring observation, NOT
  a verdict): six days at 0 kcal with undiminished
  activity before starvation death (BARE days 7-13;
  same class as awayeve's 17545 observation) —
  kcal semantics behind that run are not established
  by this trace.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (chain >= 2/3 dying policies + P3
  contrast + competing chains resolved + sense pass):
  FOUR OF FOUR MET. No metric was re-scored mid-run.
  The P1 pilot-gate leg was traced first (chain +
  quotes) before creekseek, BARE, and P3 were judged;
  the P1/CS identity result (mechanically verified,
  not assumed from awayeve's transcript comparison)
  is what lets bar (a) cover both stacks with one
  chain. No new leg was run: the contingency
  (new-base leg if a link lacked evidence) never
  triggered, because every link carries a corpus
  quote.
- Whether the deaths list or the sleep narration is
  authoritative when they disagree: no disagreement
  was found on these legs — the deaths list and the
  Codex "X is dead" lines agree on Imani (day 23)
  and James (day 24) modulo the id/name mapping
  (gen_q2zun5n ↔ Imani is inferred from same-day
  coincidence, stated as inference, not identity;
  the chain does not depend on it, since sickness
  is ruled out either way).
- Whether a village-meal draw quoted from sleep
  lines may be summed into the pantry trajectory:
  NO under this prereg, and it was not — trajectory
  numbers are snapshots only; meal draws are quoted
  gross flows. (Note for the next run: the item-list
  pantry and the abstract village-pantry number the
  endDay check reads can disagree transiently — the
  P3 reset nights are the visible symptom — so a
  future arm should instrument both numbers, not
  one.)
- Whether "Haven eats again" proves food arrived:
  it proves the endDay check found the pantry
  non-empty that night; the morning snapshot is the
  evidence for what arrived, and a reset without a
  named deposit line is reported as an unnamed
  inflow, per the prereg. P3 carries two such
  unnamed inflows; they are the arm's stated gap.
- Carried doubt for the NEXT run: if supply is
  expedition-lumpy while demand is steady, the next
  question is which supply leg (expedition returns,
  NPC forage, scholar unloads, garden, fish) is the
  live lever on fresh seeds — but that comparison
  is for the NEXT run; this run is judged on the
  chain it pre-registered. A second carried doubt:
  whether the competent policy should take HUNGER
  WINTER relief is a design question, not a
  measurement this arm can answer.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express a single-seed death-cause trace, a pantry
trajectory with hungry-day streaks, game-over
lines, or policies that are not in the registry
(creekseek, BARE-competent as a census stack) —
the same declaration every prior strand arm made,
stated in the prereg before judging. There is no
before/after comparison in this arm (DIAG trace, no
lever), so no panel comparison is attached and none
is fabricated; the panel tool was not invoked on
this corpus.

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current evidence/2026-11-01/sim-death17549-b-census-p1-30d.json
--metrics national,table,wins,exiled` prints LOUD
"national/table/wins disappeared: baseline 12/16/16
-> current 0 (n=1 files)". Investigated as a
missing-field artifact, same class as strandwide's,
confirmednight's, and awayeve's rounds: this census
carries no national/table/wins/exiled fields at all
— the check ingests a census file where the baseline
expects per-seed sweep rows, so 0 means "field
absent", not "wall moved". No genuine LOUD signal.
Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH commits in
   this arm (prereg, instruments + censuses) —
   committed files showing staged-as-deleted while
   byte-identical in the worktree. Repaired each
   time via `git update-index --add --cacheinfo`
   from HEAD blobs; `git status --short` empty +
   `git diff HEAD` empty verified after each repair.
   The commits themselves were never in doubt (blob
   hashes match). The coordinator should verify the
   same way after the final commit below.
2. Diff guard at evidence time: `git diff --name-only
   2debb6756 -- src/ scripts/policies/` shows
   NOTHING (no game code, no existing policy file
   moved under measurement; the only new scripts
   are scripts/analyze-death17549-b.js and
   scripts/test-death17549-b.js, neither under
   scripts/policies/).
3. EPERM flap: NOT observed on file writes in this
   window (all analyzer runs, census writes, and
   commits landed first-try; one background exec
   session was slow to report but its content was
   supplementary and the chain does not depend on
   it).
4. No new sim leg was run in this arm (corpora
   reused from awayeve, per the prereg); no .jsonl
   leftovers exist for this arm at evidence time.

## Proof

scripts/test-death17549-b.js: pure 31/31 (pantry
trajectory deltas incl. first-day null overnight;
hungry streak Day 1/2/3 + scattering, reset on
"Haven eats again", second Day 1 not Day 2;
game-over classification scattering / extinction /
no-successor / none, with a flashback line correctly
NOT classified as scattering; succession days;
quoted-flow extraction forage / expedition / unload /
meal / keep-only; sleep-slice bounds; corporaIdentical
true/false; analyze wiring on a synthetic corpus).
Corpus checks: every analyzed leg errs 0 (awayeve
gate); P1 vs creekseek corporaIdentical true
(sayLines + decisions); hungry markers P1/CS
nights 22/23/24, BARE nights 16/17/18, P3 Day-1
nights 18/25 with resets 19/26; game-over
classification scattering on all three dying legs,
none on P3. Diff guard: see infrastructure note 2.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-11-01/sim-death17549-b-prereg.md
  (commit c85a8c27)
- Evidence (this file): evidence/2026-11-01/
  sim-death17549-b.md
- Instruments: scripts/analyze-death17549-b.js,
  scripts/test-death17549-b.js (instruments commit
  80bbc3ed; absencehunt/creekseek drivers and
  absencehunt/confirmednight/strandtile/awayeve
  analyzers reused verbatim from the base)
- Censuses (analyzer output, one per policy):
  evidence/2026-11-01/sim-death17549-b-census-p1-
  30d.json, sim-death17549-b-census-creekseek-30d.
  json, sim-death17549-b-census-bare-30d.json,
  sim-death17549-b-census-p3-30d.json (commit
  80bbc3ed)
- Source corpora (prior arm, reused not re-run):
  evidence/2026-11-01/sim-awayeve-b-corpus-pilot-
  p1-30d, sim-awayeve-b-corpus-pilot-creekseek-30d,
  sim-awayeve-b-corpus-pilot-bare-30d,
  sim-awayeve-b-corpus-pilot-p3-30d (seed 17549
  files)
- No sim-findings.md append by this worker
  (coordinator owns the backlog): out-of-scope gaps
  are noted in the "Blanks" section above and in the
  coordinator notes below for the coordinator to file.

## Coordinator notes (out-of-scope gaps, for the backlog — NOT filed by this worker)

- HUNGER WINTER relief passivity: relief options
  (triage, rations, hunt, rally) are offered on every
  policy on this seed and never visibly taken; the
  competent/deed policies idle through crisis
  day-parts. Whether a policy should take relief is
  a design question (steve-call candidate), not a
  measurement verdict.
- P3 reset mechanism unnamed: the streak-breaking
  inflows on nights 18→19 and 25→26 are observed but
  not itemized by any deposit line; a future arm
  needs sleep pantry-flow instrumentation (both the
  item-list pantry and the abstract village-pantry
  number) to name them.
- Kcal semantics at 0: BARE's scholar runs six days
  at 0 kcal with undiminished activity before
  starvation death (same class as awayeve's 17545
  observation); needs a kcal-mechanics read before
  anyone files it as a bug.
- Next-blank candidate from this trace: which supply
  leg (expedition returns, NPC forage, scholar
  unloads, garden, fish) is the live lever on fresh
  seeds — the expedition-lumpy vs steady-demand
  shape is now measured on one seed and needs a
  band before anyone levers on it.
