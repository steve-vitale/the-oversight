# sim-wave4flip-b prereg — bisect the band-seed 10421 wave-4 flip (MEASUREMENT ONLY)

Run: fleshout-loop-b-20261028T0805Z, axis food-economy (per coordinator
assignment), arm sim-wave4flip-b. Committed BEFORE any judged sweep in
this arm. Zero src/js changes, zero default flips. If a game-code cause
is found it is documented as a named next arm — NOT fixed here.

Canon: docs/CANON.md read first. No canon doc covers band-seed wave
reach directly; docs/MONSTER-WAVES.md covers wave law generally and is
the reference if the flip traces to a wave mechanic. Nothing is
invented from scratch here: this arm attributes an observed flip, it
does not design a lever.

## The flip to explain

- Worker side (sim-caughtlift-fix-b, 0630Z run): pilot band
  10420–10427, competent policy, 100d death-aware cap, wave-4 reach
  2/8 — seeds 10421 AND 10423.
- Coordinator side (0630Z coordinator master re-run, same band):
  wave-4 reach 1/8 — seed 10423 only. Seed 10421 flipped wave 4 → 3.
- Judged fixture legs identical both sides; the band guardrail still
  passed (8/8, wall zeros unchanged). Cause NOT adjudicated.
- Bands are guardrails, not verdicts: this arm does NOT re-judge the
  caughtlift arm under any outcome.

## Question (BINDING)

Which intervening change flipped seed 10421's wave-4 reach from 4 to
3 — or is the flip non-deterministic / run-order noise, so that no
single commit can be blamed?

## Bisection bases (chain order, code states)

History on the linear chain is: worker creation base 5ef4d5bad →
loop-A landings (incl. w4tbkill phase B fa3516cc1, journey crisis
r59 a2a2a20f3) → 0527 coordinator evidence 3cb5f8b82 (evidence only)
→ divedeep prereg a71f30481 (evidence only) → divedeep fix
0761aab9b → caughtlift fix 98784fc00 → barwhy prereg abcdc2372
(evidence only) → barwhy fix 60f873319 → journey r64 6eb84f967 →
coordinator evidence 51757f233 (evidence only) → sysbond commits
(evidence + instruments only). Src-wise, 3cb5f8b82 == a71f30481, and
6eb84f967 == the coordinator master code base (51757f233 adds no code).

- P0 CONTROL = 5ef4d5bad (measurement-band base, no fix). Expect
  10421 wave 4 (sim-caughtlift-b reported 2/8 incl. 10421). If P0
  gives wave 3, the flip predates the 0630 run entirely and the
  worker/coordinator contrast is itself the artifact — report and stop.
- P1 CONTROL = 3cb5f8b82 (approx 0630 master, no fix). Distinguishes
  "flip already present before the fix" from "flip needs the fix
  tree". Reported, not judged.
- W0 "pre-divedeep" = 3cb5f8b82 tree + caughtlift-fix src changes
  ONLY (the two hunks of 98784fc00: abilityActions.js bumpTrust
  route + game.js bumpTrust route + observe table entry). This is
  the reconstruction of the worker's band-after tree (worker base
  ≈ 0630 master + fix). PILOT GATE: W0 must reproduce worker
  10421 wave 4 (see below).
- W1 "post-divedeep" = 98784fc00 tree as-is (== W0 + divedeep fix).
- W2 "post-barwhy" = 60f873319 tree as-is (== W1 + barwhy fix).
- W3 "post-r64" = 6eb84f967 tree as-is (== W2 + r64 fix).
  Coordinator-side reproduction: W3 must reproduce coordinator
  10421 wave 3.

Construction method (no checkout churn in this worktree, no new git
worktrees, no main-tree touch): `git archive <commit> src scripts
index.html` extracted to a scratch dir per base (src 31M + scripts
90M, evidence excluded — the 3.2G evidence tree is NOT copied);
W0 built from the 3cb5f8b82 extraction by applying ONLY the
98784fc00 src diff. The runner script (this arm's
scripts/test-wave4flip-b.js, committed here) is copied into each
extraction's scripts/ dir before running, so every base runs the
same instrument. Scratch dirs live under
~/workspace/worktrees/sim-wave4flip-b/.wave4flip-bases/ (inside
this worktree, git-ignored via untracked scratch — removed before
final commit; never committed, never merged).

## Instrument (worker's exact band substrate)

scripts/test-wave4flip-b.js is a verbatim parameterization of the
band() function of the committed scripts/test-caughtlift-fix-b.js:
same loadGame({seed, mode: 'caughtlift-fix-band',
fullTelemetry: false}), same competent-policy daily wrapper (arc /
table / rank tracking), same runDays({days: 100, sampleEvery: 10}),
same wave metric (result.maxWaveUnlocked). The ONLY differences
from the worker script: seed list from argv instead of the fixed
BAND constant, and JSON rows printed for capture. Verified by diff
of the band bodies before any judged run: the two band functions
differ only in the mode label ('caughtlift-band' vs
'caughtlift-fix-band', a manifest label only — mode never seeds
RNG; seed is a separate loadGame argument) and in the fix script's
extra 8/8 check. The committed corpus CAN therefore reproduce the
worker band exactly — no DIAG-NO-GO on method on that ground. If
any base extraction fails to run the instrument (missing module,
harness API drift), that base is reported as UNRUNNABLE with the
error, not guessed.

