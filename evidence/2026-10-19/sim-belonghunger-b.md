# SIM-BELONGHUNGER — belong-road hunger pantry-attribution diagnostic (loop B, food-economy)

Date: 2026-10-19 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261019T2230Z · Worker tree: sim-belonghunger-b
Axis: food-economy (scale-wall lens) — claims backlog item "BELONG-ROAD HUNGER NEEDS A NON-FEAST-CHANNEL ARM" (sim-findings.md, marked claimed 2026-10-19).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE the pilot sims)

- **Question**: three loop-B arms (overdraw4, overdrawfloor, fragilityfeast) all measured a belong-road-concentrated starvation elevation (0→3 on paired identical seeds) that survives every feast-side gate. The fragilityfeast arm held 264 feast candidates, collapsed feasts 79→32, and the hunger came anyway — the feast verb is EXONERATED as the starvation channel. The named next (backlog): the belong road's hunger needs its own instrumented arm on a NON-FEAST channel — candidate: the tribute/tend outflow rhythm, or the haul/donation economy on the belong road. Note: the r13 contribution rule arms feasts off tribute/tend PAID — the one inflow no gate has ever gated.
- **Method**: DIAGNOSTIC (no lever). (1) Mine the fragilityfeast corpus for hunger-day locations — the per-seed JSONs carry only aggregates (hungryDays, starveDeaths, death-cause counts), NO per-day pantry telemetry, so step 2 is required. (2) Run an instrumented 8-seed pilot on the same substrate with per-day pantry attribution: every pantry inflow/outflow channel measured at its engine choke point, hungry days detected with say-text windows, starvation deaths with day-of-death. (3) For each hungry day H and each starvation death, sum channel flows over the trailing 7-day window [H−7, H−1]; rank channels by net drain across all hunger events, belong road vs lead road (lead = the never-starves contrast).
- **Verdict form**: DIAG-GO (per §14 a diagnostic's verdict is attribution + a pre-registered lever design for the next run's arm — never re-scored, never a GO/NO-GO kill).
- **Instrument**: scripts/belonghunger-instrument.js (behavior-neutral wrappers; proof scripts/test-belonghunger-b.js 20/20: RED neutrality — instrumented == bare bit-identical, and reproduces the fragilityfeast control corpus exactly on seed 11; GREEN — tribute/tend/feast/raid/surplus channels record, hungry-day detection == corpus hungryDays, pooled residual 0.10%, determinism bit-identical).
  - OUT: tribute (payTribute return), tend (tendLink return), feast (hostFeast pantry delta), raid (raidPillage return), mealsV (villageEats, grossed past granary+surplus), mealP (villageMeal), takeP (takeFromPantry), rot (sweepSpoiled), out-\<caller\> (_removePantryKcal catch-all, stack-tagged, skips payTribute/tendLink).
  - IN: in (pantry item-identity scan, name-tagged; 'surplus' = villager-meal surplus via stockSurplus skip-credits), in-granary (drawLeaguePool; scan skips 'League granary draw' items).
