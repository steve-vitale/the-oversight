# sim-scale-onramp-round-0830 — coordinator evidence (axis scale-onramp)

Run: fleshout loop A, 2026-10-26, run_id fleshout-20261026T0830Z.
Loop B live on food-economy for the whole run (0630Z claim:
fishfallback + racksvoice-gate) — NOT touched. This run worked
scale-onramp (converging), taking the 0715Z run's next blanks in
order: (1) the journey-landing r54 bisect for the 0126Z → current
drift; (2) the fresh-transient exercise (driveoff-clean shape +
post-daily snap). The 0715Z blank "field-fight position trace
(echodraft next)" was NOT re-assigned: echodraft and fieldpos both
already landed 2026-10-25 (sim-echodraft-a, sim-fieldpos-a).

## PRE-REGISTRATION (coordinator level, written before spawning)

- Shared context: 0126Z rebaseline table (base 8ea64d848, seeds
  73671–73678, tableseat-nowait): deaths 260, national-ever 6/8,
  national-final 5/8, table 4/8, wins 4/8 lesser only, wave-5 0/8,
  median 143d, starvation 9. Current band (natpair + drawwave,
  same seeds/substrate): deaths 301, national-ever 8/8, starvation 2,
  all other headline fields matching 0126Z.
- Arm 1 (sim-r54bisect-a): current-master vs r54-inverse columns,
  identical script and seeds. CONFIRMED if the reverted column
  returns to the 0126Z shape; EXONERATED if it matches the current
  band; INCONCLUSIVE otherwise. The revert is measurement-only in
  the worktree and is restored before commit — zero src/js lands.
- Arm 2 (sim-freshtransient-a): positive control on driveoff-clean
  seed 73673 FIRST (post-daily snap must catch the national rise
  the pre-daily snap misses); fresh hunt on a verified-fresh
  8-seed band only if the control passes. DIAG-GO requires the
  control captured; a 0/8 fresh hunt is a reported rate, not a
  failure; a failed control is INSTRUMENT-FAILED, and the fresh
  hunt does not run.
- Deciding cost bar (from sim-scalemetric): starvation ≤ control+2
  on totals AND arm-only deaths, median ≥ 0.8× control median.
  Neither arm is a lever arm, so the bar is context, not a gate.
- Balanced panel: not run as a compare — it cannot ingest
  recorder/sweep corpora (standing exception, reconfirmed by the
  0715Z run). Sweep-compare tables in the arm evidence files are
  the comparison of record. No panel inputs fabricated.
- Telemetry-check: run by the coordinator on the bisect corpus
  (see below); baseline NOT rolled on recorder/sweep rows.

## ARM 1 — sim-r54bisect-a: EXONERATED (r54 is NOT the drift cause)

Commits (rebased onto current master, ff-merged): 76c08fb00 (arm)
+ 854047d3f (proof head-leg fix). Proof scripts/test-r54bisect-a.js
105 passed / 0 failed post-rebase AND on merged master. Sweep
--detgate PASS. Zero src/js diff in the landed commits.

