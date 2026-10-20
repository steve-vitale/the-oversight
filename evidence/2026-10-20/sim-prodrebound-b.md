# sim-prodrebound-b — production-response diagnostic (food-economy, observational)

Run: fleshout-loop-b-20261020T0630Z (STALE-LOCK RECOVERY of the dead 0430Z run —
the worker's heartbeat went 115+ min stale with no processes and no file writes;
coordinator adopted the tree and finished the arm), arm sim-prodrebound-b (DIAGNOSTIC —
instrument-only, no lever, no landing, zero src/js changes).
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

16 runs, 2242 paired day-rows (dawn snapshot → same-day inflow), all 8 fresh seeds
× leadfeast/belongfeast, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, SURPLUSFEED
unset. Corpus: evidence/2026-10-20/perseed-prodrebound-b-obs/{leadfeast,belongfeast}.json;
aggregate: evidence/2026-10-20/prodrebound-b-obs-analysis.json.

## Dose-response: does inflow rise when the pantry falls?

NO — at the aggregate, inflow FALLS with the pantry. The village starves downward;
there is no aggregate production rebound.

- OVERALL: lean (≤4 fresh-days) 3119 vs fat (>4) 5300 kcal/day = **0.59x**,
  Pearson(dawn freshDays, same-day inflow) = **+0.49** (lean n=504, fat n=1738).
- share_surplus (the dominant funnel, ~84% of inflow): lean 2066 vs fat 4530 =
  **0.46x**, pearson **+0.555**. The autonomous surplus-sharing funnel is
  PRO-CYCLICAL — it shares most when the pantry is fat and collapses when lean.
  It never answers a lean pantry.
- duty_fish: lean 371 vs fat 12 kcal/day = **31.46x** — the ONE named channel with
  a lean-elevated response. It fires on 213/504 lean days (42.3%) vs 12/1738 fat
  days (0.7%); mean 879 kcal/day when firing lean. Pearson −0.147 (mean-masked
  by the 57.7% zero-lean-days; the ratio is the honest measure).
- Everything else is flat or pro-cyclical: traps 0.47x, away_wild 0.95x, other
  0.82x (pearson −0.03/−0.04/0.02, noise). duty_forage/duty_garden/duty_hunt/
  duty_cook/haul_field read 0 in this instrument's channel classification (their
  yield arrives through the surplus funnel — instrument limitation, honest note
  below).

Pre-registration clause (a) — "lean-day inflow ≥ 1.3× fat-day inflow on at least
one named channel, or Pearson ≤ −0.25 on ≥ 50 pooled day-pairs": **MET** via
duty_fish (31.46x, 2242 day-pairs). The Pearson alternative is not met
(−0.147), but the OR clause is satisfied.

## Channel attribution

The duty_fish lean surge is the PRODTHROTTLE disengage leg — a NAMED mechanism
(src/js/game.js:14935 `prodThrottleEngaged()`, :15011 `prodThrottleHungerExempt()`,
applied in `resolveOneAssignment()` at :6487–:6514):

- When dawn pantryFreshDays > 4, duty forage/garden/fish assignments are REDIRECTED
  to non-perishable alt-tasks (wood/water/stone) instead of routing fresh surplus
  into stockPantry. When ≤ 4 the duty fires through (plus the hunger-exempt leg for
  villagers hungry 3 days running).
- Measured throttle engagement: lean 15/382 = **3.9%** vs fat 4104/4128 =
  **99.4%**. The governor disengages exactly when it should — but it only governs
  DUTIES. share_surplus (84% of inflow) and away_wild never pass through the
  throttle at all; the glut funnel is ungoverned by design.
- duty smoke drive (cook preservation throughput): lean 1707 vs fat 2838 kcal/day
  (0.60x) — also pro-cyclical: more to preserve when fat, nothing to work with
  when lean.

Pre-registration clause (b) — "the response attributed to a NAMED code mechanism":
**MET** (PRODTHROTTLE).

## Marginal rot: does the marginal production rot?

YES on the fat side, and it concentrates in the channels the throttle cannot touch:

- share_surplus: 9037k inflow → 3328k rot (**36.8%**), of which 1115k rotted ≤3d
  after arrival (**12.3%** of inflow — fresh arrivals are 3-day shelf by
  construction, PRESERVATION.md).
- away_wild: 1201k → 474k rot (**39.4%**), fast-rot 15.0%.
- traps: 51k → 21k rot (**41.5%**), fast-rot 21.8%.
- duty_fish: 214k → 9k rot (**4.3%**), fast 3.6% — the one lean-responsive
  channel's product is EATEN, not glutted.
- other: 38.8% rot, 16.7% fast. system: 42.2%/17.6% (tiny volume).

So the #570 feastdraw perversion has a named shape now: on the fat side the
village keeps producing through the autonomous funnel (~12% of inflow rots within
3 days of arrival, ~37% overall); on the lean side production collapses instead of
rebounding. The production side has NO lean answer except duty_fish.

## Wall numbers

