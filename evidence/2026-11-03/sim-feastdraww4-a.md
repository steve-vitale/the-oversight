# sim-feastdraww4-a — feast-cadence arm for wave-4 draws (Loop A, axis scale-onramp)

Verdict: **KILLED** per prereg (cost leg b2 fails in substance).
Policy-side only, zero src/js changes, never bundled with any other arm.
Prereg: scripts/feastdraww4-prereg-20261103.md (with CORRECTION section).
Driver: scripts/feastdraww4-driver-20261103.js. Compare:
evidence/2026-11-03/feastdraww4-compare.md. Per-seed JSONs:
evidence/2026-11-03/perseed-feastdraww4-a/s-{baseline,variant}-s9860x-fdrawpilot.json.
Pilot band 98601–98608, 180d death-aware cap, closecommit baseline stack,
env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1, mode herald.

This run adopted a dead 0518Z run's worktree (branch sim-feastdraww4-a).
Its pilot JSONs and dirty prereg addendum were re-verified from the files
before any judgement: the addendum's pilot numbers recompute exactly
(3->5, starvation 2->2, wrap-attr 0, median 86->86) — but the wrap-attr
0 turned out to be instrument-zero, and the GO built on it does not stand
(see "Why the pilot GO fell" below). The confirm sweep was stopped during
its baseline leg once the kill was established; its two partial baseline
outputs (98701, 98702) were deleted as unjudged and judge nothing.

## Pre-registered legs (pilot, identical seeds)

- (a) seeds with >= 1 wave-4 fought: baseline 3/8 -> variant 5/8,
  delta +2, exactly the GO bar. PASS.
- (b1) total starvation deaths: 2 -> 2, bar baseline+2 = 4. PASS.
- (b2) fighter-attributed arm deaths (scholar deaths inside a fight
  that began as THIS layer's feast draw): wrap count 0, bar <= 2 —
  PASS on the wrap, FAIL in substance (true count 3, see below).
- (b3) median survival (game days): 86d -> 86d, bar 0.8x = 68.8d. PASS.

A miss is NO-GO (MEASUREMENT.md §14). The b2 substance miss kills the
arm even though (a), (b1) and (b3) pass. No re-scoring against a
friendlier metric was done.

## Why the pilot GO fell: the attribution wrap cannot fire

The driver's faceFeastDraw wrap records an arm fight only if
`Game.tbfight.id` is set AFTER the wrapped call returns. In node,
combat runs synchronously and `tbfight` is nulled at fight end
(game.js, party.js), so the post-return check can never fire. The
pilot data proves it from the inside: fdArmFightCount = 0 across all
15 layer draws, while deed fights for drawn monsters exist (variant
98601: audit drawn day 70, audit deed fight day 70). With no fight
ids recorded, the tele wrap can match no scholar death, so
attributedDeaths is structurally 0 on every seed. A zero from this
wrap is no evidence of safety — and the transcripts show the opposite.

Fight-sequence attribution (the fight identity the prereg's b2 intends,
strictly stronger than the forbidden day join: the layer's own circling
line -> the fight header -> "You go down" -> death line -> mantle
transfer, with no intervening fight) finds THREE scholar deaths inside
layer-draw fights:

1. Variant 98601, day 70: layer draws THE AUDIT; the scholar Amina
   goes down in that fight and dies; mantle passes to Jayden Cullen.
2. Variant 98604, day 62: layer draws THE EATER; the scholar Carolina
   goes down in that fight and dies; mantle passes on.
3. Variant 98606, day 44: layer draws THE CALLBACK; the scholar Emilio
   goes down in that fight and dies; mantle passes on.

Completeness: the mantle enumeration for all five drawing seeds matches
scholarDeaths exactly on every seed (98601: 7/7, 98603: 10/10, 98604:
4/4, 98605: 7/7, 98606: 12/12), and no mantle falls on any other draw
day or draw-day+1. True b2 = 3 > 2. The earlier Buffering-type matches
(mantles on days 52/54/61 for a day-62 draw) are pre-draw fights of the
same type, not the draw fight, and were excluded by instance, not type.

## The wall numbers (pilot, both arms)

| measure | baseline | variant |
|---------|----------|---------|
| national reached | 0/8 | 0/8 |
| table waiting / table done / wins | 1 / 4 / 4 | 0 / 4 / 4 |
| wave-4 unlocked | 5/8 | 5/8 |
| wave-4 fought (>= 1 seed) | 3/8 | 5/8 |
| wave-5 unlocked / fought | 0 / 0 | 0 / 0 |
| median survival | 86d | 86d |
| max survival | 114d | 92d |
| end reasons (over-other / village-lost) | 4 / 4 | 4 / 4 |

The arm moved wave-4 facing (+2 seeds, exactly at bar) but moved nothing
on the wall itself: no national, no wave-5 anything, same wins and table
counts, same median survival. The scale wall stands. Note the max-survival
drop (114d -> 92d) is one seed's trajectory change (98604: baseline 7
wave-4 kinds over 114 days; variant 1 kind over 90 days) — descriptive,
not judged.

