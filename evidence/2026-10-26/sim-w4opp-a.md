# sim-w4opp-a — wave-4 encounter-opportunity decomposition (axis scale-onramp)

Run: fleshout loop, arm sim-w4opp-a. DIAG / MEASUREMENT ONLY — zero
src/js changes, no demand-number moves, no veterans-bar changes, no
default flips. Do NOT move demand numbers on this evidence. Do NOT
re-judge the wave4enc partition (it is reused, not re-litigated).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5). No design is invented here.

Starting HEAD (this worktree): c1e8329e5096f1bf10570ef3424974b91867db17
(eggroad reachability pilot commit on top of the 1920Z wave4enc base
line — see RE-BASELINE below for the field-by-field delta).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Question (findings backlog #1152, from sim-wave4enc-a 1920Z): 33
  wave-4 spawns on band 73671-73678, 24 never fought at all (band
  dominant class), spanning days 101-180, so lateness alone does not
  explain them. Decompose the never-fought spawns by OPPORTUNITY:
  spawn placement vs villager routing vs meeting rules. Which of the
  three starves encounters?
- Substrate (both arms): tableseat-nowait (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only), seeds 73671-73678, 180d
  death-aware horizon (runDays stops on Game.over).
- Re-baseline FIRST: plain tableseat-nowait, 8 seeds, compared
  field-by-field against the 1920 band table (wins 2/8, national-ever
  6/8, national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5
  0/8, median 152d, deaths 307). Any base delta is reported
  field-by-field, never silently absorbed.
- Baseline: plain tableseat-nowait, own replication (8 seeds), NOT
  another arm's corpus. Armed: tableseat-nowait wrapped with five
  observational recorders, four reused verbatim
  (spawnsrc-diag SPAWNSRC=1, wave4enc-diag WAVE4ENC=1,
  fieldfinish-diag FIELDFINISH=1, nonworldkill-diag NONWORLDKILL=1)
  plus ONE new recorder w4opp-diag (W4OPP=1). Recorders never write
  game state, draw no RNG, never throw into the engine (errors
  counted). They never call villageStandingTotal() or unlockedWave()
  mid-run.

### MEETING-RANGE RULE MEASURED AGAINST (read from src/js/game.js, never invented)

- VILLAGER field meeting (villagerMonsterTick, inside worldTick):
  the monster's tile (tx,ty) must EQUAL a villager's node (npcNode);
  the monster must NOT be on the player's tile; the villager must be
  on the roster, living, not sheltered, not post-flee-resting. Then,
  per worldTick, a 50% roll (Math.random() > 0.5 skips) picks one
  occupant at random and resolveWildMonsterEncounter runs a real
  fieldFight. There is NO distance gradient for villagers: same tile
  or nothing.
- PLAYER tb meeting (moveMonster handlers on the player tile): the
  player must be on the monster's tile, and grid contact is the same
  grid cell (monster mx,my == player mx,my) -> startCombat in the
  stance branches (hummice hunts by ear: Chebyshev distance <= 1 ->
  startCombat). Measured proxy: same tile + Chebyshev gridDist <= 1
  = "player in range"; gridDist == 0 = "player contact".
- MONSTER movement (wanderWorldMonsters, inside worldTick): 35% per
  worldTick, one orthogonal tile, never onto a safe tile, an occupied
  tile, or off the 9x9 board. Monsters do NOT seek villagers.
- VILLAGER movement (npcNodeTravel, once per day-part): objective
  driven (forage / explore / visit / guard / haul / ...), never
  monster-targeted. No engine path sends a villager TO a monster.
- SPAWN placement (pickWorldTile): excludes the player tile, safe
  tiles (villages incl. the Haven node), and occupied tiles;
  weighted thicket 3 / ruin 2 / else 1. A wave-4 monster is born
  scattered across the board, never at the Haven door.
- WORLD CLOCK: worldTick runs ONLY on player tile entry
  (checkEncounter -> worldTick is its sole caller). The living world
  — wandering, villager ticks, maintain — advances only when the
  player moves between tiles. A player sitting at Haven freezes the
  world's meeting chances (the recorder's daily snapshots still
  record positions, but no villager tick runs without a worldTick).

