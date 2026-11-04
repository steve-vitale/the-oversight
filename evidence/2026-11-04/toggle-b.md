# Toggle-b — arm-2 sub-lever attribution: CALIBRATION FAILURE, STOPPED AT STAGE 0 (Loop B, 2026-11-04)

## Verdict (prereg-gated, not re-scored)
STAGE 0 GATE: FAIL. V-full matches r118 outcome class on 3/3 pilot
seeds, but V-alloff matches r110 outcome class on only 1/3 (gate
requires ≥2/3 on BOTH sides). Per the prereg header: STOP. No Stage 1
toggle screen, no Stage 2 full block, NO attribution verdicts — no
sub-lever is CREDITED, DESCRIPTIVE, or NON-ATTRIBUTED here, because
the calibration the verdicts stand on does not hold. The r118 flips
are NOT attributed by this run. The finding is base drift, and it is
reported as a finding, not papered over with a re-baseline.

## Per-seed divergence table (pilot seeds 89702 / 89704 / 89705)

| seed | r118 class (V-full target) | V-full now | r110 class (V-alloff target) | V-alloff now |
|---|---|---|---|---|
| 89702 waves | won lesser, sat d99 | won lesser, sat d107 ✓ | won lesser, sat d92 | SCATTERED d62 ✗ |
| 89704 forcedrift control | scattered | scattered d61 ✓ | won lesser, sat d90 | SCATTERED d69 ✗ |
| 89705 wavesnw | won lesser, sat d113, uw4 | won lesser, sat d104, uw4 ✓ | won lesser, sat d120, uw5 | won lesser, sat d155, uw5 ✓ |

V-full: 3/3 class matches (sat days moved +8 / −9 — drift, but
class-preserving). V-alloff: 1/3 class matches (89705 only, and its
sit moved +35 days). Gate arithmetic: 3/3 AND 1/3 → FAIL.

## What the divergence looks like (descriptive, not attribution)
- 89702 V-alloff: scattered d62, pantry 0, 1 alive, 2 census fights
  both vDie — early hunger plus two fight deaths, where r110's
  version won lesser with 3 kills. Arm 2 ON (V-full) rescues this
  seed to a lesser win (11 fights, 2 kills, sat d107) — but on a
  drifted base, so that rescue is not credited to any sub-lever.
- 89704 V-alloff: scattered d69, pantry 0, 1 alive, ZERO fights —
  pure early hunger, where r110's version won lesser with 3 fights.
  V-full scatters too (d61, pantry 0, zero fights): on current
  master this seed scatters with or without arm 2, so its r110 win
  is not recoverable by arm-2 removal alone on this base.
- 89705 V-alloff: won lesser d155, uw5, 3 kills / 3 vDie — the class
  AND the wave-5 reach match r110, but the sit is 35 days later
  and the run fought a different fight mix (10 fights vs r118's 7).
  This is the one pilot seed where the old shape survives.

## Why the gate failed (mechanism, as far as Stage 0 can say)
V-alloff was verified byte-equal to the pre-arm2 game code
(`git diff d8f334da8^ -- src/js/` empty), the probe is the r118
probe verbatim (18-line diff: OUTDIR/PREFIX params + header
comment only), and the seeds/policies are identical — so the
divergence is NOT a variant-construction error. It is base drift
between r110's master and today's master: landings since r110
(win-plan, villager-agency, and others) already move 89702 and
89704 to early-hunger scatters even with arm 2 removed. V-full
still reproduces r118's classes 3/3, which means arm 2 ON plus
current master looks like r118 — but arm 2 OFF plus current
master does NOT look like r110. The two ends of the comparison
no longer share a base, so single-lever flips measured here
would confound arm-2 effects with intervening landings. That is
exactly what the calibration gate exists to catch.

## Next blank (named, NOT run — out of this arm's prereg)
Re-register the toggle pinned at r118's exact base (master
ff1725835, the base r118 ran on), with the gate re-registered as
same-base V-full vs V-alloff: on that base V-full should reproduce
r118 classes (determinism check first), and the flips between
V-full and each single-OFF variant on THAT base are arm 2's
effect, with no r110 target — r110's base is gone, and its
classes cannot serve as a calibration target on any later base.
Do not re-run this arm on current master with a softened gate.

## Scale-wall numbers (judged corpora: the two 3-seed pilots)
- V-full pilot: lesser wins 2/3, scattered 1/3, full seat 0/3,
  wave-5 reached 0/3, wave-4 unlocked 2/3, median survival 104d
  (gameDays 107 / 61 / 104).
