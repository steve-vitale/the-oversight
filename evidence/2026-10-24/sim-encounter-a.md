# sim-encounter-a — the NEVER-KILLED group's wave-3 encounter/kill opportunity (axis scale-onramp)

Run: fleshout-20261024 (coordinator-assigned arm sim-encounter-a).
Worktree: `~/workspace/worktrees/sim-encounter-a` (branch sim-encounter-a).
Axis: scale-onramp (standing directive — still stands: wins only via
default-OFF instruments, lesser seat only, wave 5 still 0 on the band).

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (wave 3 gate: day 25 + 4 wave-2
  LEDGER points, kills only, per-type cap 2; wave 4: standing >= 100;
  wave 5: standing >= 200 AND wave-4 faced; readiness demands table:
  wave 4 = armored 3 @P>=10, armed 5, tricks 3, veterans 1 (killed
  wave-3+); wave 5 = armored 4 @P>=15, armed 6, tricks 3, veterans 2
  (killed wave-4+)), docs/MEASUREMENT.md §§9-12, 14-15 (pilot gate,
  death-aware horizons, pre-registration, metric binding, balanced
  panels).
- Code authority for the mechanism under test: src/js/game.js —
  `unlockedWave()` (wave-3 rung: day >= dayFloor(25) AND
  waveLedgerPoints(2) >= barsPerWave[2] (4); standing gates only waves
  4-5 on top of this rung); `checkEncounter()` (tile-entry spawns from
  monsterWavePool, 60%-newest ratios; wanderer cast via castMonster);
  `spawnWorldMonster()` (world-monster entities carry their own wave);
  `recordDeedFight()` (progression.js — deed feed wavesFaced records
  only that a blow-by-blow fight STARTED, never its outcome);
  `fieldFight()` (fieldFights.js — outcomes evade/vKill/mFlee/vFlee/vDie
  returned to callers, never logged centrally); `tbEnd(result)` (the
  player-fight settle choke point: won/lost/fled/routed; tbEndCheck ends
  'won' when no monster fights on, so won-without-kill = driven off).
- Prior run: evidence/2026-10-24/sim-vetkill-a.md (seeds 73671-73678,
  tableseat-nowait substrate): 73674/73675/73677 NEVER-KILLED (0
  wave-3+ kills, 18/22/14 log entries), 73676 KILLED-DEAD-KILLER
  (same-day kill + arena death), 73678 KILLED-LIVING-KILLER, wave-4+
  kills 0/8. This arm is vetkill's named next blank (1): the
  NEVER-KILLED group's encounter/kill opportunity. 73674 never even
  left wave 2 (standing99: wave-2 ledger points < 5 all run — this arm
  re-measures the exact points + per-type breakdown to settle whether
  it sat below the bar of 4 or between 4 and 5).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait
  leg. Seeds: 73671-73678 — the SAME band as standing99/vetkill, reuse
  intentional: this is a re-measurement of those seeds with a new
  recorder, not a fresh band.
