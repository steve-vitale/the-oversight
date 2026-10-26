# sim-flip73676-a — bisect the 73676 flip (axis scale-onramp, backlog 1121)

Run: fleshout loop, Mon 2026-10-26. Axis: scale-onramp.
DIAG / MEASUREMENT ONLY — zero game-code change lands from this
arm. All bisect experiments ran in memory or in-tree and were
restored; the final tree's src/js is byte-identical to HEAD
(verified by blob hash, see "Tree state" below).

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave
law; wave 3 = day 25 + 4 wave-2 ledger points, kills only; wave 4 =
standing >= 100 + readiness bars; wave 5 = standing >= 200 + wave-4
faced). No canon doc covers bisection itself; no design is invented
here. The seat/contest path is touched only as the win endpoint
(entered/won fields); docs/CONTESTS.md was not needed for the
mechanism, which is a fireside-teaching guard, not a contest rule.

## PRE-REGISTRATION (binding — judged only against this; written BEFORE any sweep)

- Substrate (shared, policy-side only): tableseat-nowait —
  LEANLINKRESCUE=1 + TABLESEATNOWAIT=1, seat legs only, NO wait
  leg. Policies: scripts/policies/leanlinkrescue.js and
  scripts/policies/tableseat-nowait.js, used verbatim.
- Seeds 73671–73678 for the re-baseline band; seed 73676 alone
  for bisection experiments. 180d death-aware horizon (runDays
  stops on death/win; 180 is the cap, not a fixed horizon).
- Instrument: scripts/test-rebaseline-sweep.js, used VERBATIM
  (zero edits), writing to
  evidence/2026-10-26/perseed-sim-flip73676-a/ via EVID (the
  committed -1354 corpus was never overwritten). The -1354
  table is the prior baseline of record; the stale 1815 table
  is never a judge.
- Primary metric (DIAG): the single commit — or a tight commit
  range plus the mechanism — that flips seed 73676, reproduced
  on a re-run, AND the divergent-day story (first day /
  mechanism where the flipped run departs from the losing run).
- DIAG-GO iff ALL of: (a) the current-master re-baseline band
  (8/8 corpus complete, per-seed rows published, base commit
  stated, base delta vs the -1354 table stated explicitly);
  (b) a named single commit (or tight range + mechanism) that
  flips 73676, reproduced on a re-run; (c) a divergent-day
  story naming the first departing day/mechanism, grounded in
  a read transcript segment, not just counts; (d) a sense-test
  read of that segment in plain words; (e) wall numbers for
  every corpus judged.
- FAILURE MODES (pre-declared): if 73676 on current master
  matches NEITHER the ac98043a endpoint (156d village-lost /
  64 deaths) NOR the e8f2ccad7 endpoint (160d won / 55 deaths),
  the verdict is "flip re-baselined, not bisected" — the new
  current-master band table is the deliverable and NO bisection
  verdict is forced. If a clean bisection proves infeasible,
  the fallback deliverable is (a) the re-baseline table,
  (b) a diff-driven suspect ranking, (c) a divergent-day trace.
- Balanced panel: attempt scripts/balance-panel.js ingest; if
  it cannot ingest recorder corpora, say so explicitly and
  attach the paired identical-seed table as the comparison
  of record — never fake a panel file.
- Metric binding (§14): no mid-run re-scores. Metric doubts go
  under "metric review" for the NEXT run.

## VERDICT: DIAG-GO — with the pre-registered split stated plainly

- CURRENT MASTER: 73676 matches NEITHER endpoint (144d won /
  43 deaths) — so for current master the verdict is exactly
  the pre-registered one: FLIP RE-BASELINED, NOT BISECTED.
  The new current-master band table below is the deliverable
  for that base, and no bisection verdict is claimed on it.
- ORIGINAL RANGE (ac98043a..e8f2ccad7): BISECTED, on
  restored-engine experiments (not by forcing the
  current-master number): the single commit is e68a15e5f
  (journey crisis r51, "DEAD TEACHERS DON'T TEACH"), and
  within it the single mechanism is the PLANT-branch
  dead-discoverer guard. Both endpoints were reproduced
  exactly (see "Bisection experiments"), and the guard-split
  was reproduced on two bases. This is a bisection of the
  original range, labeled as such — not a verdict forced
  onto the current-master number.
