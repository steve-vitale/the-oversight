# sim-hurthome-fix-c — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T1220Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-fix-c. Axis: food-economy.
Arm: GUARDRAIL-FOCUSED RE-JUDGMENT of the hurt-aware turn-home rule for
TRIPS — the NAMED NEXT ARM from Loop A sim-hurthome-fix-b
(evidence/2026-11-04/sim-hurthome-fix-b.md, verdict NO-GO: primary met,
BOTH guardrails breached) and sim-hurthome-fix-b-prereg.md (both read in
full before this prereg was written).

## CONTEXT (not re-litigated)

- Fix-b verdict: primary MET (armed pooled median return latency 0 parts
  vs baseline 2 parts, trips only, returned-hurt cases); guardrails
  BREACHED (median daysAlive 84.5 vs 100, tolerance −10; survived seeds
  6 vs 9, tolerance −2); total deaths armed 230 vs baseline 201.
  Fix-b's matched table shows two-way cascade flips (one seed died d63
  → survived 100d; another survived 100d → died d81), so the breach
  cannot be read on 16 seeds as proof of a systematic survival cost —
  nor waved away. This arm answers ONLY that guardrail question.
- The latency primary is SETTLED and is NOT re-judged here (reported
  descriptively only, same definition as fix-b).
- Fix re-applied EXACTLY: `git cherry-pick 5cf217912` on this branch
  (new hash d16dec828; same message, same game.js +29 and test 97
  lines; the HURT-RETURN hunk diffed identical to fix-b's). No
  redesign: hp gate stays <= 7, purpose 'leave' stays excluded, no
  expedHurt write-back. Proof test scripts/test-hurthome-fix-a.js
  verified 10/10 green BEFORE this prereg and before any judged sim.
- Canon read first: docs/CANON.md, docs/MAP.md (way home). No canon doc
  covers away-return timing or hurt-traveler behavior — the mechanism
  is code-read, not invented canon.

## INSTRUMENT (fix-b event instrument + the coverage fix)

- scripts/hurthome-b-lib.js + scripts/sweep-hurthome-fix-c.js +
  scripts/analyze-hurthome-fix-c.js (adapted from the fix-b files:
  new seed band, new corpus dir, retro-open, D1/D2 legs).
  scripts/test-hurthome-b.js stays green 20/20 (lib, unchanged paths).
- COVERAGE FIX (fix-b's metric review orders it): when a hurt-return
  line fires for a villager with NO open case, the sweep opens a
  retrospective case at that tick (lib.retroCase, proof-tested by
  scripts/test-hurthome-c.js, 6/6 green BEFORE this prereg): event =
  the return tick, source 'retro-line', so the travel scan closes it
  returned-hurt at latency 0. Retro-open is refused when a case is
  already open, when purpose is 'leave', and when hp is not hurt hp.
  Every run reports line-count vs case-count as a coverage check
  (fix-b's gap: 24 lines vs 22 cases, ~8% undercount).
- CASE, latency, trip/walk-out split, LEAVE exclusion, per-part scan
  net, and narration audit are all exactly as in the fix-b prereg.
  Lethal one-shot hurts with no prior alive-hurt observation open NO
  case; they appear only in per-seed death counts.
- Cell/code guard in the sweep: CELL=armed refuses to run without
  Game.shouldHurtReturn; CELL=baseline refuses to run with it.
  BASELINE runs first on pre-fix game.js (git show d16dec828^:game.js;
  git diff must show exactly the fix hunk reversed); ARMED runs after
  restoring the fix commit's game.js. Cells differ by EXACTLY the fix
  commit.

## DESIGN (cells, policy, horizon, seeds — pinned)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (comparability with fix-a/fix-b).
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit).
- Seeds: PILOT 98701–98708, CONFIRM 98709–98716. Band change, stated
  plainly: the brief's proposed 97701–97716 is NOT fresh — an exact
  seed file exists (evidence/2026-11-02/perseed-creekwood-a/
  cw-base-s97701.json), and loose 977* files exist elsewhere. Bands
  98101–98116, 98201–98216, 98301–98316, 98401–98416, 98501–98516,
  98601–98616 all have exact-seed files under evidence/; 98701–98716
  is the first band with ZERO exact-seed files (regex
  s987(0[1-9]|1[0-6]) followed by a non-digit, whole evidence/ tree).
  Corpus dir evidence/2026-11-04/perseed-hurthome-fix-c/ (filenames
  suffixed -baseline / -armed).

## PRE-REGISTERED JUDGMENT (judged against this header, §14)

- PILOT GATE (8 seeds/cell): instrument errors 0, unclassified 0,
  trip event cases >= 8 in EACH cell, else STOP with
  INSUFFICIENT-DATA (do not extend the horizon, widen the hp gate,
  or manufacture events).
- JUDGED CENSUS (pooled 16 seeds/cell): INSUFFICIENT-DATA if pooled
  trip cases < 16 in either cell, OR pooled returned-hurt trip cases
  < 8 in either cell. Counts shown descriptively only.
- PRIMARY (descriptive, NOT re-judged): pooled median return latency
  (parts), trips only, returned-hurt cases. Report armed vs baseline.
- GUARDRAILS (hard, same thresholds as fix-b): median daysAlive armed
  >= baseline median − 10 days; survived-seed count armed >= baseline
  count − 2 seeds.
- DECOMPOSITION LEG (pre-registered, decides breach meaning):
  (D1) per-seed flip directions: seeds where armed outlives baseline
  vs underlives baseline (daysAlive comparison per matched seed).
  (D2) death decomposition: total deaths per cell split into (i)
  deaths of villagers who had a returned-hurt case earlier in that
  seed (armed; qualifying case = trip returned-hurt case with
  closeDay <= death day) / a hurt case earlier in that seed
  (baseline; qualifying case = any trip case with eventDay <= death
  day), and (ii) all other deaths. Same-day hits are broken out
  separately so the <= rule's sensitivity is visible. Report counts
  and shares for both cells.
- WALK-OUT EXCLUSION (hard, same as fix-b): an exclusion FAILURE
  voids GO outright. Failure = any armed walk-out case closed
  returned-hurt with latency <= 2 parts, OR any armed hurt-return
  line naming a walk-out villager.
- NARRATION AUDIT (required for GO): >= 1 armed hurt-return line
  found in armed transcripts, quoted and judged TRUE (names the
  returned villager, hp matches the return snapshot, line says
  hurt/cut-short).
- DECISION RULE (binding):
  - GO = census met AND guardrails hold AND walk-out exclusion holds
    AND narration audit passed AND instrument clean. GO lands the
    fix commit + proof test + prereg + evidence + both corpora +
    instrument changes, with [needs-eyes] (already on the fix
    commit). The coordinator merges; this worker does NOT push,
    bump, or verify live.
  - NO-GO (systematic cost) = census met AND a guardrail breached
    AND (D2) shows armed returned-villager deaths EXCEED baseline
    hurt-episode-villager deaths AND (D1) flips are predominantly
    one-way (armed-underlives seeds >= 2x armed-outlives seeds).
  - INSUFFICIENT-DATA = census met AND a guardrail breached BUT the
    NO-GO conjunction fails (two-way flips and/or no
    returned-villager excess) — the breach is consistent with
    cascade noise and the fix decision needs a larger (32-seed)
    fresh band, NOT a verdict. State this plainly; do not claim a
    systematic cost.
  - NO-GO and INSUFFICIENT-DATA both REVERT the game.js change
    before reporting (keep instrument + prereg + evidence +
    corpora). The proof test reverts with the fix (it asserts a
    function the reverted tree does not have).
- §15 BALANCED PANEL — DECLARED INAPPLICABLE (before the pilot, same
  reason as fix-b: the panel measures no hurt-event latency metric).
  Comparison rests on the pre-registered per-seed matched table +
  analyzer aggregates, never a fabricated panel.

## SENSE TEST (after the judged run, before verdict)

Quote >= 2 armed hurt-return lines judged against their own case
records (meaning, coherence, consequences — never just counts).

## VERDICT RULES (§14 — a miss is NO-GO/INSUFFICIENT-DATA per the rule
## above, never re-scored)

A miss is never re-scored against a friendlier metric mid-run. Doubt
about a metric goes under "metric review" in the evidence, for the
NEXT run. An instrument failure (unclassified > 0, errors > 0) is
fixed in the instrument, the affected seeds re-run only, and the fix
is stated — never hidden by re-scoring.

## METRIC REVIEW (to be filled in the evidence file, not here)

Reserved: whether the guardrails, the D1/D2 decomposition, the
retro-case coverage fix, and the <= death-day rule were the right
instruments, judged AFTER the run — never revised mid-run.