### OUTCOME CLASSES (exactly one per never-fought wave-4 spawn)

The wave4enc partition is reused intact: field events + tb events +
never-fought spawns = every wave-4 encounter exactly once. The
never-fought set is then partitioned by opportunity. Primary classes
(precedence order — a spawn takes the FIRST class whose condition
holds, so the classes are disjoint and exhaustive):

1. contact-without-fight: >= 1 post-tick snapshot with a living
   villager on the monster's tile (that tick's villagerMonsterTick
   ran with them co-located — the 50% roll, shelter, post-flee-rest,
   or table-sanctity is the only thing standing between contact and
   a fight), OR >= 1 snapshot with player gridDist == 0 without a
   following fight. The meeting happened; the fight did not.
2. in-range-never-met: in range but never contact — a living
   villager on the monster's tile on daily snapshots only (the
   monster wandered off, or the villager moved on, before the next
   worldTick), OR the player on the monster's tile with gridDist
   == 1 (on the tile, never bumped). Nearness without a meeting.
3. never-in-range: no snapshot in villager range (same tile) and no
   snapshot in player range (same tile + gridDist <= 1). The monster
   and the village never shared a tile on any snapshot.

Cross-tabs (reported per class, never double-counted as classes):
removal cause hint (lostSight / fight-adjacent / raid / network /
finale / unknown — stack-name hint from the removeWorldMonster
wrap, stated as a hint, not ground truth), still-present-at-end
flag, snapshot count (incl. a zero-snapshot subcount: spawned and
gone between snapshots, classed never-in-range and flagged),
spawn distance-to-Haven (Manhattan tiles), days present
(last-seen day minus spawn day), minimum nearest-villager distance
ever seen, minimum player-tile distance ever seen. "Removed before
opportunity" and "died by another cause" are reported as named
subcounts inside these cross-tabs (removed never-fought spawns by
cause; removed-before-ever-in-range counts), not as extra classes,
because a fourth class on removal would double-count spawns that
are already exactly one of the three above.

- Fought-spawn contrast table (this run's own fought spawns, NOT
  the 1920 nine re-judged): spawn distance-to-Haven, days from
  spawn to first fight, whether a villager-range or player-range
  snapshot preceded the first fight, and which channel fought it
  (field vs tb). The contrast question: do fought spawns differ in
  placement, routing luck, or both?
- Cost bar: armed starvation total <= baseline starvation total + 2
  AND armed median days >= 0.8 x baseline median days. Stronger G2
  identity preferred (armed == baseline exactly on days/gameDays/
  ts/starvation).
- Det-gate: recorders unset == unwrapped on one seed.
- DIAG-GO iff (1) >= 6/8 seeds fully classified (every wave-4 spawn
  in exactly one opportunity class, zero unclassified, recorder
  errors zero), AND (2) the dominant opportunity class is named with
  per-seed counts, AND (3) the fought-spawn contrast is stated.
  Otherwise DIAG-NO-GO, bar honored. A dominant class is a finding,
  not a fail.
- BALANCED PANEL (§15): same recorder-corpus limitation as prior
  arms — balance-panel.js has no corpus-ingest mode; the paired
  identical-seed tables below are the comparison of record. No
  panel file is produced or faked.
- Telemetry-check is NOT run on recorder rows (its counts are wrong
  on recorder rows — standing instruction).
- Sense-testing: one NON-MEASURED narration-on replay of the seed
  with the most never-fought spawns; judge in plain words whether
  the unmet monsters read as distant, avoided, or ignored — and
  whether the village ever treats a known unmet monster as a
  problem to work on. Never census evidence.
- DIAG ONLY: no readyDemand moves, no VETSHAPE flip, no src/js
  default change, no combat-code change. No [needs-eyes] flag is
  expected: measurement only (stated explicitly per the brief;
  re-confirmed at close if that assessment holds).

## RESULTS (appended after the run)

### Verdict: DIAG-GO (8/8 seeds fully classified — above the >= 6 bar)

- G1 det-gate: PASS. Seed 73671, recorders unset == unwrapped:
  days 180, gameDays 181, ts {tsNationalDay: 107} on both sides,
  no recorder surface, no installed wraps.
