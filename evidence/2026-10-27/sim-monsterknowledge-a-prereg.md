# sim-monsterknowledge-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: flesh-out loop, run fleshout-20261027T0321Z, arm sim-monsterknowledge-a
(axis scale-onramp). DIAG / MEASUREMENT ONLY — zero src/js changes,
no default flips, no game lever proposed. Report what would need to
exist for the knowledge link as specification only, never as a lever
proposal.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5). No design invented here.

## Question (from sim-meetrule-a, run fleshout-20261026T2141Z)

sim-meetrule-a answered the wave-4 never-fought blank with a
condition list G1..G6 and marked G1 KNOWLEDGE as MISSING: no engine
path supplies a live monster's tile to villager routing, so the
reachable fraction (7/24) is conditional on a knowledge link that
does not exist. Its conclusion, respected here: do NOT propose the
routing behavior as a lever until the knowledge link exists. This
arm is the inventory + band measurement the next run needs:
(1) inventory EVERY candidate engine channel that could supply a
live monster's location/knowledge to villager routing, each
classified present-with-code-citation (file + function) or
absent-with-enumerated-search-evidence, nothing invented;
(2) measure on the band whether villagers ever hold or act on
monster-location knowledge (a gossip line naming a monster +
place, an objective targeting a monster tile, a report that moves
a villager toward a known monster), classifying every candidate
event found.

## Substrate and base

- Base commit (this worktree at prereg time):
  c8770e7f4412aa6430d6daa3ce86e28484f0de20. NOTE: this is NOT the
  meetrule base (896f2ac39f24284118dac4bb29d0b38cca9666e1) — the base
  MOVED between runs. The 1920Z band table is therefore re-baselined
  on identical seeds first (see below); no number is judged against
  a stale baseline. Any delta is reported field-by-field as a base
  move, never silently absorbed.
- Substrate: scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only),
  seeds 73671-73678, 180-day death-aware horizon (runDays stops on
  Game.over).
- Baseline reference (1920Z band table): wins 2/8, national-ever
  6/8, final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
  median 152d, deaths 307. Verify it replicates on the base commit
  first; if it does not, the re-baseline on identical seeds IS the
  baseline for this run and the delta is explained as a base move.
- Baseline arm: plain tableseat-nowait, snapshot-only. Armed arm:
  tableseat-nowait wrapped with the five meetrule recorders reused
  verbatim (spawnsrc, wave4enc, fieldfinish, nonworldkill, w4opp)
  plus ONE new recorder monsterknowledge-diag (MONSTERKNOWLEDGE=1):
  a daily census of live world monsters, villager-objective
  targets, gossip state, codex monster knowledge, muster/threat
  state, map-seen state for monster tiles, and villager/player
  co-location. Recorders never write game state, draw no RNG,
  never throw into the engine. They never call
  villageStandingTotal() or unlockedWave() mid-run. Objective
  kinds/targets are read from objState() directly, never via
  objOf (which would create entries); nodePos is read directly,
  never via npcNode. Codex knowledge is read from
  state.codex.monsters + deedState().wavesFaced directly, never
  via a mutating helper. shelterThreatNearHaven() is a pure read
  (computes from worldMonsters()); the G2 leg-exact identity
  check is the proof that calling it moves nothing.

## Channel inventory (candidate channels — every one classified)

Each channel is classified PRESENT (file + function + what it
carries: monster identity? tile? reader that feeds routing?) or
ABSENT (enumerated search evidence: which files/functions were
checked and what they do instead). Zero channels left unexamined,
zero invented. Candidate list (fixed here, before sweeping):

- C1 villager objectives (objPick targets) — villager-objectives.js
- C2 map memory / corpse sites (mapmemHaul) — villager-mapmem.js
- C3 expeditions (startExpedition / expeditionMonster) — villager-agency.js
- C4 gossip state (seedGossip actions + heard lists) — game.js
- C5 awayNews (player-return news queue) — game.js / havenGrowth.js
- C6 scout assignments + scout reports (resolveOneAssignment scout
  branch, markSeen 'shared') — game.js
- C7 scholar/codex monster knowledge (monsterKnown, codex.monsters,
  monsterCounters, wavesFaced) — game.js / encounters.js
- C8 monster-sighting state (any stored sighting of a live monster)
- C9 crow / Eurika / East Nile warnings (disease-sense channels)
- C10 shelter muster threat gate (shelterThreatNearHaven,
  shelterMusterCheck) — shelter.js
- C11 lingering-raider / treeline state (lingeringRaiders,
  havenRaidTick) — havenGrowth.js
- C12 titan / finale scout tile lines (titans.js, finale-campaign.js)
- C13 player perception (playerMonster, perceptionHints,
  tile-entry narration, wanderWorldMonsters announcements)
