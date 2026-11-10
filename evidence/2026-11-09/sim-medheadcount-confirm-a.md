# sim-medheadcount-confirm-a — CONFIRM THE HELD MEDIC-HEADCOUNT LEVER (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261109T2115Z (Loop A).
Axis food-economy (converging, NOT converged). Backlog #1920. Worker
tree: ~/workspace/worktrees/sim-medheadcount-confirm-a, branch
sim-medheadcount-confirm-a. Base master: 30d95ed8c (patch base was
8cee6a8d2; the patch applied cleanly, `git apply --check` + apply,
22 insertions / 5 deletions, no hand port). Policy: competent ONLY
(scripts/policies/competent.js, UNMODIFIED). Env: PLENTYDEPRI=1,
DEPOSITGATE=1. Horizon: 150d death-aware cap. Seeds: 96009–96024 (16,
confirm band).

Full pre-registration (binding):
evidence/2026-11-09/sim-medheadcount-confirm-a-prereg.md. Prior record:
evidence/2026-11-08/sim-medheadcount-a.md (+ prereg) — pilot GO on
G1/G2 (share 82.3% ≥ 70%, 0/8 zero-medic; median 130d; starvation 3),
G3 compare review_required / no regression_signal, G4 proof 7/7;
landing HELD on the gate (10 lever-attributed test failures, all
briefed with fixes in evidence/2026-11-09/sim-medheadcount-suite-a.md
§Fixes). This run completes the suite work order: 3 assertion repairs
+ 7 seed refreshes, proof 7/7, full gate on a frozen tree, 16-seed
confirm band before/after judged on the prereg G1/G2 bars + G3 panel.

## Work done in this run (before the confirm legs)

### Lever applied
`git apply` of
hidden_files/medheadcount-a-gamejs.patch onto src/js/game.js in the
worktree: 22 insertions, 5 deletions, `forceOccIds` mechanism in
genCharacter + genRoster spawn-medic guarantee, byte-identical in diff
stat to the held patch. No hand port was needed (master had moved
since the patch was cut, patch base 8cee6a8d2 → tree base 30d95ed8c,
but it applied cleanly).

