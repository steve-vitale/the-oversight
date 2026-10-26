# sim-rebaseline-a — re-baseline the shared control band on current master (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, run fleshout-20261026T0126Z, arm sim-rebaseline-a.
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips.
This arm designs and lands NO game fix. The new authoritative control table IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law;
  wave 4 = the Mirror Draft; wave 5 still unborn on this band).
  No feast/table canon doc was needed beyond the band's own prior
  evidence: the substrate is the tableseat-nowait policy, not a
  new system, so no canon is invented here.
- Base: this worktree's HEAD 8ea64d848 (the 0017Z coordinator
  evidence commit — current master at registration). All numbers
  below are on THIS base; if master moves under the run, the
  evidence states the base actually swept, and the table is
  re-stated, not silently carried.
- Shared band, trajectory for trajectory: seeds 73671–73678,
  tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  scripts/policies/tableseat-nowait.js), 180d death-aware horizon
  (runDays stops on death/win; 180 is the cap, not a fixed horizon).
- Sweep method (reused, not re-invented): scripts/test-rebaseline-sweep.js
  is the 0017Z feastdraw sweep with exactly one recorder removed —
  the feastdraw recorder. The remaining composition (raftdraft,
  spawnsrc, oldcore, defwound, w5births, nonworldkill) is verbatim,
  so row fields, definitions, and the raftdraft raids/pool census
  are identical to the 0017Z corpus. The feastdraw census is NOT
  re-run (no feastdraw recorder, no feastdraw analysis) and the
  tbmelt census is NOT re-run (the tbmelt recorder was never in
  this composition; no melt analysis is published). Nonworldkill
  rows are carried only as trajectory corroboration (wave-4 kill
  log), not as a new census verdict.
- Published control (STALE, for drift comparison only — never a
  pass/fail gate): from evidence/2026-10-25/perseed-sim-nonworldkill-a/
  (base acbc0c933): deaths 234, national-ever 7/8, national-final
  6/8, invited/table 4/8, entered 4/8, wins 4/8 (lesser seat only),
  wave-3 8/8, wave-4 6/8, wave-5 0/8, full seat 0/8, median 135d,
  raids 85, raiders 361, pool 1,494, pool wave-3+ 107, starvation 5.
  Per-seed published rows are in that corpus (quoted in the drift
  table below); "table" = ever-tableWaiting (the invited leg),
  "entered" = ever-tableDone, exactly as the sweep defines them.
- 0017Z current-base reference (also for drift comparison only):
  deaths 260, national-ever 6/8, national-final 5/8, table 4/8,
  entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8, Arc IV 4/8,
  median 143d, raids 85, raiders 352, pool 1,527, pool wave-3+ 132,
  starvation 9 (feastdraw summary band + per-seed rows).
- PRIMARY DELIVERABLE: the new authoritative control table for
  this band on current master (band aggregates + full per-seed
  table: days, end reason, won, wave reach, max Arc, max rank,
  national-ever/final, table/invited, entered, wins, deaths,
  starvation, raids, raiders, pool, pool wave-3+), plus a drift
  table vs the published control with PER-SEED attribution
  (which seeds moved, on which fields).
- GO rule (ALL required): (a) 8/8 per-seed files in
  evidence/2026-10-26/perseed-sim-rebaseline-a/ (fresh filenames
  s<seed>-rebaseline.json, never a live run's filenames in a live
  dir); (b) a recorder-free determinism proof: a plain
  tableseat-nowait re-run of all 8 seeds reproduces the control
  rows EXACTLY on every trajectory field (days, gameDays,
  endReason, won, waveReach, maxArc, finalRank, maxRank,
  nationalEver, nationalFinal, table, entered, deathTotal,
  starvationDeaths, ts) — raids/pool are raftdraft-census outputs
  with no plain counterpart and are excluded from that leg by
  construction, stated here, not hidden; (c) a drift table vs
  the published control with per-seed attribution on every field
  where the band moved. Any leg missing = NO-GO.
- NO-GO scope limits (stated before sweeping, not after):
  (1) this arm does NOT bisect the drift — cause attribution
  stops at per-seed deltas; (2) this arm does NOT re-judge any
  prior corpus against the new baseline — prior verdicts stand
  on their own bases; the new table is for FUTURE arms only.
- SENSE plan: spot-check the band still reads as the same game —
  no win without national, no wave-5 sighting without a wave-4
  kill, no entered table without national; quote one
  representative line if anything looks off. Numbers plus a
  coherence read, not counts alone.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (known limitation, carried) — the
  sweep summary + this evidence file are the comparison of
  record; telemetry-check is NOT run on recorder rows (its
  counts are wrong on recorder rows — standing instruction).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: GO — new authoritative control table published (all three pre-registered legs met)

