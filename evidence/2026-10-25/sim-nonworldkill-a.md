# sim-nonworldkill-a — the non-world wave-4 kill's door (axis scale-onramp)

Run: fleshout loop A, 2026-10-25, run fleshout-20261025T2115Z.
DIAG ONLY — zero src/js changes, zero default flips, recorders only.
This arm designs and lands NO game fix. An initiation census plus the
named door for the band's only wave-4 kill IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave 4 =
  the Mirror Draft, gate village standing >= 100; the Strike is a
  wave-4 Mirror Draft monster — a house-sized inflatable rat that
  shuts the grid down, HP 1000-1200, size 3; castMonster draws from
  wave <= unlockedWave, so a strike is cast-eligible once wave 4
  is unlocked).
- Context read first: evidence/2026-10-25/sim-w4funnel-a.md (the
  2015Z run's named next blank) and its per-seed corpus
  perseed-sim-w4funnel-a/ (73678: waveKillLog holds exactly 1
  wave-4 entry — d115, strike, by elif_demir, via 'player' — which
  matches NO world arrival, NO removal, NO oldcore tbEnd row).
  Backlog item: sim-findings.md #1053 (the non-world kill blank).
- Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
  180d death-aware horizon (runDays stops on death/win; 180 is the
  cap, not a fixed horizon — MEASUREMENT §10). The 180d cap is kept
  because it reproduces the w4funnel control band exactly and the
  d115 kill sits inside it; a shorter horizon would risk cutting
  the kill, a longer one would move the baseline.
- Recorders reused verbatim (policy-side only, never edited):
  scripts/policies/raftdraft-diag.js, spawnsrc-diag.js,
  oldcore-diag.js, defwound-diag.js, w5births-diag.js — the exact
  w4funnel composition. New this run, policy-side only:
  scripts/policies/nonworldkill-diag.js (NONWORLDKILL=1): wraps
  Game.startCombat (pre/post record) and Game.tbEnd (waveKillLog
  delta joined by fight id). The wraps record AFTER delegating
  where it matters, write nothing to game state, draw no RNG,
  never throw into the engine (recording errors are counted;
  a startCombat throw from the engine itself is recorded and
  rethrown unchanged), and return the original value untouched.
  No recorder draws RNG, throws into the engine, or returns
  anything but the original value.
- CONTROL (published control band, w5chain-a / spawnsrc-a /
  poolpres-a / w4funnel-a, byte-identical): deaths 234,
  national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8, raids 85,
  raiders 361, pool 1,494, pool wave-3+ 107, median survival 135d.
  The armed band must reproduce it EXACTLY or STOP and report
  the deviation — no judging on a moved baseline.
- PRIMARY QUESTION: which initiation door produced the band's
  only wave-4 kill (73678, day 115, strike, scholar, via
  'player') — and, band-wide, how many wave-4 TB kills come
  through each door?
- DIAG-GO rule (ALL required, judged only against this header):
  (a) every TB-fight initiation on the band is classified into
  a candidate door (unclassified count 0; `other` rows are
  counted and investigated, never hidden; refused, thrown, and
  table-trial calls are counted separately and are NOT
  initiations);
  (b) the 73678 day-115 strike kill's initiation door is
  identified — the start row, the tbEnd row, and the waveKillLog
  delta join naming the strike kill — OR every candidate door
  is excluded with a stated observation each (exclusion by
  evidence, never by absence alone);
  (c) wave-4 TB kills by door are counted band-wide (veterans
  produced per path, from the log delta, never from oldcore
  tbEnd kinds alone).
  Any leg missing = DIAG-NO-GO.
- Definitions (fixed before sweeping, analyzer header repeats
  them): INITIATION = one Game.startCombat call that is not
  refused, not thrown, and not a table trial. DOOR vocabulary,
  every value read from code (never invented):
  contest-arena (state.arenaContest set at call — the contest
  modal suspended for a real arena fight, contests.js
  _contestArena / _contestArenaAfter); feast-draw
  (s.feastDraw present with monsterId === the fight's monster
  — feastBuff.js faceFeastDraw / drawFeastScavenger, cast via
  castMonster); tent-intruder (_tentBreachSpawn set at call, or
  pendingInTent true — game.js faceTentIntruder /
  wandererTentBreach); door-flee-reengage (stack contains
  reengageWaitingMonsters — sub: treeline-ambush when the stack
  also contains treelineAmbush, else hall-door-reengage);
  glasswing-trap (stack contains gwTrapTick — the trap spawns
  its monster onto the player tile, then startCombat);
  world-bump (stack contains monsterTurn — the world monster
  on the player tile contacts the player); wanderer-pending
  (stack contains the sim-harness pending fallback
  driveContestsImpl — an unresolved pending encounter faced by
  the harness, game.js triggerEncounter / wanderer cast via
  castMonster); policy-direct (a policy function calls
  startCombat directly — our policy does not, but the class
  exists so such a call is never misbucketed); other (no rule
  above fires — stack recorded, investigated, never silently
  bucketed). DIRECT-BUILD = a tbEnd row with no matching start
  row (fights built without startCombat: alien duels in
  encounters.js, uprising / party-betrayal fights — counted
  separately; they carry no monster def, so no wave kill is
  expected from them, and the analyzer verifies that).
  ORIGIN axis (independent of door, recorded per fight):
  world-origin (a world monster sits on the player tile at
  call and its id === the fight's monster); world-origin-
  mismatch (a world monster sits on the player tile but its id
  !== the fight's monster — startCombat lifts THAT monster
  while the fight is about another); null-origin (no world
  monster on the player tile at call — the w4funnel class).
  The pre-tile monster is read from Game.worldMonsters() by
  tile (tx,ty) == (map.px,map.py) — a pure read, never
  playerMonster() (which can adopt a detached alias and would
  mutate state on a refused call).
- Classification precedence (fixed before sweeping; applies
  only when several signals fire — every signal is still
  recorded per row): table-trial > refused > thrown >
  contest-arena > feast-draw > tent-intruder >
  door-flee-reengage > glasswing-trap > world-bump >
  wanderer-pending > policy-direct > other.
- PRE-REGISTERED CORRECTION to w4funnel-a (recorded here
  before sweeping, not a mid-run revision): w4funnel-a's
  "contest kills log via 'contest', this one logs via
  'player'" holds ONLY for contestEngine field-fight kills
  (recordWaveKill via 'contest'). Contest-ARENA TB kills go
  through the tbEnd kill loop, whose default killer tag is
  via='player', and _contestArenaAfter does not rewrite
  waveKillLog. Contest-arena is therefore a LIVE candidate
  for the 73678 strike kill and must NOT be excluded on via
  grounds. The analyzer excludes a door only on its own
  initiation signals (arenaContest state, stack), never on via.
- SENSE plan: 73678's day 113-116 thread in plain words from
  the instrumented corpus (the strike fight's party joiners,
  the day's other fights, the win the next day) — numbers plus
  meaning, not counts alone. Villager-behavior spot check: who
  joined the strike fight and what the fight's shape says
  about the village that won through it.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (eleventh sighting, carried) — the
  sweep-compare table + analyzer output are attached instead,
  and telemetry-check is NOT run on recorder rows (standing
  instruction: its counts are wrong on recorder rows).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) Every TB-fight initiation on the band is classified into a
  candidate door: 113 initiations, 0 `other`, 0 unclassified.
  Refused 0, thrown 0, table-trial 0 on this band (counted
  separately, none occurred — the excluded classes are empty,
  not hidden).
- (b) The 73678 day-115 strike kill's initiation door is
  identified with the full join: start row + tbEnd row +
  waveKillLog delta, all naming the same fight (below).
- (c) Wave-4 TB kills by door, band-wide: feast-draw 1, every
  other door 0. The band's only wave-4 log entry is a TB kill
  (TB 1/1, non-TB 0).
- Analyzer gate: scripts/test-nonworldkill-diag.js runs clean
  over the corpus; unit proof scripts/test-nonworldkill-a.js
  26/26 (23 classifier/join tests + 3 fake-Game integration
  tests for the adopted-id fix, below).

## CONTROL GATE — EXACT REPRODUCTION (gate, not a claim)

Armed band (tableseat-nowait + raftdraft + spawnsrc + oldcore +
defwound + w5births + nonworldkill) reproduces the published
control band on every headline: raids 85, raiders 361, deaths
234, national-ever 7/8, national-final 6/8, table invited 4/8,
entered 4/8, wins 4/8, median survival 135d, max 180d, wave-3
8/8, wave-4 6/8, wave-5 0/8, starvation 5, pool total 1,494,
pool wave-3+ 107. Per-seed trajectories match the control seed
for seed (73671 survived 180d 16/74; 73672 won lesser d97 7/28;
73673 won lesser d124 7/30; 73674 survived 180d 14/65; 73675
won lesser d135 13/56; 73676 village-lost d70 7/28 starv 4;
73677 village-lost d143 12/45; 73678 won lesser d116 9/35
starv 1). Corpus: PASS, recorder errors 0 on all six
recorders, no overflow. Detgate PASS twice (before and after
the recorder fix below — seed 73671: baseline vs
recorders-OFF days 180/181, tsNationalDay 77 both, no diag
surface, no wraps installed, post-setup world 0).

## THE ANSWER, FIRST (plain words)

The band's only wave-4 kill did not come from the world at
all — it came from the cookfire. On day 115, the scholar of
the winning village was feasted, and the feast's smoke had
drawn a Strike — a house-sized inflatable rat — to the
haven's edge. She walked out at half health, alone, and
faced it: one scholar at 52 health against a rat at 1178
health, no villager beside her, and she killed it. That is
the whole wave-4 veteran story of the band: one feast-draw
fight, one kill, one veteran. The world funnel produced
nothing — its six wave-4 fights were all the same Suburb,
fought six times on a dying village, never killed. And the
monster the world actually sent the winning village — a
Eulogy born on day 113 — was never met at all. So the
veteran the band produced came through a door the birth
census cannot see, and the door has a name now: the feast
draw. Any lever that only touches world births will never
move this number, because this number does not come from
world births.

## CENSUS (a) — EVERY TB-FIGHT INITIATION, BY DOOR

113 starts, 115 ends, 113 initiations (starts minus 0
excluded — no refused, thrown, or table-trial calls on this
band). The 115th and 114th ends belong to the 2 true
direct-build fights below; every start joins an end except
through the adopted-id mechanism, also below.

| door | initiations | share | waves (w0 = mid uncaptured, adopted fights) |
|---|---|---|---|
| world-bump | 69 | 61.1% | w1 28, w2 15, w3 15, w4 6, w0 5 |
| wanderer-pending | 22 | 19.5% | w1 16, w2 2, w0 4 |
| contest-arena | 16 | 14.2% | w1 10, w2 4, w0 2 |
| feast-draw | 5 | 4.4% | w1 1, w2 1, w3 2, w4 1 |
| glasswing-trap | 1 | 0.9% | w1 1 |
| tent-intruder | 0 | 0% | never fired on this band |
| door-flee-reengage | 0 | 0% | never fired on this band |
| policy-direct | 0 | 0% | never fired on this band |
| other | 0 | 0% | — |

Per seed (initiations): 73671: 15 (wanderer 4, bump 9,
arena 2); 73672: 14 (wanderer 3, bump 9, feast 2); 73673: 9
(bump 6, feast 1, arena 2); 73674: 11 (wanderer 4, bump 5,
arena 1, trap 1); 73675: 13 (wanderer 2, bump 9, arena 1,
feast 1); 73676: 13 (wanderer 3, arena 1, bump 9); 73677: 22
(wanderer 3, bump 13, arena 6); 73678: 16 (wanderer 3,
bump 9, arena 3, feast 1).

Kills by door (TB log deltas — what each door's fights
actually wrote to waveKillLog): world-bump 38,
contest-arena 26, wanderer-pending 7, feast-draw 4,
glasswing-trap 1, direct-build 0. Total TB kills 76.
Attribution caveat, stated not hidden: the join attributes
log writes that occur DURING a tbEnd call to that fight.
For the two routed siege-arena ends below, the writes
inside those calls are sibling villagers' contest bouts
resolving (via 'contest'), not kills by the arena fight
itself — the join is mechanically correct (the entries
appeared during those calls) and the authorship is
distinguished here. The strike kill needs no such caveat:
won feast-draw fight, via 'player', by the scholar, one
new entry, nothing else in the delta.

ORIGIN axis (independent of door): world-origin 68,
null-origin 29, world-origin-mismatch 5,
world-origin-unresolved 11 (the 11 adopted fights — their
fighters are gone by post-record, so mid is uncaptured;
their args and doors are known, and the unresolved label
is about mid-capture, not door classification).
Null-origin is not rare: 29 of 113 TB fights (25.7%)
started with no world monster on the player tile — the
w4funnel class is a quarter of all TB fighting, not an
edge case. But only 1 of those 29 null-origin fights
produced a wave-4 kill: the strike.

## THE STRIKE FIGHT (b) — 73678, DAY 115, IN FULL

Start row (fight fmgpspioy_8fe9s5): day 115, arg strike,
mid strike, wave 4, door feast-draw, initiator
faceFeastDraw, origin null-origin. Tile monster: none.
Feast draw: {monsterId strike, veteran false, day 115}.
Pending encounter true, pendingMonsterId strike,
pendingInTent false, tent breach false, arenaContest
null, door-flee stash null. Stack: startCombat →
faceFeastDraw (feastBuff.js:515) → feastFightRoad
(competent.js:511) — the bot's own feast discipline
(faces a feast draw while feasted). Fighters at start:
scholar alone (52/100 HP) vs strike (1178/1178 HP) — no
villager joined (nobody within the 4-square join radius).
End row: result won, newLog exactly one entry — {d 115,
mid strike, w 4, by elif_demir, via 'player', trick null}.
Cross-checks, all consistent: oldcore tbEnds on d115 hold
ONLY the gallowdeer fight (the day's other TB fight — a
world-bump win, world-origin, scholar 100 HP at start);
spawns on d115: none; the strike has no birth, no removal,
no oldcore row, because there is nothing world-side to
record — the feast draw is a cast, not a spawn.
WavesFaced note (correction of a misreading, not a
finding): the deed map reads strike → 4, but that map is
id → WAVE, not a count (progression.js recordDeedFight) —
it means "strike faced, wave 4," not "strike faced four
times." The corpus holds exactly one strike TB start on
73678, and the analyzer label that suggested a count has
been fixed.

Day 115's two fights, in order: gallowdeer (world-bump,
won, scholar started at 100 HP) then strike (feast-draw,
won, scholar started at 52 HP). She took her wounds in the
first fight and faced the feast draw anyway — and that
second fight is the band's only veteran.

## CENSUS (c) — WAVE-4 TB KILLS BY DOOR

| door | wave-4 TB kills |
|---|---|
| feast-draw | 1 (73678 d115 strike, scholar, won) |
| world-bump | 0 (6 fights, all 73677's suburb, 0 kills) |
| wanderer-pending | 0 |
| contest-arena | 0 |
| glasswing-trap | 0 |
| tent-intruder / door-flee / policy-direct | 0 (never fired) |

Band wave-4 log entries (all channels): 1, TB 1, non-TB 0.
Feast-draw fights, all five: 73672 d60 buffering w3 →
killed; 73672 d67 memory_projector w2 → killed; 73673 d38
cliffhanger w1 → fought, not killed; 73675 d134 callback
w3 → killed; 73678 d115 strike w4 → killed. Feast-draw
is 4/5 lethal and produced 100% of the band's wave-4
veterans — and 4 of the band's 76 TB kills from just 5
fights. World-bump wave-4 fights, all six: 73677's suburb
(d139, d140 x3, d142, d143), world-origin, 0 kills — the
same lingering raider the w4funnel census watched survive
six lost fights, now with its initiation door named:
every one is a monsterTurn world-bump (the scholar
meeting the besieging lingerer), not a raid, not a cast.

## ADOPTED FIGHTS + TRUE DIRECT-BUILD (method, not verdict)

11 starts carry fightIdSource 'end-row': fights that
started AND routed inside a single startCombat call (the
opening turns route them; tbEnd nulls tbfight at its
tail, game.js:43868, so the post-record finds no fight
to read an id from). The recorder now adopts the single
new end row's fightId when exactly one appears during
the call (unit-proven with a fake Game, 26/26). The 11:
73671 d23 cliffhanger (wanderer-pending), d92 nightcourt
(world-bump), d114 moderator (contest-arena, siege
waveIdx 0), d124 living_wire (world-bump), d179 moderator
(world-bump); 73672 d10 living_wire, d22 landlord, d32
nevermore (all wanderer-pending); 73674 d134 cliffhanger
(world-bump); 73675 d118 cliffhanger (contest-arena,
siege waveIdx 0); 73676 d39 living_wire (world-bump).
All 11 ends are 'routed'. The two siege-arena adopted
fights are the ones whose end deltas carry the 5
sibling-villager contest kills discussed above (73671
d114: hummice + glasswing by gen_3yzcsix; 73675 d118:
giant_mosquito + mirrormoth + nightlight_catfish by
gen_3nq7jxo) — a siege arena's first wave routing at
start, with the contest's other bouts resolving inside
the same tbEnd call. That routing is a named observation
for the backlog, not a verdict input.
True direct-build ends: exactly 2 — 73677 d41 and d99,
both 'lost', both with NO start rows on those days at
all and zero kills (fights built without startCombat:
alien duels / uprising / betrayal class). Direct-build
kills: 0. The first-pass corpus's "13 direct-build ends"
was the adopted-id gap, not 13 direct fights — the fix
and re-run supersede it (see Infrastructure notes).

## ORIGIN MISMATCH — BYSTANDER MELTS (observation, not chased)

5 fights started about one monster while an unrelated
world monster sat on the player tile (4
wanderer-pending, 1 contest-arena). startCombat lifts the
tile monster regardless of which monster the fight is
about; unless it is lingering/titan, tbEnd never puts it
back — it melts, unfought. Melted: 73671 d9 murkcap
(42/60), 73674 d18 anaconda_empress (65/90), 73677 d15
living_wire (46/60), 73677 d63 spool (170/280).
Restored: 73675 d9 white_noise_heron (lingering). Four
world monsters vanished without being fought, through a
door nobody aimed at them. Small, real, and out of this
arm's scope — appended to the backlog as an observation.

## SENSE-TESTING READ (73678's day 113–116 thread)

Day 113: a Eulogy — the Mirror Draft's death-narrator —
is born onto a tile (tile-entry, the seed's only wave-4
world arrival). The scholar never meets it. That same
day she fights solo twice and wins twice: a sanjun
(93 HP) and a spool (wave 3, 293 HP), both world fights,
both alone — no villager within joining distance either
time. Day 114: nothing. Day 115: she fights the
gallowdeer at full health and wins, takes her wounds,
and then — still feasted, still bleeding at 52 health —
walks out to meet the thing the feast smoke drew: a
house-sized rat that shuts the grid down, 1178 health,
alone again, and she kills it. Day 116: the village wins
through the lesser seat; the Eulogy still stands
somewhere, unmet, at full health; final village 6 people,
pantry 24,564 kcal, knowledge 52. Villager-behavior
judgment: this is not villagers failing to act like
people — it is a scholar ranging alone. In all four of
the seed's day-113/115 TB fights, the party is one
person, because the scholar is out where nobody stands
beside her. The village's story on its best seed is a
lone scholar's story, and its one wave-4 veteran is a
solo kill at half health against a monster that arrived
as smoke, not as a siege. That reads as heroic and as
lonely as the census says: the village never fought as
a village on its best day.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the shared band, so
their fates are already known — what is new is where
their turn-based fights came from. Most fighting is the
world itself: 69 of 113 fights (61%) are world-bumps, the
scholar meeting what is already standing on her tile.
About a fifth (22) are wanderers the harness faces for
her — strangers cast by the System, met as pending
encounters. About a seventh (16) are contest arenas.
Feast draws are rare (5) and disproportionately lethal
(4 kills) — the feast is the only door that ever
produced a wave-4 veteran, and it did so once, on the
one seed where the draw happened to be a Mirror Draft
monster. Nobody came through the tent door or the
door-flee door on this band at all — those doors exist
in code and never opened in 113 fights. The villages
did not lack fights; they lacked the right fights. The
world gave them a Suburb six times and they could not
kill it; the feast gave them a Strike once and they
did. If the scale wall is a veteran wall, the veteran
door on this band is smoke, not soil.

## WALL NUMBERS (judged corpus)

National-ever 7/8, national-final 6/8, table invited 4/8,
entered 4/8, wins 4/8, wave-4 reached 6/8, wave-5 0/8,
Arc IV 4/8, median survival 135d, max 180d, deaths 234.
Death-cause shares (of 234): villager combat 150
(64.1% — 'villager combat' 79 + 'combat' 71), player
arena 28 (12.0%), villager sickness 16 (6.8%),
expedition 9, ambush 5, wound-that-wouldn't-close 5,
villager monster 5, starvation 5 (villager 4 + player 1),
villager alien 3, player contest 2, player dehydration
2, and 1 each for Bulldozer, Paparazzo, Living Wire,
lockjaw. The wall stands: national 7/8 but table 4/8,
wins 4/8, wave-5 0/8 — the scale wall is a wave-5 /
veteran wall, and this arm names its one veteran's door.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): the non-world wave-4
  kill's door — feast-draw, via faceFeastDraw, on 73678
  day 115 (start row + tbEnd row + log delta, all joined);
  the full TB initiation census (113 initiations, 0
  unclassified, by door and by origin); wave-4 TB kills by
  door (feast-draw 1, all else 0); the world-bump wave-4
  fights' door (all 6 are 73677's suburb via monsterTurn).
- FILLED (mechanism, read from code): why a TB kill can
  exist with no world trace (startCombat proceeds with a
  null origin); why contest-arena is NOT excluded by via
  'player' (arena TB kills log via 'player' through the
  tbEnd kill loop; _contestArenaAfter never rewrites
  waveKillLog — the w4funnel shorthand holds only for
  contestEngine field-fight kills); why 11 fights read as
  direct-build at first (tbEnd nulls tbfight, so a
  same-call routed fight leaves no id for the start row);
  why wavesFaced 'strike: 4' is not four fights (the deed
  map is id → wave).
- DOCUMENTED, NOT FIXED (named next blanks, below): the
  bystander-melt mechanism (mismatch lifts delete
  unfought monsters unless lingering/titan); the siege
  arena first-wave instant rout (2 fights, both waveIdx
  0, both routed at start); the adopted fights' mid
  capture (fighters gone by post-record — a future
  recorder version could resolve mid via the engine rule
  arg || pendingMonsterId || 'bulldozer' instead of
  fighters alone).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: sim-feastvet-a (DIAG + lever sketch, same band).
Pre-registration sketch: (1) census feast draws band-wide
with the new instrument (draws faced vs driven off vs
harness-faced, monster wave per draw, kill per draw) —
this arm proves draws are 4/5 lethal but rare (5 draws on
113 fights); (2) measure whether the draw's wave tracks
unlockedWave at draw time (castMonster ratios) and
whether veteran flags ride draws (feastDraw.veteran) —
the strike draw was NOT veteran; (3) the lever question
for the scale wall: if feast draws are the only veteran
door that fired, does draw frequency or draw-wave
targeting move veterans at all, or is the draw a lottery
ticket (1 wave-4 draw in 5)? Rationale: this arm proved
the only veteran on the band came from feast smoke — the
next arm must measure that door's yield before any lever
touches the world funnel, or the loops will keep tuning
a funnel that produces nothing. Second, separable
question for the metric-review shelf (not the same arm):
whether mismatch lifts should spare the bystander — that
is a Steve design ruling (it changes what a lifted
monster means), and the evidence for it is the 4 melted
bystanders above, not a lever to pull silently.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged
exactly against its three pre-registered DIAG-GO legs
(a) 113/113 initiations classified, 0 other (bar: every
initiation classified); (b) the 73678 strike kill's door
identified with the full join (bar: identified, or every
door excluded with evidence — identification achieved,
no exclusion fallback needed); (c) wave-4 TB kills by
door counted (bar: counted — feast-draw 1, all else 0).
Two method notes, neither a revision: (1) The first
corpus's direct-build count (13) was a recorder join
gap, not a corpus deviation — fixed in the recorder
(adopted-id rule, fake-Game proven 26/26) and the corpus
re-run in full; the re-run reproduced every headline
number exactly (neutrality EXACT twice), and the fixed
corpus is the corpus of record. The first corpus is
superseded, not patched. (2) The analyzer's
wavesFaced label suggested a count ('faced strike: 4');
the deed map is id → wave — label fixed, no numbers
changed. The telemetry-check and balanced panel were NOT
run, per the standing exception for recorder rows
(panel cannot ingest per-seed recorder corpora —
eleventh sighting). The sweep-compare table + analyzer
output are the comparison of record. The telemetry
baseline was NOT rolled. No game code changed in this
run; no [needs-eyes] flag applies (DIAG-only, no
narration or behavior added).

## Infrastructure notes

- Sweep: scripts/test-nonworldkill-diag-sweep.js (the
  w4funnel sweep copied with the nonworldkill recorder
  composed OUTERMOST). Corpus:
  evidence/2026-10-25/perseed-sim-nonworldkill-a/ (8 rows
  + summary.json + analysis.json). Analyzer:
  scripts/test-nonworldkill-diag.js. Recorder:
  scripts/policies/nonworldkill-diag.js. Unit proof:
  scripts/test-nonworldkill-a.js (26/26).
- Detgate PASS twice (before and after the recorder
  fix). No EPERM flap blocked this run's writes; all rows
  wrote first try on both passes.
- Commit: sim-nonworldkill-a, DIAG-GO, zero src/js diff.
  Ready for coordinator merge; NOT pushed, NOT bumped,
  live NOT verified (coordinator/ship-loop line, not
  this arm's).

