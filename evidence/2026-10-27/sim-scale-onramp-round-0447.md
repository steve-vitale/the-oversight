# Coordinator evidence — run fleshout-20261027T0447Z (axis scale-onramp — 1 arm DIAG-NO-GO, LANDED as measurement, merged locally pending ship)

Loop B live on food-economy the whole run (0049Z claim, stockdoors +
bothgrow, NOT touched). This run worked scale-onramp (converging).

Run-start closeout: no lock file existed. Main tree clean (0 files),
disk 26%, reap clean (active 8/16, all dirty trees left alone).
The 0321Z next-blank list was worked in order:
(1) final-loss non-restore SKIPPED — tree sim-finalloss-a still has
UNCOMMITTED changes per reap (owner: oversight-flesh-out-loop),
so it was NOT touched and NOT re-claimed, same as in 0321Z;
(2) raid-wall toll-quantified narration and (3) monster-knowledge
link spec are both ruling-pending, skipped; (4) the 73677
transcript-vs-census divergence attribution test was claimed and
run. Claim fleshout-20261027T0447Z, lock created at run start,
both deleted at closeout.

## Arm sim-diverge73677-a (1fe3193d4, proof 37/0 on merged master): DIAG-NO-GO — does not reproduce

Question (from sim-raidtrace-a.md, "Transcript vs census"): on the
raidtrace substrate (tableseat-nowait, seeds 73671-73678, 180d
death-aware), seed 73677 read census 152d / 41 deaths / 0 walls
vs transcript 168d / 44 deaths / 2 walls (seq35 d155, seq39 d168),
all other 7 seeds matching exactly. Hypothesis (not a finding):
live say/sysSay fill Game.log and a log-dependent read downstream
amplifies the difference.

Fresh on current base, 3 reps each mode, verbatim scripts,
byte-identical within each mode (SHA-256 identical, including
fight IDs):

| Seed 73677, current base | Days | Deaths | Won | Walls |
|--------------------------|------|--------|-----|-------|
| Census (narration-off), reps 1-3 | 130 | 37 | 1 | 3 |
| Transcript (narration-on), reps 1-3 | 130 | 37 | 1 | 3 |

First-divergence day: none (null on all 3 rep pairs). Zero tick
diffs; days, deaths, faced map, kill log, table-seat context,
field fights, and wall details identical. Arm 3 (the C/D emit
bisection) did not trigger under its pre-registered condition
("reproduce deterministically AND still diverge") — no C/D
recorder was built for a condition that did not trigger, and no
narration fix is proposed. Verdict per the binding prereg:
"does not reproduce" is explicitly a DIAG-NO-GO branch.

The only remaining narration-mode difference on this base is
fight-ID timestamp prefixes (first tbEnd census fmgpsphqo_*
vs transcript fmgpspj9f_*, random suffix identical): Game.emit
calls Date.now() per log entry and the harness Date.now() is a
per-load call counter, so narration-on's ~12,449 emits shift
every later fight-ID timestamp. With prefixes stripped, all
recorder sections are equal. That is a named mechanism for the
current-base cross-mode difference — it is NOT an attribution
of raidtrace's trajectory divergence, which no longer exists
to bisect. For the raidtrace divergence itself, the mechanism
is unlocated on this base.

Base move identified to one commit: the sole src/js change
between raidtrace's pinned base c8770e7f and this HEAD is
c04d4e0cb (journey-scale r42 bystander-hold fix, game.js,
17 lines): it stops silently deleting full-health wave-4
lingerers when a contest/trial fight lifts a bystander tile
monster. Mechanically plausible as the trajectory mover for
this lingerer-heavy seed, but causation for this seed's
specific shift is NOT separately proven (that needs an
old-base run). The raidtrace verdict itself (transcript
denominator, 16 walls, toll-quantified 0/16) was NOT
re-judged and stands as written.

## Wall numbers (this run's measured corpus only — single seed, not a band)

Seed 73677 both modes: 130d, 37 deaths, won, 3 walls. No 8-seed
band was rerun, so no band wall numbers are claimed from this
run. The standing band wall from 0321Z (wins 2/8, national-ever
6/8, final 5/8, table 4/8, entered 2/8, wave-4 6/8, wave-5 0/8,
wave-4 kills 0/8, median 152d) is unchanged and unre-judged.

## Village assessment / people check

No new people-behavior sample this run: this was an instrument
attribution arm, not a play-feel arm. No villager dialogue or
routine verdict is claimed from it. In plain words: the village
on seed 73677 now survives to a win on this base in both
narration modes, and the earlier claim that narration alone
split its fate does not hold up anymore — something in the
one game change since raidtrace moved the whole story, and
that is the next thing to pin down, not a narration bug.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-27/perseed-diverge73677-a/*.json' --metrics
national,table,wins,exiled` → 2 LOUD lines (national 12→0,
wins 16→0). Both are the known regime + recorder-row artifact
class: the WINSEAT baseline's own regime note forbids this
comparison, per-seed rows carry won/nationalEver-style fields
not top-level national/wins paths, the "current" glob counts
12 files (rows + transcript docs, not 12 seeds), and the seed
in fact won in both modes. Baseline NOT rolled, no new
investigation.

## Metric review

Pre-registered metric bound the run and was honored: DIAG-GO
required a named mechanism with first-divergence day and
repeat counts; "does not reproduce" was a pre-written NO-GO
branch and is the verdict. No mid-run re-scoring. Lesson
carried forward (see findings): future corpus comparisons
must strip fight-ID timestamp prefixes before claiming a
trajectory difference, or narration-mode row hashes will
falsely report divergence.

## Infrastructure

Worktree registration clean; heartbeat verified after
registration. Safe-commit index clobber hit the worker commit
(staged-deletion variant, repaired via HEAD-blob cacheinfo,
commit verified correct: 16 files). Merge --ff-only clean
(master still b882d67de at merge time, worker parent
matched); proof 37/0 re-run on merged master. No EPERM flap
this run. check.js --quick NOT re-run (zero src/js; arm proof
is the attributable evidence). Tree released done-merged,
branch deleted, main tree clean at closeout.

scale-onramp stays converging (NOT converged): the 73677
divergence blank is closed as non-reproducing on the current
base, but the wave-5 / wave-4-kill / full-seat wall is
untouched by this run. food-economy stays converging
(untouched; sibling loop B). Next blanks, in order:
(1) final-loss non-restore — CHECK tree sim-finalloss-a
before re-claiming (still uncommitted, still not touched);
(2) 73677 divergence on the raidtrace base — reproduce seed
73677 on the raidtrace base in its own worktree under its
own prereg; if it reproduces there, run the pre-registered
C/D bisection there (do NOT re-judge the current-base
NO-GO from that run);
(3) fight-ID timestamp-prefix stripping as a standing
comparison rule (analyzer already implements it);
(4) raid-wall toll-quantified narration — spec ready,
Steve's ruling required before any voice change;
(5) monster-knowledge link spec — design ruling, not a
lever; (6) TB channel reset, situation-blind table talk,
dead-entry drop, 1354Z steve-calls — all ruling-pending,
skipped. Rotation left at 3 (convergence work does not
cycle it). Claim deleted; lock deleted. Evidence:
evidence/2026-10-27/sim-scale-onramp-round-0447.md
(coordinator, this file) + sim-diverge73677-a.md + prereg +
perseed-diverge73677-a/. Merged locally, pending ship.
