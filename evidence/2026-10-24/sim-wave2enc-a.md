# sim-wave2enc-a — the wave-2 encounter/kill-opportunity blank (axis scale-onramp)

Run: fleshout-20261025T0205Z (coordinator-assigned arm sim-wave2enc-a).
Worktree: `~/workspace/worktrees/sim-wave2enc-a` (branch sim-wave2enc-a).
Axis: scale-onramp (standing directive — still stands: wins only via
default-OFF instruments, lesser seat only, wave 5 still 0 on the band).

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (wave 2: 15 monsters, day 7+
  in fiction; wave-3 rung: day 25 + 4 wave-2 LEDGER points, kills only,
  1 point per kill, 2 per counter-kill, 2-point per-type cap;
  src/data/wave-ledger.json barsPerWave {1:5, 2:4}, wave2DayFloor 8),
  docs/MEASUREMENT.md §§9-12, 14-15 (pilot gate, death-aware horizons,
  pre-registration, metric binding, balanced panels).
- Code authority: src/js/game.js `unlockedWave()` (wave-3 rung is the
  day floor + wave-2 ledger rung; standing gates only waves 4-5);
  src/js/waveLedger.js `scoreLedgerKill` / `waveLedgerPoints` /
  `ledgerState` (per-type cap 2, counter bonus, ledger lives on state
  and survives scholar death); `checkEncounter()` (tile-entry spawns
  from monsterWavePool, 60%-newest ratios); `spawnWorldMonster()`
  (world-monster entities carry their own wave); `recordDeedFight()`
  (deed feed wavesFaced records only that a fight STARTED, never its
  outcome); `fieldFight()` (outcomes evade/vKill/mFlee/vFlee/vDie
  returned to callers, never logged centrally); `tbEnd(result)` (the
  player-fight settle choke point; tbEnd ends with `this.tbfight =
  null`, so any wrap MUST capture the fight OBJECT before delegating
  — the encounter-a lesson, re-applied here and cross-checked against
  the kill log's player/companion via values before any zero is
  trusted).
