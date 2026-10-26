# sim-scale-onramp-round-1040 — coordinator evidence (axis scale-onramp)

Run: fleshout-20261026T1040Z (loop A). Lock + claim held throughout, both
deleted at closeout. Loop B live for the whole run (1035Z claim,
racksfreeze + plainvoice, plainvoice landed mid-run as 5baba2168,
coordinator evidence 992e2524b) — NOT touched; no B file, tree, or claim
was read for verdicts here.

Standing posture at run start: scale-onramp converging, NOT converged.
This run took the 0915Z run's named next blanks in order: (1) the
hunt-band table collapse, (2) the raids/pool census rerun under colB/colC.
Both are DIAG-only arms (zero src/js, zero default flips). The stale
0340Z pending-arms note was checked, not followed: all three of its arms
(deedtest, qualityrefresh, devotiongate) already landed on master with
evidence in evidence/2026-10-26/, so nothing was re-spawned from it.
Backlog note: the refresh-quality and devotion-gate backlog lines still
read [open] in sim-findings.md although their arms landed DIAG-GO; the
tracker review below records that staleness rather than re-running them.

## Pre-registration (coordinator level, binding)

- Axis: scale-onramp. Shared substrates per arm (see arm evidence).
- Each arm carried its own pre-registered DIAG-GO bar (quoted in the arm
  evidence); no bar was lowered or re-scored mid-run, and no prior corpus
  was re-judged.
- Guardrails diagnostic only: starvation, median, national-ever, wins.
- Balanced panel: scripts/balance-panel.js cannot ingest per-seed
  recorder corpora (known limitation, carried) — no panel inputs were
  fabricated; the sweep-compare tables are the comparison of record.
- Telemetry-check was run on both merged corpora (see below); the
  baseline was NOT rolled.

## Arm 1 — sim-hunttable-a: DIAG-GO (commit b8ece4a36, proof 59/0)

Question (backlog: HUNT-BAND TABLE COLLAPSE): same seeds 73901–73908 and
base, national reach identical (7/8 both arms), but driveoff-clean hunt
reads table 1/8 + wins 1/8 against the anchor's 6/8 + 6/8. Mechanism, not
correlation.

- Controls reproduced exactly: anchor invited 6/8, entered 6/8, wins 6/8,
  natEver 7/8, median 109d, deaths 180, starvation 3; hunt invited 1/8,
  entered 1/8, wins 1/8, natEver 7/8, median 170d, deaths 206, starvation
  4, 46 draws all driven off. Both recorder-neutrality det-gates MATCH
  on pilot seed 73901 before either band was spent.
- Verdict: DIAG-GO. The collapsing step is the feast-surge deed
  (`feastSurgeUsed`), divergent on 5/5 collapsed seeds (73903, 73904,
  73906, 73907, 73908) and the SOLE divergent step on 3 of them
  (73906/73907/73908: every other bar lands on the same day in both
  columns). The lesser seat needs `sentimentTaught AND feastSurgeUsed`
  (src/js/table.js `tableSeat()`); sentiment lands everywhere, the
  surge never lands under driveoff-clean. The surge marks only on a real
  feasted combat use or landed bonus healing (src/js/feastBuff.js
  `_spendFeastedPower()` / `noteFeastedCombatUse()`, via the damage
  funnel src/js/game.js `tbDamage()`); competent normally faces the
  draw while feasted (scripts/policies/competent.js `feastFightRoad()`),
  and on all 5 collapsed seeds the anchor's surge day equals the hunt's
  first granted-feast day (30/30, 45/45, 94/94, 136/136, 135/135).
  Driveoff-clean intercepts exactly that fight
  (scripts/policies/feastdraw-driveoff-clean.js `installFaceIntercept()`
  -> `driveOffFeastDraw()`), so no blow lands and the 2-dawn buff
  expires unspent. Collapsed seeds have 1–19 granted feasts and 3–69
  patrol sweeps each but zero turn-based fights starting inside any
  true feast window. The hunt's only winner, 73902, is also its only
  surge-marking seed. Wave-3 bar is a second, independent blocker on
  73903/73904 only. Starvation (4 vs 3) and longer median survival
  (170d vs 109d) rule out starvation/scale explanations.
- Sense (hunt 73906, national day 84, global day 92): a live, proud
  village that never learns the price of its choice. The First Court
  feasts, day 90 the table flickers and names "the food-thesis deeds"
  but not the act that would earn them; day 94 Serwaa's feast lands
  the x2.03 buff, the draw is driven off, day 96 the buff expires
  unspent, day 98 the realm dissolves aloud. On the anchor, day 94 is
  the surge day. Villager texture throughout is people-shaped (named
  actors, spoken reasons); no robotic dialogue found.