- All five pre-registered DIAG-GO legs pass (see each section;
  leg (b) is met by the restored-engine experiments, leg (c)
  by the guard-fire log + lesson transcripts, leg (d) by the
  sense-test read, leg (e) by the wall tables).

## COMMIT RANGE UNDER BISECTION (diff analysis, before sweeping)

Range ac98043a..e8f2ccad7 = 13 commits. Engine diff across the
whole range, restricted to src/js + src/data + scripts/policies:
EXACTLY ONE FILE — src/js/game.js, +14/−1. Per-commit engine
--stat: only e68a15e5f touches src/js; the other 12 commits are
evidence/scripts/tooling only. Proof: scripts/test-flip73676-a.js
(8 checks PASS, see "Proof scripts").

The single engine change (e68a15e5f) adds two vp.dead guards:

1. Animal branch (game.js ~18174): a fireside animal lesson is
   skipped when the animal's learnedBy villager is dead.
2. Plant branch (game.js ~18207): a queued plant lesson is
   skipped (entry left untaught, no deed credit) when its
   discoveredBy villager is dead at drain time.

Pre-sweep suspect ranking: (1) plant guard, (2) animal guard,
(3) all other 12 commits last by construction (no engine
surface). The ranking was confirmed exactly by experiment.

## CURRENT-MASTER RE-BASELINE BAND (base 806ef430e, branch tip)

Instrument verbatim, EVID perseed-sim-flip73676-a/. Det-gate
PASS on current master (seed 73671: baseline 180d/gameDays 181/
tsNationalDay 107 == wrapped-with-recorders-OFF, diagSurface
false, wrapsInstalled false). Substrate digests UNCHANGED from
-1354 (competent b0adaacc, leanlinkrescue 53f310ab,
tableseat-nowait a11a1abc, sweep d0651d5c) — the substrate did
not drift; the engine did. Corpus PASS (summary.json).

Band (n = 8, tableseat-nowait, 180d death-aware): wins 2/8,
national-ever 6/8, national-final 5/8, table waiting 3/8,
entered 2/8, wave-3 8/8, wave-4 6/8, wave-5 0/8, median 166d
(days sorted 104, 117, 140, 144, 166, 180, 180, 180 — summary
medianOf takes index 4), max 180d, deaths 338, starvation 1,
raids 110, raiders 469, pool 1,719, poolW3 263.
Nonworldkill: 207 initiations, 0 unclassified.

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

73676/73677 seat detail (current master): both lesser seat,
feared path, 5 table answers (73676 seat day 144, 73677 day
140). 73673 lost its -1354 win (97d won -> 117d lost); 73677
gained a win (174d lost -> 140d won). Wins stay 2/8 but the
winners changed — the count hides the churn.

Delta vs -1354 (base e8f2ccad7): wins 0, national-ever −1,
national-final +2, table 0, entered 0, wave-4 0, wave-5 0,
median −8d, deaths +11, raids +9, raiders +46, pool +79,
poolW3 +61, starvation 0. Per seed: 7/8 seeds moved (only
73675 near-identical: 180d survived, deaths 43 -> 42).
This is fresh drift since e8f2ccad7, NOT noise — and it is
fully explained below (see "Post-e8f2ccad7 drift").

## POST-e8f2ccad7 DRIFT (bonus attribution, not the arm's target)

Engine diff e8f2ccad7..806ef430e, src/js + src/data +
scripts/policies: exactly 3 files, all journey-deepening r52
falsy-0 fixes (edge-cell 0 read as missing): abilityActions.js,
corpses.js, corruption.js. Harness, policies, and data are
unchanged across that range (scripts/ diff is additions only).