- Baseline: tableseat-nowait, `ENCOUNTER` unset. Own baseline
  replication (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with scripts/policies/encounter-diag.js
  (`ENCOUNTER=1`). The recorder is observational: daily pure-read
  snapshots (deed feed, kill log, wave-2 ledger points + recomputed
  wave-3 gate, live world monsters, wanderer, pending encounter) that
  NEVER call unlockedWave()/villageStandingTotal() during a run, PLUS
  record-after-delegate wraps on spawnWorldMonster / fieldFight /
  tbEnd (installed on the per-run Game object before runDays so day-1
  fights are observed). Wraps write nothing to game state, draw no
  RNG, never throw into the engine (recording errors counted), and
  return the original's value untouched.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Seed labels (fixed before sweeping; priority LOST > FLED > DROVE-OFF):
  NEVER-FACED (no w3+ spawn, fight, or kill); FACED-UNFOUGHT (w3+
  spawn, no w3+ fight started); FACED-LOST (w3+ fight ended tb lost
  or field vDie); FACED-FLED (w3+ fight ended tb fled/routed or field
  vFlee); FACED-DROVE-OFF (w3+ fights, none lost/fled, at least one
  ended tb won-no-kill or field mFlee/evade — a specific evidenced
  label, counts as classified under G4); FACED-KILLED (a w3+ kill
  exists — the vetkill domain, classified not never-killed);
  UNCLASSIFIED (a w3+ fight in the deed feed with no explaining fight
  row, or a fight row with no outcome — never guessed).
- DIAG-GO requires ALL of:
  1. G1 det-gate: recorder unset == unwrapped tableseat-nowait on one
     seed (days/gameDays/ts counters identical, no `_encounterdiag`
     surface, no installed wraps);
  2. G2 neutrality: baseline vs recorder identical on days/gameDays/ts
     counters/starvation on all 8 seeds;
  3. G3 corpus integrity: 16/16 rows, every armed row carrying the
     encounter classification + per-wave encounter/fight/outcome
     counts, every baseline row carrying a post-run pure-read
     encounter snapshot (no event lists, by construction);
  4. G4 classification completeness: EACH focus seed 73674, 73675,
     73677 classified with a specific evidenced label (not
     UNCLASSIFIED). 73676 reported too. A seed that cannot be
     classified is UNCLASSIFIED with reason and fails G4.
- The classification verdict itself (which label wins) is a FINDING,
  not a pass/fail: NEVER-FACED points the next lever at spawn/
  encounter opportunity; FACED-UNFOUGHT at contact; FACED-LOST/FLED
  at combat survivability.
- Do NOT move readyDemand numbers, do NOT flip VETSHAPE or any
  default, do NOT change any src/js default — this arm is diag only.
- Cost bar (diagnostic, reported): starvation totals and median days,
  baseline vs recorder.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare` on
  the corpus; if it throws (known failure on per-seed rows), record
  exactly why and use sweep-compare tables as the comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a
  stuck seed (73675 preferred, else 73674) — judge meaning,
  coherence, relevance, consequences, never just counts: does the
  game ever tell the village a wave-3 monster exists, where it is, or
  how to meet one?

## Instrument

- `scripts/policies/encounter-diag.js` (new recorder, `ENCOUNTER=1`
  gate; daily snapshots + spawn/fieldFight/tbEnd observation).
- `scripts/test-encounter-diag-sweep.js` (sweep + --detgate + --sense
  modes), modeled on `scripts/test-vetkill-diag-sweep.js` (loadGame/
  setupGame/runDays, per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`).
- `scripts/test-encounter-diag.js` (proof test: synthetic
  classification incl. all labels + UNCLASSIFIED cases, wrap purity
  on mock Games, layer gate both ways).
- Corpus: `evidence/2026-10-24/perseed-encounter-a/` (16 rows +
  summary.json).

## RESULTS — DIAG-GO (final corpus: fixed recorder; first sweep superseded, see recorder note)

Sweep: `node scripts/test-encounter-diag-sweep.js` (exit 0).
Corpus: `evidence/2026-10-24/perseed-encounter-a/` (16/16 rows +
summary.json, per-config incremental writes via the chunked writer
subprocess).
G1 det-gate: PASS (seed 73671, ENCOUNTER unset: baseline 93/93 days ==
wrapped 93/93 days, ts counters identical `{"tsNationalDay":83}`, no
`_encounterdiag` surface, no installed wraps; re-run on the final
recorder code, same result).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
261 = 261, same as vetkill; faced-map agreement 8/8, kill-log
agreement 8/8).
G3 corpus integrity: PASS (16/16 rows, all days > 0; every armed row
carries the encounter classification + per-wave encounter/fight/
outcome counts + daily gate trajectory (0 recorder errors on every
armed row, 0 event overflow anywhere); every baseline row carries a
post-run pure-read encounter snapshot and no event lists, as designed).
G4 classification completeness: PASS — all three focus seeds
classified with specific evidenced labels, none UNCLASSIFIED (73676
reported too). Baseline and armed classifications agree on the
snapshot parts (faced/kill/ledger) on all 8 seeds.

