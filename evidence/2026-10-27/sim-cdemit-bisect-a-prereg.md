# sim-cdemit-bisect-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout loop, run fleshout-20261027T0615Z, arm
`sim-cdemit-bisect-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips,
no narration change, no lever proposal. At most, the evidence file
specifies what a future fix would need to show (marked as
specification, not a proposal). Any voice change needs Steve's
ruling — none is proposed here.

Canon read first: `docs/CANON.md`. No canon doc covers this target
(narration-mode trajectory divergence is an instrument question,
not a game system); no canon is invented here. `docs/SIMULATING.md`
read; sims run through the verbatim sweep scripts below (never
copied eval boilerplate), proof script lives in `scripts/` with a
distinct name, no hardcoded absolute paths.

## Background (read before sweeping; NOT re-judged here)

- Raidtrace corpus (arm sim-raidtrace-a, run 0321Z): seed 73677
  census (narration-off) 152d / 41 deaths / 0 walls / village-lost
  vs transcript (narration-on) 168d / 44 deaths / 2 walls (seq35
  day 155, seq39 day 168). All other 7 seeds matched exactly.
- Diverge73677-a on the CURRENT base: both modes read 130d /
  37 deaths / won / 3 walls, byte-identical within each mode —
  the divergence does NOT reproduce on the current base
  (DIAG-NO-GO on the current base; do NOT re-judge that verdict).
- Divergebase-a on the RAIDTRACE BASE
  `c8770e7f4412aa6430d6daa3ce86e28484f0de20`: the divergence
  DOES reproduce exactly, 3/3 rep pairs (census 152/41/0/0 walls
  vs transcript 168/44/0/2 walls; transcript doc byte-identical
  to raidtrace's own). Within-mode variance zero.
- The sole `src/js` change between raidtrace's base and the
  current branch is commit `c04d4e0cb` (journey-scale r42
  bystander-hold fix, `src/js/game.js`, 17 lines). Verified
  topology before sweeping: `c8770e7f` IS an ancestor of
  `c04d4e0cb`, `c04d4e0cb` is the ONLY commit in range
  `c8770e7f..c04d4e0cb`, its file list is 74 files but only
  ONE `src/js` file (game.js, 17 lines); the rest is evidence
  plus measurement scripts. That identification is NOT a
  causation claim.

## Question

Does the 73677 census-vs-transcript divergence disappear at
`c04d4e0cb` — i.e., is the bystander-hold fix the mechanism?

## Exact comparison (same as divergebase ran them)

Substrate both legs: `scripts/policies/tableseat-nowait.js` as
restored from the raidtrace commit, seed 73677 only, 180-day
death-aware horizon, census-armed vs transcript-armed exactly
as divergebase ran them:

- **Census-armed**: narration-off, seq51gap-a armed recorders
  verbatim (`scripts/test-seq51gap-diag-sweep.js --one armed
  73677`, EVID redirected to
  `evidence/2026-10-27/perseed-cdemit-bisect-a/<leg>/`).
- **Transcript-armed**: narration-on, same armed recorders PLUS
  the raidtrace-diag emit recorder verbatim
  (`scripts/test-raidtrace-a-sweep.js --transcript 73677`,
  same EVID).

Comparison fields per rep pair: days, deaths (deathTotal),
walls (C2-palisade-wall + C2?-wall-amount-only steps from
`traceSeq` on the run's own armed row, exactly as raidtrace
counted), won. Reps: 3 per mode per leg (divergebase ran 3;
"at least 2" is the floor and 3 is what this arm runs, cost
permitting — if a leg's third rep cannot run, that is reported
and the leg is judged on the reps it has, never on a
re-picked subset). Per-rep copies kept as
`s73677-census-rep<N>.json` /
`s73677-transcript-armed-rep<N>.json` /
`s73677-transcript-doc-rep<N>.json` so no rep overwrites
another. No other corpus counts toward the verdict.

## Old-base procedure (measurement only, disclosed in full)

The raidtrace sweep (`scripts/test-raidtrace-a-sweep.js`) and
emit recorder (`scripts/policies/raidtrace-diag.js`) do NOT
exist AT `c8770e7f` and do NOT exist at `c04d4e0cb` either
(they were created on top of the raidtrace base). On EACH
detached checkout they are restored verbatim from the
raidtrace commit `fd3bcd83d` (`git show fd3bcd83d:<path>`
written to the worktree path) and never committed there.
At each checkout, `git rev-parse HEAD` and the restored
files' hashes are recorded in the evidence; the sweep,
recorder, and policy files used must be IDENTICAL between
the two legs, so the ONLY difference between control and
test is the base commit. Before returning to the branch,
the restored files are removed from the detached worktree
(the branch holds the identical versions), so the return
checkout is clean. NEVER commit while detached. NEVER
force-move the branch. Sweeps run on DETACHED checkouts
at `c8770e7f` and `c04d4e0cb`, then the arm RETURNS to
branch `sim-cdemit-bisect` to commit evidence. The
branch tip at the end must be this arm's evidence +
prereg + proof-script commits only.

Instrument-stack identity check (run before sweeping, on
the branch): `git log c8770e7f..c04d4e0cb` for
`scripts/test-seq51gap-diag-sweep.js`, `scripts/sim-harness.js`,
`scripts/policies/tableseat-nowait.js`,
`scripts/policies/seq51gap-diag.js`,
`scripts/policies/w4dmg-diag.js` must be EMPTY, and the
restored raidtrace files' hashes must equal the branch
versions' hashes. If either check fails, STOP and report
an instrument-identity failure — do not sweep a hybrid.

## Legs

- **(a) CONTROL on `c8770e7f`**: reproduce the divergence,
  3 rep pairs per mode. Control bar: census 152d / 41 deaths
  / 0 walls and transcript 168d / 44 deaths / 2 walls,
  matching raidtrace's numbers. If the control FAILS to
  reproduce, STOP and report DIAG-NO-GO (control failure) —
  do NOT judge the bisection.
- **(b) TEST on `c04d4e0cb`**: same procedure, 3 rep pairs
  per mode.

## Fight-ID rule (binding, from diverge73677-a)

`Game.emit` calls `Date.now()` per log entry and the harness
`Date.now()` is a per-load call counter, so narration-on's
extra emits shift later fight-ID timestamps. STRIP fight-ID
timestamp prefixes before ANY trajectory comparison; never
claim a trajectory difference from raw fight-ID hashes. The
`--diff` analyzer (`scripts/test-diverge73677-a-sweep.js`)
does this stripping (`stripFightIds`); its raw and stripped
section comparisons are both reported, never conflated.
Within-mode variance per leg is reported (divergebase found
zero; any nonzero variance is reported, not averaged away).

## Agreement definition (test leg)

"Both modes agree" means ALL of: headline fields equal
(days, deaths, walls, won) AND the stripped full-field
comparison agrees (`diffRows` trajEq true, zero tick diffs,
all five recorder sections stripped-equal). Headline-only
agreement with a stripped tick/section difference is NOT
agreement — it is a persisting stripped divergence, judged
under the DIAG-NO-GO (persists) branch below.

## Verdict rule (binding — judge against this header)

- **DIAG-GO** iff the control reproduces (control bar met)
  AND the test leg shows the divergence ABSENT (both modes
  agree per the definition above) AND the test leg's agreed
  numbers are reported with within-mode variance. A GO
  names `c04d4e0cb` as the bisection winner: the divergence
  is present on its parent base and absent at it, with the
  sole `src/js` change in range being its game.js edit.
  Classification of the agreed numbers: matching the
  current-base figures (130d / 37 / won / 3 walls) is the
  clean GO; matching one of the old-base mode figures
  (both modes collapsed onto that mode's trajectory) is
  still a GO, with the collapse named. Matching NEITHER
  the old-base nor the current-base figures is an
  UNEXPLAINED shift, NOT a GO (see below).
- **DIAG-NO-GO (persists)** iff the control reproduces AND
  the test leg still diverges (headline or stripped). Then
  the verdict is: the mechanism is NOT in `c04d4e0cb`'s
  `src/js` change. Report exactly that, plus an inventory
  of the non-`src/js` differences between the two checkouts,
  without claiming a new cause.
- **DIAG-NO-GO (control failure)** iff the control leg
  fails its bar. The bisection is NOT judged; the test leg
  is not run for verdict purposes.
- **UNEXPLAINED shift (not a GO)** iff the test leg's modes
  agree on numbers matching NEITHER the old-base figures
  (152/41/0 census, 168/44/2 transcript) NOR the
  current-base figures (130/37/won/3). Report the agreed
  numbers and the within-mode variance; do not call it a
  GO and do not claim a cause.
- A miss is NO-GO, never re-scored against a friendlier
  metric mid-run. A cause not established by these two legs
  may NOT be claimed.

## Det-gate (validity check, reported separately)

Re-verify emit-recorder neutrality within narration-on on
seed 73677 on the control leg: the census det-gate
(recorders unset == unwrapped: days/gameDays/ts identical,
no diag surface, no wraps) and the transcript det-gate
(wrap-off == plain). The det-gate result is reported in
the evidence and does NOT re-score the verdict above; a
failed det-gate is named as an instrument finding
alongside the verdict.

## Horizon, seeds, and expansion rule

Seed 73677 only. No expansion runs without a preregistration
amendment written BEFORE running it.

## Metric review (for the NEXT run; pre-registration is never re-scored)

The final evidence file carries a "metric review" section
(§14) covering: whether days/deaths/walls/won plus the
stripped full-field `--diff` is a sufficient trajectory
fingerprint, whether the agreement definition above handled
headline-vs-stripped disagreement adequately, and any
instrument error found in the reused sweep scripts or the
`--diff` analyzer on the old bases. The balanced panel
(`scripts/balance-panel.js`) has no corpus-ingest mode, so
paired identical-seed tables are the comparison of record —
no panel file is faked, and `telemetry-check.js` is NOT run
on recorder rows.

## Files (this arm; all under the worktree)

- `evidence/2026-10-27/sim-cdemit-bisect-a-prereg.md` (this file)
- `evidence/2026-10-27/sim-cdemit-bisect-a.md` (final evidence)
- `evidence/2026-10-27/perseed-cdemit-bisect-a/control/` and
  `.../test/` (per-seed corpus rows, rep copies — never /tmp,
  never another run's live filenames)
- `scripts/test-cdemit-bisect-a.js` (proof validator; reuses
  `scripts/test-diverge73677-a-sweep.js`'s exported `diffRows` /
  `summarizeRow` / `wallsOfRow` verbatim — that analyzer file
  itself is never edited)

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve
should playtest. No `[needs-eyes]` in any commit message
from this arm.