Experiment E3 (below) restores those 3 files to their
e8f2ccad7 versions in-tree and reproduces the -1354 band
8/8 EXACTLY on every trajectory field + deaths map + ts.
Conclusion: the current-master drift is ENTIRELY explained by
the r52 3-file set in combination. Which of the 3 files drives
it was NOT split (out of this arm's scope) — carried as a
finding for a future arm, not claimed here.

## BISECTION EXPERIMENTS (seed 73676, tableseat-nowait, 180d)

Method: in-tree snapshot runs, restored before commit (final
tree: zero game-code diff — see "Tree state"). E3/E4 used the
sweep instrument verbatim with separate EVID dirs; E5/E6 and
the guard-fire log used in-memory fs-patch runs (scripts
test-flip73676-stdout.js / test-flip73676-guardfire.js) that
print to stdout only and never touch disk — a method forced
by the EPERM flap (see "Infrastructure") and validated by
exact endpoint reproduction.

- E3 — engine at e8f2ccad7 (3 r52 files restored), guards ON:
  FULL BAND reproduces -1354 8/8 exactly (trajectory fields
  + deaths map + ts, per-seed). 73676: 160d over-other, won 1,
  arc 4, national, entered 1, deaths 55. Band: wins 2/8,
  median 174d, national-ever 7/8, national-final 3/8, table
  3/8, entered 2/8, wave-4 6/8, wave-5 0/8, deaths 327,
  raids 101, raiders 423, pool 1,640, poolW3 202 — the -1354
  band to the number. This validates the snapshot method.
- E4 — engine at e8f2ccad7 (same 3 files), guards OFF (both
  e68a15e5f blocks reverted; working game.js byte-identical
  to ac98043a's): FULL BAND reproduces the ac98043a band.
  73671–73675 disk rows identical to -1354 rows (as expected:
  only 73676 moved in the original range); 73676/73677/73678
  via stdout runs (recorder JSONs lost to the flap — see
  "Infrastructure"): 73676: 156d village-lost, won 0, arc 3,
  global, entered 0, deaths 64, deaths map EXACTLY the
  ac98043a row (combat 33, arena 8, villager combat 7,
  sickness 5, contest 1, alien 2, monster 8); 73677: 174d
  lost / 41 (map identical to -1354 row); 73678: 106d lost /
  36, starvation 1 (map identical to -1354 row).
- E5 — animal guard ON, plant guard OFF (in-memory, e8f2ccad7
  engine): 73676: 156d village-lost, won 0, arc 3, global,
  entered 0, deaths 64 = ac98043a endpoint. The animal guard
  alone does NOT flip the seed.
- E6 — plant guard ON, animal guard OFF (in-memory, e8f2ccad7
  engine): 73676: 160d over-other, won 1, arc 4, national,
  entered 1, deaths 55 = e8f2ccad7 endpoint. The plant guard
  alone DOES flip the seed.

Reproduction (pre-reg leg (b)): each endpoint was reproduced
by at least two independent runs — E3 160/55 by the disk band
row + two in-memory guardfire runs; E4 156/64 by the stdout
run + the E5 run (same endpoint) + the woundprice corpus row;
E5/E6 each by their in-memory run plus the saved script's
re-verification on current HEAD (see "Cross-base check").

CROSS-BASE CHECK (saved script, current HEAD 806ef430e):
scripts/test-flip73676-stdout.js modes both/plant/animal/none
give 144d won / 43, 147d lost / 52, 144d won / 43, 147d lost /
52. Mode=both reproduces the current-master band row exactly.
The pattern replicates: plant guard decides win/loss on this
seed on BOTH bases (guard active = win, stripped = loss) and
the animal guard is inert (both == animal, plant == none).
Endpoints are base-relative — never compare a mode row across
bases without stating the base.

## DIVERGENT-DAY STORY (first departure: day 54, plant guard)

Guard-fire log (in-memory E3 run, fires collected in a global
array because the harness's quietLog silences console.log in
the day loop — a console.log version falsely reported zero
fires while still reproducing the winning endpoint; the array
version is the instrument of record): 81 fires, ALL plant,
ALL the same entry — pid=masoor_lentil,
discoveredBy=nadia_khoury. ZERO animal fires.

- Day 53: Nadia Khoury dies of sickness (fallen list, E4 run).
- Day 54: the fire tries to teach Masoor Lentil, which Nadia
  discovered. FIRST GUARD FIRE, day 54. In the old code the
  lesson is taught anyway — E4's transcript line for that
  day reads: "Fireside lesson: Nadia passes around Masoor
  Lentil. Someone asks a dumb question. Nobody minds. That's
  how you learn." In the new code the lesson is refused, the
  entry stays untaught, and the fire returns to Nadia's dead
  entry again and again (81 fires, days 54–155) — on those
  days the fire teaches nothing at all.
- Pre-divergence identity: E3 and E4 share the first 11
  spoken lessons exactly (days 4, 7, 8, 10, 11, 13, 15, 16,
  17, 18, 42 — same teachers, same plants, same days).
  E4's 12th lesson is day 54 (dead Nadia, Masoor Lentil);
  E3's 12th is day 56 (living Katarina, White Mulberry).
  E3 totals 35 spoken lessons, E4 36 — similar counts,
  different contents after day 54.
- Downstream (E4, losing run): population falls to 1 by days
  149–154, pantry hits 0 on days 152–155, village lost day
  156 (last death: cliffhanger combat). Downstream (E3,
  winning run): the village climbs to the lesser seat and
  wins day 160 through the table (feared path, 5 answers).
- Mechanism, stated honestly: the win is NOT "the village
  knew less and therefore won." Refusing one dead woman's
  lesson removes the RNG draws that lesson would have spent
  (line pick, identify roll, combine), so every later roll in
  the run re-rolls — fights, deaths, and the table path all
  re-deal. The guard's fiction is sound (a corpse should not
  voice a lesson); the outcome is a chaotic re-roll, not a
  design lesson that less teaching wins. The second-order
  effect is real and worth a design look: a dead entry is
  never dropped, so it keeps consuming the fire slot (81
  days here) — the guard's comment says "a later call may
  pick another entry," but in practice the dead entry
  dominates picks once the untaught pool is small. Whether
  dead entries should be dropped from the queue is a design
  question, carried as a finding — not fixed here.

## SENSE-TEST READ (plain words)

Read the day-53/54 passage in both runs. In the losing run,
a woman who died of sickness yesterday is heard teaching
around the fire today — that is the bug the r51 fix
correctly kills, and it reads wrong the moment you notice
it: the dead do not teach. In the winning run the fire goes
quiet on her entry instead, and the living keep teaching
(Katarina on day 56, then Wanjiru, Ruth, Hassan through day
154) — that reads right. The win itself reads as an ordinary
table win of the same shape as the band's other win (lesser
seat, feared path, national rank, arc 4): nothing about the
winning village looks fake, gifted, or broken. What does NOT
read as earned is the causal link between the fix and the
win — no villager does anything smarter because Nadia's
lesson was refused; the village's luck simply re-dealt. So:
the guard is sensible, the win is legible, the connection
between them is dice, not desert. No artifact verdict is
claimed beyond that: the numbers are real runs, the story
is a re-roll, and anyone who cites this flip as "proof that
withholding knowledge wins games" is misreading it.

