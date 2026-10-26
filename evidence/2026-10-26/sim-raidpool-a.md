# sim-raidpool-a — raids/pool drift residue adjudication (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-raidpool-a (worker tree
sim-raidpool-a). DIAG ONLY — zero src/js changes, zero default
flips, new files only; no existing policy, sweep, summary, or
check file edited. No tuning against any band.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/SCALE.md (scale ladder;
  raids enter the ladder only via the CONQUEST road and the
  reactive raid beat), and the raid code itself
  (src/js/havenGrowth.js havenRaidTick, read from code, never
  invented). No canon is invented here: the question is a
  measurement adjudication, not a design.
- The residue (from run fleshout-20261026T0915Z arm
  sim-driftwide-a, evidence/2026-10-26/sim-driftwide-a.md, read
  FULLY first, including its column method for swapping
  competent.js and its C5 section): plain rows carry no
  raftdraft census, so the raids 85→91 / raiders 352→404 /
  pool 1527→1346 drift between the 0126Z and 301 bands is
  unadjudicated, and the true-current colA band has no
  raids/pool measurement at all.
- Substrate, identical for all three columns: seeds 73671–73678,
  tableseat-nowait policy (LEANLINKRESCUE=1 +
  TABLESEATNOWAIT=1), 180d death-aware horizon (runDays stops
  on death/win; 180 is the cap). Column method, as driftwide:
  the ONLY difference between columns is the worktree's
  scripts/policies/competent.js, swapped by
  `git show <commit>:scripts/policies/competent.js` and restored
  afterwards, sha-verified after every swap and every restore.
  Band tables MUST name the competent.js digest per column
  (the carried-corpus rule from driftwide). No corpus is
  carried across a rebase in this run: every row below is
  freshly swept in this worktree, on this HEAD (be8541647);
  driftwide rows are used ONLY as the published-band
  comparison, never copied into this corpus.
- Columns:
  - colB: base competent.js (commit 8ea64d848, digest
    76abf6f3, 0126Z substrate). Published band to reproduce:
    deaths 260, natEver 6/8, starvation 9, raids 85, raiders
    352, pool 1527.
  - colC: cook-only competent.js (commit 3701dfa4a, digest
    926f87f9, 301 band). Published band to reproduce: deaths
    301, natEver 8/8, starvation 2, raids 91, raiders 404, pool
    1346.
  - colA: true-current competent.js (HEAD, digest b0adaacc).
    Published band: deaths 294, natEver 8/8, entered 3/8, wins
    3/8, wave-4 4/8, starvation 2, raids/pool UNMEASURED — this
    run measures them.
- ONE counting definition, stated here and identical across
  all three columns (read from src/js/havenGrowth.js
  havenRaidTick and from scripts/policies/raftdraft-diag.js,
  the instrument that produced both published bands; this
  run's NEW recorder scripts/policies/raidpool-diag.js
  implements the same definition independently, and the
  reproduction test below is what proves the definitions
  coincide):
  - raids = number of FIRED havenRaidTick calls in the run:
    a call counts iff village.lastRaidDay changes across the
    call (the engine sets it only on the raid path, after the
    3+-living-monster, 3000+-pantry, cooldown, and ~18% roll
    gates). Non-firing calls count for nothing.
  - raiders = sum over fired raids of the drafted raider
    count: living world monsters sorted by Manhattan distance
    to Haven, first raidN taken, raidN = min(5, 3 + (pantry >
    12000) + (pantry > 24000)), pantry read at raid time.
  - pool = sum over fired raids of livingN: the count of
    living (hp > 0) world monsters in the pre-call pool
    snapshot at that raid. Pool is a SUM OVER RAIDS, not a
    distinct-monster count and not a final-day census — the
    same monster counts again at every raid it survives to.
    (Ambiguity, stated and decided: "pool" could also be read
    as the final pool size or a distinct count; neither
    reproduces 1527/1346, and the published bands are sums
    over raids — see the drawwave sweep's pooling code,
    `raftPoolTotal = sum(livingN)`. This run uses the
    sum-over-raids definition, documented here.)
  - poolW3 (reported, not judged): sum over fired raids of
    the wave-3+ count in the pre-call living pool, wave via
    Game.crisisWaveOf (m.wave is never on the entity).
  - Control fields per column (same script, same seeds):
    deaths, starvation deaths (cause matching
    /starv|hunger/i, the driftwide regex), national-ever.