- G2 recorder neutrality: PASS, 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8, kill-log
  agreement 8/8 (exact entry tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-26/perseed-w4opp-a/ + summary.json; every armed
  row carries wave-4 event rows (spawns, seq-linked field fights,
  tb starts/ends) + w4opp life-history snapshots + removal hints +
  the post-run pure-read final pool.
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed
  median 152 >= 0.8 x baseline median 152 (identical — the
  recorders move nothing, so the cost bar is met trivially and
  honestly, via G2 identity rather than by a margin).
- Proof: scripts/test-w4opp-a.js — 247 PASS, 0 FAIL (per-seed
  classes, partitions, per-spawn precedence invariants, fought
  contrast, bands, diffs, death-cause sums, and the verdict rule
  all re-derived from the rows).
- Detail: --detail 73675 censusMatch=true (partition 8, identical
  classes on re-run) and --detail 73672 censusMatch=true
  (partition 13), both on the CORRECTED corpus (see the instrument
  correction below).

### RE-BASELINE (base c1e8329e) — EXACT, zero base delta

Band aggregates vs the 1920 table: wins 2/8, national-ever 6/8,
national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
median 152d, deaths 307, starvation 1 — every field identical.
Per-seed trajectories are also identical to the 1920 baseline
column (73671 180d survived w4 48 deaths; 73672 180d survived w4
51; 73673 124d lost w4 global national-final 32; 73674 142d won
lesser w3 national table entered 28; 73675 180d survived w4 26;
73676 144d won w4 43; 73677 152d lost w4 regional/global table
41; 73678 104d lost w3 starvation 38). The eggroad commit on top
of the 1920 base moved NOTHING on this band. Future arms compare
against this table and the 1920 table interchangeably — they agree.

### INSTRUMENT CORRECTION (disclosed BEFORE judging — the first sweep's headline was wrong)

The first full sweep reported bandOpp contact-without-fight 14,
never-in-range 10, and the run was NOT judged on those numbers.
Reading the per-spawn detail (73675: a herald with 99
"tick-villager" snapshots and zero fights — impossible under the
50% roll) exposed the bug: the snapshot counted the PLAYER as a
"villager on the tile." Game.js:2449 puts villagerId FIRST in the
roster, and npcsOnNode filters rid === villagerId — the engine's
meeting set never includes the player. The snapshot also counted
monsters on the player tile as villager-range, which
villagerMonsterTick explicitly skips. Both errors fabricated
contact opportunities the engine never offers.

Fix (scripts/policies/w4opp-diag.js, recorder only — the class
definitions in the prereg are UNCHANGED, the implementation now
matches them): the snapshot counts ONLY eligible villagers
(roster minus player, living, not sheltered, not post-flee-
resting — exactly villagerMonsterTick's filter), sets
villagerRange false for monsters on the player tile, and records
onTileVids for audit. The armed sweep was re-run in full on the
corrected recorder (baselines untouched — they are recorder-free
and G2-identical). Corrected numbers supersede the first sweep
entirely; the buggy numbers are reported here and nowhere else
as a result. A second, sense-only fix (diag stubs in the sense
row) affected no census number.

### PER-SEED OPPORTUNITY (CORRECTED — the judged numbers)

| seed | days | end | wave | spawns4 | never-fought | contact-without-fight | in-range-never-met | never-in-range | fought spawns |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 4 | 4 | 2 | 0 | 0 | 2 | 2 |
| 73672 | 180 | survived | 4 | 8 | 6 | 0 | 0 | 6 | 2 |
| 73673 | 124 | lost | 4 | 5 | 3 | 0 | 0 | 3 | 2 |
| 73674 | 142 | won (lesser) | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| 73675 | 180 | survived | 4 | 7 | 6 | 1 | 0 | 5 | 1 |
| 73676 | 144 | won (lesser) | 4 | 2 | 1 | 0 | 0 | 1 | 1 |
| 73677 | 152 | lost | 4 | 7 | 6 | 1 | 0 | 5 | 1 |
| 73678 | 104 | lost | 3 | 0 | 0 | 0 | 0 | 0 | 0 |

Band opportunity (24 never-fought spawns): contact-without-fight
2, in-range-never-met 0, never-in-range 22. Dominant opportunity
class: never-in-range (22/24). The wave4enc partition itself
reproduces exactly (49 units: never-fought 24, tb-lose-or-rout
13, field-flee-villager 8, field-lose 4, kills 0 in every
channel).

Cross-tabs on the 24 never-fought spawns:
- Still present at end: 21/24. Removed: 3/24, all three removed
  BEFORE ever being in range (removed-before-opportunity 3).
- Removal causes (full stack hints, not first tokens): 73675
  eater (d106->d145) and 73675 eulogy (d139->d145) removed via
  startCombat on d145 — but NOT by their own fights. On d145 the
  player fought contest-arena tb fights (nevermore,
  speedbump_turtle) whose tileMonster carried the eater's /
  eulogy's seq: the arena path consumed the world entities as
  collateral and the fights were about other monsters. Arena-
  collateral removal is a real engine path that deletes a wave-4
  monster without it ever being fought AS itself. 73677 eulogy
  (d120->d121) removed during a monster turn (monsterTurn hint
  — fled / gone, not fought). No never-fought spawn died by any
  other combat cause.
- Zero-snapshot spawns: 0. Every never-fought spawn was observed
  (4-337 snapshots each).
- Spawn sources: tile-entry 20, scripted-titan 3, maintain 1.
- Spawn distance-to-Haven (first snapshot): never-fought mean
  2.0 tiles (range 1-7); fought mean 1.6 (range 1-4). Placement
  overlaps almost entirely — closeness does not separate fought
  from never-fought.
- Days present: never-fought mean 25.3 days (max 79: 73675 herald
  d101->d180; 73672 reunion d111->d180, 69 days, 337 snapshots,
  closest eligible villager ever 2 tiles away).
- Minimum nearest-eligible-villager distance (over non-null
  snapshots only): never-fought mean 2.5 tiles. Minimum
  player-tile distance: mean 0.8 — the PLAYER shared the tile
  with many never-fought monsters (minPlayerTiles 0) without a
  fight: same tile, different grid cells, no grid contact, no
  meeting. Tile-sharing is not meeting; the grid cell is.
- Null-nearest day-blocks: on some days every snapshot reads
  nearestVillagerDist null (whole days, never mixed within a
  day — e.g. 73672 d111-120 null, d121-158 non-null, d159-180
  null). The only whole-village day-blocked filter in the
  snapshot's path is the shelter flag (shelter musters set it
  for everyone but holdouts, in blocks). Read as: on those days
  the village was sheltered behind the barricaded door, so no
  villager meeting was possible by design. Stated as the
  consistent reading, not directly proven per day from rows —
  a future arm should record the shelter count per snapshot.

The 2 contact-without-fight spawns, in full:
- 73675 herald (d101, scripted-titan, distHaven 3, 79 days, 331
  snapshots): player-only range — the player reached gridDist 0
  on its tile at least once without a tb fight starting. The
  consistent mechanism is wander-landing: wanderWorldMonsters
  re-randomizes mx,my on tile change and can land on the
  player's cell, and the behavior step runs on player movement
  within the tile — a monster that lands on the player's cell
  and is left when the player changes tiles never triggers the
  step. One instance, hypothesis stated, not proven.
- 73677 eulogy (d123, distHaven 1, 29 days, 127 snapshots):
  exactly ONE tick contact with an eligible villager (plus one
  daily), then no further tick contact — the 50% roll failing
  once (P=0.5), after which monster and villager moved on.
  The coin flip explains it completely; no blocker is needed.

In-range-never-met is ZERO on all 8 seeds: range without contact
essentially never happens. Either a monster shares a tile with
an eligible villager at a tick (contact, and usually a fight
follows — see the contrast) or it never shares a tile at all.
Daily snapshots almost never catch transient co-location.

### FOUGHT-SPAWN CONTRAST (this run's own 9 fought spawns)

| seed | spawn | type | channel | days to first fight | range before fight | contact before fight | distHaven |
|---|---|---|---|---|---|---|---|
| 73671 | d162 | suburb | both | 14 | yes | yes | 2 |
| 73671 | d168 | influencer | both | 4 | no | no | 1 |
| 73672 | d109 | herald | field | 28 | no | no | 4 |
| 73672 | d131 | influencer | both | 8 | no | no | 1 |
| 73673 | d105 | algorithm | both | 0 | no | no | 1 |
| 73673 | d116 | eater | field | 6 | no | no | 2 |
| 73675 | d139 | algorithm | tb | 7 | no | no | 1 |
| 73676 | d134 | suburb | tb | 8 | no | no | 1 |
| 73677 | d149 | eulogy | field | 2 | yes | yes | 1 |

Channels: both 4, field 3, tb 2. Only 2/9 fought spawns showed
range or contact BEFORE their first fight — for the other 7,
the first fight WAS the first meeting (a player bump, or a
villager tick that fired). Fought spawns do not loiter in range
beforehand; they are met once and fought. The contrast with the
never-fought set is therefore not "fought spawns hung around
longer" — it is that 22 monsters never shared a tile with an
eligible villager in weeks of observation, while 9 did (and were
fought within 0-28 days of spawning).

### THE ANSWER TO BACKLOG #1152 (spawn placement vs routing vs meeting rules)

It is ROUTING + MEETING RULES, not placement:
- Placement does NOT starve encounters: wave-4 monsters spawn
  close (mean 2.0 tiles from Haven) and persist for weeks (mean
  25.3 days, 21/24 still present at run end). The Draft is not
  far away and it is not fleeting.
- Villager routing does: no engine path sends a villager TO a
  monster. npcNodeTravel is objective-driven (forage / explore
  / visit / guard / haul); villagers cross the board on errands,
  and a monster's tile is crossed only by coincidence. The
  73672 reunion sat 69 days with the closest eligible villager
  ever 2 tiles away — the village's errands never took anyone
  onto its tile.
- The meeting rules finish the job: a villager meeting needs
  same-tile co-location at a worldTick (50% roll), and
  worldTick runs ONLY when the player enters a tile — a player
  sitting at Haven freezes the world's meeting chances. A
  player meeting needs same-tile PLUS same grid cell; the
  player shared tiles with never-fought monsters repeatedly
  (minPlayerTiles 0) without ever sharing a cell.
- The two genuine contacts show the rules working as written:
  one coin flip lost (73677 eulogy), one grid cell never shared
  at a behavior step (73675 herald). There is no hidden blocker
  behind the never-fought class — the class is the rules
  operating on a board where nobody walks toward monsters.

### SENSE-TEST (NON-MEASURED replay, seed 73672 — census shape reproduced exactly)

Replay (narration on): 180d survived, maxWave 4, spawns4 8,
neverFought 6, all never-in-range — the census trajectory, not
a fresh run. The ring covers only d178-d180 (capped at 240
lines), so it cannot judge the d111-d176 unmet era directly;
what it captures is the endgame stance:
- "🌪️ THE HERALD fed in the night — 0 kcal gone from your
  stores. It is eating the realm while you deliberate." then
  "The village is rattled. Everyone's jumpy — eyes on the
  treeline." A wave-4 monster is NAMED as a presence, and the
  village's answer is vigilance, not a plan.
- "The Ugly Beast stops at the treeline — pacing, unwilling.
  The walls end the argument. It's still out there." (twice)
  The wall is the strategy; the beast remains a fact of the
  boundary.
- Villagers speak as people with jobs: Ingrid "Give it hell."
  and "Thirst doesn't negotiate. Going."; Khalil "Gone looking.
  Don't wait up."; Ben of Thornfield arrives with 2,521 kcal —
  "Eat. We'll settle the books when the green comes back."
  The relief beat deliberates honestly: "We can bind the
  wounds, or go lean, or hunt hard to replace what we lost. Say
  which — standing here isn't an answer."
Plain-words judgment: the unmet monsters read as DISTANT, not
avoided and not quite ignored. Nobody runs from them (no
avoidance behavior is narrated) and nobody forgets them
("eyes on the treeline", "rattled"), but the village never
treats a known unmet monster as a PROBLEM TO WORK ON: no one
proposes hunting the herald, no sortie is mustered against
the Draft, no expedition is named. Monsters are weather the
village endures behind walls, not quarry it pursues. That is
the sense-level blank, and it matches the census exactly.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- Villagers DO their jobs with voice and consequence: forage
  returns with honest kcal (Ingrid +540, Ben +2,521), water
  runs, trade arrivals, wound deliberation with real options.
  The relief beat forces a choice instead of auto-solving.
- Villagers DO fight when the rules put them on a monster's
  tile: 12 field fights band-wide (8 vFlee, 4 vDie — the
  wave4enc shape, unchanged), and the scholar's party loses
  every wave-4 tb fight (13/13). The fighting is real; the
  meeting is the rare part.
- The least people-like datum is the negative: across 24
  never-fought spawns and hundreds of snapshots each, NO
  villager is ever recorded moving TOWARD a known monster.
  That is not a villager failure — the engine gives them no
  monster-directed verb. Pursuit/expedition-against-a-known-
  monster is a missing behavior, documented here, not fixed
  (DIAG only).
- The scholar's behavior is bot-policy behavior (tableseat-
  nowait seat legs + leanlinkrescue courtship), not villager
  behavior, and is not judged as such.

