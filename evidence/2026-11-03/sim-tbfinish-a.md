# TB turn-economy decomposition — Loop A, run fleshout-20261103T2315Z, arm sim-tbfinish-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js, zero game-code change. This arm answers
tbleth's single next blank: where does each round of a wave-4+
turn-based (TB) fight go? It does not fix anything — the fix
arm is named precisely at the end, with its own prereg to come.

## Pre-registration (committed before any judged sim)

`evidence/2026-11-03/sim-tbfinish-a-prereg.md` (commit c8303177d4).
Policy `scripts/policies/competent.js` `{competent}` VERBATIM
(at THIS anchor — see calibration), default env. Seeds
99101–99108 (the 1819/w4convert/tbleth band). Horizon 140 days,
death-aware. Balanced panel (§15): INAPPLICABLE — a pure
diagnostic with no before/after change, so no comparison is
fabricated; the binding checks are the calibration gate plus
the damage-ledger reconciliation.

Instrument commit 6ec7d1e21 (proof
`scripts/test-tbfinish-20261103.js` 4/4 before the leg).
Analyzer correction commit 2e506355 (post-leg, scripts-only:
movesSpent/movesAvailable now read action pre/post moveLeft —
see metric review; turn classes are untouched by it, and all
aggregations below were re-run against the corrected analyzer
with identical classes).

## Calibration gate — DIVERGED, re-baselined (run before the prereg)

The UNMODIFIED w4convert census driver rerun on seed 99107 at
this anchor (HEAD 42f0bd49f) gives days 38, village-lost,
spawnsW4 0, tbCalls 0, fieldsW4 0, killsW4 0, maxWave 3 —
against 1819's days 80 / 3 spawns / 2 TB / 2 kills. A second
run (RUN=tbfinish-calib2) reproduces the diverged result
EXACTLY, including the full deathEvents list: a deterministic
base move, not a flaky run. Driver, instrument, and harness
are unchanged between anchors; `src/js/game.js` (+178) and
`scripts/policies/competent.js` (+237) changed (gap-audit11
legs 1+2, gap-batch 13/14/15/17, hurttraveler narration).
Consequence, as pre-registered: the baseline for this arm is
THIS anchor's band as the judged leg measures it, never the
1819 numbers. Full cause analysis is in the prereg.

## Judged leg totals (this anchor, same band)

| seed | days | end | spawnsW4 | TB starts | fieldW4 | kill rows | TB kills |
|------|------|-----|----------|-----------|---------|-----------|----------|
| 99101 | 134 | lost | 14 | 9 | 19 | 1 | 0 |
| 99102 | 115 | lost | 8 | 8 | 1 | 1 | 1 |
| 99103 | 75 | lost | 6 | 8 | 1 | 0 | 0 |
| 99104 | 66 | lost | 2 | 7 | 0 | 0 | 0 |
| 99105 | 140 | SURVIVED | 12 | 12 | 24 | 1 | 0 |
| 99106 | 78 | lost | 16 | 7 | 9 | 1 | 1 |
| 99107 | 38 | lost | 0 | 0 | 0 | 0 | 0 |
| 99108 | 42 | lost | 0 | 0 | 0 | 0 | 0 |
| TOTAL | — | 7 lost, 1 survived | 58 | 51 | 54 | 4 | 2 |

Instrument health: 0 instrument errors on all 8 seeds, 0
unended TB exposures, 0 unclassified exposures, 0 unclassified
turns (every one of the 284 recorded player turns lands in
exactly one pre-registered class). Kill rows: 4 total — 2 TB
kills (linked, see below) + 2 field kills (correctly
unlinked: 99101 eater via 'wild' by visjoin_104, 99105
algorithm via 'wild' by olivia_bennett — field kills, not TB
misses). One orphan TB end (99102 suburb rout — a scripted
zero-turn episode, proven below, not a missed fight).
Damage ledgers reconcile (gap 0) on every exposure's monster
bodies, including both kills (see "Ledger").

Note the band move in one line: 1819 had 23 TB fights and 2
kills; this anchor has 51 TB fights and 2 TB kills. More
fights, same kills — the kill rate per TB exposure fell from
0.087 to 0.039, and two seeds (99107, 99108) now produce no
wave-4 TB fight at all (villages die day 38/42, maxWave 3).
99105 is the only survivor (140d, 12 TB fights, 0 TB kills —
it survives by outlasting its scholars' deaths, not by
winning fights).

## The answer in one paragraph (plain words)

