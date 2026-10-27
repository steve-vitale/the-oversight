# sim-divergebase-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout loop, run fleshout-20261027T0525Z, arm `sim-divergebase-a`,
axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips, no
game lever, no narration change. At most, the evidence file specifies
what a future fix would need to show (marked as specification, not a
proposal).

Canon read first: `docs/CANON.md`, then `docs/MONSTER-WAVES.md`. No
canon doc covers this target (narration-mode trajectory divergence is
an instrument question, not a game system); no canon is invented here.
`docs/SIMULATING.md` read; sims run through the verbatim sweep
scripts below (never copied eval boilerplate), proof script lives in
`scripts/` with a distinct name, no hardcoded absolute paths.

## Background (read before sweeping; NOT re-judged here)

From `evidence/2026-10-27/sim-raidtrace-a.md` and
`evidence/2026-10-27/sim-diverge73677-a.md` plus their preregs:

- Substrate: `scripts/policies/tableseat-nowait.js` (wraps
  `leanlinkrescue`; composed upon, never edited), seed 73677 only
  for this arm, 180-day death-aware horizon.
- Raidtrace corpus (narration-off census vs narration-on
  transcript, on raidtrace's pinned base): seed 73677 census
  **152d / 41 deaths / 0 walls / village-lost**, transcript
  **168d / 44 deaths / 2 walls (seq35 d155, seq39 d168)**.
  All other 7 seeds matched the census exactly.
- Diverge73677-a re-ran seed 73677 fresh on the current base
  (3 reps per mode): census and transcript BOTH read
  **130d / 37 deaths / won / 3 walls**, byte-identical within
  each mode, trajectories agreeing on every rep pair. The
  divergence does NOT reproduce on the current base.
- The sole `src/js` change between raidtrace's pinned base
  `c8770e7f4412aa6430d6daa3ce86e28484f0de20` and the
  current branch HEAD is commit `c04d4e0cb` (journey-scale
  r42 bystander-hold fix, `src/js/game.js`, 17 lines) —
  verified by `git log c8770e7f..HEAD -- src/js/` in this
  worktree before sweeping (exactly one commit in range).
  That identification is NOT a causation claim.
- This arm does NOT re-judge the raidtrace verdict
  (transcript denominator, 16 walls, toll-quantified 0/16)
  and does NOT re-judge the diverge73677-a verdict
  (DIAG-NO-GO on the current base). It judges only the
  question below, on the old base.

## Question

Does the seed-73677 census-vs-transcript divergence found by
sim-raidtrace-a reproduce on the RAIDTRACE BASE itself
(`c8770e7f4412aa6430d6daa3ce86e28484f0de20`)?

## Exact comparison (same as diverge73677-a used)

Both corpora on the raidtrace substrate (tableseat-nowait,
180d death-aware, seed 73677 only):

- **Census-armed (A)**: narration-off, seq51gap-a armed
  recorders verbatim
  (`scripts/test-seq51gap-diag-sweep.js --one armed 73677`,
  EVID redirected to `evidence/2026-10-27/perseed-divergebase-a/`).
- **Transcript-armed (B)**: narration-on, same armed
  recorders PLUS the raidtrace-diag emit recorder verbatim
  (`scripts/test-raidtrace-a-sweep.js --transcript 73677`,
  same EVID).

Comparison fields per rep pair: days, deaths (deathTotal),
walls (C2-palisade-wall + C2?-wall-amount-only steps from
`traceSeq` on the run's own armed row, exactly as raidtrace
counted), won. Reps: 3 per mode (arm-1 run + 2 repeats),
same seed, same config, same verbatim scripts; per-rep
copies kept as `s73677-census-rep<N>.json` /
`s73677-transcript-armed-rep<N>.json` /
`s73677-transcript-doc-rep<N>.json` so no rep overwrites
another. No other corpus counts toward the verdict.

## Direction clarification (written BEFORE sweeping)

The assignment brief's verdict-rule parenthetical reads
"(transcript fewer deaths/walls)". That contradicts
raidtrace's own corpus rows, read directly before sweeping:
census 152d / 41 deaths / 0 walls, transcript 168d / 44
deaths / 2 walls — i.e. on raidtrace's base the transcript
run is HIGHER on days, deaths, and walls. "Matches
raidtrace's direction" is therefore judged below as
transcript HIGHER (more deaths and/or more walls than the
census twin). The brief's parenthetical is recorded here
as a transcription slip, flagged before any sweep, not
applied literally and not corrected mid-run. If the
old-base run reproduces raidtrace's values exactly, it
satisfies the direction rule as written here.

## Verdict rule (binding — judge against this header)

DIAG-GO (reproduces on old base) iff census and transcript
differ on deaths or walls in the MAJORITY of rep pairs
(at least 2 of 3) AND the direction matches raidtrace's
recorded direction (transcript more deaths and/or more
walls than its census twin in those differing pairs).
Otherwise DIAG-NO-GO — including "does not reproduce on
the old base either", "differs but in the opposite
direction", and "differs in only 1 of 3 pairs". A GO here
means the divergence reproduces on the old base, NOT that
any game change is approved, and NOT that commit
`c04d4e0cb` caused anything. A miss is NO-GO, never
re-scored against a friendlier metric mid-run.

Within-mode variance, if any rep within a mode disagrees
with its siblings on days / deaths / walls / won, is
reported as its own finding (which field, by how much,
across how many reps); the pair rule above still judges
the verdict, and the variance is named alongside it —
it is not used to re-pick a friendlier rep.

## C/D emit bisection gate

The C/D emit bisection as defined in
`evidence/2026-10-27/sim-diverge73677-a-prereg.md` (arms C
and D) runs ONLY if the divergence reproduces on the old
base, and never otherwise. No C/D bisection runs in THIS
arm: this arm's job is the old-base reproduction test
alone. If this arm returns DIAG-GO, the gate opens for a
FUTURE arm (on the old base, under its own preregistration)
to run the C/D bisection; if this arm returns DIAG-NO-GO,
the gate stays closed and no bisection is warranted on
either base. Nothing in this arm's evidence proposes a
narration fix.

## What the verdict means for the base-move hypothesis

- If DIAG-GO here AND diverge73677-a's DIAG-NO-GO on the
  current base both stand: the divergence exists on the
  old base and not on the current base. That IMPLICATES
  but does NOT prove commit `c04d4e0cb` (the sole
  `src/js` change in range) as the cause — causation
  requires a bisection, which this arm does not run.
  Say exactly that; do not claim causation.
- If DIAG-NO-GO here too: the divergence blank closes as
  non-reproducing on BOTH bases, and the raidtrace verdict
  stands as written. Say so plainly; do not hunt for the
  old numbers with extra reps beyond the pre-registered 3
  per mode.

## Horizon, seeds, and expansion rule

Seed 73677 only. The other 7 seeds are already proven
matching in raidtrace and matching (on the current base)
in diverge73677-a's framing; no fresh 8-seed band is run.
No expansion runs without a preregistration amendment
written BEFORE running it.

## Metric review (for the NEXT run; pre-registration is never re-scored)

The final evidence file carries a "metric review" section
(§14) covering: whether days/deaths/walls/won is a
sufficient trajectory fingerprint (vs the full-field
`--diff` comparison this arm's analyzer provides), whether
the majority-of-pairs rule handled within-mode variance
adequately, and any instrument error found in the reused
sweep scripts or the `--diff` analyzer on the old base.
A miss is NO-GO, never re-scored mid-run.

## Files (this arm; all under the worktree)

- `evidence/2026-10-27/sim-divergebase-a-prereg.md` (this file)
- `evidence/2026-10-27/sim-divergebase-a.md` (final evidence)
- `evidence/2026-10-27/perseed-divergebase-a/` (per-seed
  corpus rows, rep copies — never /tmp, never another
  run's live filenames)
- `scripts/test-divergebase-a.js` (proof validator; reuses
  `scripts/test-diverge73677-a-sweep.js`'s exported
  `diffRows` / `summarizeRow` / `wallsOfRow` verbatim —
  that analyzer file itself is never edited)

## Old-base procedure (measurement only)

1. Commit this prereg (plus the proof script) on branch
   `sim-divergebase-a` via the worktree's own
   `scripts/safe-commit.sh` — never the main tree's script.
2. `git checkout c8770e7f4412aa6430d6daa3ce86e28484f0de20`
   (detached, measurement only) and run the sims; corpus
   files are untracked so they survive checkouts.
3. `git checkout sim-divergebase-a` to return to the
   branch. NEVER commit while detached. NEVER push, NEVER
   bump versions, NEVER verify live.

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve
should playtest. No `[needs-eyes]` in any commit message
from this arm.
