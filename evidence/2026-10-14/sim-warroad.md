# ARM "warroad" — the kill-road Standing drive vs the diplomacy road (r33 counter-arm)

Worktree: `~/workspace/worktrees/sim-warroad`. Run: oversight-flesh-out-loop, ARM 2 of the scale-onramp run (lever-8 lens), 2026-10-14.

## Context
r33 (evidence/2026-10-14/sim-proposelayer-r33.md) closed the propose verb gap — 24 links, 7/8 regional, 1 national staged — but the diplomacy road to wave 4 (Standing ≥ 100 via 3 seasoned links, dip=102) unlocks wave 4 WITHOUT selecting for military readiness, and wave-4 monsters killed the diplomats: median survival 149→109, NO-GO at pilot, layer killed. This arm asks the r33 headline question directly: **is war-gated wave 4 survivable where diplomacy-gated wave 4 kills?** The war road fills the SAME Standing bar via the ledger war lane (+25 per wave-3+ kill point, per-type cap 2 — src/js/standing.js), so wave 4 unlocks only AFTER the village has banked real wave-3 kills: readiness-selected by construction.

## The lever (policy-side, no game-code changes)
- **CONTROL (diplomacy road):** competent + proposelayer (PROPOSELAYER=1) — rebuilt 2026-10-14 from the r33 spec for the control side only (the r33 file was deleted per kill protocol; the rebuild passes r33's own proof 11/11 GREEN and reproduces r33's per-seed outcomes exactly — det-gate table below). Composition on leadcourt's leadCourtship verb bundle.
- **ARMED (war road):** competent + warroad (WARROAD=1) — NO courtship verbs, NO propose layer. The war drive reuses courtkill's engine-honest hunt machinery (deliberate thicket/ruin expeditions via real travelTo + real checkEncounter, detail-grid engagement of visible wave-3 monsters, committed attrition fights holding to 12% HP — the r16 dmgmath finding) on a competent base, with the hunt standing down once 4 wave-3 ledger points are banked. Villager kills score the ledger exactly like the player's (VILLAGER XP LAW) — the policy hunts alongside its villagers.
- Same code tree, identical seeds, env-var only.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis**: scale-onramp (the wall), lever-8 lens.
- **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 150d death-aware (dead villages stop; +10d tail max).
- **PRIMARY**: villages alive at d+30 post-wave-4-unlock ≥ control AND wave-4 unlocks ≥ control−1.
- **GUARDRAILS**: median survival ≥ control−10d; national ≥ control−2; no new death mode (cause-FAMILY level per r33 metric review #1: strip the player:/villager: prefix, named monsters → the `monster` family).
- **Gates before spend**: proof tests scripts/test-warroad-20261014.js + scripts/test-proposelayer-20261014.js REAL RED→GREEN; det-gates 8/8 IDENTICAL both sides; SMOKE=1 instrument-honesty gate both sides.
- **GO**: primary met at pilot → confirm 12–16 seeds before calling GO. A miss is NO-GO, never re-scored.

## Gates (all green before spend)
- **Proof warroad**: REAL RED on pristine (exit 1 — R1 armed-identity fails; R2 gate-off export IS the competent object, reference-equal — byte-identical by construction; R3 zero hunt legs on the wave-3-unlocked fixture) → GREEN 6/6 when armed (G1 identity; G2 hunt leg fires on the wave-3-unlocked fixture through the real engine — hunts=1, 2 travelTo legs; G3 the rung stands down at 4 banked wave-3 points; G4 competent pinned; G5 fight() fail-closed; G6 zero proposeLink/tendLink references — pure kill road).
- **Proof proposelayer** (rebuild): REAL RED on pristine (exit 1) → GREEN 11/11 (identical fixtures to r33 — propose fires, cooldown holds, all guards hold, counter answered to the real subordinate link).
- **Det-gate warroad** (WARROAD=1): 8/8 IDENTICAL (16/16 runs, 150d).
- **Det-gate proposelayer** (PROPOSELAYER=1): 8/8 IDENTICAL — and the rebuild reproduces r33's exact per-seed outcomes (s11 86/village-lost, s55 109/village-lost, s88 80/village-dead), behavioral identity confirmed.
- **SMOKE=1** sweep gates: both sides.

## Pilot (8 seeds × 150d, identical seeds) — RESULTS

| seed | control (diplomacy road) d/end | w4day | driver | armed (war road) d/end | w4day | war pts |
|---|---|---|---|---|---|---|
| 11 | 86/village-lost | 62 | diplomacy | 150/survived | – | 0 |
| 22 | 150/survived | – | none | 150/survived | – | 3 |
| 33 | 37/village-lost | – | none | 35/village-lost | – | 0 |
| 44 | 150/survived | 58 | diplomacy | 150/survived | – | 0 |
| 55 | 109/village-lost | 57 | diplomacy | 140/village-lost | – | 1 |
| 66 | 150/survived | 79 | diplomacy | 115/village-lost | – | 2 |
| 77 | 88/village-lost | 57 | diplomacy | 78/village-lost | – | 0 |
| 88 | 80/village-dead | 57 | diplomacy | 51/village-lost | – | 0 |

Suite: wave-4 unlocks 6/8 → **0/8**; alive-at-d+30-post-unlock 4/8 → **0/8**; median survival 109 → **140**; national 0 → 0; table/wins 0/8 both; wave-5 0/8 both; starvation deaths 9 → 6; hungryDays 6 → 5; exiled 0 → 0; links formed 24 → 0; hunts 0 → 53 (280 committed wave-3 fight-turns).

**VERDICT: KILLED AT PILOT.** PRIMARY MISSED on the unlock prong (0 ≥ 6−1 false). Guardrails: median survival HOLDS (140 ≥ 109−10); national HOLDS (0 ≥ 0−2); no-new-death-mode **MISS** at the pre-registered family level (armed-only families: `dehydration`, `thirst`, `the expedition` — see metric review). Per §14 the miss is NO-GO, never re-scored. Both policy files deleted per kill protocol; proof + det-gates + sweep + evidence + per-seed JSONs kept.

## Why it missed (honest diagnosis — the run's real finding)
The war drive works exactly as designed — that is the problem. 53 deliberate wave-3 hunts and 280 committed fight-turns banked at most 3 wave-3 ledger points (s22: 17 hunts, 211 fight-turns, 3 pts — the same 3 competent banks organically on the same seed without hunting). The 4-point rung never clears on any seed. Wave-3 monsters are 240–420 HP attrition fights; the scholar wins them rarely, and the per-type cap of 2 means four kills across ≥2 types. **The war lane to Standing 100 is unreachable by hunting within a 150-day life** — the readiness selection is so strict it is a second wall.

So the r33 question — "is war-gated wave 4 survivable where diplomacy-gated wave 4 kills?" — proves **unanswerable as posed: the gate never opens**. Under the flexible-route Standing gate the war road is decorative; the diplomacy road is the only working road, and r33 proved it lethal (this run's control reproduces it: wave-4 unlocks at d57–79 on 6/8 seeds, driver=diplomacy on all six; s11's transcript shows The Eater one-rounding villagers — "💀 The Eater killed Hank in 1 round. The village mourns." — two days after the unlock wave arrives). **No survivable road to wave 4 exists in these sims**: diplomacy unlocks it and kills you; war never unlocks it. (The plenty road — +20/major feast — is loop B's territory, untested here.)

Side findings from the control rebuild: the r33 control was reproduced behaviorally identically (det-gate per-seed outcomes match r33's table exactly — s11 86, s55 109, s88 80). s66's control village survived wave-4 contact to 150 and reached rank=global with endStanding 152 (war=50, dip=102) — the diplomacy road is not certain death; s44/s66 both survived their unlocks. And s22's control banked 3 war points organically — the war lane's best seed is the same with or without the hunt drive.

## SENSE-TESTING (wave-4 fights on the diplomacy road — judgment, not counts)
Control s11, d70–86: the wave-4 arrival reads as an invasion, not a difficulty bump. A 5-raider night raid (White Noise, **The Eater**, The Ugly Beast, Nevermore, Glasswing Darter) hits Haven; then The Eater gorges on the fields ("+0 damage growth. (Hank should have poisoned the meal.)" — the engine narrating the counterfactual defense) and kills Hank and Ibrahim **one round each**, two days running. The Reunion "followed you" and paces the boundary, unwilling while something else is already there; The Audit arrives d83. The village that unlocked wave 4 through three seasoned friendships meets monsters that kill a villager per round. **The readiness gap is visible in the transcript, not just the numbers.** The war road's readiness never shows up in a wave-4 fight because the war road never reaches one — the transcript absence is the finding.

The armed villages read as competent villages that go to war and never come home to scale: rank stays `village` on 8/8, deaths are attritional combat (villager:combat dominant), no scale beats fire at all. s22 armed is the poignant one — 150 days, 17 hunts, 211 wave-3 fight-turns, 3 points banked, Standing 75, wave 4 never unlocked: a village that fought the whole game and was never noticed by the System.

## Village assessment (plain words)
The control villages court and climb: three proposals ~day 25, three fires answer, the network dawns ~day 46, the diplomacy bar fills to 102, and wave 4 unlocks at day ~60 as the System's response to their standing — then the Mirror Draft arrives and four of the six unlocking villages die 20–50 days early, picked apart a villager per round by monsters built out of *us*. s66 is the exception that proves the rule: it survived to 150 and reached global rank, the only village in either arm to hold wave-4 contact and live — readiness, in that one seed, came from two organic wave-3 kills (war=50) stacked under the diplomacy bar.

The armed villages hunt and bleed: no links, no court, no dawn — just the scholar walking into thickets every third day from day 25, fighting wave-3 monsters in 4–6 round attritions, banking a point here and there (1 on s55, 2 on s66, 3 on s22), dying of ordinary combat attrition at a median of 140 days — thirty days *longer* than the diplomats, because nothing they do unlocks anything. The missing capability is not courage or kills — the hunt drive delivered both. It is that **the war lane's price (4 wave-3 kills) exceeds what a 150-day village can pay**, while the diplomacy lane's price (3 friendships) is payable by day 60 and comes due in blood.

## Reachable / fun / winnable (the war road, competent + warroad)
- **Reachable:** NO for wave 4 via war — 0/8 unlocks with a dedicated hunt drive. The war lane as currently tuned (25/point, 4 points) is decoration.
- **Fun:** the hunts play — committed attrition fights, real engagements — but they lead nowhere on the scale axis. A road that cannot arrive is not a road.
- **Winnable:** 0/8 national, 0/8 table, 0/8 wins, both arms. The wall stands.

## Metric review (§14 — for the NEXT run, not this one)
1. **The primary's question proved unanswerable as posed.** "Villages alive at d+30 post-wave-4-unlock ≥ control" assumed the armed side would unlock. A war-road follow-up should pre-register war-lane reachability instead: wave-3 points banked (or Standing-war at day 150) vs the 4-point bar — the metric that actually discriminates the drive. This run's data already answers it: max 3.
2. **The no-new-death-mode family guardrail is fragile at n=8 for singletons.** The armed-only families are `dehydration` + `thirst` (one event each, both on s33 — the seed that dies at d35–37 on both arms regardless, an early-game water crisis, not a hunt artifact) and `the expedition` (one player death on s77). A count or seed-count threshold (e.g. ≥2 events, or present on a surviving seed) would keep the guardrail from firing on noise. This run stays NO-GO on the pre-registered rule regardless — the primary miss stands.
3. **Cause-key duplication:** the instrument emits both `villager:combat` and `villager:villager combat` (the cause string itself is "villager combat" on some paths); the family mapper treats them as separate families. Both sides emit both, so the comparison is fair, but a future pass should normalize "villager combat" → "combat".
4. **alive30post worked cleanly** as an instrument (wave4Day from the standing trajectory + days ≥ wave4Day+30; no censoring occurred — no seed unlocked after day 120). Keep it.
5. **The median-survival guardrail held and told the truth again:** 140 ≥ 99 — the war road is genuinely less lethal than the diplomacy road, because it never unlocks the thing that kills. A lever can win survival by failing to arrive; the primary exists to catch exactly that.

## Blanks (filled / documented)
1. **WAR LANE TO STANDING 100 UNREACHABLE BY HUNTING (this run's headline — filled):** 53 deliberate hunts + 280 committed wave-3 fight-turns banked max 3 points; the 4-point rung (per-type cap 2) never clears in 150d. src/js/standing.js marks warPerKill=25 a "sim starting point, not canon — tune on measured evidence": this is the measurement. Tuning directions (design call, not this run): raise warPerKill, lower the 4-point bar, count hybrid paths more generously, or make wave-3 kills more convertible. Appended to hidden_files/sim-findings.md as [open].
2. **NO SURVIVABLE ROAD TO WAVE 4 (documented):** diplomacy unlocks and kills (r33 + this control); war never unlocks (this arm); plenty untested here (loop B territory). The wall's current face is the Standing-gate tuning, not any single road.
3. **s66 control survived wave-4 contact to 150 and reached global** — the only such village observed. What distinguished it (2 organic wave-3 kills under the diplomacy bar, war=50) is a hybrid-road hint worth an arm: diplomacy + a little war may be the survivable path. Documented, not built.

## Convergence
scale-onramp: CONVERGING (unchanged). The war road does not move the axis — it never reaches the gate. The axis moves when a road reaches wave 4 AND holds it; the current evidence says no road does both.

## Wall numbers (this run, 8 seeds × 150d, identical seeds)
national 0/8 both arms · table 0/8 · wins 0/8 · wave-4 unlocks 6/8 control (all diplomacy-driven) / 0/8 armed · wave-5 0/8 · median survival 109 control / 140 armed · maxStanding 152 control / 75 armed.

## Files
- `scripts/policies/proposelayer.js` — DELETED per kill protocol (r33 rebuild; behaviorally identical, proven by 11/11 proof + exact det-gate outcome match).
- `scripts/policies/warroad.js` — DELETED per kill protocol (the killed arm; no trace).
- `scripts/test-warroad-20261014.js` — proof, REAL RED (exit 1) → GREEN 6/6 (kept).
- `scripts/test-proposelayer-20261014.js` — proof, REAL RED (exit 1) → GREEN 11/11 (kept; pre-existing from r33, re-verified on the rebuild).
- `scripts/det-gate-warroad-20261014.js` — det-gate 8/8 IDENTICAL, 150d (kept).
- `scripts/det-gate-proposelayer-20261014.js` — det-gate 8/8 IDENTICAL, 150d (kept; pre-existing, re-verified).
- `scripts/sweep-warroad-20261014.js` — pilot sweep + SMOKE=1 gates + COMPARE=1 verdict (kept).
- `evidence/2026-10-14/sim-warroad-control.json`, `sim-warroad-armed.json` — per-seed evidence rows (kept; rows carry linkpipe, fc/starveDays, sr/scale, standing incl. wave4Day/driver/atT4/traj, deathCauses, side counters, lines transcript material).
- `evidence/2026-10-14/sim-warroad.md` — this file.
- Telemetry note for the coordinator: per-seed JSONs above are the telemetry-check inputs (national, table, wins, exiled per-row fields present). No telemetry-check run by this worker — coordinator owns the baseline roll per the r33 convention.

## Results pending
~~## Pilot (8 seeds × 150d, identical seeds) — RESULTS PENDING~~ — superseded by the results above.