A turn-based wave-4 fight gives the fighter ONE verb per
round — never two. Of 284 recorded player turns, 151 are
strikes (53%), 40 are ability presses (14%), and 90 are moves
(32%) — but only 17 of those moves actually move the fighter
anywhere. The other 73 moves go nowhere: 39 are steps to the
tile the fighter already stands on, 30 fail with "No path
there" (terrain-blocked), 3 fail with "Too far" (the step
costs more than the turn's movement), 1 fails on an occupied
tile. Fighters never strike and move in the same round (0
move-strike turns in 284): closing distance costs a whole
round, striking costs the next. When hurt (median 21% HP),
fighters try to flee — 48 flee turns — but not one escape
ever happens: no barrier push is ever attempted (0
tbBarrierExit calls band-wide), because the flee gates are
off by default and the legacy walk-to-the-edge fails on
unpathable edge tiles or on its own tile. And when healthy,
fighters sometimes press Rage instead of striking — 35 Rage
presses, 10 in a row in one fight, burning 600 kcal for a
buff that is never used, because the policy presses again
next round instead of striking. Monsters, for their part,
spend nearly half their turns telegraphing, holding a
telegraph, or not damaging (158 of 475 monster turns) — the
fighter survives as long as it does because the beast keeps
winding up, not because the fighter holds its ground.

## Turn-economy table (284 player turns, rounds 2+; round 1 below)

| class | turns | share | what it is |
|-------|-------|-------|------------|
| strike | 151 | 53% | one strike, landed (154 attempted, 151 landed) |
| flee-attempt | 48 | 17% | a move ending on an edge tile; 0 barrier pushes |
| move-only | 42 | 15% | a move, nothing else (32 of them move 0 tiles) |
| trick-or-ability | 40 | 14% | all 40 are ability presses (rage 35, pocket_sand 4, war_cry 1); 0 shouts, 0 offers, 0 studies, 0 talks |
| failed-strike | 3 | 1% | all 3 are empty ranged weapons (no bolts / no arrows) |
| wait | 0 | 0% | the policy NEVER waits in a wave-4 TB fight |
| strike-missed | 0 | 0% | every strike that was attempted and able to fire, landed |
| move-strike | 0 | 0% | never move and strike in one round |
| stunned-full | 0 | 0% | no stuns in the band |
| no-action | 0 | 0% | every recorded turn has exactly one verb |

Every recorded turn has EXACTLY ONE action call. The engine
permits move-then-strike (tbPlayerMove never sets acted;
only a strike sets it) — the policy's beastStrikeTarget
returns 'moved' after closing instead of striking. The
one-verb-per-round shape is a policy choice, not an engine
law.

## Move census (90 move actions)

| outcome | count | mechanism |
|---------|-------|-----------|
| self-move, edge tile, returned true | 39 | already on the x-edge; the flee walk targets the fighter's own tile; the engine charges 1 move and stays put |
| "No path there" to an edge destination | 24 | flee walk to x=0/8; world terrain blocks the route (findPath reads world detail; blocked cells partition the grid) |
| "No path there" to an interior destination | 6 | terrain-trapped closing/trick moves (see the 99106 influencer fight) |
| "Too far" to an edge destination | 3 | flee walk whose path costs more than the turn's movement |
| occupied-tile refusal | 1 | destination shared with a monster body |
| real moves (1 / 2 / 3 tiles) | 17 | 10 closing, 5 onto-edge, 2 along-edge |

73 of 90 move actions (81%) move zero tiles. 80 of 284 turns
(28%) are spent on movement that achieves nothing if the
failed-move move-only turns are counted with the flee turns
(73 zero-tile-move turns + 7 real-move flee turns are the
move-action turns; the 73/284 = 26% figure is the
zero-tile-move turns alone). Either way: more than a quarter
of all fighter rounds are spent standing still while the
action log says "move".

Movement budget: action-pre moveLeft is usually 3 (213
turns), but 1 in 11 exposures (66 turns) — the fighter moves
1 tile per round for the whole fight (burden/slow scholars;
the budget is per-scholar and persists across the fight).
Closing from spawn distance (2–3 tiles) therefore costs
1–3 rounds before the first strike can land.

Out of range at turn start: 42 of 284 turns (15%) — mostly
opening/closing turns. Strike turns start at median 72% HP;
flee turns start at median 21% HP: healthy fighters strike,
hurt fighters flee, and the flee never works.

## Monster turns (475 NPC turns: 385 monster + 90 ally)