### Recorder note — the first sweep was wrong about player fights, and the kill log caught it (read this before the tables)

The FIRST sweep run reported tbFightsW3 = 0 on all 8 seeds — no player
fight against a wave-3+ monster anywhere — while the same corpus's
kill log held 11 wave-3+ kills with via `player`/`companion`, a via
pair that ONLY the tbEnd kill path writes (game.js tbEnd: via
`player` by default, `companion` when the killing blow came from a
party villager; patrol/wild write `patrol`/`wild`, contests write
`contest`). A recorder that misses every player fight while the log
proves player kills is broken, not a finding. Root cause: the tbEnd
wrap checked `Game.tbfight` AFTER delegating, but tbEnd ends with
`this.tbfight = null` — the post-call read always missed. Fix: the
wrap captures the fight OBJECT before delegating and checks
`captured.over` afterwards (scripts/policies/encounter-diag.js, tbEnd
wrap comment). The proof test's mock tbEnd now nulls tbfight like the
real engine, so only the fixed wrap passes it. The full sweep was
RE-RUN on the fixed recorder (det-gate re-run too); the tables below
are the re-run. One label changed between runs: 73677 was FACED-FLED
on the broken run and is FACED-LOST on the fixed run (its single
player fight, day 97 vs spool, ended `lost` — invisible to the broken
wrap). The broken run's other labels survived (73674 NEVER-FACED,
73675 FACED-LOST), and its G2 neutrality result stands, but its tb
counts are void — cite only the re-run for anything player-fight.

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ encounter-diag) |
|---|---|---|
| n | 8 | 8 |
| won | 4 | 4 |
| median days / median gameDays | 150 / 150 | 150 / 150 |
| max days | 180 | 180 |
| national ever / national-or-higher final | 8 / 7 | 8 / 7 |
| table invited ever (tableWaiting) | 5 | 5 |
| table entered (tableDone) | 4 | 4 |
| wave 4 / wave 5 reach | 5 / 0 | 5 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 3 | 3 |
| death total | 261 | 261 (identical breakdown) |
| seat attempts / taken / failed | 4 / 4 / 0 | 4 / 4 / 0 |
| preview seen / not-ready | 17 / 7 | 17 / 7 |
| table answers | 20 | 20 |
| wave-3+ spawns / field fights / tb fights / faced types / kills | snapshot-only (no events) | 58 / 87 / 37 / 37 / 11 |

Baseline and armed agree on EVERY aggregate, and the wall numbers
replicate vetkill exactly (won 4, wave 4 reach 5, wave 5 reach 0) —
this is a re-measurement of the same seeds, and it reproduces them.
(Survived seeds 73674/73675 read days 180 but gameDays 181 in both
arms — the loop-day vs scholar-day off-by-one on survived runs, not a
recorder artifact: G2 passes on gameDays too.)

### Per-seed classification (armed arm, final corpus; detail rows verified by --detail re-runs)

| seed | days | end | wave | w3+ spawns | w3+ field fights | w3+ tb fights | faced types | w3+ kills | label |
|---|---|---|---|---|---|---|---|---|---|
| 73671 | 93 | village-lost | 4 | 2 (both w4) | 1 | 10 | 3 | 2 | FACED-KILLED |
| 73672 | 106 | over-other | 4 | 10 | 17 | 10 | 7 | 4 | FACED-KILLED |
| 73673 | 134 | over-other | 4 | 11 | 12 | 5 | 7 | 2 | FACED-KILLED |
| 73674 | 180 | survived | 2 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED |
| 73675 | 180 | survived | 3 | 11 | 37 | 1 | 6 | 0 | FACED-LOST |
| 73676 | 174 | village-lost | 4 | 15 | 5 | 6 | 6 | 1 | FACED-KILLED |
| 73677 | 98 | over-other | 3 | 3 | 5 | 1 | 3 | 0 | FACED-LOST |
| 73678 | 150 | over-other | 4 | 6 | 10 | 4 | 5 | 2 | FACED-KILLED |

