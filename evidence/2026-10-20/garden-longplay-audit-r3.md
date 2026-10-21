# Natural garden usage audit (2026-10-20)

Baseline/current Game: shared6d919dcbd, build3f09b84a1-20261020-235403. No runtime, crop value, capacity, policy or balanced collector changes. Source identities, predeclared jobs, warnings and all 23 metric vectors are retained in r2.json.gz and its plan.

## Actual use

| Policy | Day cap | Runs | Planted | Harvested | Garden duty attempts | Redirected | Delivered pantry kcal | Weed deaths | Latest game day |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| capable | 150 | 16 | 16 | 0 | 865 | 852 | 0 | 42 | 152 |
| maker | 150 | 16 | 16 | 0 | 1549 | 1546 | 0 | 40 | 152 |
| merchant | 150 | 16 | 16 | 0 | 1781 | 1773 | 0 | 48 | 152 |
| caregiver | 150 | 16 | 16 | 0 | 829 | 828 | 0 | 36 | 152 |
| capable | 600 | 2 | 2 | 0 | 364 | 312 | 0 | 6 | 356 |
| maker | 600 | 2 | 2 | 0 | 140 | 140 | 0 | 8 | 134 |
| merchant | 600 | 2 | 2 | 0 | 449 | 448 | 0 | 4 | 124 |
| caregiver | 600 | 4 | 4 | 1 | 634 | 595 | 14400 | 14 | 270 |

All 64 screen campaigns sowed, but none delivered a harvest. Of ten extended-cap cases, only caregiver10003 delivered:7,200 kcal on day 29 and7,200 on day 32,14,400 total. No player harvest occurred in either horizon. These are the actual current controllers; they are not representative human players or a dedicated gardener-build cohort. The screen and extended cases are distinct configurations, not84 independent campaigns or a pooled win-rate estimate.

The 600-day cases all reached terminal outcomes before the cap, including capable10004 at day 356 and caregiver10003 at day 270. Their outcomes are in the summary. This does not complete the separate caregiver milestone: prefix-faithfulness and naturally earned late-game mobile Continue/action remain to verify. Do not treat a terminal win as an observed bearer death.

## Dead spots and causes

Creation/sowing counts would have hidden the missing food. A full pantry can redirect actual garden work before water/weeding. The separate prepared throttle contrast changes only that predicate and demonstrates the difference. Natural redirect/tending counters establish occurrences, not that every redirect caused a crop death. Agency/assignment loss, raids and neglected beds are distinct possible causes; weedDeaths records only deaths seen at gardenTick. There is no paid dead-bed reclaim route: dead beds remain excluded from sowing while counting against the fixed six-bed ceiling.

Current7/12/14-day maturity and 5,000-kcal three-day repeat harvests do not express ordinary cultivation versus invested garden magic. Haven tiers do not change capacity. Gardener-tagged abilities mainly affect wild foraging/water. See docs/GARDENS.md for the implementation contract and real horticulture references.

## Verification and limits

Eight separate sidecar on/off controls match complete state hash, outcome row, all 23 metrics and next RNG draws. Stable source/tool fingerprints: true. All 82 r1/r2 outcomes/state/metrics/RNG tails match: true. Against the retained current-source balanced screen, 36/36 overlapping outcome/state/all 23 vectors match; mismatches: []. The other28 current audit cases use different seed IDs from that retained screen and are not paired comparisons.

The pilot r1 counts player output after paid time, which can conflate a following meal with production; it also lacks duty redirect/tending counters. Its tool text and raw report remain historical. No player harvest occurred in these cases, but the repeatable r2 collector fixes that boundary anyway. Ten shared-kit/boundary checks cover refused work, actual mature output, the intervening meal, partial pantry delivery, source exclusion and restored methods.

Production is delivery, not useful consumption. Crop-specific intake/usefulness and eligible NPC garden-ability use remain unknown. Player ability possession does not prove use. No dedicated gardener policy, regional agronomy comparison, magic-growth implementation or broad playstyle clearance is claimed. The named current cohort cannot establish optimal garden play.

Reproduce with node scripts/garden-longplay-audit.js --out evidence/<date>/<fresh-prefix>; see docs/GARDENS.md. Interrupted jobs resume only under identical fingerprints. Full report/plan are retained; per-case caches are local recovery aids. No player build stamp is needed for this tooling/doc milestone.

## Next bounded implementation

Implement Haven-scaled visible bed capacity, realistic ordinary crop profiles, explicit paid gardening-ability growth, maintenance separate from unwanted surplus and a paid dead-bed reclaim/replant route. Preserve saved crops/structures and door access. Measure the combined survival/community/resource/progression/earned-gear tradeoffs with matched panels and natural gardener cohorts before publishing. Do not increase ordinary yield just to make the usage counter nonzero. The caregiver terminal/mobile lane remains queued rather than discarded.