- leadfeast (n=8): won 0, table 7, **national 8**, w4 7, w5 0, med 158d, max 180d,
  ends {village-lost:6, survived:2}, starveD 216.
- belongfeast (n=8): won 0, table 8, **national 0**, w4 8, w5 0, med 155d, max 180d,
  ends {village-lost:7, survived:1}, starveD 191.
- Death causes (241 total): combat 136 (71 belong / 65 lead), monster 64,
  starvation 11, wounds-that-wouldn't-close 5, sickness 3, contest 6, ambush 4.
  Villages die fighting while hungry — starvation days (407) rarely end in
  starvation deaths (11); the hunger lands on fighters.
- No scale-wall movement expected or claimed from a diagnostic (wins 0/16 —
  pre-seat substrate, SEATDRIVE=0).

## Village assessment (plain words)

Sixteen villages, all competent-play, and twelve of them die — mostly between
day 84 and day 168 — killed by combat and monsters while carrying hundreds of
starvation days between them. The shape is consistent: the pantry goes lean for
a stretch (504 of 2242 day-pairs are lean), inflow halves instead of rallying,
the autonomous sharing funnel goes quiet exactly when it's needed, and the
fighters weaken into the next raid. The only thing that answers a lean pantry is
the fish net: on 42% of lean days somebody is out on the water, bringing home
~900 kcal — and it all gets eaten. The fat villages are the mirror image: the
pantry sits at 200+ fresh-days, the throttle honestly redirects duties to the
wood pile ("the pantry can't take more; the wild will keep"), and the autonomous
funnel hauls surplus in anyway — a third of it rots. The village is a
pro-cyclical machine: feast when fat, fade when lean.

## Sense-testing

60d sense run (leadfeast s6810, scripts/sense-prodrebound-b.js — say() lines
matching econ patterns). The glut is VOICED, not just measured:

- Throttle redirect reads honest and human: "🌿 Hans checks the pantry before
  heading out — the shelves are full, ~224 days of fresh on hand… leaves the
  fish nets standing and turns to the water run instead. The pantry can't take
  more; the wild will keep."
- The glut's cost is narrated daily: "The village threw out spoiled stores:
  Foraged food, Foraged food (dried). (pantry)" — EVERY day, d44–48.
- The smoke-rack line repeats identically day after day: "🍲 Hans cooked for the
  haven — meals stretched. The racks are already full (19,119 kcal kept — more
  than the haven can eat before it turns), so Hans left the fresh pile for
  tonight's dinner instead of smoking it onto the rot pile." — same 19,119-kcal
  figure, same phrasing, five days straight. The numbers read as a stuck gauge
  (the rack cap), and the repetition is robotic — voice follow-up candidate for
  a future narration arm, not this diagnostic.

## Metric review (§14)

- The lean threshold (≤4 fresh-days) IS the PRODTHROTTLE threshold, so the
  dose-response partly measures the throttle's own disengage leg rather than an
  independent behavioral response. For a diagnostic this is the attribution, not
  a confound — but a future LEVER test should separate throttle-mediated
  response (duties) from autonomous response (funnel).
- duty_* channels other than fish read 0 — instrument classification, not game
  fact: duty forage/garden/hunt yields arrive through the share_surplus funnel
  (stack tags merged), only fish's net-haul keeps its tag. Future instruments
  should tag at assignment resolution, not arrival.
- The 16th leadfeast run (s6912, survived the full 180d) was missed by the dead
  worker's sweep log and added by the recovery coordinator via the sweep's resume
  support; all dose-response numbers above are on the complete 16-run corpus.

## Named next lever spec (for the food-economy axis)

DIAG-GO: (a) duty_fish 31.46x ≥ 1.3x bar — MET; (b) named mechanism PRODTHROTTLE —
MET; (c) concrete lever shape — proposed:

**sim-sharelean-b**: a "share_surplus lean valve" (policy-side, default OFF).
When dawn freshDays ≤ 4, autonomous surplus arrivals are re-tagged into the
PANTRY funnel (stockPantry) instead of villager packs — the funnel answers lean
the way duty_fish does, without touching the throttle or the fat-side sharing
culture. Primary: lean-day inflow ratio ≥ 1.3x vs control on identical seeds;
guardrails: no rise in fast-rot (the valve must not turn lean glut into fat rot),
laundering 0, starvation deaths ≤ control.

Second candidate (cheaper, narrower): **duty_fish scale-up** — widen fish-duty
assignment when lean (the one proven lean-responsive channel). A fish-only lever
is inherently capped by water access; propose as arm 2 if the valve arm fails.

## Convergence state

DIAG-GO. #570's production-rebound question is answered: no aggregate rebound
exists; the only lean-responsive channel is duty_fish via the PRODTHROTTLE
disengage leg; the fat-side glut rots through the ungoverned share_surplus /
away_wild funnels (~37–42% rot). The named next lever (share_surplus lean valve)
is specified above. food-economy stays converging; no scale-wall movement
claimed (wins 0/16 on the pre-seat substrate).