| class | turns | note |
|-------|-------|------|
| damage | 186 | the only monster class that hurts the fighter |
| telegraph | 61 | windup newly set |
| telegraph-held | 59 | windup present, not newly set |
| non-damage | 38 | moves, narrates, or otherwise does not hit |
| finisher | 3 | the eulogy narrated ending (see below) |
| ally-damage | 77 | allies strike beside the fighter |
| ally-other | 33 | ally turns with no damage |
| ally-move | 11 | |

Monsters deal damage on only 186 of 385 monster turns (48%).
The fighter's staying power comes substantially from monster
windup rounds, not from fighter defense: a beast that hit
every round would kill in ~4 hits (tbleth's ~26 net per hit
vs 100 HP), but telegraphs and non-damage turns stretch
fights to a median 5 rounds.

## The flee loop (the largest single waste)

48 flee-attempt turns + 32 failed-move move-only turns that
are the same walk in disguise (a failed edge-walk does not
reach the edge, so it classifies move-only, not
flee-attempt — the class is kept as pre-registered; this
paragraph is its composition, not a re-score). The walk:
the policy's legacy flee path targets the nearest x-edge
(tx = 0 or 8, same y). Three ways it dies, all observed:

1. Already on the edge (39 turns): the target IS the
   fighter's tile; tbPlayerMove charges a move and stays.
2. Terrain-blocked (24 turns): "No path there" — findPath
   over world detail finds no route to the edge tile.
3. Budget-blocked (3 turns): "Too far" — the edge path costs
   more than the turn's movement.

Why nothing else happens: the escape itself is
tbBarrierExit, a deliberate push THROUGH the edge — and it
is never called (0 times band-wide, all seeds). The gates
that would change this are all off by default:
COMPETENT_DPS_RACE, COMPETENT_DIRECTIONAL_FLEE, and
COMPETENT_EXIT_VERIFIED_FLEE (which would mark a fight
unfleeable after 3 no-progress turns and make the fighter
fight it out). With all three off, the fighter walks to the
edge, fails, and repeats until death. Outcomes confirm it:
fled 0/51 exposures. The policy DOES have a stuck-flee
resolution (fight it out after 3 stuck turns) — it is gated
off, so it never fires.

Sharpest case: 99101 eulogy, day 75, party 3 — 4 flee turns,
0 strikes, 0 damage dealt, fighter dies. Its turns pass in
silence: a self-move says nothing, so the transcript shows
turn banners and monster narration with no fighter action
at all (see sense-testing).

## The Rage loop (the second waste)

35 Rage presses across 8 fights; in 6 of those fights the
fighter lands 0 strikes in the entire fight. Worst case:
99102 influencer, day 74 — 10 Rage presses in rounds 2–11
(600 kcal, "Your next 3 strikes deal +100% damage" 10
times), 0 strikes, then 2 flee turns, then death. The
mechanism: abilityPressPlay presses Rage whenever the
fighter is "winning" (HP >= 50%) and the fight is
non-trivial, and Rage has no once-per-fight gate (unlike
Bird Strike, which is gated to once per fight). The buff is
never consumed because next round the policy presses Rage
again instead of striking. The loop ends only when HP falls
below 50% — then fleeing takes over, and the fighter dies
having dealt 0 damage in 13 rounds. The same shape recurs
on 99105 algorithm (9 Rage presses + 6 move-only turns, 0
strikes, 16 rounds, death) and 99106 eulogy (5 Rage presses,
0 strikes, death by the round-6 finisher). Total: 40
ability turns, 35 of them Rage, and the Rage turns produce
no damage — the buffs are bought and never spent.

Trick/ability availability, stated exactly: trickKnown is
False in all 51 exposures; shouts 0, food-offers 0, studies
0, talks 0 in wave-4 TB fights (the single offerFood wrap
count on 99101 is a lower-wave fight). Counters are never
known and never attempted here — not because fighters
refuse them, but because the policy only attempts tricks it
already knows (codex 'slain' or discovered), and no wave-4
counter is known in this band.

## The eulogy clock (confirmed, and bounded)

3 eulogy finishers, ALL in round 6 (landed 4357 / 3831 /
3378 after armor; requested 9999), on 99102 day 98, 99103
day 73, 99106 day 78 — tbleth's round-6 narrated finisher
reproduces exactly. But it decides only 3 of 13 eulogy
fights: the other 10 end earlier to normal damage (median
eulogy fight: 4 player turns, 2 strikes). The clock is a
hard deadline for fighters who SURVIVE to round 6, not the
usual cause of eulogy deaths. Eulogy fights total: 13
exposures, 0 kills, 24 leader strikes, 949 leader damage —
the weakest damage-per-strike profile among common kinds
alongside the eater (below).

