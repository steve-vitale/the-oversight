# sim-meetrule-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: flesh-out loop, run fleshout-20261026T2141Z, arm sim-meetrule-a
(axis scale-onramp). DIAG / MEASUREMENT ONLY — zero src/js changes,
no default flips, no demand-number moves, no npcNodeTravel / worldTick /
meeting-rule changes. Do NOT propose the behavior as a lever.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5). No design invented here.

## Question (findings backlog, next blank #1, from sim-w4opp-a)

22/24 never-fought wave-4 spawns never share a tile with an eligible
villager, though monsters spawn mean 2.0 tiles (Manhattan) from Haven
and persist mean 25.3 days (sim-w4opp-a, DIAG-GO). Answer, in
code-grounded terms, what a "go to the known monster" behavior would
need: party-formation conditions, eligible-villager availability
(counts per seed/day), travel-time estimate from Haven to
known-monster tiles under npcNodeTravel's objective set, and which
meeting-rule gates (same-tile + worldTick-on-player-entry + 50% roll)
each condition must pass. Quantify a reachable fraction: how many
never-fought spawns become reachable under the listed conditions.

## Substrate

tableseat-nowait (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs
only), seeds 73671-73678, 180d death-aware horizon (runDays stops on
Game.over). RE-BASELINE FIRST on current master against the 1920 band
table (wins 2/8, national-ever 6/8, national-final 5/8, table 4/8,
entered 2/8, wave-4 6/8, wave-5 0/8, median 152d, deaths 307); report any
base delta field-by-field, never silently absorb it.

Baseline: plain tableseat-nowait, own replication (8 seeds), NOT
another arm's corpus. Armed: tableseat-nowait wrapped with the five
w4opp recorders reused verbatim (spawnsrc, wave4enc, fieldfinish,
nonworldkill, w4opp) plus ONE new recorder meetrule-diag (MEETRULE=1):
a daily census (day, Haven tile, player tile, roster/eligible/
sheltered/post-flee/sick counts, eligible-villager node map with
npcMaxDist, objective-kind counts, companion counts, outdoor-crew
size, traveling-with size). Recorders never write game state, draw no
RNG, never throw into the engine. They never call
villageStandingTotal() or unlockedWave() mid-run. The w4opp
opportunity partition is reused intact — do NOT re-litigate it.

## Pre-registered tier definitions (judged against these, never re-scored)

Spawn tile = first w4opp snapshot (tx,ty) for that spawn seq. Haven =
census havenTile. Distance d = objDist Chebyshev distance
(max(|dx|,|dy|)) from Haven to spawn tile — objDist is Chebyshev
(villager-objectives.js), and objAwayStep pursue steps move both axes
per part, so Chebyshev is the travel metric; Manhattan is reported
alongside for comparison with w4opp's mean 2.0. daysPresent = w4opp
perSpawn daysPresent (censored at horizon when presentAtEnd).

