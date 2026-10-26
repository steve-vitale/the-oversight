# sim-meetrule-a — what a "go to the known monster" behavior would need (axis scale-onramp)

Run: flesh-out loop, run fleshout-20261026T2141Z, arm sim-meetrule-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, no default flips, no
demand-number moves, no npcNodeTravel / worldTick / meeting-rule
changes. Nothing here proposes the behavior as a lever.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5). No design is invented here.

Starting HEAD (this worktree): 896f2ac39f24284118dac4bb29d0b38cca9666e1
(master at run start; the coordinator's brief records the same base).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

Full text: evidence/2026-10-26/sim-meetrule-a-prereg.md (written
before any sweep ran). In brief:

- Question (findings backlog, next blank #1, from sim-w4opp-a):
  22/24 never-fought wave-4 spawns never share a tile with an
  eligible villager, though monsters spawn mean 2.0 tiles
  (Manhattan) from Haven and persist mean 25.3 days. What would a
  "go to the known monster" behavior need, in code-grounded terms?
- Substrate: tableseat-nowait (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only), seeds 73671-73678, 180d
  death-aware horizon (runDays stops on Game.over).
- Re-baseline FIRST against the 1920 band table (wins 2/8,
  national-ever 6/8, national-final 5/8, table 4/8, entered 2/8,
  wave-4 6/8, wave-5 0/8, median 152d, deaths 307); any delta reported
  field-by-field, never silently absorbed.
- Tier rule (the judged reachable fraction): spawn tile = first
  w4opp snapshot tile; d = objDist Chebyshev distance from Haven.
  R0 = w4opp class contact-without-fight. R1 = on the spawn day's
  census, an eligible villager with npcMaxDist >= d. R2 = R1 AND
  d <= daysPresent x 4 (one node per day-part, optimistic lower
  bound). R3 = R2 AND eligible-and-not-sick count > 0 on the spawn
  day. REACHABLE (conditional) = (R0 + never-in-range passing
  R1∧R2∧R3) / 24, conditional on the knowledge link G1.
- DIAG-GO iff (a) every never-fought spawn classified into exactly
  one w4opp opportunity class (partition reused intact, zero
  unclassified, recorder errors zero); AND (b) a complete
  condition list G1..G6, each grounded in a code read or explicitly
  marked MISSING with the absence grounded by an enumerated
  search — never invented; AND (c) a quantified reachable
  fraction under the tier rule. A MISSING knowledge link does not
  by itself fail (b) if marked and its consequences (conditional
  fraction) are stated — but the evidence must say plainly that
  the behavior is not currently realizable on that link alone.
- Cost bar: armed starvation <= baseline starvation + 2 AND armed
  median days >= 0.8 x baseline median days. Det-gate: recorders
  unset == unwrapped on one seed. Sense test: one NON-MEASURED
  narration-on replay of the seed with the most never-fought
  spawns. Leg-exact determinism is the comparison for this
  no-lever DIAG arm (stated explicitly); balance-panel.js has no
  corpus-ingest mode, so no panel file is produced or faked, same
  limitation as prior arms. Telemetry-check is NOT run on
  recorder rows (its counts are wrong on recorder rows).

## RESULTS

### Verdict: DIAG-GO (specification complete, one link MISSING)

- (a) Classification: 8/8 seeds fully classified, 24/24 never-fought
  spawns in exactly one class, zero unclassified, recorder errors
  zero (w4opp errs 0, meetrule errs 0, all five reused recorders
  clean). The w4opp partition reproduces exactly: 33 spawns,
  24 never-fought, 9 fought (field 3, tb 2, both 4 in the w4opp
  count; wave4enc classes field-lose 4, field-flee-villager 8,
  player-tb-lose-or-rout 13, spawned-never-fought 24).
- (b) Condition list G1..G6 below: every condition grounded in a
  named file + function, except G1 KNOWLEDGE, which is marked
  MISSING with the absence grounded by an enumerated search (see
  G1). Nothing is invented.
- (c) Reachable fraction (pre-registered tier rule, spawn-day):
  REACHABLE = 7/24 (29.2%), conditional on the knowledge link.
  Newly reachable never-in-range spawns: 5/22. The other 17
  never-in-range spawns fail on spawn-day gates detailed below.
  Exploratory (NOT judged, for the next run's metric review):
  allowing range/pool on ANY day during presence instead of the
  spawn day only gives 11/24 (45.8%).
- G2 recorder neutrality: PASS, 8/8 seeds identical on
  days/gameDays/ts/starvation; faced-map agreement 8/8, kill-log
  agreement 8/8.
- Cost bar: PASS. Armed starvation 1 <= baseline 1 + 2; armed
  median 152 >= 0.8 x baseline median 152 (identical).
- Det-gate: PASS. Seed 73671, recorders unset == unwrapped:
  days 180, gameDays 181, ts {tsNationalDay: 107} on both sides,
  no recorder surface, no installed wraps.
- Detail repro: PASS. Seed 73675 re-run: censusMatch=true,
  partition 8, classes identical, opportunity classes identical.
- Proof: scripts/test-meetrule-a.js — 1127 PASS, 0 FAIL
  (re-baseline, G2, opportunity totals, census integrity, tier
  rows, verdict components all re-derived from the rows).

### RE-BASELINE — EXACT, zero base delta

Band aggregates vs the 1920 table: wins 2/8, national-ever 6/8,
national-final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
median 152d, deaths 307, starvation 1 — every field identical.
Per-seed trajectories match the 1920 baseline column (73671 180d
survived w4 48 deaths; 73672 180d survived w4 51; 73673 124d lost
w4 32; 73674 142d won-lesser w3 28; 73675 180d survived w4 26;
73676 144d won w4 43; 73677 152d lost w4 41; 73678 104d lost w3
starvation 38). Current master (896f2ac39) moves NOTHING on this
band vs the 1920 base.

### THE CONDITION LIST (G1..G6) — what the behavior would need

#### G1 KNOWLEDGE — MISSING (no engine path supplies a live monster's tile to villager routing)

What would be needed: some store, readable by villager routing,
that says "a live world monster is at tile (tx,ty)" — and a
reason for a villager to treat that tile as a destination.

Enumerated search (all negative, each checked in code):

- objPick targets (villager-objectives.js objPick): directions
  (FORAGE/WATER/TRAPS/EXPLORE pick a direction + distance),
  remembered CORPSE sites (HAUL via mapmemHaulCandidate), a
  PERSON (VISIT via objVisitTarget), or Haven itself (indoor
  kinds). No branch reads worldMonsters().
- Map memory (villager-mapmem.js): mapmemNoticeNode records
  CORPSES on nodes visited; mapmemHaulSites ranks corpse sites
  only. A live monster leaves no map memory.
- Expeditions (villager-agency.js startExpedition): target is a
  random direction + distance (1 + floor(R x maxD)), never a
  monster tile; expeditionMonster picks an abstract monster from
  the POOL (monsterWavePool), not a world entity — an expedition
  cannot be aimed at a known world monster even by accident.
- Gossip / awayNews: villager fights are reported to the PLAYER
  (awayNews list, resolveWildMonsterEncounter's tell(); gossip
  'rescue'/'deed' entries), but no reader turns a fight report
  into a villager destination. The player learns; the village's
  routing does not.
- worldMonsters() readers outside game.js (comms.js, finale-
  campaign.js, havenGrowth.js, network-campaign.js, shelter.js,
  titans.js): crisis resolution, raid lingering, network cleanup,
  titan bookkeeping — none of them feeds objPick, objMaybeDepart,
  or objAwayStep.
- Player perception is the ONLY live-monster knowledge in the
  game: entering a monster's tile narrates it ("Something moves
  out there — ..."), and wanderWorldMonsters announces a monster
  entering the player's tile. That knowledge lives with the
  player character, not with villager routing.

Consequence (stated plainly, per the prereg): a villager-led
"go to the known monster" behavior is NOT currently realizable
on any existing knowledge path. The reachable fraction below is
conditional on this link existing. The player-led variant (G2,
player route) does NOT need G1 for the player — the player can
walk to a tile they have seen — but it needs the player's own
cell contact (G6), and under the bot policy it essentially never
happens (travelingN max 1 across 1206 census-days; see G2).

#### G2 PARTY-FORMATION — two routes, both code-grounded, both thin under the bot policy

Field route (villager-led, the one that matters for the 22):

- Lead condition: exactly one villager must be ON the monster's
  tile at a worldTick (villagerMonsterTick). No party is
  "formed" before arrival — the fight starts with the lead alone.
- Ally condition (resolveWildMonsterEncounter, game.js): allies
  come from _outdoorCrew, the snapshot resolveAssignments takes
  each day-part of villagers on patrol/scout/hunt/forage
  assignments. The fight record caps allyVids at 2, but the
  crew count itself is uncapped in the read (wAllies counts the
  whole trust-sorted crew). So a field party is: lead on tile +
  crew members on outdoor assignments that same part. No trust
  gate on the ally read itself (trust only orders the crew).
- Measured: outdoorCrewN at day-end census = 0 on all 1206
  census-days (crewMax 0 on every seed). LIMIT STATED HONESTLY:
  _outdoorCrew is a per-part snapshot; the daily census reads it
  after the day's last part, so a mid-day crew is not proven
  absent by this number — but no day-end crew was ever observed,
  and the bot policy makes no patrol/scout/hunt/forage
  assignments (it plays seat legs), so the field-ally channel is
  unexercised on this substrate. The ally condition is grounded
  in code, not measured as available.
- Companion channel (the existing villager-pairing mechanism):
  objMaybeDepart's danger verdict 'ask' calls objAskCompanion —
  a companion with their own outdoor errand, or a willing
  villager, departs WITH the lead in the same part
  (objDepart for both, trust +1 each). Measured: companionN > 0
  on 482/1206 census-days (40%). So villagers DO walk out in
  pairs today — but only on errands the objective system picks,
  never toward a monster (G1).

Player route (player-led):

- Party condition (party.js travelingWith): partyMembers +
  followers, cap 3 at day 7, 4 at day 14, 5 at day 30
  (partyCap/maybeRaisePartyCap). Invite condition
  (inviteToParty): System arrived + party unlocked + Codex real
  + not full + roster + trust >= 20 (partyTrustFloor); acceptance
  35 + trust x 0.4, temperament/goal/mood modifiers; backstabbers
  always accept. Pre-System followers: trust >= 50 + compatible
  goal, max 2 (PARTY.md).
- Measured under the bot policy: travelingN mean 0 on every seed
  except two single-villager days (travMax 1 on 73673 and 73675,
  0 elsewhere). The bot never invites, so the player-party route
  contributes ~nothing on this substrate. It is available in
  code, not in these runs.

#### G3 DEPARTURE — objMaybeDepart gates (villager-objectives.js)

A villager departs only if ALL of these hold (each is a gate the
behavior's departure must pass):

- At Haven (node == Haven tile); not engaged; not sick
  (v.sick); heal gate: not sat-out hurt today (hurtGate);
  not on an agency expedition (agencyState.exped); objective
  state 'ready' and outdoor (indoor objectives never depart).
- Danger verdict (objDanger: gossip attack/murder/raid within
  3 days (+2 each, capped 4), rain (+1), distance beyond maxD
  (+2) or beyond 2/3 maxD (+1), cautious/withdrawn (+1),
  bold/restless (-1), escape goal (-2)): score <= 1 'go',
  <= 3 'ask' (companion, see G2), <= 5 'tighten' (FORAGE/WATER/
  TRAPS shrink to exactly 1 orthogonal node, partsLeft <= 2;
  EXPLORE/far VISIT defer instead), else 'defer' (indoor chore).
- Night ban (npcNodeTravel: nobody sets out at night — hard
  rule, kept from base).
- Measured pool: eligible-and-not-sick counts per seed/day are
  in the census table below. Unmeasured residuals (named, not
  assumed away): engaged status, hurtGate sat-out status, and
  the danger verdict itself are per-villager per-part values
  the daily census does not capture; R3 uses the sick-excluded
  pool as the departure proxy, so R3 is an UPPER bound on
  departure feasibility — the true departure count on any given
  part is smaller.

#### G4 TRAVEL — objAwayStep (villager-objectives.js), 1 node per day-part

- Pursue step: one step toward the target, moving BOTH axes
  (nx += sign(tx-nx), ny += sign(ty-ny)) — hence Chebyshev
  distance is the travel metric, and the optimistic bound is d
  parts (d/4 days at 4 parts/day).
- Meander: 35% of parts step to a random adjacent cell instead
  (including diagonals); at the site with clock running, 50%
  area-work steps within Chebyshev 2 of the target. Tightened
  trips (danger 'tighten') do not meander.
- Tightness cap: no step may take the villager farther from
  Haven than the objective's tightness. FORAGE/WATER/TRAPS
  tightness = their chosen distance (<= maxD, FORAGE <= 2);
  EXPLORE tightness = its distance (<= maxD); VISIT tightness =
  distance to the person; HAUL tightness = objDist to the site
  (the precedent a monster-targeted objective would follow).
- Return clock: partsLeft decrements per part away; the base
  return clock (npcNodeTravel away branch) brings them home
  when partsAway >= duration. HAUL precedent: partsLeft =
  2 x dist + 3.
- Monster-side residual (stated, not modeled): wanderWorldMonsters
  moves the target 35% per worldTick, one orthogonal tile, never
  onto safe/occupied tiles, and re-randomizes grid position.
  Arrival at the SPAWN tile is therefore necessary but not
  sufficient — the monster may have wandered off by arrival.
  The tier rule does not model wander; it is a further discount
  on the reachable fraction, in the behavior's disfavor.
- Travel-time results per spawn are in the tier table below.
  Headline: for the 5 newly-reachable spawns, d = 1-3 tiles,
  travel lower bound = 1-3 parts (under a day), against
  daysPresent of 8-77 days. Travel time is NEVER the binding
  gate on this band — persistence dwarfs it by an order of
  magnitude. The one R2 failure (73677 eulogy, d120) is a
  snapshot-granularity artifact: daysPresent = 0 (spawned and
  removed between snapshot days), so even a 2-part trip fails
  the bound — conservative, disclosed, and it costs at most 1
  spawn of reachable share.

#### G5 VILLAGER MEETING GATES — the arrival must still survive these, in order

1. Monster NOT on the player tile (villagerMonsterTick skips
   such monsters entirely — the player's fight is the player's).
2. Table not active (table sanctity: tableActive() returns early
   — no wild encounters mid-finale).
3. Villager still eligible at tick time (roster, living, not
   sheltered, not post-flee-resting — the census meeting set).
4. A worldTick occurs while they are co-located: worldTick runs
   ONLY on player tile entry (checkEncounter is its sole
   caller). Measured: tick-snapshot counts per spawn (below) —
   e.g. the 73672 reunion saw 267 worldTicks during its 69 days
   present and ZERO villager-range ticks. Ticks are plentiful;
   co-location is what is missing.
5. The 50% roll: Math.random() > 0.5 skips the tick entirely;
   otherwise ONE occupant is picked at random and
   resolveWildMonsterEncounter runs a real fieldFight. With one
   occupant, a co-located tick fights with P = 0.5; with k
   occupants, each fights with P = 0.5/k per tick. Expected ticks
   to first fight given sustained co-location: 2 (single
   occupant). The observed proof that the roll is the only thing
   standing between contact and fight: the 73677 eulogy contact
   (1 tick-villager snapshot, then the pair moved on).
6. Post-fight: the monster may flee (mFlee moves one tile),
   the villager may flee/die (post-flee rest gates re-encounter
   for the rest of that day at <= 25% HP), or be killed
   (vKill, 0/12 field fights on this band in wave4enc terms —
   the fight is real and usually lost, but that is the volley
   arm's question, not this arm's).

#### G6 PLAYER MEETING GATES — the player route's own gates

- Same tile PLUS same grid cell (monster mx,my == player mx,my
  -> startCombat in the stance branches); hummice hunts by ear
  at Chebyshev distance <= 1. Tile-sharing without cell-sharing
  is NOT a meeting: w4opp's minPlayerTiles = 0 on many
  never-fought spawns (the player shared tiles repeatedly
  without ever sharing a cell).
- Party members on the tile do NOT substitute for the player's
  cell contact in the tb path; and villagerMonsterTick skips
  monsters on the player tile entirely, so a player standing on
  a monster's tile BLOCKS the villager meeting for that monster
  while the player is there. The two routes interfere: the
  player camping a monster's tile suppresses the field route.
- The player's own worldTick generation: every player tile entry
  runs worldTick (step 4 of G5) — the player is the world's
  clock. A player sitting at Haven freezes meeting chances
  (w4opp's standing result, confirmed here by the day-end
  player tile sitting at [4,4] on essentially every census day
  — the bot ends days at Haven, though intraday entries still
  generate the tick counts above).

### ELIGIBLE-VILLAGER AVAILABILITY (counts per seed/day — meetrule census, 1206 census-days)

Pooled band: eligible mean 6.73/day, eligible-and-not-sick mean
6.26/day, roster mean 8.71. Zero-eligible census-days: 162/1206
(13.4%). Traveling-with max 1 (band-wide); outdoor-crew max 0
(day-end, see G2 limit); companion-paired days 482/1206 (40%).

| seed | days | elig mean | elig min-max | eligNS mean | zero-elig days | trav max | crew max | companion days | days w/ maxD 6 | days w/ maxD 3+ | sheltered mean |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | 7.2 | 0-11 | 6.4 | 9 | 0 | 0 | 108 | 23 | 162 | 0.6 |
| 73672 | 180 | 4.5 | 0-11 | 4.0 | 32 | 0 | 0 | 38 | 33 | 99 | 0.8 |
| 73673 | 124 | 7.0 | 0-11 | 6.7 | 12 | 1 | 0 | 50 | 0 | 101 | 0.8 |
| 73674 | 142 | 7.8 | 5-11 | 7.5 | 0 | 0 | 0 | 51 | 63 | 105 | 0.0 |
| 73675 | 180 | 5.9 | 0-11 | 5.7 | 77 | 1 | 0 | 34 | 0 | 103 | 3.7 |
| 73676 | 144 | 7.9 | 0-11 | 7.2 | 4 | 0 | 0 | 99 | 0 | 136 | 0.3 |
| 73677 | 152 | 6.8 | 0-11 | 6.6 | 28 | 0 | 0 | 36 | 31 | 121 | 0.6 |
| 73678 | 104 | 7.9 | 2-11 | 7.1 | 0 | 0 | 0 | 66 | 0 | 103 | 0.0 |

Read in plain words: the village is NOT short of people in
general (mean ~7 eligible a day) — but it is short exactly when
it matters. 73675 spends 77/180 days with NOBODY eligible
(sheltered mean 3.7 — whole-village shelter musters), and the
wave-4 era roster collapses on the hard seeds (73672: roster 3-5
by day 100; 73677: roster 1 — only the player — by day 152).
Eligibility is lumpy: shelter blocks and death attrition, not a
steady pool. Objective kinds pooled over eligible villagers:
HAVEN_CHORE 1689, idle 1343, WATER 1130, VISIT 901, GUARD 706,
LEAVE 675, FORAGE 644, TRAPS 351, EXPLORE 297, EAT 190, SEEK 161,
HAUL 34 villager-days. The only target-node precedent (HAUL)
fires rarely — 34/1206 census-days of eligible-villager time.

### TRAVEL-TIME ESTIMATES (per never-fought spawn, spawn tile -> Haven)

dCheb distribution over the 24: d=1: 14 spawns, d=2: 5, d=3: 4,
d=4: 1 (73671 suburb, tile [7,0], Manhattan 7 — the board edge
case: Chebyshev 4 but Manhattan 7, because the tile sits in a
corner direction from Haven). Travel lower bounds: 1-4 parts
(under a day to a day). Days present: mean 25.3 (w4opp), range
0-79. For every spawn that passes R1 except the d120 eulogy,
travel bound <= daysPresent x 4 holds with huge margin (worst
passing case: 73673 herald-adjacent? — the tightest passing
case is 73673 eulogy: d=1, 1 part, 3 days present). Travel time
is not a gate on this band; range and eligibility are.

### THE TIER TABLE (all 24 never-fought spawns; spawn-day rule, judged)

R1 = eligible villager with maxD >= dCheb on spawn day.
R2 = R1 and dCheb <= daysPresent x 4. R3 = R2 and
eligible-not-sick > 0 on spawn day. Newly reachable = never-
in-range passing R1∧R2∧R3. TickSnaps = worldTicks while present
(w4opp tick snapshots); tickVill = ticks co-located with an
eligible villager (0 except the 73677 contact).

| seed | spawn | type | cls | tile | dCheb | daysPresent | elig/eligNS spawn day | maxMaxD spawn day | R1 | R2 | R3 | newly | tickSnaps | tickVill |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | d179 | suburb | never-in-range | [7,0] | 4 | 1 | 1/1 | 1 | no | no | no | no | 8 | 0 |
| 73671 | d179 | audit | never-in-range | [5,3] | 1 | 1 | 1/1 | 1 | YES | YES | YES | YES | 5 | 0 |
| 73672 | d111 | reunion | never-in-range | [4,5] | 1 | 69 | 0/0 | — | no | no | no | no | 267 | 0 |
| 73672 | d127 | algorithm | never-in-range | [2,4] | 2 | 53 | 2/2 | 1 | no | no | no | no | 210 | 0 |
| 73672 | d164 | reunion | never-in-range | [3,5] | 1 | 16 | 0/0 | — | no | no | no | no | 67 | 0 |
| 73672 | d164 | eater | never-in-range | [5,3] | 1 | 16 | 0/0 | — | no | no | no | no | 65 | 0 |
| 73672 | d176 | influencer | never-in-range | [5,3] | 1 | 4 | 0/0 | — | no | no | no | no | 17 | 0 |
| 73672 | d180 | suburb | never-in-range | [4,3] | 1 | 0 | 0/0 | — | no | no | no | no | 3 | 0 |
| 73673 | d100 | eater | never-in-range | [2,4] | 2 | 24 | 6/6 | 3 | YES | YES | YES | YES | 104 | 0 |
| 73673 | d116 | herald | never-in-range | [7,3] | 3 | 8 | 2/2 | 1 | no | no | no | no | 36 | 0 |
| 73673 | d121 | eulogy | never-in-range | [4,3] | 1 | 3 | 3/2 | 1 | YES | YES | YES | YES | 15 | 0 |
| 73675 | d101 | herald | contact | [7,4] | 3 | 79 | 9/7 | 3 | YES | YES | YES | — | 251 | 0 |
| 73675 | d103 | reunion | never-in-range | [2,4] | 2 | 77 | 9/9 | 3 | YES | YES | YES | YES | 247 | 0 |
| 73675 | d106 | eater | never-in-range | [3,4] | 1 | 38 | 0/0 | — | no | no | no | no | 122 | 0 |
| 73675 | d123 | congregation | never-in-range | [5,4] | 1 | 57 | 0/0 | — | no | no | no | no | 186 | 0 |
| 73675 | d133 | eulogy | never-in-range | [4,3] | 1 | 47 | 0/0 | — | no | no | no | no | 157 | 0 |
| 73675 | d139 | eulogy | never-in-range | [4,3] | 1 | 5 | 0/0 | — | no | no | no | no | 22 | 0 |
| 73676 | d137 | reunion | never-in-range | [6,4] | 2 | 7 | 0/0 | — | no | no | no | no | 12 | 0 |
| 73677 | d112 | herald | never-in-range | [7,4] | 3 | 40 | 7/6 | 3 | YES | YES | YES | YES | 114 | 0 |
| 73677 | d120 | eulogy | never-in-range | [5,2] | 2 | 0 | 8/8 | 3 | YES | no | no | no | 2 | 0 |
| 73677 | d123 | eulogy | contact | [4,3] | 1 | 29 | 7/7 | 3 | YES | YES | YES | — | 97 | 1 |
| 73677 | d135 | eulogy | never-in-range | [4,3] | 1 | 17 | 0/0 | — | no | no | no | no | 61 | 0 |
| 73677 | d135 | reunion | never-in-range | [5,4] | 1 | 17 | 0/0 | — | no | no | no | no | 59 | 0 |
| 73677 | d152 | audit | never-in-range | [4,3] | 1 | 0 | 0/0 | — | no | no | no | no | 3 | 0 |

Tier totals (spawn-day rule): R1 8/24, R2 7/24, R3 7/24,
newly reachable 5/22 never-in-range, REACHABLE (R0 2 + newly 5)
= 7/24 (29.2%).

### WHY THE OTHER 17 NEVER-IN-RANGE SPAWNS FAIL (spawn-day decomposition — sums to 22)

- NO ELIGIBLE VILLAGER on spawn day: 13 spawns. The cause is
  shelter, not absence: on those days the living roster is
  1-10 but sheltered counts run 2-9 (73675: roster 10,
  sheltered 9 — the whole village except the player behind the
  barricaded door; 73672/73677 late: roster 3-4, sheltered
  2-3 — everyone sheltered). Two exceptions are attrition,
  not shelter: 73677 d152 (roster 1 — only the player alive)
  and the 73672 d180 suburb (roster 4, sheltered 3, present
  0 days — spawned at the horizon's edge).
- RANGE SHORT (eligible villagers exist, none ranges far
  enough): 3 spawns — 73671 suburb (dCheb 4, best maxD 1),
  73672 algorithm (dCheb 2, best maxD 1), 73673 herald
  (dCheb 3, best maxD 1). The range profile on spawn day is
  forager-short because the explorers/wanderers are dead,
  sheltered, or away.
- R1 passes but R2 fails (travel bound): 1 spawn — 73677
  eulogy d120 (dCheb 2, daysPresent 0 by snapshot count;
  see the granularity note in G4).
- Newly reachable: 5 spawns — 73671 audit, 73673 eater,
  73673 eulogy, 73675 reunion, 73677 herald. All five sit at
  dCheb 1-3 with a maxD-3 (wanderer) or maxD-1 (forager, d=1)
  villager eligible on spawn day and persist 1-77 days.
  Note the d=1 case (73671 audit, daysPresent 1): reachable
  by the bound, but only just — a 1-day presence leaves no
  slack for danger verdicts, night bans, or monster wander.

Exploratory variant (NOT judged): R1-ever (an eligible
villager with maxD >= d on ANY census day during presence)
holds for 12/24 spawns, and newly-reachable-ever is 9/22,
for a conditional reachable-ever of 11/24 (45.8%). The gap
between 29.2% (spawn-day) and 45.8% (ever) is the shelter
cycle: villagers become eligible again when musters lift, so
a behavior that WAITS for an eligible window reaches more
monsters than one that must depart on spawn day. That is a
finding for the next run's metric, not a re-score of this
run's bar (see metric review).

### REACHABILITY OF THE CONTENT IN THIS AREA

Band (this run's judged corpora — baseline = armed, G2
identical): wins 2/8, national-ever 6/8, national-final 5/8,
table waiting 4/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5
0/8, median 152d, max 180d, deaths 307, starvation 1. Wave-4
kills 0/8 seeds; wave-4+ killers peak 0 everywhere. Arc reach:
maxArc 3-4 across seeds (73672/73674/73676/73677 reach arc 4).
The table IS reached (waiting 4/8, entered 2/8) and wins happen
(2/8, both lesser) — but never through wave 4: wave-5 stays
0/8 and wave-4 kills stay 0, because the Draft is mostly
unmet (22/24) and, when met, unbeaten (field 0 kills, tb 0
kills on this band). The scale wall has not moved; this arm
measured the meeting half of it (the volley arm measures the
fight half).

Death-cause shares (armed band, 307 deaths — identical to
w4opp): villager:combat 126 (41.0%), villager:villager combat
85 (27.7%), player:the arena 43 (14.0%), villager:expedition
13 (4.2%), villager:monster 8 (2.6%), player:dehydration 7
(2.3%), villager:sickness 6 (2.0%), villager:a wound that
wouldn't close 6 (2.0%), and the small tail as in w4opp-a.
Combat dominates deaths; starvation is 1 — the scale wall is
not a starvation wall on this band.

### SENSE-TEST (NON-MEASURED replay, seed 73672 — census shape reproduced in shape, not numbers)

Replay (narration on, stdout ring — see infrastructure note):
180d survived, maxWave 4, tableWaiting true. The ring covers
only d178-d180 (capped at 240 lines), so it cannot judge the
d111-d176 unmet era directly; what it captures is the endgame
stance, and it matches w4opp's sense judgment exactly:

- "🌪️ THE HERALD fed in the night — 0 kcal gone from your
  stores. It is eating the realm while you deliberate." then
  "The village is rattled. Everyone's jumpy — eyes on the
  treeline." A wave-4 monster is NAMED as a presence, and the
  village's answer is vigilance, not a plan.
- NEW IN THIS REPLAY (a contrast worth naming): for a lingering
  treeline raider the game DOES voice a sortie — "🌙 Night.
  The lingering The Callback gorges at the treeline — 540 kcal
  gone from the stores. Endure it (they drift off within ~6
  nights — the gorge is the price), or send a sortie: fighters,
  rations, real risk." The village's language HAS a sortie
  concept — for lingerers at the treeline, in the aid-crisis
  frame. Nobody applies it to the unmet Draft monsters. The
  blank is specific: pursuit language exists, but no path
  attaches it to a known world monster (G1 again).
- Villagers speak as people with jobs: Ingrid "Give it hell."
  and "Thirst doesn't negotiate. Going."; Khalil "Gone looking.
  Don't wait up."; Ben of Thornfield arrives with 2,521 kcal —
  "Eat. We'll settle the books when the green comes back."
Plain-words judgment: the unmet monsters read as DISTANT, not
avoided and not quite ignored — the same judgment as w4opp-a,
now with the sortie contrast sharpening it. Nobody runs from
them, nobody forgets them ("eyes on the treeline"), but the
village never treats a known unmet monster as a PROBLEM TO
WORK ON. Monsters are weather the village endures behind
walls, not quarry it pursues.

### VILLAGERS ACTING LIKE PEOPLE (sampled from the same corpus)

- Villagers DO their jobs with voice and consequence (forage
  returns, water runs, trade arrivals, wound deliberation in
  the sense replay). Companion departures happen (482/1206
  census-days with a companion) — people walk out together,
  on errands.
- The least people-like datum is the same negative as w4opp-a,
  now quantified: across 24 never-fought spawns, the village
  never walks toward a known monster — because (G1) no
  knowledge path exists for it to walk toward, and (G2) the
  bot policy never forms a player party. That is an engine
  blank, not a villager failure.
- The scholar's behavior is bot-policy behavior (tableseat-
  nowait seat legs + leanlinkrescue courtship), not villager
  behavior, and is not judged as such. The bot's day-end
  position (Haven tile on essentially every census day) is a
  policy artifact, not a villager trait — intraday tile entries
  still generate the hundreds of worldTicks counted above.

### METRIC REVIEW (§14 — binding, no mid-run re-scores)

- The DIAG-GO bar is judged exactly as pre-registered:
  8/8 seeds fully classified (every wave-4 spawn in exactly one
  opportunity class, zero unclassified, recorder errors zero),
  condition list G1..G6 complete with G1 marked MISSING (absence
  grounded by enumeration, never invented), reachable fraction
  quantified under the spawn-day tier rule (7/24). No metric
  was re-scored. The exploratory ever-variant (11/24) is
  reported separately and does NOT replace the headline.
- One metric note for the NEXT run (carried from w4opp-a, now
  with evidence): "fully classified" passes vacuously on
  zero-encounter seeds (73674, 73678). A future bar that wants
  to force encounter coverage should require a minimum
  encounter count per seed separately from trace completeness —
  proposed here, not applied retroactively.
- Two metric notes for the NEXT run from THIS arm:
  (1) The spawn-day tier rule is conservative in a specific
  way: it demands eligibility on the spawn day, but shelter
  musters lift and fall, so a waiting behavior reaches more
  (29.2% spawn-day vs 45.8% ever). A future bar should
  pre-register WHICH window it judges (spawn-day vs
  presence-window) instead of discovering the gap after.
  (2) The day-end census cannot see per-part states: _outdoorCrew
  (per-part), danger verdicts (per-part), engaged/hurtGate
  (per-villager per-part), and intraday player movement are all
  invisible at daily granularity. A future arm that wants the
  departure gate exactly should record per-part, not per-day —
  proposed here, not retrofitted.
- Instrument notes for the NEXT run: (1) daysPresent for
  removed spawns uses last-snapshot day, so a spawn removed
  the day after spawning reads daysPresent 0 and fails R2
  conservatively (1 spawn affected: 73677 d120 eulogy) — a
  removal-day-aware presence measure would fix it; (2) the
  day-end player tile is NOT a worldTick count — tick
  snapshots are (hundreds per long-lived spawn even when the
  day-end tile never moves); any future "player froze the
  world" claim must use tick counts, not census tiles.
- BALANCED PANEL (§15): attempted, not applicable — same
  recorder-corpus limitation as prior arms
  (balance-panel.js has no corpus-ingest mode). The paired
  identical-seed tables above are the comparison of record,
  and for this no-lever DIAG arm, leg-exact determinism
  (G2 8/8 identical) is the comparison — stated explicitly.
  No panel file is produced or faked.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction).
- check.js --quick NOT run: zero src/js diff in this tree
  (DIAG arm, one new recorder + two sweep/proof scripts +
  one sense-stdout script only) and sibling loops are live;
  the arm's own proof is the det-gate + G2 identity + the
  1127-check proof + detail census-match. node --check clean
  on all new scripts.

### PROOF SCRIPTS (all in this tree, all run)

- scripts/policies/meetrule-diag.js — NEW in this arm. Daily
  census recorder (MEETRULE=1): Haven/player tiles, roster/
  living/eligible/sheltered/post-flee/sick counts, eligible
  node map with npcMaxDist, objective-kind counts, companion
  counts, outdoor-crew size, traveling-with size, table-active
  flag. Strictly read-only (nodePos/objState read directly,
  never via npcNode/objOf); npcMaxDist is the engine's own
  memoizing read, disclosed in the header, with G2 identity as
  the neutrality proof.
- scripts/test-meetrule-diag-sweep.js — NEW in this arm
  (copied from test-w4opp-diag-sweep.js, w4opp partition reused
  intact, meetrule layer added outermost). Sweep (--one per
  seed via child processes, --summary rebuild, --detgate,
  --detail, --sense). Det-gate PASS, detail census-match PASS
  (73675), sense via the stdout script below (see infra).
- scripts/test-meetrule-a.js — NEW in this arm. Proof:
  re-derives every summary number from the rows; 1127 PASS,
  0 FAIL (re-baseline, G2, opportunity totals, census
  integrity, tier rows, verdict components).
- scripts/test-meetrule-sense.js — NEW in this arm. Sense-only
  narration replay printing the ring to stdout (see
  infrastructure: the shared --sense file write failed on the
  EPERM flap; this script runs the identical substrate and
  prints instead of writing a file).
- Reused verbatim: scripts/policies/spawnsrc-diag.js,
  scripts/policies/wave4enc-diag.js,
  scripts/policies/fieldfinish-diag.js,
  scripts/policies/nonworldkill-diag.js,
  scripts/policies/w4opp-diag.js (no edits).

### INFRASTRUCTURE (loud, as required)

- EPERM write flap hit the sense step, 4 times: the shared
  --sense mode's file write (writeFileRetry, 8 attempts each)
  failed with EPERM on every attempt, in evidence/2026-10-26/
  and at the worktree root alike, leaving a 0-byte file each
  time (removed after each attempt). The flap was reproduced
  independently (node 60KB write, python 60KB write, then even
  a node small write failed in the same minute) while shell
  small writes passed in gaps — the flap is per-write-call
  and intermittent on a sub-minute scale, the same class as
  the 2026-10-23/24 .git/evidence flaps in AGENTS.md. Recovery:
  the sense replay was run through the new stdout script
  (identical substrate, narration on, ring printed, never
  census) — the sense judgment above comes from that run.
  No sweep corpus row was affected (all 16 rows + summary
  wrote cleanly before the flap window).
- The coordinator's heartbeat loop (sleep 1800 between runs)
  owns registry heartbeats for this tree; one of my own
  heartbeat invocations backgrounded after printing, which
  turned out to be the same loop shape, not a failure — no
  action taken, coordinator owns the registry.
- No safe-commit refusal yet (commit step follows this
  file); the coordinator owns the --ff-only merge. No
  [needs-eyes]: this DIAG arm changes no feel, combat, or UI
  — that assessment did not change during the run.

### BLANKS FILLED OR DOCUMENTED

- FILLED (measurement): the "go to the known monster"
  condition specification on band 73671-73678 — G1..G6 with
  code refs, party-formation conditions, per-seed/day eligible
  availability, per-spawn travel bounds, and the meeting-rule
  gate each condition must pass. DIAG-GO.
- FILLED (measurement): the quantified reachable fraction —
  7/24 (29.2%) conditional on knowledge, spawn-day rule;
  11/24 (45.8%) on the exploratory presence-window rule.
- FILLED (measurement): the failure decomposition of the 17
  unreachable never-in-range spawns — 13 no eligible villager
  (shelter-dominated), 3 range-short, 1 travel-bound artifact.
- FILLED (measurement): travel time is not a gate — 1-4 parts
  vs 0-79 days present. Range and eligibility (shelter +
  attrition) are the gates, with knowledge missing entirely.
- FILLED (measurement): the re-baseline delta — ZERO. Current
  master moves nothing on this band vs 1920.
- DOCUMENTED, NOT FIXED (engine blank): G1 knowledge — no
  path supplies a live world monster's tile to villager
  routing. Any future behavior must first create that path;
  until then the reachable fraction is conditional.
- DOCUMENTED, NOT FIXED (sense blank, sharpened): the village
  has sortie language for treeline lingerers but never applies
  it to unmet Draft monsters — pursuit exists as a phrase,
  not as a path to a known monster.
- DOCUMENTED, NOT FIXED (instrument gaps): day-end census
  cannot see per-part crew/verdict/engaged states; removal-day
  presence undercounts by up to a day; day-end player tile is
  not a worldTick count (tick snapshots are).
- NOT A FINDING: no game bug was found in the spawn, wander,
  field-fight, or tb paths on this band — the two independent
  field wraps agree on wave-4 counts on all 8 seeds, the kill
  log agrees with the tb ends, and the faced feed agrees with
  the event rows. The encounters work as designed; the
  village simply has no road to them.

Convergence state: scale-onramp stays converging (NOT
converged): wave 5 still 0/8, wave-4 kills still 0/8, and now
the meeting half has its price tag — even IF the village knew
where the Draft stands, only 7/24 never-fought spawns pass
every spawn-day gate (range + travel + departure pool), and
without the knowledge link itself the reachable count is 0 by
construction. The wall did not move; this arm priced the road
to it, gate by gate.
