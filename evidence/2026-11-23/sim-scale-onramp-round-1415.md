# Round record — Loop A flesh-out 1415Z (axis scale-onramp)

Run `fleshout-20261123T1415Z`, Loop A, axis scale-onramp. The scheduled occurrence timed out at the 16:15Z boundary with both arms' 8-seed pilots finished but neither judged nor committed; this adoption finished both arms (analyzer, determinism/neutrality replays, confirm halves, merge, gate, record, tracker, lock).

Base master `43ebee38c` (establishment r274 merge). Master moved twice during the adoption: `fdd90bb48` (Loop B 1230Z doorstage landing) → `5fc503d9e` (muster merge) → `16de94e71` (planform merge). A ship version bump `6d8478d00` landed on top of `16de94e71` during the gate (version-tag-only diff: index.html, src/js/build.js, sw.js, version.json; no muster/planform file touched).

Arm 3 (`sim-departsafe-rejudge-a`) was DEFERRED at ~14:51Z for the worktree cap — no new sims, re-judges the departsafe corpus (107601–107616) in the held `sim-departsafe-a` tree. It stays tracker blank #3 for a later run, NOT this adoption.

Stale-lock recovery at adoption start: the 1415Z run was verified dead (no live coordinator/worker processes by WT_RUN_ID, no live subagent state, heartbeats stale at 16:08:06Z; only the journey2-7 hbloop was running). The lock was later deleted by the scheduled 1715Z occurrence's own stale-lock recovery (it stood down in favor of this adoption) — the lock no longer exists at closeout and was NOT recreated. Claim `fleshout-20261123T1415Z.json` retired to `.DEAD` by this adoption.

## Arm 1 — sim-muster-a: DIAG-NO-GO at pilot (merged `5fc503d9e`)

Blank #1: why the companion pool reads eligible 0 on muster days (launchsilence-a: 107526 eligible 0 on all 11 pool rows; 107529 six holders, nobody musters).

Pilot (8 seeds 107617–107624, 150d, competent verbatim): 813 eligible-0 events. Non-launcher subset (seeds 107617/18/19/20/21/23; launching seeds 107622 + 107624 excluded): 136 events, 116 classified (85.3% < 90% bar), 20 unclassified — pilot gate FAILS both bars. All-pilot: 731/813 (89.9%), 82 unclassified.

All 82 unclassified are population-B "never scored" with sub-cause `unknown`: holder alive, at Haven (4,4), not on expedition, holding a wave-4+ plan at end of day, yet no dawn score. Breakdown: stage hunt 58 / party 21 / standing 2 / table 1; 40/82 have no igniteCensus row that day; 23/82 engaged at end of day; only 3 created the same day. The analyzer implements the frozen prereg faithfully (selftest case 13 pins unknown → unclassified), so this is a genuine taxonomy gap / game finding, not an instrument bug. The scored pool-empty half is fully named (139/139): never-asked:holder-not-scored 592, pool-empty:away 78, pool-empty:notRanger 61, stage-gear 0.

Sense case: seed 107617 visjoin_84 (plan created d100, stage party, target congregation) — scored d101–d105, d108, d110, but never scored d106/d109 (engaged, at Haven, alive) while d110 was scored despite engaged:true, so end-of-day engagement does not deterministically block scoring.

Proof test 71/71 + analyzer selftest 23/23 on the frozen base; on the rebased tip 69/71 — the 2 failures are the expected §1 anchor assertions (FROZEN_BASE vs rebased HEAD), which must fail after any rebase by design. Commit `84c484387` (pre-rebase) → `5fc503d9e` (rebased onto `fdd90bb48`, byte-identical content). Merged ff-only into master, exit 0.

Wall (pilot): wins 0, national 0, table 0, wave5 3, wave4 8, median survival 150, villages lost 2, total deaths 778. No confirm half spent (prereg stops the run at a pilot-gate failure).

Next step: name the dawn-scoring gap — a dawn-state read (away/engaged AT DAWN vs the end-of-day state the analyzer uses) or an extended taxonomy sub-cause. The muster question's pool half is answered; the ask half is now the wall. Findings entry appended to `hidden_files/sim-findings.md`.

## Arm 2 — sim-planform-a: DIAG-GO (merged `16de94e71`)

Blank #2: what turns a wave-4 meeting into a wave-4 target (launchsilence-a: 107517 fled 4 wave-4 monsters, no wave-4 plan; 107529 killed a herald d108, plan only d112).

Pilot first read: 197 W4 meetings, 187 classified (94.9%), 10 unclassified — all world-tick vFlee, monster tile (4,4) == Haven tile, lingering=false, optsRaid=false, caller `resolveWildMonsterEncounter`. Root cause PROVEN by a replay probe (copied driver + RWE wrap, `/tmp/probe-107633.log`, seed 107633, corpus identical to pilot except caller-frame strings): the encounter opts carry `raid:true` (seed correctly suppressed by `!opts.raid`) while the fieldFight opts the driver reads carry no raid flag (`resolveWildMonsterEncounter` passes only allies/allyVids to `fieldFight`), so the driver's `optsRaid` reads false on every raid. The analyzer's B6 gated on `lingering`, but the frozen prereg §5 B6 gates on the TILE (monsterTile == havenTile) — and a lingering test can never fire (lingering fights are origin `aid`, B2 fires first; pilot B6 count was 0).

