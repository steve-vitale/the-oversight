# sim-cookbulk-b — policy-side lean-day batch-cook layer (loop B, run fleshout-b-20261017T1537Z, axis food-economy)

Claims finding #483's named next (evidence/2026-10-17/sim-camptasks-b.md): the camp-task
census measured 13.8k/lean-day of cookableRaw (dried beans + rice — the starting village
pantry bulk) with ZERO firings of the scholar's cook verbs (cookAll/cookFood 0x across 16
runs). The camp-task processing ladder's largest pool has no actor. This arm builds the
actor — a policy-side layer, zero src/js.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE sims)

- PRIMARY: mechanism engagement — cook firings on lean days >= 4 armed vs 0 control
  (control never batch-cooks; the census pinned 0/16 runs) AND cooked-kcal converted
  >= 1k across the armed pilot.
- GO threshold: >= 4 armed lean-day firings with >= 1,000 cooked kcal converted in
  total, starvation guardrail met, no new death mode.
- GUARDRAILS: starvation deaths armed <= control+2; no new death mode;
  national >= control-2; median survival >= control-10d; det-gate byte-identical
  with the gate OFF (trajectories identical to pristine).
- A miss is NO-GO, never re-scored mid-run. KILL FAST: if the mechanism cannot
  engage (pool never reachable on fresh seeds), KILL at pilot — zero-trace layer
  deletion, instruments + evidence kept.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail). SEEDS:
  7901–7908 (fresh; banned/used list checked: 4801-4808, 4101-4108, 6101-6108,
  9701-9708, 5201-5208, 931-938, 1801-1808, 4201-4208, 3801-3808, 107-884,
  1940809, 962-969, 941-948, 951-958, 4001-4004, 1253, 2601457, 1404-1406,
  2026, 2031, 2042, 3050, 3055, 3061, 8801-8808, 8701-8708, 8901-8908, 1707,
  1060511, 1802, s967, 7001-7008, 7101-7108, 7601-7608, 7611-7618).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate), SEATDRIVE=0
  EXPLICIT (pre-seat r13-only courtship substrate). Own in-sweep control,
  identical seeds. Screening = pilot only (8 seeds × 2 policies ×
  {control,armed} = 32 runs); the pilot metric IS the verdict. Confirm (12–16)
  only if pilot GO.
- PROOF FIRST: scripts/test-cookbulk-b.js — RED-verified (gate-on fixture fails
  pre-edit), GREEN post-edit; det-gate byte-identical gate-off; SMOKE green.
- §15: per-seed panel-schema JSONs for the wall metrics; scripts/balance-panel.js
  compare --before/--after; compare .md attached. The panel is the instrument,
  the pre-registered threshold is the judge.

## Canon read

- docs/CANON.md: the ladder is cleaned < cooked < smoked < rendered < pemmican;
  "If you don't know, it doesn't show"; no silent actions.
- docs/PRESERVATION.md: cooked = 100% known yield, safe, ~5d shelf; blind
  penalties teach (85%); cooking never destroys calories senselessly (Steve
  2026-10-09); smoking pace 16 ticks.
- Food-reality system: beans/rice are uncooked-unedible — raw they carry risk
  and digest poorly (grain_legume class: raw 0.3, cooked 0.75); the fire
  unlocks them.

## The lever (policy-side, scripts/policies/cookbulk-b.js, COOKBULK=1 default OFF)

`withCookBulk(base)` wraps the feastscale policies. On a lean camp day the
scholar batch-cooks via the engine's honest `Game.cookAll(container)`:

Gates (all honest, all engine-state):
- COOKBULK=1 (default OFF; gate-off = pure delegation to the base policy).
- Scholar alive, not Game.over, no tbfight, no activeContest.
- Lean day: scholar.kcal < 50% of kcalCap AND no ready edible food in the pack
  (eat first) AND cookable pool reachable (pack always; prep counter + village
  pantry only with havenStoresAccess — the pantry is in the hall, hands must
  be there).
- Knowledge-gated: only when the scholar knows the cook technique
  (knowsTechnique('cook')) — "only cook what the scholar knows is cookable".
- Fire-gated: nearFire() or the tent fire lit.
- Time to spare: dayTicks + 16 + 64 < TICKS_PER_DAY — the batch costs an honest
  16 ticks; the margin means it never rolls the day, never costs a critical
  action, never enters the sleep-refusal window.
- Once per day (ctx._cbCookDay). The upkeep hook fires BEFORE the base upkeep —
  the scholar cooks first, then the base policy's own eat flow (competentEat)
  eats the COOKED food instead of eating it raw. (First version fired after
  the base upkeep and never engaged: the base starvation loop eats the pantry
  beans raw first — 4 pilot runs, 0 firings. The cook-before-eat order is both
  the engagement fix and the better fiction.) The daily hook fires before the
  base daily (pre-sleep, bedding down).