Focus seeds, with evidence quoted (armed arm; baseline snapshot
agrees on faced/kill/ledger):
- **73674 — NEVER-FACED.** 0 wave-3+ spawns, 0 fights, 0 kills, 0
  faced types across 180 days. The wave-3 gate NEVER OPENED: daily
  ledger trajectory max wave-2 points = 1 (a single `heckler` kill,
  perType `{heckler: 1}`), bar = 4, day floor 25 long past. This
  settles the standing99 "points < 5" note precisely: it sat at 1/4,
  not between 4 and 5. The village reached global rank and national
  final without ever opening wave 3 — scale rank is not the blocker
  here; the wave-2 kill ledger is. Its only wave-2 kill in 180 days
  is the whole story.
- **73675 — FACED-LOST.** Gate opened day 84 (first w3 spawn day 85).
  11 spawns, 37 field fights, 1 tb fight, 0 kills. The field ledger:
  1 vDie, 17 vFlee, 19 mFlee, 0 vKill. Detail (--detail 73675,
  census-matched twice): the vDie is day 146, nina_petrova vs
  focus_group, round 1, vHpLeft 0 — the same day she had already fled
  the same monster twice (day 144 vFlee, day 146 vFlee, then vDie).
  The single tb fight is day 140 vs redactor, result `routed`
  (harness watchdog rescue, party somchai_prasert) — the player's
  only wave-3 fight never resolved by combat at all. The village
  fought wave-3 monsters 38 times and killed none of them.
- **73677 — FACED-FLED on the broken run, FACED-LOST on the fixed
  run.** Gate opened day 74 (first w3 spawn day 83). 3 spawns, 5
  field fights (1 vFlee, 4 mFlee), 1 tb fight, 0 kills. Detail
  (--detail 73677, census-matched): the tb fight is day 97 vs spool,
  result `lost`, player-only, no party, arena=false — the day before
  the run ended (day 98, over-other, lesser seat taken). The
  village's last word on wave 3 was a lost duel, not a flight.
- **73676 (extra) — FACED-KILLED.** Consistent with vetkill (1 w3
  kill). 15 spawns, 5 field fights, 6 tb fights (1 won-kill, 4 lost,
  1 routed), 1 kill — the vetkill same-day kill, now with its fight
  row attached.

### (a) Did the village ever FACE a wave-3+ monster?

Yes on 7/8 seeds, no on 73674 — and "faced" is much broader than
"spawned". World spawns total 58 (wave-3+), but fights total 124
(87 field + 37 tb) against only 37 faced types: world monsters
PERSIST and get fought repeatedly (73675's single day-86
chorus_line spawn was fought ~15 times). Conversely, fights happen
WITHOUT world spawns: 73671 fought 3 wave-3 tb fights with ZERO
wave-3 world spawns ever, and 73678's first wave-3 fight (day 57,
field evade vs focus_group) predates its first wave-3 world spawn
(day 67). Feast draws (pendingEncounter → startCombat) and contest
arenas start fights without a world spawn, so spawn counts are a
FLOOR on encounters, not the total. Unfought spawn types (spawned,
never in the deed feed): herald on 73671; eulogy/herald on 73672;
eulogy/algorithm/herald on 73673; buffering on 73675 (spawned day
179, run ended day 180); spool/eulogy/herald/reunion/nielsen/
influencer on 73676; herald/influencer on 73678; none on 73677.

### (b) If faced, what happened — outcome counts (wave-3+ fights only, band totals)