## The eater (flat absorption, 1 fight)

99102 eater, day 111: 4 strikes deal 11 damage total
(requested 3/1/4/1). Transcript: "(eater's hide absorbs
12.)" before the strike lines. Read: the hide absorbs a
flat ~12 per strike, so ordinary strikes net 1–5. One fight
is not a measurement of the absorption value — it is the
mechanism, transcript-verified, for why eater fights deal
almost nothing. (Tbleth: eater 0/3; here 0/1, same shape.)

## Terrain traps (a third, smaller waste)

6 interior "No path there" moves + the 99106 influencer
fight in full: the fighter stands at (4,7) with moveLeft 1
for 9 rounds, tries (3,5) then (0,7), every move fails
"No path there", HP 76 → 3, monster at (4,4) hitting every
other round, death at round 11 with the monster at 637/850
HP. The fighter is walled off by world terrain (findPath
reads world detail; blocked cells partition the grid) while
the monster — which does not path through findPath — closes
and hits. The policy never falls back (no strike is possible
at distance 3, no wait is ever used, no alternate route is
tried — the same destination is retried until death).

## Round 1 — characterized, not per-fight censused (read this)

Every fight's round-1 player turn is missing from the
per-turn records, for a proven instrument reason: the
opening pass runs INSIDE startCombat (turnIdx -1, then
tbAdvance stops at the player turn), before the exposure
object exists, so tbBeginTurn cannot open a turn record for
it. The gap is bounded, not open-ended:

- A one-seed debug run (99102, deterministic re-run: same
  115 days, 8 exposures, 1 orphan, 0 errors) recorded the
  round-1 action of every wave-4 exposure on that seed:
  8/8 are tbPlayerMove (4 returned true, 4 false) — a
  closing move, never a strike, ability, or wait.
- Band-wide hit evidence agrees: ZERO round-1 leader hits
  on monsters in 51 fights (all turnSeq-null hits are
  monster/ally-turn hits: 185 monster-on-player, 77
  ally-on-monster, 8 monster-on-villager). No round-1
  strike, no round-1 ability damage, anywhere.
- Therefore: round 1 is a closing-move round in every
  observed case, and the censused table (284 turns) misses
  exactly one move turn per fight (~51 turns, ~15% of all
  turns), zero strikes, zero damage. The strike economy
  (151 landed), the flee/rage findings, and the lever
  recommendation are unaffected in kind; the move-only
  share is understated by that one closing turn per fight.
- The next arm's instrument must capture round 1 (pending
  buffer: record opening turns during startCombat into a
  pending record and attach it to the exposure after the
  call returns — specified here so the fix is mechanical,
  not a re-investigation).

## The suburb orphan — proven, not a missed fight

99102 has 1 orphan tbEnd: day 66, suburb, result 'routed',
monster fled at full HP (1390/1390). The debug run proves
the mechanism: the day-66 startCombat call for the suburb
creates NO fight (fight unchanged, null before and after),
and the tbEnd('routed') fires INSIDE a startCombat call —
the suburb episode starts and ends inside a single call
with zero turns played (no day-66 turn, no day-66 action,
monster untouched). It is a scripted rout (canon: the
Suburb is escaped, not killed), not a TB fight the
instrument missed. It is counted as an orphan because the
instrument honestly reports ends it cannot attach — and it
is the reason the verdict below carries a named miss
instead of a clean GO. The next arm's prereg should
pre-register zero-turn routs as a non-exposure class.

## Ledger (pre-registered reconciliation)

Every exposure's monster bodies reconcile with gap 0,
including both kills:
- Congregation kill (99102 day 65, party 4): startHp 1042,
  dealt 1043 (leader 576 + ally 467), endHp -1, gap 0.
  Killing blow by companion rosa_mendez (via 'companion').
  13 leader strikes + 3 flee turns; 17 rounds; the only
  kill where allies carry nearly half the damage.
- Strike kill (99106 day 75, solo): startHp 750 vs maxHp
  1000 — the beast entered the fight already wounded
  (750/1000); dealt 796, endHp -46, gap 0. Killing blow by
  the scholar (via 'player'). 15 strikes, 1 closing move,
  17 rounds. Note the wound: the solo kill needed a
  pre-wounded beast; no fresh wave-4 beast was solo-killed
  in this band.
No healing gap appears on any monster body. Human HP is
reported as start/end snapshots, never as a tbDamage sum
(patches and non-tbDamage heals exist outside the ledger —
same caveat as tbleth).