- C14 conversation topics (convoTopics lately/sighting/muster,
  convo-wants sightingNews, compareMaps) — convoTopics.js /
  conversation.js / game.js
- C15 worldMonsters() readers outside game.js (comms.js,
  finale-campaign.js, havenGrowth.js, network-campaign.js,
  shelter.js, titans.js) — does any feed objPick / objMaybeDepart /
  objAwayStep?
- C16 villager fight reports (resolveWildMonsterEncounter tell(),
  field-fight tell lines) — game.js / fieldFights.js

For each PRESENT channel the evidence states exactly what it
carries and whether any reader feeds villager routing. A channel
that names a monster but supplies no tile, or supplies a tile to
the PLAYER only, is PRESENT-but-not-a-routing-link, not a link.

## Band scan event classes (every candidate event classified)

On each census day, for each live world monster (all waves for
gossip/objective matching; wave-4 subset reported separately),
the recorder emits:

- E1 objective-target match: a living non-player villager's
  objective (kind, state) has tx,ty == the monster's live tile.
  Sub-classified by kind (FORAGE/WATER/TRAPS/EXPLORE/VISIT/HAUL/
  LEAVE/other) and by whether the villager's node moves closer
  to the monster tile by the next census day (moving-toward).
- E2 gossip match: a gossip entry whose action/dims string
  contains the live monster's id, display name, or noun. (Gossip
  dims carry person ids and traits, never tiles — a match is
  still classified, and its tilelessness stated.)
- E3 codex-known live type: state.codex.monsters has an entry
  for the live monster's type, or wavesFaced names it. Type
  knowledge without location — classified, never counted as a
  location link.
- E4 muster-active-with-live-threat: shelterMustered set while
  shelterThreatNearHaven() returns a wave-4+ monster. The
  muster NAMES the threat (noun) but routes villagers INSIDE,
  not toward it — classified as an anti-pursuit signal.
- E5 map-seen monster tile: mapSeen(tx,ty) is 'visited' or
  'shared' for the live monster's tile (scout/sense provenance
  where recorded). Tile-known-to-player-map, not a villager
  objective — classified separately.
- E6 co-location: an eligible villager's node == monster tile
  (w4opp already proves this class; here it is counted only to
  show it is NOT knowledge — it is meeting, and it is reported
  as such, never folded into E1-E5).
- E7 player-on-tile: player tile == monster tile (player-only
  knowledge channel; never villager knowledge).

Say-only lines (scout report line, muster line, sortie line,
titan lair line) have no state surface in the sweep census; they
are classified in the inventory by code citation, and their band
occurrence is measured through their STATE proxies (E4 muster
flag, E5 map-seen, lingering list) plus one NON-MEASURED
narration-on sense replay (seed with the most wave-4 spawns)
that samples actual lines. The sense replay never feeds census
numbers.

An event candidate is UNCLASSIFIED if it matches none of E1-E7
and no inventory channel explains it; the scan reports the
unclassified count per seed and band-wide, and DIAG-GO requires
zero.

## DIAG-GO bar (binding, verbatim)

DIAG-GO iff (a) the channel inventory is complete: every candidate
channel classified present-with-citation or
absent-with-enumerated-search, zero channels left unexamined, zero
invented; (b) the band scan is complete: every monster-location
knowledge-event candidate on all 8 seeds classified, zero
unclassified; (c) recorder neutrality: det-gate seed identical on
days/gameDays/ts/starvation recorder on/off, and band wall numbers
replicate the baseline table or any delta is explained as a base
move. Cost bar: armed starvation <= baseline starvation + 2 AND
armed median days >= 0.8 x baseline median. A miss is DIAG-NO-GO,
never re-scored mid-run; metric doubts go under "metric review"
in the evidence file for the NEXT run. Every evidence file
carries a "metric review" section.

## Cost / determinism bars

- G2 recorder neutrality: armed == baseline exactly on
  days/gameDays/ts/starvation per seed (leg-exact determinism is
  the comparison for this no-lever DIAG arm — stated explicitly;
  balance-panel.js has no corpus-ingest mode, so no panel file
  is produced or faked, same limitation as prior arms).
- Det-gate: recorders unset == unwrapped on one seed.
- Detail repro: one armed seed re-run, census-match check.
- Sense test: one NON-MEASURED narration-on replay of the seed
  with the most wave-4 spawns; judge in plain words whether any
  villager line carries usable monster-location knowledge.
  Never census evidence.
- Telemetry-check is NOT run on recorder rows (its counts are
  wrong on recorder rows — standing instruction).
- check.js --quick NOT required: zero src/js diff in this tree
  (DIAG arm, one new recorder + two sweep/proof scripts only);
  node --check clean on all new scripts instead.

## Metric review

Every evidence file carries a "metric review" section (§14). No
metric is re-scored mid-run. Notes for the NEXT run go there.