- R0 already-contact: w4opp class contact-without-fight.
- R1 range (conditional on knowledge, see G1): on the spawn day's
  census, at least one eligible villager (meeting set: roster minus
  player, living, not sheltered, not post-flee-resting — exactly
  villagerMonsterTick's filter) has npcMaxDist >= d. Rationale
  (code-grounded): HAUL precedent — mapmemHaulSites filters
  dist > maxD (villager-mapmem.js); objHaulFromSite sets tightness =
  objDist; FORAGE/EXPLORE targets are capped by maxD. A
  monster-targeted objective modeled on HAUL needs maxD >= d.
- R2 travel-time: R1 AND travelPartsLB = d <= daysPresent * 4.
  Rationale: objAwayStep moves at most one node per day-part
  (pursue step, or meander step); 4 parts/day. d parts is the
  optimistic lower bound (pursue every part, no meander, no
  tightness block, departure immediate). It is a bound, not a
  prediction — the evidence reports the bound and the observed
  persistence it is compared against, not a fitted travel time.
- R3 departure-day pool: R2 AND eligible-and-not-sick count > 0 on
  the spawn day's census. Rationale: objMaybeDepart skips the sick
  (villager-objectives.js), the engaged, the away, and night
  departures; the census measures the sick-excluded pool, and the
  engaged/away/night exclusions are named as unmeasured residuals,
  not silently assumed away.
- REACHABLE (conditional) = (R0 count + never-in-range spawns
  passing R1∧R2∧R3) / 24, reported as a fraction and a count, with
  the in-range-never-met class (expected 0, per w4opp) folded in by
  the same rule if any appear. The fraction is CONDITIONAL on G1
  (knowledge) — see below. It is not a prediction that the behavior
  would fight those monsters; it is the share that passes every
  necessary condition the code supplies.

## Condition list to ground (G1..G6, each with its meeting-rule gates)

- G1 KNOWLEDGE — how does a villager (or the village) learn a live
  world monster's tile? Enumerate every code path that could supply
  a live-monster tile to villager routing (objPick targets,
  mapmem sites, expedition targets, gossip/awayNews, player
  perception). If none supplies it, report KNOWLEDGE as MISSING
  (grounded absence), never invent a channel. The reachable
  fraction is then conditional on this link.
- G2 PARTY-FORMATION — field route: lead villager on the tile +
  _outdoorCrew allies (resolveWildMonsterEncounter reads
  _outdoorCrew from resolveAssignments; allies capped at 2 in the
  fight record, crew counted in full). Player route: travelingWith
  (partyMembers + followers, cap 3/4/5 by day 7/14/30) walks with
  the player to the tile; party auto-joins tb fights. Measure:
  outdoor-crew sizes and traveling-with sizes per seed/day.
- G3 DEPARTURE — objMaybeDepart gates: at Haven, not engaged, not
  sick, heal gate (hurtGate sat-out), danger verdict
  (go/ask/tighten/defer via objDanger on gossip+rain+distance+
  temperament), night ban, expedition ownership. Measure the
  eligible-and-not-sick pool per seed/day; name unmeasured gates.
- G4 TRAVEL — objAwayStep: 1 node/part, pursue (both axes) vs 35%
  meander, tightness cap, return clock (partsLeft). Travel bound
  per spawn as in R2. Wander of the monster itself (35%/worldTick,
  orthogonal, never onto safe/occupied tiles) is a residual: the
  target tile moves, so arrival at the spawn tile is necessary
  but not sufficient — stated, not modeled.
- G5 VILLAGER MEETING GATES — once co-located: monster NOT on the
  player tile; table not active (table sanctity); villager still
  eligible at tick time; worldTick occurs (player tile entry is
  its sole caller — measure tick-snapshot counts per spawn and
  player-tile-change days); then 50% roll, one occupant picked at
  random. A co-located tick fights with P=0.5 (single occupant);
  with k occupants the picked villager fights with P=0.5/k each.
- G6 PLAYER MEETING GATES — player route: same tile PLUS same
  grid cell (startCombat); hummice hunts by ear at Chebyshev <= 1.
  Tile-sharing without cell-sharing is not a meeting (w4opp
  minPlayerTiles 0 result). Party members on the tile do NOT
  substitute for the player's cell contact in the tb path, and
  villagerMonsterTick skips monsters on the player tile entirely.

## DIAG-GO bar (binding)

GO iff (a) every never-fought spawn on the band is classified into
exactly one w4opp opportunity class (reuse intact, zero
unclassified, recorder errors zero); AND (b) a complete list of the
conditions above (G1..G6) is given, each either grounded in a code
read (file + function named) or explicitly marked MISSING with the
absence grounded by the enumerated search — never invented; AND (c)
a quantified reachable fraction under the R0..R3 rule above.
NO-GO if any condition is left ungrounded AND unmarked, or if (a)
or (c) fails. A MISSING knowledge link does not by itself fail (b)
if it is marked and its consequences (conditional fraction) are
stated — but the evidence must say plainly that the behavior is
not currently realizable on that link alone.

## Cost / determinism bars

- G2 recorder neutrality: armed == baseline exactly on
  days/gameDays/ts/starvation per seed (leg-exact determinism is
  the comparison for this no-lever DIAG arm — stated explicitly;
  balance-panel.js has no corpus-ingest mode, so no panel file
  is produced or faked, same limitation as prior arms).
- Cost bar: armed starvation <= baseline starvation + 2 AND armed
  median days >= 0.8 x baseline median days.
- Det-gate: recorders unset == unwrapped on one seed.
- Sense test: one NON-MEASURED narration-on replay of the seed
  with the most never-fought spawns; judge in plain words whether
  the village treats a known monster as a problem to work on.
  Never census evidence.
- Telemetry-check is NOT run on recorder rows (its counts are
  wrong on recorder rows — standing instruction).
- check.js --quick NOT required: zero src/js diff in this tree
  (DIAG arm, one new recorder + two sweep/proof scripts only);
  node --check clean on all new scripts instead.

## Metric review

Every evidence file carries a "metric review" section (§14). No
metric is re-scored mid-run. Notes for the NEXT run go there.