- (a) 8/8 per-seed files in evidence/2026-10-26/perseed-sim-rebaseline-a/
  (s<seed>-rebaseline.json), plus summary.json.
- (b) Recorder-free determinism proof: all 8 plain (recorder-free)
  rows reproduce their rebaseline rows EXACTLY on every trajectory
  field (days, gameDays, endReason, won, waveReach, maxArc,
  finalRank, maxRank, nationalEver, nationalFinal, table,
  entered, deathTotal, starvationDeaths, ts, and the deaths map).
- (c) Drift table vs the published control with per-seed
  attribution on every moved field (below; only seeds 73674
  and 73675 moved, all other six seeds byte-identical in every
  compared field).
- Proof: scripts/test-rebaseline-a.js — 295 passed, 0 failed.
  Sweep summary corpus gate PASS (all recorder diags errs 0,
  no overflow). Detgate PASS (seed 73671, recorders OFF =
  baseline days 180 / gameDays 181 / tsNationalDay 77, no diag
  surface, no wraps installed).

## NEW AUTHORITATIVE CONTROL TABLE (base 8ea64d848, current master at registration)

Band (n = 8 seeds, 73671–73678, tableseat-nowait, 180d death-aware):
deaths 260, national-ever 6/8, national-final 5/8, invited/table
4/8, entered 4/8, wins 4/8 (lesser seat only), wave-3 8/8, wave-4
5/8, wave-5 0/8, full seat 0/8, Arc IV 4/8, median survival 143d
(days sorted: 70, 97, 116, 124, 143, 163, 180, 180), max 180d,
starvation 9, raids 85, raiders 352, pool 1,527, pool wave-3+ 132.
Death-cause shares (of 260): villager combat 162 (62.3% —
'villager combat' 78 + 'combat' 84), player arena 32 (12.3%),
villager sickness 16 (6.2%), expedition 11, starvation 9
(villager 7 + player 2), ambush 5, wound-that-wouldn't-close 5,
villager monster 5, player contest 3, villager alien 3, player
dehydration 3, and 1 each for Bulldozer, Paparazzo, Living Wire,
lockjaw, the night, thirst.

Per-seed table (days = run days; end: survived / over-other =
game over with a win / village-lost; fin = final rank; mx = max
rank; ne/nf = national-ever/final; tab = invited; ent = entered):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | deaths | starv | raids | raiders | pool | poolW3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 31 | 0 | 16 | 74 | 342 | 33 |
| 73672 | 97 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 25 | 0 | 7 | 28 | 127 | 9 |
| 73673 | 124 | over-other | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 28 | 0 | 7 | 30 | 104 | 4 |
| 73674 | 163 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 30 | 0 | 13 | 60 | 197 | 13 |
| 73675 | 180 | survived | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 38 | 4 | 14 | 52 | 192 | 28 |
| 73676 | 70 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 31 | 4 | 7 | 28 | 121 | 0 |
| 73677 | 143 | village-lost | 0 | 4 | 3 | national | national | 1 | 1 | 0 | 0 | 43 | 0 | 12 | 45 | 282 | 27 |
| 73678 | 116 | over-other | 1 | 4 | 4 | national | global | 1 | 1 | 1 | 1 | 34 | 1 | 9 | 35 | 162 | 18 |

Final populations / pantries (context, not control fields):
73671: 4 people, 18,121 kcal; 73672: 7, 8,182; 73673: 9, 16,375;
73674: 10, 22,387; 73675: 2, 200; 73676: 2, 0; 73677: 2, 0;
73678: 6, 24,564.

FUTURE ARMS: judge against THIS table (base 8ea64d848), not the
published 234-death band. Any arm whose base differs from
8ea64d848 must re-baseline first or state its base delta.

## DRIFT vs PUBLISHED CONTROL — PER-SEED ATTRIBUTION

Published source: evidence/2026-10-25/perseed-sim-nonworldkill-a/
(base acbc0c933). Band drift: deaths 234 → 260 (+26),
national-ever 7/8 → 6/8 (−1), national-final 6/8 → 5/8 (−1),
invited 4/8 → 4/8 (0, but the seats swapped seeds), entered
4/8 → 4/8 (0, same swap), wins 4/8 → 4/8 (0, one win gained and
one lost), wave-4 6/8 → 5/8 (−1), wave-5 0/8 → 0/8, median
135d → 143d (+8), raids 85 → 85 (0, but per-seed counts
shifted), raiders 361 → 352 (−9), pool 1,494 → 1,527 (+33),
pool wave-3+ 107 → 132 (+25), starvation 5 → 9 (+4), Arc IV
4/8 → 4/8.