- Evidence: evidence/2026-10-26/sim-hunttable-a.md +
  perseed-sim-hunttable-a/ (16 rows + det-gates), scripts/
  test-hunttable-sweep.js, scripts/test-hunttable-a.js.

## Arm 2 — sim-raidpool-a: DIAG-GO (commit 5ed3e8c08, proof 153/0)

Question (backlog: RAIDS/POOL DRIFT RESIDUE UNADJUDICATED): plain rows
carry no raftdraft census, so the raids 85→91 / raiders 352→404 /
pool 1527→1346 drift between the 0126Z and 301 bands was unadjudicated,
and the true-current colA band had no raids/pool measurement at all.

- One counting definition, stated in the arm header and identical
  across columns (from src/js/havenGrowth.js `havenRaidTick`): raids =
  fired `havenRaidTick` calls; raiders = sum of drafted raiders over
  fired raids; pool = sum over fired raids of the pre-call living pool
  size (a sum over raids, not a distinct count — the ambiguity is
  stated and decided in the header, not hidden).
- Verdict: DIAG-GO, residue ADJUDICATED. colB (base competent.js
  digest 76abf6f3) reproduces the published 0126Z band exactly:
  deaths 260, natEver 6/8, starvation 9, raids 85, raiders 352, pool
  1527, poolW3 132. colC (cook-only digest 926f87f9) reproduces the
  published 301 band exactly: deaths 301, natEver 8/8, starvation 2,
  raids 91, raiders 404, pool 1346, poolW3 130. colA (true-current
  digest b0adaacc) measured for the first time: deaths 294, natEver
  8/8, starvation 2, entered 3/8, wins 3/8, wave-4 4/8, median 143d,
  raids 101, raiders 430, pool 1423, poolW3 147 — all driftwide control
  fields reproduced exactly. Per-column det-gates PASS on pilot seed
  73671 before each band, and every wrapped row equals its driftwide
  plain row per seed (24/24). Decomposition: cook fallback moves
  85/352/1527 → 91/404/1346 (more raids, more raiders, yet a smaller
  summed pool — average living pool at raid time 18.0 → 14.8); fish
  fallback moves 91/404/1346 → 101/430/1423. The true-current village
  is the most-raided of the three bands, not the least. PoolW3's
  130→147 jump hides a seed swap (73676 0→75, 73678 72→11), reported
  as seed volatility, not claimed as an effect.
- Sense: raid lines for 73671 read as the same kind of event in all
  three columns — same sentence shape, named raiders, pantry-smell
  cause, wall-or-no-walls tail (colB and colC share the d8 line
  word-for-word). The awayNews recap line — the village reporting a
  raid to the returning scholar days later — is people-like memory.
  Day-1 say sample is people-shaped, not robotic.
- Evidence: evidence/2026-10-26/sim-raidpool-a.md +
  perseed-sim-raidpool-a/ (24 wrapped rows + 9 det-gate rows),
  scripts/policies/raidpool-diag.js (new recorder; raftdraft-diag.js
  NOT edited or imported), scripts/test-raidpool-sweep.js,
  scripts/test-raidpool-a.js. No corpus carried across a rebase, no
  sibling corpus copied. Proof first run 148/5 — all 5 were proof-leg
  bugs (deaths-map key-order comparison; raid-line filter counting
  the awayNews recap as a firing), disclosed in the arm evidence;
  rows never edited.

## Wall numbers (judge future arms against raidpool colA + hunttable)

- Raidpool colA (73671–73678, tableseat-nowait): national-ever 8/8,
  national-final 5/8, table 4/8, entered 3/8, wins 3/8 (lesser only),
  wave-4 4/8, wave-5 0/8, full seat 0/8, median 143d, deaths 294,
  starvation 2, raids 101, raiders 430, pool 1423.
- Hunttable (73901–73908): anchor national-ever 7/8, table invited
  6/8, entered 6/8, wins 6/8, wave-5 0/8, median 109d; hunt
  national-ever 7/8, table invited 1/8, entered 1/8, wins 1/8,
  wave-5 0/8, median 170d.
- In plain words: villages now reach national reliably and even win
  through the lesser seat, but only when they are handed the
  courtship and seat instruments — and the table itself is picky in
  a way the game never says out loud. Refuse a feast-draw fight and
  the village quietly gives up the one deed the lesser seat wants
  most: it never gets told it missed anything. The full seat is still
  unreached everywhere, wave 5 still has zero births, and the village
  that survives best is now also the village raided most.

## Village assessment (plain words)