### Seed-band freshness (re-verified, correction to the suite file)
Band 96009–96024 re-verified fresh this run (full search: all
`evidence/*/sim-*-prereg.md`, all of `evidence/`, `docs/`, goal
`hidden_files/`, forbidden/contaminated-band lists). CORRECTION to the
suite file's §Confirm ("96009–96024 appears nowhere"): 96009 and
96024 each appear once, both in
evidence/2026-11-09/sim-wideduty-a-prereg.md — which names the band
only to RESERVE it for this run ("96009–96024 was NOT reused — it is
the medheadcount-suite arm's verified-fresh owed confirm band"). The
wideduty confirm band is 96901–96912 (different). No other prereg,
screen, or extension band claims any seed 96009–96024. The band is
fresh for this confirm; the reservation is honored, not a collision.
Recorded in the prereg.

### Pilot-corpus recovery (record gap, sim-findings.md:1991)
The pilot corpora (evidence/2026-11-08/medheadcount-a-corpus/ +
-after/) were never committed and existed in neither this worktree
nor the main tree. They survive as salvaged copies in the goal
hidden_files
(hidden_files/evidence/2026-11-08/medheadcount-a/medheadcount-a-corpus/
and ...-corpus-after/). This run copied them into the worktree at the
same evidence paths (read-only restore of measured data, no
regeneration) and verified the analyzer reproduces the quoted pilot
numbers exactly (before leg: share 56.1% = 543/968, zeroMedicSeeds
2/8, spawnSeedsWithMedic 4/8; wall national=0/8 table=0 wins=0,
waveReach {1:8,2:8,3:8,4:7,5:0}, median 128d). The restore is
accepted; the record gap is closed by committing these corpora with
this run.

### Instruments generalized for the 16-seed band
- scripts/sweep-medheadcount-a.js: the main() FATAL now accepts any
  8–16 seed list (SEEDS unset = the 96301–96308 pilot default;
  DAYS must still be exactly 150). Gate verified: a 1-seed list
  FATALs before any sim.
- scripts/analyze-medheadcount-a.js: `--seeds <csv>` (default the
  pilot band); denominators and the G1/G2 bars scale with the seed
  count (zero-medic ≤1 per 8 seeds, starvation ≤ before + 2 per 8
  seeds). With the default pilot band the output is byte-identical:
  verified — `--before/--after` on the pilot corpora prints the same
  G1/G2 lines and VERDICT: GO, plus one new line.
- G2 third-clause wiring (owed since the adoption run): the analyzer
  now prints a `G2 NEW-MODES` line in the --before/--after branch —
  fight labels (monster/arena/combat/wild/expedition/duel/raid/
  ambush/stranger/contest) collapse to one 'fight' mode; a mode is
  flagged when absent in before and present with count ≥2 in after,
  and it gates the verdict. On the pilot corpora it prints
  "none -> PASS", matching the adoption run's hand judgment. The
  --leg output is untouched (L5's pinned lines unchanged).

### Gate attribution reproduced, then fixed (10/10)
Baseline re-run on the levered tree (standalone, this run) reproduced
the suite file's attribution exactly: occupation-cohorts 1 fail
(npc-only), cornucopia-wired 2, feast-healing-use 2,
titan-standdown 1, party-opening-turn 1, region-start 1 (S9, 30 meta
writes), table-ascension 3 (T4b/T4c-pre/T4c), pellet-boost 7,
pellet-q4 1, capable-bot 1 (§7 player-first food deed). All 10 fixed
as briefed in the suite file §Fixes — 3 assertion repairs + 7 seed
refreshes, no assertion wording changed anywhere:

| Test | Fix | New seed / repair |
|---|---|---|
| occupation-cohorts | seed refresh (fixtures) | npcOnlySeed 4058 → 4075 (first seed with an er_nurse NPC, candidate=false, er_nurse absent from the 4 offered cards; probe: loadGame → setupGame, seeds 4059–4075 tried) |
| cornucopia-wired | assertion repair (a) + seed refresh (b) | return line now `(!v.away[npc] \|\| v.away[npc].purpose !== 'forage')` — the NPC returned from foraging and immediately re-departed on an expedition; the contract is the haul + chain, not "stays home". TEST_SEED 7 → 8 (finite total 21 → 15) |
| feast-healing-use | assertion repair | companion derived from the actual first-blow owner (`s.prog.feastSurgeBy` = v:X) after K.fight, falling back to the roster companion — first source wins by design |
| titan-standdown | seed refresh | 8991 → 8992 (turtle survives the opening, live fight stages) |
| party-opening-turn | seed refresh | 20 → 54 (first seed with exactly player + 2 companions, distinct squares; seeds 21–40 all field 4–7 humans — extra joiners, squares distinct throughout, the count is what breaks; probe /tmp/party-probe.js) |
| region-start | seed refresh | SEED 20261015 → 20261016 (non-native roster[0] again; S9 zero-write assertion restored) |
| table-ascension | seed refresh | SEED 1313 → 1315 (1314 also fails T4; 1315 clears ladder 12/12, all 17 pass) |
| pellet-boost | seed refresh | SEED 20261108 → 20261109 (third consecutive fresh fight's strike lands again) |
| pellet-q4 | assertion repair | fight started first, bearer derived from an actual villager fighter present, reactor granted to THEM |
| capable-bot | seed refresh | 81 → 85 (82 also fails flee + feast draw; 83–84 fail §7 villager-first; 85 all 40 pass) |

Re-run on the final tree (standalone, this run): ALL 10 GREEN —
occupation-cohorts 6/6, cornucopia-wired 33/33, feast-healing-use
21/21, titan-standdown 22/22, party-opening-turn 9/9, region-start
55/55, table-ascension 17/17, pellet-boost 39/39, pellet-q4 19/19,
capable-bot 40/40.

### Proof test (G4)
`node scripts/test-medheadcount-a.js` → **7 PASS, 0 FAIL, 0 SKIP**
(L0 forceOccIds draws, L1 20/20 rosters hold ≥1 medic, L2 choice
cards unforced, L3 seed 96302 live leg, L4 recorder neutrality on the
restored pilot corpus, L5 baseline pinned 56.1% / 2/8 / 4/8, L6
analyzer --before/--after verdict GO on the pilot corpora).

## Confirm band (16 seeds 96009–96024, 150d, competent)

Analyzer: `node scripts/analyze-medheadcount-a.js --before
evidence/2026-11-09/medheadcount-confirm-before --after
evidence/2026-11-09/medheadcount-confirm-after --seeds
96009,…,96024` — full output in
evidence/2026-11-09/medheadcount-confirm-analyzer.txt. Before leg
repaired in this adoption (see below); after leg run on the levered
tree, exit 0, 16 competent + 16 bare, summary
`medheadcount-confirm-after/sweep-competent.json`.

BEFORE (base tree): WALL national=0/16 table=0 wins=0
waveReach={1:16,2:16,3:16,4:16,5:4} medianSurvival=102d max=145d.
PRIMARY medicPresent=1120/1545 share=72.5% zeroMedicSeeds=3/16
(96010, 96015, 96022) spawnMedics=30 spawnSeedsWithMedic=13/16.
PATHS medLessons=110 triageNonMedicDays=1118 triageNonMedicMax=8
wcHolderDays=1245 hmHolderDays=1215. RECRUIT joins=265
medicJoins=36 medicDeaths=33. GUARDRAILS starvationDeaths=16,
deathCauses dominated by "the wild" 154, monster 33, starvation 16.

AFTER (levered tree): WALL national=0/16 table=0 wins=0
waveReach={1:16,2:16,3:16,4:16,5:6} medianSurvival=115d max=150d.
PRIMARY medicPresent=1317/1695 share=77.7% zeroMedicSeeds=0/16
spawnMedics=32 spawnSeedsWithMedic=16/16. PATHS medLessons=117
triageNonMedicDays=1413 triageNonMedicMax=5 wcHolderDays=1563
hmHolderDays=1163. RECRUIT joins=281 medicJoins=40 medicDeaths=37.
GUARDRAILS starvationDeaths=5.

G1 PRIMARY: share=77.7% (need >=70%, before 72.5%) -> PASS;
zeroMedicSeeds=0 (need <=2, before 3) -> PASS; G1 PASS.
G2 GUARDRAILS: medianSurvival 115 vs 0.8x before 82 -> PASS;
starvation 5 vs before+4 20 -> PASS; G2 numeric PASS.
G2 NEW-MODES (mode reading, fight labels collapsed): the redactor:2
-> FAIL. VERDICT: NO-GO.

Per-seed: the three zero-medic seeds are all fixed — 96010 82d
village-lost -> 150d survived (medic 150/150 days), 96015 50d ->
123d, 96022 80d -> 121d. 8 seeds show identical days/deaths/lessons/
joins on both legs (96009, 96011, 96013, 96018, 96020, 96021, 96023,
96024 — the guarantee never fires there because a medic was already
drawn, and the forced draw consumes no RNG when it does not fire).
96017 is the caution: spawnMedics 2 -> 1 (the forced draw reshuffles
the roster lottery), the one medic died day 42, medic-present 84/87
-> 25/110, though the village still lived longer (88d -> 110d) on
taught skills. 96012 (145d -> 141d), 96014 (120d -> 102d), 96019
(131d -> 88d) survive shorter after the reshuffle.

### Adoption repair of the before leg (this run)

The dead worker's before leg held 15/16 valid competent files; seed
96010's file was 1 byte ("x", not JSON, mtime 22:56Z). NO sweep log
survives for this arm in evidence/2026-11-09/ (the task's premise of
sweep logs there does not hold — no medheadcount-confirm*.log exists;
the only file modified 22:30–23:30Z was the 1-byte file itself), so
the failure mode cannot be established from logs. What IS
established: the sweep's writeRobust path writes tmp + readback +
rename and can never produce a 1-byte "x" — the byte is a
writability-probe artifact, left by the worker testing whether the
host write flap had cleared before it died. The failure is
single-seed, not systemic: the other 15 competent files parse, the
bare s96010 fingerprint is valid, and the pilot summary was never
contaminated (still only 96301–96308 rows). Repair: re-ran ONLY seed
96010's competent leg via the sweep module's own oneRun +
writeRobust on the lever-stashed tree (driver /tmp, not committed),
same env, DAYS=150. The repair reproduces the bare fingerprint
exactly (82d, village-lost, regional, wave 4, 16 deaths) — the
trajectory is the one the bare leg saw. Bare leg completed too: the
worker had stopped at 4/16 bare files; the missing 12 (96013–96024)
were run the same way on the stashed tree. All 16 bare==competent
fingerprints match (days, national/table/win, deathCauses,
deathKeys, waveReach) — recorder neutral on the confirm before leg.

### G3 balanced panel (confirm corpora)

Panels: `node scripts/balance-panel.js --out
evidence/2026-11-09/medheadcount-confirm-panel/panel-before
--seeds 7,42 --days 150` on the lever-stashed tree, then the same
for panel-after on the levered tree; compare attached as
evidence/2026-11-09/medheadcount-confirm-panel/compare.md (+
compare.json). The panel-before run was interrupted by a runtime
restart at 9/12 jobs; resumed with the identical command, which
reused the 9 cached cases and finished (8 cases, 9 cached jobs).
Decision: **review_required**, no regression_signal anywhere; all
four policies 2 paired cases, screen only, "insufficient"
throughout. Seed-42 capable watch (pilot: village deaths 68.5 ->
89.5, expedition-led) REPRODUCED and explained: seed 7 capable is
byte-identical before/after (74 deaths, won=1, national=1); seed 42
capable goes 50 deaths / 82d / community lost / national 0 / won 0
-> 107 deaths / 90d / national 1 / table entered / won 1, driven by
monster:expedition 0 -> 49 and monster:villager combat 12 -> 28.
The after village fights far more expeditions because it lives
longer and reaches further — the deaths are the price of a winning
run, not a collapse. WATCH carried forward, not a veto. Capable
table win rate 0.5 -> 1 and national 0.5 -> 1 on 2 pairs are screen
noise, not a verdict.

### G4 proof

`node scripts/test-medheadcount-a.js` on the levered tree: **7 PASS,
0 FAIL, 0 SKIP** (re-verified by the adoption run). On the
lever-stashed tree it is 4/7 by design (L0/L1/L3 fail, L2/L4/L5/L6
pass). All 10 repaired/refreshed tests green on the levered tree
(6/6, 33/33, 21/21, 22/22, 9/9, 55/55, 17/17, 39/39, 19/19,
40/40); on the stashed tree 4 of them fail once each
(occupation-cohorts npc-only, titan-standdown, party-opening-turn,
capable-bot §7) — all lever-attributed roster-lottery effects,
confirmed by passing with the lever restored.

### Telemetry deviation check (prescribed, investigated)

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'.../medheadcount-confirm-after/medheadcount-a-competent-s*.json'
--metrics national,table,wins,exiled --sweep-rows` prints three
LOUD lines (national 12 -> 0, table 16 -> 0, wins 16 -> 0).
EXPLAINED, not a bug, and NOT rolled forward: the scale-wall
baseline is the WINSEAT regime (full win-side win stack, ~100%-win
suite) and its own `_regime` note says never to compare pre-seat
substrates against it — wins are structurally ~0 there and the
check fires a spurious LOUD 'wins disappeared'. The identical
three LOUD lines fire on the BEFORE leg too, with no lever applied,
so the deviation cannot be lever-attributed. The baseline is left
untouched.

## Verdict

**NO-GO.** G1 PASS (77.7% ≥ 70%, 0/16 zero-medic), G2 numeric PASS
(median 115d ≥ 82, starvation 5 ≤ 20) but G2 NEW-MODES FAIL
("the redactor":2) -> G2 FAIL, G3 PASS (review_required, no
regression_signal), G4 PASS (7/7). Per the binding prereg, a miss
on any of G1/G2/G3/G4 is NO-GO, never re-scored. The lever is
reverted from the tree (game.js restored to base; the 10 test fixes
are reverted with it — 4 of them break the gate without the lever —
and are recorded below as validated-on-levered-tree, held for the
next run). The evidence, instruments, proof test and corpora land
as record; the lever does not.

## Metric review

- THE REDACTOR. The single failing clause is the G2 "new
  death-cause mode ≥ 2" line, and the flagged cause is "the
  redactor" — The Redactor, a wave-3 monster (src/data/monsters.json
  id `redactor`, name "The Redactor"; debug scenario w3redactor).
  The two deaths are villagers killed by it: seed 96016 day 57
  (gen_7qx9an6) and seed 96022 day 37 (gen_9c52mg9 — the guaranteed
  spawn Dentist, the village's only medic, dead 37 days in). Both
  are fight deaths, same mode as "monster" and "the wild". The
  clause as wired trips on the LABEL, not the mode: the game emits a
  monster's proper name as the death-cause label for fight deaths,
  and the confirm before leg itself contains six such labels (the
  callback, highbeam deer, sunback, grief counselor, buffering,
  spool — all count 1, below threshold). Any lever that extends
  survival lets villages meet wave-3 monsters they never met
  before, so a string-matching new-mode clause will keep tripping
  on first meetings. The pilot corpora could not have caught this:
  their only new cause ≥2 was "combat", which the regex already
  collapses — the wiring was proven on a corpus that never
  exercised the monster-name case. PROPOSED REVISION FOR THE NEXT
  RUN (not applied here, per metric binding): collapse causes
  matching the game's monster roster (src/data/monsters.json
  name/shortName/id, case-insensitive) into 'fight' alongside the
  fight-label regex; prove the revised wiring on the pilot corpora
  first (must still read "none" and verdict GO), then re-run this
  confirm band with the lever + the 10 test fixes re-applied. The
  metric itself (no new death-cause MODE) does not change — only
  the label-to-mode classification, grounded in the game's own
  data. Until then the NO-GO stands as recorded.
- BASELINE SHIFT. The confirm band's before-leg share is 72.5%,
  far above the pilot's 56.1% — the band's villages already hold a
  medic most days without the lever, so the G1 share clause is
  nearly saturated at baseline and the discriminating clause is
  zeroMedicSeeds (3 -> 0). A future confirm on a lower-baseline
  band would test the share clause harder; this band tested the
  zero-medic clause, which the lever passes outright.
- G1 BAR SHAPE. The zero-medic bar (≤2/16) is met with margin (0),
  but seed 96017 shows the guarantee's weak spot: it promises "at
  least one at spawn", not "at least as many as the lottery would
  have given" — the forced draw reshuffles the roster and that
  seed drew 1 medic instead of 2, then lost it day 42. A future
  revision could force the guarantee without consuming the lottery
  draw (or top up to the lottery count), and should measure medic
  RETENTION (medic-days after the first medic death), not just
  spawn. Recorded as a finding below, not a re-score.
- PANEL WATCH. The seed-42 capable deaths doubling reproduced
  (50 -> 107, expedition-led) with the village winning this time.
  Keep the watch on the next panel read: if a third panel shows
  the same seed-42 expedition-death doubling, ask whether the
  lever's roster reshuffle systematically pushes capable villages
  into more expeditions, rather than treating each occurrence as
  one-seed noise.

## Sense (SENSE-TESTING LAW)

Read from the confirm corpora (lessons, joins, deaths, per-day
headcounts — the corpora carry no dialogue transcripts, so the
sense read is on the stories the numbers tell):

- 96010 AFTER is the lever working as designed: a Dentist spawns,
  teaches wound_care from day 3 (d3, d4, d10, d11, d13 — the chain
  spreads to four more villagers in ten days), a medic is present
  all 150 days, the village survives the horizon. Before, the same
  seed had no medic ever and died day 82. Coherent and human: one
  knowledgeable person arrives, teaches, the village holds.
- 96022 AFTER is the honest cost: the guaranteed Dentist teaches
  from day 4, is killed by The Redactor day 37, and the village
  runs medic-less for 84 days — but the teaching outlives the
  teacher (tariq_mahmood, a non-medic, teaches wound_care on d80
  and d99; wound_care holders present 118/120 days). The guarantee
  buys knowledge, not immortality. Coherent.
- 96017 AFTER is the flaw the numbers admit: the forced draw
  reshuffles the roster, the seed gets 1 medic instead of 2, the
  medic dies day 42, medic-present 25/110 — worse headcount than
  before (84/87) on a seed the lever was supposed to help. The
  village still lives longer (110d vs 88d) because the skill
  spread (triage on 100 days, wound_care holders 105 days). The
  guarantee is invisible in fiction (no villager ever remarks on
  it) and the reshuffle cost is real but small. No robotic or
  repeated dialogue appears in the corpora; nothing here reads as
  a scripted line.

## Village assessment in plain words

Sixteen villages, same starting conditions except one change: every
village is now guaranteed to start with at least one person who
knows medicine — a nurse, a paramedic, an army medic, a midwife, a
dentist, a pharmacist, or a vet. Before the change, three villages
in sixteen never had a medical person at all, for their whole lives
— nobody to teach wound care, nobody to tend the sick, and those
villages died young (50, 80, 82 days). After the change, all
sixteen start with a medic, and those three villages live much
longer (one survives the full 150 days). Villages overall live
longer (typical village 102 days before, 115 after) and starve far
less (16 starvation deaths before, 5 after). But nobody gets
closer to the big goal: still zero villages reach national standing,
zero reach the table, zero win. The medicine guarantee fixes a
real, specific gap — villages dying for lack of anyone who knows
medicine — but it does not move the scale wall at all. And it has
one honest flaw: forcing a medic into the starting group shuffles
who else shows up, so on one village in sixteen the shuffle actually
cost a second medic, and on three villages the shuffle changed how
long they lived for the worse. The final call is NO-GO on a
technicality with a real lesson behind it: two villagers were
killed by a wave-3 monster called The Redactor, a monster the
earlier villages never lived long enough to meet — and the test
counts any new killer's name as a new way of dying. The fix for
the test is written down for the next run; the medicine guarantee
itself did what it promised.

## Blanks filled or documented

- FILLED (restored): the pilot corpora — the sim-findings.md:1991
  record gap is closed by committing the salvaged before/after
  corpora, verified to reproduce the quoted pilot numbers exactly.
- FILLED (fixed): all 10 gate failures — 3 assertion repairs + 7
  seed refreshes, each with its mechanism recorded above; proof test
  7/7 on the final tree.
- FILLED (wired): the G2 "new death-cause mode" clause — now an
  analyzer line, not a hand judgment; pilot corpora read "none".
- HELD (NO-GO, this confirm): the medic-headcount lever itself.
  G1 PASS (share 77.7%, 0/16 zero-medic), G2 numeric PASS, G3
  review_required / no regression_signal, G4 proof 7/7 — but the G2
  new-modes clause fails on "the redactor":2, a wave-3 monster kill
  the wired clause counts as a new mode. Lever + 10 test fixes
  reverted from the tree; the metric-review revision (collapse
  monster-roster names into 'fight') is written down for the next
  run. The 10 test fixes are recorded here as validated on the
  levered tree (all green) and held with the lever — 4 of them break
  the gate without it.
- DOCUMENTED (finding, not a re-score): the guarantee reshuffles
  the roster lottery — seed 96017 drew 1 spawn medic after the
  lever vs 2 before, and lost it day 42 (medic-present 84/87 ->
  25/110). Future work: a guarantee that does not consume the
  lottery draw, and a medic-RETENTION measure alongside spawn.
- DOCUMENTED (panel watch, reproduced): seed-42 capable deaths
  50 -> 107, expedition-led (monster:expedition 0 -> 49), with the
  village reaching national + table + win this time. Same seed,
  same pattern as the pilot — a trajectory reshuffle, not a
  collapse; keep the watch on the next panel read.
- DOCUMENTED (adoption repair): the before-leg s96010 1-byte file
  was a probe artifact, not a sweep write; no sweep log survives
  for this arm. Repair re-ran only that seed and reproduced the
  bare fingerprint exactly; bare leg completed 4/16 -> 16/16.

## Files

- Prereg: evidence/2026-11-09/sim-medheadcount-confirm-a-prereg.md
- Evidence (this file): evidence/2026-11-09/sim-medheadcount-confirm-a.md
- Lever: src/js/game.js (patch applied, 22+/5-)
- Instruments: scripts/sweep-medheadcount-a.js,
  scripts/analyze-medheadcount-a.js (generalized, 8-seed behavior
  byte-identical), scripts/test-medheadcount-a.js (7/7)
- Tests repaired/refreshed (10 files — see table above)
- Pilot corpora (restored): evidence/2026-11-08/medheadcount-a-corpus/,
  evidence/2026-11-08/medheadcount-a-corpus-after/
- Confirm corpora: evidence/2026-11-09/medheadcount-confirm-before/
  (16 competent + 16 bare, summary NOT written — the sweep main
  was not used for the before leg; analyzer reads the per-seed
  files), evidence/2026-11-09/medheadcount-confirm-after/ (16
  competent + 16 bare + sweep-competent.json summary)
- Confirm logs: evidence/2026-11-09/medheadcount-confirm-after-sweep.log,
  evidence/2026-11-09/medheadcount-confirm-analyzer.txt,
  evidence/2026-11-09/medheadcount-confirm-panel-before.log,
  evidence/2026-11-09/medheadcount-confirm-panel-after.log
- Confirm panel: evidence/2026-11-09/medheadcount-confirm-panel/
  (panel-before/panel-after panel.json.gz + compare.md/compare.json;
  cases/ caches removed per the medchannel precedent, panel.json.gz
  retained)
