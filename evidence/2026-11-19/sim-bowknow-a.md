# sim-bowknow-a — NO-GO (finding #2590 serve half: mentoring does not serve)

- **Arm:** sim-bowknow-a (BUILD + MEASURE pilot — finding #2590's OPEN serve half: bow-knowledge reach for spear-holders), scale-onramp axis
- **Run:** fleshout-20261120T0215Z (Loop A)
- **Prereg:** `evidence/2026-11-19/sim-bowknow-a-prereg.md` (frozen ~03:40 UTC, mechanism corrected pre-sim ~03:53 UTC — mentoring, not pack-seeing; bars, seeds, policies unchanged). Commit `8e1cd3843`.
- **Proof test:** `scripts/test-bowknow-a.js` — **19/19 GREEN** (flag off = no teaching, byte-identical repeat; flag on = spear-holder gains lv[bow] = 1 with `weapon_teach` telemetry + witnessed line; communal-pile bow seeds nothing; equipped bow still seeds by seeing on both legs).
- **Analyzer:** `scripts/analyze-bowknow-a.js` — selftest **49/49** (partition noSource formula, gate-on-both-legs judge; served=5 pins GO under the partition formula).
- **Driver:** `scripts/bowknow-driver-a.js` (clone of the speargate driver; SPEARGATE=1 on both legs, BOWKNOW decides the leg; RUN=bowknow-a). **Panel builder:** `scripts/build-bowknow-panels-a.js` (band 107051–107058; one fix after first run — the filename prefix was left as `speargate-a-s` by the blind clone and the builder threw ENOENT; corrected to `bowknow-a-s`, re-run clean).
- **Band:** fresh 107051–107058 (8 seeds × 2 legs, 150d, competent verbatim; substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1`; BOWCRAFT always-on in code). Freshness verified pre-freeze (0 hits across evidence, preregs, sim-findings, convergence-tracker, lever-claims).
- **Verdict: NO-GO** — the gate replicates perfectly on both legs and every cost bar passes, but mentoring serves nothing: SERVED 0, volley-rate rise +0.030, and both consistency bars miss by 1 over tolerance. Killed cleanly per the frozen bars; no re-scoring. No 12–16 seed confirm (coordinator: pilot verdict only; confirm is the next run's job — and a NO-GO has nothing to confirm).

## The mechanism (design call, frozen in the prereg)

BOWKNOW=1 mentoring in `villagerWeaponCraftDay` (`src/js/villager-build.js`): a villager at home who KNOWS the bow (lv[bow] ≥ 1) teaches one spear-holder (armed, no volley-capable ranged weapon) per duty day; the learner still needs materials and still faces the blind 35% craft roll. The stash/communal pile stays unseen; the departure craft still never seeds. Default OFF in live play; the turn-on decision is the coordinator's, NOT this arm's. Pack-seeing was the first freeze and was passed over pre-sim with reason (the duty autoEquips every home villager each call, so a pack bow is seated and seen the next duty day — at most one day of acceleration). The stash/armory alternative is closed by design (individual ownership, Steve 2026-10-09; spearstage measured fromStash/fromArmory 0).

Canon: `docs/CANON.md` read. No canon doc covers launch gear-up, the ranged-slot rules, or weapon-craft knowledge seeding — said here rather than inventing canon. Mentoring is canon-consistent (skills are teachable villager-to-villager; bow-craft is earthly knowledge, not System magic).

## Frozen bars (prereg)

| Bar | Result | Pass |
|---|---|---|
| 0. Pool floor: arm spearSeen ≥ 10 | 108 | YES |
| 1. Gate replication: arm spearPassed/spearSeen == 1.0 | 108/108 = 1.000 | YES |
| 2. Gate replication: ctl spearPassed/spearSeen == 1.0 | 108/108 = 1.000 | YES |
| 3. alreadyHad consistency ±3 | arm 199 vs ctl 195 (delta 4) | **NO** |
| 4. noSource consistency ±3 (PARTITION formula) | arm 259 vs 255 − (0 − 0) = 255 (delta 4) | **NO** |
| 5. **SERVED: arm.staged − ctl.staged ≥ 3** | arm 0 − ctl 0 = **0** | **NO** |
| 6. **Volley-rate rise arm − ctl ≥ +0.10** (pair-inclusive) | 0.364 − 0.333 = **+0.030** | **NO** |
| 7. Cost: kill share ≥ ctl − 0.05 | 0.045 (1/22) vs 0.000 (0/21) | YES |
| 8. Cost: damage/round ≥ 0.9× ctl | 39.2 vs 31.6 | YES |
| 9. Cost: deaths per engaged meeting ≤ ctl × 1.10 | 38.73 vs 40.67 (×1.10 = 44.73) | YES |
| 10. Cost: community loss ≤ ctl + 0.125 | 2/8 vs 2/8 | YES |
| 11. Cost: starvation ≤ ctl + 2 | 2 vs 3 (villager 2 vs 3) | YES |
| 12. Cost: median survival ≥ 0.8× ctl | 150d vs 150d | YES |

## What the numbers say

**Mentoring teaches on a staged village and serves nothing in live play.** The gate is exact on both legs (108/108 passed each), the pool is ten times the floor, and nothing is served from any source on either leg: fromStash 0, fromArmory 0, crafted 0 — 108 passed spear-holders on the arm leg, 0 bows in their hands. The volley rate barely moves (+0.030 on a 21→22-meeting pair population, 7→8 volleys) and the trio+ volley share actually falls (0.25 → 0.10 on 12→10 meetings) — thin-population noise, not a mechanism. Every cost bar passes, but trivially: with nothing served, the arm leg is nearly the ctl leg (panel: no material signal on any metric; village deaths 106.75 → 106.5, community loss 0.25 → 0.25, national 0 → 0, wins 0 → 0).

**The consistency deltas (+4/+4) are a divergence story, not a second failure.** The arm leg records 9 more departures total than ctl (467 vs 458) — alreadyHad +4 AND noSource +4. The legs are seeded-identical and differ only by BOWKNOW, but mentoring changes knowledge records, which changes which craft attempts fire, which consumes `Math.random` differently downstream — so the RNG streams diverge and departure counts drift. Three seeds carry the drift (107055: standing 480 → 535, deaths 88 → 102; 107056: alreadyHad 49 → 42; 107058: standing 425 → 250, craftedFail 0 → 1). The one extra failed craft on the arm leg (craftedFail 9 vs 8, on seed 107058) is consistent with a taught spear-holder attempting the 35% roll and failing — but the corpora do not record lv[bow] reach, so that stays a hypothesis, never a claim. The bars fail as frozen (a miss is NO-GO, never re-scored), and the mechanism bars fail decisively on their own — the verdict does not turn on the consistency bars.

**Why nothing is served — the honest read:** the proof test proves a knower CAN teach a spear-holder. In live play, either no knower is ever home with a spear-holder on this band, or those taught lack materials / fail the 35% roll. The pilot cannot distinguish the two — the instrument gap is named in the metric review. What it proves is the outcome: on 8 paired seeds, mentoring puts zero bows into spear-holders' hands at departure. **#2590 stays OPEN on the serve half.** The next lever is departure-site seeing (a party-mate's bow visible while gearing up, seeding before the craft attempt) — the one path that seeds exactly at the moment the craft is attempted — or a direct measure of lv[bow] reach first, so the next arm knows whether teaching ever fires.

## Per-seed staging

| Seed | Days | End | Standing ctl→arm | Max wave | spearSeen (ctl/arm) | spearPassed | alreadyHad ctl→arm | crafted | craftedFail ctl→arm | noSource ctl→arm |
|---|---|---|---|---|---|---|---|---|---|---|
| 107051 | 139 | village-lost | 199 → 199 | 4 | 34 / 34 | 34 | 7 → 7 | 0 | 2 → 2 | 65 → 65 |
| 107052 | 150 | survived | 365 → 365 | 5 | 0 / 0 | 0 | 26 → 26 | 0 | 5 → 5 | 29 → 29 |
| 107053 | 150 | survived | 199 → 199 | 4 | 13 / 13 | 13 | 42 → 42 | 0 | 0 → 0 | 21 → 21 |
| 107054 | 111 | village-lost | 199 → 199 | 4 | 0 / 0 | 0 | 10 → 10 | 0 | 0 → 0 | 13 → 13 |
| 107055 | 150 | survived | 480 → 535 | 5 | 6 / 6 | 6 | 15 → 23 | 0 | 1 → 1 | 5 → 8 |
| 107056 | 150 | survived | 199 → 199 | 4 | 0 / 0 | 0 | 49 → 42 | 0 | 0 → 0 | 26 → 24 |
| 107057 | 150 | survived | 635 → 635 | 5 | 48 / 48 | 48 | 15 → 15 | 0 | 0 → 0 | 88 → 88 |
| 107058 | 150 | survived | 425 → 250 | 5 | 7 / 7 | 7 | 31 → 34 | 0 | 0 → 1 | 8 → 11 |

Seeds 107051–107054 and 107057 are byte-identical on staging between legs. Seed 107057 carries 48 of the 108 spear departures. Days, standing, and deaths are identical between legs on every seed except the three drift seeds above.

## Panel (instrument)

- Built `bowknow-a-panel-before/after.json.gz` from the paired corpora.
- `node scripts/balance-panel.js compare` → decision `review_required`; no material signal on any metric (won 0→0, national 0→0, villageDeaths 106.75→106.5, communityLost 0.25→0.25, survival30/60 1→1). The panel confirms the legs are nearly identical; the frozen bars are the judge.

## Wall numbers (this band, per leg)

- Wave 4 reached 8/8 both legs, wave 5 reached 4/8 both, national 0/8 both, full wins 0/8 both.
- Median survival 150d both; community lost 2/8 both.
- Deaths 854 ctl / 852 arm (106.75 / 106.5 per village).

## What happened to the pilot (the restart)

- 03:36Z: ctl leg launched (8 seeds). Seed 107051 completed (139d, village-lost, maxWave 4, standing 199, errors 0).
- ~03:41Z: **the VM restarted** (uptime 1 min at 03:42Z) and SIGTERM-killed the ctl leg mid-seed-2, silently — no error in its log. The per-seed corpus already written (107051) is valid.
- ~03:44Z: recovered from disk — re-ran ONLY the missing ctl seeds (107052–107058, log `bowknow-a-ctl-2.log`, exit 0) and launched the full arm leg (107051–107058, BOWKNOW=1, log `bowknow-a-arm.log`, exit 0) in parallel as separate processes. The killed leg's log (`bowknow-a-ctl.log`) is kept as the record of the kill. Both legs finished before judging (ctl ~03:53Z, arm ~03:55Z).
- The interim evidence committed at 03:54Z (`6cfccb38`) is superseded by this file.

## Metric review

- **Consistency bars vs RNG divergence (bar design, not a re-score):** the ±3 alreadyHad/noSource bars assume seeded-identical departure counts. Any lever that changes which craft attempts fire consumes `Math.random` differently downstream, so departure counts drift (here +9 on arm, deltas +4/+4 — one over tolerance). The verdict is unaffected (SERVED and volley fail decisively), but a future arm testing a knowledge/RNG-consuming lever should use a rate-based or departure-normalized consistency bar, or a wider tolerance, and say so in its prereg. The partition formula itself behaved exactly as designed (expected 255, delta computed against staged 0) — its first live test passes.
- **Instrument gap — lv[bow] reach is unobserved:** the prereg's secondary metric (share of spear-holder departures with lv[bow] ≥ 1) is unrecorded in the corpora — the driver exports no weaponCraft record. The next serve-half arm must instrument it (export `v.weaponCraft` bow levels at departure, or a teach counter), or it will again be unable to tell "never taught" from "taught but no materials / failed roll".
- **Owed but not done this run:** re-run the landed proofs (`test-spearstage-a.js`, `test-speargate-a.js`, `test-bowcraft-a.js`) on this base before merge. The new change is additive behind a default-off flag and the proof test's M3 shows flag-off byte-identity of the duty's records, but the re-runs are still owed.
- **No confirm:** the pilot is NO-GO; there is nothing to confirm. The 12–16 seed confirm stays the next run's job only if a future arm goes GO.
- Finding #2590: stays OPEN on the serve half (gate half confirmed twice over: 49/49 spearstage, 108/108 here, both legs). Next lever named: departure-site seeing, or lv[bow]-reach instrumentation first.

## Files

- Prereg: `evidence/2026-11-19/sim-bowknow-a-prereg.md`
- Proof test: `scripts/test-bowknow-a.js` (19/19)
- Instrument: `scripts/bowknow-driver-a.js`, `scripts/analyze-bowknow-a.js` (selftest 49/49), `scripts/build-bowknow-panels-a.js`
- Per-seed corpora: `evidence/2026-11-19/perseed-bowknow-a-ctl/` + `perseed-bowknow-a-arm/` (8 JSONs each, 107051–107058)
- Analysis: `evidence/2026-11-19/bowknow-a-analysis.json`
- Sweep logs: `evidence/2026-11-19/bowknow-a-ctl.log` (killed by the restart) / `.err`, `bowknow-a-ctl-2.log` / `.err` (resume, exit 0), `bowknow-a-arm.log` / `.err` (exit 0)
- Panels: `evidence/2026-11-19/bowknow-a-panel-before.json.gz`, `...-after.json.gz`, `bowknow-a-panel.json`, `bowknow-a-panel.md` (decision `review_required`, no material signal)
- Interim evidence commit `6cfccb38` (pilot incomplete at closeout) is superseded by this file.