## Feast / draw counts by layer (pilot totals, descriptive)

| layer | baseline | variant |
|-------|----------|---------|
| base feasts (baseFeasts / armed) | 7 / 6 | 6 / 5 |
| scale feasts (fsFeasts / armed) | 16 / 14 | 12 / 10 |
| layer feasts (fdFeasts) | 0 | 15 |
| layer draws (fdDraws / w4) | 0 | 15 / 3 |
| layer-draw fights by fight identity (fdArmFightCount) | 0 | 0 (instrument defect, see above) |
| deed fights matching a drawn monsterId (fdDeedFightCount) | 0 | 60 (monsterId-match inflation: repeat fights with drawn types; NOT a fight count) |

The knob did what the prereg said it should: 15 extra fresh armed
grants, 15 draws (one per grant — no wasted feasts to the
pending-clobber guard in this band), 3 of them wave-4. Draws by seed:
98601 buffering/audit/heckler/redactor; 98603 nightcourt/chorus_line;
98604 anaconda_empress/rut_king/chorus_line/eater; 98605
ad_break/terms_of_service/strike; 98606 alien_tick/callback. Seeds
98602/98607/98608 drew nothing (no unlock or no affordable armed feast
window). Wave-4 kills stayed 2 in both arms, both via the player;
wave-4 tricks learned: baseline 5 (98604) + 1 (98606); variant 1 (98601
suburb only) — the variant faced more wave-4 kinds but learned fewer
tricks, because its wave-4 fights were mostly fled or scholar-fatal
rather than survived-and-observed. Descriptive, not judged.

## Death-cause shares (pilot totals)

Baseline 331 deaths: villager combat 176 (53%), combat 61 (18%),
the wild 35 (11%), monster 16 (5%), expedition 10 (3%), starvation 2
(1%), rest scattered (ambush, arena, sickness, wounds, thirst, contests).
Variant 323 deaths: villager combat 164 (51%), combat 64 (20%),
the wild 41 (13%), monster 15 (5%), expedition 10 (3%), starvation 2
(1%). Scholar deaths: 43 baseline -> 46 variant. The overall death
profile barely moved; the arm's cost is concentrated, not diffuse —
three scholar deaths inside its own fights, against an unchanged
starvation total and an unchanged median. That concentration is why
b2, not the totals, is the right cost bar — and why its instrument
failure mattered.

## Village assessment (plain words)