Player tb fights (37): won-kill 10, lost 23, fled 0, routed 4,
won-no-kill 0. The player NEVER fled a wave-3+ fight (tbFled 0/37)
and never drove one off without killing it (tbWonNoKill 0) — player
fights end in a kill, a loss, or a watchdog rout, nothing else.
Villager field fights (87): vKill 0, vDie 6, vFlee 45, mFlee 34,
evade 2. Villagers NEVER killed a wave-3+ monster in the field
(0/87) — every one of the band's 11 wave-3+ kills is a player tb
kill. (One apparent mismatch resolves cleanly: tbWonKill totals 10
but kills total 11 — the eleventh is 73678's day-93 focus_group kill
by nadia_khoury via companion in a fight that ended `routed`, not
`won`; a kill in a routed fight counts in the log but not as a won
fight. No pyrrhic-kill discrepancy remains.)

### (c) Villager participant vs player-only (wave-3+ tb fights)

Across the band, tb fights split 24 player-only / 13 with a villager
party member (73671: 8/2, 73672: 7/3, 73673: 3/2, 73675: 0/1,
73676: 2/4, 73677: 1/0, 73678: 2/2; scholar absent 0 everywhere —
every recorded tb fight had the scholar in it). Field fights are
villager fights by construction (a vid + optional ally; allies
joined in only 2 of 87). The honest limit: fight-to-spawn linkage is
by monster TYPE, not entity instance (world entities carry no stable
instance id), and contest-arena tb fights share tbEnd with wild
fights (arena flag recorded best-effort; all focus-seed tb fights
read arena=false).

### (d) What gates wave-3 appearance on these seeds

The wave-3 rung only (code: game.js unlockedWave): day >= 25 AND
wave-2 ledger points >= 4 (barsPerWave[2], src/data/wave-ledger.json;
kills only, per-type cap 2). Standing gates waves 4-5 only, on top
of this rung. First-gate days (daily trajectory): 73671: 58, 73672:
38, 73673: 90, 73674: NEVER (max pts2 1), 73675: 84, 73676: 100,
73677: 74, 73678: 53. After the gate opens, wave-3 spawns follow
within days (first-spawn minus first-gate: 73675: +1, 73672: +4,
73673: +2, 73677: +9, 73678: +14, 73676: +1; 73671's wave-3 fights
came via non-world paths, so it has no wave-3 spawn day). The gate
is not the problem on 7/8 seeds — it opens and the monsters come.
73674 is the exception, and its exception is the wave-2 ledger, not
the day floor: 1 point in 180 days. The next blank for 73674-class
seeds is therefore wave-2 encounter/kill opportunity, one rung down
— the same recorder with a wave-2 lens, not a wave-3 lever.

### Wall numbers (this run, armed arm = baseline arm)

National ever 8/8, national-or-higher final 7/8, table invited 5/8,
table entered 4/8, wins 4/8 (all lesser seat — the full seat remains
unreached), wave 4 reach 5/8, wave 5 reach 0/8, max arc 4, median
survival 150 days, max 180 days. Death-cause shares: combat 82%
(215/261), starvation 3, expedition 16, monster 11, rest small.
The standing directive stands: wins come only via default-OFF
instruments and the lesser seat; wave 5 still 0.

### What this means for the next lever (finding, not a change made here)

The NEVER-KILLED group is now three different problems, not one:
- **73674 (NEVER-FACED): the lever is wave-2 kill opportunity.**
  One wave-2 kill in 180 days. Nothing about wave 3, veterans,
  demand numbers, or killer survivorship touches this seed — wave 3
  never opened. Next arm: the same recorder aimed at wave 2 (spawns,
  fights, outcomes for wave-2 monsters; what stops the second kill).
- **73675 (FACED-LOST, 38 fights, 0 kills): the lever is wave-3
  combat capability, not opportunity.** Spawns arrive, fights
  happen, nobody kills. Villager field combat vs wave 3 is 0/87
  kills band-wide, and the player's loss rate is 23/37 — the village
  can MEET wave 3 but cannot BLOOD it. Demand numbers are
  irrelevant here too: there is still no kill for any bar to count.
- **73677 (FACED-LOST, 6 fights, 0 kills): same lever as 73675,
  smaller sample.** One lost player duel on the penultimate day;
  the field ledger is all flights and drive-offs.
