# sim-fightorigin-b — fight origins: which monster reached the hall at dawn, and how

Run: oversight-flesh-out-loop-b, arm sim-fightorigin-b
(run fleshout-loop-b-20261029T1630Z, axis food-economy).
MEASUREMENT ONLY: zero game-code change, zero policy change,
zero default flips. New files are the recorder driver, the
analyzer, the proof test, the prereg (+ amendment), this
evidence file, and the corpora. This arm claims
findings-backlog item #1373 (the coordinator marks it —
this arm does not edit the backlog file).

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-29/sim-fightorigin-b-prereg.md, committed as 2feb7424 BEFORE any judged run, plus its amendment 0b3f1825, also committed before the judged confirm run)

**GO — fight-origin completeness 100% on the judged target set.**
Base-movement branch taken: REPRODUCED-MISSES (2 of the 3
morningpersist misses reproduce on current master; see
reproduction section). Judged band: morningpersist confirm
band, seeds 10710–10725, 30 loop-days, same substrate
(COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1,
POLICY=insideevening). Denom 406 morning-after-inside
observations, 3 misses (10712/21, 10713/28, 10720/18).
Miss-interval fight-drive entries: 4/4 with a FULL origin
record (completeness 1.0); flee-drive subset: 3/3.
All morning-interval drives on the band: 36/36 full.
Zero UNCLASSIFIED entries anywhere on the band.
Guards hold: neutrality 16/16 seeds deep-equal OFF vs ON
on compared fields; determinism byte-identical on the
10712 re-run; median days 30 (G3 bar >= 24); zero src/js
files in this arm's commits (G4).

## The answer to #1373 (which monster, how it reached the hall)

In every traced miss interval, the dawn fight arrived the
same way: a **haven raid**. The engine's havenRaidTick
(progDaily/endDay) set a pending encounter — the monster
did not walk through a door in the fiction; the raid
system placed it inside the haven, the game announced it
as a BREACH, and the harness's post-wait / post-sleep
driveContests resolved the pending encounter into a fight
inside the hall. The player then fled that fight through
the hall doors (the morningpersist mover, confirmed
again here: exitBuilding(true) in the fight drive).

Per miss fight (all wave 1; all pending-resolved):

