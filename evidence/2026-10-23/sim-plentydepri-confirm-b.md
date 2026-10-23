# sim-plentydepri-confirm-b — PLENTYDEPRI confirm run (64-config, fresh seeds)

Run: oversight-flesh-out-loop-b-20261023T0330Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-plentydepri-confirm-b (base master 6ea142c1c).
MEASUREMENT ONLY — no game-code changes in this run. The lever (landed
df66ebaff, 2026-10-22) was verified intact on current master first: the
_plentyDepri hook region is code-byte-identical to df66ebaff (drift since
landing is other levers only — depositgate, armorvillage, rogue P1s), and
scripts/test-plentydepri-b.js (pilot proof, 28/28) re-ran GREEN on master
before any confirm spend.

NOTE: the pilot evidence file evidence/2026-10-22/sim-plentydepri-b.md is
not in the tree (the landing commit df66ebaff carried scripts + game.js
only; pilot numbers survive in its commit message: rot/100d 0.54x/0.62x,
GO, engagement 16/16, all guardrails hold). The prior 16-seed 180d confirm
(evidence/2026-10-22/sim-plentydepri-confirm-b.md, run
fleshout-b-20261022T035902Z) IS in the tree and is cited throughout; its
instruments (scripts/test-plentydepri-confirm-b.js) are retained for that
run's provenance and NOT overwritten — this run's instruments are new files
in the same namespace.

## The lever (unchanged on master)
Steve's ruling (DECISIONS.md 2026-10-21): SURPLUSFEED's post-hoc share trim
is REMOVED. Replacement is behavioral and bottom-up: villagers ease 50% of
the surplus push above their own meal-need estimate when the pantry is
plentiful (>4 fresh days — duty-PRODTHROTTLE's own definition;
hungryStreak>=3 stands it down; own meal sacred by construction — eased >=
needEst >= real meal need). Env gate: _plentyDepriOn() — ON in browser; in
node ON unless PLENTYDEPRI=0. Control = PLENTYDEPRI=0; armed = PLENTYDEPRI=1
(default-ON as landed). Day-level voice: one line/day after the meal loop
(Game.say '🍽️ ...'), rotating speaker, 12-line pool naming real instead-of
work. Ledger (v._plentyDepri.days) counts every eased decision. No RNG in
the path — gate-off trajectories stay byte-identical.

Common-mode substrate note: current master also carries DEPOSITGATE
(env-gated, default-ON in node when DEPOSITGATE is unset) and other landed
levers. Both sides of this confirm run identical code and identical env
except PLENTYDEPRI, so the before/after delta is attributable to
PLENTYDEPRI; DEPOSITGATE is common-mode, not a confound.

## PRE-REGISTRATION (bound per §14 — a miss is NO-GO, never re-scored)
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every script),
  100d death-aware horizons (dead villages stop; +10d tail max),
  policies {leadfeast, belongfeast}.
- Seeds: 16 FRESH seeds — 9209,9222,9223,9224,9225,9227,9228,9229,9230,9232,
  9233,9234,9236,9237,9239,9240 (pilot used 9001–9008, prior confirm used
  9009–9016; scanned scripts/ + evidence/ filenames and contents — the only
  hits for these numbers were incidental (ms timings, kcal values), never
  sim seeds) × 2 policies × {PLENTYDEPRI=1, PLENTYDEPRI=0} = 64 configs.
- PRIMARY (per feast-side): (rotFresh+rotPreserved) absolute kcal per 100
  days alive, armed/control <= 0.80
  (pilot 0.542x leadfeast / 0.622x; prior confirm 0.348x/0.508x).
- GUARDRAILS (per feast-side):
  (a) median paired (armed−control) survival-diff >= -10d (paired by seed)
  (b) exposure-normalized starvation: armedRate <= controlRate + 2/(armedVD/100)
      (rate = starvationDeaths/villageDays*100)
  (c) no new death modes: armed cause-families (kind-mapped; named-monster
      strings are combat-family variants, per the pilot's operationalization)
      ⊆ pooled control corpus across both policies
  (d) national reach not collapsing vs control (report numbers; >= control-2)
  (e) pantry median-of-run-medians freshDays: armed >= 0.5x control
      (report both; the mechanism is EXPECTED to reduce pantry glut)
- ENGAGEMENT (report): armed runs with depriKcal > 0.
- WATCH (report-only): channel laundering ratios (no inflow channel >2x),
  wins/exiled, arc/wave reach, death-cause shares, median/max survival.
- Instrument: the 64-config env sweep is the precise arm measurement on
  identical code (scripts/sweep-plentydepri-confirm-b.js, derived from the
  pilot's scripts/sweep-plentydepri-b.js, cited; + freshDays daily series +
  per-seed JSONs). Verdict analyzer: scripts/analyze-plentydepri-confirm-b.js
  (exit 0 = GO). Proof: scripts/proof-plentydepri-confirm-b.js
  (fixture proof + det-gate + hook byte-identical + analyzer propagation).
  Balanced panel per §15: before/after panels on identical master with
  PLENTYDEPRI=0/1 — expected to hit the documented #797 "Unmatched flags"
  invalidity (env-gated lever by construction); the invalid compare .md is
  attached alongside the manual paired row analysis, metric NOT re-scored.
- Verdict: GO iff PRIMARY passes on BOTH feast-sides AND all guardrails
  hold; else NO-GO (report-only — the lever is already on master; a NO-GO
  is flagged to the coordinator, never a self-revert).

## Metric review (pre-sims)
- Guardrail (b) is the exposure-normalized revision of the pilot's raw
  starvation-deaths count (the prior confirm's metric review noted the raw
  count is survival-confounded; this run pre-registers the normalized form).
- Guardrail (e) is NEW (not in pilot/confirm): the mechanism throttles the
  surplus push, so pantry freshDays should fall somewhat — "not collapsing"
  is operationalized as armed >= 0.5x control, report both.
- Guardrail (d) keeps the pilot's >= control-2 operationalization.
- Horizon 100d (vs 180d): death-aware; the food-economy question is answered
  in the first 100 days (glut + easing engage from day 2 on fast-glut
  seeds); 16 seeds/policy gives the power Steve asked for ("more seeds
  each time").
- nationalEnd keeps the pilot's corrected definition (rank∈{national,global}
  || nationalLive), same both sides.

## Results
(TBD — sweep running)