- Prior run: evidence/2026-10-24/sim-encounter-a.md (seeds 73671-73678,
  tableseat-nowait substrate): seed 73674 NEVER-FACED wave 3 in 180
  days — its wave-2 kill ledger sat at 1 point (a single heckler kill)
  vs the wave-3 gate bar of 4, day floor 25 long past. This arm answers:
  why does a 73674-class seed never get its second wave-2 kill —
  missing spawns, missing fights, or lost fights?

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait — leanlinkrescue courtship
  (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no wait
  leg. Seeds: 73671-73678 — the SAME band as standing99/vetkill/
  encounter-a, reuse intentional: a re-measurement of those seeds
  with a new recorder, not a fresh band.
- Baseline: tableseat-nowait, `WAVE2ENC` unset. Own baseline
  replication (8), NOT another arm's corpus.
- Armed: tableseat-nowait wrapped with scripts/policies/wave2enc-diag.js
  (`WAVE2ENC=1`). The recorder is observational only: wave-2 spawns,
  fights, outcomes per seed, daily wave-2 ledger points + per-type
  breakdown + gate trajectory. It NEVER calls unlockedWave() /
  villageStandingTotal() mid-run, never writes game state, draws no
  RNG, never throws into the engine (recording errors counted).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Seed labels (fixed before sweeping; priority GATE-OPEN >
  KILLED-BELOW-BAR > NEVER-SPAWNED > SPAWNED-UNFOUGHT > FOUGHT-LOST >
  FOUGHT-FLED > FOUGHT-DROVE-OFF):
  GATE-OPEN (end pts2 >= bar 4 and day floor passed — the wave-3 gate
  opened; no wave-2 stall); KILLED-BELOW-BAR (wave-2 kills exist but
  end pts2 < 4 — the stall is kill count / breadth / cap, not
  opportunity); NEVER-SPAWNED (no wave-2 spawn, fight, or kill);
  SPAWNED-UNFOUGHT (wave-2 spawn exists, no wave-2 fight started);
  FOUGHT-LOST (a wave-2 fight ended tb lost, or field vDie);
  FOUGHT-FLED (a wave-2 fight ended tb fled/routed, or field vFlee,
  and no LOST fight — LOST outranks FLED); FOUGHT-DROVE-OFF (wave-2
  fights happened, none lost/fled, at least one ended tb won-no-kill
  or field mFlee/evade); UNCLASSIFIED (a wave-2 fight in the deed
  feed with no explaining fight row, or a fight row with no outcome
  — never guessed).
- DIAG-GO requires ALL of:
  1. G1 det-gate: recorder unset == unwrapped tableseat-nowait on one
     seed (days/gameDays/ts identical, no recorder surface, no
     installed wraps);
  2. G2 neutrality: baseline vs recorder identical on
     days/gameDays/ts/starvation on all 8 seeds;
  3. G3 corpus integrity: 16/16 rows in
     evidence/2026-10-24/perseed-wave2enc-a/ + summary.json, every
     armed row carrying wave-2 spawns/fights/outcomes EVENT ROWS
     (capped, wave-2 only — counts alone are NOT enough) + ledger
     trajectory, every baseline row carrying a post-run pure-read
     snapshot (no event lists, by construction);
  4. G4 classification completeness: EACH seed classified with a
     specific evidenced label (not UNCLASSIFIED), with focus seed
     73674 classified specifically.
- The classification verdict itself (which label wins) is a FINDING,
  not a pass/fail: NEVER-SPAWNED points the next lever at spawn /
  encounter opportunity; SPAWNED-UNFOUGHT at contact; FOUGHT-LOST/FLED
  at combat survivability; KILLED-BELOW-BAR at kill breadth / the
  per-type cap / counter discovery.
- Do NOT move readyDemand numbers, do NOT flip VETSHAPE or any
  default, do NOT change any src/js default — this arm is diag only.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare` on
  the corpus; if it throws, record exactly why and use sweep-compare
  tables as the comparison.
- Sense-testing law: one NON-MEASURED narration-on replay of a stuck
  seed (73674 preferred) — judge whether the game ever tells the
  village how to meet a wave-2 monster, in plain words.
- No [needs-eyes] flag expected: diag-only work, no feel/combat/UI
  change to playtest. Said explicitly if omitted, so the absence is a
  decision, not an oversight.

## Instrument

- `scripts/policies/wave2enc-diag.js` (new recorder, `WAVE2ENC=1`
  gate; daily ledger snapshots + spawn/fieldFight/tbEnd observation,
  tbEnd fight object captured BEFORE delegating).
- `scripts/test-wave2enc-diag-sweep.js` (sweep + --detgate + --detail +
  --sense modes), modeled on `scripts/test-encounter-diag-sweep.js`.
- `scripts/test-wave2enc-diag.js` (proof test: synthetic classification
  incl. all labels + UNCLASSIFIED cases, wrap purity on mock Games
  whose tbEnd nulls tbfight like the real engine, layer gate both
  ways).
- Corpus: `evidence/2026-10-24/perseed-wave2enc-a/` (16 rows +
  summary.json).

## RESULTS — DIAG-GO (G1/G2/G3/G4 + kill-log cross-check all pass)

Sweep: `node scripts/test-wave2enc-diag-sweep.js` (exit 0 on the
resumed run; see resume note), det-gate
`node scripts/test-wave2enc-diag-sweep.js --detgate` (PASS),
proof `node scripts/test-wave2enc-diag.js` (16 checks pass),
detail `node scripts/test-wave2enc-diag-sweep.js --detail 73674`
(censusMatch=true), sense `--sense 73674` (reproduces the census
exactly — see sense read below).
Corpus: `evidence/2026-10-24/perseed-wave2enc-a/` (16/16 rows +
summary.json, per-config incremental writes via the chunked writer
subprocess; every armed row carries wave-2 EVENT ROWS + the ledger
trajectory, not counts alone).
G1 det-gate: PASS (seed 73671, WAVE2ENC unset: baseline 93/93 days ==
wrapped 93/93 days, ts counters identical `{"tsNationalDay":83}`, no
`_wave2encdiag` surface, no installed wraps).
G2 recorder neutrality: PASS (8/8 seeds identical on days/gameDays/ts
counters/starvation — and the death-cause breakdown is identical too,
261 = 261, same as vetkill/encounter-a; faced-map agreement 8/8,
kill-log agreement 8/8).
G3 corpus integrity: PASS (16/16 rows, all days > 0; every armed row
carries the wave-2 classification + wave-2 event rows
(spawns/fieldFights/tbFights, wave-2 only) + dailyGateW2 trajectory
(0 recorder errors on every armed row, 0 event overflow anywhere);
every baseline row carries a post-run pure-read wave-2 snapshot and
no event lists, as designed).
G4 classification completeness: PASS — all 8 seeds classified with
specific evidenced labels, none UNCLASSIFIED, focus seed 73674
classified specifically (KILLED-BELOW-BAR). The tb kill-log
cross-check passes on all 8 armed rows: no player/companion-via
wave-2 kill exists without a recorded tb fight (the encounter-a
tbEnd trap, re-checked, not re-sprung).

### Resume note — the first sweep died mid-armed-arm, the corpus did not

The first full sweep died during armed seed 73675 (after baseline
8/8 + armed 73671-73674): its stdout had been redirected to
`/tmp/wave2enc-sweep.log`, a sibling cleanup wiped /tmp mid-run, and
the sweep session ended with it. The corpus rows on disk survived
untouched. Recovery, no re-runs of completed seeds: the sweep gained
`PIDS=` (arm subset) and a `--resummarize` mode that rebuilds
summary.json from the rows on disk; the remaining armed seeds ran
as `PIDS=armed SEEDS=73675,73676,73677,73678`, then `--resummarize`
recomputed all four gates over the full 16-row corpus. Lesson
carried forward: never redirect a sweep's log to /tmp — the runtime
captures process output, and /tmp is sibling-cleanup territory.

### Sweep-compare table (the panel substitute — see panel note below)

| metric | baseline (tableseat-nowait) | armed (+ wave2enc-diag) |
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
| wave-2 spawns / field fights / tb fights / faced types / kills | snapshot-only (no events) | 78 / 358 / 31 / 73 / 53 |

Baseline and armed agree on EVERY aggregate, and the wall numbers
replicate encounter-a exactly (won 4, wave 4 reach 5, wave 5 reach 0)
— this is a re-measurement of the same seeds, and it reproduces them.
(Survived seeds 73674/73675 read days 180 but gameDays 181 in both
arms — the loop-day vs scholar-day off-by-one on survived runs, not
a recorder artifact: G2 passes on gameDays too.)

### Per-seed classification (armed arm)

| seed | days | end | wave | w2 spawns | w2 field fights | w2 tb fights | faced types | w2 kills | end pts2 | label |
|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 93 | village-lost | 4 | 5 | 12 | 4 | 6 | 6 | 6 | GATE-OPEN |
| 73672 | 106 | over-other | 4 | 10 | 49 | 3 | 10 | 9 | 11 | GATE-OPEN |
| 73673 | 134 | over-other | 4 | 9 | 70 | 5 | 11 | 5 | 7 | GATE-OPEN |
| 73674 | 180 | survived | 2 | 10 | 59 | 1 | 6 | 1 | 1 | KILLED-BELOW-BAR |
| 73675 | 180 | survived | 3 | 15 | 63 | 6 | 14 | 11 | 12 | GATE-OPEN |
| 73676 | 174 | village-lost | 4 | 10 | 20 | 1 | 10 | 5 | 6 | GATE-OPEN |
| 73677 | 98 | over-other | 3 | 8 | 29 | 2 | 10 | 4 | 5 | GATE-OPEN |
| 73678 | 150 | over-other | 4 | 11 | 56 | 9 | 6 | 12 | 8 | GATE-OPEN |

First-gate days (daily trajectory): 73671: 58, 73672: 38, 73673: 90,
73674: NEVER, 73675: 84, 73676: 100, 73677: 74, 73678: 53 — matching
encounter-a's wave-3 gate days exactly, as they must (same ledger).

### The answer to the brief's question — 73674-class seeds: LOST FIGHTS, specifically fled fights

73674 is KILLED-BELOW-BAR, and the stall is NOT missing spawns and
NOT missing fights and NOT lost fights in the dying sense:

- Spawns exist: 10 wave-2 world spawns (paparazzo d47, understudy
  d69, paparazzo d88, heckler d89, voice_mimic_radio d116,
  statickite d117, warranty_caller d125, voice_mimic_radio d144,
  understudy d165, heckler d174). First spawn d47 is late vs the
  band (13-45) and first fight d73 later still — contact is slow,
  but it is not absent: from d73 the village fights wave-2 monsters
  60 times.
- Fights exist: 59 field fights + 1 tb fight, 6 faced types
  (understudy, paparazzo, heckler, statickite, voice_mimic_radio,
  bright_idea). The one unfought spawned type is warranty_caller
  (spawned d125, never in the deed feed) — a footnote, not the story.
- The village does not die in these fights: field outcomes are
  vKill 1, vDie 0, vFlee 2, mFlee 49, evade 7. Nobody dies; twice a
  villager flees; 49 times the MONSTER flees. The single kill is
  day 92, elena_petrova vs heckler, field vKill, via wild,
  trick null — the encounter-a heckler point, now with its fight row.
- The flee pattern is the mechanism, in the recorded rows: 30 of the
  49 mFlee rows end with the monster at exactly 1 HP, 43 of 49 with
  mHpLeft <= 7 (band-wide: 139 of 260 mFlee rows at exactly 1 HP,
  225 of 260 at <= 7 HP). The monster is beaten to a sliver and then
  leaves instead of dying — the killing blow never lands. The known
  mFlee producers in src/js/fieldFights.js are the bow-volley
  drive-off ("it broke before it ever closed") and the pack break
  line; the recorder rows are consistent with drive-offs at the
  break line, and the detail re-run reproduces the census exactly
  (censusMatch=true), so these rows describe the same trajectory,
  not a different run.
- The player's only wave-2 fight on 73674 is day 181 vs bright_idea,
  result `routed` (watchdog rescue, player-only, arena=false) — the
  scholar never fought a wave-2 monster to a combat conclusion in
  180 days. Player tb fights band-wide convert: 26 won-kill of 31
  tb fights (lost 2, routed 3, fled 0, won-no-kill 0). Villager
  field fights band-wide do not: 27 vKill of 358 field fights
  (vDie 1, vFlee 39, mFlee 260, evade 31). The conversion leak is
  villager field combat, not player combat and not opportunity.
- Ledger trajectory (73674): pts2 0 from day 2, pts2 1 from day 93
  (perType {heckler: 1}), never moving again through day 180. No
  counter-kill bonus anywhere on this seed (the one kill carries
  trick null); the cap is not the binding constraint here — with 1
  kill in 1 type, breadth and cap are both untested, because the
  second kill never happens.
- Breadth/cap evidence from the GATE-OPEN seeds (observed, not a
  change): counter kills do pay when they happen (73672: 1
  understudy kill → 2 points; 73673: 1 understudy kill → 2 points,
  1 memory_projector kill → 2 points), and the cap does eat repeat
  kills (73678: 5 understudy kills → 2 points, 3 giant_mosquito
  kills → 2 points). A 73674 that killed twice in two types would
  still need two more points — the bar needs breadth AND conversion.

So the precise next blank is: **villager field-fight kill conversion
against wave-2 monsters — why a monster at 1 HP flees instead of
dying, and what (pursuit, a finishing blow, a hold, a no-flee
condition) would convert drive-offs into kills.** Spawn opportunity,
contact, and villager survivability are all ruled OUT on this seed
by the rows above. A spawn lever would add fights that also end in
flight; a survivability lever would protect villagers who already
do not die.

### Wall numbers (this run, armed arm = baseline arm)

National ever 8/8, national-or-higher final 7/8, table invited 5/8,
table entered 4/8, wins 4/8 (all lesser seat — the full seat remains
unreached), wave 4 reach 5/8, wave 5 reach 0/8, max arc 4, median
survival 150 days, max 180 days. Death-cause shares: combat 82%
(215/261, same as encounter-a), starvation 3, expedition 16, monster
11, rest small. The standing directive stands: wins come only via
default-OFF instruments and the lesser seat; wave 5 still 0.

### Sense-testing read (NON-MEASURED replay, seed 73674, armed, narration on)

File: `evidence/2026-10-24/sim-wave2enc-a-sense.txt` (240-line ring,
days 178–181; outcome class matches the measured run exactly —
survived 180/181, max wave 2, no table — and its own post-run wave-2
line reproduces the census classification exactly: KILLED-BELOW-BAR,
10 spawns, 59 field fights, 1 tb fight, 1 kill).
Judgment — meaning, coherence, relevance, consequences:
- The game does NOT tell the village how to meet a wave-2 monster in
  this window — it does not even name one. No wave-2 monster name,
  no ledger line ("1 of 4"), no "meet it here" beat appears in days
  178–181. The only wave-adjacent lines are generic: the System's
  veteran line, day 179, `📺 SYSTEM: "📡 The next act is still
  waiting. Stand ready to fight it — blood your fighters (0 of 1
  veterans)."` (a wave-3+ veteran demand, not a wave-2 prompt, and
  nobody answers it), and the contest's repeated "wave-appropriate
  beast" formula, which names no beast and no place. So the answer
  to the brief's sense question is: NO to existence, NO to place,
  NO to method, in this window. (Scope note: the ring covers only
  days 178–181, so this judgment is about the endgame window, not
  the 59 fights of days 73–177 — those fights left no narration in
  this window to judge.)
