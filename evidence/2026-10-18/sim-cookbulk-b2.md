# sim-cookbulk-b2 — batch-cook CAPACITY lever (loop B, run fleshout-loop-b-20261018T0834Z, axis food-economy)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE sims)

- PRIMARY: mean cooked kcal per b2 side >= 25,000 with control 0 (the
  capacity-honest bar from the sim-cookbulk-b metric review — ~v2's engaged
  level; the lever should reach past it, not redefine it down).
- GO threshold: b2 mean >= 25k across the 8 pilot sides (4 fresh seeds x
  {leadfeast,belongfeast}), guardrails met. A miss is NO-GO, never re-scored
  mid-run. KILL FAST if the capacity mechanism cannot engage.
- GUARDRAILS (standard): armed starvation <= control (paired); median survival
  paired delta within +/-10d; no new death mode (dedup on (who,day,cause),
  filter kind to person/villager — the death tele re-emits and 'monster'
  kills pollute counts); national >= control-2; no laundering (kcal gains
  must be honest, not accounting artifacts); det-gate byte-identical gate-off.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 9292–9295 (fresh; verified unused — 9290 zero matches, 9291/9297
  used by sibling runs, avoided).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep paired control, identical seeds.
- ARMS: control (layer OFF, pins 0) | v2base (v2 trigger reconstruction,
  {hearthFirst:false, boilRisky:false} — diagnostic isolating the capacity
  lever) | b2 (v2 trigger + capacity lever {hearthFirst:true, boilRisky:true}).
- PROOF FIRST: scripts/test-cookbulk-b2.js — Part A+B GREEN 25/25 (RED
  assertion fixed post-run), Part C det-gate 16/16 byte-identical, Part D
  SMOKE 12/12. Full log: evidence/2026-10-18/test-cookbulk-b2.log.
- §15: per-seed panel-schema JSONs; scripts/build-cookbulk-b2-panels.js;
  two compares (control->b2 primary, v2base->b2 lever-isolation); compare .md
  attached. The panel is the instrument, the pre-registered threshold is the judge.
- BASE: 3569e323b (2026-10-18).

## Context

sim-cookbulk-b (v2) engaged 16/16 runs at mean 23,570 cooked kcal/side
(control 0) but was KILLED on the 50k bar — "fire-time capacity caps it."
A capacity probe (4 seeds x 2 policies, 60d, /tmp/probe-capacity.js) pinned
the ACTUAL binding constraint: the batch is WATER-capped, not fire-time-
capped. Per cookDay the pantry pool is 13–25k kcal but reachable clean water
is 7–41L (the cistern's morning surplus after the villagers' ~24L/day
drinking); the batch drains it to ~0 and leaves ~50% of the pool raw.

## The lever (b2) — "water for the pots"

`scripts/policies/cookbulk-b2.js` (COOKBULK_B2=1, default OFF), `withCookBulkB2`
wrapper. The v2 trigger reconstructed faithfully (any Haven day, pool >=
1000 kcal; NOT hunger-gated, NOT ready-food-gated, NOT knowledge-gated —
the engine teaches 'cook' on the first blind attempt at 85%, food.js
learnTechnique('cook','trial')). On a cookDay, BEFORE the scholar's batch:

1. HEARTH-FIRST: `Game.hearthBoil()` — the village hearth boils the cistern's
   morning dirty water into clean at the honest 6L/wood (engine verb,
   engine-voiced, honest wood cost). Logged on ctx as `_cbHearthBoiledL`.
2. BOIL-THE-RISKY: if the scholar carried risky-water bottles home,
   `Game.boilWater()` (honest 32 ticks + fire fuel) makes them clean for the
   pots. Logged as `_cbBoilRiskyL`.

