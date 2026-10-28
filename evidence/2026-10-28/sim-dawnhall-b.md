# sim-dawnhall-b — the dawn-hall fight, traced to its origin

Run: oversight-flesh-out-loop-b, arm sim-dawnhall-b
(run fleshout-loop-b-20261028T2224Z, axis food-economy).
MEASUREMENT ONLY: zero game-code change, zero policy
change, zero default flips. New files are the tracer
driver, the analyzer, the proof test, the prereg, this
evidence file, and the corpora. The morningpersist
residual thread is closed: every dawn-hall fight behind
the 3 misses now has a named monster and a named arrival.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-28/sim-dawnhall-b-prereg.md, committed as f97e511f BEFORE any judged run)

**GO — fight-origin completeness 100% on the reproduced 3.**
Reused morningpersist confirm band, seeds 10710–10725, 30
loop-days, same substrate (COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1): 411 morning-after-inside-
evening observations, 3 misses — the exact morningpersist
miss set, seed for seed and morning for morning
(10712/21, 10720/18, 10722/30) — and all 3 have a complete
fight origin (fighter identity + provenance + pending
route). No expansion band was run: the prereg forbids
re-picking misses, and none was needed. Guards hold:
median days 30 (G1 bar >= 24); zero src/js files in this
arm's commits (G2).

## The answer, in one sentence

