# SIM-TRUSTHALF — scholar take-discipline + pack-banking guarantee (loop B, food-economy ARM 2, 2026-10-15)

Axis: food-economy (scale-wall lens) — claims sim-findings #272 (TRUST-THROTTLED HALF-RATIONS: is the trust-throttle's hunger cost tuned right?) via the #157 TAKE-DISCIPLINE POLICY SEED, with the #181 PACK-DEPENDENCE FRAGILITY answer built in.

Canon: docs/CANON.md read 2026-10-15. **There is no dedicated distribution-canon doc** — the manifest covers diseases, bear, preservation, waves, contests, conversations, party, systems, balancing, time, kin, fans. Nothing covers pantry distribution/trust-throttled meals. Per the canon rule this is stated, not invented: the layer works from the engine's own mechanics and the three evidence files below, never from invented canon.

Lineage: sim-scholarreserve.md (#157: village meals write v.takes but carry no per-take trust penalty, while takeFromPantry's −2/take at negative net pins trust at 0; "does a meal-only/never-take policy variant recover trust?") → sim-mealonly-b.md (pure refusal arm KILLED AT PILOT: trust did NOT recover — "removing the penalty stops the bleeding; only trust GAINS can heal" — and hungry days rose 59–75% via PACK-DEPENDENCE FRAGILITY) → sim-belongfeast-b.md s77 sense read (#272: "The bins are echoing. We vote half rations" + "Half ration — they don't trust you yet." with 24–34 fresh-days on the shelves; the census undercounts this channel since ate ≥ 0.6×need).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: if the scholar never voluntarily takes from the pantry — eating only via own foraged pack + village meals — does trust recover, do meals return to full ration, and does half-ration hunger end? mealonly answered the refusal-only shape negatively on trust and positively on harm (hungry +59–75%). This arm adds the missing half: the PACK-BANKING GUARANTEE.
- **Layer**: scripts/policies/trusthalf.js (TRUSTHALF=1, default OFF; zero src/js changes; named exports layerOn/basePolicyForRun/policyForRun/hatchOpen/takePossible/mealComing/packEdibleKcal/pantryKcal). Two halves:
  1. Take-discipline: voluntary takeFromPantry takes refused at the policy layer (counted); takeFromPantryBulk refused unconditionally; starvation hatch (bar < 1200 AND pack has no edible food AND take physically possible AND no meal coming) fires a REAL ledger-recorded take, narrated; physically-impossible takes pass through so the engine's own refusal speaks; the village meal untouched.
  2. **PACK-BANKING GUARANTEE (exact, pre-registered)**: at the start of each wrapped daily — scholar alive, no active fight, not in a recovery window, health ≥ 35 — if the banked pack (edible, processed kcal in inventory) is below GUARANTEE_FLOOR = Game.kcalCap() (one full day's need — the SAME floor the competent policy's donateHaul keep-buffer uses; the competent-family norm), the policy takes exactly ONE extra banking forage trip via the existing forageTripSeedFirst verb (the same verb needTrip uses), BEFORE the base daily runs. Counted in _trusthalf.guaranteeTrips. Never touches the pantry, never alters the meal. At most one per day.
- **Road**: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast (= leadcourt + FEASTSCALE_R13=1), belongseek} × 180d death-aware, identical seeds control vs armed. Control: TRUSTHALF unset (wrapped policy, gate-off pure delegation). Armed: TRUSTHALF=1. Own control in the SAME sweep — never inherit a baseline (#247).
- **PRIMARY**: scholar-days (all scholar lives, lineage-summed within a run) with ate < 0.6 × need, where ate = Game.eat bar-deltas + village-meal kcal (v.lastPlayerMeal) for the game-day and need = Game.kcalCap() at dusk (the engine's own 0.6 starvation-branch condition, scholar side). GO: armed ≤ 0.70 × control.
- **CO-PRIMARY (exact form)**: trust trajectory — scholar-days with trust ≥ 30 at the daily sample (v.trust[current scholar vid], same read as villageMeal's share gate). GO: armed ≥ 1.10 × control (≥10% more full-trust days). Mechanism secondaries: half-ration-day share (trust<30 days / sampled days), mean meal kcal/night, hungry days (kcal<1200, mealonly-comparable definition).
- **GO**: primary passes AND co-primary passes AND all guardrails pass. A miss on any is NO-GO per §14, never re-scored.
- **GUARDRAILS**: starvation deaths ≤ control+2; median survival ≥ control−10d; national ≥ control−2/16; no new death mode (n≥3 per #216).
- **ANSWERABILITY**: if control scholar-starved-days < 8 across the 16 control runs, the primary ratio is noise-powered → INFO-SKIP (not a verdict), reported with the observed counts. (Metric-review note below on why.)
- **Gates before sims**: proof scripts/test-trusthalf-20261015.js (RED: gate-off natural takes exist; gate-off wrapped == raw base 20d byte-identical; GREEN: refusal, hatch real+narrated, pass-through, hatch closed-states, meal untouched, no prefill, guarantee trip/skip counters) all green pre-sims, independently re-run; SMOKE=1 instrument-honesty + det-gate (32 combos: 8 seeds × 2 policies × 2 sides, 60d) bit-identical both sides.
- **Sense-testing**: filtered say-beat transcripts every run — read the meal beats ("Half ration — they don't trust you yet"), the half-ration vote, and trust beats; judge whether the village reads like people deciding.

## Proof results

scripts/test-trusthalf-20261015.js — **78/78 assertions RED→GREEN on a live Game**, independently re-run (both policies belongseek + leadfeast):
- RED: gate-off base.upkeep fires 12 real takeFromPantry calls drawing 2400 kcal (the voluntary-take bind is real); gate-off wrapped == raw base 20-day day-hashes byte-identical (NON-AGGRESSION).
- GREEN: gate-on refuses 20 voluntary takes with 0 real kcal drawn and no hatch while a meal is coming; hatch fires a REAL ledger-recorded take (pantry −200 kcal) when estranged at the old fire, narrated ("The discipline breaks — hunger wins…"); pass-through: physically-impossible takes reach the original verb and the engine's own refusal speaks; hatch closed when fed / pack has food / meal coming / away; village meal untouched (feeds, writes v.takes); fed scholar attempts nothing (no pre-fill).
- GUARANTEE: empty pack → exactly 1 banking trip per daily; banked pack (≥ floor) → 0 trips; 2 thin days → 2 trips (at most one/day); hp 20 → 0 trips, counted skipped.

Method gates: SMOKE=1 instrument-honesty green both sides (named-export unwrap + live drive + **layer-live marker** asserting TRUSTHALF is actually live on the armed side — the belongfeast process lesson); det-gate **32/32 bit-identical** (8 seeds × 2 policies × 2 sides, 60d). The sweep itself re-asserts the layer-live marker per run (throws on mismatch).

Process note: the first full sweep's background process died silently at 30/32 runs (no summary; leadfeast-armed s77/s88 missing). Re-ran exactly those two seeds through the same oneRun code path (SEEDS/ONLY env filter added to the sweep); both completed cleanly — the death was environmental, not a layer bug. summary.json merges per-seed files.

## Sweep results

32 runs: 8 seeds × {leadfeast, belongseek} × {control, armed}, 180d death-aware, identical seeds both sides, own control in the same sweep.

| | belongseek armed/control | leadfeast armed/control | GO |
|---|---|---|---|
| PRIMARY scholar-starved-days | 290/465 = 0.624 | 200/242 = 0.826 | — |
| PRIMARY pooled | **490/707 = 0.693** (bar 0.70) | | **GO** (margin 0.7%) |
| CO-PRIMARY trust≥30 days pooled | **981/812 = 1.208** (bar 1.10) | | **GO** |
| half-ration scholar-days | 381/539 | 266/353 | — (0.725× pooled) |
| hungryDays (kcal<1200) | 183/187 | 123/242 | — (0.713× pooled) |
| mealKcal | 978,940/951,501 | 1,585,701/1,383,370 | armed +3%/+15% |
| refused voluntary takes | 14,198 / 0 | 11,020 / 0 | mechanism |
| hatch takes | 174 / 0 | 20 / 0 | mechanism |
| guarantee trips (foraged) | 734 (438) | 861 (477) | mechanism |
| takes lineage (meals+hatch on armed) | 1,014,109/994,677 | 1,600,991/1,444,088 | — |
| gives lineage | 10,107/0 | 7,295/3,470 | armed donates |
| GUARD starvation deaths | 10/5 | 6/12 | pooled 16 ≤ 19 **GO** |
| GUARD median survival | 97/105.5 | 86/102 | pooled 89 vs 105.5, need ≥95.5 **MISS** |
| GUARD national | 3/8 / 4/8 | 3/8 / 4/8 | pooled 6/16 ≥ 6 **GO** |
| GUARD new death mode (n≥3) | none | none | **GO** |
| table / wins | 1/0 / 0/0 | 3/2 / 0/0 | — |
| max wave | 3 / 4 | 5 / 5 | — |
| exiled | 0 / 1 | 0 / 1 | report |

**OVERALL: NO-GO** — the median-survival guardrail misses by 6.5d beyond the 10d allowance (89 vs need ≥95.5). Deterministic (det-gate 32/32), systematic across seeds (armed worse on 10/16, better on 4/16, tie 2/16) — not one bad seed. Per §14 the miss is not re-scored. **Arm killed per protocol** (layer deleted; proof+sweep+det-gate+evidence retained with INFO-SKIP guards).

### The mechanism (why trust recovered here but not in mealonly)

1. **The sting flow is removed** (same as mealonly): 25,218 voluntary takes refused across 16 runs; armed takes are bit-exactly meals + hatch takes (194 total). The −2/take penalty at negative net never fires on the refused takes.
2. **The guarantee keeps the scholar fed and participating**: 1,595 banking trips → hauls → donateHaul banks the 1-day buffer and donates the surplus → **donations grant trust via trustGainProgressive** (game.js donateToPantry: up to +10 per donation scaled by kcal/500). Armed gives lineage 17.4k vs control 3.5k. mealonly's scholar was hungry (+59–75% hungry days) and generated no gains; trusthalf's scholar is fed (h1200 −29%) so the gain channels (talk/donate/participate) function while the bleeding is stopped. Trust≥30 days +21%, half-ration days −27%.
3. **The scholar stops day-draining the pantry**: with takes refused, the night meal draws the full share — mealKcal +3–15% on the armed side (e.g. leadfeast-armed-s55: 173 meals, 158 full-ration, first full day 25; control: 30 meals, 0 full — the control scholar was away/at a drained pantry).
4. **The cost is exposure**: the 1,595 banking trips put the scholar on wild tiles ~100 extra times per run → monster deaths 37 vs 22, wound-deaths 11 vs 5, villager-combat 18 vs 13. Starvation deaths actually FELL (16 vs 17; leadfeast 6 vs 12) — the hunger harm is reduced, but the exposure cost dominates median survival. This is the guardrail miss, and it is the honest price of the guarantee as designed.

### The brief's honest question — answered

"If the scholar never voluntarily takes, does trust recover, do meals return to full ration, and does half-ration hunger end?" — **Yes, when the take-discipline is paired with the pack-banking guarantee** (mealonly's NO stands for the refusal-only shape): trust≥30 days +21%, half-ration days −27%, meals return to full ration on recovering trajectories (belongseek-armed-s77: full-ration +2225 kcal meals from d83; leadfeast-armed-s55: 158/173 full-ration). But the banking trips cost −16.5d median survival via exposure — so the SHAPE is right and the PRICE is wrong. The next arm should bank the pack with less exposure (garden/fishing/trap legs, fewer wild trips), not drop the guarantee.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

belongseek-armed-s77 (the #272 seed): d1–8 the meal beats read "Village meal: +1200 kcal… (Half ration — they don't trust you yet.)" — the fiction names the reason honestly. d1–7 carry the discipline's early cost visibly ("⚠ STARVING: health and energy falling. The spiral has started.", "Hunger gnaws. The pack is thin — work the green, haul it back, get it named at camp."). From d19 the discipline narrates itself once daily: "Take-discipline held: 60 pantry takes refused today. The pack and the meal carry the scholar." From d83 the meals turn: "Village meal: +2225 kcal, +1L water from the communal pantry." — full ration, no qualifier. Donations read as people: "Donated Stinging Nettle (+600 kcal). Trust +1. They'll remember this." The village reads as people deciding — the arc from distrust through discipline to full ration is legible in the beats. No robotic flags. **PASS.**

leadfeast-armed-s55 (strongest trust recovery, t30 157 vs 55): 173 meals, 158 full-ration, first full day 25; control managed 30 meals, 0 full. The armed scholar is present and fed; the control scholar is away and unfed. The contrast is stark but honest — same seeds, same road, the discipline changes where the scholar eats and how the village treats them.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 8/16 | 2/16 | 0/16 | — | — | 105.5d | 182d |
| armed | 6/16 | 4/16 | 0/16 | — | — | 89d | 182d |

(w4/w5: leadfeast both sides reach wave 5; belongseek control max 4, armed max 3.) Exiled: control 2, armed 0. The scale wall stands — no wins either side in 32 runs; the arm moves trust/hunger, not the wall.

## Death-cause shares

Control (192 deaths): combat 109 (57%), monster 22 (11%), starvation 17 (9%), sickness 16 (8%), villager combat 13 (7%), contest 7, wound 5, lockjaw 1, Buffering 1, expedition 1, The Callback 1. Armed (203): combat 106 (52%), monster 37 (18%), villager combat 18 (9%), starvation 16 (8%), sickness 12 (6%), wound 11 (5%), contest 3, thirst 1. No new death mode (n≥3 rule). The armed shift is exposure-shaped: +15 monster, +6 wound, +5 villager-combat vs −1 starvation, −4 sickness.

## Village assessment (plain words)

Sixteen villages measured twice — once with the scholar's hands out of the pantry, once without. The disciplined scholars foraged an extra ~100 banking trips each, ate bigger night meals from pantries they hadn't day-drained, and — because they were fed instead of hungry — donated, talked, and participated until the village trusted them: half-ration days fell by more than a quarter, and on the best trajectories the meals came back full (+2225 kcal, no qualifier). The price was paid on wild tiles: more monster maulings, more wounds that wouldn't close, villages lost a median 16 days earlier. The villages that survived the discipline were better-fed and better-trusted; the ones that didn't died of teeth, not hunger — starvation deaths fell. It is a real tradeoff, not a free lunch, and the guardrail called it correctly.

## Blanks filled / documented

- **#157 TAKE-DISCIPLINE POLICY SEED — ANSWERED (qualified YES)**. mealonly's refusal-only shape answered NO on trust; trusthalf's refusal + pack-banking-guarantee shape answers YES on trust (trust≥30 +21%, half-ration −27%, meals return to full ration) — but the guarantee's exposure costs median survival (−16.5d), so the arm is NO-GO on the guardrail. The seed's question is resolved; the next work is cheaper pack-banking, not the discipline question.
- **#181 PACK-DEPENDENCE FRAGILITY — ANSWERED**. The guarantee as pre-registered (floor = Game.kcalCap(), one extra forageTripSeedFirst per thin-pack day, counted) eliminates the fragility: hungry days (kcal<1200) fall 29% instead of rising 59–75%. The guarantee works; its price is exposure, not hunger.
- **#272 TRUST-THROTTLED HALF-RATIONS — evidence toward tuning**. The throttle's hunger cost is real but movable: with the discipline, half-ration scholar-days fall 27% and the s77 sense read shows the full arc (distrust → discipline → full ration). Whether the throttle itself is tuned right remains Steve's call — this arm shows the cost is paid in trust dynamics, not fixed.
- **DOCUMENTED (new finding)**: BANKING-TRIP EXPOSURE — each guarantee trip is a wild-tile visit; ~100 extra trips/run shifted deaths toward monster/wound (+26) and cost 16.5d median. A future low-exposure banking leg (garden/fishing/traps, haven-adjacent forage) is the named next. → sim-findings.
- **DOCUMENTED (new finding)**: FEED-SIDE TRUST GAINS — the trust recovery rides on the scholar being FED enough to participate (donations via trustGainProgressive + talk/mediator channels), not on sting-removal alone. mealonly × trusthalf is now a clean A/B on this: same sting removal, opposite trust direction, the difference is the fed/participating scholar. → sim-findings.
- **DOCUMENTED (metric)**: the PRIMARY's 0.6×kcalCap threshold mislabels thriving scholars as "starved" (control s77: 168 starved-days, bar ≥1200 throughout, 182d survival, wave 4 — kcalCap multiplies with skillsets while true need doesn't). The engine's own scholar hunger line (kcal<1200, the h1200 metric) is the honest scholar-hunger measure; future hunger primaries should use it or a ration-scaled need. Proposed for the NEXT run, not this one (§14).
- **DOCUMENTED (process)**: the first sweep's background process died silently at 30/32 runs with no summary; the two missing seeds re-ran cleanly through the same code path (environmental death, not a layer bug). The sweep now merges pre-existing per-seed files and supports SEEDS/ONLY targeted re-runs.
- **DOCUMENTED (telemetry check)**: `telemetry-check.js` aggregates booleans as 0 — the "national disappeared" LOUD was a schema artifact (my per-seed `national: true/false`); numeric re-aggregation shows armed 6/16 vs control 8/16, no deviation vs the sweep's own control. The "table newly appeared" LOUD vs the scale-wall baseline is a road-mismatch artifact (control also reaches table 2/16 on these roads).

## Metric review (§14)

1. **PRIMARY (starvedDays armed ≤ 0.70× control): GO — 490/707 = 0.693, margin 0.7%.** The margin is uncomfortably thin and the metric is miscalibrated (see documented metric finding above): it counts sub-need intake days, not true starvation. The h1200 secondary (0.713×) corroborates the direction with the engine's own hunger line. No re-scoring was done; the GO stands as pre-registered, reported with the calibration caveat.
2. **CO-PRIMARY (trust≥30 days armed ≥ 1.10× control): GO — 981/812 = 1.208.** Clear pass, opposite direction from mealonly — the guarantee is the differentiator.
3. **GUARDRAIL median survival: MISS — 89 vs need ≥ 95.5.** Deterministic, systematic (10/16 seeds worse), exposure-mechanism visible in death causes. This is the NO-GO. Not re-scored.
4. **GUARDRAILS starvation deaths (16 ≤ 19), national (6/16 ≥ 6), no-new-death-mode: all GO.**
5. **INFO-SKIP rule (control < 8 starved-days) did not trigger** (control = 707) — the answerability concern resolved empirically, though the calibration concern above stands.
6. **Convergence report: arm NO-GO at pilot on the median-survival guardrail.** Mechanism proven (refusal + hatch + guarantee all fire as designed; trust recovers; hunger falls), but the banking-trip exposure price is real. No confirm spend. Layer killed per protocol.

## Convergence state

food-economy: **NO-GO at pilot** (sim-trusthalf). The #157 take-discipline question is answered YES-with-guarantee (trust recovers +21%, half-ration days −27%, meals return to full ration — the shape mealonly's refusal-only arm couldn't achieve), and #181's pack-dependence fragility is fixed by the guarantee as pre-registered (hungry days −29% vs mealonly's +59–75%). But the guarantee's banking trips cost −16.5d median survival via wild-tile exposure (monster/wound deaths +21), missing the pre-registered guardrail. Layer killed per protocol. The axis's next work: low-exposure pack-banking (garden/fishing/trap legs), and the trust-delta-by-source instrument mealonly already asked for. The penalty side of food-economy is now exhausted (three killed arms: takedisc, mealonly, trusthalf); the open direction is gain-side and exposure-cheap banking.