## Per-kind table (51 exposures)

| kind | n | kills | player turns | leader strikes | leader dealt | notes |
|------|---|-------|--------------|----------------|--------------|-------|
| reunion | 18 | 0 | 72 | 35 | 1394 | commonest; never killed |
| eulogy | 13 | 0 | 46 | 24 | 949 | 3 round-6 finishers; rest die earlier |
| algorithm | 9 | 0 | 53 | 18 | 720 | 2 rage-loop fights (3+9 presses) |
| influencer | 5 | 0 | 54 | 26 | 895 | 10-rage fight; 9-move terrain trap |
| suburb | 2 | 0 | 20 | 14 | 435 | +1 scripted rout (0 turns, excluded) |
| congregation | 1 | 1 | 16 | 13 | 576 | party-4 kill; ally damage 467 |
| strike | 1 | 1 | 16 | 15 | 796 | solo kill of a pre-wounded beast |
| eater | 1 | 0 | 4 | 4 | 11 | flat ~12 hide absorption |
| audit | 1 | 0 | 3 | 2 | 147 | |
| TOTAL | 51 | 2 | 284 | 151 | 5923 | leader damage in player turns only |

Lost fights only: median 2 leader strikes (tbleth: 3),
median 5 rounds (tbleth: 6), median dealt fraction 0.05
(tbleth: 0.16). The race got worse at this anchor: a lost
fight now deals a median 5% of the beast's HP, and 12 of 49
lost fights land 0 strikes. Kill rate per TB exposure:
2/51 = 0.039 (1819: 2/23 = 0.087).

## Per-exposure table (all 51; rounds = tbEnd round; turns = recorded player turns, rounds 2+)

