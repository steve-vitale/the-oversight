# sim-partysize4-confirm-b — PARTYSIZE4 16-seed confirm (Loop B 2330Z run)

## Verdict: NO-GO METRIC-BROKEN — arm pool floor missed by one launch, mechanism passed everywhere it could be observed

**Frozen prereg:** `evidence/2026-11-18/sim-partysize4-confirm-b-prereg.md` (commit `6de84c101`).
**Lever commits (on master, env-gated):** `1032897dc` (win-plan half) + `a9a4108fe` (brain half); partyQuads counter re-land `83db8255f`. No game-code change in this arm — measurement confirm only.
**Analysis:** `evidence/2026-11-18/partysize4-confirm-b-analysis.json` (analyzer verdict GO on its coded bars).
**LAUNCHSURVIVE report:** `evidence/2026-11-18/partysize4-confirm-b-launchsurvive.json` (text report).
**Panel:** `evidence/2026-11-18/partysize4-confirm-b-panel.md` (decision `review_required`).
**Corpora:** `evidence/2026-11-18/perseed-partysize4-confirm-b-survey-ctl/` (control leg — the pre-freeze survey, 16 files) + `perseed-partysize4-confirm-b-arm/` (16 files), 0 instrument errors, 0 stderr on all four sweep calls.
**Proofs:** `scripts/test-partysize4-confirm-b.js` **51/51**, `scripts/test-partyquads-b.js` 29/29, `scripts/analyze-partysize4-b.js --selftest` 12/12. `scripts/test-partysize4-b.js` 41/42 — the §1 frozen-diff leg fails on master drift only (see Proofs below).