- **Horizon**: 180d death-aware (dead villages stop +10d tail — the harness's deadTail).
- **Seeds**: 11/22/33/44 × leadfeast/belongfeast = 8 runs (identical seeds to the fragilityfeast corpus).
- **Substrate/policies**: leadfeast/belongfeast from scripts/policies/feastscale.js + FEASTSCALE_R13=1, SEATDRIVE unset (the fragilityfeast control substrate; the deleted fragilityfeast layer was R1-pinned byte-identical to these with FRAGFEAST unset).
- **Det-gate**: scripts/det-gate-belonghunger-b.js — 8 configs × 2 runs, 8/8 pairs bit-identical required, PLUS exact reproduction of all 8 corpus control configs (days/endReason/hungryDays/starveDeaths/death-multiset/feasts/wave).
- **Pilot**: scripts/measure-belonghunger-b.js → evidence/2026-10-19/perseed-belonghunger-b/ + belonghunger-b.json.

## (results below — to be filled after the pilot)

## Proof results (run BEFORE any pilot sims, 2026-10-19)

20/20 checks passed (FEASTSCALE_R13=1), independently re-run:
- RED R1: 40d leadfeast s11 instrumented vs bare — per-day pantry series bit-identical (351 points), outcome vectors identical.
- RED R2: instrumented leadfeast s11 180d-horizon reproduces fragilityfeast control fragleadfeast-s11 EXACTLY: days=114, endReason=village-lost, hungryDays=3, starveDeaths=0, deaths {villager combat:10, combat:23, monster:3}, feasts=5, wave=4.
- GREEN G1/G2/G3: tribute (24,373 kcal / 4 weeks on belongfeast 40d s11), tend (12,700 on leadfeast), feast (3,000, 2 events) all record.
- GREEN G4: hungry-day detection finds exactly the corpus's 3 hungry days (d113–115), each with a 40-line say window.
- GREEN G5: pooled reconciliation residual 0.10% (resid=1,118 on gross=1,149,156).
- GREEN G6: two identical 40d runs bit-identical ledgers + outcomes.
- GREEN G7: villager-meal surplus attributed separately (503 surplus-tagged inflow events, 356,600 kcal over the 114d R2 run).
- Det-gate: 8/8 pairs bit-identical (16 runs) + 8/8 corpus configs reproduced exactly — GREEN, pilot trusted.

## Instrument findings (from proof/debug — inputs to the attribution)

- The villager meal is COMMENSAL, not just consumptive: villagers eat their need but deposit surplus via stockSurplus ('Foraged food', 200-kcal stacks). On leadfeast s11 the surplus was 356.6k kcal over 114d (~3.1k/day) — the village's own production engine, previously invisible in channel terms.
- The _removePantryKcal catch-all surfaced courtship outflows: out-answerAccord (6,060), out-answerCounter (1,500) in 40d — real pantry costs of the courtship game, never before attributed.
- The `in` scan's name tags distinguish: surplus / forage / hunt / garden / fish / tribute-in / tariff / raid-spoils / favor / donate(player) / leftovers.

## Pilot results

8 runs, identical seeds to the fragilityfeast corpus (11/22/33/44 × leadfeast/belongfeast), 180d death-aware, FEASTSCALE_R13=1. All 8 reproduce the corpus control exactly (det-gate). Pooled reconciliation residual 0.1–11.8% per run (median ~7%; the proof run hit 0.10%).

| run | days | end | hungryEvents | starve | feasts | tribute/tend paid |
|---|---|---|---|---|---|---|
| lead s11 | 114 | village-lost | 3 (d113–115) | 0 | 5 | tend 31k |
| lead s22 | 138 | village-lost | 0 | 0 | 10 | tend 64k |
| lead s33 | 106 | village-lost | 4 (d92–93, d105–106) | 0 | 5 | tend 36k |
| lead s44 | 164 | village-lost | 0 | 0 | 14 | tend 87k |
| belong s11 | 163 | village-lost | 1 (d164) | 0 | 12 | tribute 139k (18 wks) |
| belong s22 | 144 | village-lost | 0 | 0 | 14 | tribute 158k |
| belong s33 | 96 | village-lost | 0 | 0 | 6 | tribute 51k |
| belong s44 | 180 | survived | 0 | 0 | 13 | tribute 127k |

8 hunger events total (7 lead, 1 belong), 0 starvation deaths on this control substrate. (The 3 armed-side starvation deaths from fragilityfeast cannot be re-run — the layer was deleted per kill protocol; the diagnostic attributes the hunger mechanism on the shared substrate instead.)

Full-horizon net channel totals (kcal, + = net drain), lead s11 / belong s11:
- lead s11: mealP +169k, rot +158k, mealsV +118k, raid +40k, takeP +32k, tend +31k, feast +8k, courtship out-verbs +18k, in −527k.
- belong s11: rot +521k, mealP +179k, tribute +139k, mealsV +115k, raid +32k, takeP +29k, feast +25k, out-answerDemand +17k, in −1170k.
- The belong road moves ~2x the food and pays ~800/day tribute with no tribute-in; the lead road pays ~400/day tend and receives tribute-in (45–100 events/run).

## 7-day-window attribution (ranked)

For each hunger day H, channels summed over [H−7, H−1] vs the run's baseline daily rate ×7. Ranked by Σ(window − baseline×7), + = hunger-associated drain:

**leadfeast (7 events):** in **+177,359** · raid +7,590 · takeP +3,464 · (all else ≤0; feast/tribute/tend at or below baseline)
**belongfeast (1 event):** in **+31,187** · raid +5,150 · takeP +4,448 · out-answerDemand +4,021 · mealP +4,006 · (feast −1,116, below baseline)

The verdict is unambiguous: **hunger is an INFLOW COLLAPSE, not an outflow spike.** In every hunger window, inflows ran at 15–48% of baseline (lead s11: −5k vs −35k baseline; belong s11: −20k vs −52k), while feast/tribute/tend sat at or below baseline. Raid is the only outflow that spikes (+5k…+9k in 3 windows) — accomplice, not primary.

Which inflow collapsed (in-tags in windows vs baseline): the production tags vanish — lead s11 windows: forage 0 (baseline ~7/wk), tribute-in 0, hunt 0; only the automatic villager-meal surplus (6–8/wk, reduced) and aid trickle remain. Belong s11: surplus 33 (baseline ~48/wk), forage 4 (baseline ~12/wk), fish 4.

Structural break (belong s11): inflow halved permanently at ~d110 (97k → 54k per 10d), fresh-days 100 → 1.3, pantry bled 11k → 0 over d155–164. Tribute had already stopped (no payments d150–164 — the pantry couldn't pay). Deaths were steady (2–4/10d, violence-dominated: 34 violent deaths total), not a single massacre — a sustained production decline as the village ground down to 8 souls.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

**Belong s11, d164 (the hunger day):** "a young carpenter walks in — pack light, eyes wide. Haven grows by one. (8 souls.)" — the village is down to 8 from 12. "⚠ WARNING: reserves critical. Eat tomorrow or the spiral begins." "Village meal: +526 kcal" — the player's draw collapsed with the pantry. "Quinn set out an extra bowl before catching themself. Nobody mentioned it." — grief at the fire is legible. "⚠ Haven's pantry is empty. Day 1 of hunger." Coherent, consequential, sad. PASS.

**Lead s33, d92–93 (hunger days 1–2):** the smoking gun for the next arm. "You keep a day's food (1350 kcal) — nothing extra for the pantry this time." / "(360 kcal) — nothing extra" — the scholar's hauls barely cover self, zero donated. "Village meal: +1500 kcal" / "+1825 kcal" — the player draws FULL meals from the communal pantry on the same days "⚠ WARNING: reserves critical" fires. No throttling, no sharing the sacrifice. "Fatima waits two days at your fire, getting thinner. Nobody answers." "🎣 Esteban worked the creek — 2 fish, +245 kcal to the pantry." — villagers still work; yields are tiny. "A frightened family cries — relief, mostly. Haven grows by one." — new mouths arrive mid-hunger. The scholar eats 1.5–1.8k/day from a dying commons while donating nothing. That is the behavior the next arm must change.

## Village assessment (plain words)

Eight villages on the standard feast substrate, and the ledger finally has names for every calorie. The villages that hungered didn't get raided into it or feasted into it — their fields went quiet. On the belong road's one hunger, a village that once held 100+ fresh-days bled out over fifty days: the hunters died or stopped bringing meat, the fish traps gave 245 kcal, the scholar kept every calorie they found and still ate a full 1,500 from the common pot while the reserves warning blinked. Tribute — the belong road's signature outflow, ~800 a day — had already stopped; you can't squeeze a dry pantry. The lead road hungered the same way, just more often: inflow collapse first, a raid or a demand or the player's own appetite second. The feast, which three arms suspected, is innocent in every window — it fired at or below its normal rate while the hunger built. What starves a village here isn't a big night out. It's the slow quiet after the producers are gone: fewer hands, smaller hauls, the same mouths, and a scholar who never learned to eat less when the bins run low.

## Next-arm lever design (pre-registered for the next run)

**Target:** the top-attributed channel — `in` (inflow collapse, +177k lead / +31k belong hunger-associated). The sense-test names the leverable behavior: the scholar donates nothing ("nothing extra for the pantry") while drawing full 1.5–1.8k pantry meals as reserves go critical.

**Lever: PANTRY-GUARD (policy-side, scripts/policies/pantryguard.js).** Wraps leadfeast/belongfeast. When fragile — fresh-days < 3 OR pantry < 5× the village's 7-day mean burn:
1. **Donate deep:** donateHaul keeps a half-day pack buffer instead of a full day (the scholar's haul flows to the commons first).
2. **Meal discipline:** the scholar's villageMeal draws at most half the normal want from the pantry (eats from pack / goes light — "share the sacrifice"); takeFromPantry takes are deferred while fragile.
3. **Forage-first:** the day's first work block is a haul trip (forage/hunt/fish by best expected kcal), not courtship travel, until the pantry clears fragile.
Requires FEASTSCALE_R13=1. Default OFF. Zero src/js changes.

- **PRIMARY:** hungry days, GO = armed ≤ 0.5 × control (paired identical seeds, pooled over lead+belong). (Starvation deaths as co-primary if any occur: armed < control.)
- **GUARDRAILS:** median survival ≥ control − 10d; scholar starvation/death not increased (the half-buffer is the risk — track scholar kcal/health); national ≥ control − 2; no new death mode (death-cause compare); rot pooled/100d ≤ 1.15× control.
- **Horizon:** 180d death-aware (dead villages stop +10d tail).
- **Seeds:** 8 pilot (11/22/33/44 + 55/66/77/88) × leadfeast/belongfeast, paired control re-measured. Confirm 12–16 only on pilot GO.
- **Det-gate:** 16/16 bit-identical reruns both sides before trusting (r27 rule); SMOKE=1 honesty gate.
- **Panel (§15):** balanced panels via scripts/balance-panel.js — the panel is the instrument, the pre-registered threshold is the judge.
- **Named alternative (coordinator's call):** TRIBUTE-RHYTHM GATE — defer belong-road tribute (accept arrears) while fragile, targeting the road's steady ~800/day outflow. Ranked second because tribute does not spike in hunger windows (it's the buffer-thinner, not the trigger); pantry-guard targets the measured #1 channel.

## Metric review (§14)

1. **DIAG-GO — the verdict form binds.** This arm played no lever; the deliverable is the attribution (inflow collapse, ranked) + the pre-registered pantry-guard design above. Nothing was re-scored: the pilot ran no GO/NO-GO threshold.
2. **The 8/8 corpus reproduction is the load-bearing result.** The instrumented runs reproduce all 8 fragilityfeast control configs exactly (days/endReason/hungryDays/starveDeaths/death-multiset/feasts/wave) — the substrate is proven identical and the instrument neutral, so the attribution inherits the corpus's standing.
3. **Scan-smear caveat (honest):** the `in` scan attributes by day-of-scan, smearing deposits ≤1 day; items added and fully consumed between scans are invisible as inflow (visible as outflow). The window-vs-baseline comparison is robust to this (the hole exists in both), and the tag-count collapse (forage 0 in windows) is independent of kcal. Pooled residual 0.1–11.8% bounds the unattributed remainder.
4. **Armed-side starvation not re-measured.** The 3 fragilityfeast armed-side starvation deaths cannot be re-run (layer deleted per kill protocol). The diagnostic attributes the hunger mechanism on the shared substrate; whether the armed elevation rides the same inflow-collapse channel is the pantry-guard arm's to test (its GO is on hungry days + starvation, paired).
5. **RNG-divergence note for the coordinator:** armed vs control sides in the feast-gate lineage diverge in game RNG after the first held-vs-fired feast (hostFeast and its fight draw game RNG; policies have a separate stream). The persistent 0→3 across three arms argues against pure noise, but the next arm should watch for it.
6. **SUBSTRATE DRIFT OBSERVED AT LANDING (2026-10-20 ~00:20Z):** after rebasing this branch onto master 8e33dde78 (siblings landed), the proof's R2 corpus pin no longer reproduces: leadfeast s11 now runs 72d (was 114d) with 1 starvation death (was 0) and a different death multiset — a sibling's landing changed engine behavior on these seeds. The diagnostic above (pilot, attribution, det-gate) was measured on the corpus tip (ac0b27d1a) and stands there; the pantry-guard arm MUST re-measure its control on the new tip (paired identical seeds) rather than inheriting any corpus. Notably, the drift made the substrate hungrier — the phenomenon under study got stronger, not weaker.

## Convergence state

food-economy: **diag-go** (belonghunger). The belong-road hunger is attributed: inflow collapse (15–48% of baseline in every hunger window; production tags vanish) with raid as the only spiking outflow (+5–9k in 3/8 windows); feast/tribute/tend exonerated again (at/below baseline in all windows). The instrument (scripts/belonghunger-instrument.js, 20/20 proof, 8/8 det-gate pairs bit-identical, 8/8 corpus reproductions) is landed as a reusable arm pattern: per-day pantry channel ledger, hungry-day say-windows, starvation day-of-death. Named next: **pantry-guard** (pre-registered above) — scholar inflow-defense + meal discipline while fragile, targeting the measured #1 channel; tribute-rhythm gate as the alternative.
