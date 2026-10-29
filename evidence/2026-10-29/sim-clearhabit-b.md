# sim-clearhabit-b — PILOT NO-GO / KILL (homeward clearing habit)

Run: oversight-flesh-out-loop-b, arm sim-clearhabit-b, axis
food-economy. Worktree sim-clearhabit-b. POLICY-SIDE ARM ONLY:
zero src/js changes, zero default flips. This worker's coordinator
merges; the arm is killed, not adopted.

Prereg: evidence/2026-10-29/sim-clearhabit-b-prereg.md
(committed before any judged after-leg). Pilot seed declaration:
evidence/2026-10-29/sim-clearhabit-b-pilot.md (8 seeds declared
before any pilot after-leg, selected from a disclosed 138-seed
gate-OFF scan pool). Judge (prereg, unchanged): opportunity rescue
rate on the after leg, GO >= 0.50 with opportunity n >= 8;
G1 median survival >= before - 2; G2 starvation <= before + 2;
G2c causal-window player starvation <= 2; G3 zero-tolerance.
Rate < 0.50 with n >= 8, or any G3 violation, KILLS the lever
at pilot.

## Verdict: PILOT NO-GO — lever KILLED, reverted zero-trace

| Metric | Result | Bar |
|---|---|---|
| Opportunity rescue rate | 5 / 22 = 0.227 | GO >= 0.50, n >= 8 |
| G1 median survival | 30 vs 30 before | >= before - 2 |
| G2 starvation deaths | 0 vs 1 before | <= before + 2 |
| G2c causal-window player starvation | 0 | <= 2 |
| G3 violations | 0 | zero-tolerance |

Guards all pass; the primary metric alone kills the lever. This
is a kill on the lever's own bar, not a rescore: no metric was
changed mid-run.

## Per-seed after leg (opportunity / rescued)

| Seed | Opp | Rescued | Dominant status |
|---|---|---|---|
| 11626 | 1 | 0 | cleared 1 (evening still ended away) |
| 11636 | 10 | 0 | unclearable-creek 10 |
| 11639 | 1 | 1 | cleared 1 |
| 11654 | 1 | 1 | cleared 1 |
| 11697 | 1 | 1 | cleared 1 |
| 11707 | 6 | 0 | unclearable-creek 6 |
| 11714 | 1 | 1 | cleared 1 |
| 11728 | 1 | 1 | cleared 1 |

## Mechanism: creek is unclearable and dominates the pool

16 of the 22 opportunities are creek blockages (seeds 11636 and
11707), rescued 0/16 — the habit has no creek remedy by design
(creek needs a bridge, not clearing). All 5 rescues are on
non-creek blockages (rubble / washed_out / fallen_tree). The
lever works where it applies but cannot reach the bar while
creek evenings dominate refused homeward hops. A future arm
would need a creek remedy first, or a differently defined
opportunity — that is a next run's prereg question, not a
rescore of this one.

## Kill actions (this landing)

- scripts/policies/clearhabit.js DELETED (168 lines).
- scripts/policies/nighttravel.js: homeward-clear hook removed
  (require + daily call); the file loads cleanly and no file
  under scripts/policies/ references clearhabit anymore.
- scripts/analyze-clearhabit-b.js: away-partition fix — counted
  opportunity evenings (awayOpp) in the partition sum instead of
  dropping them, so awayPartitionOk holds on the judged data.
- scripts/test-clearhabit-b.js: rewritten as the kill-state
  proof (K1–K4 zero-trace checks + T7–T10 corpus checks +
  T11 verdict-under-bar check). The original T0–T6 synthetic
  checks tested the deleted policy and are retired with it, not
  faked. Proof re-run green, 0 skipped corpus checks.
- Evidence: prereg + pilot declaration (already committed),
  before/after corpora (8 seeds each), analysis JSON with
  pooled numbers and NO-GO verdict, this file.

## Landing note for the coordinator

Evidence-only kill landing. NO src/js change, NO policy change
surviving (the nighttravel edit is a revert, not a lever),
NO default flip, NO game-code trace of the arm. Worktree
contains only the kill landing at handoff (verified before
reporting). Report: 'killed at pilot, evidence-only, pending
coordinator merge'.