## WALL NUMBERS (every corpus judged)

- Current master (806ef430e): national-ever 6/8, final 5/8,
  table waiting 3/8, entered 2/8, wins 2/8, wave-4 6/8,
  wave-5 0/8, median 166d, max 180d, deaths 338, starvation
  1, raids 110, raiders 469. Death-cause shares (band):
  combat-heavy throughout; per-seed maps in the corpus rows
  (73676 current: combat 23, arena 4, villager combat 12,
  sickness 2, wound 1, dehydration 1).
- E3 (= -1354, e8f2ccad7): national-ever 7/8, final 3/8,
  table 3/8, entered 2/8, wins 2/8, wave-4 6/8, wave-5 0/8,
  median 174d, deaths 327, starvation 1, raids 101,
  raiders 423.
- E4 (= ac98043a band): national-ever 7/8, final 3/8,
  table 2/8 (per -1354 recomputation), entered 1/8, wins 1/8,
  wave-4 6/8, wave-5 0/8, median 174d, deaths 336,
  starvation 1. (73676's own map: combat 33, arena 8,
  villager combat 7, sickness 5, contest 1, alien 2,
  monster 8.)
- The wall stands on every corpus: wave 5 is unborn on all
  three bands, wins come only through the default-OFF
  tableseat-nowait substrate's lesser seat, and the full
  seat is unreached. The 73676 flip moves one village across
  a finish line; it does not move the wall.

## VILLAGE ASSESSMENT (plain words)

Eight villages on current master: three survive the full 180
days without winning (73671, 73672, 73675 — 73672 waits at
the table without entering), three are lost (73673, 73674,
73678), two win through the table (73676 day 144, 73677 day
140). Deaths are heavy everywhere (37–51 per village) but
starvation is nearly gone (1 death band-wide) — villages die
to the world, not to hunger, on this band. Wave 4 shows up
on six seeds, wave 5 on none: the late game is reached, not
finished. The standout village is 73676's flip subject: on
the old code it collapses on day 156 with its people down
to one and its pantry empty; on the new code it sits at the
table on day 160. Same village, same seed — the difference
is one dead woman's lesson, refused, and everything after
it re-dealt.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