### WALL NUMBERS (this run's judged corpora — baseline = armed, G2 identical)

Wins 2/8, national-ever 6/8, national-final 5/8, table waiting
4/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median
152d, max 180d, deaths 307, starvation 1. Wave-4 kills 0/8
seeds, wave-4+ killers peak 0 everywhere — unchanged from
wave4enc, now with the mechanism: the fights are lost 13/13 tb
and 12/12 field-non-kill, and 22/24 never-fought spawns never
shared a tile with an eligible villager at all.

Death-cause shares (armed band, 307 deaths): villager:combat
126 (41.0%), villager:villager combat 85 (27.7%), player:the
arena 43 (14.0%), villager:expedition 13 (4.2%),
villager:monster 8 (2.6%), player:dehydration 7 (2.3%),
villager:sickness 6 (2.0%), villager:a wound that wouldn't
close 6 (2.0%), villager:ambush 3 (1.0%), player:contest 2
(0.7%), villager:thirst 2 (0.7%), and 1 each (0.3%):
villager:The Moderator, player:lockjaw, villager:The
Redactor, player:starvation, villager:alien, villager:The Loud
Beast. Combat dominates deaths; starvation is 1 — the scale
wall is not a starvation wall on this band.

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered: 8/8
  seeds fully classified (every wave-4 spawn in exactly one
  opportunity class, zero unclassified, recorder errors zero),
  dominant class named with per-seed counts (never-in-range
  22/24), fought-spawn contrast stated (9 spawns). No metric
  was re-scored. The class definitions were not changed; the
  recorder implementation was corrected to match them (see
  the instrument correction), and the run was re-swept before
  judging — the same disclosure practice as wave4enc-a's two
  pre-judgment instrument corrections.
