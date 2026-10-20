# sim-sanctityaudit — table-sanctity startCombat coverage audit (flesh-out loop, 2026-10-19, ARM sim-sanctityaudit)

Run: oversight-flesh-out-loop 2026-10-19 (evening). Axis: scale-onramp (standing directive).
DIAGNOSTIC — zero src/js changes. Instruments + evidence only.
File scope (zero overlap with sibling arms): scripts/test-sanctityaudit-20261019.js (new),
evidence/2026-10-19/sim-sanctityaudit.md (this file).

Canon: docs/CANON.md + docs/TABLE.md — sanctity of the table (Steve 2026-10-12):
"When the table sits, the world holds its breath: ambient monster pressure
against villagers is suspended for the whole sequence — no random field
fights, no wild encounters, no patrol contact, and no new raids. ... ALL
stakes during the finale are the table's own — pricing, branches, trial by
combat (the one opt-in existential risk). Deaths during the finale must be
meaningful, never background wolves."

Trigger: sim-tablepaths (2026-10-19, evidence/2026-10-19/sim-tablepaths.md)
found a table-sanctity coverage gap: on belongfeast/s64203, a wave-4
'suburb' (d90) and a wave-4 'eulogy' (d91) started fights at Haven via
combat_start while tableActive() was TRUE (sanctity announced), killing two
post-trial scholars (Olivia d91, Ekua d91 — seated-raid ×2, deaths at
tableActive=True, phase=challenge, atHaven, router=None). The engine's
sanctity gates cover patrols (src/js/game.js:7307, nearestWorldMonster
nulled) and villagerMonsterTick (src/js/game.js:18804) — NOT the spawn path
of these fights. Per TABLE.md all stakes during the finale must be the
table's own.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep)

**PRIMARY (diagnostic GO):**
1. A complete call-site table: EVERY startCombat call site in src/js/game.js
   classified (a) ambient router sanctity MUST cover, or (b) the table's own
   stakes which must NEVER be gated, with the covering code line cited or its
   absence named.
2. A corpus-demonstrated trigger (seed/day) for each site observed firing
   during sanctity, with the suburb/eulogy mechanism attributed.

**GO bar:** the call-site table is complete (no startCombat site in game.js
unclassified) AND every fight observed firing while tableActive() is true in
the corpus + the fresh instrumented replay has its call site named. If the
bar misses, report DIAG-NO-GO honestly — never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating — same surface
as the tablepaths corpus).

**Seeds:** 64201–64208 × {leadfeast, belongfeast} = 16 runs, SEATDRIVE=1 +
TABLEPATHS=1 substrate (scripts/policies/tablepaths.js +
scripts/probe-tablepaths-20261019.js instruments, reused read-only), PLUS a
caller-identifying startCombat wrapper (stack → call-site line, tableActive()
at fire time). The corpus base was 8c055140a; this run is on current master —
trajectory drift is possible; attribution targets call sites, not seed/day
reproduction.

**Policies:** withTablePaths(withSeatDrive(withWinDefer(TF base))) on
{leadfeast, belongfeast} tribfloor bases. Env: FEASTSCALE_R13=1 TRIBFLOOR=1
SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1
KILLDISC=1 TABLEPATHS=1. No VETREL, no REPOSITION.

**Instrument purity:** the caller wrapper is call-through + read-only (no
state writes, no RNG draws). DET-gated: instrumented vs bare must be
byte-identical on 2 seeds × 60d before the sweep counts.

**Metric review:** (filled at end of run)

## Corpus-demonstrated incident (already on master, pre-sweep)

evidence/2026-10-19/perseed-tablepaths/belongfeast/s64203.json:
- sittingDay=90. fightStarts: d90 suburb via 'combat_start'; d91 eulogy via
  'combat_start'. (via='combat_start' = the raw tele inside startCombat fired
  WITHOUT any wrapped router — i.e. NOT via resolvePatrol,
  resolveWildMonsterEncounter, or aidFight.)
- deaths: Olivia d91 + Ekua d91, cause='combat', channel='raid'
  (ctx:scholar-fight-at-haven), tableAtDeath.active=TRUE, phase='challenge',
  atHaven=TRUE, router=None. Rowan d90 (the bearer) died in the trial
  (inTb, trialPending=True) — the table's own stake, legitimate.

## Call-site table (static audit — PROVEN by scripts/test-sanctityaudit-20261019.js, STATIC AUDIT: PASS)

Every startCombat call site in src/js/game.js (11 sites), classified:

