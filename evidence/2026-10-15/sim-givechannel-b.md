# SIM-GIVECHANNEL — the give-channel opener (loop B, food-economy ARM, 2026-10-15)

Axis: food-economy (scale-wall lens) — claims sim-findings #341 (SAME-VID TRUST NEVER RECOVERS ON COURTSHIP ROADS): 14/16 courtship-road bearers grind trust 15→0 with no recovery; dated gives are ZERO across all 16 runs — the scholar's generosity channels never fire; the village recovers trust by REPLACEMENT, not forgiveness. Design question: is a take-guard sufficient, or does the courtship road need a GIVE-CHANNEL OPENER alongside it?

Canon: docs/CANON.md read 2026-10-15; docs/PRESERVATION.md read 2026-10-15 (the ladder; raw = disease risk — the opener never gifts raw risk). No dedicated distribution-canon doc exists (same note as sim-trusthalf-b.md); the layer works from the engine's own mechanics, never invented canon.

Lineage: sim-trustcensus-b.md (#341) → sim-trusthalf-b.md (take-guard + pack-banking guarantee: primary 0.693 ≤ 0.70 GO, co-primary 1.208 ≥ 1.10 GO, but median-survival guardrail MISSED 89 vs need ≥95.5 — the guarantee's banking trips cost exposure deaths; arm killed per protocol, layer deleted). Trusthalf's mechanism lesson stands: "removing the penalty stops the bleeding; only trust GAINS can heal." This arm builds the gain side WITHOUT the exposure price: no extra wild trips, no take-discipline — just a dawn donation ritual on food the scholar already holds.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: does a daily give-channel opener — the scholar donating the first clean/cooked wild haul of each day at dawn, before the day's eating — move trust recovery (half-ration days) on the courtship roads, without the trusthalf exposure price?
- **Layer**: scripts/policies/givechannel.js (GIVEFIRST=1, default OFF; zero src/js changes; named exports layerOn/giveFirst/wildHaulAt/tagPantryTakes/basePolicyForRun/policyForRun). Mechanism: at the first upkeep of each day, BEFORE base.upkeep's competentEat, donate the first pack item qualifying as a wild haul (kcalEach>0, edible!==false, not bonded, not needsCooking, foodState ∈ {ready,cleaned,cooked}, not pantry-tagged, plantId||foodKind) via the honest donateToPantry verb — so the gift lands as a DATED give (v.gives + giveHist) and grants trust via the engine's own trustGainProgressive. Rules: SURPLUS-ONLY (packKcal − haulKcal ≥ Game.kcalCap(); never the last meal), ONE haul per day (a ritual, not a dump), no teleporting food (havenStoresAccess()!=='none' else counted skip), no silent actions (donateToPantry's own beat narrates). Pantry takes are provenance-tagged by a read-only wrap (merge-taint conservative) so the opener never gifts pantry-shuttled food. The layer is RNG-free in its decisions.
- **Why dawn, not dusk**: base donateHaul (end of daily) donates only what survives the day's three meals — for a trust-starved scholar that is nothing (finding #341). The opener front-runs consumption: generosity first, self second.
- **Road**: 8 seeds (11/22/33/44/55/66/77/88) × {leadcourt, belongseek} × 180d death-aware, identical seeds control vs armed. Control: GIVEFIRST unset (wrapped policy, gate-off pure delegation). Armed: GIVEFIRST=1. Own control in the SAME sweep — never inherit a baseline (#247).
- **PRIMARY** (exact): scholar-days with trust < 30 at the dusk daily sample (the engine's half-ration gate condition — the observable downstream of trust recovery), pooled over both policies. GO: armed ≤ 0.75 × control. (Literal "/Half ration/" meal beats are reported as a secondary.)
- **CO-PRIMARY (mechanism honesty, exact)**: mean dated-give kcal per armed run (the layer's gcKcal counter — every counted donation went through donateToPantry → recordGiveHist) ≥ 500. The opener must actually fire.
- **GO**: primary passes AND co-primary passes AND all guardrails pass. A miss on any is NO-GO per §14, never re-scored.
- **GUARDRAILS**: starvation deaths ≤ control+2; median survival ≥ control−10d; national ≥ control−2/16; no new death mode (n≥3 per #216).
- **Gates before sims**: scripts/test-givechannel-20261015.js — 84/84 RED→GREEN on a live Game (both policies: leadcourt + belongseek), independently re-run: RED (gate-off inert, giveHist untouched, verbs unwrapped), NON-AGGRESSION (gate-off wrapped == raw base, 20d byte-identical day hashes), GREEN (donation fires: v.gives +1200, dated giveHist entry, trust 15→17, pack keeps exactly the 1-meal buffer, beat narrates "Donated Test Haul (+1200 kcal)", once/day), SURPLUS RULE (thin pack → skip; boundary fires), QUALIFIERS (raw/pantry-tagged/bonded/needsCooking/smoked-store never gifted), AWAY SKIP (off-hall → counted skip), TAG WRAP (taken stacks tagged, restore clean, wrap installed during armed upkeep). SMOKE=1 instrument-honesty + layer-live marker per run (throws on mismatch).
- **Sense-testing**: filtered say-beat transcripts every run — read the donation beats and the meal beats; judge whether the village reads like people deciding.

## Proof results

scripts/test-givechannel-20261015.js — **84/84 assertions RED→GREEN**, both policies, re-run clean. SMOKE=1 green (policies drive, layer-live marker honest on both sides).

## Sweep results

32 runs: 8 seeds × {leadcourt, belongseek} × {control, armed}, 180d death-aware, identical seeds both sides, own control in the same sweep. (Process note: the first background sweep died silently after 1/32 runs — no summary; relaunched via nohup with SEEDS filter, then 3 targeted s11 combos; summary.json merges all per-seed files.)

| | leadcourt armed/control | belongseek armed/control | GO |
|---|---|---|---|
| PRIMARY half-ration days (trust<30) | 519/519 = 1.000 | 537/537 = 1.000 | — |
| PRIMARY pooled | **1056/1056 = 1.000** (bar 0.75) | | **MISS** |
| half-ration beats (literal) | 485/485 | 542/542 | — (1.000×) |
| trust≥30 days | 518/518 | 709/709 | — (1.000×) |
| scholar-starved-days | 354/354 | 405/405 | — |
| hungryDays (kcal<1200) | 164/164 | 124/124 | — |
| **opener donations** | **0 / —** | **0 / —** | mechanism |
| **dated give kcal (gcKcal)** | **0** | **0** | **MISS (< 500/run)** |
| opener skips | 682 | 848 | mechanism |
| gives lineage (donateHaul) | 800/800 | 800/800 | — |
| mealKcal | 1,465,499/1,465,499 | 1,830,240/1,830,240 | — |
| GUARD starvation deaths | 1/1 | 1/1 | pooled 2 ≤ 4 **GO** |
| GUARD median survival | 151/151 | 174/174 | pooled 161 vs 161 **GO** |
| GUARD national | 7/8 / 7/8 | 5/8 / 5/8 | pooled 12/16 ≥ 10 **GO** |
| GUARD new death mode | none | none | **GO** |
| table / wins | 0/0 / 0/0 | 0/0 / 0/0 | — |
| max wave | 4 / 4 | 4 / 4 | — |
| exiled | 0 / 0 | 0 / 0 | — |

**OVERALL: NO-GO** — the opener fired ZERO times across 16 armed runs (1,530 counted skips). CO-PRIMARY (mechanism must fire: ≥500 dated-give kcal/run) misses at 0. PRIMARY misses trivially (armed ≡ control). Per §14 the miss is not re-scored. **Arm killed per protocol** (layer deleted; proof+sweep+evidence retained with INFO-SKIP guards).

### Why the opener never fired (diagnostic, seed 22 leadcourt, 30d instrumented)

| reason | dawns |
|---|---|
| scholar away from the hall (havenStoresAccess 'none') | 23/30 |
| at haven, no qualifying clean/cooked wild haul in pack | 5/30 |
| at haven, pack thin (surplus rule blocks) | 2/30 |
| fired | 0/30 |

Two compounding blockers: (1) the courtship scholar sleeps away from Haven 77% of dawns — the honest verb refuses remote donation, so the dawn-at-haven design rarely gets its chance; (2) when at haven, the dawn pack holds no surplus — finding #341's mechanism in miniature. The opener front-runs consumption, but there is nothing to front-run: the trust-starved scholar's pack never exceeds the 1-meal buffer at dawn. The 800 kcal of control-side gives lineage (donateHaul, dusk) shows surplus exists *sometimes* — but never at dawn, at haven, as a first clean/cooked wild haul.

### The design question — answered

#341 asked: is a take-guard sufficient, or does the courtship road need a give-channel opener alongside it? The measurement answers: **the opener cannot fire on the courtship road as designed, because the scholar has nothing to give.** The surplus-only rule (never the last meal — non-negotiable) plus the scholar's actual food position (dawn pack ≤ 1 meal, away from haven 77% of dawns) means the give channel has no fuel. Trusthalf's lesson stands and sharpens: the fed scholar donates (17.4k gives, trust recovers); the unfed scholar cannot — no reordering of donation-vs-eating creates food. A give-channel opener is not an alternative to feeding the scholar; it is downstream of it. The next arm on this question must put the scholar in surplus first (the food-economy bind), then the opener has something to open with.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

belongseek-control-s11 (the trust-starved seed: half=157, starved=151): d1–3 the meal beats read "Village meal: +1200 kcal… (Half ration — they don't trust you yet.)" — the fiction names the reason honestly. Trust beats read as people deciding: "A person, maybe 30s hesitates, then backs off. 'Not today. Sorry.' (Low trust — reluctant.)" By d168–172 the same seed's meals turn full: "+2206 kcal" with no qualifier — trust recovered through the base mechanisms (the 800 kcal of donateHaul gifts + time). The arc from distrust through endurance to full ration is legible. No robotic flags. **PASS.** The opener contributed nothing to this arc — it never fired — which is itself the finding.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 12/16 | 0/16 | 0/16 | 4 | 0 | 161d | 182d |
| armed | 12/16 | 0/16 | 0/16 | 4 | 0 | 161d | 182d |

(Armed ≡ control — the layer was inert.) The scale wall stands — no wins either side; the arm moves nothing, by construction of its non-firing.

## Death-cause shares

Control (580 deaths): combat 266 (46%), villager combat 172 (30%), monster 76 (13%), expedition 21, sickness 13, contest 6, alien 6, wound 5. Armed (580): byte-identical distribution. No new death mode. The deaths are the courtship road's normal shape — the scholar and villagers die in fights, not of the opener.

## Village assessment (plain words)

The villages look like the trusthalf controls: trust-starved scholars eating half-rations, grinding trust 15→0, the village recovering trust by replacement (successions) rather than forgiveness — finding #341 reproduced exactly. On leadcourt s11/s55 and belongseek s66, scholars climb out (national reached, wave 4). On belongseek s11, the scholar endures 157 half-ration days and 151 starved days yet the village holds. The opener changed nothing — 1,530 dawns, 1,530 honest skips, zero gifts. The village the opener was meant to feed never saw it.

## Metric review

Per §14, the metric is not revised for this run. Notes for the NEXT run on this question: (1) the co-primary (≥500 kcal/run) was the right kill-switch — it caught the non-firing mechanism cleanly; (2) a future opener arm should pre-register a *firing-rate* diagnostic (skips by reason) as a mechanism secondary, so "away from haven" vs "no surplus" is distinguished in the pilot data itself rather than a post-hoc diagnostic; (3) the primary (half-ration ≤0.75×) is unanswerable when the mechanism doesn't fire — consider a two-stage gate (mechanism fires → then measure downstream) for future opener designs.
