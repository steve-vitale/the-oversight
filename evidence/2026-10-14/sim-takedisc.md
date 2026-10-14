# TAKE DISCIPLINE — KILLED AT PILOT (scale-onramp r29 ARM 2, 2026-10-14)

Axis: scale-onramp, food-distribution lens. The policy half of the r28
scholarreserve blank (#153): takeFromPantry writes cumulative v.takes with
-2 trust per take at net<-5000; competentEat compensates for half-rations
with MORE takes -> more -2 hits -> trust pinned at 0. Sibling ARM 1
(ledgerunload) fixes the ledger's blind side (unload gives, #154, game-code);
THIS arm was the policy half: TAKE DISCIPLINE.

**VERDICT: KILLED AT PILOT per §14.** Primary missed on both policies;
leadcourt starvation guardrail breached. The layer did the OPPOSITE of its
intent (see Mechanism). Layer deleted per kill protocol; scripts + evidence
retained.

## Pre-registered header (docs/MEASUREMENT.md §§9-12, 14)

- **Road**: 8 seeds (11/22/33/44/55/66/77/88) x belongseek/leadcourt,
  180d death-aware, identical seeds control vs armed. Control: TAKEDISC
  unset (wrapped policy, gate-off pure delegation). Armed: TAKEDISC=1.
- **Det-gate**: 32/32 identical (8 seeds x 2 policies x 2 sides, 60d) —
  passed before the pilot. The wrapper does not break the harness clock.
- **PRIMARY**: cumulative takes (v.takes scholar, instrumented sum of take-
  verb deltas) reduced >= 30% vs control (armed/control <= 0.70 per policy).
- **GUARDRAILS**: median survival >= control-10d; national >= control-2;
  starvation deaths <= control (no starvation trade); exiled unchanged.
- **SECONDARY (mechanism)**: take events/day, -2 stings/day, trust
  trajectory, half-ration days, hungry days.
- **GO on primary + all guardrails, else KILL per §14.**

## The layer (DELETED — scripts/policies/takedisc.js, TAKEDISC=1)

1. BATCH: the scholar's pantry need in bar-safe takeFromPantryBulk packs
   (bulk path: -2 trust ONCE per pack, not per unit).
2. THEFT-BAR AWARE: every pack strictly below min(4000, pantryKcal/2).
3. FORAGE-FIRST: the pack's honest food counted before any draw; no take
   attempted when the pack covered the need.
4. NEVER STARVE: batched the full shortfall; base competentEat as fallback.

Proof (pre-kill): scripts/test-takedisc-20261014.js — 28/28 assertions
RED->GREEN (20/13 undisciplined single takes -> 0 singles + bar-safe bulk,
gate-off 20 day-hashes byte-identical, forage-first no-take). The layer
worked as designed; the design was wrong.

## Baseline census (pre-check)

scripts/takedisc-census-20261014.js, belongseek/leadcourt, 40d:
- take events: 16-23 single-unit takes/day, 0 bulk. Base does NOT batch.
- Successful takes: ~4% (96% weight-fail vs a full forager's pack).
  Pantry kcal: 119-294/day. Meals: 830-1800/day (trust-driven).
- v.takes scholar: ~960-1250/day = meals (85-90%) + pantry (10-15%).
- Trust: 15 -> 0 by ~d15 via ~7 successful takes (-2 each).

## Pilot results (32 runs, 180d death-aware, identical seeds)

| | belongseek armed/control | leadcourt armed/control | GO |
|---|---|---|---|
| PRIMARY takes ratio | **1.53** (need <=0.70) | **1.35** (need <=0.70) | MISS both |
| takes/day ratio (per-seed) | 0.42–4.21 (wild) | 0.33–1.61 (wild) | — |
| single takes/day | 9.3 vs 7.3 | 10.5 vs 11.2 | — |
| bulk packs/day | 2.09 vs 0 | 2.37 vs 0 | — |
| -2 stings/day | 0.044 vs 0.084 | 0.061 vs 0.129 | worked |
| half-ration days | 203 vs 286 | 271 vs 271 | mixed |
| hungry days | 57 vs 43 | 54 vs 41 | worse |
| median survival | 176d vs 129d | 138d vs 100d | held |
| national | 5 vs 5 | 6 vs 3 | held |
| starvation deaths | 4 vs 10 | **9 vs 3** | **BREACH (leadcourt)** |
| scholar deaths (all) | 57 vs 48 | 64 vs 47 | worse |
| exiled | 0 vs 0 | 0 vs 0 | held |

**PRIMARY MISSES on both policies (1.53, 1.35 — the layer INCREASED takes
53% and 35%). GUARDRAIL BREACHED on leadcourt (starvation 9 vs 3). KILL.**

## The mechanism (why it backfired)

**Proactive pantry takes crowd out foraging.** The pre-take filled the
scholar's pack with pantry food at dawn. A full pack cannot receive foraged
food (weight cap) — the scholar foraged but couldn't carry it. The pack
emptied (eaten), the pre-take refilled it from the pantry, repeat. The
scholar NEVER built a foraged pack and became pantry-dependent:

- Takes/day up to 4.2× on some seeds (s11/s44/s66 belongseek): the pantry
  replaced foraging instead of supplementing it.
- Hungry days UP despite more takes: pantry-dependent scholars are fragile
  — when the pantry thins or they're away, the pack is empty (no foraging
  habit) and they hunger/starve.
- Leadcourt starvation 9 vs 3: the dependency kills when the pantry can't
  cover it. The baseline scholar forages (pack has food) and survives.

The batching itself worked (stings/day halved: 0.044 vs 0.084). But the
-2 hits were never the binding constraint — the ~7 successful takes that
crater trust are NECESSARY takes (pack truly empty). Batching necessary
takes doesn't reduce their count; proactive batching just creates MORE
necessary takes by suppressing foraging.

**The baseline was already optimal for minimizing pantry takes.**
competentEat eats pack first and takes only when the pack is empty. The
"undisciplined" 20 events/day are 96% harmless weight-fails. There was
nothing to fix at the take level — the blank was a measurement artifact
(mistaking failed take attempts for a discipline problem).

## Sense-test (SENSE-TESTING LAW)

Read 2 armed transcripts (belongseek s11, leadcourt s33, 15d). The
discipline READ as disciplined: "Packed: 5 Dried beans. (750 kcal, 2.5 kg)"
then "You eat Dried beans (750 kcal)" — one pack, then eating, vs
baseline's 20× "Took X." The meals read honestly ("Half ration — they
don't trust you yet."). One robotic flag caught and fixed pre-pilot: the
pre-take spammed "The pantry is in the hall. Your hands are not." ×3 while
ranging (fixed: skip silently when havenStoresAccess==='none'). The scholar
ate like a person packing a day's food — the fiction was fine; the
economics were not.

## Village assessment

The pilot villages: belongseek reached national 5/8 both sides, leadcourt
6/8 armed vs 3/8 control. Wave reach 1-4. The scale wall stands (no table,
no wins on this road in 16 runs). The armed scholars lived longer
(medSurv +47d/+38d) but died more overall (more successions from
starvation/fragility) and took far more from the pantry. The villages that
lost scholars to starvation did so with food in the pantry — a
distribution failure, not a scarcity failure.

## Reachability verdict

Waves 1-4 reachable; national reachable (5-6/8); table/wins 0/16. The
take-discipline layer does not move the scale needle (and moves takes the
wrong way). Scale-onramp remains blocked.

## Blanks filled / documented

- **r29 ARM 2 blank (take-discipline policy seed, #156) — ANSWERED, KILLED.**
  Batching pantry takes does not reduce takes; proactive batching increases
  them 35-53% by crowding out foraging. The -2 sting rate halves, but stings
  were never the binding constraint.
- **New blank (policy design): PANTRY-PACK CROWDING** — any policy that
  proactively fills the scholar's pack from the pantry suppresses foraging
  (weight cap) and creates pantry dependency. Future food-policy arms must
  NEVER pre-fill the pack; takes must stay reactive (pack-empty only).
  → sim-findings.
- **#153 (vicious cycle) stands**: the trust crater is real, but the policy
  half cannot fix it — the -2 hits come from necessary takes. The fix must
  be ledger-side (ARM 1's unload-gives) or the take-penalty routing (#155).

## Metric review (§14, mandatory)

- Primary (takes <= 0.70): MISSED (1.53, 1.35). NO-GO per §14. Not
  re-scored; the layer is killed.
- **Structural finding**: v.takes = need - pack food is CONSERVED under any
  eating-discipline policy. Pantry takes are only ~10-15% of v.takes; the
  meal (85-90%) is policy-immutable. A -30% takes lever is structurally
  unreachable via take discipline — and this pilot shows even the direction
  is wrong (proactive takes increase takes). Future take-related primaries
  must be per-day rates or event counts, not cumulative kcal.
- **Metric confound**: cumulative takes punishes survival — armed runs lived
  38-47 days longer (good) but accumulated more takes over more days. Any
  cumulative metric must be day-normalized.
- Guardrail breach (leadcourt starvation 9 vs 3): the layer trades
  trust-hits for starvation deaths — the exact trade the brief forbade.
  Killed on this alone.
- Convergence report: arm killed at pilot. Mechanism (batching) proven but
  harmful; blank answered negatively. Axis scale-onramp: still blocked.