Per-seed attribution — six seeds moved on NOTHING (73671,
73672, 73673, 73676, 73677, 73678 reproduce their published
rows exactly on every compared field, including raids/pool):

- 73674 (published → new): days 180 → 163, end survived →
  over-other (won), won 0 → 1, Arc 3 → 4, table 0 → 1,
  entered 0 → 1, deaths 18 → 30 (+12), raids 14 → 13,
  raiders 65 → 60 (−5), pool 210 → 197 (−13), poolW3 12 → 13
  (+1). Final rank global both, national-ever/final 1/1 both,
  wave 4 both. Seat detail (new): seat day 163, lesser seat,
  path 'feared', 5 table answers. The village that used to
  survive now wins through the lesser seat.
- 73675 (published → new): days 135 → 180, end over-other
  (won) → survived, won 1 → 0, wave 4 → 3, Arc 4 → 3,
  final rank national → regional, max rank national →
  regional, national-ever 1 → 0, national-final 1 → 0,
  table 1 → 0, entered 1 → 0, deaths 24 → 38 (+14),
  starvation 0 → 4, raids 13 → 14, raiders 56 → 52 (−4),
  pool 146 → 192 (+46), poolW3 4 → 28 (+24). The village that
  used to win on day 135 now survives to day 180 with 2 people
  and 200 kcal in the pantry — it lived but never climbed.

Net arithmetic checks: deaths +12 +14 = +26 ✓; raiders
−5 −4 = −9 ✓; pool −13 +46 = +33 ✓; poolW3 +1 +24 = +25 ✓;
median shift is the 5th sorted day moving 135 → 143 (the
73675 win day leaving the order and 73677's 143 taking its
place in the sorted list) ✓. Cause of the drift is still
UNBISECTED by design (not this arm's job): the 0017Z note
names the candidate range (nonworldkill-a base acbc0c933 →
4f5f3b614: journey-scale r36 hierarchy.js/titans.js notes +
journey-landing r53), and no single commit is blamed here. A
bisect arm can start from these two seeds' exact deltas.

## DRIFT vs 0017Z CURRENT-BASE: NONE — the 0017Z table is confirmed

Every rebaseline row is IDENTICAL to its 0017Z feastdraw row
on every compared field (days, end, won, wave, Arc, ranks,
national, table, entered, deaths, starvation, raids, raiders,
pool, poolW3) for all 8 seeds. The commits that landed
between the 0017Z arms' sweep base and this arm's base
(8ea64d848) moved no seed on this band. Practical consequence:
the 0017Z current-base numbers (deaths 260 etc.) were already
the right table; this arm's contribution is making that
authoritative on current master with a full per-seed corpus,
a recorder-free proof, and a published-control drift table —
future arms no longer need to cite "0017Z said so."

## DETERMINISM PROOF

- Recorder-free re-run (plain tableseat-nowait, no recorders):
  8/8 seeds reproduce the rebaseline rows exactly on days,
  gameDays, endReason, won, waveReach, maxArc, finalRank,
  maxRank, nationalEver, nationalFinal, table, entered,
  deathTotal, starvationDeaths, ts, and the full deaths map
  (proof test compares all of these per seed, not just the
  console line). Raids/pool are excluded from this leg by
  construction (raftdraft-census outputs, no plain
  counterpart) — stated in the pre-registration, not hidden.
- Sweep-level corroboration: the nonworldkill door census on
  the new corpus gives 128 TB initiations, 0 unclassified,
  wave-4 TB kills 1 — the same 73678 day-115 strike kill.
- Detgate PASS (seed 73671): baseline days 180 / gameDays 181
  / tsNationalDay 77 = wrapped-with-recorders-OFF, no diag
  surface, no wraps installed.
- Proof test: scripts/test-rebaseline-a.js, 295 passed, 0 failed
  (file existence, per-seed determinism, band recomputation
  vs summary.json, raftdraft aggregate recomputation, drift
  recomputation vs the published corpus, corpus hygiene, and
  sense checks).
- Infrastructure note (honest, not a failure): the first
  backgrounded sweep loop's session vanished after seed 73677
  with no completion record, and plain runs ran slow under host
  contention (up to ~140s for a single win seed vs ~15s
  unloaded). Nothing was lost — the missing pieces were
  re-run in the foreground and all 16 rows + summary are on
  disk and committed. No EPERM flap blocked this run's writes.

## SENSE-TESTING READ

No absurdity found; the proof test asserts the coherence
rules (win → national-ever + entered; entered → national;
table → national; a wave-4 kill-log entry → wave reach ≥ 4)
and all pass. Spot checks in plain words:

- The band's only wave-4 kill is still the same one the last
  several bands remember: 73678, day 115, strike, killed by
  elif_demir via 'player' — the log entry is identical to
  0017Z's. The world funnel produced no wave-4 kill on this
  base either (nonworldkill wave-4 TB kills: feast-draw 1,
  all other doors 0).
- 73674's win reads as a real climb, not a bookkeeping
  artifact: national day 77, seat taken day 163 at the lesser
  seat on the 'feared' path, 10 people and 22,387 kcal left —
  a village that could afford the seat.
- 73675's survival reads as the mirror image: 180 days, 2
  people, 200 kcal, 4 starvation deaths, never national. It
  did not die; it stalled. That is a different failure mode
  from 73676/73677 (village-lost at 70/143 days), and the
  per-seed table keeps the two apart instead of averaging
  them into "median 143d."
- Villager-behavior spot check: nothing new here reads
  robotic — the rows carry the same solo-scholar / small-
  village texture as 0017Z, and no new behavior was introduced
  (zero src/js changes), so there is nothing new to judge on
  that axis. The blank this arm fills is measurement, not
  behavior.

## WALL NUMBERS (new authoritative control — for FUTURE arms to judge against)

national-ever 6/8, national-final 5/8, table invited 4/8,
entered 4/8, wins 4/8 (lesser seat only), wave-4 5/8, wave-5
0/8, full seat 0/8, Arc IV 4/8, median survival 143d, max
180d, deaths 260. The wall stands exactly where 0017Z left
it: wave 5 unborn, the full seat untouched, wins only through
the lesser seat.

## BLANKS FILLED OR DOCUMENTED

- FILLED (the topmost named blank from the 0017Z run): the
  shared control band is re-baselined on current master —
  band table + full per-seed table + drift vs published with
  per-seed attribution + recorder-free determinism proof.
  Future arms judge against this file's table (base
  8ea64d848), not the stale 234-death band.