| site | class | sanctity gate | verdict |
|---|---|---|---|
| game.js:11077 reengageWaitingMonsters | (a) ambient | NONE | **UNCOVERED** |
| game.js:21668 monsterTurn/hummice-sonar | (a) ambient | NONE | **UNCOVERED** |
| game.js:21685 monsterTurn/hummice-bump | (a) ambient | NONE | **UNCOVERED** |
| game.js:21710 monsterTurn/dark-bump | (a) ambient | NONE | **UNCOVERED** |
| game.js:21794 monsterTurn/ambush | (a) ambient | NONE | **UNCOVERED** |
| game.js:21832 monsterTurn/territorial | (a) ambient | NONE | **UNCOVERED** |
| game.js:21865 monsterTurn/hungry | (a) ambient | NONE | **UNCOVERED** |
| game.js:21882 monsterTurn/cautious | (a) ambient | NONE | **UNCOVERED** |
| game.js:21927 monsterTurn/default | (a) ambient | NONE | **UNCOVERED** |
| game.js:21542 gwTrapTick (glasswing dive) | (c) player-initiated (player's own trap) | N/A | ok |
| game.js:22550 faceTentIntruder | (c) player-initiated ("Face it" click) | N/A | ok |

Other-file sites (for the record):
- src/js/table-feared.js:158 — (b) TABLE'S OWN STAKE: startCombat('finale', {tableTrial:true}), trial by combat. Must NEVER be gated.
- src/js/contests.js:4727, 4751 — (b) the contest's own stakes (in-contest beasts). Never ambient.
- src/js/feastBuff.js:515 faceFeastDraw — (c) player-initiated.
- src/js/app.js:1172, 1746, 17861 ("Face it" incl. raid raider-at-bedroll), 19648 — (c) player-initiated UI.

Engine sanctity gates (repo-wide inventory — the complete set):
1. game.js:7307 resolvePatrol — nearestWorldMonster nulled (patrols walk empty)
2. game.js:18804 villagerMonsterTick — early return (no wild encounters on villagers)
3. havenGrowth.js:484 raid trigger — no new raids (return false)
4. havenGrowth.js:220 lingerer gorge — skipped (BUT the treeline re-pinning `m.tx=hx; m.ty=hy` two lines above is NOT gated)
5. overtime.js:128 overtimeScaleFight — no RERUN scaling mid-finale
6. villager-agency.js:340 expeditionMonster — expeditions meet nothing
7. convoTopics.js:363 — dialogue gating (non-combat)

The gap is exactly two uncovered ambient routers: **monsterTurn()'s stance
machine (8 sites, game.js:21640 — no tableActive check anywhere in the
function or its 7 callers)** and **reengageWaitingMonsters (game.js:11077)**.

## Instrumented replay

DET (instrument purity): 2 seeds × 60d, instrumented vs bare byte-identical — ALL PASS. The caller wrapper is call-through + read-only (no state writes, no RNG draws).

Fresh 16-run sweep (64201–64208 × {leadfeast,belongfeast}, SEATDRIVE=1 +
TABLEPATHS=1, same substrate as the tablepaths corpus; corpus base was
8c055140a, this run on current master — trajectory drift observed, e.g.
belongfeast/s64203 sits d142 here vs d90 in the corpus): per-seed JSONs in
evidence/2026-10-19/perseed-sanctityaudit/. Fights observed firing while
tableActive() was true: **2, both the trial-by-combat** ('finale',
belongfeast s64203 d142 and s64208 d90) — the table's own stake, correctly
ungated. **Zero ambient-site fights during sanctity on this base** (the
challenge resolves same-day here, so the exposure window is tiny — the
corpus incident remains the demonstration).

Corpus-demonstrated trigger (on master, pre-sweep):
evidence/2026-10-19/perseed-tablepaths/belongfeast/s64203.json —
sittingDay=90; d90 'suburb' via 'combat_start'; d91 'eulogy' via
'combat_start' (via='combat_start' = the raw tele inside startCombat fired
with NO wrapped router — not resolvePatrol, not
resolveWildMonsterEncounter, not aidFight). Deaths Olivia d91 + Ekua d91:
cause='combat', channel='raid' (ctx:scholar-fight-at-haven),
tableAtDeath.active=TRUE, phase='challenge', atHaven=TRUE, router=None.
Rowan d90 died in the trial (inTb, trialPending) — the table's own stake,
legitimate.

**Mechanism attribution (the suburb/eulogy trigger):**
1. A pre-sitting raid placed wave-4 raiders on the Haven tile (raid
   night-beat: `m.tx=hx; m.ty=hy`; the d89 eulogy aid-fight confirms the
   raid — "the threat was at the treeline"). Raid spawn itself IS gated
   during sanctity (havenGrowth.js:484) — but this raid predates the sitting.
2. Unmet raiders LINGER (`m.lingering=true`); havenGrowthDaily re-pins them
   to the Haven tile every dawn — the re-pinning is UNGATED (only the gorge
   is gated, havenGrowth.js:220).
3. Fresh spawns CANNOT reach the Haven tile during sanctity: pickWorldTile
   excludes the player's tile + safe tiles; wanderWorldMonsters cannot enter
   safe tiles. Pre-positioning is the only route — the lingerer.
4. The bearer sits at Haven during the challenge → `playerMonster()` returns
   the lingerer on the Haven tile → `monsterTurn()` (ungated) runs the stance
   machine → the monster steps to the player grid cell → startCombat on
   contact (ambient sites 21668–21927).
5. Two post-trial successors (Olivia, Ekua) die d91 — 'seated-raid',
   background wolves during the finale.

**Harness replay (REPLAY=1, scripts/test-sanctityaudit-20261019.js):**
constructed the exact state — suburb lingerer on the Haven tile (raid
night-beat's product), player at Haven, tableActive()=true — and ticked
monsterTurn(): after 5 ticks startCombat fired at **game.js:21865
(monsterTurn/hungry)** with tableActive()=true. REPLAY: GAP PROVEN.

## Sense-testing: the d90–91 fiction

The replay's say-log at the breach (tableActive true, challenge phase):
"◈ CRISIS — THE BREACH. It got INSIDE. The haven was supposed to be the
safe place — the one place. It isn't." — while the table sits. No table
voice, no stake, no meaning: the ambient router fired mid-finale and the
fiction did NOT honor sanctity. Contrast the trial (the table's own stake),
which is voiced as the table's own: "◈ TRIAL BY COMBAT — the challenge
pauses. This is not a metaphor. The Finale steps forward." The incident
deaths were exactly what TABLE.md forbids: "Deaths during the finale must
be meaningful, never background wolves." The d89 eulogy aid-fight was
pre-sitting (legitimate — the player may answer the call for help); the d90
suburb and d91 eulogy fights were sanctity violations.

## Verdict

**DIAG-GO.** The pre-registered bar is met: (1) the call-site table is
complete — all 11 game.js startCombat sites classified with covering lines
cited or absence named (STATIC AUDIT: PASS); (2) every fight observed firing
during sanctity has its call site named — the 2 fresh-sweep trials
(table-feared.js:158, the table's own stake) and the corpus suburb/eulogy
incident (ambient monsterTurn stance machine, replay-proven at game.js:21865
with tableActive()=true). No re-scoring was needed.

## Named next (the game-code fix arm — NOT implemented here)

**ARM: sanctity-gate the ambient routers (game-code).**
1. Gate the ambient contact block in `monsterTurn()` (src/js/game.js:21640)
   on `tableActive()`: when the table sits, the stance machine must not walk
   a world monster into the player — the single choke point covering all 8
   stance sites (21668–21927). Scope the gate to the stance/contact block,
   NOT the whole function: the glasswing-trap trigger above it (21542 path)
   is the player's own device and stays live.
2. Gate `reengageWaitingMonsters` (game.js:11077) on `tableActive()`: no
   door-fled re-engage and no treeline ambush mid-finale (both callers:
   hall-door exit 11063, treelineAmbush 11125).
3. Leave untouched: the trial (table-feared.js:158 — must NEVER be gated),
   contests (4727/4751), player-initiated paths (trap 21542, tent 22550,
   feast draw, UI), the lingerer treeline re-pinning (the siege persists;
   only the mid-finale ENGAGEMENT is gated — the crisis stays open and the
   player may still answer the call for help, per TABLE.md).
4. Proof shape: the REPLAY mode in scripts/test-sanctityaudit-20261019.js
   becomes the RED/GREEN — RED now (fires), GREEN after the gate (no fire,
   lingerer still pinned, trial still fires). Plus a fresh 8-seed sweep
   showing zero ambient fights during sanctity with the trial intact.

## Metric review

The pre-registered metric (complete call-site table + corpus-demonstrated
trigger per during-sanctity site) proved the right instrument — no revision
proposed. One observation for the next run: on fast-resolving tables the
sanctity exposure window is ~1 day, so ambient-gap detection needs either a
long-challenge substrate or the harness replay (which proved decisive here).
