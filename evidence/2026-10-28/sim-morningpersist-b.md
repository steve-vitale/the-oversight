# sim-morningpersist-b — the morning-after mover, traced

Run: oversight-flesh-out-loop-b, arm sim-morningpersist-b
(run fleshout-loop-b-20261028T2126Z, axis food-economy).
MEASUREMENT ONLY: zero game-code change, zero policy
change. New files are the tracer driver, the analyzer,
the proof test, the prereg, this evidence file, and the
corpora. The 1930Z open item is closed: every miss has
a named mover.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-morningpersist-b-prereg.md, committed as 16f429c9 BEFORE any judged run)

**GO — trace completeness 100% on the judged band.**
Reused 1930Z confirm band, seeds 10710–10725, 30
loop-days, same substrate (COMPETENT_FEAST=0
SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1): 411
morning-after-inside-evening observations, 3 misses —
the exact 1930Z miss set, seed for seed and morning
for morning (10712/21, 10720/18, 10722/30) — and all
3 are traced to the same named mover (below). No
expansion band was needed (the band yielded misses).
Guards hold: median days 30 (G1 bar >= 24); zero
src/js files in this arm's commits (G2).

## The mover (all three misses, one mechanism)

**Flee-by-door in a morning fight drive — NOT the
1930Z hypothesis.** The 1930Z evidence guessed "an
upkeep verb that travels during the 3 pre-daily
upkeeps (e.g. feastFightRoad patrolling while
feasted)". The traces kill that class outright:

- Sleep preserves inside on all 3 misses (post-sleep
  checkpoint: inside, (4,7), the hall landing).
- No upkeep verb moved the player on any miss
  interval: pre/post-upkeep checkpoints are identical
  wherever the exit had not yet happened, and
  feasted=False at every interval snapshot — no
  feast patrol was live, and no travelTo appears in
  any miss interval.
- The exit in every case is `exitBuilding(true)`
  (doorFlee=true) nested inside competent.fight's
  `tbPlayerMove` toward a door cell, under the
  engine's flee-by-door rule (game.js tbPlayerMove:
  stepping on a door tile crosses it): the player
  walks the hall to the door, the door carries them
  to the havenDoorLanding (4,5), and the fight ends
  'fled'. The say window names it in the game's own
  words every time: "You push through the doors into
  open air. Haven grounds — tents, a fire pit, worn
  paths. The world is that way." then "You dive
  through the doors — outside! The fight is behind
  you." plus a villager witness line and "You escape.
  The thicket keeps its secrets."

Per miss:

- **10712, morning 21** (evening 20 'completed',
  (4,7) inside): sleep inside; upkeep-1 inside;
  then, in the fight drive after upkeep-1, a live
  fight (inCombat=true at the first fight verb):
  tbPlayerMove (7,7) inside, then stepping to door
  cell (5,6) → exitBuilding(true) → (4,5) outside,
  fight 'fled'. Witness: Kelsey — "Live to fight
  it. Smart." Morning reads (4,5). Interval: 10
  records (post-sleep, pre/post-upkeep-1, the two
  fight moves + nested exit, pre/post-upkeep-2/3).
- **10720, morning 18** (evening 17 'completed',
  (4,7) inside): sleep inside; upkeep-1 inside;
  then fight drive after upkeep-1: tbPlayerMove
  (5,6) — stepping on the door cell from (4,7) —
  → exitBuilding(true) from (5,6) → (4,5) outside,
  fight 'fled'. Witness: Omar — "Coward's move.
  Smart, but coward's." A SECOND fight later in
  the same morning interval (after upkeep-3, before
  the morning snapshot) then moved the already-
  outside player tbPlayerMove (5,6) — that is why
  the morning snapshot reads (5,6), not the flee
  landing (4,5). The miss mover is still the
  first exit; the (5,6) morning position is a
  second fight's move, not a different exit.
  Interval: 10 records.
- **10722, morning 30** (evening 29 'completed',
  (4,7) inside): sleep inside, but the post-sleep
  checkpoint already carries pendingEncounter=true
  — an encounter pending out of the night. The
  harness's post-sleep contest drive resolves it
  into a fight (driveContests calls driveFights)
  BEFORE upkeep-1: tbPlayerMove (4,6) — the door
  cell — → exitBuilding(true) from (4,6) →
  (4,5) outside, fight 'fled'. Witness: Rafael —
  "Live to fight it. Smart." All three upkeep
  checkpoints then read (4,5) outside. Morning
  reads (4,5). Interval: 9 records.

Placement summary: the exit is never in sleep,
never in an upkeep, and never in competent.daily
(the morning snapshot precedes daily). It is
always in a harness fight drive inside the
morning interval — after upkeep-1 (10712, 10720)
or before upkeep-1 via the post-sleep contest
drive (10722). The three placements cover the
interval's fight-drive slots; no other slot
produced a miss on this band.

