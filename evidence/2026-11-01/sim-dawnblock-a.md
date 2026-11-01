# sim-dawnblock-a — the dawn lingering-encounter block: what lingers, how long, what clears it (DIAG ONLY)

Run: fleshout-loop-a-20261101T1235Z. Worker: sim-dawnblock-a. Axis:
scale-onramp (converging, NOT converged). Sibling Loop B works
food-economy — NOT touched. Sibling arm tree sim-titangate-a —
NOT touched.
Pre-registration: evidence/2026-11-01/sim-dawnblock-a-prereg.md
(COMMITTED 6b1ab86f0 before any judged sims; judged exactly against
that bar, no re-scoring).
Instrument: scripts/policies/dawnblock-diag.js (pure-read recorder)
+ scripts/dawnblock-a-sweep.js (sweep + analyzer + sense mode) +
proof scripts/test-dawnblock-a.js. Recorders reused UNMODIFIED:
scripts/policies/tableseat-nowait.js, scripts/policies/fullseat-diag.js,
scripts/policies/vet2-diag.js, scripts/seathes-a-sweep.js (seathes
wrapper, for the ts-diff cross-check). Composition:
withDawnblockDiag(withSeatHesDiag(withVet2Diag(withFullseatDiag(
tableseatNowait)))). Env: LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
FULLSEAT=1, VET2=1, DAWNBLOCK=1. Horizon: 180d death-aware.
Corpus: evidence/2026-11-01/dawnblock-a-perseed/s<seed>.json +
s<seed>-daily.json + summary.json.
No game code changed. No policy file edited. No gate threshold
moved. No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-base DIAG census, no
before/after lever comparison exists in this arm; none fabricated.
The ON-vs-OFF and vs-seathes comparisons below are
recorder-neutrality proofs, not panel comparisons, and their numbers
never enter a census table as a lever effect.

## INTENTIONAL REUSE — not a fresh-seed claim

Seeds 78201–78208 are REUSED from sim-seathes-a exactly (same band,
same horizon, same stack plus one pure-read layer). This is a
decision-moment re-measurement of the EXISTING corpus, NOT a
fresh-seed claim: no new wall numbers are claimed from this arm.
Wall numbers below are the seathes/recheck's, reproduced exactly
by the new stack — reported as a reproduction check, not as new
findings.

## Verdict: DIAG-GO

Judged exactly against the prereg's bar:
- At least 90% of held-seat dawns classified by block reason:
  PASSED — 65/65 = 100% (held dawn = decision row with seat
  lesser/full, table not done, run alive).
- EVERY encounter-blocked held dawn traced to kind + pending age
  + clearance outcome: PASSED — 12/12 traced, 0 untraced.
- Known block shape reproduces: PASSED — 78201 encounter-blocked
  on days 173–180 (8 dawns), 78208 on days 140/147/148/163
  (4 dawns), on the same stack.
- At least one falsified alternative hypothesis: PASSED — four
  of seven falsified (H2, H3, H5, and H7's third raider as
  stated — see scoreboard); H1, H4, H6 confirmed.
- Sense read of at least one blocked-dawn beat: DONE (see
  SENSE-TESTING section; sense files are NON-MEASURED).
- Recorder-neutrality leg PASS (end fields match the seathes
  corpus on 8/8 seeds; DAWNBLOCK ON vs OFF identical on 78201
  and 78208) and determinism leg PASS (78201 re-run
  byte-identical, row + daily-series JSON, cmp clean; scratch
  deleted).
