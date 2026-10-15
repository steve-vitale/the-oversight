# Living Garden: actual meal demand — 2026-10-15

The next Garden prerequisite is now measured at the real NPC meal settlement.
This closes the gap between nominal daily diets and actual communal demand.
It does not implement the seven-day ascension deed.

## Runtime and observation

`villagerMealDay` returns detached `demand` data alongside its existing result:
need, produced, ownEat, communalWant, requested, away and the effective
nominalKcal basis. All values come from the actual settlement. Health, hearth
and the ration wrapper are already applied. The wrapper restores the person
record afterward. Request is zero during voluntary fasting or when the gap is
at most 50 kcal. No food rule, production, hunger, draw, price, reward or gate
changed. No new game state or telemetry is written.

The Garden observer copies the result after each actual meal call, retains
its return value and records exact recipient/day. Missing or duplicate meals
are unknown. The report excludes the bearer from this NPC denominator and
keeps the previous all-resident source coverage separate. It compares both
full computed NPC needs and positive post-production requests. A village with
no requests cannot succeed by vacuous truth.

This is not a complete household energy model: bearer activity/food bank,
continuous membership, presence outside sampled boundaries and physiological
nutrition beyond the engine's ate value remain separate. Unmet is need minus
ate, including spoiled food that the existing settlement counts; it is not
an independent diet-quality assessment. Source credit uses real nourishment.

## Natural seeded screen

Same standard driver, 16 seeds per named policy, 150-day ceiling, Columbus
origin/default region and captured flags. Stable known multi-person days only:

| Policy | Exact-demand days | NPC meals | Need self-supplied | Meals with no request | Every NPC requests: days | One harvest source covers NPC needs: days | One source covers all positive requests: days |
|---|---:|---:|---:|---:|---:|---:|---:|
| capable | 1360 | 11444 | 92.74% | 71.59% | 12 | 0 | 0 |
| maker | 1766 | 14511 | 95.25% | 79.47% | 22 | 0 | 1 |
| merchant | 1758 | 14906 | 94.97% | 78.93% | 10 | 0 | 0 |
| caregiver | 1634 | 14664 | 95.14% | 79.69% | 3 | 0 | 0 |
| garden-feeder | 1673 | 14916 | 95.00% | 79.44% | 8 | 0 | 0 |

Across all five policies there are 8,191 eligible village-days and 70,441
NPC meals, with zero unknown demand on those eligible days. Residents' personal
work covers about 93–95% of computed need; the pantry supplies the remaining
shortfall. This is a different denominator from earlier useful-intake route
shares. Counts do not establish balance or impossibility.

The single maker request-coverage day is seed 9, day 138: two residents,
including the bearer, but only one NPC (yara_haddad). That NPC needs 1,330 kcal,
self-supplies 1,014.8215 and eats their own harvest for the remaining 315.1785.
The bearer is not covered by this NPC view. This is **not** proof of feeding
other people or the whole village. The complete example is retained in
garden-demand-request-examples.json. Keep producer, eater and bearer roles
explicit before using any diagnostic as a deed gate.

## Proof and unchanged gameplay

- Frozen baseline: 02f07158adc695f16d411892ee86be93f9207164. Same runtime test
  on the old meal return: 2 pass / 12 fail; current actual runtime: 14/14.
- Prepared tests exercise healthy/injured, hearth, away, rationed, empty-store,
  self-sufficient and chosen-fast meals, real intake conservation, detached
  observation and duplicate ambiguity. The observer/report suite is 24/24.
- Matched before/after 16 x five balanced screen: **all 80 standard rows,
  full gameplay hashes and all 23 metric vectors are exactly identical**.
  The current neutral win contract reports no_material_signal for every policy.
- Ten balanced on/off pairs (five per root): exact standard rows and hashes,
  no warnings/errors, stable sources. Twenty full control jobs are retained.
- All 80 deed-observed cases match those balanced rows and gameplay hashes.
  Five independent deed observer-off controls match their observed counterparts.
  No warnings or observer errors; both separate cohorts had identical complete
  source manifests before merging. Source manifests include actual observer code.
- Quick **158/158**, full **930/930**. Raw logs are retained. No assertions
  were weakened or quarantined. No new UI behavior was introduced; the earlier
  real mobile gift/feast proofs remain their own evidence, not a new claim here.

These screens prove identity in the measured campaigns, not universal equality
or an estimate of a small balance effect. A future gameplay lever still needs
matched screens, at least 64 seeds for small effects and independent holdouts.

## Decision and next work

Retain the diagnostic. Do not suppress NPC production, injure people, pool
harvesters or erase unfed residents to make an achievement appear. No survival
or reward lever was tuned, and no target win rate was used. Record costs and
tradeoffs in SURVIVAL-LEVERS.md when a real lever changes.

Garden remains open pending a coherent feeding-day interpretation and complete
person/household settlement. The existing question is updated with this evidence;
it does not block other fitting deeds, parity or scale work. The legacy ten-day
class proxy remains for nine gods, rather than silently replacing it with this
NPC-only request statistic. Exact membership and bearer accounting are not
claimed complete. Preserve player/villager parity in the eventual authored gate.

## Reproduce

Use the retained source bundle and frozen base, the same policy/harness content,
Node version, flags and seed list from the panels. Commands used:

```text
node scripts/godpath/test-village-meal-demand.js
node scripts/godpath/test-garden-coverage-observer.js
node scripts/balance-panel.js --root <baseline> --n 16 --policies capable,maker,merchant,caregiver,garden-feeder --out <before> --par 4
node scripts/balance-panel.js --root <candidate> --n 16 --policies capable,maker,merchant,caregiver,garden-feeder --out <after> --par 4
node scripts/balance-panel.js compare --before <before>/panel.json.gz --after <after>/panel.json.gz --out <comparison>
node scripts/godpath/deed-screen.js --n 16 --policies capable,maker,merchant,caregiver --out <defaults.json> --par 4
node scripts/godpath/deed-screen.js --n 16 --policies garden-feeder --out <feeder.json> --par 4
node scripts/godpath/deed-screen.js --seeds 7 --policies capable,maker,merchant,caregiver,garden-feeder --observe 0 --out <off.json> --par 3
node scripts/garden-coverage-report.js <merged-deed-panel.json.gz> --out <report>
```

Cohort merge required identical full sources and seed lists and no overlapping
policy cases. The two on panels and five off controls were also checked against
the balanced results. Exact old/new source bytes, raw panels, full proof jobs,
report, example and validation hashes are retained beside this note. Both roots
start a new experiment from this current contract; old reports are not relabeled.