All three dawn-hall fights are the same arrival: a night
haven RAID in a village with no palisade ("No walls"),
whose first still-standing raider is sent at the player
inside the haven ("One of them is coming for YOU — X,
inside the haven, eyes on your bedroll"), resolved by the
harness's post-sleep / post-wait contest drive from
pendingEncounter into a blow-by-blow fight inside the
hall, which the player then flees through the hall doors.

That is the designed raid path, not a wanderer, not a
feast draw, not a door-fled re-engage, and not a monster
wandering in off the map: the pending creator on all 3
misses is havenRaidTick (havenGrowth.js, via progDaily /
endDay), the fight creator on all 3 is startCombat called
from the harness driveContests pending fallback
(sim-harness.js driveContestsImpl), and the raid line
names the pantry smell as the draw ("drawn by the smell
of the pantry"). No feast-draw, wanderer, or re-engage
creator appears in any miss interval.

## Per miss (fighter identity + provenance)

- **10712, morning 21** (evening 20 'completed', (4,7)
  inside): FIGHTER — one Murkcap (m_0, 28/65 HP at the
  flee verb, not a veteran), joined by villagers Kelsey,
  Onni, Luis (Kelsey hit 23, Luis hit 14 before the
  flee). PROVENANCE — sleep that night was REFUSED
  (post-sleep checkpoint still gameDay 20, say line
  "Dawn's an hour off — too late for real sleep. Rest a
  while instead, or wait for morning."): the player
  stayed inside, awake, and dawn arrived through the
  first wait's tick crossing midnight. That wait's endDay
  fired havenRaidTick: RAID — 4 raiders (Murkcap,
  Murkcap, White Noise, Murkcap), no walls; defenders
  Kelsey, Mapula, Devon and Liam drove all 4 off
  (Mapula, Liam hurt); then "One of them is coming for
  YOU — Murkcap, inside the haven, eyes on your
  bedroll" set pendingEncounter=murkcap. The post-wait
  contest drive resolved the pending slot via
  startCombat(murkcap) (BREACH crisis line fires), the
  fight drive ran, the player walked (7,7) then to door
  cell (5,6) and fled through the doors to (4,5).
  Witness: Kelsey — "Live to fight it. Smart."
  Morning reads (4,5). Post-sleep pending was FALSE —
  the raid had not happened yet at post-sleep; anyone
  reading only the post-sleep checkpoint would miss it.
- **10720, morning 18** (evening 17 'completed', (4,7)
  inside): FIGHTERS — a 4-pack of Hushpuppies
  (hushwolf: Hushpuppy 1–4, 50/50, 58/58, 62/62, 52/52
  HP at the flee verb, none veteran), joined by
  Geraldo, Vasyl, Omar, Furkan. PROVENANCE — same
  shape as 10712: sleep refused (post-sleep gameDay 17,
  same "too late for real sleep" line), dawn via the
  first wait's day-rollover endDay, havenRaidTick:
  RAID — 5 raiders (Hushpuppy, Choir Toad, Hushpuppy,
  Big Loud, Bulldozer), no walls; defenders Geraldo,
  Furkan, Ruth, Ursula and Vasyl drove 3 off, 2 barely
  walked away, all 5 hurt; then "One of them is coming
  for YOU — Hushpuppy, inside the haven, eyes on your
  bedroll" set pendingEncounter=hushwolf. Contest
  drive -> startCombat(hushwolf) (BREACH line), fight
  drive, player steps on door cell (5,6) from (4,7)
  and flees to (4,5). Witness: Omar — "Coward's move.
  Smart, but coward's." The morning (5,6) read is a
  SECOND fight later in the same interval, also fully
  traced and usefully contrasting: a solo Choir Toad
  (belltoad, 58 HP — the player-tile world monster the
  raid snapshot carried at hp 15) started DIRECTLY
  from a monsterTurn bump during a later wait tick
  (game.js monsterTurn, no pending slot at all) and
  moved the already-outside player to (5,6). Two
  different arrival routes in one morning, both named;
  the miss mover remains the first (raid) flee.
- **10722, morning 30** (evening 29 'completed', (4,7)
  inside): FIGHTERS — a 4-pack of hushwolves under the
  display name The Big Beast 1–4 (60/60, 44/53, 50/50,
  60/60 HP at the flee verb, none veteran), joined by
  Greta, Rafael, Einar, Shannon. PROVENANCE — this one
  IS the sleep case morningpersist guessed: sleep ran
  (post-sleep gameDay 30, "You wake with a start —
  something is wrong"), and during sleep's endDay
  havenRaidTick fired (phase sleep): RAID — 3 raiders
  (The Big Beast, The Big Beast, Rut King), no walls;
  defenders Shannon, Einar and Mateo drove 2 off, 1
  barely walked away (Shannon hurt); then "One of them
  is coming for YOU — The Big Beast, inside the haven,
  eyes on your bedroll" set pendingEncounter=hushwolf,
  which the post-sleep checkpoint already carries
  (pending=true, the only miss of the 3 with post-sleep
  pending). The harness's post-sleep contest drive
  resolved it via startCombat(hushwolf) BEFORE upkeep-1,
  the fight drive ran, the player stepped on door cell
  (4,6) and fled to (4,5). Witness: Rafael — "Live to
  fight it. Smart." Morning reads (4,5).

Placement summary: the raid is never a sleep-chunk
wanderer and never an upkeep verb. It fires at a day
rollover — inside sleep's endDay (10722) or inside the
first wait's endDay when sleep was refused (10712,
10720) — and the fight is live before the morning
snapshot either way: before upkeep-1 (10722) or after
upkeep-1 in the post-wait fight drive (10712, 10720).
The three placements cover the interval's dawn slots;
no other slot produced a miss on this band.

## Canon note (stated, not invented)

No canon doc in docs/CANON.md covers haven raids or
palisade sleep. The rule as built is stated in
src/js/havenGrowth.js's own header comment: raids are
reactive (3+ world monsters, 3,000+ pantry kcal, 7-day
cooldown, ~18%/day when ripe); "Without a palisade, one
raider can reach the sleeping player (pendingEncounter
wakes them into the fight); with a palisade the watch
holds the wall — safe sleep is real." All 3 misses sit
exactly on the no-palisade branch of that rule. Whether
the hall itself should shelter a sleeper from that
branch is a design question for Steve, not something
this measurement answers — it is documented below as
the next arm's question, not decided here.

## Sense-testing (read end-to-end, judged on meaning)

With the fighter named, the arrival now READS
sensibly — the gap morningpersist flagged is closed in
the transcript itself. A player reading the 10722
morning sees: a raid announced in the night, defenders
named at the door, one raider singled out as coming
for them inside the haven, the BREACH crisis line
("It got INSIDE. The haven was supposed to be the safe
place"), the fight intro naming the beast and its
villager joiners, and then their own flight through
the doors with a villager judging it. Nothing is
unexplained anymore — except one honest narration
wrinkle, carried as a documented blank below: on
10712/10720 the "eyes on your bedroll" line fires for
a player who never slept (sleep was refused) and is
awake inside the hall. The line is true about place
(inside the haven) and false about state (not in bed).
A player awake in the hall reading "eyes on your
bedroll" would reasonably wonder whose bedroll. That
is a wording-truth gap in the raid's player line, not
a trace gap.

Villagers act like people throughout: defenders meet
raiders at the door by name and come away hurt (not
abstracted), joiners stand in the hall fight by name,
and witnesses judge the flee in character (Kelsey's
approval, Omar's "coward's" jab, Rafael's approval).
No robotic, static, or repeated behaviour was observed
in these intervals beyond the game's own repeated raid
formula (same announcement shape, different names and
outcomes — the formula is the beat, the names are the
story).

## Village assessment (plain words, within what 30-day instances can say)

Sixteen month-long villages, all surviving to day 30
(median 30, every instance endReason 'survived'). The
shape is the morningpersist shape: the player comes
home, sleeps — or, twice here, fails to sleep because
the day is too far gone and waits out the night — in
the hall, and on 408 of 411 mornings is still inside
when the day's work starts. On three mornings a pantry-
smell raid at the day rollover sends one raider at the
player inside the haven, and the day starts on the
grounds after a door flee. Villages that spend their
evenings away never enter this picture (10720 has only
5 inside evenings in 30 days; the other seeds range
19–30 inside). Deaths in the corpus are 122, identical
in count and shape to morningpersist (villager combat
45, combat 37, the wild 10, expedition 9, ambush 5,
plus the long tail) — the tracer changed nothing about
how villages live or die. Knowledge/capability gaps
visible here: none new — the villages' food and fight
shape is the morningpersist shape, and this arm adds
no new lever. Blanks filled: (1) the dawn-hall fight's
monster, per miss (Murkcap; Hushpuppy pack; Big Beast
pack); (2) its arrival, per miss (no-palisade raid
pending, resolved by the harness contest drive); (3)
the interval anatomy refined — sleep is not always
sleep (refused sleep leaves the player awake inside,
and dawn then arrives via a wait's day rollover).
Blank documented, not filled: whether hall shelter
should stop the raid's sleeping-player slot, and the
"bedroll" wording when the player is awake — next arm
below.

## Wall numbers (judged corpora, 30-day horizon)

- National / table / wins: 0 / 0 / 0 — not
  observable inside 30-day instances; reported as
  zero, not omitted. Scale stays 'village' and
  standing stays 0 on all 16 seeds.
- Wave reach: max wave unlocked 1 on 5 seeds, 2 on 10
  seeds, 3 on 1 seed (10714); wave 4–5 reach 0. Wave
  kills total 90 (wave 1: 81, wave 2: 9, wave 3+: 0) —
  identical to morningpersist.
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
is the tracer on identical seeds against the
morningpersist rates, and the pre-registered
fight-origin completeness threshold above is the
judge.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as written. No
  mid-run re-scoring: the miss set was not adjusted,
  no expansion band was run (the prereg forbids
  re-picking misses), and the 10720 (5,6) morning
  position was not re-classified — the mover is the
  raid fight's (4,5) flee exit, the (5,6) read is the
  second (Choir Toad, direct monsterTurn) fight's
  move, reported as such.
- Reproduction: exact. The tracer reproduced the
  morningpersist confirm miss set (3/411, same seeds,
  days, and landing neighbourhood) AND the full
  trajectory: move counts match the morningpersist
  corpus on all 16 seeds (328/283/230/284/226/215/
  182/261/236/308/136/258/272/236/276/262) and
  checkpoint counts match (269 per seed). The added
  fight-origin layers did not move the game on this
  band — the strongest neutrality check this pair of
  arms has produced. If a future band diverges, the
  tracer layers are the prime suspect to check first,
  before any game-code explanation.
- Metric proved right: fight-origin completeness with
  the three-part definition (fighter identity +
  provenance + pending route when applicable) was
  decidable on every miss — all 3 landed with a
  startCombat creation record whose fight id matched
  the flee verb's before-fight, plus a pending
  creation record with the same monster id. The
  "fight predates the interval" clause was not needed.
  One metric refinement for the NEXT run (not this
  one): the prereg's "pending at post-sleep" shortcut
  does not cover refused-sleep mornings — 2 of 3
  misses had post-sleep pending FALSE because the raid
  had not fired yet; the deciding record is the
  pending creation inside the interval, wherever the
  day rollover falls. Future preregs should define the
  pending route by creation-in-interval, not by
  post-sleep state.
- Guard reading: G1's median-days bar (30 vs bar 24)
  says the tracer did not kill villages; G2 says
  nothing in src/js was touched. Both are
  instrument-health statements, not game claims.

## Proof

- `node scripts/test-dawnhall-b.js --corpus
  evidence/2026-10-28/sim-dawnhall-b-corpus
  --seeds 10710,...,10725` — PROOF-GREEN: T1 corpus
  completeness, T2 position rows, T3 interval coverage
  (3/3 bracketed), T4 trace completeness 100%, T5
  reproduction of the morningpersist confirm miss set,
  T6 hall-step sense anchor, T7 wall numbers present,
  T8 fight-origin completeness 100% on the expected 3,
  T9 fight-origin records present per miss interval.
- Pilot trace (instrument sanity): COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
  POLICY=insideevening SEEDS=10710–10717 DAYS=30
  TAPDAYS=5 — 8 files, exit 0, denom 210, 1 miss
  (10712/21) with a complete fight origin (Murkcap,
  raid pending). Confirm trace: same command with
  SEEDS=10710–10725 — 16 files, exit 0, corpora
  evidence/2026-10-28/sim-dawnhall-b-corpus/,
  analysis evidence/2026-10-28/
  sim-dawnhall-b-analysis.json (pilot analysis:
  sim-dawnhall-b-pilot-analysis.json). Corpus totals:
  4,304 checkpoints, 3,993 verb records (same as
  morningpersist — the day loops are identical) plus
  1,803 fight-origin records across 16 seeds.
- `node --check` clean on all three new scripts.
  No [needs-eyes]: measurement-only arm, nothing
  player-visible. Zero src/js files in this arm's
  commits.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [next arm sketch — hall shelter vs raid pending]
  Prereg sketch: same band, same substrate; add a
  lever-class question, not a game change yet: does
  the raid's sleeping-player pending slot fire when
  the player is inside the hall (as opposed to on the
  haven grounds / in a tent), and should the hall —
  the village's own building — count as shelter
  against it? Secondary: the "eyes on your bedroll"
  line's truth when sleep was refused (player awake
  in the hall). Both need Steve's design ruling
  before any lever is built (steve-call on the hall-
  shelter question; the wording gap is a candidate
  small fix once he rules). The trace this arm leaves
  behind (fighters + pending provenance at every
  fight-drive entry) is the instrument that arm
  reuses.
- [killed hypothesis, for the record] Wanderer /
  feast-draw / door-fled arrivals for this miss class:
  killed — zero such creator records in any miss
  interval on this band; all 3 arrivals are
  havenRaidTick pending + driveContests startCombat.
  Do not revive them for this miss class without new
  evidence.
- [refined, not overturned] morningpersist's "sleep
  preserves inside" is position-true but state-
  incomplete: on 10712/10720 sleep never happened
  (refused, day too far gone), so "the night" in
  those intervals is an awake wait in the hall, and
  the raid that ends it is a dawn-rollover raid, not
  a sleep-chunk encounter. The mover (flee-by-door)
  and the miss set are unchanged; only the night's
  anatomy is refined.
- [not a fix arm] This arm lands no game change by
  design. If a future arm wants hall shelter to stop
  the raid pending slot, or the bedroll line fixed,
  that is its own lever with its own prereg — the
  raid path as built is honest play (no palisade, no
  safe sleep), and the morning-outside read is its
  honest consequence.

## Convergence line

dawnhall-trace — MEASUREMENT ONLY, zero src/js: the
3 morningpersist dawn-hall misses on the reused
confirm band (10710–10725, 30 days) reproduce exactly
(3/411) and trace 3/3 to one arrival — a no-palisade
haven raid (havenRaidTick via endDay/progDaily) whose
first live raider is sent at the player inside the
haven as pendingEncounter, resolved by the harness
contest drive into a hall fight the player flees
through the doors: 10712/21 a lone Murkcap (raid of
4, sleep refused, dawn via wait rollover), 10720/18 a
Hushpuppy 4-pack (raid of 5, sleep refused, dawn via
wait rollover; second fight that morning is a direct
monsterTurn Choir Toad, separately traced), 10722/30
a Big Beast 4-pack (raid of 3, during real sleep,
pending already at post-sleep); proof PROOF-GREEN
(T1–T9); tracer trajectory-neutral (move counts match
morningpersist on all 16 seeds); wall numbers on the
band: national/table/wins 0, wave 4–5 reach 0 (max
unlocked 3 on one seed), median survival 30.
GO — open measurement item closed; residual thread
(hall shelter vs raid pending + bedroll wording when
awake) is a named next arm, not a held item.

## Verdict (judged against the pre-registered bar, not re-scored): GO
