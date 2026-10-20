# sim-prodrebound-b — production-response diagnostic (food-economy, observational)

Run: fleshout-loop-b-20261020TxxxxxxZ, arm sim-prodrebound-b (DIAGNOSTIC — instrument-only, no lever, no landing, zero src/js changes).
Worker tree: ~/workspace/worktrees/sim-prodrebound-b.
Answers sim-findings #570: the killed sim-feastdraw-b lever's perverse dose-response
(Pearson(fd nights, pair rot ratio) = +0.73; backfires 2.10x/1.87x on permanent-glut
seeds). The next arm on this axis must investigate the production rebound (inflow-side)
before any further draw/supply lever.

A 2026-10-18 diagnostic of the same question (evidence/2026-10-18/sim-prodrebound-b.md,
instruments/scripts in this tree) found the feastdraw backfire does NOT reproduce with a
faithful replay (fidelity gate failed: replay 0.32x/0.43x vs original 1.87x/2.41x) and
mapped the inflow channels (share_surplus 84–88% of inflow, PRODTHROTTLE governing only
duties). This run is a FRESH-SEED, OBSERVATIONAL re-measurement on current master —
no replay, no armed side — because the substrate moved under the 2026-10-18 run:
the pantry cap (food.js pantryCapKcal, 120,000 kcal default) now binds stockSurplus
and pantryAdd, and sim-surplusfeed-b landed a surplus-share governor (SURPLUSFEED,
default OFF). The question stands: does the village over-produce into gluts it
cannot eat, and WHICH channel drives any rebound?

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE sims)

- **Question**: on the base substrate, does village inflow rise when the dawn pantry
  falls (a production rebound), and does the marginal production rot within days of
  arrival? Which channel drives the response — the duty smoke drive, the scholar haul,
  villager forage/away-forage, task-lead duties, or the autonomous share_surplus?
- **Diagnostic design**: 8 FRESH seeds (6810, 6811, 6813, 6814, 6815, 6816, 6817, 6912 —
  banned-list clean, unused by any prior run) × {leadfeast, belongfeast} = 16 runs,
  180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, SURPLUSFEED unset (default-OFF base;
  the landed governor is not this diagnostic). Instrument-only: per run per day, the
  dawn pantry state (pantryKcal, pantryFreshKcal, pantryFreshDays, roster, burnAvg),
  then that day's inflow by channel, duty smoke-drive throughput, PRODTHROTTLE
  engagement, assignment mix, starvation, and rot attributed to the arrival channel
  with arrival→rot lag.
- **Primary metric (binding)**: the pantry→inflow response. DIAG-GO requires ALL of:
  (a) a measured negative response — lean-day (dawn pantryFreshDays ≤ 4, at/under the
  PRODTHROTTLE threshold) inflow ≥ 1.3× fat-day (> 4) inflow on at least one named
  channel, or Pearson(dawn freshDays, same-day inflow) ≤ −0.25 on ≥ 50 pooled day-pairs;
  (b) the response attributed to a NAMED code mechanism (PRODTHROTTLE / pantry-cap door /
  cook staffing / villagerDayProduction); (c) a concrete lever shape proposed for the
  next run. DIAG-NO-GO: no channel shows a lean-elevated response, or the response
  cannot be attributed — documented honestly.
- **Marginal-rot measure**: per channel, rotByChFast / inflow (share of the channel's
  inflow that rots within 3 days of arrival).
- **Balanced panel**: none — there is no before/after; this is an observational
  diagnostic. §15 applies to lever comparisons, not to this run.
- **Guardrails**: none beyond det-gate — diagnostic, not lever. Instruments must be
  RNG-clean (byte-identical trajectories instruments on/off, proven in
  scripts/test-prodrebound-b.js).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. "Rot can't be smoked back into
  food" holds; the instrumented paths (pantryDraw, sweepSpoiled) are untouched.
- Food ladder (PRESERVATION.md): cleaned (2d) < cooked (5d) < smoked (30d) <
  rendered fat (90d) < pemmican (120d). All stockPantry/stockSurplus fresh arrivals
  get spoilDay = day + 3 (+ granary bonus) — every fresh arrival is 3-day shelf by
  construction, so "marginal production rots" is measured as arrival→rot lag ≤ 3d.
- The 2026-10-17 landed pantry cap (120,000 kcal default, food.js:1968) binds
  stockSurplus and pantryAdd — the ungoverned-inflow world the 2026-10-18 diagnostic
  mapped no longer holds. This run measures what the cap changed.

## Instruments

- scripts/prodrebound-obs-instruments.js — NEW shared instrument module: attachObs(Game)
  applies all read-only telemetry wraps (stockPantry channel attribution + arrival
  tags _diagCh/_diagArr on brand-new items; stockSurplus share_surplus funnel + tags;
  sweepSpoiled identity-deduped rot attributed to the arrival channel with arrival→rot
  lag; resolveOneAssignment duty flag + per-day cook smoke-drive throughput + laundering
  count; objReturnEffect purpose flag; prodThrottleEngaged per-day sensor; assignTask
  mix; sleep dawn-snapshot; registerDeath kind-aware). Tags use untracked fields that
  stacksMatch ignores — trajectories are RNG-clean (det-gate below).
  KNOWN LIMIT: merged units inherit the stack's existing tag (fungibility by design);
  rot attribution is exact for never-merged arrivals, approximate for merged ones.
- scripts/sweep-prodrebound-b-obs.js — 16-run sweep (banned-seed check inline,
  env asserts FEASTSCALE_R13=1/SEATDRIVE=0/SURPLUSFEED-unset).
- scripts/test-prodrebound-b.js — proof: existing replay sections kept; NEW 2026-10-20
  OBS sections: RED fixture (off: no tags/telemetry; on: classification, dawn sample,
  arrival tags, rot-channel + lag attribution, throttle sensor pass-through), GREEN
  end-to-end (2 real 25d runs: dawn/inflow rows pairable, dose-response computable),
  OBS det-gate (40d × 2 seeds, instrumented vs pristine byte-identical).
- scripts/analyze-prodrebound-b-obs.js — dose-response aggregator (lean-vs-fat channel
  deltas, Pearson pantry→inflow, marginal-rot shares, wall numbers).

[RESULTS PENDING — sweep running at time of pre-registration write]

## Results

## Dose-response: does inflow rise when the pantry falls?

## Channel attribution

## Marginal rot: does the marginal production rot?

## Wall numbers

## Village assessment (plain words)

## Sense-testing

## Metric review (§14)

## Named next lever spec (for the food-economy axis)

## Convergence state