- Recorder neutrality, per column, BEFORE that column's band
  is spent (the det-gates ARE the pilot): on pilot seed
  73671, a plain run (tableseat-nowait, no recorder) and a
  wrapped run (tableseat-nowait + raidpool-diag) must agree
  exactly on days, gameDays, won, deaths (full deaths map),
  and tsNationalDay; a wrapped rerun must agree with the
  wrapped run on the same fields. The recorder wraps ONLY
  Game.havenRaidTick (pre-call pool snapshot, post-call
  fired/read) and Game.say (capture-only, delegating to the
  harness's silenced original); it writes no game state,
  draws no RNG, and never throws into the engine (recording
  errors are counted, diag errs must be 0). If any det-gate
  fails, that column's band is NOT spent and the run reports
  INSTRUMENT-FAILED for that column, not a verdict.
- Each column runs with its OWN fresh control side on
  identical seeds: the per-column det-gate plain pilot above.
  No sibling corpus is copied: every row in
  evidence/2026-10-26/perseed-sim-raidpool-a/ is swept fresh
  in this run. Driftwide plain rows are compared
  field-by-field as an additional cross-check, attributed as
  predecessor-corpus comparison, never as this run's rows.
- DIAG-GO requires ALL of: colB reproducing 85/352/1527 AND
  colC reproducing 91/404/1346 exactly on all three counts
  (with deaths/starvation/natEver also matching the
  published band numbers as a control check) AND colA
  raids/pool measured and published — then the residue is
  ADJUDICATED (real trajectory moves, not counting changes).
  Any count mismatch = DIAG-NO-GO on adjudication: the
  residue stays open, with the mismatch named per count and
  column. No metric re-scoring mid-run, no re-judging the
  driftwide corpus, no tuning against any band.
- METRIC REVIEW section below is mandatory
  (docs/MEASUREMENT.md §14). Balanced panel: NOT run —
  scripts/balance-panel.js cannot ingest per-seed recorder
  corpora (do NOT fabricate panel inputs); the sweep-compare
  table is the comparison of record. Telemetry-check: NOT
  run on recorder rows, and NO baseline is rolled.
- SENSE plan: read the raid lines (the engine's `🐗 RAID —`
  say line, captured by the recorder) for one seed per
  column and say whether raids read as the same kind of
  event across columns, plus a villager-behavior spot check
  from captured say-lines. No transcript is fabricated:
  the harness silences narration by default, so only lines
  the recorder itself captures are quoted.

## RESULTS (written after the sweeps; the pre-registration above was written before them)

## VERDICT: DIAG-GO — the raids/pool residue is ADJUDICATED

- Column B (base competent.js, digest 76abf6f3) reproduces
  the 0126Z band EXACTLY on counts AND control fields:
  deaths 260, natEver 6/8, starvation 9, raids 85, raiders
  352, pool 1527 — and per-seed exactly on every trajectory
  field, the full deaths map, and ts (verified against the
  driftwide plain rows, which are themselves identical to
  the rebaseline rows).
- Column C (cook-only competent.js, digest 926f87f9)
  reproduces the 301 band EXACTLY on counts AND control
  fields: deaths 301, natEver 8/8, starvation 2, raids 91,
  raiders 404, pool 1346 — and per-seed exactly on the same
  fields (verified against the driftwide plain rows and,
  for raids/pool, against the drawwave armed corpus:
  91/404/1346 there too).
- Column A (true-current competent.js, digest b0adaacc) is
  now MEASURED for the first time: raids 101, raiders 430,
  pool 1423, poolW3 147 — with all driftwide control fields
  reproduced exactly (deaths 294, natEver 8/8, starvation 2,
  entered 3/8, wins 3/8, wave-4 4/8, median 143d).
- The residue is therefore ADJUDICATED, not a counting
  change: the same recorder, the same definition, the same
  script, three competent.js variants — and the published
  numbers fall out exactly at each step. The drift is real
  trajectory movement, decomposed below. No count mismatch
  on any judged field, so no DIAG-NO-GO leg fires.

Band comparison (n = 8, seeds 73671–73678, tableseat-nowait, 180d death-aware):

| band | competent.js digest | deaths | natEver | starv | raids | raiders | pool | poolW3 |
|---|---|---|---|---|---|---|---|---|
| 0126Z (colB) | 76abf6f3 (base) | 260 | 6/8 | 9 | 85 | 352 | 1527 | 132 |
| 301 (colC) | 926f87f9 (cook-only) | 301 | 8/8 | 2 | 91 | 404 | 1346 | 130 |
| TRUE CURRENT (colA) | b0adaacc (cook+fish) | 294 | 8/8 | 2 | 101 | 430 | 1423 | 147 |

Per-seed raids / raiders / pool / poolW3 (days/deaths from
the trajectory rows; poolW3 reported, not judged):

| seed | colB | colC | colA |
|---|---|---|---|
| 73671 | 16 / 74 / 342 / 33 | 12 / 53 / 176 / 23 | 17 / 72 / 259 / 11 |
| 73672 | 7 / 28 / 127 / 9 | 13 / 60 / 142 / 0 | 13 / 60 / 142 / 0 |
| 73673 | 7 / 30 / 104 / 4 | 6 / 27 / 137 / 14 | 9 / 39 / 155 / 18 |
| 73674 | 13 / 60 / 197 / 13 | 14 / 66 / 151 / 0 | 14 / 66 / 151 / 0 |
| 73675 | 14 / 52 / 192 / 28 | 12 / 50 / 173 / 2 | 15 / 66 / 180 / 13 |
| 73676 | 7 / 28 / 121 / 0 | 11 / 50 / 221 / 0 | 12 / 44 / 229 / 75 |
| 73677 | 12 / 45 / 282 / 27 | 10 / 43 / 146 / 19 | 10 / 43 / 146 / 19 |
| 73678 | 9 / 35 / 162 / 18 | 13 / 55 / 200 / 72 | 11 / 40 / 161 / 11 |

Decomposition (read the steps, not just the totals):

- Cook fallback (colB → colC, 0126Z → 301): raids +6
  (85→91), raiders +52 (352→404), pool −181 (1527→1346).
  More raids drafting more raiders, yet a SMALLER summed
  pool: the average living pool at raid time falls from
  18.0 to 14.8 monsters per raid. The villages that learn
  to staff the cook fire live different lives — they raid
  more often (73672 jumps 7→13 raids) but the woods at
  raid time are thinner, because the trajectories that
  used to stall hungry now push on and burn through the
  world pool differently. Per-seed pool moves are mostly
  down (73671 −166, 73677 −136) with two rises (73676
  +100, 73678 +38); the total is a real reshuffle, not a
  counting artifact.
- Fish fallback (colC → colA, 301 → true current):
  raids +10 (91→101), raiders +26 (404→430), pool +77
  (1346→1423). True current is the most-raided band of
  the three: the creek staffed like the cook fire means
  more nights with teeth at the door, and a slightly
  fatter summed pool (14.8 → 14.1 monsters per raid on
  average — more raids, similar thinness). PoolW3 jumps
  130→147, but that total hides a seed swap, not a trend:
  73676's wave-3+ pool goes 0→75 while 73678's goes
  72→11. Wave-3+ presence at raid time is seed-volatile;
  it is reported here, never claimed as a fallback effect.
- Cross-checks that strengthen the adjudication: colB
  poolW3 132 reproduces the rebaseline poolW3 exactly;
  colC poolW3 130 reproduces the drawwave armed poolW3
  exactly, per-seed identical (73671 23, 73673 14, 73675 2,
  73677 19, 73678 72, zeros elsewhere). A fourth count,
  unjudged, falling out exact is the signature of a
  definition that coincides, not of a tuned one.

Recorder-neutrality det-gates (each BEFORE its column's
band was spent, pilot seed 73671, plain vs wrapped vs
wrapped rerun on days/gameDays/won/deaths-map/
tsNationalDay):

- colB: plain 180d/181 gameDays/won 0/deaths 31/tsNat 77 ==
  wrapped (raids 16) == rerun. PASS. Wrapped 73671 =
  16/74/342/33, the rebaseline row exactly.
- colC: plain 160d/160/won 0/deaths 50/tsNat 77 == wrapped
  (raids 12) == rerun. PASS. Wrapped 73671 = 12/53/176,
  the drawwave armed row exactly.
- colA: plain 180d/181/won 0/deaths 22/tsNat 107 ==
  wrapped (raids 17) == rerun. PASS. Wrapped 73671 =
  17/72/259, the new true-current measurement.
- Full-column cross-check: every wrapped row also equals
  its driftwide plain row per seed on trajectory + deaths
  map + ts (24/24). The recorder changes no trajectory it
  measures — the det-gate is not a pilot-only promise.

## SENSE: raids read as the same kind of event across columns

Read the firing lines for seed 73671 in all three columns
(the engine's `🐗 RAID —` say line, captured by the
recorder; one seed per column, as pre-registered):

- colB d8: "5 raiders (The Anaconda Empress, Drum-Belly,
  Nevermore, Murkcap, Drum-Belly) hit Haven in the night,
  drawn by the smell of the pantry! No walls. No warning
  but the noise."