## Primary metric and ANSWER threshold (BINDING)

Primary metric, per base: seed 10421's maxWaveUnlocked ("wave reach")
under the instrument above, competent policy, 100d death-aware cap.

- ANSWERED with the flipping change iff: W0 reproduces worker
  wave 4 AND W3 reproduces coordinator wave 3 AND exactly one
  step in W0→W1→W2→W3 moves 10421 from 4 to 3 AND that step's
  result repeats on a second run of the same base AND the guard
  band (below) shows the move is seed-10421-specific (10423 stays
  wave 4 on both endpoint bases, or any other guard-seed move is
  reported alongside, not hidden).
- NON-REPRODUCIBLE iff: W0 fails to give wave 4 OR W3 fails to
  give wave 3 (after the determinism repeats below), OR the same
  base gives different 10421 waves across repeats. In that case
  the finding IS non-reproducibility — report it, do not chase
  further, do not attribute to any commit.
- DIAG-NO-GO on method iff: the committed corpus instrument cannot
  run on a base, or W0 cannot be constructed as specified (src
  diff does not apply cleanly). Report the blocker, do not guess.
- No other verdict is available. A miss is NO-GO, never re-scored
  against a friendlier metric (e.g. no switching to "wave-4 kills"
  or "arc" if wave reach refuses to move).

## Run plan (in order — pilot gate first)

1. PILOT: full 8-seed band on W0 (worker reconstruction). Must show
   10421 wave 4 (and, for guard purposes, the full row set).
   If W0 10421 != 4: run P0 and P1 controls before concluding —
   if P0 == 4 and W0 == 3, the reconstruction base is wrong, not
   necessarily the band (report as NON-REPRODUCIBLE with the base
   caveat, do not chase). If P0 == 3 too, the flip predates the
   run (report, stop).
2. Full 8-seed band on W3 (coordinator base). Must show 10421
   wave 3. This is the guard band for the coordinator side and the
   seed-specificity check (10423 expected wave 4 both sides).
3. DETERMINISM: seed 10421 re-run (standalone process, same
   instrument, same base) once on W0 and once on W3. A same-base
   flip kills any single-commit attribution (→ NON-REPRODUCIBLE).
   Note on run order: the full-band runs place 10421 second
   (after 10420) in one process; the standalone repeats place it
   alone in a fresh process. A standalone-vs-in-band disagreement
   is itself run-order evidence and is reported as such, not
   averaged away.
4. BISECTION screens: seed 10421 standalone on W1 and W2. The
   step that moves 4→3 is the candidate flipper. If a screen
   disagrees with its neighbors in a way that breaks the single-
   step pattern (e.g. W1 == 3 but W2 == 4), confirm that base
   with a full 8-seed band before concluding anything.
5. If a single step is identified: re-run 10421 on the flipping
   base's full band (if not already done) and read the
   sense-relevant transcript slice for 10421 on the two sides of
   the step (what the player would see differently, if the flip
   traces to a gameplay-visible change rather than a bare number).
   SENSE-TESTING LAW applies lightly here: a gameplay-visible
   cause gets quoted transcript lines; a pure-number cause is
   stated as such.

Seeds: 10421 primary; guard set = the full band 10420–10427 on
both endpoint bases (W0, W3) and on any confirmed flipping base.
Policies: competent only (the worker band's policy). Horizon:
100d death-aware cap (runDays stops on death; the worker band's
horizon — never a fixed 200d).

## Balanced panel (§15)

scripts/balance-panel.js has no corpus-ingest mode for
fixture/band output (standing panel exception, recorded in the
0630 coordinator evidence and the caughtlift-fix evidence). The
judged comparison here is direct on identical seeds across code
bases (same instrument, same seeds, same policy, same horizon),
which is the panel's headline-metric comparison done directly.
If the panel gains an ingest mode for this corpus shape, the
comparison is re-attachable from the per-base JSON rows committed
in the evidence file. The panel exception is stated, not faked.

## Metric review

(To be filled after the run. Pre-run notes: (1) "wave reach" is
maxWaveUnlocked as reported by runDays — an unlock metric, not a
kill metric; a flip in unlocks without a flip in kills would point
at unlock pacing, not combat, and must be said so. (2) W0 is a
reconstruction, not a surviving commit: if W0 and W1 agree, the
reconstruction question is moot for attribution (the step is
elsewhere); if they disagree, the reconstruction's fidelity is
part of the verdict. (3) The competent policy never lifts, so the
caughtlift fix itself cannot move band play through lifts; any
W0-vs-W1 move cannot be the caughtlift fix — but the fix IS in
both W0 and W1, so it cancels out of the bisection regardless.)