- **10712, morning 21 — MURKCAP (65 HP, solo) + Kelsey,
  Onni, Luis joining.** Pending set during wait-1's
  day-rollover (havenRaidTick inside progDaily/endDay
  during the wait tick), cleared and resolved by the
  post-wait driveContests (sim-harness.js driveContests
  pending block, line 807). Fight driven in the
  wait-after-upkeep-1-post-wait-drive slot; the player
  fled through the doors to (4,5). This is the
  morningpersist hypothesis slot ("wait's part advance /
  encounter roll"), now named: a raid, not a wander-in.
- **10720, morning 18 — HUSHPUPPY pack (4 hushwolves,
  50/58/62/52 HP) + Geraldo, Vasyl, Omar, Furkan.**
  Pending set by havenRaidTick during wait-1's
  day-rollover, resolved post-wait, driven in the same
  post-wait slot; fled to (4,5). A SECOND fight later
  in the same interval — a solo belltoad (58 HP),
  direct-live, created during wait-3 by a monster turn
  (monsterTurn → tickAction → doAction('wait')) and
  driven post-wait-3 — then moved the already-outside
  player to (5,6), which is why the morning snapshot
  reads (5,6). The miss mover is still the first
  (hushwolf) flee, exactly as morningpersist read it.
- **10713, morning 28 — HUSHPUPPY pack (4 hushwolves,
  58/64/55/57 HP) + 4 villagers.** Pending set by
  havenRaidTick DURING SLEEP (phase sleep) — the
  morningpersist 10722 pattern, an encounter pending
  out of the night — pendingEncounter=true at the
  post-sleep checkpoint, resolved by the post-sleep
  contest drive (runDays line 582), driven in the
  post-sleep-contest-drive slot; fled to (4,5).

Miss-interval drive classes: pending-resolved 3,
direct-live 1 (the 10720 second fight). Total player
fights recorded on the band: 54 creations, 54 drives,
every drive linked to exactly one creation.

## Trace quoted end to end (10712, morning 21 — the reproduced miss)

Pending-transition log (loop-day 21):
- foSeq 5, slot wait-after-upkeep-1: pendingEncounter
  True (havenRaidTick / progDaily / endDay)
- foSeq 6, slot wait-after-upkeep-1: pendingMonsterId
  murkcap (same raid tick)
- foSeq 7–8, slot wait-after-upkeep-1-post-wait-drive:
  pendingEncounter False, pendingMonsterId None
  (driveContestsImpl clearing the flags before
  startCombat — the harness pending block)
Creation 3 (same interval, caller stack:
driveContestsImpl sim-harness.js:807 ← post-wait
driveContests runDays:570), fighters: player (100 HP)
+ Kelsey/Onni/Luis + murkcap (wave 1, 65 HP), say
window in the game's own words:
> "◈ CRISIS — THE BREACH. It got INSIDE. The haven was
> supposed to be the safe place — the one place. It
> isn't."
> "SYSTEM: 'Perimeter violated! This is unprecedented!
> ...Is this unprecedented? Checking. Yes.
> Unprecedented.'"
> "The village is rattled. Everyone's jumpy — eyes on
> the treeline."
> "You don't know what that was. A red moon rising
> between the trees, breathing. Someone at the haven
> should hear about this."
> "⚔ MURKCAP! Kelsey, Onni, Luis join you!"
Drive entry (seq 318, slot
wait-after-upkeep-1-post-wait-drive, creation 3,
pending-resolved), then the morningpersist flee:
tbPlayerMove (7,7) inside, exitBuilding(true) from
door cell (5,6) → (4,5) outside, fight 'fled'
("You push through the doors into open air…",
"You escape. The thicket keeps its secrets.").

## Reproduction (reported separately from the recorder verdict, per prereg)

- 10712/21: REPRODUCES (same seed, morning, landing).
- 10720/18: REPRODUCES (same seed, morning, (5,6)
  morning read via the second fight, as morningpersist).
- 10722/30: DOES NOT REPRODUCE on current master —
  evening 29 'completed' inside (4,7) and morning 30
  still inside (4,7). No dawn fight pulled the player
  out that morning. This is a non-reproduction, not a
  recorder miss: the interval exists (it is in the
  406 denom) and simply is not a miss this time.
- NEW miss on the band: 10713/28 (hushwolf night raid,
  above). It is NOT a recorder artifact: the recorder-OFF
  pilot on the same band shows the same 2 pilot misses
  (10712/21, 10713/28), and OFF vs ON corpora are
  deep-equal on all compared fields (16/16). The band
  drifted since morningpersist (denom 406 vs 411;
  morningpersist's own pilot band now yields 2 misses,
  not 1) — master moved between 2026-10-28 and this
  run, and the recorder did not move it.
- Under the prereg branch rule, the judged target set
  is the miss-interval drives on the confirm band
  (4 drives, 4/4 full). The reproduced-only subset
  (10712 + 10720 intervals: 3 drives) is also 3/3
  full. Both readings pass; neither is re-scored
  against the other, and the non-reproduction is stated
  here, not folded into the completeness number.

## Sense-testing (read end-to-end, judged on meaning)

All three miss stories read as **coherent played
mornings, with one honest gap**. The raid fiction is
legible: the game says a breach happened ("It got
INSIDE", "Perimeter violated"), names the monster in
the fight intro ("MURKCAP!", "HUSHPUPPY! (4 of
them!)"), names the villagers who join, and then the
player flees through the doors while a villager
watches. A player reading that transcript understands
where they are and why: something raided the haven
overnight / at the day's turn, and they ran out of
the hall mid-fight. The gap is upstream of the breach
line, not in it: nothing tells the player it was a
*raid* as opposed to a monster wandering in — the
raid mechanism (havenRaidTick) is invisible, and the
breach line is the same either way. That is a
narration-thinness note for a future arm, not a
recorder failure and not a claim that the arrival is
unexplained: the monster IS named, the breach IS
announced, and the flee IS witnessed. The one
genuinely confusing window is 10713's creation
sayTail, which interleaves night-raid casualty
narration (a villager falling in the raid) with the
fight-start lines — a player would read it as "the
raid already killed someone before my fight started",
which is true of the raid but is not flagged as such
in the window. Noted, not chased (stay on axis).

## Before/after framing (miss rate vs morningpersist)

- Morningpersist confirm: 3/411 (0.73%). This run,
  same band, same policy, same substrate, recorder
  layers added: 3/406 (0.74%) — same count, different
  third member (10713/28 in, 10722/30 out).
- Pilot (10710–10717): 2/210 here vs 1/210 in
  morningpersist's pilot — the extra miss is the
  10713 night raid, present in the OFF control too
  (master drift, not recorder perturbation).
- Move counts on the pilot band match the
  morningpersist confirm run's first-8 counts on 5
  seeds exactly (328/283/230/182/261) and differ by
  1–3 moves on 10713/10714/10715 (281 vs 284, 225 vs
  226, 214 vs 215) — again master drift, since the
  OFF control reproduces the new counts exactly
  (neutrality 16/16 on the full band, not just the
  pilot).

## Village assessment (plain words, within what 30-day instances can say)

Sixteen month-long villages, all surviving to day 30
(median 30, every instance endReason 'survived').
The shape is the insideevening shape: the player
comes home, sleeps in the hall, and — on 403 of 406
mornings — is still inside when the day's work
starts. On three mornings a raid-born dawn fight
pulls them out through the doors before the day's
work begins. Player fights are rare (54 in 480
village-days, roughly one per 9 days) — competent
play avoids most monsters, and most recorded deaths
are other people's fights: villager combat 49,
combat 39, the wild 10, ambush 6, expedition 5,
sickness 3, starvation 3, wounds 3, the night 2,
monster 2, plus a tail (dehydration, arena, bad
belly, Hushpuppy, the humming in the grass, 1
each) — 127 deaths total. Wave kills 91 (wave 1:
83, wave 2: 8, wave 3+: 0); max wave unlocked 3 on
one seed (10714), 2 on twelve, 1 on three.
Knowledge/capability gaps visible here: none new —
the villages' food and fight shape is the
morningpersist shape. Blanks filled: (1) the dawn
fight's origin, per miss fight — raid-born pending
encounters, monster named, slot named, caller stack
named — closing #1373's "which monster / how it
reached the hall" as far as measurement can take it;
(2) the harness pending mechanism itself, corrected
in the prereg amendment: the harness clears the
pending flags BEFORE startCombat, so a pending
resolution can only be detected from the transition
log + caller stack, never from "pending before
creation". Blank documented, not filled: whether the
raid arrival should be narrated as a raid (vs the
generic breach line), and whether a monster should
be able to start/continue a fight with a player
sleeping in the hall at all — a design question for
Steve, not a measurement verdict.

## Wall numbers (judged corpora, 30-day horizon)

- National / table / wins: NOT OBSERVABLE inside
  30-day instances; reported as not-observable, not
  omitted and not claimed as movement. Scale stays
  'village' and standing stays 0 on all 16 seeds.
- Wave reach: max wave unlocked 1 on 3 seeds, 2 on
  12 seeds, 3 on 1 seed (10714); wave 4–5 reach 0.
  Wave kills total 91 (wave 1: 83, wave 2: 8).
- Median survival: 30 loop-days (all 16 survived to
  the 30-day cap); max 30.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, as
pre-registered by analogy to the morningpersist
precedent: this leg is a 30-day position/reachability
measurement, not a game change, and panel metrics
(national / table / wins, wave reach) cannot move —
and cannot even be observed — inside 30-day
instances. The before/after instrument for this leg
is the recorder on identical seeds against the
morningpersist rates (OFF vs ON neutrality, above),
and the pre-registered completeness threshold is the
judge.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as amended before
  confirm. The amendment itself is the metric review's
  main item: the original pending-resolved clause was
  mechanically impossible for harness resolutions
  (the harness clears pending flags before
  startCombat), diagnosed from the pilot's 10712
  stack (driveContestsImpl:807 with pendingBefore
  false) and corrected BEFORE the judged confirm run
  to a transition-log + caller-stack definition. No
  mid-judging re-score: the confirm band's miss set
  was not adjusted, the 10722 non-reproduction was
  not rescued, and the new 10713 miss was judged by
  the same bar as the reproduced ones (and passed).
- Second pilot-diagnosed instrument fix, also before
  confirm: checkpoint seq is shared by all records
  between two checkpoints, so pending transitions,
  creations and drives in one slot all read the same
  seq — ordering them by seq misclassified the
  10712 fight (same-slot-live instead of
  pending-resolved) and left 5 pilot morning drives
  unclassified. Fix: a dedicated foSeq counter
  ordering fight-origin records against each other
  (seq still brackets them against moves and
  checkpoints). After the fix, pilot morning
  completeness went 14/19 → 19/19 and the 10712
  fight classified pending-resolved. Both fixes are
  instrument corrections made before judging, stated
  here rather than hidden.
- Metric proved right: completeness as a fraction
  with a closed taxonomy (pending-resolved /
  same-slot-live / direct-live) was decidable on every
  drive — 36/36 morning drives, 0 unclassified. The
  same-slot-live class did not fire on the judged
  band (all three flee fights are pending-resolved;
  the one direct-live is the second fight in an
  interval), but the class is retained: a wait-tick
  monster-turn fight (the 10720 belltoad) is the
  direct-live shape, and a contest-born fight would
  be the same-slot shape.
- No revision proposed for the next run except the
  documented design question (raid narration) above.

## Proof

- `node scripts/test-fightorigin-b.js --corpus
  evidence/2026-10-29/sim-fightorigin-b-corpus --seeds
  10710,...,10725 --off
  evidence/2026-10-29/sim-fightorigin-b-corpus-off
  --rerun
  evidence/2026-10-29/sim-fightorigin-b-corpus-rerun
  --rerun-seed 10712` — PROOF-GREEN: T1 corpus
  completeness, T2 every drive links to a creation,
  T3 completeness 100% on the prereg target set
  (branch=reproduced-misses, missDrives 4/4,
  flee 3/3), T4 neutrality 16/16, T5 determinism
  byte-identical (seed 10712), T6 sense anchor,
  T7 guards (medianDays 30, pending log installed
  on all seeds).
- Pilot: COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=insideevening SEEDS=10710–10717
  DAYS=30 TAPDAYS=5 — 8 files, exit 0, denom 210,
  2 misses (10712/21, 10713/28), morning drives
  19/19 full after the foSeq fix. Confirm: same
  command with SEEDS=10710–10725 — 16 files, exit 0,
  corpora evidence/2026-10-29/
  sim-fightorigin-b-corpus/, OFF corpus
  sim-fightorigin-b-corpus-off/, rerun corpus
  sim-fightorigin-b-corpus-rerun/ (seed 10712),
  analysis evidence/2026-10-29/
  sim-fightorigin-b-analysis.json (pilot analysis:
  sim-fightorigin-b-pilot-analysis.json). Corpus
  totals: 54 creations, 54 drives across 16 seeds.
- `node --check` clean on all three new scripts.
  No [needs-eyes]: measurement-only arm, nothing
  player-visible. Zero src/js files in this arm's
  commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [for coordinator: mark #1373 FIXED-by-measurement]
  Fight-origin completeness 100% (4/4 miss-interval
  drives, 3/3 flee drives, 36/36 morning drives);
  the dawn fights behind the morningpersist misses
  are raid-born pending encounters (murkcap,
  hushwolf pack) resolved by the harness pending
  block into fights inside the hall — see "The
  answer to #1373" above. Residual design question
  (not a measurement gap): should the raid arrival
  be narrated as a raid rather than the generic
  breach line? Steve-call if pursued.
- [new backlog item, in file format — coordinator to append]
  - [open] 2026-10-29 — fight-origin / raid narration —
    dawn raid fights announce only the generic BREACH
    line, never that the arrival was a haven raid
    (havenRaidTick), and a raid fight's say window
    interleaves night-raid casualty narration with
    fight-start lines without flagging it as raid
    aftermath (sim-fightorigin-b, seed 10713
    morning 28). (run fleshout-loop-b-20261029T1630Z,
    evidence/2026-10-29/sim-fightorigin-b.md).
- [new backlog item, in file format — coordinator to append]
  - [open] 2026-10-29 — morningpersist reproduction /
    master drift — the morningpersist confirm miss
    10722/30 does not reproduce on current master
    (morning 30 stays inside) and a new miss
    10713/28 appears on the same band, with denom
    406 vs 411; the drift is in the game/policy
    trajectory, not the recorder (OFF control
    reproduces the new set). Worth a note in the
    morningpersist line, not a new arm.
    (run fleshout-loop-b-20261029T1630Z,
    evidence/2026-10-29/sim-fightorigin-b.md).
- [not a fix arm] This arm lands no game change by
  design. The flee-through-doors consequence stands
  as honest play (morningpersist's verdict, unchanged).

## Convergence line

fightorigin-recorder — MEASUREMENT ONLY, zero src/js:
on the reused morningpersist confirm band
(10710–10725, 30 days) the fight-origin recorder
traces 4/4 miss-interval drives and 3/3 flee drives
(completeness 100%, 0 unclassified, 36/36 morning
drives full); the dawn fights are haven-raid-born
pending encounters — murkcap (10712/21) and
hushwolf packs (10720/18, 10713/28) — set by
havenRaidTick, resolved by the harness pending
block into fights inside the hall, then fled
through the doors; 2 of 3 morningpersist misses
reproduce (10722/30 does not: morning stays
inside) and a new night-raid miss 10713/28 appears
via master drift, proven by the OFF control;
proof PROOF-GREEN (T1–T7), neutrality 16/16,
determinism byte-identical; wall numbers on the
band: national/table/wins NOT OBSERVABLE (30d),
wave 4–5 reach 0, median survival 30. GO — backlog
#1373 closed by measurement; residual design
question (raid narration) is a Steve-call note,
not a held item.

## Verdict (judged against the pre-registered bar, not re-scored): GO
