# sim-gateclassify-b — classify the round-6 gate failures (Loop B, 2026-11-12 1430Z)

Arm: sim-gateclassify-b · Run: fleshout-loop-b-20261112T1430Z · Axis: winnability chain — measurement hygiene (tracker 1130Z next blank #5)
Worktree: `~/workspace/worktrees/sim-gateclassify-b` · Branch: `sim-gateclassify-b`
Base: master tip `5c4361ccc` (== worktree tip at start; no rebase needed)
Canon read: `docs/CANON.md` (manifest + standing rules). This arm makes ZERO src/js changes and ZERO game-code changes — test hygiene only.

## Pre-registration (written BEFORE the check.js run)

**Primary metric:** every failing script in `check.js --quick` on merged master, classified into exactly one class. GO threshold: 100% of failures classified with a standalone reproduction (pass/fail + time) recorded; zero failures left unclassified; zero (d) real failures left without a standalone reproduction command and a sim-findings.md line.

**Classification classes:**
- (a) CPU-starvation timeout — passes standalone (record standalone time).
- (b) stale-panel/proof artifact — fails only because the retained neutrality proof predates the tip (record the manifest key that moved; if sim-proofrefresh-b9 has landed by then, re-run and expect green).
- (c) known pre-existing artifact — cache-flags spawn cap / phone-frame stale evidence (cite the prior ruling, do not re-litigate).
- (d) REAL failure — fails standalone on an assertion (quote the failing assertion, name the owning system, file a sim-findings.md line if it is a real game defect).
- A failure unreproducible standalone after two attempts is (a) with both attempts recorded, not silently dropped.
- Also classify the 3 slowest scripts even if they pass.

**Command:** `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-sim-gateclassify-b`, stdout+stderr captured TO A FILE (`evidence/2026-11-12/sim-gateclassify-b-checkquick.log`), run under `setsid` so a parent death cannot kill it. Never run a second check.js concurrently. Expected wall time ~17–43 min depending on load.

**Prior gates this run classifies against:**
- Round-6 gate (Loop A fleshout-20261112T1215Z, evidence `evidence/2026-11-12/sim-bisect-adopt-round6-1215.md`): 321 passed, 19 failed in 2575s under extreme load (peak 23.6). The 3 slowest all hit the 120s cap and each re-ran standalone PASSING (table-endings 59s, occupation-panels 64s, synergy-stall 58s) — CPU-starvation timeouts. The full 19-name list was LOST to tail buffering; 16 failures remain unclassified. That loss is what this arm fixes.
- 1130Z gate (Loop B, commit `459ae661f`; log at `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-winnability-round-1130-gate.log`): 334 passed, 6 failed in 990s. The 6: `scripts/godpath/test-living-garden-deed-attainment.js` (120s TIMEOUT), `test-measurement-proof-update.js` (exit 1, "Proof source inputs are not current" — b8 panel went stale when master moved), `test-measurement-workflow.js` (1 failed leg: retained neutrality proof covers current inputs — same stale-panel root cause), `test-measurement-cache-flags.js` (known 30s spawn-cap artifact, already NO-GO'd by sim-mcconfirm-refresh-b), `test-phone-frame-proof.js` (pre-existing stale phone evidence), `test-one-person-army-deed-attainment.js` (120s TIMEOUT).
- 0930Z round: check.js --quick on merged master `11e576828` as 334 passed, 6 failed (4× 120s load timeouts, cache-flags artifact, phone-frame-proof pre-existing stale).

**Standing notes for this run:**
- sim-proofrefresh-b9: branch exists, NOT landed on master as of 14:48Z, NOT in `~/workspace/worktrees/REGISTRY.json` (no live tree). Do NOT re-judge the proof-update failure as a game defect — classify as stale-panel (b); re-check AFTER b9 lands if it lands before this arm finishes, otherwise record as pending-b9.
- Box load at run start: load avg ~5–6 (moderate; sibling playtest check.js + journey runs in flight). Expect timeouts to be load artifacts — that is the hypothesis to test, not a conclusion to assume.
- Instrument: `scripts/gateclassify-parse-20261112.js` parses a check.js log and emits the failure-name list (the exact list the round-6 gate lost); proof test `scripts/test-gateclassify-parse-20261112.js`.

## Run

*(to be filled after the check.js run completes)*

## Classification table

*(to be filled after standalone re-runs)*

## Metric review

*(to be filled at closeout)*