- One metric note for the NEXT run (carried from wave4enc-a):
  "fully classified" passes vacuously on zero-encounter seeds
  (73674, 73678). A future bar that wants to force encounter
  coverage should require a minimum encounter count per seed
  separately from trace completeness — proposed here, not
  applied retroactively.
- Two instrument notes for the NEXT run: (1) record the
  shelter count per snapshot so null-nearest day-blocks are
  proven shelter blocks instead of inferred; (2) read the FULL
  removal stack hint, not just its first token (the first
  token is the wrapper itself — the cause lives in tokens 2+);
  and count arena-collateral removals explicitly, since the
  wave-4 tb-event definition (by the fight's monster wave)
  leaves them in the never-fought set by design.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms
  (balance-panel.js has no corpus-ingest mode). The paired
  identical-seed tables above are the comparison of record.
  No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction).
- check.js --quick NOT run: zero src/js diff in this tree
  (DIAG arm, one new recorder + two sweep/proof scripts
  only) and sibling loops are live; the arm's own proof is
  the det-gate + G2 identity + the 247-check proof + two
  detail census-matches. node --check clean on all new
  scripts.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/w4opp-diag.js — NEW in this arm (CORRECTED
  version judged here). Spawn life-history recorder (W4OPP=1):
  post-tick + post-day snapshots of every wave-4 world entity
  (position, Haven/player distances, nearest eligible
  villager, on-tile eligible vids, meeting-range flags) +
  removal hints. Strictly read-only (nodePos read directly,
  never via npcNode).
