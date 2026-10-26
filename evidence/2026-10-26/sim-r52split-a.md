# sim-r52split-a — split the r52 3-file drift (axis scale-onramp, backlog "R52 3-file drift split UNSPLIT")

Run: fleshout-20261026T1715Z (Mon 2026-10-26). Axis: scale-onramp.
Arm: sim-r52split-a. DIAG / MEASUREMENT ONLY — zero game-code change
lands from this arm. All engine-file restorations are experiments in
this worktree and MUST be reverted before commit — the final tree's
src/js must be byte-identical to HEAD (verified by blob hash, see
"Tree state" below). Do NOT change game code and do NOT land a
game-code fix from this arm.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave
law, per the flip arm). No canon doc covers bisection/splitting
itself; no design is invented here. The seat/contest path is
touched only as the win endpoint (entered/won fields).

BACKGROUND (read in full before designing): evidence/2026-10-26/
sim-flip73676-a.md and sim-scale-onramp-round-1615.md. The flip
arm showed the post-e8f2ccad7 drift is entirely explained by the
journey-deepening r52 falsy-0 set IN COMBINATION
(abilityActions.js + corpses.js + corruption.js; its experiment
E3 restoring all 3 files reproduces the -1354 band 8/8 exactly),
but which file drives it was NOT split. That split is this arm.
This arm does NOT re-claim the combined attribution as a
single-file result, and does NOT re-judge the flip corpus.

## PRE-REGISTRATION (binding — judged only against this; written BEFORE any sweep)

- Base commit: 7231f9272 (master at run start). Base has moved
  since the 806ef430e band table, so this arm RE-BASELINES
  FIRST. If the re-baseline does not reproduce the 806ef430e
  table, that IS a finding — reported, not forced.
- Instrument: scripts/test-rebaseline-sweep.js, used VERBATIM
  (zero edits), tableseat-nowait substrate: LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1, seat legs only, 180d death-aware horizon
  (runDays stops on death/win; 180 is the cap, not a fixed
  horizon). Seeds 73671–73678 for every band. Driver:
  scripts/test-r52split-a.js (swap + sweep + restore +
  verify), writing to evidence/2026-10-26/
  perseed-sim-r52split-a-<corpus>/ — NEVER overwriting
  perseed-sim-flip73676-a/ or any other run's corpus.
- Split method: restore ONE file at a time to its e8f2ccad7
  version (the exact state E3 used — verified below), re-run
  the band, record per-file tables. Seed 73676 alone may
  pilot, but the verdict band is 73671–73678.
- Intervening delta (established BEFORE sweeping, by git log):
  the ONLY commit touching any of the 3 files between
  e8f2ccad7 and this HEAD is 88b8d7e32 (journey-deepening r52
  itself). So restoring one file to its e8f2ccad7 version
  reverts EXACTLY that file's r52 falsy-0 fix and nothing
  else — no confounding later change in any of the 3 files.
  The r52 hunks, per file:
  - abilityActions.js: butcher-corpse proximity check,
    (c.mx || 4)/(s.mx || 4) -> (c.mx ?? 4)/(s.mx ?? 4)
    (c.my || 0)/(s.my || 4) -> (c.my || 0)/(s.my ?? 4).
  - corpses.js: corpse spawn placement, (s.mx || 4) ->
    (s.mx ?? 4), (s.my || 4) -> (s.my ?? 4) — a scholar at
    edge 0 no longer spawns the corpse at center (4,4).
  - corruption.js: grave-robber butcher proximity, two
    sites, (s.mx || 4)/(s.my || 4) -> ?? 4 — a scholar at
    (4,0) no longer read as standing at (4,4).
- Primary metric (DIAG): per-file band tables (trajectory
  fields + deaths + raftdraft census) for all three single
  restorations, judged against the -1354 band.
- DIAG-GO iff a single file's restoration reproduces the
  -1354 band (8/8 trajectory fields + deaths + ts, as E3
  did for the combination), OR moves seed 73676 to its -1354
  endpoint (160d over-other, won 1, arc 4, national, entered
  1, deaths 55) while the other two single restorations do
  not. Per-file tables for all three single restorations are
  published regardless of verdict.