- The village itself reads alive, not robotic, in the same window:
  Raj leaves branches by the stash with no announcement ("That's
  how it works here"), Aisha weeps openly over a 2,079-kcal gift to
  Thornfield ("The fire network. That's what it's FOR"), riders
  bring word that the village is called the Feared out there. The
  blank is not villager lifelessness — it is that nothing in the
  fiction treats the missing wave-2 kills as a problem anyone owns.
- No [needs-eyes] flag: this arm is diag-only and its sense read
  finds a fiction gap (unnamed, unprompted wave-2 monsters), not a
  feel/combat/UI change to playtest. Said explicitly so the absence
  of the flag is a decision, not an oversight.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-wave2enc-a/summary.json --after <same>
--out /tmp/panel-wave2enc-attempt`. Result: the compare threw the
SAME error as vetkill-a and encounter-a — `TypeError: Cannot read
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
  observation — the wraps fired 467 times on the armed arm (78
  spawns, 358 field fights, 31 tb fights) and leaked nowhere:
  identical aggregates, identical death breakdown, identical
  faced/kill snapshots.
- The event-rows-in-corpus requirement paid off directly: the 1-HP
  flee pattern (30/49 on 73674, 139/260 band-wide) is visible ONLY
  in the rows (mHpLeft per fight); counts alone would have shown
  "49 mFlee" and forced another re-run to ask "at what HP?". Future
  diag arms should keep persisting rows.
- "Median days" as a cost bar is uninformative for a pure-read arm
  (150 vs 150 by construction); the informative neutrality proof is
  the per-seed identity (G2) plus the identical classifications.
- One metric gap for the NEXT diag arm: the recorder does not
  capture WHY a given mFlee row fled (volley drive-off vs break-line
  vs trick) — the fight record's log lines would say, but the rows
  carry outcome + HP only. The conversion arm should record the
  deciding log line (or the volley/break flags) per mFlee row.

### Findings outside this arm (NOT chased — stay on axis)

- 73674's first wave-2 spawn is day 47 and first fight day 73,
  vs band first-spawn days 13–45: contact lateness is a secondary
  observation, not the stall (59 fights still followed). A spawn-
  timing arm could ask why 73674's pool stays wave-1 so long, but
  it is not the next blank — the fights already happen.
- 73678's facedW2 is only 6 types while its kills span 4 types and
  12 kills: faced-type counts understate kill breadth where the
  same types are killed repeatedly (cap waste: 5 understudy kills
  → 2 points). A breadth arm should measure kills-by-type, not
  faced-types, against the cap.
- The sense window's veteran line (0 of 1 veterans, day 179) lands
  flat on a village that has never bloodied a wave-3 monster either
  — the same unanswered-System-line pattern vetkill and encounter-a
  found. Fiction-prompt work, not a lever change here.