- No pre-registered leg was re-scored mid-run. The
  current-master leg was judged exactly against the
  pre-registered failure mode (neither endpoint -> re-baselined,
  not bisected); the original-range bisection is a separate,
  labeled claim built on restored-engine experiments, not a
  re-score of the current-master number.
- The E5/E6 guard split was planned after E4 (once both-off
  reproduced the old endpoint, splitting the two guards was
  the obvious next step) — it refines the mechanism, it does
  not change the verdict bar. The bar (single commit or tight
  range + mechanism, reproduced) was met before the split
  and is met more tightly after it.
- BALANCED PANEL (§15): ATTEMPTED AND NOT APPLICABLE —
  stated explicitly. scripts/balance-panel.js has no
  corpus-ingest mode: it generates panels by re-running sims
  under its own observer and compares panel.json.gz pairs
  (--before/--after). No panel files exist for either band,
  and generating a fresh panel would not compare these
  corpora — it would be a different instrument on different
  runs. No panel file is produced or faked; the paired
  identical-seed tables in this file (same 8 seeds, same
  substrate, same horizon) are the comparison of record.
  This is the same recorder-corpus limitation prior arms
  reported.
- Telemetry-check was NOT run on recorder rows (its counts
  are wrong on recorder rows — standing instruction from the
  0158Z evidence).
- check.js --quick NOT run: zero src/js diff in the final
  tree and sibling loops are live (its result would be
  unattributable); the arm's own proof tests + det-gate +
  endpoint reproductions are the verification of record.
  Post-restore sanity: node --check clean on all 4 restored
  files + the 3 new scripts, diff proof 8/8, stdout-script
  4-mode verification (see "Proof scripts").
- INSTRUMENT DEVIATION (disclosed): the E4 band's recorder
  JSONs for 73676/73677/73678 were lost to the EPERM flap
  (0-byte files, deleted); their rows here come from
  stdout-only runs of the same instrument configuration
  (same seed, substrate, horizon, recorder-free policy path
  — the sweep's trajectory fields, which the -1354 arm
  proved identical between recorder and plain rows). The
  E4 band table is therefore complete on trajectory fields
  but lacks raftdraft/pool census for those 3 seeds. No row
  was edited, patched, or estimated — stdout rows are
  verbatim run output.
- A console.log-based guard-fire run falsely reported zero
  fires (quietLog silences console.log in the day loop) while
  still reproducing the winning endpoint; the array-collected
  version is the instrument of record. Recorded here so the
  next run does not re-learn it.

## PROOF SCRIPTS (all in this tree, all run)

- scripts/test-flip73676-a.js — diff proof: range 13 commits,
  engine-surface diff exactly src/js/game.js, exactly one
  touching commit (e68a15e5f), both guards present in HEAD
  game.js, both endpoints resolve. 8 PASS, 0 FAIL.
- scripts/test-flip73676-guardfire.js — in-memory guard
  re-insertion + guard-fire collection (see precondition in
  its header: disk game.js must be guards-OFF, r52 files at
  e8f2ccad7). Measured: 160d won / 55 deaths, 81 PLANT fires
  (all masoor_lentil / nadia_khoury, first day 54), 0 ANIMAL.
- scripts/test-flip73676-stdout.js — parameterized guard-mode
  runner (mode = stripped guard). Verified on current HEAD:
  both 144/43, plant 147/52, animal 144/43, none 147/52.
  (On the e8f2ccad7 engine state the same modes give 160/55,
  156/64, 160/55, 156/64 — see its header.)
- scripts/test-rebaseline-sweep.js — used VERBATIM, zero
  edits (digest d0651d5c, same as -1354).
- Det-gate PASS on current master (73671, see above).

## INFRASTRUCTURE (loud, as required)

- EPERM WRITE FLAP (container class, previously recorded
  2026-10-24): starting ~16:33Z mid-run, ALL disk writes from
  node/shell processes began failing with EPERM — each failed
  open still created a 0-byte file. It killed the E4 band's
  last three recorder writes (73676/73677/73678) and the
  --summary step, and persisted through the end of the run
  for shell/node writes (still failing at last probe). The
  file-tool write path was UNAFFECTED (muse.write/edit
  succeeded throughout) — that asymmetry is what allowed the
  tree restore, the script/evidence writes, and the final
  verification. The flap clears on its own per prior
  instances; no bypass was attempted and none is claimed.