## What was NOT traced (stated, not smoothed over)

The mover is traced; the fight's origin is not.
This arm names what moved the player out of the
hall (flee-by-door), not why a fight was live
inside the hall at dawn: for 10712/10720 the fight
became live between post-upkeep-1 and the fight
drive (the harness wait's part advance / encounter
roll is the slot, but the monster identity and
the encounter's trigger were not recorded — the
tracer records verbs and positions, not tbfight
fighters or pendingEncounter provenance), and for
10722 the encounter was already pending at
post-sleep. Whether a monster can/should reach a
player sleeping in the hall, and which monster it
was, is the residual thread — documented below as
a named next arm, not answered here. It does not
affect the verdict: the prereg bar is mover
trace completeness, and that is 3/3.

## Before/after framing (miss rate vs 1930Z)

- 1930Z confirm: 3/411 (0.73%). This run, same
  band, same policy, same substrate, tracer layers
  added: 3/411 (0.73%), identical miss set. The
  tracer layers are trajectory-neutral on this
  band (confirm move counts for the first 8 seeds
  match the pilot run's counts exactly:
  328/283/230/284/226/215/182/261).
- 1930Z pilot: 1/207 (10701/14). Not re-run here:
  the prereg's expansion rule only triggers on a
  zero-miss confirm band, and the confirm band
  yielded its 3 misses. The pilot band's miss is
  a fourth instance of the same class by position
  ((4,5) door landing) but was NOT traced by this
  arm — claimed only as consistent, not as traced.

## Sense-testing (read end-to-end, judged on meaning)

All three misses read as a **sensible played
morning, not teleportation**. The player slept in
the hall, woke to a fight (or a pending encounter
from the night), and fled that fight through the
hall doors — the engine says so twice ("push
through the doors", "dive through the doors"),
a villager watches and judges it (Kelsey's
approval, Omar's "coward's" jab, Rafael's
approval), and the fight is honestly over
("The fight is behind you", "You escape"). A
player reading that transcript understands exactly
where they are and why: they ran out of the hall
mid-fight. The one sense gap is upstream, not in
the move: nothing in the transcript explains how
the fight got INTO the hall at dawn — no monster
is named arriving, no door is described opening
for it. The exit is legible; the fight's arrival
is the part a player would find unexplained.
That gap is the next arm's question, not this
arm's miss.

## Village assessment (plain words, within what 30-day instances can say)

Sixteen month-long villages, all surviving to day
30 (median 30, every instance endReason
'survived'). The shape is the insideevening
shape: the player comes home, sleeps in the hall,
and — on 408 of 411 mornings — is still inside
when the day's work starts. On three mornings a
dawn fight pulls them out through the doors
before the day's work begins, and the day then
starts on the grounds (once, 10720, a second
fight pushes them one square further to (5,6)).
Villages that spend their evenings away never
enter this picture at all (10720 has only 5
inside evenings in 30 days; the other 13 seeds
with misses or none range 19–30). Deaths in the
corpus are 122, mostly other people's fights:
villager combat 45, combat 37, the wild 10,
expedition 9, ambush 5 — plus a long tail
(sickness 4, wound 4, the night 2, starvation 1,
dehydration 1, arena 1, bad belly 1, monster 1,
the humming in the grass 1). The player's own
bearer deaths are inside those counts, with
succession continuing in every instance (no
instance ends early). Knowledge/capability gaps
visible here: none new — the villages' food and
fight shape is the 1930Z shape, and this arm
adds no new lever. Blanks filled: (1) the
morning-persistence mechanism, traced per miss
instead of guessed (feast-patrol hypothesis
killed with feasted=False + zero travelTo in
every interval); (2) the morning interval's
anatomy, checkpointed (sleep / upkeep / fight-
drive / contest-drive slots, with the post-sleep
pending-encounter slot now evidenced). Blank
documented, not filled: why a fight is live
inside the hall at dawn (next arm below).

## Wall numbers (judged corpora, 30-day horizon)

- National / table / wins: 0 / 0 / 0 — not
  observable inside 30-day instances; reported
  as zero, not omitted. Scale stays 'village' and
  standing stays 0 on all 16 seeds.
- Wave reach: max wave unlocked 1 on 5 seeds, 2
  on 10 seeds, 3 on 1 seed (10714); wave 4–5
  reach 0. Wave kills total 90 (wave 1: 81,
  wave 2: 9, wave 3+: 0).
- Median survival: 30 loop-days (all 16 survived
  to the 30-day cap); max 30.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, as
pre-registered by analogy to the insideevening
precedent (arenalabel): this leg is a 30-day
position/reachability measurement, not a game
change, and panel metrics (national / table /
wins, wave reach) cannot move — and cannot even
be observed — inside 30-day instances. The
before/after instrument for this leg is the
tracer on identical seeds against the 1930Z
rates, and the pre-registered trace-completeness
threshold above is the judge.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as written. No
  mid-run re-scoring: the miss set was not
  adjusted, the feast-patrol hypothesis was not
  rescued when the traces contradicted it (it
  was killed), and the 10720 (5,6) morning
  position was not re-classified — the mover is
  the (4,5) flee exit, the (5,6) read is a second
  fight's move in the same interval, reported as
  such.
- Reproduction: exact. The tracer reproduced the
  1930Z confirm miss set (3/411, same seeds,
  days, and landing neighbourhood) despite the
  added read-only layers — the layers did not
  move the game on this band. If a future band
  diverges, the tracer layers are the prime
  suspect to check first (extra snapshot reads),
  before any game-code explanation.
- Metric proved right: trace completeness as a
  fraction with a named-mover definition (verb,
  or checkpoint + evidenced path) was decidable
  on every miss — all 3 landed in the verb class,
  so the checkpoint-path clauses were not needed.
  No revision proposed for the next run except
  the next arm's added recording (below).
- Walk-quote kcal variance: not observed in any
  miss interval (no evening walk is inside a miss
  interval by construction) and not chased, per
  the prereg.
- Guard reading: G1's median-days bar (30 vs bar
  24) says the tracer did not kill villages; G2
  says nothing in src/js was touched. Both are
  instrument-health statements, not game claims.