| seed | day | kind | outcome | party | rounds | turns | strikes | dealt | frac | turn classes |
|------|-----|------|---------|-------|--------|-------|---------|-------|------|--------------|
| 99101 | 75 | eulogy | died | 3 | 5 | 4 | 0 | 0 | 0.00 | flee 4 |
| 99101 | 104 | algorithm | died | 1 | 10 | 8 | 4 | 347 | 0.35 | move 4, strike 4 |
| 99101 | 105 | reunion | died | 1 | 5 | 4 | 2 | 29 | 0.02 | strike 2, flee 2 |
| 99101 | 106 | reunion | died | 1 | 5 | 4 | 2 | 21 | 0.02 | move 1, strike 2, flee 1 |
| 99101 | 107 | reunion | died | 1 | 2 | 1 | 0 | 0 | 0.00 | flee 1 |
| 99101 | 109 | reunion | died | 1 | 6 | 5 | 1 | 39 | 0.03 | strike 1, failed 2, flee 2 |
| 99101 | 114 | reunion | died | 1 | 6 | 5 | 4 | 241 | 0.20 | strike 4, flee 1 |
| 99101 | 135 | algorithm | died | 1 | 5 | 3 | 2 | 135 | 0.14 | strike 2, flee 1 |
| 99101 | 135 | reunion | died | 1 | 4 | 3 | 2 | 154 | 0.13 | strike 2, move 1 |
| 99102 | 65 | congregation | KILL | 4 | 17 | 16 | 13 | 1043 | 1.00 | strike 13, flee 3 |
| 99102 | 74 | influencer | died | 1 | 13 | 12 | 0 | 0 | 0.00 | ability 10, flee 2 |
| 99102 | 74 | influencer | died | 2 | 11 | 10 | 8 | 522 | 0.61 | strike 8, ability 1, move 1 |
| 99102 | 74 | influencer | died | 1 | 9 | 8 | 6 | 43 | 0.05 | move 2, strike 6 |
| 99102 | 91 | influencer | died | 1 | 16 | 15 | 12 | 408 | 0.44 | strike 12, flee 3 |
| 99102 | 98 | eulogy | died | 3 | 6 | 5 | 5 | 144 | 0.16 | strike 5, FIN6 |
| 99102 | 111 | eulogy | died | 1 | 4 | 3 | 3 | 40 | 0.04 | strike 3 |
| 99102 | 111 | eater | died | 1 | 6 | 4 | 4 | 11 | 0.01 | strike 4 |
| 99103 | 61 | reunion | died | 2 | 12 | 10 | 4 | 294 | 0.24 | strike 4, ability 2, flee 4 |
| 99103 | 62 | reunion | died | 1 | 5 | 4 | 0 | 0 | 0.00 | ability 3, flee 1 |
| 99103 | 72 | eulogy | died | 1 | 3 | 2 | 0 | 0 | 0.00 | ability 1, flee 1 |
| 99103 | 73 | eulogy | died | 2 | 6 | 5 | 3 | 266 | 0.30 | strike 3, ability 2, FIN6 |
| 99103 | 74 | eulogy | died | 1 | 4 | 3 | 2 | 102 | 0.11 | strike 2, flee 1 |
| 99103 | 74 | eulogy | died | 1 | 4 | 3 | 2 | 62 | 0.07 | strike 2, move 1 |
| 99103 | 75 | eulogy | died | 1 | 2 | 1 | 0 | 0 | 0.00 | flee 1 |
| 99103 | 76 | eulogy | died | 1 | 4 | 3 | 2 | 88 | 0.10 | strike 2, flee 1 |
| 99104 | 56 | audit | died | 2 | 5 | 3 | 2 | 199 | 0.16 | strike 2, flee 1 |
| 99104 | 61 | reunion | died | 4 | 4 | 3 | 2 | 142 | 0.04 | strike 2, move 1 |
| 99104 | 61 | reunion | died | 1 | 3 | 2 | 2 | 15 | 0.01 | strike 2 |
| 99104 | 62 | reunion | died | 1 | 6 | 5 | 2 | 155 | 0.13 | ability 2, strike 2, move 1 |
| 99104 | 62 | reunion | died | 1 | 5 | 4 | 3 | 120 | 0.10 | strike 3, move 1 |
| 99104 | 62 | reunion | died | 1 | 4 | 3 | 2 | 10 | 0.01 | strike 2, move 1 |
| 99104 | 63 | reunion | died | 1 | 6 | 4 | 0 | 0 | 0.00 | ability 2, flee 2 |
| 99105 | 80 | reunion | died | 1 | 4 | 3 | 0 | 0 | 0.00 | flee 3 |
| 99105 | 81 | algorithm | died | 1 | 5 | 4 | 0 | 0 | 0.00 | ability 3, flee 1 |
| 99105 | 81 | algorithm | died | 1 | 16 | 15 | 0 | 0 | 0.00 | ability 9, move 6 |
| 99105 | 81 | algorithm | died | 1 | 4 | 3 | 1 | 17 | 0.02 | move 2, strike 1 |
| 99105 | 82 | algorithm | died | 1 | 7 | 6 | 2 | 29 | 0.03 | move 1, strike 2, flee 3 |
| 99105 | 82 | algorithm | died | 1 | 7 | 6 | 4 | 59 | 0.06 | strike 4, move 2 |
| 99105 | 82 | algorithm | died | 1 | 5 | 4 | 3 | 47 | 0.05 | strike 3, move 1 |
| 99105 | 99 | eulogy | died | 1 | 5 | 4 | 2 | 158 | 0.18 | move 1, strike 2, flee 1 |
| 99105 | 131 | reunion | died | 1 | 6 | 5 | 3 | 138 | 0.12 | move 1, strike 3, flee 1 |
| 99105 | 131 | reunion | died | 4 | 3 | 2 | 2 | 26 | 0.01 | strike 2 |
| 99105 | 131 | suburb | died | 4 | 11 | 10 | 7 | 203 | 0.16 | strike 7, failed 1, move 2 |
| 99105 | 139 | suburb | died | 1 | 11 | 10 | 7 | 289 | 0.22 | move 1, strike 7, flee 2 |
| 99106 | 62 | eulogy | died | 1 | 5 | 4 | 2 | 109 | 0.12 | strike 2, flee 2 |
| 99106 | 63 | eulogy | died | 1 | 5 | 4 | 3 | 157 | 0.17 | strike 3, flee 1 |
| 99106 | 75 | strike | KILL | 1 | 17 | 16 | 15 | 796 | 0.80* | move 1, strike 15 |
| 99106 | 76 | influencer | died | 1 | 11 | 9 | 0 | 0 | 0.00 | move 9 |
| 99106 | 78 | eulogy | died | 1 | 6 | 5 | 0 | 0 | 0.00 | ability 5, FIN6 |
| 99106 | 78 | reunion | died | 1 | 6 | 5 | 4 | 242 | 0.20 | strike 4, move 1 |
| 99106 | 78 | algorithm | died | 1 | 5 | 4 | 2 | 86 | 0.09 | flee 2, strike 2 |

\* Strike-kill frac uses maxHp (1000); against startHp (750,
pre-wounded) the dealt fraction is 1.06 (overkill). Dealt
figures are leader damage in player turns + ally damage
where the ledger sums it (congregation 1043 includes ally
467); per-exposure "dealt" here is the ledger total, so
frac = ledger dealt / summed maxHp.

