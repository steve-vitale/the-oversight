# sim-r54bisect-a — bisect the 0126Z → current control drift (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, arm sim-r54bisect-a (worker tree
sim-r54bisect-a). DIAG ONLY — zero game-code changes landed. The
only worktree mutation outside new files is temporary: the exact
inverse of de87ffe79's conversation.js hunk, applied for column B
and restored with `git checkout --` before commit (proof test leg
1 verifies the column-B code identity from the recorded shas).

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave
  law), docs/SCALE.md (the ladder: village → regional →
  national → global, one rung per season), docs/TABLE.md (the
  table prices the run, never gates on godhood; lesser seat
  reachable by competent non-god play). No canon is invented
  here: the substrate is the tableseat-nowait policy, not a new
  system, and the question is a code-bisect, not a design.
- Delta verification (done BEFORE sweeping, not trusted from
  the brief): `git log 8ea64d848..HEAD -- src/` shows exactly
  two commits touching src/ — de87ffe79 (conversation.js
  +17/-1, the r54 winddown grace beat; the brief's "+18/-1"
  misreads git's stat total of 18 changed lines) and cc855cf08 (build.js
  version stamp only; its index.html/sw.js/version.json
  changes are build artifacts). The longer commit list between
  base and this worktree's HEAD is scripts/evidence-only
  (zero src/js). `git log de87ffe79..HEAD -- src/js/
  conversation.js` is empty: conversation.js at HEAD equals
  its de87ffe79 state, so the reverse-apply is exact. If the
  delta had differed, the run would have stopped here.
- Shared band, trajectory for trajectory: seeds 73671–73678,
  tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  scripts/policies/tableseat-nowait.js reused unmodified),
  180d death-aware horizon (runDays stops on death/win; 180
  is the cap, not a fixed horizon). Recorder-free plain runs:
  the rebaseline proof showed plain rows reproduce recorder
  rows exactly on every trajectory field, so plain rows are
  the comparable instrument for both columns.
- Column A: current master as-is (grace beat present). Column
  B: the exact inverse of de87ffe79's conversation.js hunk,
  reverse-applied in this worktree only. Same script, same
  seeds, same policy, same mode string — the worktree's
  conversation.js is the only difference. Each row records
  conversationSha so the proof can prove which code ran.
- VERDICT (binding, judge only against this):
  - CONFIRMED if column B returns to the 0126Z shape:
    deaths ≤ 270 AND national-ever ≤ 6/8 AND starvation ≥ 6,
    with table/wins/final not collapsing (table ≥ 3, wins ≥ 3,
    national-final ≥ 4).
  - EXONERATED if column B matches the current band:
    deaths ≥ 290 AND national-ever 8/8.
  - INCONCLUSIVE otherwise — reported as such, never re-scored
    against a friendlier reading.
- The 0126Z shape (base 8ea64d848, evidence/2026-10-26/
  sim-rebaseline-a.md): deaths 260, national-ever 6/8,
  national-final 5/8, table 4/8, wins 4/8 lesser only, wave-4
  5/8, wave-5 0/8, median 143d, starvation 9.
- The current band (natpair + drawwave, same seeds/substrate,
  evidence/2026-10-26/sim-scale-onramp-round-0715.md): deaths
  301, national-ever 8/8, national-final 5/8, table 4/8,
  wins 4/8, wave-4 5/8, wave-5 0/8, median 143d, starvation 2.
- Balanced-panel note: do NOT fabricate panel inputs for
  recorder corpora (known limitation); the sweep-compare
  table below is the comparison of record. Do NOT run
  telemetry-check on recorder rows and do NOT roll any
  baseline (standing instruction, ninth sighting class).
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.

## RESULTS (written after the sweeps; the pre-registration above was written before them)

## VERDICT: EXONERATED — and stronger than the threshold: the columns are IDENTICAL

Column A (current master, grace beat present) and column B
(grace beat removed by exact inverse) agree on EVERY compared
field for all 8 seeds: trajectory fields (days, gameDays,
endReason, won, waveReach, maxArc, finalRank, maxRank,
nationalEver, nationalFinal, table, entered, deathTotal,
starvationDeaths), the full deaths map, the ts counters,
final population / pantry / knowledge, and the starvation
detail. Removing the r54 hunk moved nothing on this band —
not one day, not one death, not one rank. The pre-registered
EXONERATED bar was deaths ≥ 290 AND national-ever 8/8;
column B reads deaths 301, national-ever 8/8, i.e. the
current band exactly. The r54 winddown grace beat is NOT
the cause of the 0126Z → current drift. The drift cause
remains open: the only other src/ delta is the cc855cf08
version stamp (build.js string + build artifacts), which
contains no game logic and which node sims do not load
(the harness evals src/js directly, never index.html/sw.js).
So the drift's cause is NOT in the src/ delta at all on its
face — the next bisect must look wider (policy/substrate
history, harness inputs, or a base misattribution), not at
r54. Do NOT tune against either band until that is settled;
the 0126Z table stays stale and the current band (301/8/2)
is the table these two columns jointly re-prove.

