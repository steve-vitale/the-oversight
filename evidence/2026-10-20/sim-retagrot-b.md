# SIM-RETAGROT-B — the ROT re-tag pilot (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-retagrot-b
Axis: food-economy (scale-wall lens) — the claimed SIDE-OBSERVATION of the sharelean kill (backlog line 691)
Base SHA: 8de1b508b (worktree tip at proof time).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sims)

- **Question**: the sharelean kill (evidence/2026-10-20/sim-sharelean-b.md) measured
  that its PANTRY-funnel re-tag halved fast-rot on lean days (0.52x, guardrail),
  "arrivals eaten, not stored" — while the lean inflow primary died on the
  engine's own CRISIS SHARING. Does the re-tag ALONE, broadened beyond lean
  days (always-on), buy rot reduction with a ROT primary, without eating the
  buffer dangerously?
- **Lever**: RETAGROT re-tag (policy-side, scripts/policies/retagrot-b.js, ZERO
  src/js changes). Wraps leadfeast/belongfeast (scripts/policies/feastscale.js).
  RETAGROT_B=1 default OFF (unset → pure delegation, byte-identical — pinned by
  the proof's RED phase). Requires FEASTSCALE_R13=1 (loud RETAGROT STOP otherwise).
  Mechanic: persistent idempotent Game.villagerMealDay wrapper (installed on the
  first armed daily; the harness runs Game.sleep AFTER policy.daily returns, so
  a transient wrap would miss the meals — verified by a failing G1b on the
  first layer draft). Each wrapped meal re-tags the share write from
  stockSurplus into the PANTRY funnel (Game.stockPantry(give, 'Foraged food'),
  ≤500-kcal pieces, fresh clock), save/restored per-meal in finally. NO
  trustFactor override (the engine's trust culture + CRISIS SHARING decides how
  much is shared — the layer only redirects where it is stored). CAPDOOR=1
  defers to the original stockSurplus. Voices at most one line per day when the
  re-tag moved kcal, day-keyed among 3 honest variants.
- **Method**: paired before/after on identical seeds, pooled over lead+belong.
  Control: RETAGROT_B unset. Armed: RETAGROT_B=1. Both sides retagrot-wrapped
  feastscale policies (leadretagrot/belongretagrot) + FEASTSCALE_R13=1 +
  SEATDRIVE=0 + SURPLUSFEED unset.
- **PRIMARY (binding)**: pooled fast-rot ratio (armed/control, pooled
  lead+belong, /100d run-days) ≤ 0.8x. The bar is deliberate: sharelean's
  lean-only re-tag measured 0.52x; the broad re-tag could dilute or backfire on
  fat days (a full pantry may not eat arrivals the same day), so 0.8x is the
  honest bar for "the rot benefit survives broadening."
- **GUARDRAILS (hard)**: starvation deaths ≤ control; median survival ≥
  control−10d; national ≥ control−2; armed/control total inflow ≥ 0.9x (the
  re-tag moves ~zero inflow — it must not destroy it); laundering 0; no new
  death mode (mechanism-triaged, not the naive string check — procedural
  monster names are noise).
- **Horizon**: 180d death-aware (dead villages stop +10d tail max).
- **Seeds**: 5403–5410 × leadretagrot/belongretagrot = 16 configs. Fresh: not
  on the coordinator's banned list (asserted inline by the sweep; the list
  includes sharelean's 5201–5208 and snareskill's 5301–5308) and unused by any
  prior run (proof used 5401/5402 only; pilot corpus disjoint from proof by
  design). Do not re-run a landed arm — git log shows no retagrot arm.
- **Det-gate**: 16/16 bit-identical repeat-pairs on BOTH sides (control×2,
  armed×2 per config) before trusting any number (r27 rule). Gate-off
  byte-identical pinned in the proof.
- **Panel (§15)**: attempt the balanced panel via scripts/balance-panel.js; the
  documented env-flag caveat applies (pantryguard-b2/inflowguard-b/sharelean-b
  precedent: an env-flag treatment cannot produce a valid compare — document
  honestly, do not ship a bogus panel). The pre-registered metrics bind
  regardless.
- **Verdict form**: GO (pilot meets PRIMARY + guardrails → confirm 12–16
  seeds) / NO-GO (kill fast at pilot — layer deleted zero-trace per kill
  protocol, instruments + evidence kept).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. The re-tag moves kcal
  between funnels; it never converts, cooks, or re-clocks food — "rot can't be
  smoked back into food" holds, and the laundering guardrail is satisfied by
  construction + measured.
- No-silent-actions: the re-tag voices at most one line per active day (3
  day-keyed honest variants, deterministic — avoids the verbatim-repetition
  class the sharelean sense read flagged).
- CRISIS SHARING (game.js villagerMealDay, bal-survival 2026-10-10): the engine
  already opens the share gate when the pantry is nearly empty; the layer does
  not touch it.
- No new canon invented; no game-code changes.

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **R1**: always-on re-tag — the lever is the funnel, not a lean valve. Lean
  gating + gate-forcing died with sharelean.
- **R2**: RETAGROT_B unset → pure delegation (RED phase).
- **R3**: RETAGROT_B=1 without FEASTSCALE_R13=1 → loud RETAGROT STOP.
- **R4**: CAPDOOR=1 → defer to the original stockSurplus (refusal honesty first).
- **R5**: stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh clock —
  the sharelean instrument signature (away_wild classification) stays
  comparable.
- **R6**: voice — one deduped line per day when kcal moved, day-keyed among 3
  variants, deterministic.
- **R7**: seeds 5403–5410 (fresh per the banned/used check above); 5401/5402
  are proof-only. Paired control re-measured on the current tip in the same
  sweep.

[RESULTS PENDING — layer + proof + det-gate + pilot sweep at time of pre-registration write]

## RECOVERY NOTE (main agent, 2026-10-20 ~07:15 CDT)

Loop B run fleshout-loop-b-20261020T0930Z timed out at 7200s with this arm's
worker dead (no live processes, heartbeats 2h stale). State at recovery:

- BROKEN MECHANISM: scripts/test-retagrot-b.js FAILS on the worker's own
  proof — G1a (re-tag moved 0 kcal), G1b (engine stockSurplus called 349x
  armed-side, never intercepted), G1d2 (vmd wrapper installed=false). The
  persistent Game.villagerMealDay wrapper never installs, so the re-tag never
  fires. The worker wrote the layer + test but never ran the proof; the
  mechanism is broken, not merely untested.
- INCOMPLETE: no det-gate, no pilot, no verdict. The arm never reached
  measurement.

This arm is NOT killed (it was never judged) — it is parked with a RED proof.
The layer is default-OFF (RETAGROT_B unset → pure delegation), so the commit
is inert. Next loop B run: fix the vmd wrapper installation FIRST (the
proof's G1d2 is the diagnostic — the wrap must install persistently before
the harness's Game.sleep, per the evidence's own R-design note), re-run the
proof to green, THEN proceed to det-gate + pilot. Do not pilot a RED arm.