- FILLED (method): the rebaseline sweep (scripts/test-rebaseline-sweep.js)
  is the 0017Z sweep minus exactly the feastdraw recorder, so
  the next re-baseline reuses the same file instead of
  re-deriving the composition.
- DOCUMENTED, NOT FIXED (carried, not chased here): the drift
  cause is unbissected (candidate range named above, no
  commit blamed); the 0017Z next blanks (drive-off-policy
  feast-draw arm, unlockedWave-at-draw recording,
  fusion-reactor ceiling, melt ruling, wound-closure pricing)
  are untouched by this arm.
- NOT DONE (by design, per the arm brief): no bisection of
  the drift; no re-judgment of any prior corpus against the
  new baseline; no game-code change of any kind.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered leg was re-scored mid-run. The run was
judged exactly against its three legs: (a) 8/8 per-seed files
(achieved, plus 8/8 plain files and summary.json); (b)
recorder-free determinism proof reproducing the control
numbers exactly on every trajectory field (achieved 8/8;
raids/pool excluded from that leg by the pre-registered
construction, because they have no plain counterpart);
(c) drift table vs published with per-seed attribution
(achieved: 2 moved seeds, every moved field listed, six
seeds proven unmoved). One method note, neither a revision
nor a re-score: the sweep summary's "NEUTRALITY vs control"
line prints DEVIATED by design — drift vs the published band
is the finding this arm publishes, not a gate, and the
summary exits 0 on corpus PASS regardless of drift (the
feastdraw sweep's exit-1-on-drift behavior was deliberately
not carried over, because a re-baseline arm that failed on
drift could never publish a new table). The telemetry-check
and balanced panel were NOT run, per the standing exception
for recorder rows (panel cannot ingest per-seed recorder
corpora; checker counts are wrong on recorder rows). The
sweep summary + this evidence file are the comparison of
record. No game code changed; no [needs-eyes] flag applies
(measurement table only, no feel/combat/UI change).

## Infrastructure notes

- Sweep: scripts/test-rebaseline-sweep.js (0017Z feastdraw
  sweep minus the feastdraw recorder; modes --one rebaseline /
  --one plain / --summary / --detgate). Corpus:
  evidence/2026-10-26/perseed-sim-rebaseline-a/ (8 rebaseline
  rows + 8 plain rows + summary.json). Proof:
  scripts/test-rebaseline-a.js (295/295).
- Detgate PASS (seed 73671, recorders OFF = baseline).
- Commit: sim-rebaseline-a, GO (new authoritative control
  table), zero src/js diff. Ready for coordinator merge;
  NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- check.js --quick NOT run: zero src/js diff in this arm
  (standing 280/7 pre-existing profile); the arm's own proof
  tests are the verification of record.