Band comparison (n = 8, seeds 73671–73678, tableseat-nowait,
180d death-aware):

| band | deaths | natEver | natFinal | table | entered | wins | wave4 | wave5 | Arc IV | median | starv |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0126Z (base 8ea64d848) | 260 | 6/8 | 5/8 | 4/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 143d | 9 |
| colA (current master) | 301 | 8/8 | 5/8 | 4/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 143d | 2 |
| colB (r54 inverse) | 301 | 8/8 | 5/8 | 4/8 | 4/8 | 4/8 | 5/8 | 0/8 | 4/8 | 143d | 2 |

Column A reproduces the natpair/drawwave current band
per-seed exactly (every trajectory field, all 8 seeds),
so the current band is triply confirmed (natpair recorder
rows, drawwave recorder rows, plain rows here).

Per-seed table (columns A and B IDENTICAL — one table serves
both; days = run days; end: survived / over-other = game over
with a win / village-lost; fin = final rank; mx = max rank;
ne/nf = national-ever/final; tab = invited; ent = entered;
pop = final population; pantry = final kcal):

| seed | days | end | won | wave | arc | fin | mx | ne | nf | tab | ent | deaths | starv | pop | pantry |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 160 | village-lost | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 50 | 0 | 6 | 8,484 |
| 73672 | 180 | survived | 0 | 3 | 3 | global | global | 1 | 1 | 0 | 0 | 24 | 0 | 8 | 41,311 |
| 73673 | 90 | over-other | 1 | 4 | 4 | national | national | 1 | 1 | 1 | 1 | 26 | 0 | 9 | 36,153 |
| 73674 | 139 | over-other | 1 | 4 | 4 | global | global | 1 | 1 | 1 | 1 | 35 | 0 | 7 | 38,816 |
| 73675 | 132 | over-other | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 30 | 0 | 8 | 6,758 |
| 73676 | 124 | over-other | 1 | 3 | 4 | global | global | 1 | 1 | 1 | 1 | 33 | 0 | 7 | 24,934 |
| 73677 | 143 | village-lost | 0 | 4 | 3 | regional | global | 1 | 0 | 0 | 0 | 45 | 0 | 1 | 3,500 |
| 73678 | 173 | village-lost | 0 | 4 | 3 | regional | national | 1 | 0 | 0 | 0 | 58 | 2 | 1 | 0 |

Determinism legs: colA 73671 rerun == colA main on every
trajectory field + deaths map; colB 73671 rerun == colB main
on the same; sweep --detgate on 73671 (two plain runs)
trajectory-identical, PASS. Proof: scripts/test-r54bisect-a.js
— 111 passed, 0 failed (inverse identity via patch-parsed
in-memory reverse-application: colB shas equal the inverse
sha, colA shas equal the HEAD file sha; band + verdict
recomputed from rows equal summary.json; sense checks
win→national+entered etc. pass on both columns; corpus
hygiene: 8+8 rows + 2 reruns + summary, no extra files).

Inverse-identity detail: the worktree reverse diff read
`1 insertion, 17 deletions, index 53a4bceed..f1eb01639` —
the commit's index line exactly reversed — and the proof's
patch-parsed inversion reproduces the same bytes
(conversationSha colB e2d10a5fd5d4…, colA cfb933238bf1…).
One proof-check correction during the run (not a metric
change): the first proof run failed one leg because it
asserted the inverse lacks the string 'nv:nod' — but that
choice id also lives at conversation.js 4405/5613 outside
the hunk. The check was narrowed to the hunk's full
choice-list line + comment header, and then passed 111/111.
The brief's "+18/-1" label was likewise corrected to
+17/-1 (git's stat total of 18 changed lines, 17 added +
1 removed); the hunk identity itself was never in doubt.

## WHAT THE GRACE BEAT DOES (plain words)

When you are wrapping up a conversation — the game has queued
its goodbye because your talk budget is spent — you get a
closing menu. You can leave, or you can take one more beat:
"One more thing —", agree, joke, sit in silence, or nod.
Before r54, picking one of those non-leave options ran its
branch and spoke its line, but the sitting then closed
silently: the turn's answer vanished and the transcript
showed no closing line (r53 seed 638 day 5, Jorge: winddown
'more' → THEM: (no line)). The grace beat ends the sitting
WITH that line as the closing line instead of behind it.
Leaving still leaves earlier through its own path, and if
there is no line at all the old quiet close stays. In code
terms the hunk changes only the returned turn result's `line`
field on that one path; the sitting ends through the same
winddown result either way. Nothing about food, fights,
trust, scale, or the table is touched by this hunk on its
face — which is exactly why the drift, if it traces to this
hunk, would be a mechanism surprise worth reporting rather
than a number to tune.