## Village assessment (plain words + sense-testing)

Picture eight villages playing competently for up to 140
days at this anchor. Seven die; one survives. Wave-4 beasts
show up often (58 spawns, 51 turn-based fights), but the
fights go the same way almost every time: the scholar
walks up, lands a few good hits — or spends the fight
trying to walk somewhere the ground won't let them go, or
pressing Rage again and again while the beast's audience
grows — and dies with the beast still standing at most of
its health. The two villages that kill do it the same way
tbleth saw: many rounds of steady strikes (13 and 15) plus,
in one case, allies striking beside the scholar. Everywhere
else the story is a short fight that never becomes a
contest: a median 2 strikes, 5% of the beast's health gone,
dead by round 5.

The sense-test passes on coherence and flags three things,
one of them serious:

1. REPETITION (flavor, not logic): "A pew-tooth cracks.
   The bell rings off-key." after 37 strikes in the
   congregation kill; "Too close. The attention SNAPS to
   you" 16x; the rage trio ("The red comes down… / You
   focus — that costs your action. / −60 kcal") 10x in one
   fight. The lines are coherent; their verbatim repeat
   every round is the robotic part.
2. SILENT FLEE TURNS (a real readability gap): the
   self-move (step to your own tile) says nothing, so a
   flee-loop fight reads as turn banners and monster
   narration with no fighter action at all. A watching
   player sees rounds pass with no explanation of what
   their fighter just did — because, mechanically, it did
   nothing, and the game does not say so.
3. ROBOTIC POLICY LOOP (the serious flag): the 10x Rage
   fight does not read like a person. A person who has
   pressed Rage twice with no strike to spend it on does
   not press it eight more times while the influencer's
   followers multiply and the Ratios land. The transcript
   is coherent line by line; the SEQUENCE is a loop no
   person would run. Same shape, smaller, in the 9-move
   terrain trap (same failed destination retried 9 rounds)
   and the 4-round silent flee loop.