- scripts/test-w4opp-diag-sweep.js — NEW in this arm. Sweep
  (--one per seed via child processes, --summary rebuild,
  --detgate, --detail, --sense). Det-gate PASS, detail
  census-match PASS (73675, 73672), sense replay done
  (NON-MEASURED, see above).
- scripts/test-w4opp-a.js — NEW in this arm. Proof:
  re-derives every summary number from the rows; 247 PASS,
  0 FAIL.
- Reused verbatim: scripts/policies/spawnsrc-diag.js,
  scripts/policies/wave4enc-diag.js,
  scripts/policies/fieldfinish-diag.js,
  scripts/policies/nonworldkill-diag.js (no edits).

### INFRASTRUCTURE (loud, as required)

- The first full sweep's parent process died mid-armed-run
  (background session lost, no error delivered): all 8
  baselines were already on disk and unharmed, the armed run
  was resumed from the row files (armed 73672-73678 re-run,
  then --summary), and the corrected re-sweep later
  overwrote every armed row. No data was lost; the resume
  path is the row files, not the parent process.
- No EPERM flap hit this run: all node/shell disk writes
  succeeded (16 band rows, summary, evidence, sense text).
  No stdout-only fallback was needed.
- No safe-commit refusal yet (commit step follows this
  file); the coordinator owns the --ff-only merge. No
  [needs-eyes]: this DIAG arm changes no feel, combat, or UI
  — that assessment did not change during the run.

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the wave-4 encounter-opportunity
  decomposition on band 73671-73678 — 24 never-fought spawns:
  never-in-range 22, contact-without-fight 2,
  in-range-never-met 0. DIAG-GO (8/8 classified).