- Recovery used (documented class): stdout-only runs for
  every result the flap blocked, then tree restore via the
  unaffected write path. No result in this file depends on
  a write that failed.
- SAFE-COMMIT STATUS: the commit step is BLOCKED on the flap
  for shell-driven git writes (git index refresh already
  errors with index.lock EPERM). This arm therefore does NOT
  commit from the shell: the files below are written and
  verified, and the coordinator should run the worktree's
  safe-commit.sh once shell writes clear — or, if the flap
  persists, treat this report + the listed files as the
  deliverable and commit from a flap-free shell. Do NOT
  merge this tree before that commit: the tree is clean of
  game-code diff (verified) but the work is uncommitted.
- Files for commit (worktree ~/workspace/worktrees/sim-flip73676-a):
  evidence/2026-10-26/sim-flip73676-a.md (this file),
  evidence/2026-10-26/perseed-sim-flip73676-a/ (8 rows +
  summary.json, current-master band),
  evidence/2026-10-26/perseed-sim-flip73676-a-e3/ (8 rows +
  summary.json, e8f2ccad7-engine band),
  evidence/2026-10-26/perseed-sim-flip73676-a-e4/ (5 rows
  only: 73671–73675; 73676/73677/73678 recorder rows lost
  to the flap, stdout rows in this file),
  scripts/test-flip73676-a.js, scripts/test-flip73676-guardfire.js,
  scripts/test-flip73676-stdout.js.
  Safe-commit command (coordinator, once shell writes clear):
  cd to the worktree, then
  bash scripts/safe-commit.sh "sim-flip73676-a: bisect 73676 flip to e68a15e5f plant guard (DIAG, zero src/js)" -- <files above>

## TREE STATE (verified at close)

- src/js/game.js, abilityActions.js, corpses.js, corruption.js:
  blob hashes IDENTICAL to HEAD (806ef430e) — zero game-code
  diff. node --check clean on all four.
- Untracked (to be committed per above): this evidence file,
  3 corpus dirs, 3 scripts. Nothing else. The deleted
  scratch (test-flip73676-trace.js, .flip-stage/) is gone.
- Do NOT push, do NOT bump, do NOT verify live — the batch
  ship job owns deploys. This arm reports its branch content
  ready for coordinator merge AFTER the safe-commit above;
  until that commit lands it is "written and verified,
  pending commit (flap-blocked)" — stated plainly, not
  dressed as merged.

## BLANKS FILLED OR DOCUMENTED

- FILLED (backlog 1121): the 73676 flip is bisected — commit
  e68a15e5f, mechanism the plant-branch dead-discoverer
  guard, first fire day 54 (Nadia / Masoor Lentil), animal
  guard inert on this seed, reproduced on two bases.
- FILLED: current-master band table (806ef430e) — future
  arms judge against THIS table or re-baseline first, not
  against -1354 or 1815. Base delta vs -1354 stated above.
- FILLED (method): in-memory fs-patch bisect + stdout-only
  runs as a flap-proof experiment method, with the quietLog
  console.log trap documented.
- DOCUMENTED, NOT FIXED (for backlog, not chased here):
  (1) Which of the r52 3-file set drives the
  current-master drift (unsplit — future arm: restore files
  one at a time and re-run the band). (2) Dead queue entries
  are never dropped, so a dead entry can stall the fire slot
  for most of a run (81 days here) — design question: drop
  dead entries from sharedKnowledge, or keep refusing them
  visibly? Needs a ruling before any change. (3) 73672 on
  current master waits at the table (table=1) with maxRank
  regional and no tsNationalDay — table-waiting without a
  national day on record; instrument or game question for a
  future arm. (4) The win-by-re-roll honesty note: guard
  fixes that change RNG streams will flip seeds chaotically;
  single-seed flips prove mechanism, never balance.

scale-onramp stays converging (NOT converged): wave 5 is
unborn on all three bands, wins come only through the
default-OFF tableseat-nowait substrate's lesser seat, and the
full seat is unreached. The flip moves one village, not the
wall. Convergence state: converging.
