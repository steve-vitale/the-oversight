# sim-deadplan-b — DIAG: does a dead plan-holder's lingering winPlan cost anything?

Run: fleshout-loop-b-20261117T0430Z, Loop B, axis winnability chain.
Worktree: `~/workspace/worktrees/sim-deadplan-b`, branch `sim-deadplan-b`.
Base: master `eb8e0cc18` (recorded in the prereg; master has since moved under Loop A — no rebase mid-run, coordinator owns landing).
Prereg: `evidence/2026-11-16/sim-deadplan-b-prereg.md` (commit `2c59164ff`).
Instrument: `scripts/deadplan-driver-20261117.js`, `scripts/analyze-deadplan-b.js`, `scripts/test-deadplan-b.js` (commit `0966de273`; analyzer + test corrected below, committed separately).
Corpora: `evidence/2026-11-16/perseed-deadplan-b-off/` and `perseed-deadplan-b-on/` (8 seeds each).
Analysis: `evidence/2026-11-16/deadplan-b-analysis.json`.
Policy: competent verbatim (`scripts/policies/competent.js`, sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`). Horizon 150d, death-aware. Seeds 103221–103228 (fresh band, verified per the seed-band-freshness skill).
VETREENGAGE is OFF in these sims (env unset) — trio/dissolution branches do not fire.

## Canon gap (established, do not invent)

No canon doc covers winPlan lifecycle or death cleanup. The question is grounded only in `src/js/win-plan.js` — notably the single `delete v.winPlan[vid]` in the whole `src/js` tree, at win-plan.js:321, in the table-active case — and its readers. There is NO death cleanup: when a plan-holder dies, their plan stays in `winPlan` and in the plan census for the rest of the run. Haventick measured the tails (to 101–102 days; 2,075 of 4,078 out-of-episode census rows across 8 seeds). This DIAG answers the open question haventick named as its next diagnostic #3: whether the linger COSTS anything — pool pollution, companion-slot blocking, census noise — or is only noise.

## GO verdict: GO — instrument valid, all four prereg bars pass

| Bar | Requirement | Result |
|---|---|---|
| 1 | Corpus 8/8 valid ON leg, 0 instrument errors, 0 unknown | PASS — 8/8 ON files valid, 0 errors; 25 creates all named creators, 64 seed rows all named paths, 12,929 touches all named method + boolean `holderAlive`, 7,157 dawn-scored rows all with vid + boolean `holderAlive`; 0 `unknown-*` anywhere |
| 2 | Proof green (D1/D2/D3) | PASS — `scripts/test-deadplan-b.js` 89/89 green; D1 determinism + D2 neutrality green on seed 103221 (60d, repeated in the off shape); D3 drift smoke: all 8 seeds IDENTICAL across legs, NO PRE-LEVER DRIFT |
| 3 | Cost classification COSTLY or NOISE-ONLY with the counts | PASS — **COSTLY**, 6 slot instances enumerated below (pool 0 on all six sub-counts, dead touches 0) |
| 4 | Wall numbers on both legs | PASS — identical on both legs (table below) |

## The answer, in plain words

**A dead villager's plan does cost something, but not much — and not where we expected.**

The plan of a dead villager never gets picked, never gets scored, never launches, and never reaches a fight. Across 12,929 recorded plan touches and 7,157 dawn scorings on 8 villages, not one ever involved a dead holder. The pool is clean.

What does happen: a *living* villager's plan keeps naming a dead companion in its party list. Six living villagers carried a dead person in their plan's party for 10–34 days each — 149 villager-days in all. The dead name never marched out with them: when those villagers did launch, the game rebuilt the party from living people standing at Haven, and the corpse was silently dropped. Three of the six launched again afterwards with a living companion; the other three died themselves before launching again, so their "blocked" window is really just the days between their companion's death and their own.

So the cost is real but bounded: **stale dead names in living people's plans, 149 villager-days, zero fights affected.** The census is the loudest symptom — more than half of every plan the game counts (1,500 of 2,615 rows, 57%) belongs to someone already dead, and on some days every single plan in the census is a dead person's — but nothing in the game reads that count, so no number the player ever sees changes.

The concrete next step, named but not built (this arm is a DIAG): **death cleanup in `win-plan.js`** — when a villager dies, delete their own plan entry *and* strike their name out of every living villager's plan party. The second half is the actual fix; the first half is census hygiene.

## Analyzer fix (instrument correction — the verdict flipped)

The first analyzer run said **NOISE-ONLY**. That verdict was wrong, and the instrument caught its own error before the evidence was written.

The bug: the death-day map read the daily roster snapshot's `dead` flag. But dead villagers are **removed from the roster before the snapshot is taken** — the flag is always false and the roster just shrinks (seed 103224: 12 villagers on day 2, 5 by day 151). Sal Ding's last roster day is 31; his first dead census day is 32. With an empty death-day map, every party reference to a dead villager looked alive, and the slot count came out 0.

The fix (`scripts/analyze-deadplan-b.js`, `deathDayMap`): death days now come from the run's `deaths` array — kind `villager`/`person` rows carry `who=<vid>` (monster kills carry kind `monster` and are skipped) — with a holder's first dead census day as fallback. Every census-dead holder lacking a deaths-array row is listed in `deathDayUnknown` (0 on all 8 seeds — the fallback never fired). The proof test gained fixture D8 (+2 checks, 89/89): death days come from the deaths array, not the roster flag, and the census fallback is pinned.

Re-running the corrected analyzer flipped the verdict **NOISE-ONLY → COSTLY** (6 slot instances). This is the instrument working as designed: the prereg's bar-3 rule classifies on the counts, and the counts were wrong until the death source was grounded in the data. The first run's verdict is withdrawn, not hidden.

## Before / after on identical seeds

OFF leg (recorder off) then ON leg (recorder on), same 8 seeds, same policy, same horizon. Trajectories are identical per seed — standing, deaths, kill calls, and end reason match exactly (D2 at corpus scale, confirmed by the D3 drift smoke: all 8 IDENTICAL).

| Seed | End | Standing | Wave | Deaths | Plans created | Census rows (dead) | Touches | Dawn-scored |
|---|---|---|---|---|---|---|---|---|
| 103221 | survived 150d | 199 regional | 4 | 87 | 4 | 310 (87) | 1,696 | 822 |
| 103222 | village-lost 146d | 199 regional | 4 | 98 | 5 | 405 (287) | 1,735 | 811 |
| 103223 | survived 150d | 430 regional | 5 | 101 | 4 | 515 (268) | 1,836 | 758 |
| 103224 | survived 150d | 365 regional | 5 | 114 | 6 | 754 (442) | 1,822 | 908 |
| 103225 | survived 150d | 245 regional | 5 | 46 | 0 | 0 (0) | 1,388 | 1,160 |
| 103226 | survived 150d | 400 regional | 5 | 93 | 0 | 0 (0) | 1,490 | 896 |
| 103227 | survived 150d | 285 regional | 5 | 56 | 0 | 0 (0) | 1,198 | 1,047 |
| 103228 | survived 150d | 390 regional | 5 | 94 | 6 | 631 (416) | 1,764 | 755 |
| **Total** | | | | **689** | **25** | **2,615 (1,500)** | **12,929** | **7,157** |

### The three empty seeds are real

Seeds 103225, 103226, 103227 created **zero plans in 150 days** — the same sleeping-village finding haventick reported, reproduced on a fresh band (3/8 seeds never start a plan). Seed 103227 never even recorded a havenTick touch (0 `winPlanHavenTick`, 0 `vbrainExecuteDepart`): no ranger or explorer was ever at Haven at tick time. The instrument still recorded 1,198–1,490 touches per empty seed (bonds/muster ticks with no plan) and 896–1,160 dawn scorings — the recorder works; there is simply nothing to plan with. This is haventick's diagnostic #1 (plan ignition), not this arm's question.

### Two entry points never fire — explained by code paths, not instrument gaps

- **`winPlanDepart`: 0 calls on all 8 seeds.** The brain owns dawn (`vbrainOwnsDawn`), so departures go through `vbrainExecuteDepart` (827 calls band-wide) and the agencyTick `winPlanDepart` branch never fires.
- **`winPlanSecondCompanion`: 0 calls.** VETREENGAGE is off in these sims, so the second-companion pick is env-gated shut.

## The four counts

### (a) Linger — dead-holder rows as a share of the plan census

**1,500 of 2,615 census rows (57.4%) belong to dead holders.** 22 distinct dead holders; 20 lingered ≥30 days; longest span 118 days (Sal Ding, seed 103224). The dead share grows over the run — by the last 30 days, nearly every plan in the census is a dead person's:

| Seed | Census dead/total | Share | Day-bucket dead/total (0–30 / 31–60 / 61–90 / 91–120 / 121–150) | Longest tail |
|---|---|---|---|---|
| 103221 | 87/310 | 28% | 0/0, 0/40, 0/82, 14/90, 73/98 | 43d (Ellie Boateng) |
| 103222 | 287/405 | 71% | 0/0, 0/43, 63/120, 120/120, 104/122 | 77d (Sandra Rizzo) |
| 103223 | 268/515 | 52% | 0/35, 10/120, 45/120, 93/120, 120/120 | 99d (Milagros Bustamante) |
| 103224 | 442/754 | 59% | 0/55, 54/159, 73/180, 135/180, 180/180 | 118d (Sal Ding) |
| 103228 | 416/631 | 66% | 0/7, 6/150, 110/145, 150/150, 150/179 | 93d (Liam Davis) |

Seed 103222 is the starkest case: the village lost at day 146, its whole planning cohort died in an 11-day cluster (days 69–80), and their plans kept "counting" for the remaining ~70 days — the 91–120 bucket is 120/120 dead.

Per-holder stories (every dead holder lingering ≥30 days — who, when/how died, plan stage/target):

| Seed | Holder | Plan made | Died | Stage / target | Linger |
|---|---|---|---|---|---|
| 103221 | Ellie Boateng | d41 havenTick | d107 | hunt / — | 43d |
| 103222 | Sandra Rizzo | d50 agency-flee | d69 | standing / focus_group (w3) | 77d |
| 103222 | Moshe Zhong | d50 havenTick | d74 | party / — | 72d |
| 103222 | Diana Osei | d50 havenTick | d77 | party / — | 68d |
| 103222 | Desmond Clarke | d51 winPlanOf | d80 | party / — | 66d |
| 103223 | Milagros Bustamante | d21 winPlanOf | d50 | hunt / — | 99d |
| 103223 | Aishwarya Seshadri | d22 havenTick | d79 | hunt / — | 71d |
| 103223 | Catalina Reyes | d21 havenTick | d88 | party / — | 62d |
| 103223 | Devon Okafor | d25 havenTick | d118 | table / — | 32d |
| 103224 | Sal Ding | d20 havenTick | d32 (monster) | hunt / — | 118d |
| 103224 | Yi-seo Bong | d19 havenTick | d36 (monster) | hunt / — | 114d |
| 103224 | Terrence Ramirez | d20 winPlanOf | d84 | hunt / — | 66d |
| 103224 | Jovan Milic | d19 havenTick | d84 (the wild) | hunt / — | 65d |
| 103224 | Ethan Hunt | d22 havenTick | d110 | hunt / focus_group | 39d |
| 103224 | Carlos Diaz | d52 havenTick | d115 (the wild) | hunt / — | 34d |
| 103228 | Liam Davis | d31 havenTick | d57 | party / — | 93d |
| 103228 | Dominic Quintana | d31 havenTick | d59 | party / eater (w4) | 91d |
| 103228 | Ruby Callaghan | d28 havenTick | d61 | hunt / — | 89d |
| 103228 | Vincent Zhong | d28 havenTick | d71 | hunt / — | 79d |
| 103228 | Gun-woo Ji | d30 havenTick | d86 | hunt / — | 64d |

Sandra Rizzo's story is the most human: she fled a fight on day 50 and the flee itself seeded her plan (target focus_group, wave 3); she advanced it to `standing` before dying on day 69, and it then sat in the census for 77 more days. Devon Okafor reached `table` stage before dying on day 118 — the closest any dead holder came to the endgame, and his plan outlived him by a month.

### (b) Pool pollution — zero on all six sub-counts

| Sub-count | What it would catch | Result |
|---|---|---|
| (0) `dawnScored` dead | every dawn scoring call on a dead holder (completeness superset — `winPlanCands` returns no candidate for gear-armed / standing-no-companion / hunt-no-companion holders, so the dawn-scored array is the only complete record) | **0 / 7,157** |
| (i) `dawnbidScores` dead holder | dawn pool scoring a dead holder's plan | **0 / 296** |
| (ii) `companionPool` rankedPick dead | a companion pick that is a dead holder | **0** (companionPool is empty on all 8 seeds — plans here are wave-3/target-null, not wave-4+) |
| (iii) `v4departs` dead holder/party | a launch attempt by or with a dead holder | **0 / 100 departs** |
| (iv) `deadTouches` dead, by method | any winPlan entry-point call on a dead holder (11 methods) | **0 / 12,929** |
| (v) `winPlanSecondCompanion` dead pick | a second-companion pick that is dead | **0** (never fires — VETREENGAGE off) |
| (vi) `winPlanOf` dead vid | a plan created for a dead villager | **0 / 25 creates** (createsDead 0) |

Touches by method (band total): `winPlanBondsTick` 4,799, `winPlanMusterTick` 4,799, `winPlanHavenTick` 827, `vbrainExecuteDepart` 827, `winPlanFightGate` 449, `winPlanNoteFight` 456, `winPlanSeedFromFight` 351, `winPlanNoteKill` 179, `winPlanOf` 242, `winPlanDepart` 0, `winPlanSecondCompanion` 0. Every one of the 12,929 is a living holder.

### (c) Slot — 6 living holders carried a dead villager in their plan party

| Seed | Living holder | Dead party member (died) | Ref appeared | Holder-days | Launched after? |
|---|---|---|---|---|---|
| 103223 | Devon Okafor | Milagros Bustamante, gen_0eznhw3 (d50) | d50 | 34 | **Yes** — launched d54, d65, d70, each time with Catalina Reyes (living) |
| 103224 | Ethan Hunt | Sal Ding, gen_xkxnkfm (d32, monster) | d32 | 30 | **Yes** — launched d50 with Jovan Milic (living) |
| 103224 | Jovan Milic | Yi-seo Bong, gen_amnwppq (d36, monster) | d36 | 14 | **Yes** — launched d54, d59, d68, d71, d80, d83 with Ethan Hunt / Carlos Diaz (living) |
| 103224 | Carlos Diaz | Jovan Milic (d84, the wild) | d84 | 32 | No — died d115 (the wild); last launch d77, before the ref appeared |
| 103228 | Gun-woo Ji, gen_v81e6mr | Liam Davis (d57) | d57 | 29 | No — died after; last launch d56, the day before the ref appeared |
| 103228 | Vincent Zhong, gen_6aqbrvy | Ruby Callaghan (d61) | d61 | 10 | No — died after; last launch d57 |

- **(c-i) living holders whose plan.party contains a dead vid: 6 holders, 149 holder-days.** `deathDayUnknown` 0 and `unknownPartyRefs` 0 on every seed — every party reference resolved against a known villager with a known death day.
- **(c-ii) launches carrying a dead party member: 0.** Every launch by the three who launched after the ref appeared went out with a living companion instead — the brain rebuilds the party at launch (`win-plan.js:506`, `villager-brain.js:1093`). The three who never launched again died themselves; their "blocked" window is the gap between their companion's death and their own, not a proven block (Carlos died in the wild on day 115 after a 38-day gap with no launch; Gun-woo and Vincent each died within days of the ref appearing).
- **(c-iii) `winPlanOf` creation for a dead vid: 0.**

Reverse diagnostic (not a slot cost — nothing ever reads a dead holder's party except the holder's own, never-taken actions): dead holders' parties still named *living* villagers on 295 census rows (103221: 16, 103222: 11, 103223: 76, 103224: 182, 103228: 10). Sal Ding's plan, for example, still listed Ethan Hunt as its party on day 150, 118 days after Sal died. The party lists go stale in both directions and are read in neither.

### (d) Census noise — large, and game-invisible

- Mean per-day plan-count inflation (incl dead ÷ excl dead): 1.56 (103221), 2.74 (103222), 2.12 (103223), 2.09 (103224), 3.55 (103228). Max: on 4 seeds there are days where **every** plan in the census belongs to a dead holder ("all-dead-day").
- Final-day plan counts, incl / excl dead: 103221 4/1, 103222 5/1, 103223 4/0, 103224 6/0, 103228 6/1. On seeds 103223 and 103224, the last day's census is 100% dead holders.
- No game-visible number changes: the static reader check (re-run by the analyzer) finds `winPlan` mentioned in only four `src/js` files — `game.js`, `villager-agency.js`, `villager-brain.js`, `win-plan.js` — and `standing.js`, `progression.js`, `hierarchy.js`, `table.js` contain no `winPlan` reference. `winPlanStats` is bump-only event counters; no game code reads a plan count from it. The census is a recorder-side count; excluding dead-holder rows changes no game decision.

## Why the dead name never reaches a fight (the three guards)

1. **Dawn never reads the party list.** `winPlanCands` (`villager-brain.js:193`) reads only the holder's own plan stage/target and calls `findCompanion` fresh each dawn — which filters the dead explicitly. A dead name in `plan.party` cannot make the brain think it already has a companion.
2. **Launches rebuild the party.** `vbrainExecuteDepart` picks living companions at Haven and overwrites `cplan.party` (`win-plan.js:506`, `villager-brain.js:1093`). Devon's three post-ref launches prove it in the data: Milagros dead in the list, Catalina Reyes at his side.
3. **The fight gate judges sensed allies, not the list.** The gate builds its party from `villagerFightAllies`; its only `plan.party` read is the VETREENGAGE-gated co-tasked count (`win-plan.js:646–664`), which skips dead members explicitly (`if (!alive(this, pid)) continue;`). A dead ref cannot make a party look full to the gate.

The one reader that *would* act on a dead party member — the havenTick dissolution branch (`win-plan.js:391–397`: a dead party member clears `plan.party`) — is env-gated off in these sims. With VETREENGAGE on, the dead ref would be purged at the next havenTick; that is a follow-up measurement, not this arm's.

## Reachability verdict for the wave-4 chain

Unchanged by this arm — the linger touches nothing on the chain. Wall numbers are identical on both legs: national by standing 6/8, national by scaleRank 0/8, table 0, wins 0, wave-4 reached 8/8, wave-5 reached 6/8, median survival 151 game-days, wave-4 kills 36, wave-5 kills 2, deaths 689. The chain's wall remains what it was: the launch decision and damage, not plan bookkeeping.

## Village assessment, in plain words

The villages look the same with or without the linger — because the linger lives in data the villagers never see. Seven of eight villages survived to day 150 and six reached the wave-5 door; the one that lost (103222) lost its whole planning cohort in eleven days and kept counting their plans for two more months. The plans of the dead are a graveyard the living never visit: the talk by the fire moves on, the launches go out with the living, and the census quietly fills with ghosts. Cleaning it up is worth doing — 149 villager-days of stale party lists is a real defect, and the next arm should build it — but it is not the thing standing between these villages and a win.

## Sense-testing (read the lines, not just the counts)

The narration is coherent and human. Villagers tell stories by the fire that pick up decorations as they travel ("The truth left this story two fires ago. What's left is better theater."), teach each other by name ("the man in his 50s … is walking Milagros through a low plant with tiny white flowers"), fight at the door together ("Sal, Terrence, Greivis, Jovan and Quinn met them at the door — 3 put down, 1 driven off. Greivis didn't come back."), and the System announces veteran kills on camera ("Jovan just put down Buffering… on CAMERA. That's a veteran kill, folks. REMEMBER the name.").

No line anywhere treats a dead holder as still planning. Sal Ding is named fighting at the door on day 10 and never again after his day-32 death. Milagros is named teaching and talking on days 6–11 and never after her day-50 death. Jovan is named fighting on day 17 and killing Buffering on day 37, never after his day-84 death. Carlos is named fighting on days 70–92, never after his day-115 death. Dominic Quintana is named fighting on days 8 and 23, never after his day-59 death. The dead are simply gone from the talk; their plans linger silently in the data, never in speech. That matches the measurement exactly: nothing in the game reads the linger, so the village never notices it.

## Blanks filled or documented

- **Death-day source (filled, corrected mid-run):** the daily roster cannot source death days — dead villagers are removed before the snapshot. Deaths now come from the `deaths` array (kind villager/person) + census fallback; `deathDayUnknown` 0 on all seeds. See "Analyzer fix" above.
- **MODE-default bug (filled in proof):** the first proof run recorded 0 rows because `MODE` defaulted to `off`; fixed before the legs ran (recorder defaults on; `DEADPLAN_RECORDER=off` forces off). No leg data is affected.
- **Index clobber (documented, repaired):** struck twice — the prereg commit and the instrument commit both left files showing as deleted in the index. Repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified with `git status --short` empty + `git diff HEAD` empty + hash-object match. Commit contents verified correct both times.
- **Write flap (documented):** a flap window ran ~05:22–05:36Z on 2026-11-17 and cleared; no work lost (the driver inherits `writeRobust`).
- **check.js --quick (documented):** run after the analyzer fix; produced no output in ~9 min and was killed (SIGTERM). It runs the green list, which this arm cannot affect — zero `src/js` changes and no shared script touched (only `deadplan-*` scripts + evidence). The arm's own proof test (`scripts/test-deadplan-b.js`, 89/89) is green and is the relevant check for this DIAG.
- **Three empty seeds (documented):** 103225/103226/103227 never created a plan — plan ignition, haventick diagnostic #1, not this arm's question.
- **winPlanDepart / winPlanSecondCompanion never firing (documented):** brain owns dawn; VETREENGAGE off. Explained by code paths, not instrument gaps.
- **CompanionPool empty (documented):** plans on this band are wave-3/target-null, not wave-4+, so the companion-pool sub-count has no rows to check. The pool verdict rests on the other five sub-counts plus the 7,157-row dawn-scored completeness superset.

## Metric review

- The first analyzer run's NOISE-ONLY verdict is withdrawn (see "Analyzer fix"). The prereg's bar-3 rule was applied as frozen — COSTLY on any nonzero (b) or (c) sub-count — and the evidence states the severity plainly rather than re-scoring: the 6 slot instances are stale party lists, not blocked launches (0 launches carried a dead member; the 3 non-launchers died). Severity is a judgment for the text, not a re-score of the bar.
- The D4 proof fixture originally shared the roster-flag bug (it set the death day via roster flags). It now carries the deaths-array row, and D8 pins the corrected sourcing. 89/89 green.
- Census-noise mean inflation is reported per plan seed only (empty seeds have no census rows; mean is undefined there, not zero).
- `gameDays` 151 vs the 150-day horizon: the corpus counts the day-0 snapshot; the horizon is 150 sim-days on all seeds (103222 lost on day 146).

## Balanced-panel review note (why no panel)

Declined with reason, as in the prior DIAGs (dawnbid / companionpool / poolmarginals / seedpaths / haventick). This is a recorder-corpus DIAG: there is no game change to compare, so a balanced panel cannot compare recorder corpora. The neutrality proof is the substitute — D1 determinism (recorder ON twice, identical full corpus), D2 (recorder ON vs OFF, identical trajectories on identical seeds), D3 drift smoke (all 8 seeds IDENTICAL, no pre-lever drift). Per MEASUREMENT.md §15, that is the recorded decision.

## Neutrality evidence

- **D1** (proof run, seed 103221, 60d): recorder ON twice → identical full corpus.
- **D2** (proof run + full legs): recorder ON vs OFF → identical trajectories; wall numbers identical on both legs (see below).
- **D3** (drift smoke over both corpora): `103221: firstLeverDay=41 firstDivDay=null -> IDENTICAL` — and the same for 103222 (d50), 103223 (d21), 103224 (d19), 103228 (d28); the three empty seeds have no lever day and are IDENTICAL. **NO PRE-LEVER DRIFT.**

## Telemetry deviation check

Ran as specified: `node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-16/perseed-deadplan-b-on/*.json' --metrics national,table,wins,exiled`. **Refused, as expected:** "telemetry-check: refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here." Recorded, not worked around — same as haventick.

## Wall numbers (both legs — identical)

| Metric | OFF | ON |
|---|---|---|
| Seeds | 8 | 8 |
| National by standing (≥200) | 6/8 | 6/8 |
| National by scaleRank | 0/8 | 0/8 |
| Table | 0 | 0 |
| Wins | 0 | 0 |
| Wave-4 reached | 8/8 | 8/8 |
| Wave-5 reached | 6/8 | 6/8 |
| Median survival | 151 game-days | 151 game-days |
| Wave-4 kills | 36 | 36 |
| Wave-5 kills | 2 | 2 |
| Deaths | 689 | 689 |

Per-seed (both legs identical): 103221 survived 150d, standing 199, wave 4, 87 deaths; 103222 village-lost 146d, standing 199, wave 4, 98 deaths; 103223 survived 150d, standing 430, wave 5, 101 deaths; 103224 survived 150d, standing 365, wave 5, 114 deaths; 103225 survived 150d, standing 245, wave 5, 46 deaths; 103226 survived 150d, standing 400, wave 5, 93 deaths; 103227 survived 150d, standing 285, wave 5, 56 deaths; 103228 survived 150d, standing 390, wave 5, 94 deaths. No table offer, no win, on either leg — the wall stands where it was.

## Commits on this branch

- `2c59164ff` — sim-deadplan-b: frozen prereg — dead-holder plan linger cost DIAG (fresh band 103221-103228, 150d, competent verbatim)
- `0966de273` — sim-deadplan-b: instrument — deadplan driver + analyzer + proof test (87/87)
- `2c5cbc724` — sim-deadplan-b: analyzer death-day fix (deaths array, not roster flag) + D8 fixture — proof test 89/89, verdict NOISE-ONLY → COSTLY
- `9ef8bac37` — sim-deadplan-b: evidence + analysis + corpora (OFF/ON, 8 seeds each)

## Files

- `evidence/2026-11-16/sim-deadplan-b-prereg.md`
- `evidence/2026-11-16/sim-deadplan-b.md` (this file)
- `evidence/2026-11-16/deadplan-b-analysis.json`
- `evidence/2026-11-16/perseed-deadplan-b-off/deadplan-b-s10322{1..8}-deadplan-b-off.json`
- `evidence/2026-11-16/perseed-deadplan-b-on/deadplan-b-s10322{1..8}-deadplan-b-on.json`
- `scripts/deadplan-driver-20261117.js`
- `scripts/analyze-deadplan-b.js`
- `scripts/test-deadplan-b.js`

## Next diagnostic (named, not done)

**Death cleanup is the named lever, not a diagnostic** — build arm: in `win-plan.js`, on a villager's death, delete `winPlan[vid]` AND purge the vid from every living holder's `plan.party`. The party purge is the slot fix; the holder delete is census hygiene. Design detail for the build: when the purge empties a living holder's party, the plan should fall back to `party` stage (re-seek a companion) rather than sitting at `hunt` with an empty list — the current code only clears the party in the VETREENGAGE-gated dissolution branch and in the gate's outmatched branch.

**Next diagnostic:** with VETREENGAGE=1, does the havenTick dissolution branch (`win-plan.js:391–397`) actually purge the dead refs this arm measured — and does the trio path change the slot picture (a dead second-companion pick, sub-count (v), can only fire with the flag on)? Re-run this arm's instrument with `VETREENGAGE=1` on the same band and compare the slot counts.