Then the v2 batch (one-pot splitForWater, honest 16-tick fire sessions via
the engine's cookAll, spoiled refused, monster flesh gated). Zero src/js.

## Proof (scripts/test-cookbulk-b2.js)

- PART A (17/17): cookDay pins (1500 fires / 600 doesn't / not hunger-gated),
  splitForWater, hearthFirst (20L at 4 wood, no-op when clean), boilRisky,
  gate-off inert.
- PART B (RED->GREEN fixture, live engine): RED — base upkeep leaves beans
  raw and dirty unboiled. GREEN b2 — hearth boils 20L (wood 50->46), full
  10u stack cooks (the 5L cistern alone afforded only 5u). V2BASE — same
  fixture, sub-levers OFF: only 5u cooks, wood/dirty untouched (isolates the
  lever's contribution IN THE FIXTURE). Gate-off inert.
- PART C (det-gate): 16/16 byte-identical gate-off.
- PART D (SMOKE): 12/12 no exceptions.

## Before / after (pilot) — 24 runs

4 seeds x {leadfeast,belongfeast} x {control,v2base,b2}, 180d death-aware,
paired on identical seeds. Per-seed JSONs:
evidence/2026-10-18/perseed-cookbulk-b2/ (24 files).

PRIMARY (binding): mean cooked kcal per b2 side.

| metric | b2 (8 sides) | v2base (8 sides) | control (8 sides) | bar | verdict |
|---|---|---|---|---|---|
| mean cookedKcal/side | **28,997** | 28,997 | 0 | ≥ 25,000 | primary MET |
| per-side cookedKcal | 8,285–45,440 | 8,285–45,440 | 0 | — | — |
| b2−v2base paired delta | **0 on all 8 pairs** | — | — | — | **lever INERT** |
| hearthBoiledL (b2) | 0L on 8/8 sides | — | — | — | no headroom |
| boilRiskyL (b2) | 0L on 8/8 sides | — | — | — | no headroom |

The capacity lever contributed EXACTLY ZERO on all 8 pilot sides. Both
sub-levers found no headroom:
- Morning dirty water = 0L on every cookDay (the engine's nightly hearthBoil
  already converts it all; village wood 116–174, never the constraint).
- Scholar's risky bottles = 0L (the base policies don't haul risky water
  home for the crew).

Guardrails (b2 vs paired control):
- starvation deaths: b2 0 vs control 1 (b2 <= control ✓)
- median survival: b2 131d vs control 177d (**-46d — VIOLATES the +/-10d
  guardrail**; paired deltas -1,-57,0,-51,-79,+25,-55,-23)
- national: b2 6/8 vs control 8/8 (≥ control−2 ✓, barely)
- no new death mode: b2/v2base deaths are combat/monster/ambush/contest
  (same as control; singletons lockjaw/"the night" noted, no thirst deaths)
- det-gate: 16/16 byte-identical gate-off ✓
- §15 panel: compares attached (cookbulk-b2-panel-primary.md,
  cookbulk-b2-panel-lever.md); both decision review_required. The
  v2base->b2 lever-isolation compare is degenerate (identical inputs).

## Reachability verdict

REACHABLE (by the trigger, not the lever). The v2 trigger (reconstructed)
batch-cooks on 2–6 cookDays per 60d whenever the scholar is home at Haven
with a ≥1,000 kcal pool, converting 8–45k kcal/side. The capacity lever adds
nothing — there is no policy-side water headroom on this substrate.

## Village assessment

The b2/v2base villages cook their pantry bulk when the scholar is home:
28,997 kcal/side mean of beans/rice rendered safe through the engine's
honest cookAll. But they die younger than controls (131d vs 177d median) —
the batch's water draw has consequences (see sense test). The scholar is the
village's cook by doing; the village does not cook on its own (its 'cook'
camp task works the smoke racks, not the pots — game.js:6544).

What the villages lack is water, not fire-time: the cistern's morning
surplus (7–41L) caps every batch, and the villagers' ~24L/day drinking
competes for the same cistern. The capacity probe's "taught helpers,
parallel fires" shape cannot help — helpers share the same cistern.

## Sense-testing (law)

Transcript kept: evidence/2026-10-18/sense-cookbulk-b2-s9292-belongfeast.txt
(1,771 cooking beats, 60d). Day 1 reads as villagers feeding each other —
with friction:
- "Not enough clean water to cook Rice. Need 65L — haul water first."
- "Cooked 1 item (-27L water, incl. 25L haven well)."
- "★ Learned: cooking. Messy, but it worked. Next time will be cleaner."
- "The cistern is dry. Haul from a creek (risky water), or put someone on water duty."
- Eight villagers head out: "The well won't fill itself." (named individuals,
  distinct voices)
- "The cistern won't cover today — the hall's call, no vote needed: half
  rations until the water runs come back."

The batch DRAINS the cistern and the village MOBILIZES: water hauls, half
rations, the hall's call. This is not a spreadsheet funnel — it's a village
absorbing the scholar's cooking into its water politics. But it also shows
why the capacity lever is dangerous: more batch water DIRECTLY trades
against the villagers' drinking. The tight water economy is the binding
constraint, and it's already binding.

Flag: "A man, maybe 30s, with grey-streaked hair is at the cookpot, tasting
off the spoon, frowning, adding a pinch of something." — villagers DO tend
pots in the fiction, but the engine has no villager batch-cook verb (the
'specialist' path is per-item askSpecialist requiring the scholar present).

## Metric review (mandatory)

The 25k bar was met by the b2 POLICY (28,997), but the CAPACITY LEVER (the
arm's novel contribution) scored exactly 0 on all 8 pairs — the policy's
throughput comes entirely from the reconstructed v2 trigger. Per §14 the
guardrails bind: the -46d median survival delta violates the +/-10d
guardrail. This is NO-GO, not re-scored.

For the NEXT run: the honest capacity shapes are (a) a minimal src/js
**crew batch-cook verb** (villagers batch-cook the pantry when the scholar
is away — temporal coverage, 3–10x more cookDays; the water is shared but
the days are new), which needs coordinator approval before any src/js, or
(b) accept the v2 trigger as the capacity-honest mechanism at ~25–30k/side
(the metric review's option (a)). The water economy cannot be stretched
policy-side — the sense test shows the batch already drinks the village's
water.

## VERDICT

**KILLED-AT-PILOT.** The capacity lever (hearth-first + boil-risky) is inert:
0L from both sub-levers on 8/8 pilot sides, b2−v2base delta exactly 0 on
all pairs. The -46d median survival delta additionally violates the
pre-registered guardrail. Kill protocol: policy script
(scripts/policies/cookbulk-b2.js) deleted zero-trace; instruments (test,
sweep, panel builders) + evidence landed.

## Telemetry

`telemetry-check.js` vs scale-wall.json (winseat regime baseline):
- LOUD: national swung 67%: baseline 12 -> current 20 (n=24) — current HIGHER,
  not a regression (FEASTSCALE_R13=1, SEATDRIVE=0 substrate reaches national
  well).
- LOUD: wins disappeared: baseline 16 -> current 0 — REGIME ARTIFACT. The
  baseline is labeled "winseat — full win-side win stack" with SEATDRIVE=1;
  this substrate (FEASTSCALE_R13=1, SEATDRIVE=0, pre-seat) has structurally
  ~0 wins. The baseline file itself warns not to compare these substrates.
  Not a regression.

## Wall numbers (this run, FEASTSCALE_R13=1 SEATDRIVE=0, 24 runs)

national 20/24 | table 0/24 | wins 0/24 | wave4 14/24 | wave5 0/24 |
median survival 131d (b2/v2base) / 177d (control) | max survival 183d.
(V2base and b2 identical; control shown separately. No exiled.)
