# HUNGER-DEPTH EXEMPTION r2c — adoption/confirm attempt (fleshout-b ARM, orphaned)
2026-10-14 (run-b-20261014-1900, loop B) | axis: food-economy | arm: sim-hungerdepth2c

## Context
The r2 pilot (branch sim-hungerdepth2, commit 7759783d, run-b-20261014-0530)
built the HUNGERDEPTH-env-gated depth exemption (redirect forfeited when
progState().hungryStreak >= 3; production continues; beat narrates; ledger
v.throttleExemptDepth) and went GO AT PILOT on calibrated guardrails
(primary starve/100vd 0.783 <= 2.406; rot per-vd 1.0013x <= 1.335;
median 144d >= 112; national 11/16 >= 7). The run died before the 12-16
seed confirm and never landed. This run was tasked to adopt and confirm it.

What the current tip holds (established BEFORE any sim spend, via code
inspection + git log + sim-findings line 173):
- Commit 1a44a2c8 (2026-10-14 10:55 UTC): "food waste lever:
  hunger-winter exemption on prodthrottle" — the exemption behavior
  (prodThrottleEngaged() returns false at streak >= 3) ships ALWAYS-ON.
- Commit 43a1805f (2026-10-14 13:17 UTC, loop B ARM 3, GO, [needs-eyes]):
  "THROTTLEBEAT: re-land hunger-depth exemption narration + counter" —
  prodThrottleHungerExempt() + the sense-tested "hungry eat first" beat +
  v.throttleExemptDepth counter, behavior-inert (det-gate 32/32).
- sim-findings line 173 marks the shipped version [fixed] and records the
  r2 arm as SUPERSEDED, not merged: "the arm's env-gated game.js hunk
  would be dead code — released abandoned".

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written before adoption
- Question: does the orphaned r2 HUNGERDEPTH-gated exemption confirm on the
  current tip (12-16 fresh seeds, 180d death-aware), with a same-tip control?
- Arms: control = landed throttle, HUNGERDEPTH=0; armed = HUNGERDEPTH=1;
  identical fresh seeds; leadcourt/belongseek.
- PRIMARY: armed starve/100vd <= control + 1.130 (one-sided, absolute bound
  re-derived from the new control).
- GUARDRAILS: rot per-vd <= control x 1.335 (r25b calibration);
  median >= control - 3d; national >= control - 2/16; no new death mode
  (n>=3 per finding #216).
- GO = primary AND all guardrails. A miss is NO-GO, never re-scored.

## What happened at adoption time
The patch (git diff 2bde919f 7759783d -- src/js/game.js, one 20-line hunk,
saved to ~/workspace/patches/hungerdepth2.patch) applied cleanly to the
current tip. It is SEMANTICALLY DEAD under the current tip: the env-gated
check lives inside the `prodThrottleEngaged()` redirect block, but the
shipped code returns false from prodThrottleEngaged() at hungryStreak >= 3
(1a44a2c8) — the block can never see streak >= 3, so the gate can never
fire. Re-applying would add unreachable env-gated code on top of the
shipped always-on mechanism: a blank to avoid, not a lever to land.

## Adopt-proof RED phase (the honest check that exposed the supersession)
RED = patch reversed on the armed tree, MODE=red. The r2 proof
(scripts/test-hungerdepth2-20261014.js) FAILED its RED expectations:
streak-3/4 duties continued production with exemption counted — because
the CURRENT TIP's shipped code fires the exemption without any patch and
without HUNGERDEPTH. The RED "exemption inert" premise is false on this
tip: the mechanism is already live, ungated. RED is unachievable — not a
harness failure, the finding.

## Current-tip verification of the SHIPPED mechanism (instead of the confirm)
Ran the shipped throttlebeat proof (scripts/test-throttlebeat-20261014.js)
on the pristine current tip — ALL GREEN (36 checks):
- streak 3/4: redirect forfeited, production continues, "hungry eat first"
  beat fires naming pantry state + depth + duty, counter increments
  (forage/garden/fish all three).
- streak 1/2: redirect fires normally with the landed beat; no exemption
  beat, counter 0.
- Non-food duty (wood) at streak 3: no beat, no counter.
- Ledger accumulates across the night (3 duties -> 3).

The orphaned arm's confirm question is answered by code that shipped under
two commits with its own GO evidence. Re-running a 16-seed confirm of an
env-gated dead branch would measure nothing.

## Wall numbers (no new sims — this arm contributes none)
The shipped exemption's own numbers: see evidence/2026-10-14/sim-throttlebeat-b.md
(counter 407 exempted duties across 9/16 runs; det-gate 32/32; national/table/wins
reported there). No table, no wave-5 from this lever class.

## Village assessment
No new long-run sims were spent — correctly, per the adoption finding.
What the current tip's villages do about hunger-depth: when chronic hunger
(streak >= 3) arrives with a full pantry, the throttle stands down and the
villager keeps working food duty while the beat says so honestly. The
throttlebeat evidence (43a1805f) contains the sense-tested transcripts.

## Verdict
**KILLED AT ADOPTION — SUPERSEDED, not failed.** The r2 arm's mechanism is
already on master in a better form (always-on behavior 1a44a2c8 + narrated,
counted re-land 43a1805f, both GO with their own evidence). Landing this
orphan's patch would add unreachable dead code. Per kill protocol: game-code
reverted byte-clean (HUNGERDEPTH count 0 in src/js/game.js, no diff);
instruments kept (scripts/test-hungerdepth2-20261014.js,
scripts/measure-hungerdepth2-20261014.js, adopted from the branch);
evidence written here. Convergence state: killed-superseded (a GO-adjacent
resolution — the lever stands, the duplicate dies).
Findings backlog: sim-findings line 173 already carries the [fixed]
record; no new findings from this run.

## Metric review
(mandatory)
1. The pre-registration assumed an ungated tip; the tip carries the
   shipped exemption, so the control/armed contrast does not exist —
   HUNGERDEPTH=0 and HUNGERDEPTH=1 behave identically under 1a44a2c8.
   The honest verdict is supersession, not a metric miss.
2. Lesson for future orphan-adoptions: check for the mechanism on the tip
   (grep for the signal name) BEFORE spending the apply-proof cycle. The
   r2 spec's mechanism audit line already documented the supersession
   ("SUPERSEDED, not merged") in sim-findings — the run context carried
   it, and it should have been read before the adoption cycle started.
   Adoption briefs should mandate a "is this already on the tip" grep.