- CONTROL corpus (pre-registered, runs before the split
  verdict is judged): the combined E3 restoration on THIS
  base (all 3 files to e8f2ccad7). If it reproduces -1354
  8/8 exactly, the split question is well-posed on this base
  and a no-single-file result means interaction. If it does
  NOT reproduce -1354, there is further drift since
  806ef430e and the split verdict is judged against the
  -1354 target with that confound stated explicitly — the
  single-file tables remain the deliverable, and no
  single-file verdict is forced.
- FAILURE MODES (pre-declared): if the re-baseline matches
  neither the 806ef430e table nor -1354, the re-baseline
  table is the deliverable for this base and the split is
  still run and judged against -1354 with the base delta
  stated. If no single file meets DIAG-GO, the honest
  verdict is "no single file drives it — interaction" with
  the per-file tables as the deliverable.
- Balanced panel (§15): attempt scripts/balance-panel.js
  ingest; if it cannot ingest recorder corpora, say so
  explicitly and attach the paired identical-seed tables as
  the comparison of record — never fake a panel file. (The
  flip arm found no corpus-ingest mode; expected same.)
- Metric binding (§14): no mid-run re-scores. Metric doubts
  go under "metric review" for the NEXT run. Every evidence
  file carries a "metric review" section.
- Sense-test (§11 law): IF a single file drives it, add a
  transcript-segment read showing the mechanism in plain
  words. If no single file drives it, no mechanism read is
  forced; the per-file tables carry the verdict.

## PRE-FLIGHT (run start)

- Main tree untouched by this worker (worktree only). Worktree
  git status clean (0 lines) at start. Disk 26% (no pressure).
