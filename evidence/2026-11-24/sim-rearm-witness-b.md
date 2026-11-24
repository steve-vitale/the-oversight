# sim-rearm-witness-b — wild-corpse expedition witness-channel re-arm (PARTIAL PILOT)

**Status: NO-GO on the frozen bars (full pilot, 16/16 seeds — see §11). The partial-pilot INCONCLUSIVE verdict in §6 is superseded; the pilot completed after this file was first written.**

- Run: fleshout-loop-b-20261124T0230Z, axis winnability-chain, arm sim-rearm-witness-b.
- Adoption of the dead run fleshout-loop-b-20261123T2322Z (its worker did nothing).
- Branch: `sim-rearm-witness-b`, base master `7344d8a56`, anchor commit `2298a7311` (mechanism + prereg + instrument).
- Prereg: `evidence/2026-11-24/sim-rearm-witness-b-prereg.md` (frozen ~03:30Z, before any judged run).
- Model: sim-rearm-b (GO, merged d3fcf060a) — Haven-channel corpse-transfer re-arm (REARM_CELLS=1).
- This arm's thread: rearm-b open thread #1 — witness channel 0/4 takes; 9/13 supply deaths produced no take (holders died in the wild, gun lay on a wild corpse, nobody came).

## 1. The mechanism (landed in 2298a7311)

A villager who steps onto the death node while away on expedition/objective travel takes the gun + cells from a wild corpse — the **witness channel**. Grounded in perception: `mapmemNoticeNode` is called as villagers move; the step fires on the node actually stood on (T6 proof: wrong-node corpse is not taken).

- `src/js/corpses.js`: `villagerRearmExpeditionStep(vid, nx, ny)` — scholar exclusion, null-node/dead-walker guards, early exit if already armed, **Haven-node exclusion** (Haven sweep owns those), corpse scan (unburied, node match, person, cells > 0) → `villagerRearmFromCorpse(c, vid, 'expedition')`, first take wins. Reuses rearm-b's transfer path (need-gated, cells-gated, env-gated, voiced, teled `rearm_take` with `channel`).
- `src/js/villager-agency.js`: hook in `expeditionLeg` after the move block, once per leg on the node stood on.
- `src/js/villager-objectives.js`: hook in `objAwayStep` immediately after `mapmemNoticeNode`. Hooks are disjoint by construction (`objAwayStep` returns early for agency expeditions) — no double-take possible.
- No new env flag: under the same REARM_CELLS=1 gate. No RNG drawn. No stage gate.
- Instrumentation: driver records `supplyCorpseRows` (person corpses with cells at registration); analyzer adds `expeditionRearmEvents` / `expeditionTakeDays` / `expeditionRearmVolleys` / `wildSupplyDeaths` + `judgeRearmWitnessCompare` / `--rearm-witness-compare`.

## 2. Proof (pre-flight, all green on the rebased tip + anchor)

- Analyzer `--selftest` 43/43; `test-rearm-witness-b.js` pre-run 26/26; `--live` 51/51 (T1 expedition second-life + wave-4 volley; T2 REARM-off control; T3 dry-holder cells-only; T4 armed-holder nothing; T5 no-cells corpse nothing; T6 wrong-node nothing; T7 Haven-node refusal; T8 scholar exclusion).
- `test-rearm-b` 18/18; `test-killbundle-b` 11/11; `test-killrate-a` 36/36; `test-killrate-analysis-a` 14/14.

## 3. Pilot — what actually ran