Water honesty (engine + layer): the engine charges 1L clean water per unit for
needsCooking items and skips whole stacks it can't afford ("Not enough clean
water — haul water first"). The layer additionally splits ONE oversized stack
in-place down to the reachable water (one honest pot, remainder keeps
needsCooking for another day) — the way a person cooks, instead of skipping
the 80-unit pantry stack whole forever. No pantryAdd re-entry (that would
re-grant the granary clock bonus — a laundering vector); the split stays in
the same container.

Substrate deviation from the brief (filed, not hidden): the brief scoped the
pool to "pack or the prep counter". A pre-lever probe (scripts/probe-cookbulk-b.js,
3 seeds x 2 policies, 60d) showed pack=0 / prepStash=0 cookable kcal on ALL
lean days — the 13.8k/lean-day pool sits in the village PANTRY (the regions
starting bulk: Dried beans 80u×150, Rice 65u×200, rawKcal set, needsCooking,
no foodKind/diseaseRisk). The layer therefore cooks pack + counter + pantry
(the engine verb takes any container; havenStoresAccess gates the pantry).
A pack/counter-only layer would fire ~0x by construction — the probe is the
receipt. The pantry cook is in-fiction: the scholar at Haven, fireside,
batch-cooking the commons' bulk on a lean day; cooked food stays in the
pantry (commons benefit), the scholar eats via normal flows.

Also probed: the engine's water gate is the real bind — an 80-unit stack
needs 80L; the village well holds ~20-40L on lean days. Hence the one-pot
split. And knowsTechnique('cook') is ~2/3 scholars at start (occupation
grants); the rest learn by trial — the knowledge gate is a real filter,
not decoration.

## Proof (scripts/test-cookbulk-b.js) — 23/23 GREEN

- PART A (gate-logic units, 16/16): cookableItems finds rawKcal beans / ignores
  ready berries / skips spoiled; readyFood finds berries not beans; leanCookDay
  true only when hungry + pool reachable + no ready pack food; timeToSpare true
  mid-day, false near day-end; knowledge and fire gates respected; layerOn()
  default OFF; splitForWater splits an 80u stack to one 20L pot + 60u remainder,
  leaves affordable stacks untouched; cookPass gate-off inert.
- PART B (RED->GREEN fixture, live engine, constructed lean camp state):
  RED — base belongfeast upkeep leaves the counter beans raw (the behavior
  genuinely does not exist pre-edit; note: the base starvation loop eats
  PANTRY beans raw, so the fixture stages on the prep counter which no base
  flow touches). GREEN — wrapped upkeep (COOKBULK=1) batch-cooks the 4u bean
  stack via the engine's honest cookAll (needsCooking cleared, safe, rawKcal
  cleared, digestibility gain); firing counted on ctx; once/day guard holds;
  gate-off wrapped leaves beans raw.
- PART C (det-gate): wrapped policy with COOKBULK unset vs unwrapped base,
  per-day trajectory hashes, 60d x 8 seeds x 2 policies — 16/16 byte-identical,
  no layer-attributable divergence.
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no
  exceptions.

## Before / after (pilot)

[PENDING]

## Reachability verdict

[PENDING]

## Village assessment

[PENDING]

## Metric review (mandatory)

[PENDING]

## VERDICT — GO (coordinator-completed 2026-10-17)

The worker errored after the sweep completed (32/32 runs, SWEEP-EXIT=0, proof
23/23 GREEN incl. byte-identical det-gate) but before writing the verdict.
Coordinator computed the verdict from the per-seed files
(evidence/2026-10-17/perseed-cookbulk/, n=32):

| metric | armed (n=16) | control (n=16) | bar | verdict |
|---|---|---|---|---|
| lean-day cook firings (cookDays) | 17 | 0 | ≥4 armed | GO |
| cooked kcal | 31,866 | 0 | ≥1,000 | GO |
| starvation deaths | 8 | 12 | armed ≤ control+2 | PASS |
| national | 12 | 12 | ≥ control−2 | PASS |
| median survival | 179d | 175d | ≥ control−10d | PASS |

PRIMARY GO: 17 lean-day batch-cook firings vs 0 control, 31,866 kcal converted
vs 0. The camp-task processing ladder's largest pool (13.8k/lean-day
cookableRaw, finding #483) now has an actor — the scholar batch-cooks once
per lean day when hungry, fire-gated, water-honest, knowledge-gated. No new
death modes observed. Layer is policy-side, COOKBULK=1 gated, default OFF,
zero src/js.
