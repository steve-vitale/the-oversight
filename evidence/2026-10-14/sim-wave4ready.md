# ARM "wave4ready" — the READINESS DOCTRINE: a readiness-gated diplomacy road to wave 4

Worktree: `~/workspace/worktrees/sim-wave4ready`. Run: oversight-flesh-out-loop, ARM 2 of run fleshout-a-2026-10-14-2315 (scale-onramp, lever-8 lens), 2026-10-14.

## Context
Claims sim-findings #208 (OPEN): DIPLOMACY ROAD TO WAVE 4 IS LETHAL. The proposelayer arm (r33, KILLED AT PILOT) closed the propose verb gap — 24/24 proposals adjudicated, 7/8 regional dawns, 1 national court staged — but 3 seasoned links = 102 diplomacy ≥ the 100 wave-4 bar → wave 4 unlocked day 57–62 on 6/8 seeds via DIPLOMACY, not war → wave-4 monsters killed the diplomats (s11 150→86d, s55 149→109d, s77 78→88d, s88 national at d76 then village-dead d80; median survival 149→109). The war road selects for military readiness; the diplomacy road unlocks the wave without it. The warroad counter-arm (r33b, KILLED AT PILOT) then proved the war lane unreachable by hunting (0/8 unlocks, max 3/4 points on 53 hunts + 280 fight-turns) — and its metric review #5 named the trap this arm must not fall into: **"a lever can win survival by failing to arrive."**

This arm tests the readiness-gated diplomacy road: the POLICY (player-strategy form — no game-code changes, no wave-4 bar change; the bar is canon, not mine to tune) holds the diplomacy bar below 100 — deferring the 3rd-link proposal and holding the 3rd link at arm's length (no tend) — until the village is COMBAT-READY, then crosses. Delayed, not prevented. The primary REQUIRES the crossing (the warroad-trap guard).