- The killed seeds (73671/73672/73673/73676/73678) prove the chain
  CAN complete: player tb kills are the only wave-3 kills in the
  band, and they are what the veterans bar counts.

### Sense-testing read (NON-MEASURED replay, seed 73675, armed, narration on)

File: `evidence/2026-10-24/sim-encounter-a-sense.txt` (240-line ring,
days 178–181; outcome class matches the measured run exactly —
survived 180/181, max wave 3, no table — and its own post-run
encounter line reproduces the census classification exactly:
FACED-LOST, 11 spawns, 37 field fights, 1 tb fight, 0 kills).
Judgment — meaning, coherence, relevance, consequences:
- The game DOES tell the village a wave-3 monster exists, and where
  it is — at the very end. Day 179: `Something moves out there —
  Buffering.` / `It followed you. The Buffering is here.` / `The
  Buffering stops at the treeline — pacing, unwilling. The walls end
  the argument. It's still out there.` (repeated day 180). So the
  answer to the brief's sense question is: yes to existence, yes to
  place (at the treeline, outside the walls), NO to method — nothing
  ever says how to meet it, and the fiction's own verdict is that
  the walls end the argument. The monster paces; the village stays
  inside; the run ends with it still out there. That is coherent
  (walls are safety, by design) but it is also a dead end as a
  prompt: the one monster the village is actually told about, in
  the one window we watched, is presented as unmeetable.
- The System's veteran line lands in the same window and lands
  flat, same as vetkill found: day 180, `📺 SYSTEM: "📡 The next
  act is still waiting — blood your fighters (0 of 1 veterans)."`
  Nobody answers it. Nobody forms a plan around it. The same days
  show full pantries, a neighbor begging and being fed, a raid
  carrying off ~1200 kcal, Maya demanding a say in how the village
  runs — a living village with everything except the one thing the
  gate wants, and nothing in the fiction treating that as a crisis.
  (Scope note: the ring covers only days 178–181, so this judgment
  is about the endgame window, not the 38 fights of days 86–177 —
  those fights left no narration in this window to judge.)
- No [needs-eyes] flag: this arm is diag-only and its sense read
  finds a fiction gap (unmeetable monster, unanswered System line),
  not a feel/combat/UI change to playtest. Said explicitly so the
  absence of the flag is a decision, not an oversight.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-encounter-a/summary.json --after <same>
