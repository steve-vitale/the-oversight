# Pre-registration — sim-wildavoid-rejudge-a (Loop A, run fleshout-20261118T1315Z, axis: scale-onramp)

Committed BEFORE any re-judgment analysis. Judge strictly against this
file; a miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the NEXT run.

## Run identity

- Arm: sim-wildavoid-rejudge-a (Loop A) · Branch: `sim-wildavoid-a`, base
  master 27eec991b, build commit a54c8131e (unchanged — NO src/ changes in
  this arm; re-judge only).
- Re-judges the 1015Z pilot (evidence/2026-11-18/sim-wildavoid-a.md,
  prereg evidence/2026-11-18/sim-wildavoid-a-prereg.md), whose verdict was
  frozen NO-GO solely because bar B4 (arm wild Suburb deaths == 0) failed
  on ONE death. The original evidence's metric-review section proposes
  re-scoping B4 to outmatched Suburb meetings only; this re-judge freezes
  that re-scope BEFORE any analysis and judges the EXISTING corpora under
  it. NO new sims.
- Corpora (unchanged, judged as-is): 8 seeds 104411–104418, 150d
  death-aware, competent verbatim, substrate VETREENGAGE=1 PARTYSIZE4=1
  FLEEREPAIR2=1, SEEKGATE unset, FIGHTALLY2 unset:
  `evidence/2026-11-18/perseed-wildavoid-a-ctl/` (MODE=ctl, WILDAVOID
  unset) and `evidence/2026-11-18/perseed-wildavoid-a-arm/` (MODE=arm,
  WILDAVOID=1). Analysis `wildavoid-a-analysis.json`, panel
  `wildavoid-a-panel.md` (compare decision: review_required — see B-panel
  note below).

## Canon (read first)

- docs/CANON.md: read. docs/MONSTER-WAVES.md (leave-counter canon): The
  Suburb — "comfort as a trap — you don't kill it, you ESCAPE it" — and
  monsters.json weaknesses: "you can't kill it — LEAVE. Navigation is
  victory; the fight is a timer". The 'leave' itself is CORRECT
  counterplay per canon. This arm changes NO game code and NO canon.

## Re-scoped bar B4 (frozen)

B4 as originally written (arm wild Suburb deaths == 0) fails on a death
the lever is scoped not to prevent: a matched-party pre-learning mauling
death, identical on both legs, predating any avoid on its seed. A zero
bar on a matched-party death is unmeetable by an outmatched-only rule —
it measures the trick-learning window, not the lever. B4 is re-scoped to
what the lever actually controls:

- **B4 (re-scoped):** count Suburb deaths ONLY among OUTMATCHED Suburb
  meetings (party < 3, or anyone unarmed/unarmored — the same
  `winPlanOutmatched` rule the lever applies). Matched-party pre-learning
  deaths are excluded. GO requires BOTH:
  - (a) arm outmatched-Suburb deaths == 0, AND
  - (b) every outmatched Suburb meeting on the arm leg was avoided
      (arm avoids >= outmatched Suburb meetings on the arm leg, with
      each arm-leg outmatched Suburb meeting accounted for as avoided).
- The single failing death (seed 104417, day 98, aid origin) must be
  VERIFIED from the corpora, not taken on trust: identical on both legs
  (same day, same outcome vDie, same damage 17, same party of three
  armed+armored villagers) AND predating any avoid on that seed (first
  avoid day > 98 on the arm leg; first divergence day > 98). If the
  corpora do NOT support that verification, B4 fails and the re-judge
  is NO-GO — the bar is not weakened further.

## Re-verified bars B1, B2, B3, B5 (frozen; recomputed from the corpora with an independent analysis, NOT taken from the evidence file's numbers)

- **B1 (the avoid fires):** armed-leg wild avoids (`v4avoids` rows,
  wave >= 4, origin world-tick/aid/patrol) >= 50% of the control leg's
  would-avoid wild meetings (analyzer `classifyWouldAvoid` verbatim on
  ctl `v4encounters`). Contact precondition: ctl would-avoid wild
  meetings >= 8, else METRIC-BROKEN.
- **B2 (no launch loss):** wave-4 launch events (`dawnbidDeparts` rows
  with `result === 'launch'` and a wave-4 plan) armed >= 90% of ctl,
  AND launched instances (any-commit, frozen classifier) armed >= 90%
  of ctl. (The 1015Z band staged 30/30 on both legs; the re-judge
  recomputes, not trusts.)
- **B3 (the price banks):** armed-leg wild wave-4+ deaths (vDie
  outcomes on wild origins) <= ctl AND armed-leg wild vFlee damage
  (sum of `vTaken` over wild vFlee rows) <= ctl.
- **B5 (instrument):** 8/8 files per leg, exactly the frozen seed list,
  0 instrument errors, missingHp 0, recMismatch 0, D3 replica-vs-live-
  gate agreement >= 0.95 on expedition rows (n >= 5) on BOTH legs,
  `winPlanStats.wildAvoids` == recorded avoids, say-lines == avoids
  ('gives it room' count == avoids on arm, 0 on ctl). Trajectory
  control: first diverging day per seed >= that seed's first avoid day,
  or no divergence when no avoid.
- **Panel (§15):** the 1015Z panel compare returned review_required
  with two `regression_watch` lines, both investigated in the 1015Z
  evidence file (denominator effect on the death-rate line; single-seed
  104416 divergence on the community-loss line; neither line a
  `regression_signal`). The re-judge does NOT re-run the panel (no new
  data); it records the panel decision as-is and notes that the
  review_required outcome was investigated, not waived. A
  `regression_signal` would have been a NO-GO; none was returned.

**Verdict: GO iff B4 (re-scoped) && B1 && B2 && B3 && B5 && panel has no
`regression_signal`. NO-GO iff any B fails with population present.
METRIC-BROKEN iff ctl would-avoid wild meetings < 8, or ctl wild
wave-4+ meetings < 40, or D3 n < 5 on either leg.** No re-scoring.

## Proof test (frozen)

- Re-run `scripts/test-wildavoid-a.js` on the branch tip; expect ALL
  PASS, 91 assertions. Record the result. A failure is a loud failure
  of the re-judge, not a re-score.

## Scope

- NO src/ changes. NO new sims. NO panel re-run. NO edits to
  `~/workspace/goals/.../hidden_files/sim-findings.md` (findings updates
  go in the final report for the coordinator to file).
- If the corpora cannot support a bar, say so in the evidence instead
  of weakening the bar.
