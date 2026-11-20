# sim-bowknow-a — INTERIM (pilot still running at closeout; NO VERDICT YET)

- **Arm:** sim-bowknow-a (BUILD + MEASURE pilot — finding #2590's OPEN serve half: bow-knowledge reach for spear-holders), scale-onramp axis
- **Run:** fleshout-20261120T0215Z (Loop A), coordinator closeout ~03:55Z
- **Prereg:** `evidence/2026-11-19/sim-bowknow-a-prereg.md` (frozen ~03:40 UTC, mechanism corrected pre-sim ~03:53 UTC — mentoring, not pack-seeing; bars, seeds, policies unchanged). Commit `8e1cd3843`.
- **Proof test:** `scripts/test-bowknow-a.js` — **19/19 GREEN** (flag off = no teaching, byte-identical repeat; flag on = spear-holder gains lv[bow] = 1 with `weapon_teach` telemetry + witnessed line; communal-pile bow seeds nothing; equipped bow still seeds by seeing on both legs).
- **Analyzer:** `scripts/analyze-bowknow-a.js` — selftest **49/49** (partition noSource formula, gate-on-both-legs judge; served=5 pins GO under the partition formula). **Not yet run on the pilot corpora** — the pilot is incomplete.
- **Driver:** `scripts/bowknow-driver-a.js` (clone of the speargate driver; SPEARGATE=1 on both legs, BOWKNOW decides the leg; RUN=bowknow-a). **Panel builder:** `scripts/build-bowknow-panels-a.js` (band 107051–107058). Both committed (`1646ddf5e`, `ddebdee3f`).
- **Band:** fresh 107051–107058 (8 seeds × 2 legs, 150d, competent verbatim; substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1`; BOWCRAFT always-on in code). Freshness verified pre-freeze (0 hits across evidence, preregs, sim-findings, convergence-tracker, lever-claims).
- **Verdict: INCOMPLETE — the pilot did not finish before closeout.** CTL is 8/8 complete; ARM is 7/8 with seed 107058 still running at 03:53Z. The frozen bars (SERVED ≥ 3, volley-rate rise ≥ +0.10, partition noSource, cost bars) bind an 8-seed-per-leg pilot. The snapshot numbers below are DESCRIPTIVE ONLY, not judged. Do not read a verdict off them.

## The mechanism (design call, frozen in the prereg)

BOWKNOW=1 mentoring in `villagerWeaponCraftDay` (`src/js/villager-build.js`): a villager at home who KNOWS the bow (lv[bow] ≥ 1) teaches one spear-holder (armed, no volley-capable ranged weapon) per duty day; the learner still needs materials and still faces the blind 35% craft roll. The stash/communal pile stays unseen; the departure craft still never seeds. Default OFF in live play; the turn-on decision is the coordinator's, NOT this arm's. Pack-seeing was the first freeze and was passed over pre-sim with reason (the duty autoEquips every home villager each call, so a pack bow is seated and seen the next duty day — at most one day of acceleration). The stash/armory alternative is closed by design (individual ownership, Steve 2026-10-09; spearstage measured fromStash/fromArmory 0).

Canon: `docs/CANON.md` read. No canon doc covers launch gear-up, the ranged-slot rules, or weapon-craft knowledge seeding — said here rather than inventing canon. Mentoring is canon-consistent (skills are teachable villager-to-villager; bow-craft is earthly knowledge, not System magic).

## What happened to the pilot (the restart)

- 03:36Z: ctl leg launched (8 seeds). Seed 107051 completed (139d, village-lost, maxWave 4, standing 199, errors 0).
- ~03:41Z: **the VM restarted** (uptime 1 min at 03:42Z) and SIGTERM-killed the ctl leg mid-seed-2, silently — no error in its log. The per-seed corpus already written (107051) is valid.
- ~03:44Z: recovered from disk — re-ran ONLY the missing ctl seeds (107052–107058, log `bowknow-a-ctl-2.log`) and launched the full arm leg (107051–107058, BOWKNOW=1, log `bowknow-a-arm.log`) in parallel as separate processes. The killed leg's log (`bowknow-a-ctl.log`) is kept as the record of the kill.
- 03:53Z: the ctl resume leg finished cleanly (exit 0) — **ctl is 8/8 complete**. The arm leg is 7/8 with seed 107058 still running.
- Coordinator instruction (03:39Z/03:42Z): no new sweeps after ~03:45Z; analysis + evidence + everything committed by ~03:55Z. The arm leg's last seed will NOT finish by then (~80s/seed, 1 seed left). It was left RUNNING at closeout — the next run (or the coordinator) adopts it; resume commands are below. No 12–16 seed confirm is required this run in any case (coordinator: pilot verdict only; confirm is the next run's job).

## Interim snapshot (03:53Z — DESCRIPTIVE ONLY, not judged)

Completed: ctl 8/8 seeds (107051–107058), arm 7/8 seeds (107051–107057; 107058 running). Flags verified on the arm corpora (`bowknowOn: true`, `bowknowPresent: true`, `speargateOn: true`).

| Leg | Seeds | alreadyHad | fromStash | fromArmory | crafted | craftedFail | noSource | spearSeen | spearPassed | staged |
|---|---|---|---|---|---|---|---|---|---|---|
| ctl | 8 | 195 | 0 | 0 | 0 | 8 | 255 | 108 | 108 | 0 |
| arm | 7 | 165 | 0 | 0 | 0 | 8 | 248 | 101 | 101 | 0 |

**Staged is 0 on BOTH legs across all 15 completed seeds.** The gate passes every spear-holder (pass rate 108/108 ctl, 101/101 arm), but no departure on either leg was served a bow from any source — fromStash 0, fromArmory 0, crafted 0. Mentoring has not moved any departure outcome yet: the arm's noSource/craftedFail counts track the ctl's (the alreadyHad/noSource totals differ only because the arm is one seed short, not because any departure changed source). The pool is far above the floor (spearSeen 108 ctl vs floor 10). On the observed seeds this reads as served-0 — but the frozen verdict needs the full 8-seed arm leg plus the volley-rate comparison, which is uncomputed until the analyzer runs on complete legs.

Wall numbers (completed seeds): ctl days [139,150,150,111,150,150,150,150], maxWave 5, wave5 4/8, national 0/8, wins 0/8, deaths 854, community lost 2/8, instrument errors 0. Arm (7 seeds): days [139,150,150,111,150,150,150], maxWave 5, wave5 3/7, national 0/7, wins 0/7, deaths 760, community lost 2/7, instrument errors 0.

## Metric review (owed; the pilot is unjudged, so this is a placeholder for the judging run)

- The partition noSource formula (`arm.noSource ≈ ctl.noSource − (arm.staged − ctl.staged)`) is implemented in the analyzer and pinned by selftest (served=5 → GO). Its first live test is this pilot's judging run.
- The analyzer has NOT been run on the pilot corpora. When the legs finish, run it plus the panel builder and judge strictly against the frozen prereg bars. If the pilot is GO, the 12–16 seed confirm is the NEXT run's job, not this one.
- Owed but not done this run: re-run the landed proofs (`test-spearstage-a.js`, `test-speargate-a.js`, `test-bowcraft-a.js`) on this base before merge. The new change is additive behind a default-off flag and the proof test's M3 shows flag-off byte-identity of the duty's records, but the re-runs are still owed.

## Files

- Prereg: `evidence/2026-11-19/sim-bowknow-a-prereg.md`
- Proof test: `scripts/test-bowknow-a.js` (19/19)
- Instrument: `scripts/bowknow-driver-a.js`, `scripts/analyze-bowknow-a.js` (selftest 49/49), `scripts/build-bowknow-panels-a.js`
- Per-seed corpora: `evidence/2026-11-19/perseed-bowknow-a-ctl/` (8/8: 107051–107058), `evidence/2026-11-19/perseed-bowknow-a-arm/` (7/8 at commit time: 107051–107057; 107058 landing from the still-running leg)
- Sweep logs: `evidence/2026-11-19/bowknow-a-ctl.log` (killed by the restart) / `.err`, `bowknow-a-ctl-2.log` / `.err` (resume), `bowknow-a-arm.log` / `.err`
- Analysis: NOT YET RUN — `evidence/2026-11-19/bowknow-a-analysis.json` does not exist yet
- Panels: NOT YET BUILT — `bowknow-a-panel-*.json.gz` do not exist yet

## Resume commands (for the next run / coordinator adoption)

The arm leg's last seed (107058) was still running at closeout. If it died, re-run ONLY that seed (the driver refuses to overwrite finished per-seed files):
- arm seed 107058 only: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 BOWKNOW=1 MODE=arm OUTDIR=perseed-bowknow-a-arm SEEDS=107058 RUN=bowknow-a node scripts/bowknow-driver-a.js`
- (ctl is 8/8 complete and needs no resume.)
- Then judge: `node scripts/analyze-bowknow-a.js --ctl evidence/2026-11-19/perseed-bowknow-a-ctl --arm evidence/2026-11-19/perseed-bowknow-a-arm --out evidence/2026-11-19/bowknow-a-analysis.json`
- Then panel: `node scripts/build-bowknow-panels-a.js --out evidence/2026-11-19/bowknow-a-panel --before evidence/2026-11-19/perseed-bowknow-a-ctl --after evidence/2026-11-19/perseed-bowknow-a-arm --seeds 107051,107052,107053,107054,107055,107056,107057,107058` + `node scripts/balance-panel.js compare --before evidence/2026-11-19/bowknow-a-panel-before.json.gz --after evidence/2026-11-19/bowknow-a-panel-after.json.gz --out evidence/2026-11-19/bowknow-a-panel`
- Then update THIS evidence file: replace the INTERIM banner with the verdict, fill the frozen-bars table, and write the metric review.
