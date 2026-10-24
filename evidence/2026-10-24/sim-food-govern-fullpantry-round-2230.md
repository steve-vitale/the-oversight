# Coordinator evidence — run fleshout-loop-b-20261024T2230Z (axis food-economy — 2 arms LANDED, merged locally pending ship)

Loop A live on scale-onramp at run start (2215Z claim, standing99 + tablepaths-witness,
NOT touched) -> B worked food-economy (converging). Loop A landed mid-run
(b6cec084f coordinator evidence + journey-landing r46 372b5e426); both B branches
rebased clean in their own worktrees (ff-only correctly refused the diverged
branches), proofs re-ran green after every rebase and on merged master.

## Arm 1 — sim-governverdict-b (commit 4a503f1b6, rebased from 7b265e10e)

The 2130Z run's named next blank: pre-register one governing system or tie-break
before the next deciding corpus. Built, not re-judged.

- `scripts/govern-verdict.js`: given per-seed paired rot records for two anchors,
  computes per-seed median step, aggregate sum step, ratio-of-medians step, and
  median per-seed step, and returns exactly ONE governing verdict.
- Hierarchy (pre-registered in the arm evidence header before the tool ran on any
  corpus): the per-seed median step GOVERNS (paired within seed, median-robust —
  one high-rot seed cannot set it, the documented failure mode of the aggregate).
  The other three summaries are diagnostics: printed in full, qualifying the verdict
  via a CONTESTED flag, never overturning it. Bands reused from leg2decide:
  STEP < 0.80, NO-STEP >= 0.90, INCONCLUSIVE between. CONTESTED iff any defined
  diagnostic lands in a different band than the governing class. Undefined
  diagnostics never contest; degenerate per-seed steps (both ratios 0, or parent 0
  with commit > 0) are excluded and counted, never imputed — this rejects the old
  analyzer's 0.000 artifact for seed 9268.
- Calibration GO: 12/12 pre-registered cases labelled as the hierarchy dictates,
  including the leg2decide-published shape reproducing M(parent) 0.487 ->
  M(commit) 0.196, governing step 0.404, aggregate 0.817, ratio-of-medians 0.876,
  median per-seed step 1.000 -> STEP (CONTESTED). Proof 55/55. This is calibration
  ONLY: the leg2decide deciding verdict (STEP CONFIRMED at preserver widening)
  stands unchanged and is NOT re-judged.
- System dry-run on current master (explicitly NOT a deciding verdict): fresh
  8-seed pilot pair, seeds 9300-9307, leadfeast/dg1, 100d, parent HEAD~1 a7aaa3b99
  vs commit HEAD 47426505e — anchors differ in zero src/ files, a genuine null pair:
  32/32 per-seed files valid, all anchor-pair files identical except the anchor tag.
  Tool output: NO-STEP, uncontested, all four steps exactly 1.000 (1 degenerate seed
  9304 excluded and counted, 7 identical seeds). This verdict says nothing about
  the rot question and must never be quoted as one.
- Wall (dry-run corpus only, SEATDRIVE=0 pre-seat regime): national 30/32, table 0,
  wins 0, wave 5 0, median survival 100d (horizon cap).

## Arm 2 — sim-fullpantry-diag-b (commit 874646764, rebased from eaa05354e)

DIAG of the open full-pantry starvation gap (villagers starve with ample pantry
kcal + fresh days). Instrument derived from sim-pantrystarve-b: meal-row dedupe
(one row per villager/day), B-rule self-fed guard, brief gate pantry >= 8,000 kcal
AND >= 3.0 fresh days at death.

- Verdict: DIAG-GO (GO-small-sample, qualified in the arm evidence). Pilot seeds
  94401-94408 gave only 2 full-pantry deaths (< 8), so the pre-registered extension
  band 94409-94416 ran; 16 seeds total, all completed on attempt 1.
- Full-pantry starvation deaths: 3/3 class A away-ration, 0 B haven-distribution,
  0 C other — classified share 1.000 (bar 0.80), every A case quoted. Cases: Antwi
  d14 s94407 (25,533 kcal, 14.9 fresh days, 8-day away decline, health 23->5);
  Stan d120 s94408 (21,583 kcal, 3.5d, low-health + 713 kcal away meal at 3 HP);
  Misky d143 s94416 (9,198 kcal, 3.7d, health 94->2, then an 869 kcal away meal).
  Two halves, same as pantrystarve: prolonged away decline vs low-health + short
  away meal. Sensitivity (watch-only): all 6 villager starvation deaths in the
  corpus are away villagers at any pantry level; pooled with pantrystarve, 8/8
  full-pantry deaths away, 0/8 haven-distribution.