The confirm does NOT deliver a GO for the turn-on decision (finding #2565) on its own frozen terms: the arm leg launched **11** wave-4+ parties against a frozen arm pool floor of **12** — one short. §14 binds: a miss is NO-GO, never re-scored against a friendlier metric mid-run. But the miss is a pool miss, not a mechanism miss: the arm leg's **9 quads were counted 9/9 (ratio 1.00, per-seed exact 16/16)**, the control leg launched 0 quads and counted 0, trio accounting is exact 16/16 on both legs, and every cost bar passes. The mechanism evidence is now 20/20 quads counted across pilot + confirm (11/11 + 9/9). What the confirm establishes is that the lever works flawlessly whenever it fires — and that on a launch-skewed band it fires rarely, because the arm leg's launch pool collapses on the rich seeds (see #2557 follow-up). The turn-on decision now has a cleaner question than "does the counter work" (answered: yes, twice): "is one launch short of an arbitrary floor worth another 16-seed band, or does the 20/20 mechanism evidence carry it?"

## The lever, in plain words

A village strong enough to hunt the biggest monsters can now send **four** villagers on a hunt instead of three — but only for the biggest monsters (wave 4 and up), and only when the hunt is planned at dawn. The fourth seat is a real seat: the fourth villager travels with the party, their name is carried through the dawn plan into the departure, and the village's tally of four-person hunts (`partyQuads`) goes up by one for every four-person launch, on both ways a hunt can leave the village.

## What happened, seed by seed

| Seed | Ctl launches (wave-4+) | Arm launches (wave-4+) | Arm quads | Ctl standing / days | Arm standing / days |
| --- | --- | --- | --- | --- | --- |
| 104730 | 0 | 0 | 0 | 125 / 114d lost | 125 / 114d lost |
| 104731 | 0 | 0 | 0 | 125 / 67d lost | 125 / 67d lost |
| 104732 | 2 (2 trios) | 2 (2 trios) | 0 | 199 / 151d | 199 / 151d |
| 104733 | 19 | 2 | **2** (d85, d107 strike) | 535 / 151d | 440 / 151d |
| 104734 | 0 | 0 | 0 | 350 / 146d lost | 350 / 146d lost |
| 104735 | 0 | 0 | 0 | 175 / 110d lost | 175 / 110d lost |
| 104736 | 0 | 0 | 0 | 199 / 109d lost | 199 / 109d lost |
| 104737 | 0 | 0 | 0 | 220 / 151d | 220 / 151d |
| 104738 | 0 | 0 | 0 | 465 / 151d | 465 / 151d |
| 104739 | 0 | 0 | 0 | 175 / 151d | 175 / 151d |
| 104740 | 0 | 0 | 0 | 350 / 151d | 350 / 151d |
| 104741 | 0 | 0 | 0 | 199 / 150d | 199 / 150d |
| 104742 | 12 | 3 | **3** (d76, d85, d91) | 275 / 151d | 175 / 103d lost |
| 104743 | 5 | 3 | **3** (d75, d78, d82 eulogy) | 199 / 95d lost | 199 / 131d |
| 104744 | 2 | 1 | **1** (d75 reunion) | 325 / 150d | 175 / 111d lost |
| 104745 | 0 | 0 | 0 | 100 / 150d | 100 / 150d |

Eleven of sixteen seeds are trajectory-identical across legs (same days and standing on 104730, 104731, 104732, 104734–104741, 104745) — the legs differ only where the lever fires, which is exactly the drift behaviour a clean lever should show. The arm leg launched far fewer parties overall (11 vs 40) but 9 of its 11 were quads; the control leg launched 0 quads out of 40.

### The nine quads

- **104733, d85 — stan_kowalski vs the strike** (companion katarina_novak). Same holder/day/target as the control leg's d85 trio — the ONLY difference is the fourth seat. A second quad followed **d107** (strike again).
- **104742, d76 — nikos_papadopoulos vs the algorithm; d85 — app_mgpspjyn38 vs the eater; d91 — nikos_papadopoulos vs the eater.** Three quads in 15 days — the launch-rich seed refutes any uniform post-quad suppression (see #2557 below).
- **104743, d75/d78/d82 — app_mgpspi5i94 vs the eulogy**, three quads in 7 days.
- **104744, d75 — luis_fernandez vs the reunion.** Same holder/day/target as control's d75 trio.

The launchsurvive trace confirms the cleanest possible lever isolation again: on 104732, 104733, 104742, 104743 and 104744 the SAME holder launches against the SAME target on the SAME day on both legs — trio on control, quad on arm. The divergence starts at the launch, never before it (D3 smoke clean on all 16 seeds: first divergence day is always after the first world-tick seed day, on the four seeds that diverge at all).

### Why 104732 did not convert (availability-gated, not a misfire)

Both of 104732's arm launches stayed trios (`companion3: null`, `partyQuads` 0). The dawn pool snapshot for the d75 launch explains it: roster 9, five members away, only maya_singh eligible as a companion at Haven — there was nobody left to fill the fourth seat. The lever correctly does not force a quad when no fourth villager is available. Quad conversion is availability-gated: 9/11 on this band (pilot: 11/16). The two non-conversions are the 104732 trios.

## Judgement against the frozen prereg

| Bar | Result | Detail |
| --- | --- | --- |
| Pool floor (ctl ≥16; arm ≥12; ≥1 arm quad) | **FAIL — arm 11 < 12** | ctl 40, arm 11, arm quads 9. The control floor passes with room (40 ≥ 16); the arm floor misses by ONE launch. Per the prereg this is NO-GO (METRIC-BROKEN), never a pass on a thin pool |
| Primary quad-fire (arm `partyQuads` ≥95% of observed; ctl 0/0; per-seed exact ≥15/16) | **PASS** | arm 9/9 = 1.00; ctl 0/0; per-seed exact 16/16 |
| No misfire | **PASS** | arm `partyQuads` 9 == observed 9; 0 on every no-quad seed |
| Trio accounting (per-seed `partyTrios` == observed ≥3, ≥15/16 each leg) | **PASS** | ctl 16/16, arm 16/16 |
| Cost — starvation (arm ≤ ctl+2) | **PASS** | total 5 vs 6; villager 5 vs 6 |
| Cost — median survival (arm ≥0.8× ctl) | **PASS** | 148d vs 150d (0.99×) |
| Cost — community loss (arm ≤ ctl+16) | **PASS** | villages lost arm 8 vs ctl 6 (≤ 22). The panel's regression_watch row on this metric is investigated below |
| Instrument (0 errors; 16/16 files; missingHp 0 on fought rows; `v4launchTrack` present) | **PASS with note** | errors ctl 0 / arm 0; 16/16 files both legs; `v4launchTrack` present on all 32 files (1425 ctl rows, 891 arm rows). missingHp: 0 on non-vKill fought rows both legs; 22 ctl / 18 arm fought rows lack `mHpStart` — ALL are vKill rows whose share is 1.0 by definition. The launchsurvive judge's own instrument bar reads fail on its hardcoded 8-seed expectation (see below) — reported, not a prereg bar |

Counts by leg: ctl 40 launches (7 pairs, 33 trios, 0 quads), `partyTrios` 33, `partyQuads` 0; arm 11 launches (0 pairs, 2 trios, **9 quads**), `partyTrios` 11, `partyQuads` 9. Quad conversion 9/11 = 0.82 (pilot 11/16 = 0.69).

## Wall numbers (both legs pooled, 16 seeds each)

| | Control | Arm |
| --- | --- | --- |
| Wins (full seat) | 0 | 0 |
| National scale | 0 | 0 |
| Wave 5 reached | 7 | 5 |
| Wave 4 reached | 16 | 16 |
| Standing ≥200 | 7 | 5 |
| Median survival | 150d | 148d |
| Survived 150d | 10 | 8 |

No village took the full seat on either leg; no village reached national. The arm leg is behind on wave-5 reach (5 vs 7) and standing ≥200 (5 vs 7) — small-n, and both gaps trace to the two community-loss flips below (104742, 104744), not to a systematic wall movement.

## Balanced panel

`node scripts/balance-panel.js compare` → decision **review_required** (screen-only, 16 paired cases). One `regression_watch` row: community loss 0.375 → 0.5 (paired delta +0.125, 95% exploratory interval 0 to 0.3125 — the interval touches 0 at its low end). Investigated and NOT established as a lever cost: the two flips are both quad seeds (104742: ctl survived 151d → arm lost d103; 104744: ctl survived 150d → arm lost d111), but the arm villages died with FEWER total deaths (104742: 70 vs 109; 104744: 81 vs 98) — roster collapse earlier, not a bigger massacre — and monster-combat deaths were LOWER on the arm leg on both seeds (104742: 34 vs 47; 104744: 34 vs 39), so there is no Haven-massacre-while-hunters-were-away smoking gun. On 104742 the last quad launched d91 and the village was lost d103; on 104744 the only quad launched d75 and the village was lost d111, its holder dying "in the wild" d96. Two discordant pairs in one direction with zero in the other is weak evidence (exact two-sided p ≈ 0.5 for 2 vs 0); the frozen cost bar passes (8 ≤ 6+16). Disposition: flagged and watched, not a lever cost — but the next arm on this lever should check whether quad expeditions thin Haven defence, because both flips sit on quad seeds. All other observed metrics `no_material_signal` (national 0 → 0, wins 0 → 0, village deaths per run 87.3 → 84.5, per 100 days 66.3 → 65.7). The panel is the instrument, the prereg is the judge — the judge is the pool floor, which misses by one.

## Finding #2557 follow-up — plan seeding after a quad (REPORTED, not binding)

Question: do arm villages seed fewer launchable plans after a quad on drought seeds (`dawnbidCensus` / `v4seeds` arm vs ctl on seeds where the arm goes quiet after a quad)?

| Seed | First quad | Arm launches in 30d after | Ctl launches, same window | dawnbidCensus arm / ctl | v4seeds w4+ arm / ctl |
| --- | --- | --- | --- | --- | --- |
| 104733 | d85 | **1** (d107 quad) | 4 | 129 / 302 | 15 / 38 |
| 104742 | d76 | **2** (d85, d91 quads) | 4 | 122 / 403 | 17 / 36 |
| 104743 | d75 | **2** (d78, d82 quads) | 4 | 115 / 63 | 9 / 19 |
| 104744 | d75 | 0 | 1 | 80 / 212 | 5 / 21 |

**Answer: the seeding gap REPRODUCES on the rich seeds, but no total launch drought follows it.** On 104733, 104742 and 104744 the arm leg seeds far fewer wave-4 plans than control (census roughly a third; w4+ seed events roughly half or less) — the gap opens at seeding, not at launch, exactly as the pilot's metric review predicted. But the arm leg keeps launching quads after a quad on three of the four quad seeds (104733 d107, 104742 d85+d91, 104743 d78+d82), so the drought itself stays MIXED, not systematic. The one seed where the arm goes quiet after a quad (104744: 0 vs 1) is a one-launch difference, not a drought. The 104732 control case sharpens the picture: identical launches, identical census (115=115) and identical v4seeds (36=36) on both legs — where the lever never fires, nothing diverges at all. **Proposed status for the coordinator to file: #2557 ANSWERED-as-mixed, with the seeding gap now a named follow-up** — the arm leg seeds fewer wave-4 plans after a quad on launch-rich seeds (104733/104742/104744), while still launching quads after quads; the mechanism behind the seeding gap (fewer fight-seed events? holder deaths? standing divergence?) is unestablished and wants its own diagnostic, not a lever repair.

### Did the fourth villager actually fight?

No new evidence: size-4 damage share is **n=0 on both legs** — no launched size-4 meeting was joined to a fought encounter in the analyzer's 21-day window (the launchsurvive tracker found 1 traveled-and-found arm launch, the 104732 trio, not a quad). The quads launched but their fights were not captured as expedition meetings: tracker classes on the arm leg are 3 died-en-route, 1 still-open, 1 traveled-and-found (the trio). Finding #2559 stands — the fourth member travels but the fight still caps at the usual ally count, and this confirm adds zero fought size-4 meetings to the record. The fight-ally-cap arm (#2515) still owns that question.

## LAUNCHSURVIVE report, read honestly

`scripts/analyze-launchsurvive-a.js` on the two corpus dirs. Its overall verdict reads NO-GO, driven by its own instrument bar (`pass: false`) — but every underlying instrument measure is clean: errors 0/0, files 16/16, coverage 1.0, **tracker gaps 0/0** (the rerun's 1 arm gap is gone). The bar fails ONLY because it hardcodes `files === 8 && seeds === 8`; this run has 16. That is a hardcoded 8-seed expectation, not an instrument failure — reported, not a prereg bar. Its power bar passes (5 on-leg tracker launches ≥ 3), classification passes (every launch in exactly one class), D3 clean on all 16 seeds. The launchsurvive "launches" (9 ctl / 5 arm) are tracker instances, a subset of the `v4departs` census (40/11) — the two instruments count different things and must not be compared as if they were the same number.

## Sense-test

Read the vetSays rows from the arm corpora (748 rows). The dialogue reads like people, not a counter: door-defence reports name the villagers who fought and who came back hurt ("Arlo, Nicole, Cheryl, Ethan and Ursula met them at the door — 4 put down, 1 barely walked away"), the System's showmanship tracks the story ("Jorge just put down Ugly-Eyes... on CAMERA. That's a veteran kill, folks. REMEMBER the name"), and the wave-4 arc lines land ("Four waves. FOUR. The producers are — okay, I'm saying it: FINALES need a NATION"). Nothing robotic flagged. The one thing the narration never says is that a fourth villager joined a hunt — the 34 "four/fourth" rows are all "4 put down" kill counts or "Four waves"; no line marks a fourth joiner (finding #2558 stands: a fourth-seat line is still owed if the lever turns on for real). One terse line ("You don't stroll through the Pack-leader Old Loud") reads like a fragment, but it is a System aside, not a broken sentence in dialogue — noted, not flagged.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'perseed-partysize4-confirm-b-arm/*.json' --metrics national,table,wins,exiled` **refused** the input: "refusing recorder-corpus input: all 16 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs." Same documented refusal as the rerun; the baseline was **not** rolled. Wall numbers above are reported from the analyzer instead.

## Proofs and negative control

- `scripts/test-partysize4-confirm-b.js`: **51 passed, 0 failed, 0 skipped** (after the sweep: lever statics, corpus integrity incl. the two-anchor src-identity check, measurement replication vs the analyzer, the frozen floor judgement asserted honestly as NO-GO METRIC-BROKEN, #2557 numbers, live quad rows, launchsurvive + panel checks).
- `scripts/test-partysize4-b.js`: **41 passed, 1 failed, 0 skipped** on this tip. The failure is §1 only — "src/js diff vs frozen prereg is exactly win-plan.js + villager-brain.js" — the diff now also includes build.js, fieldFights.js and godpath.js, which changed under unrelated landed work since the 1735Z freeze (e.g. `a519253b9` food-gate instrumentation, finding #2557-A). The lever files are still in the diff and every §5 quad-fire leg passes; the frozen-diff expectation is stale, not the lever. Documented in the prereg, not chased.
- `scripts/test-partyquads-b.js`: **29 passed, 0 failed, 0 skipped** on this tip.
- `scripts/analyze-partysize4-b.js --selftest`: 12 passed.
- No `check.js --quick` run this round (time: the arm sweep finished ~00:45Z; no src changed in this arm — the only new/changed files are scripts/evidence). A fresh gate run belongs to the landing/adoption step, not this measurement confirm.
- Negative control: not re-run this round — the 1735Z negative control (lever stashed → forced test fails, driver refuses) already proved the lever's presence is load-bearing, and the source is unchanged since the rerun.

## Infrastructure notes

- **Background exec SIGTERM (~25 min):** the first survey exec (16 seeds in one call) was killed by SIGTERM at ~25 min with 11 seeds done; the remaining 5 seeds ran clean in a second call. No seed was run twice; the 16 survey files are one anchor (`046ae5859128`). The arm leg was chunked into two 8-seed calls to stay under the kill and both finished clean. Future sweeps on this box should chunk to ≤8 seeds per exec call.
- **Index clobber struck twice** after safe-commit.sh commits (committed files showing staged-as-deleted, byte-identical to HEAD); repaired both times with the `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info` pipe; status empty + hash matches after each repair. Also: safe-commit.sh does NOT accept directory paths — the survey corpus commit needed an expanded file list (known quirk, AGENTS.md).
- **Two anchors, one codebase:** the survey ran on master `046ae5859` (pre-freeze) and the arm leg on `7f00f2762` (post-prereg + corpus commits). The diff between the anchors touches only evidence/ + the panel-builder script — no src/ changes — so both legs ran identical game code. The proof test asserts this directly.
- **Write flap:** no flap observed during this run (all writes landed first try, including the prereg commit at 00:25Z).
- Heartbeat: not run — the registry heartbeat script hung on flock contention in the rerun; this run's worktree was created by the coordinator and no heartbeat was attempted from this arm.

## Metric review (docs/MEASUREMENT.md §14)

- **Primary metric held as frozen:** quad-fire ratio at the tightened 0.95 bar + derived pool floor. The ratio passed decisively (9/9 = 1.00); the floor failed by one launch on the arm leg (11 < 12). The verdict is therefore NO-GO METRIC-BROKEN under the frozen prereg, even though the analyzer's own coded bars (floor 6/leg, ratio 0.80) all pass and read GO. The prereg is the judge; the analyzer is the instrument. The floor did its job as designed — it stopped a thin-pool pass — but the miss is by one launch on a floor that was itself a scaling choice (6-on-8 → 12-on-16), not a measured threshold: the band staged a real pool on the control leg (40 launches) and the arm leg's 11 launches carried 9 quads. A future prereg should set the arm floor from the pilot's measured arm/ctl ratio (0.55 × measured control total ≈ 22 here, which the arm leg would still have missed at 11 — the ratio itself collapsed on this band, 11/40 = 0.275) rather than from a flat scaling, and should say in advance whether a one-launch miss on a scaled floor is a re-run trigger or a verdict. That decision is for the coordinator, not this run.
- **What the next run should change (for the next prereg, not this one):** (1) the arm pool floor should be derived from the pilot's measured arm/ctl ratio, not a flat 6-per-8 scaling — the ratio is what collapsed here (0.275 vs 0.55 pilot), and a floor that anticipates it would have set the expectation honestly. (2) The #2557 seeding gap wants its own diagnostic: instrument WHY the arm leg seeds fewer wave-4 plans after a quad (fight-seed outcomes? holder survival? standing divergence?) — the gap reproduces on 3 of 4 quad seeds and is now the binding unknown, not the counting. (3) The launchsurvive instrument bar's hardcoded 8-seed expectation should take the seed count as a parameter before the tracker is used as a judge on a 16-seed run. (4) The fourth-seat spoken line (#2558) is still owed before turn-on. (5) The community-loss flips on quad seeds (104742, 104744) want a Haven-defence check on the next arm.
- **No metric was re-scored mid-run.** The verdict above is the frozen prereg's verdict. One clarification, not a re-score: the analyzer's coded pool-floor text ("6 launches/leg") is the 1735Z floor; the prereg's derived floor (ctl ≥16, arm ≥12) is stricter and binds — the arm leg passes the analyzer's floor and fails the prereg's, and the prereg's failure is the verdict.

## Blanks filled / documented

- Finding #2565 (turn-on decision): **NOT supported as a GO by this confirm** — the frozen floor binds at NO-GO METRIC-BROKEN (arm 11 < 12), though the mechanism passed 9/9 and the combined pilot+confirm evidence is 20/20 quads counted. The coordinator's call is now: re-run on a richer band, or carry the 20/20 mechanism evidence over a one-launch floor miss.
- Finding #2557 (post-quad launch drought): **seeding gap reproduced, drought still mixed** — the arm leg seeds far fewer wave-4 plans after a quad on 104733/104742/104744 (census ~1/3 of control) yet keeps launching quads after quads on 3 of 4 quad seeds. Proposed status: ANSWERED-as-mixed, with the seeding gap as a named follow-up (coordinator to file).
- Finding #2558 (fourth-seat spoken line): still open — recurs in the sense-test (34 "four" rows, none a joiner line). Not this run's lever.
- Finding #2559 (quad fights cap at the usual ally count): stands — size-4 damage share n=0 on both legs; no fought size-4 meeting was captured.
- **New findings for the coordinator to file (sim-findings.md):**
  - [open] 2026-11-18 — winnability chain / wave-4 plans — WAVE-4 PLANS SEED BUT NEVER LAUNCH ON MOST SEEDS: on band 104730–104745, 11 of 16 control villages launch zero wave-4+ parties in 150d, yet several seed wave-4 plans freely (104734: 11 wave-4+ seed events — strike, audit, eater, congregation, eulogy — maxWave 5, standing 350, 0 wave-4 launches; 104738: maxWave 5, standing 465, 0 launches). The plans exist; the departs never carry needWave ≥ 4. The launch funnel from seed to depart on launch-poor seeds is unmeasured. (run sim-partysize4-confirm-b, evidence/2026-11-18/sim-partysize4-confirm-b.md)
  - [open] 2026-11-18 — measurement / instruments — LAUNCHSURVIVE INSTRUMENT BAR HARD-CODES 8 SEEDS: `analyze-launchsurvive-a.js` judges `files === 8 && seeds === 8`, so on a 16-seed run its instrument bar reads fail (and the report verdict NO-GO) even with errors 0, gaps 0, coverage 1.0. The bar should take the seed count as a parameter before the tracker is used as a judge on a wider band. (run sim-partysize4-confirm-b, evidence/2026-11-18/partysize4-confirm-b-launchsurvive.json)
  - [open] 2026-11-18 — winnability chain / party size — QUAD EXPEDITIONS AND HAVEN DEFENCE: both community-loss flips in the confirm sit on quad seeds (104742: ctl survived 151d → arm lost d103 after 3 quads; 104744: ctl survived 150d → arm lost d111 after 1 quad). No smoking gun (monster-combat deaths were lower on the arm leg; villages died with fewer total deaths), but the panel flagged community loss as regression_watch and the next arm should check whether sending four villagers out at a time thins Haven defence. (run sim-partysize4-confirm-b, evidence/2026-11-18/sim-partysize4-confirm-b.md)
  - [open] 2026-11-18 — infrastructure — BACKGROUND EXEC SIGTERM AT ~25 MIN: a 16-seed driver exec was killed by SIGTERM at ~25 min (11 seeds done, no error, no OOM signature); the remaining seeds ran clean in a second call. Sweeps on this box should chunk to ≤8 seeds per exec call until the limit is understood. (run sim-partysize4-confirm-b)

## Convergence state

**Not converged — confirm NO-GO METRIC-BROKEN on a one-launch floor miss.** The lever's formation + counting mechanism is now demonstrated on three bands (1735Z: 2/2 quads; rerun: 11/11; this confirm: 9/9; per-seed exact 16/16 here, 8/8 there). What remains before turn-on is the coordinator's call on the floor miss — a re-run on a richer band, or carrying the 20/20 mechanism evidence — plus the open follow-ups: the #2557 seeding-gap diagnostic, the #2558 spoken line, the #2515 fight-ally cap, and the Haven-defence check on the community-loss flips. No further measurement arm on this lever without a new lever to test (standing rule).