- FILLED (measurement): the mechanism — routing + meeting
  rules, not placement. Monsters spawn close (mean 2.0
  tiles), persist for weeks (mean 25.3 days), and are never
  met because no villager verb walks toward monsters and
  meetings need same-tile (villager) or same-grid-cell
  (player) coincidence.
- FILLED (measurement): the re-baseline delta — ZERO. The
  eggroad commit moved nothing on this band; band and
  per-seed tables match 1920 exactly.
- FILLED (measurement, instrument): the player-as-villager
  phantom-contact bug — found, fixed, and the sweep re-run
  before judging. The first sweep's 14/24 contact headline
  is superseded, not averaged.
- DOCUMENTED, NOT FIXED (engine path): arena-collateral
  removal — a contest-arena tb fight can delete a wave-4
  world entity that is not the fight's monster (73675 eater
  + eulogy, d145). The monster vanishes unfought.
- DOCUMENTED, NOT FIXED (engine path): monster-turn removal
  (73677 eulogy, d121) — a wave-4 monster leaves the board
  on its own turn, unfought.
- DOCUMENTED, NOT FIXED (sense blank): the village never
  treats a known unmet monster as a problem to work on —
  vigilance ("eyes on the treeline") and walls, never pursuit.
  No monster-directed villager verb exists.
- DOCUMENTED, NOT FIXED (instrument gap): null-nearest
  day-blocks are read as shelter blocks by inference; the
  next arm should record the shelter count per snapshot.
- NOT A FINDING: no game bug was found in the wave-4 spawn,
  wander, field-fight, or tb paths — the two independent
  field wraps agree on wave-4 counts on all 8 seeds, the kill
  log agrees with the tb ends, and the faced feed agrees
  with the event rows. The encounters work as designed;
  the village simply never walks to them.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and now
the reason has a second decomposition — the Mirror Draft is
not merely unbeaten (0/25 fights) but mostly unmet (22/24
never-fought spawns never shared a tile with an eligible
villager), because nothing in the village's routing walks
toward monsters and meetings are tile/cell coincidences.
The wall did not move; this arm measured exactly how it is
manned, tile by tile.

### COORDINATOR ADDENDUM — relation to journey-scale r41 spawnfate (master 628ceb21e)