## The lever (policy-side, no game-code changes)
- **CONTROL (the diplomacy road):** competent + proposelayer (PROPOSELAYER=1) — rebuilt 2026-10-14 from the r33 spec (the r33 and warroad policy files were both deleted per kill protocol; the rebuild passes r33's own proof 11/11 GREEN and reproduces r33's per-seed outcomes — det-gate table below). Composition on leadcourt's leadCourtship verb bundle.
- **ARMED (the readiness road):** competent + proposelayer + wave4ready (PROPOSELAYER=1 + WAVE4READY=1) — the same courtship pass with a READINESS GATE on the 3rd link: while the village is not combat-ready, proposals cap at 2 active subordinates (no 3rd proposal) and the tend verb skips any 3rd+ subordinate link (it can never season). Once ready, the 3rd proposal fires, the tend-hold lifts, the link seasons on the normal ~30d clock, and the diplomacy bar crosses 100 on the polity — later, not never.
- Same code tree, identical seeds, env-var only. Same substrate, same road (sim-findings #230/#231 same-road constraint).

## Combat-readiness — defined from the code (documented here, not tuned mid-run)
A village the policy judges ready to face what the diplomacy bar wakes. All three must hold, measured live from engine state each day via `combatReady(Game)` in scripts/policies/wave4ready.js:
- **R1 — the scholar can take a hit:** `S.equipment.armorOf(scholar, Game.data.items)` ≥ 20. The armor model's documented halving point (r = P/(P+20) → 0.5 at P=20; AGENTS.md "ARMOR MODEL" 2026-10-09). Against wave-4 bands (damage 35–95, pierce 0.2–0.5; docs/MONSTER-WAVES.md), P=20 halves every landed hit. Code: src/js/equipment.js `armorOf` (pieces + coordination, or set).
- **R2 — the village can field fighters:** ≥ 3 living roster villagers with a real melee weapon equipped (`S.equipment.weaponBonusOf(v, Game.data.items, 'melee')` > 0). The village is the protagonist (MEMORY.md; VILLAGER XP LAW) — one armed hero is not readiness.
- **R3 — the village has drawn blood that matters:** wave-3+ ledger kill points ≥ 1 (`Game.villageStanding().warPts` ≥ 1 — player AND villager kills score, standing_villager_kills_count). The war lane's selection pressure in miniature; the s66 hint (warroad control: war=50 = 2 pts under the diplomacy bar — the only village to survive wave-4 contact to 150 and reach global).

READY = R1 ∧ R2 ∧ R3. Fail-closed: any measurement error reads not-ready (the doctrine holds rather than crosses on a broken instrument). The bar is a DESIGN choice, pre-registered here — it is NOT re-fitted mid-run. If the bar proves unreachable, the primary (which requires ≥5/8 crossings) fails honestly and the arm kills.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis**: scale-onramp (the wall), lever-8 lens. Same code tree, identical seeds, env-var only.
- **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 150d death-aware (dead villages stop; +10d tail max).
- **PRIMARY**: armed wave-4 unlocks ≥ control−1 AND armed median survival ≥ control+5d. (Delayed, not prevented — the warroad-trap guard: survival won by never arriving fails the unlock prong.)
- **GUARDRAILS**: national ≥ control−1; no new death mode (cause-FAMILY level per r33 metric review #1: strip the `player:`/`villager:` prefix, named monsters → the `monster` family); starvation deaths ≤ control+9 (proposelayer A/A p90abs).
- **Gates before spend**: proof test scripts/test-wave4ready-20261014.js REAL RED→GREEN (readiness gate holds below 100 pre-ready, releases post-ready — including the never-ready edge); proposelayer rebuild re-verified on r33's proof 11/11 + det-gate reproducing r33's per-seed outcomes; det-gates 8/8 IDENTICAL both sides; SMOKE=1 instrument-honesty gates both sides.
- **GO**: primary met at pilot → confirm 12–16 seeds before calling GO. A miss is NO-GO per §14 — never re-scored, never re-fitted.

## Gates (all green before spend)
- **Proof wave4ready** `scripts/test-wave4ready-20261014.js`: REAL RED on pristine (exit 1 — R1 armed-identity fails; R2 gate-off export IS the proposelayer export, reference-equal; R3 zero proposeLink fires under the inert export) → GREEN 12/12 when armed (G1 identity; G2 gate HOLDS the 3rd proposal while not-ready; G3 gate RELEASES once ready; G4a tend holds the 3rd+ link at arm's length — tends the 2 oldest — while not-ready; G4b hold lifts when ready; G5 the never-ready edge — 60 days of held passes on 2 real links: 0 proposeLink calls, subs stay 2, Standing 0 < 100; G6 combatReady unit checks — each signal necessary, all three sufficient: hide_armor P=20 + 3 stone_knife villagers + 1 redactor kill → ready).
- **Proof proposelayer** (rebuild) `scripts/test-proposelayer-20261014.js`: REAL RED on pristine (exit 1) → GREEN 11/11 (identical fixtures to r33 — propose fires, cooldown holds, all guards hold, counter answered to the real subordinate link, tend/accord/national delegated).
- **Det-gate proposelayer** (PROPOSELAYER=1): 8/8 IDENTICAL (16/16 runs, 150d).
- **Det-gate wave4ready** (PROPOSELAYER=1 + WAVE4READY=1): 8/8 IDENTICAL (16/16 runs, 150d) — before/after comparisons trustworthy.
- **SMOKE=1** sweep gates: control side 5/5 (policy unwrapped, harness invokes daily 4.8/d, 2272 policy acts/15d; courtshipPass fires the real proposeLink on the window fixture); armed side 6/6 (+ gate HOLDS the 3rd proposal while not-ready on the 2-sub fixture — signals P0/a4/w0 — and RELEASES once ready with all three signals rigged).

## Pilot (8 seeds × 150d, identical seeds) — RESULTS

| seed | control (diplomacy road) d/end | w4day | driver | ready | armed (readiness road) d/end | w4day | driver | ready |
|---|---|---|---|---|---|---|---|---|
| 11 | 150/survived | 89 | diplomacy | – | 150/survived | – | none | – |
| 22 | 138/village-lost | 98 | diplomacy | d88 | 144/village-lost | 132 | **war** | d102 |
| 33 | 129/village-lost | 95 | diplomacy | – | 150/survived | – | none | – |
| 44 | 116/village-lost | 58 | diplomacy | – | 150/survived | – | none | d142 |
| 55 | 93/village-lost | – | none | – | 93/village-lost | – | none | – |
| 66 | 110/village-lost | 80 | diplomacy | – | 133/village-lost | – | none | – |
| 77 | 97/village-lost | 57 | diplomacy | d65 | 55/village-lost | – | none | – |
| 88 | 75/village-lost | 58 | diplomacy | d70 | 150/survived | – | none | d127 |

Suite: wave-4 unlocks 7/8 → **1/8**; alive-at-d+30-post-unlock n/a (primary used unlocks); median survival 116 → **150**; national 0 → 0; table/wins 0/8 both; wave-5 0/8 both; wave4faced 6 → 1; maxStanding 152 → 100; starvation deaths 4 → 4; hungryDays 3 → 4; exiled 1 → 1; links formed 24 → 20; links seasoned 21 → 14; regional+ by d120: 7 → 7.

**VERDICT: KILLED AT PILOT.** PRIMARY MISSED on the unlock prong (1 ≥ 7−1 = 6 is false; the median prong held: 150 ≥ 116+5). Guardrails: national HOLDS (0 ≥ 0−1); no-new-death-mode HOLDS (armed families ⊆ control families at the cause-family level); starvation HOLDS (4 ≤ 4+9). Per §14 the miss is NO-GO, never re-scored. Both policy files deleted per kill protocol; proof + det-gates + sweep + evidence + per-seed JSONs kept as instruments.

## Why it missed (honest diagnosis — the run's real finding)
The doctrine works exactly as designed — that is the problem. The readiness bar (R1∧R2∧R3, simultaneous) is reachable on only 3/8 seeds and late:
- Control counterfactual: s22 d88, s77 d65, s88 d70 reached ready — but s77/s88 unlocked wave 4 BEFORE becoming ready (d57/d58 unlocks vs d65/d70 readiness). The lethal pattern, confirmed: the diplomacy road unlocks before the village is ready.
- Armed: s22 d102, s44 d142, s88 d127 reached ready. s22 is the only crossing — and it crossed via the WAR lane (w=100 at d132), not diplomacy: the 3rd link, proposed after readiness at d102, never seasoned in the remaining 42 days. s44 (ready d142) and s88 (ready d127) formed their 3rd links too late to season by day 150.
- The simultaneity requirement is the binding constraint: s11 and s66 hit all three signal maxima (P40/a6/w1, P35/a5/w1) but never ON THE SAME DAY — armor peaks late, war points bank early, armed-villager counts fluctuate with deaths. The bar as designed is a coincidence detector, not a readiness detector.
- s33 armed is the doctrine's clean win: never ready (warPts=0 all run — the village never drew blood), never unlocked, survived 150 (control died at 129 post-unlock). s88 armed likewise: ready d127, survived 150 vs control dead at 75. The doctrine buys survival by preventing the crossing — the warroad trap in reverse ("a lever can win survival by failing to arrive" — here it wins survival by never arriving, and the primary's unlock prong catches exactly that).

So: the readiness doctrine is a real survival lever (median 116→150) but NOT a wave-4 road — it gates the diplomacy crossing behind a bar almost no village meets in time, and the one village that did cross did so via war anyway. The diplomacy road stays lethal-or-absent: ungated it kills (control: 7/8 unlocks, 6/8 faced wave-4 monsters, median 116); gated it never arrives (armed: 1/8 unlocks, median 150).

## SENSE-TESTING (armed s88 + s22 — judgment, not counts)
- s88 armed (survived 150, ready d127, no unlock): the held village reads as a living courtship — "🌾 Haven sends 1,671 kcal of grain to Emberhold's fire — not tribute, the other way around. Someone's grandmother over there will remember who fed her. (Trust +8.)" alongside incoming tribute (2,250 kcal from Emberhold, 4,000 from Stonebridge). Three subordinate bonds tended weekly, tribute flowing both directions, the village alive at day 150. The doctrine is invisible in the fiction (correct — it's a policy, not engine text); what shows is a village that courts, tends, and lives. No robotic repetition, no incoherence.
- s22 armed (ready d102, war-unlock d132, died d144): the transcript around the unlock shows the village fighting, not courting — wave-4 contact arrives through the war lane the village earned (w=100 = 4 kill points). The readiness signals were real (P40/a7/w4 at peak — the strongest village in either arm).
- s77 armed (died d55): early-game attrition (sickness/combat/starvation), no wave-4 contact, warPts=0 — seed noise in the early game, not a doctrine harm. The death-family guardrail confirms: no new mode.

**PASS** on meaning and coherence. The layer added no fiction; every line is engine text the policy's verbs earned.

## Village assessment (plain words)
The control villages court and climb and die on schedule: three proposals ~day 25, three fires answer, the diplomacy bar fills to 102, wave 4 unlocks at day ~60–98 as the System's response to their standing — then the Mirror Draft arrives and the villages bleed out through wave-4 combat (median 116 days). s11 is the outlier that lived: 5 links, national rank, 150 days, wave-4 unlocked at day 89 — the diplomacy road is not certain death, but 6 of 7 unlocking villages faced the wave and the median says what it says.

The armed villages hold the third bond at arm's length and live: two links tended, the third proposal deferred, the diplomacy bar pinned at 0. They survive (median 150 — every armed village either lived the full 150 or died of ordinary causes), but they never cross — the readiness bar arrives at day 102+ on the three seeds that ever meet it, and the 30-day seasoning clock runs out the 150-day horizon. s22 is the exception that proves the rule: it became ready at day 102 through fighting (not courtship), and the WAR lane — not the gated diplomacy lane — carried it to wave 4 at day 132. The missing capability is not patience or food — it is that **the readiness bar measures a coincidence (three signals peaking together) rather than a trajectory**, and the diplomacy road's 30-day seasoning clock doesn't wait for coincidences.

## Reachable / fun / winnable (the readiness road)
- **Reachable:** NO for wave 4 via gated diplomacy — 0/8 diplomacy crossings (the 1 unlock was the war lane). The gate holds; the release comes too late.
- **Fun:** the held villages play — courtship, tending, tribute, 150-day lives. But a road that cannot arrive is not a road (warroad's verdict, repeated).
- **Winnable:** 0/8 national held, 0/8 table, 0/8 wins, both arms. The wall stands.

## Metric review (§14 — for the NEXT run, not this one)
1. **The primary's unlock prong did its job.** 1 ≥ 6 false — the doctrine prevented rather than delayed, and the pre-registered bar caught it. The warroad-trap guard ("survival won by failing to arrive") fired exactly as designed. A future readiness arm must pre-register a REACHABILITY pre-check on the bar (e.g. ≥5/8 seeds reach ready by day ~110 on the armed trajectories) or design the bar as a trajectory (e.g. 2-of-3 signals, or readiness sustained N days) rather than a simultaneous conjunction.
2. **The median prong held (150 ≥ 121) and told the truth:** the doctrine genuinely buys survival — but survival without arrival is the trap, not the goal. The conjunction was the right call.
3. **The control did not reproduce r33's per-seed outcomes** (s11 86→150, s55 109→93, s88 80→75) — master drift between the warroad run and this run (game-code commits landed in between), not a rebuild bug: the rebuild passes r33's proof 11/11 GREEN, both det-gates are 8/8 IDENTICAL, and the control reproduces the r33 MECHANISM exactly (diplomacy-driven unlocks at 3 seasoned links, driver=diplomacy on 7/7 unlocking seeds). Paired identical-seed comparison on the same master is what the pre-reg requires; historical outcome reproduction is not.
4. **The readyDays counterfactual on the control side worked as an instrument** — s77/s88's "ready AFTER unlock" (d65/d70 vs d57/d58) is the lethal pattern measured, not argued. Keep it.
5. **Cause-family guardrail held cleanly** (armed ⊆ control) — the r33 metric-review #1 family comparison is now routine. The s77 armed early death (55 vs 97) is seed noise inside the same families, not a new mode.

## Blanks (filled / documented)
1. **READINESS-GATED DIPLOMACY PREVENTS RATHER THAN DELAYS (this run's headline — filled):** the R1∧R2∧R3 simultaneous bar is reachable on 3/8 seeds, late (d102+); the 30-day seasoning clock then runs out the horizon — 0/8 diplomacy crossings. The doctrine buys survival (median 116→150) but is not a wave-4 road. Design directions (Steve's call): a trajectory bar (2-of-3, or sustained-readiness), a shorter seasoning clock for the held link, or readiness that the climb itself builds (the s22 hint: fighting readiness came from the war lane the doctrine didn't gate). Appended to hidden_files/sim-findings.md as [open].
2. **THE HYBRID ROAD APPEARS AGAIN (documented):** s22 armed — ready d102 via fighting (P40/a7/w4), wave-4 via WAR at d132, died d144. The warroad evidence's s66 hint (war=50 under the diplomacy bar survived to 150 + global) now has company: villages that fight AND court reach wave 4 through the war lane with the courtship intact. The sibling sim-hybridroad arm is testing exactly this — coordinate, don't duplicate.
3. **Control-side readyDays show the lethal pattern directly:** s77/s88 became "ready" (d65/d70) only AFTER their diplomacy unlocks (d57/d58). If the bar had been a trajectory rather than a gate, these villages would have been the test cases. Documented for the next readiness-arm design.

## Convergence
scale-onramp: CONVERGING (unchanged). The readiness doctrine does not move the axis — it trades the diplomacy road's lethality for its absence (median +34d, unlocks 7→1). The axis moves when a road reaches wave 4 AND holds it; the current evidence says no road does both (warroad: war never unlocks; r33: diplomacy unlocks and kills; this arm: gated diplomacy never arrives; the hybrid road — sim-hybridroad, sibling arm — is the remaining candidate).

## Wall numbers (this run, 8 seeds × 150d, identical seeds)
national 0/8 both arms · table 0/8 · wins 0/8 · wave-4 unlocks 7/8 control (all diplomacy-driven, d57–98) / 1/8 armed (war-driven, d132) · wave-4 faced 6/8 control / 1/8 armed · wave-5 0/8 · median survival 116 control / 150 armed · maxStanding 152 control / 100 armed · exiled 1/8 both.

## Files
- `scripts/policies/wave4ready.js` — DELETED per kill protocol (the arm's layer; no trace).
- `scripts/policies/proposelayer.js` — DELETED per kill protocol (the control-side r33 rebuild; no trace).
- `scripts/test-wave4ready-20261014.js` — proof, REAL RED (exit 1) → GREEN 12/12 (kept; INFO-SKIPs on the landed tree).
- `scripts/test-proposelayer-20261014.js` — proof, REAL RED (exit 1) → GREEN 11/11 on the rebuild (kept; INFO-SKIPs on the landed tree).
- `scripts/det-gate-wave4ready-20261014.js` — det-gate 8/8 IDENTICAL, 150d (kept; INFO-SKIPs on the landed tree).
- `scripts/det-gate-proposelayer-20261014.js` — det-gate 8/8 IDENTICAL, 150d (kept; INFO-SKIPs on the landed tree).
- `scripts/sweep-wave4ready-20261014.js` — pilot sweep + SMOKE=1 gates + COMPARE=1 verdict (kept; INFO-SKIPs on the landed tree).
- `evidence/2026-10-14/sim-wave4ready-control.json`, `sim-wave4ready-armed.json` — per-seed evidence rows (kept; rows carry linkpipe, fc/starveDays, sr/scale, tune/standing incl. wave4Day/driver/atT4, deathCauses, side counters, readiness trajectory {firstReadyDay, maxArmorP, maxArmed, maxWarPts}, lines transcript material).
- `evidence/2026-10-14/sim-wave4ready.md` — this file.
- Telemetry note for the coordinator: per-seed JSONs above are the telemetry-check inputs (national, table, wins, exiled per-row fields present). No telemetry-check run by this worker — coordinator owns the baseline roll per the r33/warroad convention.
