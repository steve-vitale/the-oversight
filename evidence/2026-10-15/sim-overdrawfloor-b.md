# SIM-OVERDRAWFLOOR — fresh-first drawdown, 3-day floor + fragility gate (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-overdrawfloor-b
Axis: food-economy (scale-wall lens) — re-claims sim-findings #199 (DRAWDOWN VERBS MUST DRAW SOONEST-SPOILING FIRST), the named next of the KILLED overdraw4.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-overdraw4 PROVED the fresh-first mechanism (confirm 0.503 absolute / 0.503 per-day-alive rot — the strongest rot reduction in the lineage) but was KILLED AT CONFIRM on the STARVATION guardrail (3→7 vs ≤4; per-day-alive rate more than doubled). The autopsy's prime suspect: the 2-day floor (the feast verb drains TO it; aid→feast ratchets a fragile pantry toward it; the siege-gate holds FUTURE verbs but can't undo a drain before the NEXT raid). This arm keeps the tribute-free aid+feast drawdown verb-for-verb and adds the two mitigations the autopsy named: (1) a **3-day floor** (maxDrawdownKcal = fresh − 3×burn), (2) a **FRAGILITY GATE** (no drawdown when the pantry is fragile: fresh-days < 5, pantry trending down, or a hungry day in the trailing 7d). Does the rot reduction survive with the starvation channel closed?
- **Lever**: scripts/policies/overdrawfloor.js (OVERDRAWFLOOR=1, default OFF; wraps leadcourt/belongseek as overleadfloor/overbelongfloor). Verb-for-verb overdraw4 with two changes:
  - Floor: plan.cost ≤ fresh − 3×burn (was 2×burn); aid needs ≥ 1500 of it.
  - Fragility gate (pure-read, daily): fragile = freshDays < 5 (near the 3-day floor) OR trailing-5d mean exceeds today by ≥ 1 fresh-day (needs ≥ 3 trailing samples) OR any hungry day in the trailing 7d (progState.hungryStreak backstop). Fragile → no drawdown, osFragileHeld counted (a "would-have-fired" hold, ag2 convention).
  - The layer's aid runs BEFORE the parent's daily: the weekly tend is re-timed and re-ordered fresh-first, not added — the parent's tend discipline keeps its rhythm on non-drawdown days and skips (tendedWeek dedup) when the layer already tended.
  - Everything else verb-for-verb: fresh-first pre-draw + _removePantryKcal answered from the draw (rollback on refusal), r13-style feast candidacy, siege-gate (lingerer/gorge/raid), aid > feast priority both call orders, NO tribute verb, cause lines after confirmed verbs only. Policy-side only, zero src/js changes.
