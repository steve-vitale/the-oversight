# sim-rearm-witness-b — wild-corpse expedition witness-channel re-arm (PARTIAL PILOT)

**Status: INCONCLUSIVE on the frozen bars (partial pilot, 9/16 seeds). Pilot NOT complete — 7 seeds re-running detached. No GO / NO-GO is licensed by the prereg.**

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
- Pilot corpora (9 files): `evidence/2026-11-21/perseed-rearm-witness-b-ctl/` (5), `evidence/2026-11-21/perseed-rearm-witness-b-arm/` (4)
- Analyses: `evidence/2026-11-24/rearm-witness-b-pilot-ctl-analysis.json`, `rearm-witness-b-pilot-arm-analysis.json`, `rearm-witness-b-pilot-rearm-compare.json`
- Leg logs: `evidence/2026-11-24/rearm-witness-b-legs-pilot-ctl-1.log`, `ctl-1b.log`, `ctl-2.log`, `arm-1.log`, `arm-2.log`, `ctl-3.log`, `arm-3.log` (last two: the relaunched finish-up, running at commit time)
- Mechanism + instrument: commit `2298a7311` (8 files, 1104 insertions)

## 10. What remains

1. Wait for the 2 detached finish-up processes (pids 16978/16979) — 7 seeds. Do NOT relaunch: if they die, check the logs first (OOM suspected; run fewer parallel drivers next time).
2. Re-run the analyzer + compare on the full 16-seed corpora; apply the frozen pilot continue rule (8+8, supply ≥ 1, expedition takes ≥ 1).
3. If pilot continues: remaining confirm is nil — the pilot IS the staged band (16 seeds); go straight to the full analysis (analyzer per leg, compare, tier tally, panel build, per-seed staged table, sense-test, scale-wall numbers) and write the full evidence verdict (GO/NO-GO/INCONCLUSIVE) as a follow-up section or a new evidence file.
4. If the full pilot shows supply ≥ 1 with 0 expedition takes → NO-GO, kill the arm, no confirm spend beyond the pilot.
5. Closeout: convergence tracker update (this axis only), claim/lock deletion per coordinator, memory run note.