## Proof

- `node scripts/test-morningpersist-b.js --corpus
  evidence/2026-10-28/sim-morningpersist-b-corpus
  --seeds 10710,...,10725` — PROOF-GREEN: T1
  corpus completeness, T2 position rows, T3
  interval coverage (3/3 bracketed), T4 trace
  completeness 100%, T5 reproduction of the
  1930Z confirm miss set, T6 hall-step sense
  anchor, T7 wall numbers present.
- Pilot trace (instrument sanity): COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=insideevening SEEDS=10710–10717 DAYS=30
  TAPDAYS=5 — 8 files, exit 0, denom 210, 1 miss
  (10712/21) traced to the same flee-by-door
  mover. Confirm trace: same command with
  SEEDS=10710–10725 — 16 files, exit 0, corpora
  evidence/2026-10-28/sim-morningpersist-b-corpus/,
  analysis evidence/2026-10-28/
  sim-morningpersist-b-analysis.json (pilot
  analysis: sim-morningpersist-b-pilot-analysis.json).
  Corpus totals: 4,304 checkpoints, 3,993 verb
  records across 16 seeds.
- `node --check` clean on all three new scripts.
  No [needs-eyes]: measurement-only arm, nothing
  player-visible. Zero src/js files in this arm's
  commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [next arm sketch — fight-origin-in-hall] Prereg
  sketch: extend the tracer to record, at every
  fight-drive entry, tbfight fighters (species,
  positions) + pendingEncounter provenance + the
  say window of the wait that made the fight live;
  same confirm band; primary metric: fight-origin
  completeness (fraction of dawn-hall fights with
  a named arrival: named monster + named slot —
  sleep-chunk encounter, wait encounter roll,
  door-fled re-engage, or other); GO bar 100% on
  the fights behind the 3 misses (re-run band, or
  a wider band if the fights do not recur).
  Question for that arm, not this one: should a
  monster be able to start/continue a fight with
  a player who is inside the hall, and if so, what
  does the game say about its arrival?
- [killed hypothesis, for the record] Feast-patrol
  upkeep mover (feastFightRoad travelling while
  feasted): killed — feasted=False at every
  interval snapshot on all 3 misses, zero travelTo
  in any miss interval, zero upkeep-verb moves.
  Do not revive it for this miss class without new
  evidence.
- [not a fix arm] This arm lands no game change
  by design. If a future arm wants the morning
  position to survive a dawn flee (e.g. re-enter
  after fleeing), that is its own lever with its
  own prereg — fleeing through the doors is
  honest play, and the morning-outside read is its
  honest consequence.

## Convergence line

morningpersist-trace — MEASUREMENT ONLY, zero
src/js: morning-after-inside-evening misses on the
reused 1930Z confirm band (10710–10725, 30 days)
reproduce exactly (3/411) and trace 3/3 to one
mechanism — flee-by-door in a morning fight drive
(competent.fight tbPlayerMove onto a door cell →
nested exitBuilding(true) → (4,5) landing, fight
'fled'), in the post-upkeep-1 fight drive (10712,
10720) or the post-sleep contest drive on a
pending encounter (10722); sleep preserves inside
and no upkeep verb moves the player on any miss
(the feast-patrol hypothesis is killed:
feasted=False throughout, zero travelTo); proof
PROOF-GREEN (T1–T7); wall numbers on the band:
national/table/wins 0, wave 4–5 reach 0 (max
unlocked 3 on one seed), median survival 30.
GO — open measurement item closed; residual
thread (why a fight is live inside the hall at
dawn) is a named next arm, not a held item.

## Verdict (judged against the pre-registered bar, not re-scored): GO