- Proof test scripts/test-dawnblock-a.js: GREEN, 51/51 (analyzer
  unit checks on synthetic series + corpus legs re-deriving
  every headline number from the judged corpora, independent
  of the sweep's printed verdict).

## Answer in one paragraph

The thing that blocks sitting at dawn is never a fight, never a
contest, never a conversation, and never a pending (unstarted)
encounter — it is always a monster standing on the scholar's own
tile at the decision moment, and on this band it is always at
Haven (4,4). On 78201 two wounded survivors of the day-172 night
raid loiter around Haven for eight straight mornings: The Herald
(wave 4, 525 HP, frozen — never fought again) blocks seven
mornings, then wanders one tile away on the last morning and a
second raider, Big Loud the mirrormoth (wave 1, 26 HP, frozen),
is standing on the tile instead — so the village is blocked all
eight mornings even though the monster's name changes on the
eighth. On 78208 three separate wave-4 monsters each wander onto
the Haven tile on different days (one morning, two mornings, one
morning) and each leaves the same way it came — wandering off,
not being fought. Nobody ever fights any of them: their HP never
moves after the day they arrive. And on every single blocked
morning the village is regional, so even if the monster had
vanished the policy's national+ gate would still have refused
the seat — the encounter is a real second door, but on this band
it is never the door that matters, because the first door (the
rank gate) is already shut. The sit control proves the point
from the other side: 78206 has zero encounter-blocked mornings
and sits on day 90.

## The five questions, answered

### Q1 — Which encounter kinds linger to dawn?

Tile monsters. Only tile monsters. Band-wide, over all 1,035
decision rows, the encounter signal at the decision moment is:
tile-monster 135 rows, live tbfight 0, pending-only 0, contest
0. (Conversations never produce a tableEntryBlock line at all,
and contests produce the contest line, not the encounter line —
both are checkable negatives, and neither ever appears as the
decision-moment state on this band.) Every one of the 12
encounter-blocked held dawns carries a tile monster and no live
fight: the firing signal is `scholar.monster` (the monster on
the scholar's tile) in 12/12 cases. The code says why this must
be so: tableEntryBlock() returns the encounter line iff
inCombat() OR scholar.monster — pendingEncounter is never
checked, so a "pending" encounter, however long it pends, can
never block sitting by itself.

### Q2 — How long do they linger, and what clears them?

Identity episodes (same monster, same tile, consecutive
decision rows):

| seed | monster (wave) | tile | dawns | clearance |
|------|---------------|------|-------|-----------|
| 78201 | The Herald (4) | Haven 4,4 | 173–179 (7) | MOVED-AWAY day 180 (to 5,3) |
| 78201 | Big Loud, mirrormoth (1) | Haven 4,4 | 180 (1) | STILL-PENDING at the 180d cap |
| 78208 | The Influencer (4) | Haven 4,4 | 140 (1) | MOVED-AWAY day 141 (to 2,4) |
| 78208 | Big Big, congregation (4) | Haven 4,4 | 147–148 (2) | wandered off-tile during day 148 (to 4,5), then gone from the world by day 149, no kill logged |
| 78208 | Loud-Eyes, reunion (4) | Haven 4,4 | 163 (1) | STILL-PENDING (village dies day 164) |

What clears them is wandering, not fighting. Zero of the five
episodes end in a recorded kill: no waveKillLog entry for any
lingering monster appears across any clearance gap, and no
lingering monster's HP ever changes after its arrival day.
Herald: 700 HP before the raid night, 525 from day 173 to day
179 without moving a point. Big Loud: 35 → 26, then frozen.
Influencer: 613 while approaching, 267 on arrival day 140,
frozen. Congregation: 627 → 402 on arrival, frozen.
Reunion: 1200 → 900 on arrival, frozen. The arrival-day damage
is the raid/palisade toll (see the sense section) — after that
night, nobody touches them again. They drift around Haven on
adjacent tiles (Herald 5,4 → 6,4 → 4,4; Influencer 8,4 → 7,4 →
4,4 → 2,4), step onto the scholar's tile some mornings, step
off others, and eventually wander away or vanish from the
world unrecorded. Nothing in the instrument can distinguish
"despawned by world maintenance" from "killed without a log
entry" for the congregation's disappearance — the label says
so (see metric review).

### Q3 — Same-day-only, or does one linger block many dawns?

Both shapes exist, and the distinction matters. By identity:
the longest single-monster linger is 7 dawns (Herald), then a
2-dawn linger (congregation), then three 1-dawn visits. By
tile-block (any monster on the tile, consecutive held dawns):
78201 is blocked 8 mornings straight — one continuous block
even though the identity changes on the last morning — and
78208's blocks are 1, 2, and 1 mornings. So the answer is: a
single monster CAN block many dawns (7 and 2 are proven), AND
a place can stay blocked across a change of monster (78201's
8). An arm that counts identities only would report 78201 as
"7+1" and miss that the village experienced eight blocked
mornings in a row with no gap. Both counts are in the corpus;
the evidence tables above carry both.

### Q4 — Would clearing the encounter let the seat leg fire?

No — not on any blocked dawn on this band. Both gates were
measured at the same decision moment on all 12 encounter-blocked
held dawns: rank-gate-also-binding 12/12, sole-blocker 0/12.
Every blocked dawn is regional, and the substrate's seat leg
only runs at national+. Clearing the monster would have left
the village staring at a ready preview the policy still would
not take — exactly the seathes primary finding, with the
secondary now quantified underneath it. The counterfactual
"would block sitting even at national rank" from the 1016Z
brief is TRUE as a game-gate statement (the preview reads
not-ready with the encounter line on those mornings, and at
national rank the leg would have run into it) and FALSE as a
prediction about these villages (they were never national on
those mornings, so the encounter never got the chance to be
the binding block). Both halves are needed; either alone
misleads. The 78206 control sharpens it: zero encounter-blocked
mornings, sits the first morning national + day-90 + ready all
hold. There is no seed on this band where the encounter is the
sole blocker — that case remains unobserved, not refuted: a
national village with a tile monster at dawn would test it.

### Q5 — SENSE-TESTING: does "finish the current encounter first" read as sensible?

Verdict: the LINE reads as sensible; the ENCOUNTER reads as
half-stuck — a real lingerer with a promised exit the village
never takes, whose fiction and mechanics disagree about where
it is. Read: fresh NON-MEASURED sense replays
sim-dawnblock-a-sense-78201.txt (158 kept lines, same end
state as judged: survived, 180d, tableWaiting true, tableDone
false) and sim-dawnblock-a-sense-78208.txt (96 kept lines,
same end state as judged: village-lost, 164d), plus the
existing seathes sense transcript for 78201's raid night.
Sense replays never enter the census; narration shifts
trajectories, so beat days are cited as narrative shape, not
as measured days.

78201's story, as told: day 172, "3 raiders (Big Loud, The
Herald, Ugly-Eyes) hit Haven in the night, drawn by the smell
of the pantry! The palisade's stakes take their toll as they
come over the wall." That toll IS the measured arrival damage
(Herald 700 → 525, Big Loud 35 → 26). Then: "Nobody met The
Herald — it's still out there at the treeline. It'll gorge
every night until it's driven off." Every night after:
"The lingering The Herald gorges at the treeline — 1,400 kcal
gone from the stores. Endure it (they drift off within ~6
nights — the gorge is the price), or send a sortie: fighters,
rations, real risk." And five to seven times a day: "You
cannot face this alone — sound the call, muster 10 allied
blades (you have 0). This is not courage. This is arithmetic."

Three things in that telling do not sit right against the
measurement. First, the fiction offers two exits — endure
~6 nights, or sortie — and the measured village takes the
endure route by default (the policy never musters: 0 blades
all window), yet the seat stays blocked for EIGHT mornings
because the second raider takes over on the eighth. The "~6
nights" promise is about The Herald alone; the seat does not
care which monster is on the tile, so the promise is kept
for the monster and broken for the village. Second, the
fiction places the Herald at the treeline and the boundary
("stops at the boundary — pacing, unwilling", "gorges at the
treeline") while the seat check treats it as standing ON the
tile — the player hears "it's out there" and the game says
"finish the current encounter" as if it were in the room.
Third, the price fades while the block does not: by day 178
the gorge is "0 kcal gone from the stores. It is eating the
realm while you deliberate." A lingerer that costs nothing
anymore still blocks the seat exactly as before. None of this
is a frozen fight or a crashed state — the Herald genuinely
lingers, gorges, and drifts off on schedule — but a player
watching it would reasonably ask why a treeline pacer they
were told to endure blocks the seat for a week, and why
nobody in the village ever answers the muster call the game
itself keeps repeating.

78208's story is thinner, and that thinness is itself a
finding. The congregation's block IS narratively pinned: the
day-146 raid ("3 raiders (The Ugly Beast, Loud-Eyes, The
Eulogy) hit Haven in the night") is followed on day 147 by
"This one came with the raid on Haven — it was with the
teeth at the door, not a lone wanderer." But the influencer's
day-140 block and the reunion's day-163 block have no raid
beat in the kept lines — and the instrument shows why: they
walk in from afar (influencer 8,4 → 7,4 → 4,4 over days
138–140; reunion 7,5 → 4,4), wander-ins, not raids. A
wander-in that blocks the seat arrives with no story at all:
no raid beat, no gorge beat, no muster line — just the
overtime narration ("Take your seat from Haven to stop the
clock") ticking upward while a monster stands on the tile
unannounced. The seat line is still sensible ("finish the
current encounter first") — but for a wander-in, the player
was never told an encounter started.

## Hypothesis scoreboard (prereg order)

- H1 TILE-MONSTER (leading): CONFIRMED. 12/12
  encounter-blocked held dawns are tile monsters
  (scholar.monster non-null, firing signal tile-monster);
  0 live fights among them.
- H2 ACTIVE-FIGHT: FALSIFIED. Zero encounter-blocked held
  dawns show inCombat true; band-wide, zero decision rows
  in 1,035 show a live tbfight.
- H3 PENDING-ONLY: FALSIFIED twice. Code: tableEntryBlock
  never checks pendingEncounter. Empirically: zero
  encounter-line rows carry pending-only state (no
  ENCOUNTER-SURPRISE rows anywhere in the band).
- H4 MULTI-DAWN LINGER: CONFIRMED. Herald spans 7
  consecutive held dawns; congregation spans 2; the
  78201 tile-block run spans 8.
- H5 SOLE-BLOCKER: FALSIFIED (expected per seathes, and a
  finding, not a run failure). 0/12 encounter-blocked held
  dawns are sole blockers; 12/12 are also rank-gated.
- H6 INTERMITTENT, NOT ONE LINGER (78208): CONFIRMED.
  78208's 4 blocked dawns belong to 3 distinct episodes
  (1 + 2 + 1), with clearance between each.
- H7 RAID ORIGIN (78201): CONFIRMED for the lingering pair,
  with the third raider absent. Herald and Big Loud are
  named members of the day-172 raid party (sense transcript
  + instrument agree); Ugly-Eyes, the third raider, appears
  in no world list in the day 170–180 window — gone before
  the linger begins (slain in the raid or despawned; the
  instrument cannot date its departure from this window).

## Per-day seat-state series (held dawns only)

Held dawn = decision row with seat lesser/full, table not done.
Primary class here is game-block-first (preview not ready →
ENTRY-BLOCKED; preview ready + regional → RANK-GATE; preview
ready + national + attempt shown → GAME-OPEN/SAT via the
seathes ts-diff cross-check). This differs from seathes'
rank-gate-first priority; the two reconcile exactly through
the rankGateAlsoBinding field (a dawn is RANK-GATE-primary in
seathes iff rankGateAlsoBinding and the game gate is open or
the preview is null). See metric review.

### 78201 — 16 held dawns: PREVIEW-NULL 1, RANK-GATE 7, ENCOUNTER 8

| days | class | encounter detail |
|------|-------|------------------|
| 165 | PREVIEW-NULL / TABLEWAITING-FALSE | announce fires during day 165; no monster |
| 166–172 (7) | RANK-GATE | preview ready, regional, no monster |
| 173–179 (7) | ENTRY-BLOCKED / ENCOUNTER | Herald, Haven 4,4, 525 HP frozen; rank also binding |
| 180 | ENTRY-BLOCKED / ENCOUNTER | Big Loud (mirrormoth), Haven 4,4, 26 HP frozen; rank also binding |

Tile-block run: 173–180, 8 dawns continuous. Access 'remote'
days 166–180 (stage >= 3), 'inside' day 165. Attempts 0 on all
16 days (policy gate never runs at regional).

### 78208 — 36 held dawns: PREVIEW-NULL 1, RANK-GATE 31, ENCOUNTER 4

| days | class | encounter detail |
|------|-------|------------------|
| 128 | PREVIEW-NULL / TABLEWAITING-FALSE | announce fires during day 128; encounter present in the block read but preview null, so not counted as operative (see metric review) |
| 129–139 (11) | RANK-GATE | preview ready, regional, no monster |
| 140 | ENTRY-BLOCKED / ENCOUNTER | Influencer, Haven 4,4, 267 HP frozen; rank also binding |
| 141–146 (6) | RANK-GATE | preview ready, regional, no monster |
| 147–148 (2) | ENTRY-BLOCKED / ENCOUNTER | Congregation, Haven 4,4, 402 HP frozen; rank also binding |
| 149–162 (14) | RANK-GATE | preview ready, regional, no monster |
| 163 | ENTRY-BLOCKED / ENCOUNTER | Reunion, Haven 4,4, 900 HP frozen; rank also binding |

Tile-block runs: 140 (1), 147–148 (2), 163 (1). The village
dies village-lost on day 164, still holding the seat, with
Loud-Eyes still on the tile.

### 78206 — 13 held dawns, SAT day 90 (positive control)

PREVIEW-NULL 1 (day 78, waiting false) + PREVIEW-NULL /
DAY-LT-90 11 (days 79–89, day-90 floor) + SAT 1 (day 90, lesser,
feared path). Zero encounter-blocked mornings. The leg fires
on the first morning all gates agree — and no monster is
standing on the tile that morning.

### Band summary

| seed | end | held dawns | classes | enc-blocked | sole-blocker |
|------|-----|-----------|---------|-------------|--------------|
| 78201 | 180d survived | 16 | NULL 1, RANK 7, ENC 8 | 8 | 0 |
| 78202 | 131d village-lost | 0 | — | 0 | 0 |
| 78203 | 168d village-lost | 0 | — | 0 | 0 |
| 78204 | 180d survived | 0 | — | 0 | 0 |
| 78205 | 99d village-lost | 0 | — | 0 | 0 |
| 78206 | 90d WON lesser | 13 | NULL 12, SAT 1 | 0 | 0 |
| 78207 | 26d village-lost | 0 | — | 0 | 0 |
| 78208 | 164d village-lost | 36 | NULL 1, RANK 31, ENC 4 | 4 | 0 |

Band totals: 65 held dawns classified, 0 UNCLASSIFIED;
12 encounter-blocked held dawns, all tile-monster, all
Haven 4,4, all regional (rank also binding), 0 sole-blocker;
5 identity episodes; 0 live fights, 0 pending-only, 0 contests
at any decision moment in the band (1,035 rows).

## The mechanism, in plain words

Monsters wander. That is the whole mechanism, and it is almost
too simple to notice. A monster does not need to attack you to
stand on your tile: the world-monster wanderer drifts between
tiles, and nothing in the wander rules keeps it off the
scholar's tile (the one-monster-per-tile rule keeps monsters
off each other's tiles, not off yours). Combat, by contrast,
only starts when YOU walk onto a monster's tile — the
encounter check runs on tile entry. So a monster that wanders
onto Haven while you sleep, or while you work, simply stands
there with you. You do not fight it by standing still, your
villagers do not fight it after the raid night is over, and
the seat's door-check, which only asks "is there a monster on
your tile?", answers yes every morning until the monster
happens to wander off again. On 78201 the raid's two survivors
spent eight mornings taking turns standing in the doorway:
the game never made them leave, the village never made them
fight, and the table never stopped pricing the wait. The
encounter is not stuck in the sense of a frozen fight — there
is no fight at all. It is stuck in the sense that two systems
(wandering monsters, tile-entry combat) never meet: the
monster arrives without combat, and nothing ever converts its
presence into combat or departure except its own random walk.
Whether that is a bug or a quiet rule ("a monster on your tile
blocks the seat until it leaves") is a design call — but as
measured, a wounded raider can squat on the seat's doorstep
for a week while the village works around it, and the only
thing that ends it is the monster's feet.

## Reachability verdict (seat-taking content, via the encounter lens)

REACHABLE, and reached in-band (78206, day 90, zero encounter
interference). The encounter block does not make seat-taking
unreachable: it is a secondary, intermittent, wandering-driven
block that on this band never once stands alone. What it does
is add a second, luck-based delay on top of the primary rank
mismatch: a village that fixed its rank gate tomorrow could
still lose mornings to a monster wandering onto Haven — and
unlike the rank gate, there is no player action in the
measured behavior that clears it faster (no fight is offered,
no fight is taken). Any future fix to the primary gate should
be measured with this secondary in view, or the first national
village that wakes to a monster on its tile will look like a
new bug.

## Village assessment (plain words)

78201 ends its run as a village with squatters. It survived
everything, held its priced seat for sixteen days, and spent
the last eight of them with two wounded raiders camped on its
doorstep — not attacking, not leaving, just there, while the
overtime price ticked to tier 2 and the narration kept saying
to take the seat from Haven. The village kept working around
them (foraging hauls, water runs, a contest won) because the
game never forced the confrontation and the policy never
sought it. 78208 is the same story in miniature three times
over: a monster walks up to Haven, stands there for a morning
or two, walks away or vanishes, and the village's thirty-six
days of holding end in death with the third visitor still on
the tile. 78206 is the village that never met a squatter and
sat on time. The difference between sitting and waiting here
was never courage — it was whether a monster happened to be
standing where you sleep.

## Blanks filled or documented

FILLED (this arm): the dawn lingering-encounter blank from the
1016Z closeout — which kinds linger (tile monsters only, all
at Haven), how long (longest single monster 7 dawns; longest
continuous tile-block 8 dawns), what clears them (wandering
off or vanishing unrecorded; never a fight, never a kill),
and whether clearing would let the seat leg fire (no — the
rank gate binds underneath on all 12 blocked dawns; sole
blocker 0/12). The "pending encounter" phrasing from the
1016Z note is corrected by measurement: nothing pending is
involved — these are tile monsters, not pending encounters,
and the code confirms a pending encounter could never produce
the line.
DOCUMENTED (not fixed — DIAG arm, and the fix is a design
call, not a measurement): the wander-without-combat seam —
monsters wander onto the scholar's tile without starting
combat (combat starts on player tile entry only), so a tile
monster can block the seat for days while nobody fights it.
Fixing it means deciding what SHOULD happen when a monster
stands on the scholar's tile at the seat's doorstep (fight?
flee? ignore for the seat? leave faster?) — a coordinator/
Steve call, since it changes both combat and the seat's
availability. No fix is proposed or implied beyond naming
the seam and its evidence.
DOCUMENTED (secondary, for a future arm): the sole-blocker
case is still unobserved — no national village with a tile
monster at dawn exists on this band, so whether the encounter
block alone (at national rank, access satisfied) actually
stops a sit, vs the leg attempting and succeeding or failing
for another reason, is measured only as "would attempt" here,
never as an observed attempt. A future arm needs a national
held seed with a dawn tile monster to close that loop.
DOCUMENTED (measurement limit): the congregation's
disappearance (off-tile during day 148, gone from the world
by day 149, no kill logged) cannot be attributed to despawn
vs unlogged kill from dawn snapshots alone — see metric
review.

## Metric review (for the NEXT run — mandatory)

1. Classification priority differs from seathes, deliberately:
   seathes classified RANK-GATE first (policy gate stops the
   leg before any preview call); this arm classifies the
   operative game block first (preview not ready → the game
   block, even on regional days), because the question here
   IS the game block. The two reconcile exactly: a dawn is
   RANK-GATE-primary in seathes iff rankGateAlsoBinding is
   true AND (the preview is ready or null). Every
   encounter-blocked dawn in this arm is RANK-GATE-primary
   in seathes (12/12) — the headline "0 sole-blocker" is the
   same fact in both schemes. A future arm must state its
   priority in its prereg, not assume the reader knows it.
2. The decision moment is the substrate seat leg's daily
   evaluation inside policy.daily (after the harness's day
   waits, before sleep) — the brief's "dawn" is this
   evaluation point, not a literal dawn tick. The monster
   state recorded is the state the leg sees that day. Note
   the timing dependence this creates: post snapshots (end
   of the same day's play) often show the monster wandered
   OFF the tile or onto an adjacent tile — the block is an
   evaluation-point phenomenon, not an all-day siege. The
   monsters loiter around Haven and happen to be standing
   on the scholar's tile at each evaluation; a leg that
   evaluated at a different time of day might see no block
   at all. An arm wanting literal dawn (post-sleep,
   pre-wait) timing would need a different hook, and would
   be measuring a genuinely different question.
3. Day 128 on 78208 (and day 165 on 78201, day 78 on 78206)
   shows the encounter line in the raw block read while the
   preview is null (tableWaiting false — the announce fires
   during that day). These rows are classified PREVIEW-NULL,
   not ENCOUNTER, because the seat is not yet offered: the
   encounter is present but not operative. Counting them as
   "blocked" would overstate the block by one dawn per lesser
   seed. The instrument records both facts (preview null +
   block line) so a future arm can recount under either
   definition without re-running.
4. Clearance label limits: CLEARED-DURING-DAY means "off the
   scholar's tile by the end of the episode's last day's
   play" (post snapshot), NOT "killed/fled during the day"
   — the congregation's full story is off-tile during day
   148 AND gone from the world by day 149 with no kill
   logged, and the label alone hides the second half.
   CLEARED-GONE-UNATTRIBUTED (unused on this band's held
   episodes, present in the unit tests) would mean "absent
   next dawn, neither kill-logged nor found elsewhere" —
   despawn vs unlogged kill indistinguishable. A future arm
   wanting true clearance causes needs intra-day kill/
   despawn telemetry, not dawn snapshots.
5. Episode identity is monster+tile: a monster that wanders
   off the tile and back on later forms a NEW episode, and
   two monsters alternating on the tile form two episodes
   even when the tile never clears. The tile-block run
   (consecutive encounter-blocked held dawns regardless of
   identity) is the complementary measure and is the one
   that matches the lived experience ("blocked every
   morning for eight mornings"). Report both, always.
6. The OFF-leg and determinism-leg procedures from the
   prereg were followed exactly (see verdict); the OFF
   sweep's own DIAG verdict is meaningless at n=2 by design
   (the analyzer gates on n==8) — only its end-field
   comparison (via --offcheck) is judged, and it passed.
7. No canon doc covers lingering-encounter dawn behavior
   (stated in the prereg, confirmed by measurement): docs/
   has TABLE.md for the seat and CANON.md's manifest, but
   nothing on wander-onto-player-tile, raid-lingerer
   lifetimes, or dawn seat-blocking. If the wander/combat
   seam above becomes a design decision, it deserves a canon
   note — otherwise the next arm will re-derive it from
   code again.