This run's villages looked like people, not counters. They feasted,
bragged, mourned, and reported raids to a returning scholar days
later. What they did NOT look like is informed: a village can do
everything right at the national scale and still lose the table
because one quiet deed — landing a single feasted blow — never
happened, and nothing in the game names that deed as the price.
That is the blank this run fills: the table collapse is no longer a
mystery correlation, it is one named step with a code path. The raid
census blank is likewise filled: the drift numbers were real
trajectory moves under one counting definition, not counting changes,
and the current village's raid load is now measured (101 raids).

## Blanks filled or documented

- FILLED (DIAG-GO, landed): hunt-band table collapse mechanism
  (feast-surge deed); raids/pool drift residue (adjudicated, colA
  measured).
- DOCUMENTED, not fixed (next blanks, in order): (1) the choice-price
  gap — the in-game draw choice reads as free while silently
  forfeiting a table-priced deed (a design call, not made here);
  (2) the wave-3 bar as second blocker on 73903/73904; (3) wave-5
  still 0/8 on both arms; (4) poolW3 seed volatility (73676/73678
  swap) as a measurement caution; (5) the stale backlog lines for
  refresh-quality and devotion-gate (arms landed DIAG-GO, backlog
  still reads [open] — a bookkeeping fix for a later run, not a
  re-run); (6) the 0915Z remaining blanks that this run did NOT
  take: wound-closure pricing paper then Steve's ruling on
  met-below-line finishing (defender-finish stays KILLED), melt
  ruling for Steve, defender-fight narration boilerplate +
  wait-line repetition (sense arms), and a future transient hunt
  needing more seeds or a first-night stressor.
- No back-to-back second round: both arms resolved, elapsed >30 min,
  and the next blanks need design calls.

## Telemetry deviation check (body step 10)

- Hunttable corpus: 2 LOUD lines (national 12→0, wins 16→0, n=21
  files). Raidpool corpus: 2 LOUD lines (national 12→0, wins 16→0,
  n=34 files). Both are the known ingestion-shape artifact class:
  the checker reads top-level national/wins keys that recorder rows
  do not carry (rows carry nationalEver/won/table); actuals are
  national-ever 7/8 + wins 6/8/1/8 (hunttable) and national-ever 8/8
  + wins 4/4/3 (raidpool). Baseline NOT rolled, no investigation
  item. This reconfirms the standing telemetry-check counting
  mismatch on recorder rows; do not roll a baseline on recorder
  corpora.

## Metric review (docs/MEASUREMENT.md §14)

- Hunttable: judged only against its pre-registered DIAG-GO bar
  (a table-chain step divergent on ≥3 collapsed seeds, code path
  cited) — met at 5/5, sole step on 3/5. Guardrails reported, never
  verdict-flipping. No bar was changed mid-run.
- Raidpool: judged only against its pre-registered DIAG-GO bar
  (colB 85/352/1527 AND colC 91/404/1346 reproduced exactly, colA
  measured) — met exactly, including the unjudged poolW3 cross-check
  (132/130 exact). No bar was changed mid-run.
- Method note carried from the raidpool arm: per-seed wall time ran
  ~40–140s, not the brief's ~3–4s estimate; future recorder arms
  should budget ~90s/seed.

## Infrastructure

- Master moved 4 times under the run from sibling lanes (journey
  r51, Lane B social r55 adoption + verification, loop B plainvoice
  + coordinator evidence 992e2524b) — zero file overlap with either
  arm; both branches rebased clean in their own worktrees (hunttable
  once, raidpool once after the hunttable merge), proofs green after
  every rebase (hunttable 59/0, raidpool 153/0) and on merged master
  (same ff-only content, re-run green).
- Safe-commit index clobber hit both worker commits (repaired via
  HEAD-blob cacheinfo by the workers, commits verified correct);
  no clobber on the coordinator commit (verified below).
- No EPERM flap blocked this run. Worktree registration was slow
  (~100s each) but succeeded first try both times.
- check.js --quick NOT re-run: zero src/js, own proofs green on
  merged master, standing 279/8 pre-existing profile just
  re-attributed by loop B's 1035Z run.
- Main tree clean at closeout; both worktrees released
  (done-merged), removed, branches deleted; final reap ran clean
  (active 5/16, all remaining trees hold sibling uncommitted work,
  none removed).

## Convergence state

scale-onramp stays converging (NOT converged): the table collapse is
solved to a single named step and the raid census is settled, but
wins still come only through default-OFF courtship + seat
instruments, only through the lesser seat, the full seat is still
unreached, and wave 5 still has zero births. The standing directive
stands until the tracker records this axis converged on measured
evidence. food-economy stays converging (untouched; sibling loop B).
Rotation left at 3 (convergence work does not cycle it).

Merged locally, pending ship. Coordinator evidence commit follows this
file; arm commits b8ece4a36 (hunttable) and 5ed3e8c08 (raidpool).
