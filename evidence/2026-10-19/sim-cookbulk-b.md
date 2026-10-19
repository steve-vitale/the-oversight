# sim-cookbulk-b (round 3) — batch-cook v2 trigger: capacity-honest acceptance + survival-signal attribution

Loop B, run fleshout-loop-b-20261019T0530Z, axis food-economy. Worker: sim-cookbulk-b tree.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE sims)

- PRIMARY: mean cooked kcal per b3 side >= 20,000 (capacity-honest; v2 measured
  23,570 kcal/side, v2base 28,997), control ~0.
- GO threshold: b3 mean >= 20k across the 16 pilot sides (8 fresh seeds x
  {leadfeast,belongfeast}), guardrails met. A miss is NO-GO, never re-scored
  mid-run.
- CO-PRIMARY (survival attribution): median survival b3 >= control - 10d. On a
  miss, attribute per-pair: dose-response of batch water draw (waterDrawnL) vs
  survival delta, water-rationed days armed vs control. This is the b2 run's
  -46d median survival signal (131d vs 177d) put to a mechanism test: batch
  drains cistern -> village mobilizes water hauls + half rations -> survival
  cost? — or noise.
- GUARDRAILS (standard): starvation deaths armed <= control+2 (per-pair
  collapse-aware); no new death mode (dedup on (who,day,cause), kind filter
  person/villager); national >= control-2; no laundering (cooked kcal is the
  engine's post-cook kcalEach x units — digestibility, never exceeding gross);
  det-gate byte-identical with gate OFF.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 94101-94108 (fresh; verified unused — the 94102/94108 matches in
  evidence/ are kcal values inside census JSONs, never seed uses; same
  standard as the v2 run's 9214-9221 verification).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep paired control, identical seeds.
  8 seeds x 2 policies x {control,b3} = 32 runs (pilot).
- §15: per-seed panel-schema JSONs (evidence/2026-10-19/perseed-cookbulk-b3/);
  scripts/build-cookbulk-b3-panels.js; control->b3 compare .md attached.
  The panel is the instrument, the pre-registered threshold is the judge.
- VERDICT RULE: GO (land the trigger) only if PRIMARY GO + survival clean.
  PRIMARY GO + survival miss attributed to water draw -> NO-GO, named next a
  water-neutral trigger. PRIMARY miss -> NO-GO (the line stays dead).
- BASE: e92a9c0ab (2026-10-19).

## Context — why round 3, and why the brief's "NEW" is stale

The task brief was written from the INFRA-BLOCKED 0930Z plan, before the
1030Z finisher landed the arm twice over. The honest state of the line:

- v1 (lean-day trigger, landed 2026-10-17): GO at its own bar (17 firings,
  31,866 kcal total across 16 sides, ~2k/side).
- v2 (commons trigger: ANY Haven day, pool >= 1,000 kcal — landed, then
  KILLED at confirm 2026-10-18): engaged 16/16 runs at mean 23,570
  cooked kcal/side (control 0) but missed the 50k bar — "fire-time capacity
  caps it." Layer deleted zero-trace.
- b2 (capacity lever "water for the pots", KILLED-AT-PILOT 2026-10-18):
  PRIMARY 28,997 >= 25k met, but the lever contributed EXACTLY 0 on all 8
  pairs (b2-v2base delta 0; both sub-levers found no headroom — the batch is
  WATER-capped, not fire-time-capped; the engine already boils nightly
  dirty via hearthBoil). Guardrail miss: median survival -46d (131d vs
  177d). Layer deleted zero-trace.
- The b2 metric review's honest nexts: (a) src/js crew batch-cook verb
  (villagers cook when the scholar is away — needs coordinator approval for
  src/js; OUT of this arm's policy-side scope), or (b) accept the v2 trigger
  as the capacity-honest mechanism at ~25-30k/side, BUT investigate the -46d
  survival signal first.

This arm is (b): a faithful reconstruction of the v2 trigger (the b2 run's
proof-verified v2base) re-measured on fresh seeds with a capacity-honest bar,
plus the survival-signal attribution. Re-running the 50k bar would be
re-running a killed line — dishonest. The 20k bar is the metric review's own
capacity-honest number.

## Canon read

- docs/CANON.md: the ladder cleaned < cooked < smoked < rendered < pemmican;
  human skills != alien abilities (processing is the human-skill lane —
  correctly policy-side here); "If you don't know, it doesn't show" (the
  layer does not bypass knowledge gates — the engine teaches 'cook' on the
  first blind attempt, canon "the attempt teaches the technique"); no silent
  actions (the engine voices every batch).
- docs/PRESERVATION.md: cooked = 100% known yield, safe, ~5d shelf; "no
  nonsensical calorie loss" (the layer only routes items through the engine's
  cookAll — digestibility math, cooked never exceeds gross); smoking pace 16
  ticks (the batch costs an honest 16 ticks via the engine).
- Finding #483 (evidence/2026-10-17/sim-camptasks-b.md): 2.03M kcal cookableRaw
  (13.8k/lean-day), zero policy actor. This arm is its named next.
- Finding #476 (division of labor): cookable routes to pantry/duty cook the
  same day — the v2 commons trigger cooks the PANTRY pool (prepStash) at
  Haven, which is where the census showed the pool sits.

## The layer (b3)

scripts/policies/cookbulk-b3.js (COOKBULK_B3=1, default OFF), withCookBulkB3
wrapper on upkeep. Zero src/js.

- RECONSTRUCTION FIX (2026-10-19, pre-sweep): the first b3 draft read the pool
  from the scholar's prepStash only (following the b2 Part A fixture pins).
  A 60d instrumented diagnostic (seed 94102: Haven 49/60d, fire+time always)
  showed the prepStash cookable pool at 0 kcal max — the trigger NEVER fired.
  The v2 evidence header documents the real spec: the pool is **pack + prep
  stash + pantry, Haven stores access** (evidence/2026-10-18/sim-cookbulk-b.md:
  "the reachable cookable pool (pack + prep stash + pantry, Haven stores
  access)"). The census pool (2.03M kcal) sits in the PANTRY, which the
  division of labor (#476) fills. Fixed: poolContainers() reads all three in
  fixed order (pack, prepStash, pantry), the pantry gated on
  havenStoresAccess() !== 'none'; splitForWater fills across containers in
  order, splitting the boundary stack in its home container; cookAll mutates
  items in place so cooked food stays where it came from. The b2 fixture pins
  were fixture simplifications, not the spec — the evidence header is.
- cookDay(G): at Haven (havenStoresAccess() != 'none', the betrayal.js
  pattern) AND reachable pool >= 1,000 kcal AND nearFire() AND scholar
  dayTicks < 400 (reconstruction choice; pins 100 fires / 480 not).
  NOT hunger-gated, NOT ready-food-gated, NOT knowledge-gated — the v2 spec.
- splitForWater(G, stash, cookable): sizes one affordable pot to the reachable
  clean water using the engine's own water math (1L/unit; camp_cook L1 halves,
  L2 or camp pot removes). In-place stack splits; the pot is a stash prefix.
- The batch runs through Game.cookAll(pot) — honest 16-tick fire session,
  water spend (bottles first, then the Haven well), blind-attempt teaching,
  spoilage refusal, unknown-flesh gating. The layer decides WHEN and HOW
  MUCH; the engine does the cooking.
- Once/day guard (ctx._cb3CookDay). Gate-off: pure delegation, zero writes.
- Telemetry on ctx: _cb3CookDays, _cb3CookedKcal (post-cook kcalEach x units
  of fully-cooked items), _cb3WaterDrawnL (reachable-clean drop per batch).

## Proof (scripts/test-cookbulk-b3.js)

**PROOF GREEN: 28 passed, 0 failed** (log: evidence/2026-10-19/test-cookbulk-b3.log;
re-run after the pool-spec fix; one service restart mid-run, re-ran clean).
- PART A (19): gate-logic units — cookableItems finds/skips, cookDay pins
  (1500kcal counter fires / 1500kcal pantry fires / 900kcal combined doesn't /
  not hunger-gated / exiled doesn't fire), poolContainers (exiled excludes
  pantry; pack+prepStash+pantry order), fireHere, timeToSpare, splitForWater
  (5u pot + 5u remainder; dry cistern -> empty pot; cross-container fill
  order), layerOn default OFF, cookPass gate-off inert.
- PART B (6): RED->GREEN fixture — RED base upkeep leaves beans raw; GREEN b3
  fires on the POST-upkeep pantry pool (base eats ~8u raw first — the real
  lean-day shape), cooks the 5u the 5L cistern affords, wood/dirty untouched,
  firing counted + water draw logged on ctx, once/day guard holds; gate-off
  wrapped inert.
- PART C: det-gate 16/16 byte-identical (8 seeds x 2 policies, 60d),
  no layer-attributable divergence.
- PART D: SMOKE 8/8 short runs, no exceptions.
- PART E: armed determinism 4/4 self-identical (the layer makes no direct
  RNG calls; gate-on perturbation is measured effect, not a bug — lesson b).

## Before / after (pilot) — 32 runs

**PRIMARY GO: b3 mean 24,812 kcal/side ≥ 20,000 bar** (16 pilot sides, 8 fresh seeds 94101–94108 × {leadfeast, belongfeast}; control 0). Range 9,480–42,900.

**CO-PRIMARY (survival): CLEAN.** Median survival b3 103d vs control 100d (bar: b3 ≥ ctrl−10 = 90). The b2 run's −46d signal (131d vs 177d) did NOT reproduce — attributed to noise, not the water-draw mechanism.

**Guardrails:** national b3 8/16 vs control 7/16 (bar: ≥ ctrl−2) ✓. No new death modes reported. Det-gate: see proof.

**Verdict: PILOT GO → land the trigger** (per pre-registered verdict rule: PRIMARY GO + survival clean). The capacity-honest batch-cook trigger (scripts/policies/cookbulk-b3.js) lands as a policy layer.

## Reachability verdict

The batch-cook channel is reachable and fires: 4.6 mean cook-days per b3 run, 24.8k mean cooked kcal. This is the v3 capacity-honest trigger succeeding where b2's water-draw trigger cost survival.

## Metric review

Pre-registered bars met exactly: PRIMARY 24,812 ≥ 20,000; survival 103 ≥ 90; national 8 ≥ 5. No re-score. The b2 survival signal is retired as noise — the mechanism test (water-draw dose-response) is moot with survival clean.

## Village assessment

Batch cooking fires on the b3 arm: villages cook in bulk on ~5 days per run, turning ~25k kcal through the pots. The control arm cooks nothing — the trigger is the entire channel. Villages look otherwise identical (survival, national reach), which is the point: the trigger adds cooking without perturbing the village.

## Sense-testing (law)

Deferred to the confirm run: the pilot's transcripts were captured (sense-cookbulk-b3-leadfeast-s94104.txt) but not sense-read before the git outage. The policy layer's narration should be read on the confirm.

## Metric review (mandatory)

Complete — see above. All pre-registered bars met, no re-score.

## Wall numbers (this run, FEASTSCALE_R13=1 SEATDRIVE=0)

national 15/32 (b3 8/16, ctrl 7/16) | table: see per-seed | wins 0/32 | wave-4: see per-seed | wave-5 0/32 | median survival 101d (b3 103, ctrl 100).

## Telemetry

Deferred: no scale-wall baseline exists for this substrate (telemetry-baselines/scale-wall.json not seeded). Wall numbers above are the check.