The villages looked the same on both arms: most reached regional,
none reached national, four of eight sat the table and won on both
arms with the same seeds winning. The feast-cadence villages feasted
more often and met more Mirror Draft monsters — the Audit, the
Eater, the Strike, the Congregation walked into their firelight —
but meeting them did not make the villages stronger or larger. Three
scholars died to the very beasts their own feasts drew: Amina to the
Audit's clipboard, Carolina to the Eater, Emilio to the Callback
wearing a dead villager's face. In each case the village did not die
with its scholar — the mantle passed, the fire kept burning, and two
of the three runs still won — but a lever that kills the player
character in its own fights three times in eight seeds has not earned
its keep, even though it moved the facing number it was built to move.
Blank filled: none — this arm is documented, not landed. Blank
documented for the next run: the attribution instrument itself (see
metric review).

## Sense-testing read (one layer-draw fight, variant 98601 day 70)

The chain reads as one coherent night, not as counters. At dusk the
feast is hosted (Amina opens the pantry, 10x foraged food, 2,000 kcal;
the seat left empty is noticed — "grief sits at the fire with them").
The buff lands (FEASTED x2.53, keepsake-fed). The smell carries, and
the Audit is circling the edge of the light — the game says what drew
it and what the choice is (face it while the feast is in you, or let
the watch drive it off). The fight is a real Audit fight: abacus beads
click, the clipboard flips to the scholar's own sheet, "strike" is
flagged INEFFICIENT and taxed half strength for two rounds, the
Assessment finds the scholar no matter how she moves, the Codex
records the lesson ("locks onto one target — moving won't dodge it").
Strikes land for 150–167 through the feast uplift, armor absorbs the
returns, and then the scholar goes down. What follows is not a game
over but a village event: the links shake, Emberhold presses tribute
down while the chair is empty, Stonebridge and Thornfield watch to
see if Haven holds, keepsakes are buried with their bearer, and a new
face — Jayden Cullen, line cook — takes the fire and has to earn it
("You're not Amina"). Meaning: the draw mechanic works as fiction and
as fight. Coherence: every beat follows from the feast that caused it.
Consequence: the fight can kill the scholar, and the game treats that
death as a village crisis, not a statistic. That consequence is
exactly what the cost leg exists to price — and exactly what the
broken wrap failed to count.

## Metric review

- The b2 instrument was wrong, not the b2 bar. A post-return
  `tbfight.id` check cannot work when node combat resolves
  synchronously. Next run: capture fight identity at fight START
  (wrap `startCombat` entry, or match tele deaths against the live
  fight's fighters during the fight), and prove the wrap fires on a
  pilot seed with a known draw fight before any judged leg uses it.
  Any future zero from an attribution wrap must be reported with
  its fire count (fdArmFightCount-style) alongside it.
- The fdDeedFightCount metric (monsterId match) inflates wildly
  (60 for 15 draws) and must never be quoted as a fight count; it is
  a type-match diagnostic only.
- No metric is re-scored in this run. The b2 bar (<= 2) stands as
  written; the arm failed it on fight-sequence evidence, which is
  the fight identity the prereg defines, measured by a method
  stronger than the forbidden day join. A future arm that wants a
  different cost definition must pre-register it before its pilot,
  not after.
- Confirm-band note: the confirm round was not run to verdict, so
  there is no confirm-vs-pilot comparison to review. The band
  98701–98712 remains fresh; a future arm may use it, but this
  arm's pilot kill is final — no confirm can revive a killed pilot.

## Kill protocol (per prereg)

- DELETED: scripts/policies/feastdraww4.js, scripts/test-feastdraww4-a.js.
- KEPT: prereg (with CORRECTION), driver, pilot per-seed JSONs,
  compare, this evidence file.
- DELETED as unjudged partial data: the confirm sweep's two baseline
  outputs (98701, 98702), produced before the sweep was stopped;
  they judge nothing and must not be cited as a confirm band.
- DEPLOY: nothing. No competent.js default cadence changes, no
  src/js changes. The cadence knob stays policy-side and dead with
  this arm.
- Proof test status at kill time: scripts/test-feastdraww4-a.js was
  green 14/14 before deletion (it proves the deleted policy's gates,
  not a landed change); it is deleted with the policy per protocol.
  No jest was run (no jest suites touched).