- **PRIMARY** (the r32b primary line; overdraw4-confirm's 0.503 is context, NOT the bar): absolute fresh-rot kcal, armed ≤ 0.85× control (identical seeds) AND rot-per-villager-day armed ≤ control × 1.335 (r25b rotcal A/A noise calibration). Both bind.
- **GUARDRAILS** (binding — this arm is pre-registered on starvation): starvation deaths ≤ control+2; hungryDays ≤ control × 1.1; national ≥ control−2/16; no new death mode (n≥3). Median report-only per #224.
- **SECONDARY**: drawdown events (aid/feast counts + kcal, fragile-holds), fresh-days distribution, pantry peaks, overstock-cliff events, per-day-alive rot, table/national/wins, wave-4/5 unlocks, gorge nights.
- **Horizon**: 180d death-aware (pacing-law max); dead villages stop (+10d tail).
- **Seeds**: pilot 11/22/33/44 × leadcourt/belongseek = 8 runs/side (the overdraw4 cohort), IDENTICAL seeds control vs armed. Control RE-MEASURED on current tip — never inherit a baseline (#247). Confirm 12–16 only on pilot GO (fresh seeds 55/66/77/88). Both sides on current master WITH the landed prodthrottle — the question is overdrawfloor's MARGINAL drawdown on top of it.
- **Det-gate**: 16/16 bit-identical reruns both sides first (r27 rule); SMOKE=1 honesty gate (named-export unwrap + live drive check) both sides.
- **Proof**: scripts/test-overdrawfloor-20261015.js — RED (R1 gate-off byte-identical, R2 no verbs gate-off, R3 naive foil) + GREEN (G1 aid, G2/G3/G4 siege, G5 floor math, G5b rollback, G6 feast, G7 tribute untouched, G8 priority both orders, G9 determinism, G10 fresh-first ordering, G11a–d fragility gate incl. the not-a-kill-switch control, G12 floor-3 holds a deep feast the old floor allowed). All green pre-sims, independently re-run.

## Proof results

Pre-sims, independently re-run:
- RED (gate off): R1 gate-off byte-identical (overleadfloor == leadcourt, overbelongfloor == belongseek, 40d × 2 seeds, per-day hashes identical); R2 no verbs fire gate-off on the overstock fixture (parent tend discipline intact, pantry 150000→148500); R3 naive foil (the R2 failure mode documented: _removePantryKcal drains the +30d stack first).
- GREEN (OVERDRAWFLOOR=1): G1 aid fires (sub 1000→2500, trust 30→38, floor ≥ 3, cause after the engine beat, tend@0 cause@1); G2/G3/G4 siege holds (lingerer / raid / gorge); G5 floor math (100000 − 3×23929 = 28214); G5b pre-draw rollback unit-exact; G6 feast fires (5000 kcal, floor ≥ 3); G7 tribute untouched (no osTribute, base discipline paid on its own rhythm); G8 aid > feast both call orders; G9 armed determinism 40d × 2; G10 fresh-first ordering (A 96→93, B/C untouched, drained exactly once); **G11 fragility gate** (near-floor 4.5d: no aid, hold counted; trending-down: no aid, hold counted; recent-hunger: no aid, hold counted; healthy 8d pantry: aid FIRES — the gate is not a kill switch); G12 the 3-day floor holds a 98214-kcal feast the old 2-day floor would have allowed, while a normal feast on the same pantry still fires.
- Det-gate: 16/16 bit-identical BOTH sides (r27 rule). SMOKE=1 honesty gate green both sides (named-export unwrap + live drive check).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed sense run, overleadfloor seed 22, 120d: 61 drawdown beats (6 aids, 5 feasts, 34 gate-holds). The beats read as a village deciding — the cause line gives the WHY after the engine beat gives the WHAT:

- "🌾 Haven sends 1,539 kcal of grain to Stonebridge's fire — not tribute, the other way around. Someone's grandmother over there will remember who fed her. (Trust +8.)" → "🌾 Haven's shelves hold ~24 days of fresh — more than the village eats before it turns. The surplus goes to Stonebridge's fire, not the rot."
- "🍖 FEAST 📺 — Walt opens the pantry wide: 8× Muscadine Grapes... (−2,015 kcal from the pantry)" → "🍖 The shelves groan — ~34 days of fresh on hand, and the rot is already circling. We eat the mountain tonight, or it eats itself."

Named villagers open feasts (Walt, Zuri, Caitriona, Jorge, Wolfgang); named subordinates receive aid (Stonebridge, Thornfield, Emberhold); fresh-day counts in the cause lines are honest and DECLINE as the pantry thins (34→22→17→9→7→5 — the village narrates its own tightening). Aid amounts vary honestly with the unit ceiling (1,500/1,539/1,564/1,600/1,764/3,330/5,190 — real food moved). Bare tend beats without a cause line are the parent's own discipline (it tends every untended link weekly when the pantry > 20000), not the layer's — the one-verb/day hold is visible in the beats. Nothing reads robotic.

**Narration observation (engine-side, pre-existing, not this arm's blank):** the engine's tend beat repeats one template verbatim ("Someone's grandmother over there will remember who fed her") across dozens of beats — the wall-of-identical-text finding from the prior narration review. The layer's cause lines vary honestly; the engine's don't. Filed, not chased.

**PASS.**

## Pilot results

8 runs/side, identical seeds (11/22/33/44), 180d death-aware. Det-gate GREEN both sides before trusting comparisons (16/16 bit-identical each).

| metric | control (gate off) | armed (OVERDRAWFLOOR=1) | pre-reg |
|---|---|---|---|
| fresh-rot kcal (**PRIMARY**, absolute) | 1520.3k | **1344.0k** | **MISS** (≤ 1292.2k; ratio **0.884**) |
| rot/day-alive | 1550 | 1253 (ratio **0.808**) | PASS (≤ 2069) |
| preserved-rot kcal | 168.7k | 164.0k | — |
| median survival | 135d | 171d | report-only ✓ |
| national | 5/8 | 5/8 | ✓ (≥ 3) |
| table | 0/8 | **3/8** | — (6th replication of feast-as-table-door) |
| wins | 0/8 | 0/8 | — |
| wave-4 unlocks | 2/8 | 4/8 | — |
| wave-5 unlocks | 0/8 | 1/8 | — |
| hungryDays | 16 | 13 | ✓ (≤ 17.6) |
| starvation deaths | 1 | **8** | **MISS** (≤ 3) |
| exiled | 0 | 0 | unchanged ✓ |
| drawdown verbs | 0 | 20a/19f lead, 0a/10f belong; 107k kcal; 0 tribute | mechanism fires; tribute untouched |
| siege-gate holds | 0 | 349 | gate live |
| fragile-holds | 0 | 223 (156 lead + 67 belong) | the new gate bites |
| overstock cliffs (>10k/d) | 33d / 425k | 29d / 395k | — |
| pantry peak | 102k | 110k | — |

Per-seed rot ratios (armed/control): lead 1.06, 1.26, 1.00, **7.14** / belong 1.00, 0.28, 0.48, 0.45. Perturbation-dominated per seed (the overdraw3 R2 note stands). lead s44's 7.14 is the longevity confound in pure form: the armed village lived the full 180d (wave 5, global) vs its control twin's 74d — more days, more rot; the per-day-alive form (0.808) is the honest read.

**Verdict: KILLED AT PILOT per §14 — fast kill, as designed.** Two independent misses: (1) the PRIMARY's absolute form missed (0.884 > 0.85; the per-day-alive form passed at 0.808 but both bind); (2) the STARVATION guardrail breached (8 > control+2 = 3). The starvation elevation is belong-road-concentrated (7 of 8; belong 1→7, lead 0→1) — the overdraw3 signature, back again. The fragility gate held 223 verb-days and the 3-day floor capped the deep drain, but the harm channel is still open: the mitigations weakened the mechanism (0.884 vs overdraw4's 0.503/0.838) without closing the harm. Per-seed data can't isolate the channel at n=8 — same honest limit as overdraw4's autopsy.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| pilot control | 5/8 | 0/8 | 0/8 | 2/8 | 0/8 | 135d | 180d |
| pilot armed | 5/8 | 3/8 | 0/8 | 4/8 | 1/8 | 171d | 180d |

Exiled: 0 everywhere. The scale wall is not broken by this arm. The feast-as-table-door secondary is now 6× replicated (armed 3/8 vs control 0/8; prior: overdraw4 pilot 0→4 + confirm 0→2, r32b 0→5, overdraw3 0→4, allowgate2 4→5).

## Death-cause shares

Control (75 deaths): combat 37 (49%), monster 9 (12%), sickness 8 (11%), villager combat 6 (8%), wound 4, contest 3, thirst 3, dehydration 2, starvation 1 (1%), lockjaw 1, expedition 1. Armed (83): combat 51 (61%), starvation 8 (10%), monster 8 (10%), sickness 5 (6%), wound 4, thirst 3, contest 2, villager combat 1, dehydration 1. Same families — no new death mode (starvation existed in control; this is elevation, not a new mode). The starvation share rose (1%→10%) while total deaths rose modestly — villages die of violence on both sides; the armed side adds hunger at the margin, concentrated on the belong road.

## Village assessment (plain words)

Eight villages, and the pantry learned caution without learning safety. The fragility gate stood down the drawdown 223 times — a real, biting gate — and the 3-day floor capped the deep drain; the rot pile shrank, but only to 0.884 of control, well short of the bar and far short of the unmitigated arm's 0.503. The mitigations taxed the mechanism more than the harm. The lead road was the clean road again: villages lived longer (median 180d), one reached wave 5 and global, two reached the table, starvation flat at 0→1. The belong road was not: two villages died early and hungry (73d and 90d against 109d and 93d control twins), starvation 1→7, and the feast — the belong road's only drawdown verb, since it has no primary-haven links for the aid verb — is the remaining suspect. The gate held the verbs off on fragile days; the hunger came anyway. The rot mechanism is proven but the price is now measured twice: overdraw4's autopsy suspected the floor; this arm raised the floor, gated fragility, and the starvation elevation persisted — the channel is not the floor alone.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT**: the 3-day-floor + fragility-gated fresh-first drawdown — scripts/policies/overdrawfloor.js (OVERDRAWFLOOR=1, default OFF; DELETED per kill protocol — the file is removed, not committed), proof scripts/test-overdrawfloor-20261015.js (RED→GREEN incl. G5b rollback, G7 tribute-untouched, G8 priority both orders, G10 fresh-first ordering, G11a–d fragility gate incl. the not-a-kill-switch control, G12 floor-3 behavioral hold; independently re-run, kept as instrument), sweep scripts/measure-overdrawfloor-20261015.js (kept, incl. osFragileHeld telemetry + __odfSink attribution), det-gate scripts/det-gate-overdrawfloor-20261015.js (16/16 both sides, kept), sense script scripts/sense-overdrawfloor-20261015.js (kept). Per-seed JSONs + logs under evidence/2026-10-15/perseed-overdrawfloor-{base,armed}/, overdrawfloor-{baseline,armed}.json/.log (kept). Zero src/js changes (policy-side only).
- **FILLED (instrument)**: the fragility gate as a reusable arm pattern (near-floor / trending-down / recent-hunger composite, osFragileHeld "would-have-fired" hold telemetry in the ag2 convention); the layer-aid-before-parent-daily ordering (the weekly tend re-timed and re-ordered fresh-first, not added — keeps the parent's rhythm intact for measurement); the G12 floor-behavioral test pattern (mocked feastPlan cost inside the old floor's window).
- **DOCUMENTED** (for the coordinator's backlog): (a) the fresh-first rot mechanism is now 3× measured (overdraw3 0.517, overdraw4 0.503, overdrawfloor 0.884 with mitigations) — the mitigations cost more mechanism than harm; (b) the starvation channel is NOT the 2-day floor alone — floor raised to 3 + 223 fragile-holds and the elevation persisted (1→8, belong-concentrated 1→7); the belong road's feast verb (its only drawdown verb) is the remaining suspect and needs its own instrumented arm; (c) the feast-as-table-door secondary is 6× replicated and already claimed (#226); (d) the engine's tend beat is a wall-of-identical-text instance (filed, not chased); (e) control rot on this tip: 1520.3k pilot — another #188 data point.

## Metric review (§14)

1. **KILLED AT PILOT: primary absolute form missed (0.884 > 0.85) and the starvation guardrail breached (8 > control+2 = 3).** Per §14 a GO met with a guardrail breached is NO-GO; here the primary missed on its binding form too. No re-scoring — the per-day-alive pass (0.808) does not rescue the absolute miss, and the #223 perturbation hedge does not transfer to the starvation guardrail.
2. **The 0.85 bar was the r32b line, not overdraw4's 0.503** — the arm was judged on whether the mechanism survives the mitigations, and it didn't (0.884). The favorable-draw supersede caution held: the bar was honest and the arm missed it.
3. **The mitigations taxed the mechanism more than the harm.** 223 fragile-holds + the 3-day floor cut the rot reduction from 0.503 to 0.884 while starvation still rose 1→8. The next arm on this lineage must instrument the belong-road feast verb directly (it is the only drawdown verb on that road) rather than adding more gates to the drawdown.
4. **Median stayed report-only** (171d vs 135d, positive direction) — the #224 precedent holds; the binding harm signal is the starvation count, which fired.
5. **Per-seed rot ratios remain perturbation-dominated** (0.28–7.14) — the 8-seed pilot was the right size: it caught both misses without confirm spend. Fast kills are throughput.

## Convergence state

food-economy: **killed-at-pilot** (overdrawfloor). The named next of the killed overdraw4: 3-day floor + fragility gate (223 holds) weakened the rot mechanism (0.884 vs 0.503, primary bar 0.85 missed) without closing the starvation channel (1→8, belong-concentrated 1→7, guardrail ≤ 3 breached). Per §14, NO-GO. The fresh-first drawdown lineage is now 3× measured and 2× killed on the starvation guardrail — the next arm must instrument the belong-road feast verb directly (its only drawdown verb on that road), not add more gates. prodthrottle (landed) remains the only landed rot lever. The feast-as-table-door secondary is 6× replicated (already claimed #226).