Staged band 107734–107749 (16 seeds), pilot 107734–107741. Substrate both legs (identical to rearm-b): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 KILLBUNDLE=1 STAGE_SEAR=1`, MODE=arm; control REARM unset, armed REARM_CELLS=1. Horizon 150d death-aware.

**Pilot execution was interrupted twice.** First launch (~04:00Z) misfired on a shell `&&`/`&` precedence bug: only ctl-1 started (3 legs never launched — relative log redirects failed with ENOENT in the wrong cwd). Relaunched ~04:05Z detached (`setsid nohup`, absolute paths); 4 legs ran. At ~04:22Z **all drivers on the box died simultaneously** — my 4 and the sibling arm's 12. Cause unestablished: no machine restart (uptime 55 min at 04:22Z, last restart 03:27Z), no dmesg access; leading suspicion is the OOM killer (16 node drivers × ~380 MB RSS on a 6 GB box). The runtime also restarted ~04:05Z, killing the first launch's session.

Completed before the kill: **9/16 pilot seeds** — ctl 5 (107734, 107735, 107736, 107738, 107739), arm 4 (107734, 107735, 107738, 107739). Every completed seed: errors 0, anchor `2298a7311ddf`, gameSha `950901f3fdcc` (same as rearm-b).

Remaining 7 seeds (ctl 107737, 107740, 107741; arm 107736, 107737, 107740, 107741) were **relaunched detached at ~04:24Z** (pids 16978 ctl, 16979 arm; logs `rearm-witness-b-legs-pilot-ctl-3.log`, `rearm-witness-b-legs-pilot-arm-3.log`). They write into the same per-seed dirs. The pilot completes without this worker if they survive.

## 4. Pilot numbers (9 seeds; analyzer `--rearm-witness-compare`)

| metric | ctl (5) | arm (4) |
|---|---|---|
| supplyDeaths (staged holder died holding cells) | 0 | 0 |
| wildSupplyDeaths | 0 | 0 |
| rearmEvents (all channels) | 0 | **1** |
| expeditionRearmEvents | 0 | 0 |
| expeditionRearmVolleys | 0 | 0 |
| starvDeaths | 0 | 0 |
| median survival (days) | 132 | 117 |

Per-seed (days / end / maxWave / standing): ctl 107734 102 lost w4 199; 107735 150 survived w4 199; 107736 150 survived w4 199; 107738 132 lost w4 199; 107739 99 lost w4 199. Arm rows are **identical seed-for-seed** on days/end/maxWave/standing/deaths — the one arm take did not change any village's fate.

Bundle intact: ctl klBundled 5/5, arm 4/4, klDry 0 both legs.

## 5. The one take — and the one corpse (sense-test)

- The **only supply corpse in 9 seeds** was `gen_zzywfou`, died day 118 with 1 cell, at node {4,4} — the Haven node — in seed 107735 (identical in both legs).
- In the **arm leg, seed 107735, a holder took it on day 122 via channel `haven`** — the rearm-b Haven sweep, 4 days after the death. That is the arm leg's single rearmEvent. It validates the transfer path end-to-end (corpse → take → armed holder) but says **nothing about the expedition channel**: the corpse was at Haven, and the expedition step correctly refuses Haven nodes.
- **Zero wild supply corpses existed in the 9 seeds.** The expedition channel had nothing to convert. This is a supply drought in this band, not a channel failure: rearm-b's band had 13 supply deaths in 16 seeds; here 0 staged holders died holding cells in 9 seeds (holders fired their volleys and died dry, or survived to village-lost/survived-150d). The analyzer's `supplyDeaths` counts staged holders (klHolders) who died holding cells; the `gen_zzywfou` corpse is a second-generation holder (took a gun from a corpse), so it is a supply corpse by the rows but not a staged-holder supply death by the frozen definition.

## 6. Bar-by-bar judgment (frozen prereg §7)

1. Instrument validity — **PASS** (selftest 43/43, arm test 51/51 live, 0 errors on 9 files, single anchor + policySha, rearmPresent true everywhere, ctl rearmOn false / arm true).
2. Bundle intact — **PASS** (klBundled == klArrivals, klDry 0, per leg).
3. Primary, expedition takes (arm ≥ 2) — **NOT MET** (0; denominator is 0 wild supply deaths).
4. Primary, expedition volley (arm ≥ 1) — **NOT MET** (0).
5. Control clean — **PASS** (ctl rearmEvents 0).
6. Supply (arm supplyDeaths ≥ 1) — **NOT MET** (0) → **INCONCLUSIVE by the frozen rule**.
7. Guardrails — **PASS** (starvation-death delta 0 ≤ +2; median-survival delta −15 ≥ −20).
8. Balanced panel — **NOT RUN** (pilot incomplete; panel is a full-16-seed step).

**Verdict: INCONCLUSIVE (partial pilot).** The frozen pilot continue rule requires 8+8 seeds with supply ≥ 1 and expedition takes ≥ 1; this pilot has 5+4 seeds with supply 0. Its NO-GO branch ("supply ≥ 1 but 0 expedition takes") does **not** trigger — there was no supply to convert. Killing the arm on 0/0 would be scoring a drought as a failure. The correct next step is the **confirm on the full 16-seed band** once the 7 relaunched seeds land: if the full band still shows supply 0, the finding becomes "this band starves the channel — the witness channel is untestable here, not disproven"; if supply appears and expedition takes stay 0, that is a NO-GO.

## 7. Wall numbers (partial pilot, 9 seeds)

No wins in either leg. maxWave 4 everywhere; standing 199 (regional) everywhere; scaleRank regional everywhere. Median survival ctl 132 / arm 117. No wave-5 unlocks, no national, no table. (Same wall as rearm-b's band: the game still stalls at wave 4 / standing 199 on these seeds.)

## 8. Metric review

- Every metric above is the frozen prereg §7 metric, judged by `analyze-killlootbundle-a.js --rearm-witness-compare` (verdict field: INCONCLUSIVE) plus the per-seed rows. No metric was re-scored or swapped mid-run.
- Known gap: `--dir-ctl`/`--dir-arm` validation in `test-rearm-witness-b.js` expects exactly 16 files and fails on partial corpora by design — the analyzer was used for pilot judgment instead.
- Instrument note: `supplyCorpseRows` recorded exactly 2 rows (the same day-118 corpse in both legs of seed 107735) — the wrap works; the drought is in the game, not the instrument. But note the analyzer's `supplyDeaths` counts only *staged* holders, while `supplyCorpseRows` counts any person corpse with cells — a second-generation holder's corpse (like `gen_zzywfou`) is supply for the village but invisible to bar 6. If the confirm also shows supplyDeaths 0 with rows > 0, the prereg's bar 6 definition should be revisited for the next arm — not re-scored here.
- The pilot's kill event (all drivers dying at ~04:22Z) is an infrastructure fact, not a game result; recorded here and in the run note.

## 9. Files

- Prereg: `evidence/2026-11-24/sim-rearm-witness-b-prereg.md`
- Evidence (this file): `evidence/2026-11-24/sim-rearm-witness-b.md`
- Pilot corpora (16 files, complete): `evidence/2026-11-21/perseed-rearm-witness-b-ctl/` (8), `evidence/2026-11-21/perseed-rearm-witness-b-arm/` (8)
- Analyses: `evidence/2026-11-24/rearm-witness-b-pilot-*-analysis.json` + `rearm-witness-b-pilot-rearm-compare.json` (partial 9-seed, superseded) and `rearm-witness-b-full-*-analysis.json` + `rearm-witness-b-full-rearm-compare.json` (full 16-seed)
- Leg logs: `evidence/2026-11-24/rearm-witness-b-legs-pilot-ctl-1.log`, `ctl-1b.log`, `ctl-2.log`, `arm-1.log`, `arm-2.log`, `ctl-3.log`, `arm-3.log` (last two: the relaunched finish-up, running at commit time)
- Mechanism + instrument: commit `2298a7311` (8 files, 1104 insertions)

## 11. FULL PILOT — complete 16-seed verdict (added ~04:40Z, supersedes §6)

The two detached finish-up processes (pids 16978/16979) completed all 7 remaining seeds. The pilot corpora are now complete: **8 seeds/leg, 16 total** (ctl 107734–107741, arm 107734–107741). Analyzer `--rearm-witness-compare` on the full corpora:

| metric | ctl (8) | arm (8) |
|---|---|---|
| supplyDeaths / wild | 1 / 1 | 1 / 1 |
| rearmEvents (all channels) | 0 | **3** (2 expedition + 1 haven) |
| expeditionRearmEvents | 0 | **2** |
| expeditionRearmVolleys | 0 | **0** |
| starvDeaths | 1 | 1 |
| median survival (gameDays) | 145.5 | 142 |

Per-seed (analyzer days / end / maxWave / standing): ctl 107734 102 lost w4 199; 107735 150 survived w4 199; 107736 150 survived w4 199; 107737 149 survived w5 350; 107738 132 lost w4 199; 107739 99 lost w4 199; 107740 151 survived w4 199 (the starvation death); 107741 142 survived w5 515. Arm is identical except 107735 150 survived (haven take day 122), 107737 150 survived w5 430 (expedition take day 73), 107741 134 lost w5 485 (expedition take day 97). (Note: the analyzer judges survival on `gameDays`; the raw per-seed `days` field reads up to 8 days higher — s107741 ctl 150, arm 144. Same field rearm-b used; the guardrail delta is unaffected.)

**The two expedition takes (sense-test):**
- Seed 107737, day 73: `ella_johnson` took gun + 2 cells from `sam_wilson`'s corpse — second-life, channel expedition. Village survived 150d, reached wave 5, standing 430. Ella held a loaded gun for **77 days** and never fired a volley.
- Seed 107741, day 97: `wanjiru_kamau` took gun + 2 cells from `diana_osei`'s corpse — second-life, expedition. Diana died day 97 "a stranger"; Wanjiru died day 130 of sickness, **33 days** with the gun, never fired. (In the ctl leg Wanjiru died day 109 in the wild — the gun bought her 21 days, not a fight.)
- Both takes were second-life (gun-less villagers gaining a gun). Both wild corpses that existed in the arm leg were taken by the expedition channel (2/2 conversion of wild supply); the Haven corpse went to the Haven channel. **The channel works — every wild gun-corpse was witnessed and taken. The guns then sat unused.** The binding constraint moved downstream: takers don't fight.

**Bar-by-bar (frozen prereg §7, full pilot):** 1 instrument PASS (errors 0/0); 2 bundle intact PASS (8/8, dry 0); 3 expedition takes PASS (2 ≥ 2); 4 expedition volley **FAIL** (0 < 1); 5 control clean PASS (ctl rearmEvents 0); 6 supply PASS (1 ≥ 1); 7 guardrails PASS (starv delta 0, survival delta −3.5); 8 balanced panel **NOT RUN** — the panel builder expects the 16-seed confirm band (107734–107749); the pilot is 8 seeds and the verdict below makes a confirm moot.

**Verdict: NO-GO.** Frozen rule: NO-GO = supply ≥ 1 AND (3 or 4 fails). Supply is 1 and bar 4 fails. The channel converts wild corpses into armed villagers but produces zero wave-4 fire — the take does not become a volley. Metric binding (§14) forbids re-scoring: the volley bar was set knowing the base rate (~23% at N=2 takes), and the miss stands. The mechanism stays in the code under its env gate (default OFF) for any future arm that attacks the downstream problem (holders who take guns but never fight); this arm is killed — no confirm spend (seeds 107742–107749 stay unused).

**Wall numbers (full pilot):** wins 0/0, national 0/0, wave5 2/8 both legs, wave4 8/8, village-lost ctl 3 / arm 4. The arm leg lost one more village than ctl (s107741: arm lost day 134, ctl survived) and median survival fell 3.5 days — within guardrails, but no benefit anywhere.

**Metric review (full pilot):** all metrics are the frozen prereg §7 metrics, judged by `--rearm-witness-compare` (verdict field: NO-GO). No metric was re-scored or swapped. Two instrument notes: (a) the analyzer's `supplyDeaths` counts only *staged* holders — the second expedition take (diana_osei, a second-generation holder) is invisible to bar 6, so the channel's true wild conversion was 2 corpses against a counted supply of 1; (b) the analyzer's `days` is `gameDays`, which reads up to 8 days below the raw per-seed `days` field — consistent across legs and identical to rearm-b's usage.

**Files added in this update:** full analyses `rearm-witness-b-full-ctl-analysis.json`, `rearm-witness-b-full-arm-analysis.json`, `rearm-witness-b-full-rearm-compare.json`; per-seed files ctl s107740/s107741, arm s107737/s107740/s107741 (5 new; 16 total in the corpora). Panel builder run failed as expected on the 8-seed pilot (`missing per-seed file ... s107742 ...`) — bar 8 unrun, recorded above.

## 10. What remains (closeout only — the pilot is complete and judged)

1. Convergence tracker update (this axis only — re-read immediately before updating).
2. Claim/lock deletion per coordinator; heartbeat retry (04:32Z attempt timed out unconfirmed).
3. Memory run note update (the 04:32Z note says INCONCLUSIVE partial — the verdict is now NO-GO full pilot).
4. The mechanism stays in the code under its env gate (default OFF); no revert is needed. Seeds 107742–107749 remain unused. No confirm spend.
