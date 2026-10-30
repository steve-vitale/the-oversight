# sim-sweeten-a — PRE-REGISTRATION (binding, §14)

Run: flesh-out loop, run fleshout-20261030T1747Z, arm sim-sweeten-a.
Axis: scale-onramp. Backlog item claimed by this run: LEANLINK NEVER
SWEETENS (from arm sim-tributecost-a, run fleshout-20261030T1427Z,
evidence/2026-10-30/sim-tributecost-a.md): sweetener calls 0/0 across
8 leanlink seeds despite the documented "sweeten if pantry > 25,000"
path in scripts/policies/leanlink.js.

DIAG ONLY. Zero src/js changes, zero default flips, zero policy-default
changes, zero edits to any existing instrument (the tributecost
recorder in scripts/sweep-tributecost-a.js is owned by a sibling arm;
if a recorder change is needed it is reported as next work, not made
here). Only NEW analysis scripts (scripts/test-sweeten-a-*.js).
No [needs-eyes]: no feel, combat, or UI change.

Canon: docs/CANON.md read first. NO canon doc covers the
envoy→counter→sweetener mechanism specifically (CANON.md manifest has
no such doc; scripts/policies/leanlink.js header says so explicitly).
Mechanism is therefore cited from code only (src/js/hierarchy.js,
scripts/policies/leanlink.js), not invented, and the gap is stated
in the evidence file rather than filled with invented canon.

## Primary metric

Per-seed explanation completeness over the 8 leanlink pilot seeds
9911–9918: for EACH seed, the zero sweeteners are attributed to
exactly one mechanism, proven from data, not asserted:

- T-NEVER: no counter was ever staged on that seed (proposeLink never
  returned 'counter'), so the policy's sweeten branch was never
  evaluated at all — the trigger site was never reached; OR
- C-FAILS: at least one counter was staged and answered, and on
  EVERY answer the pantry at answer time was ≤ 25,000 kcal, so the
  policy took the 'accept' branch every time; OR
- OTHER (must be named with evidence, e.g. pendingCounter cleared
  elsewhere before the policy answered, sweeten attempted but the
  engine's 1,500-kcal removal failed, recorder blind spot).

## GO threshold (DIAG-GO — ALL legs required, no partial GO)

(a) Sweeten code path cited with file + function: trigger site
    (policy evaluation of pendingCounter) AND engine condition sites
    (answerCounter 'sweeten' branch, its 1,500-kcal removal, its
    re-judgment bar).
(b) Per-seed pantry-vs-25,000 traces for ALL 8 leanlink pilot seeds:
    daily pantry series vs threshold, plus pantry at every counter
    answer (and at every counter staging, where the corpus allows).
(c) Every seed's zero explained: each seed classified T-NEVER,
    C-FAILS, or OTHER-with-evidence, with counts (counters staged,
    counters answered, sweeten calls, accept calls) per seed.
(d) Verdict on whether sweeteners are a live cost channel at all
    (engine path reachable + policy path reachable + observed on
    these seeds or proven unreachable), plus ONE concrete next step
    (fix, kill, or Steve-call).

Anything less is NO-GO. No re-scoring against a friendlier metric
mid-run; metric doubts go under "metric review" for the NEXT run.

## Horizon + why

Death-aware, never a fixed 200d: reuse the tributecost 180d pilot
corpora (seeds 9911–9918, leanlink, run to 180d or village-lost,
whichever first) as the primary evidence — the question is about
those exact runs' zeros, so identical seeds are mandatory. New
instrumented re-runs, ONLY if the corpus cannot distinguish
trigger vs condition on some seed, use the same seeds and the same
180d-or-loss horizon (dead villages stop; no +10d tail beyond the
loss day, since the loss day contributes no further counter
answers). No confirm band: this is a diagnostic, and 8 seeds is
the pilot gate; a confirm would answer a different question.

## Seeds and policies

- Seeds: 9911, 9912, 9913, 9914, 9915, 9916, 9917, 9918 (the
  tributecost leanlink pilot band).
- Policy: leanlink with LEANLINK=1 (byte-identical to the
  tributecost runs; no policy change). Competent column is NOT
  re-run (competent never courts: 0 proposals, 0 counters, so it
  cannot sweeten by construction — stated, not re-measured).
- Harness: scripts/sim-harness.js only (loadGame, seeded BEFORE
  eval; never two harnesses in one node process; never stub
  Game.save). New scripts are scripts/test-sweeten-a-*.js.

## Method (in order)

1. Code trace: hierarchy.js proposeLink / _stageCounter /
   answerCounter; leanlink.js leanCourtship counter-answer block;
   tributecost analyzer's sweetener definition (answerCounter with
   pantryDelta < 0) — check whether that definition could hide a
   sweeten attempt (e.g. a failed 1,500 removal still moves the
   pantry, or a sweeten call whose removal is exactly offset).
2. Corpus read (no new sims): per seed, from
   evidence/2026-10-30/sim-tributecost-a-corpus-leanlink/seed-*.json
   — courtCalls (proposeLink returns, answerCounter args +
   pantryBefore/Delta), pantryDaily series vs 25,000, proposals,
   links formed.
3. If and only if step 2 leaves a seed ambiguous (e.g. a staged
   counter with no recorded answer, or an answer whose pantry
   cannot be pinned to the threshold), run a new instrumented
   trace on that seed only, wrapping proposeLink/answerCounter at
   runtime and logging pantry at staging and at answer.
4. Brief sense read of any counter transcript lines surfaced by
   the traces (SENSE-TESTING LAW, brief — this arm is diagnostic).
5. Verdict judged against the header above; evidence file
   evidence/2026-10-30/sim-sweeten-a.md.
