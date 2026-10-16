# SIM-FLOORDAY3 — 2-day vs 3-day drawdown floor, floor constant isolated (loop B, food-economy)

Date: 2026-10-16 · Loop: oversight-flesh-out-loop-b (ARM sim-floorday3-b) · Worker tree: sim-floorday3-b
Axis: food-economy (scale-wall lens) — re-claims sim-findings #200 (DRAWDOWN FLOOR SUSPECT, 2-DAY).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-overdraw4 (2026-10-14) PROVED the fresh-first rot mechanism but was KILLED AT CONFIRM on the STARVATION guardrail (3→7, per-day-alive rate more than doubled). Its autopsy's prime suspect: the 2-day drawdown floor (maxDrawdownKcal = fresh − 2×burn) — the feast verb can drain the pantry TO the floor, and the aid→feast ratchet drives fragile pantries there, where the next raid tips the village into hunger. sim-overdrawfloor (2026-10-15) tested 3-day floor + fragility gate vs no-layer and was KILLED AT PILOT with the harm un-isolated ("the channel is not the floor alone"). THIS arm isolates the floor constant alone: the SAME drawdown layer (aid + feast, fresh-first pre-draw, siege gate, no tribute, no fragility gate) runs on both sides — FLOORDAY3 unset (default) = the killed arm's 2-day floor verbatim; FLOORDAY3=1 = 3-day floor. Does raising the floor move starvation, holding everything else fixed?
- **Lever**: scripts/policies/floorday3.js — verb-verbatim rebuild of the killed overdraw4 layer from the preserved spec (evidence/2026-10-14/sim-overdraw4-b.md) with ONLY the floor constant gated by FLOORDAY3 (DELETED per kill protocol — see verdict). Wraps leadfeast/belongfeast (the FEASTSCALE_R13=1 substrate) as floorday3lead/floorday3belong. Policy-side only, zero src/js changes.
  - NOTE (deviation from the task brief's guess, documented): the 2-day floor does NOT live in game.js/hierarchy.js — grep finds no engine-side floor on the feast verb (hostFeast checks only have >= cost; pantryDraw has no floor). It lived in the DELETED scripts/policies/overdraw4.js. This arm rebuilt that layer; the floor constant and its gate were the only behavioral change vs the killed arm.
- **PRIMARY**: starvation deaths (absolute), armed ≤ control (identical seeds).
- **GUARDRAILS**: national ≥ control−2; median survival within 10d of control; fresh-rot kcal ≤ 1.15× control (rate-normalized per villager-day if longevity differs); no new death mode.
- **SECONDARY**: drawdown events (aid/feast counts + kcal, gate-holds), fresh-days distribution at feast events, pantry peaks, per-day-alive rot, table/national/wins, wave-4/5 unlocks, hungryDays, death-cause shares.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop.
- **Seeds**: 8 FRESH seeds (201–208) × {leadfeast, belongfeast} × {control, armed} = 32 runs. IDENTICAL seeds both sides. Control RE-MEASURED on current tip — never inherit a baseline (#247).
- **Det-gate**: bit-identical reruns both sides before trusting comparisons (r27 rule); SMOKE=1 honesty gate proving the layer actually ran with the right floor on each side.
- **Metric-review note (§14)**: the primary compares armed vs control where BOTH run the drawdown layer — the question is the floor's marginal effect on starvation, not the layer's. A GO here does not claim the layer is starvation-safe vs base (overdraw4's kill already showed it isn't); it claims the floor height moves the harm.

## Proof results (run BEFORE any sims)

scripts/test-floorday3-20261016.js — RED (FLOORDAY3 unset, 2-day) + GREEN (FLOORDAY3=1, 3-day), one process with a live env toggle. PROOF GREEN, all checks passed (independently re-runnable):
- R1/R3 floor formula purity: maxDrawdownKcal == fresh − 2×burn exact (102143) gate-off; == fresh − 3×burn exact (78214) gate-on; the two differ by exactly one day's burn (23929).
- R2/R4 behavioral RED→GREEN: a feast whose cost sits between the floors (90179) FIRES under the 2-day floor (candidacy returns a plan; full-upkeep integration: fd3Feasts=1, pantry 150000→59500, fresh-days drained TO 2.49 — the #200 exposure, reproduced on a fixture) and is HELD under the 3-day floor (candidacy null; pantry untouched).
- R5: normal-cost feast (58214, below the 3-day floor) fires on BOTH sides — the floor is a ceiling, not a ban.
- R6: aid verb IDENTICAL both sides (sub 1000→2500, trust gained, cause line after the confirmed verb) — the aid's 1500 floor cannot discriminate above the overstock trigger; the floor change's blast radius is the feast only.
- R7: siege gate holds all verbs off on both sides (recent-raid fixture: gateHeld=1, no verbs).
- R8: tribute timing untouched — no direct payTribute call in the layer (static); no layer tribute verb; no early-tribute cause line, both sides.
- DET-GATE: 2 seeds × 2 sides, 40d, byte-identical per-day hashes on rerun.
- SMOKE: policy ids floorday3lead, feast-event log present, floorDaysN honest (2/3) per side.

## Sweep results

32 runs, identical seeds, det-gate green both sides before trusting comparisons, SMOKE=1 green. **16/16 pairs byte-identical per-day hashes — the floor never bound once in 32 runs.**

| metric | control (2-day) | armed (3-day) | pre-reg |
|---|---|---|---|
| starvation deaths (**PRIMARY**, absolute) | 0 | 0 | PASS (≤ 0) — vacuous, see below |
| national | 11/16 | 11/16 | ✓ (≥ 9) |
| median survival | 122.5d | 122.5d | ✓ (within 10d) |
| fresh-rot kcal | 4733k (302/vday) | 4733k (302/vday) | ✓ (≤ 1.15×) |
| table | 15/16 | 15/16 | — |
| wave-4 / wave-5 | 15/16 / 8/16 | 15/16 / 8/16 | — |
| wins | 0/16 | 0/16 | — |
| exiled | 0/16 | 0/16 | — |
| drawdown verbs | 58 aid / 87 feasts, 117 gate-holds | identical | mechanism fires; floor never discriminates |
| death modes | combat 348, villager combat 140, monster 130, expedition 23, contest 4, wound 4, Audit 3, ... | identical | no new death mode ✓ |

Paired starvation deltas (armed−control): +0 on all 16 pairs. Drawdown volume identical both sides: 116 aids / 192k kcal, 174 feasts / 401k kcal. The layer FIRES (593k kcal moved) — but the floor never discriminates.

**Verdict: KILLED — invisible effect** (pilot-gate doctrine: kill levers that fail the sniff test; never run confirms on an invisible effect). The primary "passed" 0 ≤ 0 only because the treatment never engaged — a vacuous GO is not a GO. Per the kill protocol the layer file is deleted zero-trace; instruments (proof, sweep, det-gate, per-seed JSONs, beats) and this evidence are kept.

## Why the floor never binds (the actual finding — root-cause level)

The floor check (`plan.cost ≤ fresh − floorDays×burn`) is structurally near-vacuous given the layer's own overstock trigger (`fresh-days > 4`):

- Trigger `fd > 4` ⇒ `fresh > 4×burn` ⇒ `maxDrawdown(2-day) = fresh − 2×burn > 2×burn`.
- The floor binds only when `cost > maxDrawdown > 2×burn`.
- Real feast costs are `max(1500, 400×heads)` ≈ 1.6–5k for village-size rosters; `2×burn` ≈ 48k at the standard `pop×2000` burn rate. **The cost would need to exceed 10× the village's daily burn while the pantry holds >4 days — impossible for real rosters** (heads ≤ pop ⇒ cost ≤ 400×pop < 2×2000×pop ≤ 2×burn).

Empirical confirmation: 174 feast events across 32 runs, max feast cost 3,828 kcal, min fresh-days-after 3.07 — no event came within an order of magnitude of the floor. The layer's feasts are small because the village is small; the floor was designed against a threat (deep feasts draining to 2 days) that the engine's own cost formula cannot produce.

The floor CAN discriminate in exactly one regime: collapsed burn (a starving village where `burnHistory` has cratered). Targeted fixture (burn=1500, fresh=9000, fd=6.0, cost=4800): 2-day FIRES, 3-day HOLDS. So the gate works as designed — but **no run in 32 entered that regime with a live feast candidacy**. The #200 hypothesis in its literal form — "the feast verb drains TO the 2-day floor" — did not materialize: the layer's feasts never took fresh-days below 3.07.

**Consequence for #200**: the overdraw4/overdrawfloor starvation harm cannot come through the floor — the floor never engaged there either (same trigger, same cost formula). The harm channel must be the drawdown VOLUME on thin-overstock pantries (fd hovering just above 4): the layer's aid (1500) + feast (~2–4k) + the base feastscale's own feasts + the parent's weekly tend discipline all firing in the same window, on a pantry one raid away from hunger. The floor — 2-day or 3-day — is not the dial. The trigger (`fd > 4`) and the uncapped combined outflow are the suspects now.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 11/16 | 15/16 | 0/16 | 15/16 | 8/16 | 122.5d | 180d |
| armed | 11/16 | 15/16 | 0/16 | 15/16 | 8/16 | 122.5d | 180d |

Exiled: 0 everywhere. The scale wall is untouched by this arm (as expected — nothing engaged).

## Death-cause shares

Identical both sides (16/16 byte-identical): combat 348, villager combat 140, monster 130, expedition 23, contest 4, "a wound that wouldn't close" 4, The Audit 3, toad 2, sickness 2, ambush 2. No starvation on either side in these 32 runs — the experiment had no harm signal to move, as well as no treatment effect.

## Village assessment (plain words)

Thirty-two villages, two of them the same village twice — the 3-day floor changed nothing, and the villages show it. They live and die identically: violence-dominated collapses (combat 348, villager combat 140, monster 130 across the set), pantries that swing between overstock mountains (feasts at 70–119 fresh-days, the village eating the mountain because the rot is circling) and thin stretches where the drawdown verbs keep firing at fd 4.1 because the trigger says "overstock" and the floor says nothing. The drawdown beats read as people deciding — "Haven's shelves hold ~28 days of fresh — more than the village eats before it turns. The surplus goes to Emberhold's fire, not the rot" — and the fresh-day counts in the cause lines decline honestly as pantries thin (28→27→…). The feast is televised, the aid is remembered by grandmothers. Nothing reads robotic. But the floor — the thing this run was about — is a ghost: 174 feasts, and not one ever saw it.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Lead road seed 203, 153d: 10 aids, 4 feasts, 25 gate-holds. The beats read as a village managing surplus, not a policy executing: aid cause lines name the subordinate and the honest fresh-day count; feast beats carry the televised presentation and the named villagers eating. The daily STARVING warning repeats verbatim when hunger comes (engine-side, pre-existing). **PASS** — with the caveat that the floor itself produced no beats to judge, because it never engaged.

## Blanks filled / documented

- **FILLED (finding)**: the drawdown floor is provably near-vacuous given the `fd > 4` trigger — documented with the structural argument + the 174-event empirical confirmation + the collapsed-burn fixture showing the only regime where it binds. This reframes #200: the floor is not the exposure; the trigger and the uncapped combined outflow are.
- **DOCUMENTED (no chase)**: the combined outflow on thin-overstock pantries (layer aid + layer feast + base feastscale feast + parent weekly tend, all firing while fd hovers just above 4) is the remaining starvation-channel suspect for the overdraw lineage. Named next: cap total daily drawdown outflow when fd < 6, or lift the trigger to fd > 6. Left for a future arm — out of this run's scope per the findings-backlog rule.
- **DOCUMENTED (brief deviation)**: the task brief's "find the floor in game.js/hierarchy.js" premise was wrong; no engine-side floor exists. Noted here so the next arm doesn't re-search.

## Metric review (§14)

- The pre-registered primary (armed ≤ control on starvation) passed 0 ≤ 0, but the treatment never engaged (16/16 byte-identical) — a vacuous pass. Per the pilot-gate doctrine this is a KILL, not a GO: landing a lever whose only change is unobservable would enshrine dead code, and the 2-day default would resurrect the killed arm's exposure as a permanent artifact.
- The guardrails all passed trivially (identical sides). No re-scoring was needed or done.
- Metric lesson for future floor-type arms: pre-register a **mechanism-engagement check** (e.g. "the floor binds on ≥N feast candidacies") alongside the outcome primary. An outcome primary on an unengaged mechanism is uninformative. Proposed for the next run's header, not this one.
- The 174-event empirical floor analysis + the collapsed-burn fixture are kept as instruments: they pin exactly when the floor binds, so no future arm re-derives it.

## Convergence state

**killed-at-pilot** (invisible effect — the floor never bound in 32 runs). The food-economy axis is not converged; the #200 line now redirects from the floor constant to the drawdown-volume/trigger hypothesis (filed in sim-findings.md).
