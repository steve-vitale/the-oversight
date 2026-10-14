# ARM — Dinner-reserve cut (game-code, food-economy) — 2026-10-13

Run: oversight-flesh-out-loop-b 2026-10-14T00:31:37Z, worker arm (dinreserve), worktree sim-dinres.
Axis: FOOD-ECONOMY (loop A owns scale-onramp this run; claim file 2026-10-14T00:31:37Z.json covers 3 arms: dinreserve / prodthrottle / mealname).
Sibling arms live in sim-prodthr and sim-mealname — non-overlap honored (game.js edit only in the duty-time cook drive reserve constant; no corpses.js, app.js, teaching, gossip-link, fieldFights/kill-attribution, standing.js, or loop-A policy files touched).

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14)
- **Primary metric:** fresh-rot share = rot:fresh / (rot:fresh + rot:preserved), in percentage points, summed over the suite (rebuilt from the killed preservedrive arm's methodology — hidden_files/food-r18-preservedrive-evidence.md; its scripts did not survive in the tree).
- **GO threshold:** fresh-rot share −10pp vs identical-seed baseline AND median survival within ±10d AND median starveDays delta ≤ +1. No preserved-rot laundering.
- **KILL conditions:** rot share moves <5pp | median survival regresses >10d | any arm-attributable preserved-rot laundering (smoking a spoiled item).
- **Horizon:** 180d death-aware (pacing-law max; runDays stops on death; the wall suite dies early).
- **Seeds:** 11/22/33/44/55/66/77/88 × leadcourt + belongseek = 16 runs per side, IDENTICAL seeds both sides.
- **Opt-in gates:** all OFF — pristine parity for baseline.
- **Convergence state at plan:** food-economy = converging; scale-onramp = blocking (loop A).

## The lever (docs/PRESERVATION.md canon; game.js duty-time cook drive ONLY)
The village cook's duty-time smoke-racks drive (resolveOneAssignment, 'cook' task) keeps `reserve = 250 * roster` kcal of soonest-spoiling fresh as the dinner reserve. Measured pantry draw is ~125/person/night (~1.5k/night for 12) — the reserve was ~2x the real draw, so the reserve itself rotted while the drive smoked blind 0.80x around it (killed preservedrive arm's diagnosis). The lever: reserve 250→125 kcal/person, one-line-class change (make-the-call: 125 = one night of the ACTUAL draw; documented for Steve's overrule). Racks-full guard, eligibility window, rates, and budget all unchanged. Canon: dinner-first still holds — one real night, not two.

## Proof test
scripts/test-dinreserve-20261013.js — REAL RED on pristine (crafted pantry: 3,000 kcal near-expiry fresh + one spoiled stack, roster 12; pristine keeps the whole pile fresh, dutyPreserved=400 < 1000 threshold → FAIL), GREEN after (dutyPreserved=1600 → PASS). Invariants hold both sides: no spoiled stack smoked (0 laundered), cook narration still fires ("cooked for the haven"). Node harness: full src/js list in index.html order, Math.random seeded before eval, Game.save never stubbed.

## Baseline (pristine, 16 runs, 180d death-aware)
| policy | seed | days | end | rank | wave | rotF(k) | rotP(k) | duty(k) | starveD | launder |
|---|---|---|---|---|---|---|---|---|---|---|
| leadcourt | 11 | 61 | village-lost | regional | 4 | 156 | 0 | 115 | 24 | 0 |
| leadcourt | 22 | 34 | village-lost | village | 2 | 22 | 0 | 17 | 5 | 0 |
| leadcourt | 33 | 45 | village-lost | village | 2 | 188 | 0 | 19 | 27 | 0 |
| leadcourt | 44 | 78 | village-lost | global | 4 | 120 | 2 | 78 | 18 | 0 |
| leadcourt | 55 | 88 | village-lost | national | 4 | 531 | 37 | 77 | 13 | 0 |
| leadcourt | 66 | 37 | village-lost | village | 2 | 4 | 0 | 8 | 12 | 0 |
| leadcourt | 77 | 87 | village-lost | national | 4 | 433 | 46 | 76 | 18 | 0 |
| leadcourt | 88 | 65 | village-lost | regional | 4 | 76 | 19 | 38 | 19 | 0 |
| belongseek | 11 | 49 | village-lost | regional | 2 | 180 | 0 | 96 | 25 | 0 |
| belongseek | 22 | 85 | village-lost | regional | 1 | 66 | 5 | 20 | 7 | 0 |
| belongseek | 33 | 50 | village-lost | regional | 1 | 309 | 6 | 41 | 33 | 0 |
| belongseek | 44 | 72 | village-lost | regional | 3 | 108 | 2 | 92 | 12 | 0 |
| belongseek | 55 | 165 | village-lost | regional | 3 | 429 | 34 | 171 | 14 | 3 |
| belongseek | 66 | 40 | village-lost | regional | 2 | 4 | 0 | 3 | 10 | 0 |
| belongseek | 77 | 86 | village-lost | regional | 2 | 233 | 22 | 105 | 28 | 0 |
| belongseek | 88 | 59 | village-lost | regional | 2 | 68 | 21 | 34 | 18 | 0 |

Combined: fresh-rot share **93.8pp** (2,927k fresh / 193k preserved), duty throughput 991k, median survival **63d**, median starveDays **18.0**, laundered=3 (pre-existing — see blanks).

## Pilot (after-side, identical seeds)
| policy | seed | days | end | rank | wave | rotF(k) | rotP(k) | duty(k) | starveD | launder |
|---|---|---|---|---|---|---|---|---|---|---|
| leadcourt | 11 | 69 | village-lost | regional | 2 | 264 | 0 | 74 | 23 | 0 |
| leadcourt | 22 | 100 | village-lost | national | 4 | 147 | 24 | 58 | 30 | 0 |
| leadcourt | 33 | 38 | village-lost | village | 2 | 168 | 0 | 16 | 27 | 0 |
| leadcourt | 44 | 87 | village-lost | regional | 2 | 260 | 4 | 80 | 10 | 0 |
| leadcourt | 55 | 94 | village-lost | national | 4 | 198 | 28 | 82 | 9 | 0 |
| leadcourt | 66 | 65 | village-lost | regional | 2 | 59 | 3 | 13 | 12 | 0 |
| leadcourt | 77 | 66 | village-lost | regional | 4 | 133 | 11 | 53 | 18 | 0 |
| leadcourt | 88 | 85 | village-lost | global | 4 | 162 | 23 | 61 | 32 | 0 |
| belongseek | 11 | 63 | village-lost | regional | 2 | 183 | 0 | 144 | 34 | 0 |
| belongseek | 22 | 82 | village-lost | regional | 2 | 115 | 15 | 56 | 19 | 0 |
| belongseek | 33 | 90 | village-lost | regional | 1 | 259 | 0 | 36 | 48 | 0 |
| belongseek | 44 | 180 | survived | regional | 3 | 336 | 14 | 207 | 14 | 0 |
| belongseek | 55 | 132 | village-lost | regional | 3 | 120 | 13 | 140 | 10 | 0 |
| belongseek | 66 | 36 | village-lost | village | 1 | 4 | 0 | 14 | 14 | 0 |
| belongseek | 77 | 149 | village-lost | national | 3 | 375 | 34 | 144 | 30 | 0 |
| belongseek | 88 | 79 | village-lost | regional | 2 | 151 | 23 | 89 | 36 | 0 |

Combined: fresh-rot share **93.9pp** (2,934k / 192k), duty throughput 1,268k, median survival **84d**, median starveDays **21.0**, laundered=0.

## Verdict: KILLED AT PILOT
- Fresh-rot share: **+0.0pp** (93.8 → 93.9) vs −10pp GO. KILL "rot share moves <5pp" **FIRED**. No confirm spend. Game code reverted — evidence + scripts only.
- Median survival: 63d → 84d (+21d). KILL only on regress >10d — not fired. (The ±10d GO band is technically missed in the favorable direction — see metric review.)
- Median starveDays: 18.0 → 21.0 (+3.0). GO needed ≤+1 — missed.
- Laundering: baseline 3 (pre-existing), after 0 — no arm-attributable laundering; laundering KILL not fired.

Why it failed (measured, not theorized): the drive DID smoke more — duty throughput rose +28% (991k → 1,268k). But fresh rot was flat (2,927k → 2,934k) and preserved rot flat (193k → 192k). The extra ~277k preserved kcal went to the village's stomachs, not out of the rot pool: the reserve wasn't the binding constraint on rot. The would-rot surplus is the part the drive never sees (spoilDay−day > 2 eligibility window, racks-full stand-downs, post-cook arrivals) — not the part the reserve holds back. The smaller reserve re-timed preservation (smoked a day earlier) but the marginal preserved kcal came from surplus the village would have eaten fresh anyway. The 250-person reserve was slack in the wrong place, but removing the slack doesn't touch the actual rot mechanism.

Trajectory noise dominates everything else: seed 44 belongseek went 72d→180d-survived and seed 22 leadcourt 34d→100d on the after side — the +21d median and +3.0 starveDays are the same long-run-mechanically-accumulates-more confound the preservedrive arm flagged (longer runs rot more, hunger more days).

## Wall numbers (combined 16 per side)
| side | national | table | wins | w4 | w5 | median surv | max |
|---|---|---|---|---|---|---|---|
| baseline | 3/16 | 0/16 | 0/16 | 5/16 | 0/16 | 63d | 165d |
| after | 4/16 | 0/16 | 0/16 | 4/16 | 0/16 | 84d | 180d |
Exiled: not tracked in this sweep (instrumentation gap — noted for the next run). Telemetry check vs scale-wall.json on {national,table,wins}: QUIET (national 8→4 within tolerance; the mid-run LOUD was a schema mismatch — per-seed JSONs lack the flat aggregate paths the checker wants; convention gap noted).

## Death-cause shares
Baseline (357 deaths): combat 150, villager combat 53, sickness 37, monster 34, wound 24, starvation 19, contest 7, expedition 7.
After (371 deaths): combat 135, villager combat 64, sickness 34, starvation 30, wound 27, monster 26, expedition 6, Choir Toad 3.
~66% of deaths are combat-family both sides. Villages die to violence at median 63–84d, not to hunger (starvation 5–8% of deaths). A food-rot lever cannot move survival while the bind is combat attrition — the rot is real (~2.9M kcal/suite, ~2.4k kcal/day) but the villages don't live long enough for the pantry math to compound into survival.

## Village assessment (plain words)
Sixteen villages, sixteen funerals and one 180-day survivor. The typical story: a competent courtship village gets to regional by day 40–60, courts its neighbors, then bleeds out to wave-2/3 monster pressure — hushwolf packs and the wave-3 weirdness kill foragers and hunters faster than the garden can replace them. The pantry is usually FULL when the village dies (pkEnd routinely 10–40k kcal): these are not starvation deaths. The one 180-day survivor (belongseek s44) sat regional the whole run, never pushed national, and just... lived — garden humming, racks full, wave-3 faced but wave-4 never unlocked. The cooks did their work honestly; the dinner lines name real villagers. The food economy is a solved problem for a village that stops pushing — the wall is what happens when it pushes (combat attrition, then the scale gates).

## Blanks filled or documented
- DOCUMENTED (appended to hidden_files/sim-findings.md): the duty-time cook drive's eligibility filter does not exclude already-spoiled items (`sd - day > 2` lets `sd < day` through) — measured 3 spoiled items smoked onto the racks across 16 baseline runs (belongseek s55). Pre-existing, not arm-attributable. Canon (PRESERVATION.md): "Rot can't be smoked back into food." One-line-class fix candidate (add `if (this.isSpoiled && this.isSpoiled(it)) continue;` to the eligible loop) — left for a future arm, not chased mid-run.
- DOCUMENTED: telemetry-check needs flat aggregate JSONs or dot-paths — per-seed {meta,rows} JSONs produce false LOUD lines (convention gap, matches the r19 note).
- DOCUMENTED: exiled not tracked in this sweep's instrumentation (gap for next run).

## Sense-testing
The arm changes no narration text. The drive's lines still read as village cooking ("🍲 Deirdre cooked for the haven — meals stretched." + "worked the smoke racks too — N batches preserved (~X kcal, keeps for weeks)."). No silent actions introduced, nothing spreadsheet-like. Villagers act like people — unchanged.

## Metric review (§14)
The metric did its job — the arm genuinely doesn't move the share, and the pilot gate killed it before confirm spend. Three calibration notes for the NEXT run (not this one — no re-scoring):
1. The "median survival within ±10d" GO band is two-sided for a lever meant to help: +21d (favorable) technically misses. Re-register as one-sided: no worse than −10d.
2. starveDays is confounded with run length (longer runs mechanically accumulate hungry-days). Normalize per 100 days alive, or count only pre-death-10d windows.
3. Fresh-rot share at the suite level is dominated by trajectory noise when the suite dies to combat at 63–84d; a mechanism-level metric (reserve-kept kcal that later rotted, measured per resolution) would isolate the lever's actual contribution from the noise.

## Convergence state
food-economy stays `converging` — dinreserve killed at pilot, no landing. The village-scale rot overproduction bind remains: the reserve wasn't the lever; the rot lives in the eligibility window / racks-full stand-down / post-cook arrivals, i.e. game-code or design moves (Steve's call).
