# Living Garden: actual day coverage â€” 2026-10-15

This advances roadmap item 3, the fitting god deeds. It measures the missing
whole-village denominator before replacing Garden's class-days placeholder.
No gameplay, food cost, reward, ability, class offer or ascension gate changes.

## What is now observed

The shared-driver deed screen captures initial/pre-closure, actual meal and
post-closure rosters, plus detached per-eater physical/nourishment receipts.
It wraps the real endDay/villageEats calls without extra game-helper, RNG,
clock or telemetry calls. An unfed mouth cannot disappear from the recorded
required set merely because they died or left during settlement. Unknown
people/budgets, roster changes, lone survivors and incomplete days stay visible.

The report checks complete policy/seed cohorts and rejects observer errors or
sources with no observed intake. Each harvester must reach every required eater
individually; separate people's production never pools into one person's deed.
Feeding everyone and feeding everyone else are reported separately. Nominal
person kcalPerDay and fixed 300/1000-kcal contributions are diagnostic references,
not new game thresholds. Exact player activity needs and NPC health/hearth-adjusted
needs are not inferred from these references. Snapshot sampling can miss an
arrival followed by a departure between observations: a final deed still needs
runtime day/membership accounting.

## Measured result

The 16 standard seeds across capable/maker/merchant/caregiver produce 64
150-day campaigns. All 64 standard result rows and final gameplay hashes match
the retained post-feast balanced panel exactly; all normalized game, policy and
shared-harness source hashes match. Sources stay unchanged throughout the panel.
The four-policy seed-7 observer-on/off control also matches rows/hashes, with
zero warnings or observation errors; all eight full control jobs are retained.

There are **7,311 closed days**, including **6,518 stable, known multi-person
village days**. The raw data retain 759 days with roster changes and 34 stable
lone-survivor days; neither establishes this whole-village sensitivity measure.
No unknown resident budget occurs in this screen.

| Policy | Stable multi-person days | Any nourishment to every resident | At least 300 kcal to every resident | Any nourishment to every other resident | At least 300 kcal to every other resident |
|---|---:|---:|---:|---:|---:|
| capable | 1,360 | 5 | 0 | 9 | 2 |
| maker | 1,766 | 13 | 0 | 18 | 1 |
| merchant | 1,758 | 4 | 0 | 6 | 0 |
| caregiver | 1,634 | 5 | 0 | 7 | 0 |

No day meets nominal daily diets from one source across everyone, including
or excluding the producer. No harvester reaches seven cumulative days at either
the 300-kcal or nominal-diet reference, even when excluding their own meal.
Across the four policies, **84.1â€“85.7% of recorded nourishment** comes from the
existing anonymous personal-work route. There are 46 person-run Gardener class
observations (7/13/11/15 by policy); these do not prove class ownership at each
meal, seven days of feeding, or the ability to deliberately earn the deed.

This is a strategy/opportunity diagnosis, not proof that a Garden deed is
impossible. None of the four policies deliberately harvests and serves every
resident. A looser threshold alone would disguise that missing experiment.
The receipt field called nourishment also follows the existing player reserve
and NPC hunger/meal bounds; it is not an independent physiology simulation.

## Verification and retained material

- Seventeen focused assertions cover individual-source coverage, actual vs
  nominal portions, self vs others, missing data, departed/dead/arriving mouths,
  zero state writes, detached receipts and invalid report inputs.
- Quick: 155/155. Full: 927/927. No assertion was loosened or quarantined.
- garden-coverage-16.json.gz contains all raw cases and closed-day receipts.
- garden-coverage-report.json/.md are repeatable offline summaries.
- garden-coverage-neutrality.json.gz retains all eight on/off jobs;
  garden-coverage-neutrality.cjs reruns them from the repo root.
- garden-coverage-observer-source.json.gz preserves actual observer/analyzer
  source bytes (including line endings). garden-coverage-validation.json pins
  source, artifact and result hashes. Plain evidence text is LF as committed.

Commands and update requirements are in docs/SIMULATING.md, Garden coverage
diagnosis. These tool-only changes need no new gameplay balance comparison;
the unchanged balanced baseline and exact outcome/hash controls are retained.

## Next action

Run a named, real-action village-feeding strategy, with finite actual harvested
stock, real preparation/donation/gifts/feasts, visible hunger and normal costs.
Verify harvest/donation/gift controls and actual servings in a phone-width
browser too; prepared food proves the route, not natural affordability.
Separate lack of policy intent from poor harvest yield, food access and meal
opportunities. Test both player and NPC harvesters through public callers.
Then settle actual need and resident membership in the runtime, retain seven
successful feeding days per canonical person, wire the known-class objective
and Garden gate, and measure the resulting tradeoffs across the balanced vector.
The full-diet vs substantial-meal interpretation was put to Steve; it remains a
working design question, not an excuse to credit donations or anonymous food.