- V-alloff pilot: lesser wins 1/3, scattered 2/3, full seat 0/3,
  wave-5 reached 1/3 (89705), wave-4 unlocked 2/3 (89702 uw4,
  89705 uw5), median survival 69d (62 / 69 / 155).
- National / table: no seed reached national or the table on
  either pilot; the only seats are lesser. In plain words: on
  the pilot, current master still wins lesser seats but reaches
  no full seat, and removing arm 2 collapses two of three pilot
  villages into early hunger — but that collapse is drifted
  evidence, not an arm-2 verdict.

## Sense-reading
No advancing variants exist (gate stopped the run), so no
flipped-seed sense-read was owed or performed. Transcripts for
all six pilot runs are committed (announce-sliced, per the r118
probe). One descriptive read, not a verdict: the two divergent
V-alloff scatters both end at pantry 0 with 1 alive — the honest
scattering line, not a crash or a silent death — and 89702's two
vDie fights are the only fights it ever saw. Nothing robotic,
static, or repeated was flagged in the pilot outputs; no
out-of-arm finding is appended to sim-findings.md from this run
(the drift finding itself is this run's report, not a backlog
item).

## Telemetry deviation check
Declared INAPPLICABLE, not run: the corpus is two 3-seed pilots,
and the endgame baseline is the same stale, regime-unrecorded
file r118 already flagged (its own text forbids pre-seat
comparisons; r48–r110 carried the same artifact). Running the
check would manufacture LOUD lines against a baseline that does
not describe this regime. No compare is fabricated.

## Convergence state
killed-at-pilot — by the calibration gate, not by a lever miss.
The arm-2 attribution question stays open; the next run is the
pinned-base re-registration named above.

## Metric review (for the NEXT run, not this one)
- The Stage 0 gate did its job: it caught base drift before any
  attribution spend. Keep the two-sided gate for any re-run.
- The r110 side of the gate is dead on arrival for any base after
  r110's: future toggle preregs must calibrate V-alloff against
  a same-base control, not a historical block, unless the base
  is pinned to the historical run's base.
- Sat-day drift on class-preserving seeds (89702 +8, 89705 −9 on
  V-full; 89705 +35 on V-alloff) should be tracked as a drift
  signal in future matched-block runs: class alone hides real
  trajectory movement.
- §15 balanced panels do not apply to this diagnostic: the
  instrument is the matched-seed classification itself, and the
  prereg staged design governs. No panel compare is attached,
  by design, not by omission.

## Proof results
- Variant constructor (scripts/apply-toggle-variant-20261104.py):
  all four single-OFF variants + alloff apply cleanly with
  `git apply -R` on the exact commit-diff subsets; alloff
  verified byte-equal to d8f334da8^ for both src/js files; every
  variant restored to HEAD after its run (`git status src/js/`
  clean at closeout). Hunk map: SIGDMG 3 hunks / GEAR 7 hunks +
  comment line / MORALE 1 hunk + comment line / TRICKHOLD 1
  hunk; zero unmapped hunks, zero DRIFT-BLOCKED variants.
  (One script bug found and fixed mid-run: blank-line handling
  in patch reassembly; the fixed script is what produced every
  run above. One operator typo — a split TOGGLE_PREFIX env
  assignment, exit 127, zero seeds run — was caught immediately,
  src restored, and the run repeated correctly; no data was
  affected.)
- Probe (scripts/probe-toggle-b-20261104.js): r118 probe verbatim
  except OUTDIR/PREFIX params (diff 18 lines, verified).
- Classifier (scripts/classify-toggle-b-20261104.js): per-seed
  class/satDay/uw/fights/kills from the probe JSONs.
- Sims: 6/6 pilot runs completed, probe .err files empty, no
  crashes. No jest suite was run (no game code is committed or
  landed by this diagnostic arm; the variant code was restored
  before closeout).
- No game-code change is committed or landed by this arm.
  Branch holds evidence/scripts only, as briefed.

## Commits (branch sim-toggle-b, ready for coordinator merge, pending ship)
- bb55221eb — toggle-b prereg: hunk map, variant constructor,
  r118-verbatim probe + classifier.
- (Stage 0 commit follows in the closeout message — per-seed
  outputs, logs, and this note.)
- No push, no bump, no live check — merged locally, pending ship
  (ship loop owns version bumps, pushes, live verification).