- colC d8: the SAME line, word for word — same world,
  same first raid, before the staffing reshuffle diverges
  the trajectories (colC's second raid lands d25, colB's
  d22).
- colA d9: "4 raiders (Cliffhanger, Murkcap, The Anaconda
  Empress, Nightlight) hit Haven in the night, drawn by
  the smell of the pantry! No walls. No warning but the
  noise." — one day later, a different draft, the same
  sentence shape, the same cause (pantry smell), the same
  stakes (no walls yet).
- The escalation line reads identically across columns
  too: "One of them is bigger than the usual teeth at the
  door — Buffering came with this raid, and the wall was
  not built for its kind." (colB and colA both, d145;
  colC's names The Callback, d85). A raid is a raid in
  every column: named teeth, a pantry cause, a wall (or
  its absence) — never a bare count.
- Second raid narration, found while checking the proof:
  a "🐗 RAID at Haven last night" line (havenGrowth.js
  awayNews) is told to the scholar on return — 73677 d122
  for the d117 raid, 73678 d84 for the d82 raid. The
  village REMEMBERS the raid and reports it to the
  returning leader. That is people-like memory, and it is
  also why the first proof run's raid-line filter had to
  be the firing line only (see metric review).

Villager-behavior spot check (captured say-lines, colA
73671, opening days — the sample is the first 50 lines,
so this is a day-1 spot check, stated as such, not a
whole-run claim): a person approaches on day one —
"Day one. Everyone's pretending they're fine. ...Can we
talk? Just talk — like people used to." Someone hums,
and stops when noticed listening. Brunhilde and Landon
linger over the fire together; Daniela and Brunhilde do
the same. Water carriers return by name-shape ("a woman,
maybe 30s returns with water"), a hurt villager is
noticed ("a woman, maybe 60s is hurt — a fall, a thorn,
a bad step"). Nothing here reads as a robotic list: the
village opens with approach, music, pairing, and injury
— small social facts, not counters.

## WALL NUMBERS (judge future arms against colA, the true-current band)

national-ever 8/8, national-final 5/8, table invited 4/8,
entered 3/8, wins 3/8 (lesser seat only), wave-4 4/8,
wave-5 0/8, full seat 0/8, median survival 143d, max
180d, deaths 294, starvation 2, raids 101, raiders 430,
pool 1423 (poolW3 147). The wall stands where driftwide
left it, now with its raid census attached: villages
reach national 8/8 yet still die, wave 5 still unborn,
the full seat still untouched — and the true-current
village is the most-raided of the three bands, not the
least. More raids did not buy the climb.

## VILLAGE ASSESSMENT (plain words)

Three times the same eight villages lived, and each time
the kitchen staff changed, the nights changed with it.
With nobody reliably staffing cook or creek, the woods
came in big, infrequent waves — 85 raids, but each one
met a thick world (18 monsters waiting on average).
Once a cook could be found, the raids came more often
and thinner: 91 raids against a world that was already
partly spent. Then the creek got staffed too, and the
nights got busiest of all — 101 raids, the most teeth
at the door of any band — while the villages still
stalled at the same wall: national reached, table
entered by three, wave 5 never. Better staffing does not
mean quieter nights; it means busier ones, because
villages that eat live long enough to smell longer.
The blank this arm fills is measurement, not behavior:
the raids/pool drift that haunted the driftwide verdict
now has three exact tables, a stated definition, and a
new recorder that any future arm can re-run — and the
next lever arm finally knows how many raids its village
is actually living through.

## BLANKS FILLED OR DOCUMENTED

- FILLED: the raids/pool drift residue — colB and colC
  bands reproduced exactly (counts + control fields +
  per-seed), colA raids/pool measured for the first time
  (101/430/1423), all under one stated definition.
- FILLED (method): the NEW raftdraft-census recorder
  (scripts/policies/raidpool-diag.js) — havenRaidTick +
  capture-only say wrap, proven recorder-neutral per
  column — plus the sweep (scripts/test-raidpool-sweep.js)
  and proof (scripts/test-raidpool-a.js, 153/153).
- DOCUMENTED, NOT FIXED (carried, not chased here):
  (1) poolW3's seed volatility (73676 0→75 vs 73678
  72→11 across the fish step) is a measurement note, not
  a claimed effect; (2) the say sample is day-1 only
  (first 50 lines) — a whole-run villager-behavior read
  would need a larger sample window; (3) per-seed run
  wall time ran ~40–140s, not the brief's ~3–4s
  estimate — throughput planning for recorder arms
  should budget ~90s/seed.
- NOT DONE (by design, per the arm brief): no game-code
  change of any kind; no tuning against any band; no
  re-judgment of prior corpora; no telemetry-check; no
  balanced panel (cannot ingest recorder corpora — the
  sweep-compare table above is the comparison of
  record); no baseline rolled; no push, no bump, no
  live verification.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No pre-registered metric was re-scored mid-run.
  DIAG-GO is judged on the letter of the pre-registration:
  colB 85/352/1527 exact, colC 91/404/1346 exact, colA
  raids/pool measured and published (101/430/1423) — all
  three hold, with deaths/starvation/natEver matching
  their published bands as control checks. No threshold
  was moved, no band relabeled.
- Two PROOF-LEG corrections, disclosed (rows never
  edited): (1) the first proof run failed 2 legs
  (colC/colA 73671 vs driftwide plain) because it
  compared deaths maps with JSON.stringify, which is
  key-order sensitive, while the two corpora persist
  maps in different key orders (same counts, verified
  sorted-equal) — replaced with an order-insensitive
  comparison, the same class as driftwide's disclosed
  objEq fix; (2) the first proof run failed 3 raid-line
  legs (colC 73677, colA 73677, colA 73678) because it
  counted every line containing 'RAID', but the
  'RAID at Haven last night' awayNews recap is not a
  firing — the filter is now the firing line 'RAID —'
  only. Final proof: 153 passed, 0 failed (first run
  148/5, all 5 proof-leg bugs).
- No pre-registration deviation in column order or
  instrument: det-gates ran before each column's band,
  competent.js was sha-verified after every swap and
  every restore (base 76abf6f3 → restored b0adaacc →
  cook-only 926f87f9 → restored b0adaacc), and the
  final tree's competent.js == HEAD (b0adaacc).
- Revision proposed for the NEXT run (not applied here):
  future recorder proofs should state the firing-line
  filter and the deaths-map comparison order in the
  pre-registration itself, so neither correction has to
  be disclosed after the fact; and recorder arms should
  budget ~90s/seed of wall time, not ~3–4s.
- The telemetry-check and balanced panel were NOT run,
  per the brief (panel cannot ingest per-seed recorder
  corpora; do NOT fabricate panel inputs). No baseline
  was rolled.

## Infrastructure notes

- Sweep: scripts/test-raidpool-sweep.js (one seed per
  invocation; ROWJSON stdout fallback on write failure,
  never needed — no write failures hit this run).
  Corpus: evidence/2026-10-26/perseed-sim-raidpool-a/
  (24 wrapped rows + 9 det-gate rows + summary.json).
  Proof: scripts/test-raidpool-a.js — 153 passed, 0
  failed (after the two disclosed proof-leg fixes).
- Recorder: scripts/policies/raidpool-diag.js (new file;
  raftdraft-diag.js NOT edited, NOT imported — the
  reproduction of 85/352/1527, 91/404/1346, and
  poolW3 132/130 is what proves the definitions
  coincide).
- Det-gates PASS (colB, colC, colA, pilot 73671 each).
  check.js NOT run: zero src/js diff in this arm's
  final tree (DIAG only); the arm's own proof tests are
  the verification of record. Worktree heartbeat kept
  fresh throughout.
- Commit: sim-raidpool-a, DIAG ONLY, zero src/js diff,
  zero policy diff in the final tree (all three
  competent.js variants were restored after their
  columns; HEAD content verified by sha). Ready for
  coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).