- Shell-write probe OK at run start (no EPERM flap observed;
  flip arm's flap class noted, retry logic in driver).
- Det-gate run before the re-baseline band (see below).

## RE-BASELINE BAND (base 7231f9272)

Instrument verbatim, EVID perseed-sim-r52split-a-rebaseline/.
Det-gate PASS on this base (seed 73671: baseline 180d /
gameDays 181 / tsNationalDay 107, recorder-free identical,
diagSurface false, wrapsInstalled false) — the same det-gate
values as the 806ef430e base.

Band (n = 8, tableseat-nowait, 180d death-aware): wins 2/8,
national-ever 6/8, national-final 5/8, table waiting 3/8,
entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 166d
(days sorted 104, 117, 140, 144, 166, 180, 180, 180),
max 180d, deaths 338, starvation 1, raids 110, raiders 469,
pool 1,719, poolW3 263. Nonworldkill: 207 initiations,
0 unclassified.

Per-seed table (days = run days; end: survived / over-other =
game over with a win / village-lost; fin = final rank; mx =
max rank; ne/nf = national-ever/final; tab = table waiting;
ent = entered; dth = deaths; stv = starvation):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | dth | stv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 180 | survived | 0 | 4 | 3 | national | national | 1 | 1 | 0 | 0 | 48 | 0 |
| 73672 | 180 | survived | 0 | 4 | 4 | regional | regional | 0 | 0 | 1 | 0 | 51 | 0 |
| 73673 | 117 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 40 | 0 |
| 73674 | 166 | village-lost | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 39 | 0 |
| 73675 | 180 | survived | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 42 | 0 |
| 73676 | 144 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 43 | 0 |
| 73677 | 140 | over-other | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 37 | 0 |
| 73678 | 104 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 38 | 1 |

DELTA vs 806ef430e: ZERO. Verified field-by-field
(trajectory fields + deaths maps + ts, 0 diffs across all
8 seeds; band aggregates identical). The base moved
(806ef430e -> 7231f9272) but this band did not move at all:
no new drift since the flip arm's table, so the split
question is posed exactly as pre-registered. This is NOT a
"re-baseline differs" finding — it is a clean re-baseline.

## CONTROL CORPUS: COMBINED E3 ON THIS BASE

All 3 files restored to e8f2ccad7, band re-run verbatim
(EVID perseed-sim-r52split-a-combined/). Band: wins 2/8,
national-ever 7/8, national-final 3/8, table 3/8, entered
2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 174d,
deaths 327, starvation 1, raids 101, raiders 423,
pool 1,640, poolW3 202. Nonworldkill: 195 initiations,
0 unclassified.

Verified field-by-field against the flip arm's E3 corpus
(perseed-sim-flip73676-a-e3/): 0 diffs on trajectory
fields + deaths maps + ts across all 8 seeds. The combined
restoration reproduces -1354 EXACTLY on this base too, so
the split question is well-posed: a single file that
reproduces -1354 is the driver, and anything else is
interaction or inertness. Per-seed rows are identical to
the corpses-only table below.

## SPLIT: PER-FILE TABLES

All three single restorations run as full 8-seed bands
(EVID perseed-sim-r52split-a-<file>/). Exactness is judged
field-by-field (trajectory + deaths map + ts), not just on
band aggregates.

### abilityActions.js only (restored to e8f2ccad7)

Band: wins 2/8, national-ever 6/8, national-final 5/8,
table 3/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8,
median 166d, deaths 338, starvation 1, raids 110,
raiders 469, pool 1,719, poolW3 263. Nonworldkill: 207
initiations, 0 unclassified.

Per-seed rows are IDENTICAL to the re-baseline table
above, seed for seed (0 field diffs). VERDICT FOR THIS
FILE: INERT on this band. Restoring the abilityActions
butcher-proximity falsy-0 fix changes nothing measurable
on any of the 8 seeds — no seed moves, no death map
moves, no census moves. Its r52 hunk is real code, but
it is not the drift driver here.

### corpses.js only (restored to e8f2ccad7)

Band: wins 2/8, national-ever 7/8, national-final 3/8,
table 3/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8,
median 174d, deaths 327, starvation 1, raids 101,
raiders 423, pool 1,640, poolW3 202. Nonworldkill: 195
initiations, 0 unclassified.

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | dth | stv |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 177 | village-lost | 0 | 4 | 4 | regional | national | 1 | 0 | 1 | 0 | 43 | 0 |
| 73672 | 116 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 32 | 0 |
| 73673 | 97 | over-other | 1 | 3 | 4 | national | national | 1 | 1 | 1 | 1 | 29 | 0 |
| 73674 | 175 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 48 | 0 |
| 73675 | 180 | survived | 0 | 4 | 3 | global | global | 1 | 1 | 0 | 0 | 43 | 0 |
| 73676 | 160 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 55 | 0 |
| 73677 | 174 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 41 | 0 |
| 73678 | 106 | village-lost | 0 | 3 | 3 | regional | regional | 0 | 0 | 0 | 0 | 36 | 1 |

Per-seed rows are IDENTICAL to the combined E3 / -1354
band (0 field diffs vs perseed-sim-flip73676-a-e3/).
Seed 73676 moves to its -1354 endpoint exactly (160d
over-other, won 1, arc 4, national, entered 1, deaths 55).
VERDICT FOR THIS FILE: DRIVES IT, ALONE. Restoring only
corpses.js reproduces the full -1354 band 8/8 — the
combination is not needed. Vs the re-baseline, 64 field
diffs across all 8 seeds (every seed's death map moves;
73675 keeps its 180d survived trajectory but its death
map still moves).

### corruption.js only (restored to e8f2ccad7)

Band: wins 2/8, national-ever 6/8, national-final 5/8,
table 3/8, entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8,
median 166d, deaths 338, starvation 1, raids 110,
raiders 469, pool 1,719, poolW3 263. Nonworldkill: 207
initiations, 0 unclassified.

Per-seed rows are IDENTICAL to the re-baseline table
above, seed for seed (0 field diffs). VERDICT FOR THIS
FILE: INERT on this band, same as abilityActions.js.
Restoring the grave-robber proximity falsy-0 fix changes
nothing measurable on any of the 8 seeds.

## VERDICT

DIAG-GO — SINGLE FILE DRIVES IT: corpses.js.

- The post-e8f2ccad7 drift is NOT an interaction of the
  r52 3-file set. It is one file: corpses.js, the corpse
  spawn-placement falsy-0 fix ((s.mx || 4) -> (s.mx ?? 4),
  (s.my || 4) -> (s.my ?? 4)). Restoring corpses.js alone
  reproduces the -1354 band 8/8 exactly; restoring
  abilityActions.js alone or corruption.js alone
  reproduces the current-master band 8/8 exactly.
- The pre-registered DIAG-GO bar is met on its first leg
  (single file reproduces the -1354 band) AND its second
  leg (73676 to its -1354 endpoint while the other two
  single restorations do not — they leave 73676 at
  144d won / 43, the current-master row).
- No "interaction" verdict is needed: the other two files
  are inert on this band, not partial contributors. (That
  claim is band-scoped: on other seeds or substrates the
  ability/corruption hunks may still bite. What is proven
  here is that on seeds 73671–73678 under this substrate
  they contribute exactly zero to the drift.)
- The honest mechanism caveat carries over from the flip
  arm: the corpses.js fix is sensible (a body should be
  filed where the person died, not teleported to the
  village center), but the band movement it causes is a
  chaotic re-roll downstream, not a design lesson that
  correct corpse placement wins games. See the sense-test
  read below.

## SENSE-TEST READ (plain words)

Instrument: scripts/test-r52split-sense.js — wraps
registerDeath on seed 73671 and prints every corpse spawn
(scholar cell, explicit cell if any, filed cell), run once
with HEAD corpses.js and once with the e8f2ccad7 version
(blob-verified around the swap). Both runs share their
first three spawns exactly (day 7, day 9, day 17 — all
monster deaths with explicit cells, untouched by r52).

Day 25 is the first bite. Theo Lindqvist dies to a monster
while the scholar stands at the edge cell (0,0). The old
code reads "standing at 0" as "standing nowhere" and files
Theo's body at the village center (4,4). The new code
files it where he died: (0,0). That is the whole mechanism
in one line — a dead man's body teleported to the center
of camp by a falsy zero.

What follows reads like two different villages, not two
versions of one edit. On the new code the next death is
day 34 (sickness); on the old code it is day 27 (an arena
death, and it is the player). The new-code village survives
the full 180 days; the old-code village is lost on day 177.
Nothing about the old-code village looks broken in a way
that traces to Theo's body — nobody stands over a wrongly
filed corpse and makes a visibly wrong choice. The
placement changes which later lookups hit (butchering a
body, robbing a grave, burying the dead all ask "is there
a body near here?"), those lookups spend or skip RNG
draws, and from day 25 on every roll in the run re-deals.
So: the fix is sensible — a body belongs where the person
fell — the divergence is real, and the connection between
the fix and the win/loss is dice, not desert. Anyone
citing this split as "proof that correct corpse placement
wins games" is misreading it, exactly as with the flip
arm's guard. The old code's other edge filings tell the
same story (day 75: two expedition deaths filed at (4,4)
instead of (0,0); day 138: (8,4) instead of (8,0)) — zero
is a place, not an absence.

## WALL NUMBERS (every corpus judged)

- Re-baseline (7231f9272, = 806ef430e exactly):
  national-ever 6/8, final 5/8, table waiting 3/8,
  entered 2/8, wins 2/8, wave-4 6/8, wave-5 0/8,
  median 166d, max 180d, deaths 338, starvation 1,
  raids 110, raiders 469, pool 1,719, poolW3 263.
- Combined E3 (= -1354): national-ever 7/8, final 3/8,
  table 3/8, entered 2/8, wins 2/8, wave-4 6/8,
  wave-5 0/8, median 174d, deaths 327, starvation 1,
  raids 101, raiders 423, pool 1,640, poolW3 202.
- Corpses-only (= -1354, same numbers as combined).
- Ability-only (= re-baseline, same numbers).
- Corruption-only (= re-baseline, same numbers).
- The wall stands on every corpus: wave 5 is unborn on
  all five bands, wins come only through the default-OFF
  tableseat-nowait substrate's lesser seat, and the full
  seat is unreached. The split moves the attribution, not
  the wall. Death-cause note (73671 sense runs): the
  current-master run's 48 deaths vs the old-code run's 43
  are different people dying on different days, not a
  single cause shifting — consistent with a re-roll, not
  a balance lever.

## VILLAGE ASSESSMENT (plain words)

Eight villages, five ways of looking at them, and the
story is which file you blame, not which village you
watch. On current master: three survive 180 days without
winning, three are lost, two win through the table
(73676 day 144, 73677 day 140). With corpses.js restored
to its old self: the winners change (73673 wins day 97,
73677 loses day 174), the losers change, the counts stay
2/8 — the band looks the same from far away and is a
different eight villages up close. The standout is 73671:
on current master it survives the whole run; on the old
corpse code it is lost on day 177 — and the entire
difference starts with one body filed at the wrong end
of the map on day 25. Villages die to the world, not to
hunger, on every corpus here (starvation 1 band-wide
throughout); wave 4 shows up on six seeds, wave 5 on
none. The late game is reached, not finished, in all
five views.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No pre-registered leg was re-scored mid-run. The
  DIAG-GO bar was adopted before sweeping (with the
  control-corpus clause written into the header), and the
  verdict is judged against it exactly: corpses-only
  reproduces -1354 8/8, the other two singles reproduce
  current-master 8/8. The re-baseline leg needed no
  failure-mode ruling because the re-baseline reproduced
  the 806ef430e table exactly (0 field diffs).
- The control corpus (combined E3 on this base) was run
  before the split verdict was judged, as pre-registered,
  and it reproduced -1354 exactly — so the "interaction"
  alternative was genuinely available and genuinely
  rejected by the data, not assumed away.
- BALANCED PANEL (§15): ATTEMPTED AND NOT APPLICABLE —
  stated explicitly. scripts/balance-panel.js has no
  corpus-ingest mode: it generates panels by re-running
  sims under its own observer (its --help path errors
  demanding --out <panel-directory>). No panel files
  exist for these corpora, and generating a fresh panel
  would not compare these corpora — it would be a
  different instrument on different runs. No panel file
  is produced or faked; the paired identical-seed tables
  in this file (same 8 seeds, same substrate, same
  horizon, 0-diff field comparisons) are the comparison
  of record. This is the same recorder-corpus limitation
  the flip arm reported.
- Telemetry-check was NOT run on recorder rows (its
  counts are wrong on recorder rows — standing instruction
  from the 0158Z evidence, repeated by the flip arm).
- check.js --quick NOT run: zero src/js diff in the final
  tree and sibling loops are live (its result would be
  unattributable); the arm's own proof (driver blob
  verification on every swap and restore, det-gate PASS,
  5 corpus gates PASS, 0-diff field comparisons) is the
  verification of record.
- Metric doubt for the NEXT run (not a re-score here):
  the DIAG-GO bar's "reproduces the band" leg is very
  strong on 8 seeds but band-scoped — ability/corruption
  inertness is proven only for seeds 73671–73678 under
  this substrate. A future arm that wants a general
  "these two hunks never matter" claim needs a wider
  seed set; this arm claims only what its band shows.

## PROOF SCRIPTS (all in this tree, all run)

- scripts/test-r52split-a.js — split driver: swap one
  corpus's files to e8f2ccad7 (blob-verified), run the
  flip instrument verbatim per seed, run --summary,
  restore all 3 files to HEAD (blob-verified) in a
  finally block. Run for all 5 corpora (rebaseline,
  combined, ability, corpses, corruption); all 5 corpus
  gates PASS; every restore verified HEAD-identical.
- scripts/test-r52split-sense.js — corpse-spawn reader
  (registerDeath wrapper): HEAD run 73671 = 180d
  survived / 48 deaths (matches the re-baseline row);
  old-corpses run = 177d lost / 43 deaths (matches the
  corpses/E3 row). First divergence: day 25, Theo
  Lindqvist, scholar (0,0), filed (0,0) vs (4,4).
- scripts/test-rebaseline-sweep.js — used VERBATIM,
  zero edits (same digest as the flip arm).
- Det-gate PASS on this base (73671: 180d / gameDays
  181 / tsNationalDay 107, recorder-free identical).
- Field comparisons (node, summary.json rows):
  ability vs rebaseline 0 diffs; corruption vs
  rebaseline 0 diffs; corpses vs E3 0 diffs; combined
  vs E3 0 diffs; re-baseline vs flip 806ef430e corpus
  0 diffs; corpses vs re-baseline 64 field diffs.
  Raftdraft census recomputed from rows matches the
  sweep stdout for all 5 corpora.

## INFRASTRUCTURE (loud, as required)

- No EPERM flap observed this run: shell writes, node
  writes, and git writes all succeeded throughout (the
  probe at run start passed; all 5 corpora wrote 40
  recorder rows + 5 summaries without a retry firing).
- No safe-commit refusal, no merge conflict (no merge
  is this worker's job — the coordinator merges).
- The sense-script swap (corpses.js to e8f2ccad7 and
  back) was blob-verified both ways in the same command
  (old blob 4bd87fc0, HEAD blob 0a847a4f); the final
  tree shows zero modified tracked files (see below).

## TREE STATE (verified at close)

- src/js/abilityActions.js, corpses.js, corruption.js:
  blob hashes IDENTICAL to HEAD (7231f9272) — zero
  game-code diff. node --check clean on both new scripts.
  git status shows ONLY untracked files (this evidence
  file, 5 corpus dirs, 2 scripts); zero modified tracked
  files.
- Untracked (to be committed): evidence/2026-10-26/
  sim-r52split-a.md (this file),
  evidence/2026-10-26/perseed-sim-r52split-a-rebaseline/,
  perseed-sim-r52split-a-combined/,
  perseed-sim-r52split-a-ability/,
  perseed-sim-r52split-a-corpses/,
  perseed-sim-r52split-a-corruption/ (each: 8 rows +
  summary.json, all corpus gates PASS),
  scripts/test-r52split-a.js,
  scripts/test-r52split-sense.js.
- Do NOT push, do NOT bump, do NOT verify live — the
  batch ship job owns deploys. This arm reports its
  branch content ready for coordinator merge AFTER the
  safe-commit below; until that commit lands it is
  "written and verified, pending commit" — stated
  plainly, not dressed as merged.

## BLANKS FILLED OR DOCUMENTED

- FILLED (backlog "R52 3-file drift split UNSPLIT"): the
  r52 drift is split — corpses.js alone drives it
  (spawn-placement falsy-0 fix), abilityActions.js and
  corruption.js inert on this band. Per-file tables for
  all three singles published; combined control
  reproduced on the new base.
- FILLED: re-baseline on base 7231f9272 — identical to
  the 806ef430e table (0 field diffs). Future arms judge
  against this table or re-baseline first, not against
  -1354 or 1815.
- FILLED (method): the swap-sweep-restore driver
  (test-r52split-a.js) as a reusable single-file split
  instrument, with blob verification on every swap and
  restore.
- DOCUMENTED, NOT FIXED (for backlog, not chased here):
  (1) ability/corruption inertness is band-scoped
  (seeds 73671–73678, this substrate) — a wider-seed
  claim needs a wider run. (2) The dead-entry queue
  stall question from the flip arm (dead fireside entries
  never dropped) is untouched by this arm. (3) 73672's
  table-without-national anomaly from the flip arm is
  untouched. (4) The win-by-re-roll honesty note stands:
  single-file restorations that change RNG streams flip
  seeds chaotically; the split proves mechanism, never
  balance.

scale-onramp stays converging (NOT converged): wave 5 is
unborn on all five bands, wins come only through the
default-OFF tableseat-nowait substrate's lesser seat, and
the full seat is unreached. The split moves the
attribution, not the wall. Convergence state: converging.