## WALL NUMBERS

national-ever 8/8, national-final 5/8, table invited 4/8,
entered 4/8, wins 4/8 (lesser seat only), wave-4 5/8, wave-5
0/8, full seat 0/8, Arc IV 4/8, median survival 143d, max
180d, deaths 301 — on BOTH columns. The wall stands where
the 0715 run left it: wave 5 unborn, the full seat
untouched, wins only through the lesser seat, and the new
shape is scale-and-die (villages reach national 8/8 yet
still die more). The drift behind that shape is now known
NOT to be r54.

## VILLAGE ASSESSMENT (plain words)

The village this run looks exactly like the village the
0715 run described — because it is, seed for seed, the
same eight villages living the same eight lives whether
or not the goodbye line shows. Eight out of eight become
realms; four sit at the lesser seat and win; three fall
apart and are lost; one (73672) survives to day 180 as a
global power with 41,311 kcal in the pantry and never sits
at all. The two villages that used to stall and starve on
the old band (73675, 73676) now win through the lesser
seat — that change is real, it is in the current band on
both columns, and it is not the goodbye line's doing.
Nothing in these rows reads robotic: the wins arrive
through the seat legs at national+, the losses read as
realms coming apart (73671, 73677, 73678 all end regional
after having touched national or global), and the one
starvation remainder (73678, 2 deaths, 1 person, 0 kcal)
is a village that held on until day 173 and then ran out
of everything. The blank this arm fills is measurement,
not behavior: a suspect has been cleared, and the village
is exactly as the last run left it.

## BLANKS FILLED OR DOCUMENTED

- FILLED (the topmost named blank from the 0715 run): the
  r54 bisect — journey-landing r54's winddown grace beat is
  EXONERATED as the cause of the 0126Z → current drift, on
  the strongest form of the evidence (identical columns, not
  just threshold-passing ones).
- FILLED (method): the bisect sweep + proof pair
  (scripts/test-r54bisect-sweep.js + test-r54bisect-a.js) —
  a reusable shape for the next bisect: column shas prove
  which code ran, rerun rows prove determinism, the proof
  re-derives the inverse from the commit diff itself.
- DOCUMENTED, NOT FIXED (carried, not chased here): the
  drift cause is still open and is now known NOT to be in
  the src/ delta's game-logic content — the next bisect
  must look wider (policy/substrate history, harness
  inputs, or a base misattribution between the 0126Z
  rebaseline base and the 0715 base). The 0126Z table stays
  stale; the current band (301/8/2) is the table future
  arms should cite, with this exoneration attached.
- NOT DONE (by design, per the arm brief): no game-code
  change of any kind; no tuning against either band; no
  re-judgment of prior corpora against a new baseline.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No pre-registered metric was re-scored mid-run. The run
was judged exactly against its header: CONFIRMED required
colB deaths ≤ 270 AND national-ever ≤ 6/8 AND starvation
≥ 6 with table/wins/final not collapsing; EXONERATED
required colB deaths ≥ 290 AND national-ever 8/8. Column B
read deaths 301, national-ever 8/8 — EXONERATED on the
letter of the rule, and identical to column A on every
compared field on top of that. Two non-metric corrections
were made during the run and are disclosed, not hidden:
(1) the brief's "+18/-1" hunk size corrected to +17/-1
(git's stat total counts 18 changed lines); (2) one proof
leg narrowed from the bare string 'nv:nod' (which exists
outside the hunk) to the hunk's full choice-list line.
Neither touches a verdict threshold, a seed, a policy, or
a horizon. Revision proposed for the NEXT run (not applied
here): the next bisect arm should pre-register its
candidate set wider than a single commit — a single-commit
bisect that exonerates leaves the drift unexplained, and
the run after it will otherwise repeat this shape with no
new information. The telemetry-check and balanced panel
were NOT run, per the standing exception for recorder
rows (panel cannot ingest per-seed recorder corpora;
checker counts are wrong on recorder rows) and the
brief's explicit instruction; the sweep summary + this
evidence file are the comparison of record. No baseline
was rolled.

## Infrastructure notes

- Sweep: scripts/test-r54bisect-sweep.js (new; modes --one
  colA|colB <seed>, RERUN=1 rerun rows, --summary, --detgate).
  Corpus: evidence/2026-10-26/perseed-sim-r54bisect-a/
  (8 colA rows + 8 colB rows + 2 rerun rows + summary.json).
  Proof: scripts/test-r54bisect-a.js.
- Commit: sim-r54bisect-a, DIAG ONLY, zero src/js diff in the
  final tree (conversation.js restored). Ready for coordinator
  merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- check.js --quick NOT run: zero src/js diff in this arm's
  final tree; the arm's own proof tests are the verification
  of record.