Correction (prereg §16 AMENDMENT, recorded before judgment): analyzer B6 now implements the frozen tile test (`atHavenTile`, previously computed and unused); B6 fixtures in the analyzer selftest + proof-test synthetic band now set `lingering:false` with the monster on the Haven tile, pinning that the tile decides. Frozen bars unchanged; pilot corpus unchanged (no re-record). The driver's `optsRaid` field stays as recorded — latent instrument defect, noted in metric review.

After the fix, pilot re-analysis: W4 197/197 (100%), 0 unclassified, no-call-raid 10. Pilot gate PASSES.

Bar 3 determinism: replay of pilot seeds 107633 + 107636, analyzer `--diff` 2/2 match (classification + launches + days identical). Bar 4 neutrality: recorder-off replays identical on both seeds (partyDepartures, days, maxWave, standing, deaths, killCalls, endReason, endPantryKcal). Bar 5: proof test 72/72 + selftest 29/29 on the frozen base; on the rebased tip 70/72 — the 2 failures are the expected anchor assertions. Confirm half (107641–107648) ran clean, 0 instrument errors, 7/8 villages lost.

Full 16-seed verdict: W4 meetings 303, classified 303 (100%), unclassified 0. Class counts W4: seeded 34, bounced-hunt-lock 71, no-call-aid 74, gate-avoid-plan-exists 59, no-call-raid 15, no-call-kill 14, vDie 17, bounced-suburb 13, mFlee 6. orphanSeeds 0, joinAmbiguous 62 (reported, not a bar), instrumentErrors 0, tickGateMismatches 0.

Wall (16 seeds): wins 0, national 0, table 0, wave5 5, wave4 15, median survival 150, villages lost 8, total deaths 1560. **Formation wall: the hunt-lock** (71 W4 bounces). Sense-test village seed 107639: 37 W4 meetings, 0 wave-4+ plans created; gen_fu4ob9j holds a targetless hunt-stage plan d56–d70 and bounces a strike (d57), audit (d65), reunion (d77); the only seeded meeting (d59, gen_0lyi9yn strike) is a retarget of a targetless party-stage plan; 173 deaths, first d4, survived 150d at standing 650. Verdict: silence is sensible per the code (the lock is the designed gate), but the lock is the formation wall.

Commit `7ab9d5c6c` (pre-rebase) → `16de94e71` (rebased onto `5fc503d9e`, 2 commits: prereg `75028b4a5` + verdict; byte-identical content). Merged ff-only into master, exit 0. Findings entries appended to `hidden_files/sim-findings.md` (hunt-lock wall + B6 instrument fix).

## Gate

check.js --quick on the merged tip `6d8478d00` (log `hidden_files/check-quick-1415.log`): 339 passed, 5 failed in 833s, GATE-EXIT:1. Adjudicated 0 attributable. The 2× 120s timeouts (`test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js`, both exit null ~120.1s) re-ran green standalone, serialized, on the same tip (log `hidden_files/check-quick-1415-standalone.log`: living-garden 8/0, one-person-army 7/0, both EXIT:0) — load flakes, confirmed. The 3 remaining failures are the standing staleness set: measurement-proof staleness pair (`test-measurement-proof-update.js`, `test-measurement-workflow.js` — retained neutrality proof) + phone-frame stale receipt (`test-phone-frame-proof.js` — index.html). measurement-cache-flags PASSED this time. None touches any 1415Z arm file.

Two hazards on the gate itself: the first attempt (launched ~17:18Z on tip `16de94e71`) was killed by a VM replacement ~17:27Z (uptime 8 min at 17:35Z; log truncated mid-run at 237 bytes); the re-run was launched detached via `setsid nohup` from `~/workspace/gate-1415.sh` and completed. Master moved twice during the gate: `16de94e71` → `6d8478d00` (ship version bump, version-tag-only diff) → `97cf9d7c2` (succession r268 finisher + Loop B 1230Z record + sim-killbundle-b GO). The `6d8478d00` → `97cf9d7c2` diff adds no changes to any muster/planform file and no deed-attainment file, so the gate result stands for the merged tip (same call as the 0215Z adoption's mid-gate r155 merge).

## Telemetry

Deviation check against the scale-wall baseline (`hidden_files/telemetry-baselines/scale-wall.json`) on the per-seed evidence glob, metrics national, table, wins, exiled. Muster: wins/national/table/exiled 0/0/0/0; planform 0/0/0/0; baseline (winseat regime) wins 16/16, national 12/16, table 16/16, exiled 0/16. The wins/national/table lines read LOUD but are the documented regime artifact (baseline's own `_regime` note forbids comparing the competent-verbatim control substrate against the winseat baseline; same call as r251/r273). Exiled quiet. Baseline NOT rolled.

## Scale-onramp axis

scale-onramp stays converging (NOT converged): the launch funnel is now decomposed to the muster ask (82 never-scored holder-days) and the hunt-lock formation wall (71 W4 bounces), but wins are still 0 on both judged corpora and national 0 everywhere in this round. Next blanks in order: (1) the muster ask — name the dawn-scoring gap (dawn-state read or extended taxonomy); (2) departsafe re-judge under the bid-inclusive det-gate bound (no new sims; landing as default-OFF is a coordinator/Steve call); (3) whether a hunt-locked plan should retarget on a wave-4 meeting (design call — changes the lock's purpose); (4) held departures are silent — whether a hold should speak (design call); (5) Omar's corpse thread (#2672); (6) finding #2710 (departure-beat physical-description naming, recurred again).

Merged `5fc503d9e` (muster) + `16de94e71` (planform). Claim retired to .DEAD; lock already deleted by the 1715Z occurrence's stale-lock recovery (NOT recreated).