- No fix landed: away-ration sizing and away-hunger narration are design decisions,
  not a trivial proofed change — the mechanism split is the deliverable, the fix is
  a named next arm (confirm first: n=3 pooled, one contrary case would break it).
- Proof on rebased branch: 28 legs pass + leg E skipped (env unset) = the worker's
  29-leg suite; on merged master the same. Sense read: all three death days serve
  a haven communal meal while the traveler dies away — the gap staged, not hidden —
  except Stan's decline exists only in the meal log (away-hunger invisibility,
  third sighting).
- Wall (16 seeds, competent, PD=1/DG=1, 150d): median survival 150d (capped),
  max 150d, national 0/16, table/wins 0/16 (competent alone carries no scale push —
  expected), wave 4 on 5/16, wave 5 on 0/16, Arc III 16/16. Death-cause shares
  (145 deaths): arena 67, monster 25, sickness 12, ambush 8, starvation 7, wound 6,
  contest 4, choir toad 3, the night 3, expedition 2, alien 2, combat 2, others 1 each.
  Meal adequacy: haven 99.1%, away 98.9% (18,489 deduped meal rows).

## Village assessment (plain words)

The dry-run villages looked like ordinary mid-game villages: almost all reached
national standing, none reached the table, none won, none passed wave 4 — the
familiar scale wall in miniature. The full-pantry villages lived to the horizon
cap with full shelves, and still lost three travelers far from home while the
haven ate communally — the food problem is not "not enough food" but "food that
cannot reach the person who needs it," and the game stages that irony in the open.
No village in either corpus won, reached the table, or touched wave 5; the scale
wall numbers below are regime-shaped, not new findings.

## Telemetry deviation check (both corpora, WINSEAT baseline — NOT rolled)

- Fullpantry corpus (n=17): national 12->0, table 16->0, wins 16->0 — all REGIME
  artifacts (competent-only, no scale push).
- Dry-run corpus (n=32): national 12->30, table 16->0, wins 16->0 — national is a
  pre-seat standing measure, table/wins are structurally 0 at SEATDRIVE=0.
- Baseline NOT rolled. No same-run investigation item.

## Metric review

- Governverdict: the strict CONTESTED rule will mark most real corpora contested by
  design (any band disagreement contests) — future deciding evidence should lead
  with the sensitivity view (concentration vs breadth, denominator- vs
  numerator-driven moves) alongside the label. Next deciding run should pre-register
  this system (or its successor) before sweeping — that was this arm's purpose, and
  it is now available on master.
- Fullpantry: GO is explicitly small-sample (n=3, pooled 8/8 with pantrystarve);
  do not present it as a strong claim. The B-rule fix is proven at unit level only
  (no live B case occurred). A fresh-seed confirm precedes any away-ration fix.
- Neither arm re-judges a prior corpus. The leg2decide deciding verdict and the
  leg2drift corpora stand as judged.

## Infrastructure

- Master moved under the run (loop A 2215Z landing + journey-landing r46); both
  branches rebased clean (zero file overlap between arms and with the new master
  commits), proofs green after every rebase and on merged master.
- Safe-commit index clobber hit both workers' commits (repaired via cacheinfo each
  time, commits verified correct); no clobber on the coordinator commit (verified
  below). No EPERM flap this run.
- check.js --quick on merged master (coordinator re-run, 363s): 280 passed,
  7 failed — the SAME profile as the 2115Z/2215Z runs (visible failures: the
  pre-existing parity gear assertion "they still wear their spear and jacket"
  and phone-frame proof staleness). Zero src/js and zero green-list files in
  either arm, so not attributable here; the check left no stray tree changes
  (only this evidence file untracked). Full failure list not captured (same gap
  as 2115Z/2215Z).

food-economy stays converging (NOT converged): the metric-contest blank is now
closed by a proven governing system, and the full-pantry mechanism is classified
(away-ration, small-sample), but neither a deciding rot corpus under the new system
nor an away-ration fix has landed. scale-onramp stays converging (untouched;
sibling loop A). Claim deleted; lock deleted.
Evidence: evidence/2026-10-24/sim-governverdict-b.md,
evidence/2026-10-24/sim-fullpantry-diag-b.md (both merged locally pending ship).