Nothing else robotic was flagged: killers are named (a
companion's killing blow credited to rosa_mendez), deaths
follow fights with mantle transfer and the "You wake up
somebody else" exchange, and the eulogy's narration
(spotlight narrows, Final Chapter windup) reads as a
story being told, not a counter incrementing.

## Metric review (§14 — no in-run re-scoring)

- No metric was re-scored. Turn classes, outcome classes,
  and the ledger rule are exactly as pre-registered. The
  flee-attempt class is reported with its composition
  (barrier pushes 0; edge-ending moves; and the
  failed-edge-walk move-only turns named alongside it) —
  that composition is analysis OF the class, not a
  redefinition of it.
- Round-1 gap (disclosed, bounded): the per-turn records
  cover rounds 2+ completely (284 turns, 0 unclassified)
  and round 1 is characterized (debug-seed census 8/8
  closing moves + band-wide 0 round-1 strikes/damage)
  but not censused per fight. The next arm's prereg must
  include round-1 capture (pending-buffer spec above) and
  must pre-register zero-turn routs as a non-exposure
  class; neither changes any number in this evidence.
- movesSpent flag correction (analyzer-only, post-leg):
  the original flag read turn start/end moveLeft, which
  are stale by construction (start predates tbBeginTurn's
  reset; end postdates the policy's endTurn zeroing) and
  read 0 everywhere. The corrected flag reads action
  pre/post moveLeft. Turn classes do not use the flag, so
  no classification changed; the correction is committed
  with proof (2e506355) and the aggregations were re-run.
- The orphan clause: see "The suburb orphan" above. The
  prereg's "0 orphan TB ends" letter is missed by exactly
  one proven zero-turn scripted rout. No fight end is
  unaccounted for: every real fight's end attaches to its
  exposure, every kill row is linked or explained as a
  field kill, every ledger reconciles.
- Food/fullness: UNRECORDED as a single field, as in
  tbleth (scholar health/energy recorded instead;
  transcripts show fighters entering well-fed —
  OVERCHARGED lines recur — which bounds the question).
- Horizon note: 140 days was adequate (7/8 villages died
  before the cap; 99105 survived to it). No horizon change
  proposed.

## Verdict — DIAG-GO, with one named miss

0 instrument errors; 0 unended exposures; 0 unclassified
exposures; 0 unclassified turns; all 51 exposures
decomposed with per-round economy (rounds 2+ censused,
round 1 bounded as above); damage ledgers reconciled on
every exposure; every kill row linked or explained; a
ranked turn-economy table plus the fix-arm recommendation
below are produced; proof test 4/4 (plus the post-leg
analyzer correction, re-proven). The single miss against
the pre-registered letter is the orphan clause: 1 orphan
TB end, proven to be a zero-turn scripted suburb rout,
not a missed fight. A strict reading of that clause alone
would say NO-GO; that reading would discard a complete
decomposition over an episode with no rounds to decompose,
so it is reported here as a named miss on an otherwise GO
diagnostic, for the coordinator to weigh. The GO covers
the diagnostic on the current anchor only.

## The single next blank — LONGER STAYING, as a flee-repair arm

The next fix arm is LONGER STAYING, not more swings, not
the eulogy clock, not trick availability — chosen from the
table:

- Flee repair addresses the largest waste: 73 zero-tile
  moves (26% of all turns) + the 48 flee turns they sit in,
  with 0 escapes to show for them. The arm (policy-side,
  own prereg): (1) make the barrier push actually happen —
  enable the directional-flee path at default gates or fix
  the legacy walk so it pushes instead of walking to
  unpathable edge tiles; (2) walk-failure fallthrough —
  when a flee walk fails ("No path there" / "Too far" /
  self-move), the turn falls through to a strike when in
  range instead of ending; (3) enable the stuck-flee
  resolution (fight it out after 3 no-progress turns).
  Pre-register: escapes per flee-triggered fight + strikes
  per fight on identical seeds, judged on this anchor's
  band (calibration gate first — this band moved once
  already). The arm must NOT touch gates/prices/deeds.
- NOT more-swings-per-round as the arm: move+strike in one
  round is engine-legal and policy-foregone, but only ~10
  closing turns per band could pair a strike with their
  move — a small prize next to 73 wasted move turns. Note
  it as a cheap policy tweak for a later arm, not the arm.
- NOT the eulogy clock: it decides 3/51 fights; the other
  10 eulogy fights end to normal damage first. A clock
  answer helps only fighters who survive to round 6.
- NOT trick availability as the arm: trickKnown is False
  everywhere and no counter is ever attempted, which is a
  real gap — but its payoff is unmeasured (unknown
  counters, unknown damage), while the flee repair's
  payoff is measured (80 turns currently spent going
  nowhere). Trick availability is the arm AFTER flee
  repair. Second after that: the Rage gate (once per
  fight, or strike-when-buffed) — 35 wasted presses is
  too big to leave, but smaller than the flee waste.
- NO gear arm, NO gate/price arm: gear is degenerate
  (same as tbleth — leads armed/armored throughout, still
  losing), and gates are untouched by design.

## Proof and landing

- `scripts/test-tbfinish-20261103.js`: 4/4 (turn classes
  incl. all nine + move variants + movesSpent/movesAvailable
  from action deltas, NPC classes, stub known TB fight
  with turn open/close + action attribution + brackets +
  kill linkage + ledger, live-harness smoke).
- Arm commits on branch sim-tbfinish-a: prereg c8303177d4,
  instruments 6ec7d1e21 (scripts only, zero src/js),
  analyzer fix 2e506355 (scripts only). This evidence file
  + the 8 per-seed JSONs (`perseed-tbfinish-a/`) + the 2
  calibration JSONs (`perseed-w4convert-a/*-tbfinish-calib*.json`)
  commit on the same branch, pending coordinator merge
  --ff-only, pending ship (the ship loop owns version
  bumps, pushes, live verification).
- check.js --quick NOT re-run in full: zero src/js changed,
  same standing caveat as prior tooling-only landings; the
  arm's own proof (4/4) was run before the judged leg and
  re-run after the analyzer correction.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; the judged leg
  diverges from 1819 by the documented anchor move, so a
  deviation on this band is expected, not an instrument
  artifact — the calibration control is the evidence).
- Worktree note (for the coordinator): during this run the
  service restart SIGTERMed the judged-leg process after 4
  seeds; the leg was resumed for the remaining 4 seeds and
  completed (all 8 per-seed JSONs present, trajectories
  deterministic). Separately, the worktree index showed
  the documented safe-commit clobber (7 committed files
  staged-as-deleted, worktree bytes identical to HEAD);
  repaired with `git update-index --cacheinfo` per the
  AGENTS.md recipe and verified (`git status` clean apart
  from the new per-seed JSONs, `git diff HEAD` empty)
  before the leg resumed. Commits c8303177d4, 6ec7d1e21,
  2e506355 were verified intact throughout.