- Verified before sweeping: the src/ delta between rebaseline base
  8ea64d848 and the worktree HEAD is exactly de87ffe79
  (conversation.js winddown grace beat) + cc855cf08 (build.js
  version stamp only); all other intervening commits are
  scripts/evidence-only. Correction to the brief: the hunk is
  +17/−1, not +18/−1 (git's stat total of 18 changed lines).
  The reverse-apply was exact (worktree diff 1 insertion, 17
  deletions, index 53a4bceed..f1eb01639, the commit's index line
  reversed); conversation.js was restored with git checkout --
  before commit.
- Both columns IDENTICAL on every compared field for all 8 seeds
  (trajectory, full deaths map, ts counters, final pop/pantry/
  knowledge, starvation detail) — not just threshold-passing,
  but exactly equal. Column A = column B:
  deaths 301, national-ever 8/8, national-final 5/8, table 4/8,
  entered 4/8, wins 4/8 (lesser seat only), wave-3 8/8, wave-4 5/8,
  wave-5 0/8, Arc IV 4/8, median survival 143d, max 180d,
  starvation 2.
- vs 0126Z: deaths 260, national-ever 6/8, starvation 9. The drift
  is real, reproduced a third way (natpair, drawwave, and these
  plain columns), and it is NOT r54.
- Plain words, what the grace beat does: when you are wrapping up
  a conversation and pick "One more thing —" (or agree/joke/
  silence/nod) instead of leaving, the sitting used to close
  silently; r54 closes it with that last line shown. It changes
  only the returned turn's line field — no food, fights, trust,
  scale, or table logic — which fits the finding that it moves
  nothing on this band.
- Evidence: evidence/2026-10-26/sim-r54bisect-a.md +
  perseed-sim-r54bisect-a/ (8+8 rows + 2 reruns + summary).

## ARM 2 — sim-freshtransient-a: POSITIVE CONTROL NOT CAPTURED (anchor stale, instrument verified)

Commit (rebased onto current master, ff-merged): 26ef8f6c7.
Proof scripts/test-freshtransient-a.js 12 passed / 3 failed
post-rebase AND on merged master — the 3 failures ARE the verdict
legs (pre-snap absent, class post-explained-transient, table
invited), not weakened to green. Zero src/js diff.

- The known transient no longer exists on the current base
  (worktree HEAD 9e3110ff4): driveoff-clean seed 73673 climbs to
  national on day 84, reaches global on day 88, holds the realm
  until day 161, and only then falls back to regional — it never
  sits at the table, but it is snap-counted, not transient. The
  ts day itself moved (86 → 84). Same story on seed 73671 across
  three bases (driveoff-clean 180d/31 deaths, natpair 160d/50,
  this run 145d/38): the anchor drifted, it did not break.
- Instrument verified working, which is why the label needs its
  qualification: two det-gates prove the composition
  (driveoff-clean policy + feastdraw/nonworldkill recorders +
  natpair pre/post-daily snaps) moves no play — seed 73671 plain
  vs wrapped 145/145 days, 38/38 deaths, ts 77/77, MATCH; seed
  73673 plain vs wrapped 168/168 days, 45/45 deaths, ts 84/84,
  MATCH. Snap-ordering legs all pass: day 84 rank trace pre 1 →
  post 2 (rose inside daily), postNationalDay 84 == tsNationalDay
  84, preNationalDay 85. Both halves of the transient window
  were located on this very seed — rise day 84, overnight fall
  day 161 → 162 — just not combined on a first night.
- Per the pre-registered stop rule, the fresh hunt was NOT run, so
  no fresh-band wall numbers exist. The verified-fresh band
  73901–73908 (md=0, corpus=0 on all 8; candidate bands 73701,
  73711, 73801 all failed on stray .md hits) stands ready for a
  re-anchored next arm. The next transient-needing arm must
  re-anchor on the current base before spending fresh seeds.
- Positive-control row (seed 73673): days 168, wave 4, Arc III,
  finalRank regional, maxRank global, natEver 1, natFinal 0,
  table 0, entered 0, won 0, deaths 45, starvation 0, ts 84,
  class agree, 1 draw driven off, patrol 4.
- Sense read: day 83 the realm stages ("Four fires. One head"),
  day 84 the shared granary opens and the System says the table
  is looking, day 88 Haven feasts for the cameras ("the table
  has your name now"), day 90 the table flickers and does not
  come, day 161 the realm comes apart aloud. The day-66 draw
  refusal narrates with named villagers (Pamela and Hinehou
  drive off Big Big). No robotic dialogue found.
- Evidence: evidence/2026-10-26/sim-freshtransient-a.md +
  perseed-sim-freshtransient-a/ (positive-control row + both
  det-gate artifacts; no fresh-band rows, by design).

## WALL (this run's judged corpora)

- Bisect band (16 configs, two identical columns): national-ever
  8/8, national-final 5/8, table 4/8, wins 4/8 (lesser only),
  wave-4 5/8, wave-5 0/8, full seat 0/8, Arc IV 4/8, median 143d.
- Transient positive control (1 config): national-ever 1, table 0,
  wins 0, wave-4, median n/a (single seed, 168d).
- Scale-and-die shape stands: villages reach national and lesser
  seats, but wave 5 still has zero births and the full seat is
  still unreached.

## TELEMETRY DEVIATION CHECK

Run on the bisect corpus (19 files, both columns) against
hidden_files/telemetry-baselines/scale-wall.json, metrics
national,table,wins,exiled: exactly 2 LOUD lines — national
12 -> 0, wins 16 -> 0. Both are the known INGESTION-SHAPE
artifact class: the checker reads top-level national/wins keys
that sweep rows do not carry (rows carry nationalEver/won;
actuals national-ever 8/8, wins 4/8 per column). Baseline NOT
rolled. No new investigation item. (The transient corpus was
not checked: telemetry-check refuses recorder corpora per the
audit branch's exit-2 rule.)

## METRIC REVIEW (docs/MEASUREMENT.md §14, mandatory)

- Pre-registered metrics bound both arms and were honored: the
  bisect's EXONERATED verdict follows its pre-registered rule
  (reverted column matched the current band exactly, not merely
  within tolerance), and the transient arm's stop rule was
  honored even though it cost the fresh hunt its band — a
  re-scored "partial transient" claim would have been drift.
- The transient arm's proof (12/3) is a standing example of why
  proof-green ≠ verdict-green: the 3 failures are the verdict,
  and greening them would have destroyed the evidence. Future
  arms with verdict-leg proofs should say so in their proof
  header, as this arm does.
- Metric note for the next drift bisect: a single-commit
  candidate set is now proven too narrow for this drift. The
  next bisect must pre-register a WIDER candidate set
  (policy/substrate history, harness inputs, base misattribution)
  before sweeping, not one commit at a time.

## VILLAGE ASSESSMENT (plain words)

Two villages were measured twice over and both told the same
story: the village that used to flicker in and out of national
standing overnight now holds its ground for months — it climbs
to national, even to global, feasts for the cameras, and only
comes apart aloud after day 161. That is a sturdier village
than the one the old control table described, and it is not
sturdier because of one conversation closing line: removing
that line changed nothing at all, on any seed, on any field.
The village is also honest in its small moments — when a feast
draw is refused, named villagers say so and drive the beast off
together. What is still missing is the top of the climb: no
wave-5 birth, no full seat, and no transient left to study
until the instruments are re-anchored to the village as it
actually plays today.

## INFRASTRUCTURE

- Master moved 3 times under the run from sibling lanes
  (fishfallback 8a7540534, journey-landing r55 63c116421, plus
  the arm merges); both branches rebased clean in their own
  worktrees (zero file overlap), proofs green after every rebase
  and on merged master (r54bisect 105/0; freshtransient 12/3 as
  verdict). Safe-commit index clobber hit all worker commits —
  repaired via HEAD-blob cacheinfo each time, commits verified
  correct, indexes clean before merge.
- Pre-flight reap queued on the registry flock behind sibling
  reaps; the coordinator's waiter was killed after confirming
  the main tree clean and the worktree list, and the final reap
  ran clean (active 7/16; every remaining tree holds uncommitted
  sibling work and was protected, none removed). No EPERM flap
  blocked this run. check.js --quick NOT re-run: zero src/js in
  both arms, standing 280/7 pre-existing profile recorded by
  recent runs, both arm proofs green on merged master.
- Main tree clean at closeout (master 26ef8f6c7). Merged locally,
  pending ship — no bump, no push; the batch ship job owns
  deploys. Claim deleted; lock deleted.

## NEXT BLANKS, IN ORDER

1. A WIDER drift bisect: the drift cause is still open and now
   known NOT to be in the src/ delta's game-logic content (the
   only other delta is the version stamp + build artifacts,
   which node sims do not load). Pre-register a wider candidate
   set — policy/substrate history, harness inputs, base
   misattribution — before sweeping.
2. A re-anchored transient arm on the current base, using the
   verified-fresh band 73901–73908 (do NOT spend it on a stale
   anchor).
3. Wound-closure pricing paper, then Steve's ruling on
   met-below-line finishing (defender-finish stays KILLED).
4. Melt ruling for Steve.
5. Defender-fight narration boilerplate + wait-line repetition
   (sense arms).

scale-onramp stays converging (NOT converged): the r54 candidate
is killed and the transient instrument is proven, but wins
still come only through default-OFF courtship + seat instruments,
only through the lesser seat, wave 5 still has zero births, and
the drift behind the control table is still unbisected. The
standing directive stands until the tracker records this axis
converged on measured evidence. food-economy stays converging
(untouched; sibling loop B). Rotation left at 3 (convergence
work does not cycle it).