--out /tmp/panel-encounter-attempt`. Result: the compare threw the
SAME error as vetkill-a and earlier runs — `TypeError: Cannot read
properties of undefined (reading 'days')` in
`scripts/lib/balance-scorecard.js` `comparePanels` — and wrote no
output. The panel requires panel-driver output (panel.json.gz with
observer/contract digests and panel records), not per-seed sweep
rows. The sweep-compare tables above are the before/after comparison
for this run, on identical seeds, judged against the pre-registered
bar. (Panel-contract work belongs to the live panel-contract-rulings
lane — not touched.)

### Metric review

- The pre-registered bar worked as written; no mid-run re-scoring.
  G2 as specified (ALL seeds identical on days/gameDays/ts/
  starvation) is the right strength for a recorder with call
  observation — the wraps fired thousands of times (58 spawns, 87
  field fights, 37 tb fights, plus all-wave events) and leaked
  nowhere: identical aggregates, identical death breakdown,
  identical faced/kill snapshots.
- One metric gap found by this run, for the NEXT diag arm: census
  rows carry counts only, not fight rows — the quotable detail
  (which villager died, which fight was lost) needed --detail
  re-runs, verified against the census row before quoting. Future
  diag sweeps should persist the event rows in the corpus (capped,
  wave-3+ only) instead of counts alone.
- "Median days" as a cost bar is uninformative for a pure-read arm
  (150 vs 150 by construction); the informative neutrality proof is
  the per-seed identity (G2) plus the identical classifications.
- The first sweep's tbW3 = 0 is a standing warning for every
  wrap-based recorder: a wrap that reads post-call engine state
  (tbfight, or anything tbEnd clears) silently records nothing.
  Cross-check every wrap against an independent engine source (here:
  the kill log's via values) before trusting a zero.

### Findings outside this arm (reported, NOT touched — for the coordinator)

- **The 1-HP unfinishable monster (combat lane).** On 73675, 73677,
  and 73678, the same wounded entity reappears fight after fight at
  mHpLeft = 1 with rounds = 0 and outcome mFlee (73675's chorus_line
  days 93–156; 73677's chorus_line at 43 HP days 89–95; 73678's spool
  at 1 HP days 82/88). Hypothesis, not a claim: a monster below its
  break threshold flees before the first strike every time, so a
  wounded monster can never be finished in the field. If true, field
  fights systematically leak kills — and it would partly explain
  0/87 villager wave-3 kills. Needs a combat-lane look, not a lever
  change here.
- **A wave-5 appearance without wave-5 unlock (content lane).**
  73676: a nielsen (wave 5, per monsters.json) world-spawned day 141
  while waveReach stayed 4, and was never fought (unfought). The
  recorder cannot distinguish a fresh pool spawn from a tbEnd
  put-back (game.js:43365 pushes lingerers back into the world) —
  reported as an appearance, not an unlock, and not chased here.
- **Fights without spawns (encounter lane).** 73671's wave-3 fights
  and 73678's day-57 evade happened with no prior wave-3 world
  spawn; feast draws and contest arenas bypass world spawning. Any
  future "spawn opportunity" lever must count those paths, or it
  will undercount encounters.
- **Routed-fight kills (measurement lane).** 73678's day-93
  focus_group kill happened in a fight that ended `routed`
  (harness watchdog), not `won`. Won-fight counts undercount kills
  by routed fights; future kill accounting should join kills to
  fights by (mid, day) across all results, not won-only.

### Next arm (precise, documented — no game-code change made here)

**Wave-2 encounter/kill opportunity on 73674-class seeds, then
wave-3 combat capability on 73675-class seeds — in that order,
separate arms.** Numbers: 73674: wave-2 ledger 1/4 after 180 days
(single heckler kill); 73675: 38 wave-3 fights, 0 kills, 1 villager
death; band: villager field kills 0/87, player tb loss rate 23/37,
player fled 0/37. Mechanism to test, in order:
1. Run the SAME recorder with a wave-2 lens on 73674 (and fresh
   seeds that stall at wave 2): wave-2 spawns, fights, outcomes per
   seed — is the second wave-2 kill missing for lack of spawns,
   lack of fights, or lost fights? Do NOT propose wave-3 levers for
   a seed whose wave-3 gate never opened.
2. For 73675-class seeds, the lever is combat capability (why
   villagers never kill wave-3 in the field, why the player loses
   23/37) — including the 1-HP unfinishable-monster hypothesis
   above, which the combat lane should rule in or out first.
3. Do NOT move readyDemand numbers on this evidence: the
   NEVER-FACED seed has no kill for any demand shape to count, and
   the FACED-LOST seeds' problem is killing, not the number 1.

### Convergence state

Axis scale-onramp: this arm DIAG-GOs as a measurement (G1/G2/G3/G4
all PASS on the fixed recorder, classifications on 8/8 seeds,
baseline-armed agreement on every aggregate and every snapshot),
and the THING measured is now DECOMPOSED one level deeper than
vetkill: the NEVER-KILLED group is NEVER-FACED on 73674 (wave-2
ledger 1/4, gate never opened), FACED-LOST on 73675 (38 fights, 0
kills) and 73677 (6 fights, 0 kills, last fight a lost player duel).
Wave 5 remains 0/8, the full seat remains unreached, and the
standing directive stands — the wall now has three named keys
(wave-2 opportunity for the never-faced, wave-3 combat capability
for the faced-lost, killer survivorship / demand shape for the
killed-dead), and the next arms are specified above. No default
flips; no src/js changes; the recorder is a new default-OFF policy
instrument (plus its fixed tbEnd wrap).