The r41 spawnfate evidence WAS located (not missing): commit
628ceb21e, evidence/2026-10-26/journey-scale-r41.md +
journey-scale-r41-prereg.md + journey-scale-r41-spawnfate/
rows, on base master@6ef77e3e7 (the 1920Z base). No merge or
rebase was performed by this arm — the coordinator owns
landing, and the final proof re-run on the merge base is the
coordinator's step (see the landing note below).

(1) Baseline reporting, as pre-registered: the RE-BASELINE
section above already reports this arm's baseline against
the 1920 table on THIS arm's own base (c1e8329e) — EXACT on
every field, band and per-seed. That requirement is met
without touching r41's numbers.

(2) How the opportunity classes relate to spawnfate (not a
duplication): r41's fate classes are about END STATE
(alive-at-end vs vanished); this arm's opportunity classes
are about OPPORTUNITY HISTORY (ever in meeting range or
contact or not). They CROSS, and the cross-tab is the check
that neither arm re-proves the other:

| r41 fate | this arm's opportunity class | count |
|---|---|---|
| alive-at-end | never-in-range | 19 |
| alive-at-end | contact-without-fight | 2 |
| vanished-near-player | never-in-range | 3 |

Agreement on every shared number: 33 spawns, 24 never-fought,
9 fought (field 3, tb 2, both 4), 21 alive-at-end, 3
vanished-near-player, vanished-interior 0. Two independent
instruments on two bases (r41: 6ef77e3e7; this arm:
c1e8329e, re-baseline EXACT) reproduce the same band.

What r41 already proved, NOT re-proven here: the monsters
still stand there. "Alive-at-end 21/24 (87.5%)" is r41's
standing result — this arm does not re-derive standing as
its question; its present-at-end 21/24 is the same fact
arrived at by a second recorder, reported as agreement, not
as a new claim.

What this arm adds, sharply, per the addendum's reframing:
- WHY villagers never go to them: no engine path sends a
  villager TO a monster (npcNodeTravel is objective-driven);
  monsters spawn close (mean 2.0 tiles from Haven) and
  persist for weeks (mean 25.3 days) without ever sharing a
  tile with an eligible villager (22/24).
- WHY meeting rules never trigger: villager meetings need
  same-tile co-location at a worldTick, and worldTick runs
  ONLY on player tile entry; player meetings need same tile
  PLUS same grid cell (players shared tiles with never-
  fought monsters repeatedly, minPlayerTiles 0, without ever
  sharing a cell). The 2 contacts show the rules working as
  written (one coin flip lost, one grid cell never shared at
  a behavior step) — no hidden blocker.
- CLOSING r41's open hole: r41 left 1/33 unexplained (73677
  eulogy, single-day spawn, no captured removal) and named
  the next work as "wrap removeWorldMonster with a
  stack-hinted removal log." This arm built exactly that
  recorder for the whole band: the 73677 eulogy was removed
  d121 during a monster turn (monsterTurn stack hint) —
  fled/gone, not fought. The hole is closed; no removal in
  this band is unexplained.
- CONFIRMING r41's explained hole with a second instrument:
  the 73675 eater + eulogy arena-collateral deletions are
  confirmed here via removal hints (startCombat) PLUS the
  d145 arena start rows (tileMonster seqs 28/31 carried
  into wave-1 arena fights), alongside r41's code-read
  mechanism (startCombat lifts the tile monster; tbEnd
  restores it only on fled/lost, never on 'won'). The
  bystander-deletion mechanism stands on two instruments.
- R41's journey leg (seeds 85001-85004, lesser seats 3/4)
  is a separate batch on different seeds/policy and does not
  overlap this arm's band; it is noted here only to avoid
  confusion, not compared.

Landing note: this arm performed NO merge and NO rebase,
per the addendum. scripts/test-w4opp-a.js is base-agnostic
(it re-derives every number from the rows + summary rather
than hardcoding band outcomes), so the coordinator's
merge-base proof re-run validates whatever corpus the merge
base produces — but if the merge base moves trajectories,
that is a re-sweep, not just a re-proof, and the summary
must be rebuilt from the new rows before the proof is run.

