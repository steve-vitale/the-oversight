# sim-evade-a — NO-GO (finding #2590: the evade wall — the mechanism works and a served bow volleys, but the day-2 lever breaks the paired comparison and the guardrail ratio misses)

**Arm:** sim-evade-a · **Loop A adoption run:** fleshout-20261120T1515Z (adopted from the dead 1315Z run; finished, not redone)
**Branch:** `sim-evade-a` (worktree `~/workspace/worktrees/sim-evade-a`) · **Base:** master `0106e423c` (rebased from `57b085a44`; the rebase was a clean fast-forward, 1 evidence-only commit, zero overlap)
**Prereg:** `evidence/2026-11-20/sim-evade-a-prereg.md` (FROZEN 2026-11-20 ~14:16 UTC, before any judged sim — never edited)
**Verdict: NO-GO.** Bars 1–4 and 7 PASS; bar 5 (consistency) and bar 6 (guardrail) FAIL. A miss on any bar is NO-GO, never re-scored. The lever (EVADEOBS + DEPMAT recovery + DEPMATSCOPE) is REVERTED from the tree; instrument + evidence commit only.
**Canon:** `docs/CANON.md` read. No canon doc covers launch gear-up, the ranged-slot rules, or weapon-craft knowledge seeding — said here rather than inventing canon.

## The mechanism (frozen in the prereg)

**EVADEOBS=1:** inside the awareness early-return in `fieldFight` (`src/js/fieldFights.js`, the `if (RR() < evade)` branch that sets `rec.outcome = 'evade'`), before returning, call `this.noteVillagerTrickObservation(vid, mdef.id)` for villagers only (`vid !== 'player'`). One observation per awareness-evade, exactly as a vFlee/mFlee survival records today; the 2-observation bar, the trick learning, the say line, and the telemetry are the existing `_trickObservation` mechanics, untouched. The evade still evades (outcome 'evade', rounds 0) — the fix records, it does not force contact. The code's own comments already promise this behavior; the settlement already lists 'evade' as an observing outcome.

**DEPMATSCOPE=1:** the recovered DEPMAT trailhead bundle fires only for spear-holders (the departure's ranged slot holds a non-ammo weapon). Scoping alone cannot move the volley bar except by volume — it is substrate hygiene the depmat metric review prescribed as the precondition for judging anything on this finding.

**DEPMAT recovery** (from the depmat prereg + proof test, 43/43 GREEN): trailhead bundle, crude_bow only, site-supplies branch/vine shortfall, `weapon_craft_site` telemetry, `depmatSite`/`siteMats` on the return, witnessed line when the scholar is at home.

**Legs differ by env ONLY:** ctl = SPEARGATE=1, DEPMAT/EVADEOBS/DEPMATSCOPE unset; arm = SPEARGATE=1 + DEPMAT=1 + EVADEOBS=1 + DEPMATSCOPE=1. Substrate both legs: VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1. BOWKNOW and DEPARTSEE UNSET both legs. Band 107051–107058 (reused paired band), 150d death-aware, competent policy.

**Adoption repair (this run):** `scripts/build-evade-panels-a.js` was 0 BYTES in the stranded tree (flap-truncated when the 1315Z worker created it). Rewritten from the depmat panel-builder clone, re-pointed at the evade corpora (`evade-a-s<seed>-evade-a-<mode>.json`, `perseed-evade-a-{ctl,arm}`), `node --check` clean, and it built the §15 panels successfully below. Every other untracked script verified non-empty and `node --check` clean (evade-driver-a.js, analyze-evade-a.js, test-evade-a.js). Flap probes before the first commit: 3/3 writes OK, ~30s apart (`flap-probe-evade-a-{1,2,3}.txt`).

## Frozen bars (prereg) — judged

| Bar | Frozen threshold | Result | Pass? |
|---|---|---|---|
| (1) Pool floor | arm spearSeen ≥ 10 | arm **37** (ctl 104) | PASS |
| (2) Gate replication | spearPassed/spearSeen == 1.0 on BOTH legs | arm 37/37 = 1.000, ctl 104/104 = 1.000 | PASS |
| (3) Attributable-served | ≥ 3 (spear + site-supplied + crafted; analyzer asserts 0 non-spear site rows) | arm **8** (site spear rows 25: crafted 8, failed roll 17, noSource 0; scopeLeak 0) | PASS |
| (4) Served-bow volley join | ≥ 1 (pair-inclusive wave-4+ engaged meeting, lead served, bow/crude_bow, volley.shots > 0) | arm **1**: seed 107051 d35, gen_eff1mxj (Ximena) vs influencer, served d4, crude_bow, volley 2 shots / 2 hits / 27 dmg | PASS |
| (5) Consistency | \|arm.total − ctl.total\|/ctl.total ≤ 0.05 AND spearSeen arm within ±10% of ctl | total departures arm **401** vs ctl **481** (rate delta 0.166); spearSeen arm **37** vs ctl **104** (rate delta 0.644) | **FAIL** |
| (6) Guardrail | arm deaths per engaged meeting ≤ ctl (pair-inclusive) | arm **36.73** (808 deaths / 22 meetings) vs ctl **35.12** (878 / 25) | **FAIL** |
| (7) EVADEOBS mechanism | arm wave-4+ evade meetings with obsAfter > obsBefore ≥ 1 | arm **44** (bar as frozen, see the mechanism note below) | PASS |

**Instrument errors 0** on all per-seed files, both legs (and the probe).

## Control replication (depmat ctl corpus, same band — 7/8 exact, one seed flipped)

The ctl leg reproduces the depmat ctl corpus **exactly on 7 of 8 seeds** (days, endReason, maxWave, standing, deaths, depmatRows, v4gates, v4encounters all identical per seed). Seed **107055 diverges**, and it diverges early — the 2nd staging attempt differs (day 17 vs day 23, different villagers):

| Seed | depmat-ctl | evade-ctl |
|---|---|---|
| 107051 | 139d lost, wave 4, standing 199, deaths 133, depmatRows 74, v4gates 10, v4enc 25 | identical |
| 107052 | 150d survived, wave 5, standing 365, deaths 99, depmatRows 60, v4gates 14, v4enc 28 | identical |
| 107053 | 150d survived, wave 4, standing 199, deaths 125, depmatRows 63, v4gates 13, v4enc 37 | identical |
| 107054 | 111d lost, wave 4, standing 199, deaths 63, depmatRows 23, v4gates 5, v4enc 10 | identical |
| 107055 | 150d survived, wave 5, standing 480, deaths 88, depmatRows 21, v4gates 3, v4enc 43 | **138d lost, wave 5, standing 390, deaths 112, depmatRows 44, v4gates 8, v4enc 23** |
| 107056 | 150d survived, wave 4, standing 199, deaths 129, depmatRows 75, v4gates 18, v4enc 16 | identical |
| 107057 | 150d survived, wave 5, standing 635, deaths 122, depmatRows 103, v4gates 39, v4enc 32 | identical |
| 107058 | 150d survived, wave 5, standing 425, deaths 95, depmatRows 39, v4gates 14, v4enc 26 | identical |

**Why 107055 flipped — the base moved, not the lever.** The depmat ctl corpus was generated on anchor `59711ccc57cc`; this run's ctl ran on `03ba5b700`. Between them, commit `db6f4d7ce` (journey-scale r246: scale leg panel + want-menu react wind-down fix in `src/js/convo-wants.js`, +16 lines) landed on master. It is an ancestor of the evade base `57b085a44` and NOT an ancestor of the depmat anchor — confirmed by git. No `src/` change other than that commit, the version bump, and this arm's own flag-gated additions sits between the two anchors. The evade additions are draw-neutral by construction (no RNG in any new path; the recorder is pure reads; neither driver calls `Math.random`/`RR`), and 7/8 exact reproduction supports that. The 107055 flip is a villager-want behavior change in the base, not an artifact of this arm.

**Band totals vs the prereg's replication target are entirely the 107055 flip:** deaths 878 vs 854 (+24 = 112−88 on 107055 alone); departures 481 vs 458 (+23 = 44−21); alreadyHad 222 vs 195 (+27 = 42−15); noSource 252 vs 255 (−3 = 2−5); spearSeen 104 vs 108 (−4 = 2−6); craftedFail 7 vs 8 (−1). Median 150d, wave 4 8/8, wave 5 4/8 all match the target. Volley pair 10/25 vs the target 7/21 is part of the same single-seed flip (the lost village fought more pair meetings). Recorded, never hidden, never re-judged — control identity is a reporting requirement, not a GO bar, and the NO-GO turns on the arm leg's own bars, not on the ctl.

## What the numbers say (before/after, identical seeds)

Pair-inclusive wave-4+ engaged meetings are the population for the fight bars (ctl 25, arm 22); the trio population is beside them (ctl 16, arm 7).

| Metric | ctl | arm |
|---|---|---|
| Total departures | 481 | 401 |
| Spear-holder departures (spearSeen) | 104 | 37 |
| Gate pass rate | 104/104 = 1.000 | 37/37 = 1.000 |
| Staged bows (bowOpen crafted) | 0 | 10 (crafted 10, craftedFail 25) |
| Site-supplied spear rows (crafted / failed roll / noSource) | 0 | 25 (8 / 17 / 0) |
| Attributable-served | 0 | 8 |
| Served vids | — | gen_eff1mxj:4, diana_osei:19, visjoin_81:84, jorge_silva:17, app_mgpspj5y483:83, gen_w13jb2y:46, lena_ruiz:128, gen_y4t6xan:65 (all crude_bow) |
| Knowing-noSource spear-holders | 92 | 0 |
| Pile-vine-empty at spear departures | 98 | 30 |
| Volley fired (pair) | 10/25 = 0.400 | 7/22 = 0.318 |
| Served-bow volley joins (pair) | 0 | 1 |
| Pair meetings won / vDie / vFlee / mFlee | 4 / 2 / 19 / 3 | 3 / 2 / 17 / 1 |
| Damage share mean (pair) | 0.139 | 0.213 |
| Rounds mean (pair) | 4.48 | 4.86 |
| Deaths total | 878 | 808 |
| Deaths per engaged meeting (pair) | 35.12 | 36.73 |
| Starvation (total / villager-only) | 2 / 2 | 5 / 4 |
| Community lost | 3 | 1 |
| Median survival | 150d | 150d |
| Wave 4 / wave 5 unlocked | 8/8 / 4/8 | 8/8 / 5/8 |
| National / wins | 0 / 0 | 0 / 0 |

**The consistency failure, in plain terms:** the arm leg's villages took different roads from day 2. Two forces: (a) serving converts spear-holders into bow-holders — a served villager's ranged slot becomes a bow, so they stop counting as spearSeen at all. The pool shrinks *because the mechanism works*: spearSeen 104 → 37 is partly the serve itself eating its own denominator. (b) The day-2 cascade the depmat metric review warned about: DEPMAT fires from day 2, the RNG streams diverge, and the villages end up with different departure counts (401 vs 481). Scoping fixed the serve attribution (0 non-spear site rows) but could not hold the paired comparison together — the paired design itself is what breaks under a day-2 lever, exactly as the depmat review predicted. The next arm must judge within-run (single-leg design with the mechanism's own counterfactual) or accept a consistency bar that measures the mechanism's own pool, not the raw departure totals.

**The guardrail failure, in plain terms:** fewer people died on the arm in absolute terms (808 vs 878) and fewer villages were lost outright (1 vs 3) — but the arm also fought fewer engaged wave-4+ meetings (22 vs 25), so deaths *per meeting* ticked up from 35.12 to 36.73. The ratio reads a thinning denominator, as the depmat metric review anticipated. The bar as frozen binds the ratio, so it is a miss; the verdict does not get re-scored. A future run should bind absolute deaths (or deaths per departure) alongside the ratio — the ratio alone punishes a lever that reduces fighting overall.

## The evade instrument (the mechanism, proven live)

**The bug is fixed in live play.** Awareness-evade meetings recording a trick observation: ctl **0/46**, arm **28/32**. On the ctl leg every awareness-evade records obsBefore = obsAfter (the closed loop, exactly as the prereg's §0.3 diagnosed); on the arm leg 28 of 32 awareness-evades record obs 0→1 or 1→2. The second observation learns the trick: 33 trick-learning moments on the arm leg, 8 of them on outcome 'evade' (the channel that could never fire before). Trick-known species at run end: arm 7 (algorithm, cancellation, eater, eulogy, reunion, strike, suburb) vs ctl 4 (congregation, eater, strike, timeslot). Trick holds fired: arm 15 vs ctl 37 — the hold fires far less often on the arm because tricks actually get learned. Gate seeks: arm 4 vs ctl 5; gate avoids 0 both.

**The analyzer's bar count (arm 44 vs ctl 23) needs one honest footnote.** The frozen mechanism bar counts any wave-4+ evade-attributed meeting with obsAfter > obsBefore — and that population includes vFlee/mFlee survivals, which record observations through the pre-existing settlement channel on BOTH legs. All 23 ctl positives are vFlee/mFlee outcomes (0 of them are outcome 'evade'); the arm's 44 include the 28 awareness-evade firings above plus 16 settlement-channel observations. This is NOT a leak of EVADEOBS — the flag-off ctl never records an observation on an awareness-evade (0/46), and the flag-on arm does (28/32). The bar passes on either counting, and the clean split is the proof: the mechanism is live in the sim, not just in the proof test.

**Evade calibration:** observed evade rate ctl 0.597 (46/77) vs mean recorded evadeP 0.611; arm 0.561 (32/57) vs 0.593. The gap is small (n=77/57) and in the opposite direction from the prereg's expected sign (observed slightly *below* the evadeP floor, whose godpath fieldEvade term is unmeasured). Per the prereg's metric-review note this is not re-litigated as a mechanism failure — the mechanism bar turns on obsDelta, not on calibration.

**Served leads, split by outcome (arm):** 5 served-lead wave-4+ meetings — 2 evades, 3 engaged. In the depmat arm it was 5/5 evades; the served leads now engage more than they evade. The 2 evades both recorded observations (d40 gen_eff1mxj vs eulogy, obs 0→1; d100 gen_y4t6xan vs eater, obs 1→2 — the second observation, which *learned* the eater trick). The 3 engaged: d35 Ximena vs influencer (the volley join, below); d77 lena_ruiz vs strike with a phase_sling (4 shots, 71 dmg — the sling, not the served bow, so the join rule correctly excludes it); d84 app_mgpspj5y483 vs congregation with the served crude_bow but **ammo 0** — volley 0 shots, one day after being served. The ammo wall, named in the prereg as the secondary wall, bites a served bow the day after serving.

**The one served-bow volley join (seed 107051, day 35):** Ximena (gen_eff1mxj), served a crude_bow at the trailhead on day 4, walks into The Influencer on day 35 with 8 arrows and opens with a 2-shot volley — both hit, 27 damage — then fights 6 rounds as Alma and Ella charge in on her shouts for help (mDealt 271, vTaken 101, vFlee). The end-to-end story the prereg asked for happened once: served → engaged → volley fired. Once is the bar (≥ 1), and once is also all it is — the volley bar passed on a single meeting.

**The ammo wall, sized:** arm engaged meetings entering with ammo 0: **17 of 25** (ctl 19 of 31). Even when served leads engage, two in three enter with no arrows. The pocket-ammo craft (arrow: stick 2 + stone 1 + fiber 1, one batch of 5 per departure at the blind 35%) needs pile materials the village may not hold — and the game says so out loud in the logs: *"Sami has Crude bow but no arrows — the string stays drawn, useless."* If the next arm attacks anything, it is this: the volley bar's next binding constraint is arrows, not evades.

**The 35% roll, sized:** of 25 site-supplied spear rows, 17 failed the blind 35% roll (crafted 8). A learned-crafter rate (85%) would nearly triple served bows from the same site supply. The roll is not the binding wall for this pilot (serving passed its bar at 8), but it is the cheapest next volume lever after ammo.

## Panel (instrument — §15)

Built `evade-a-panel-before/after.json.gz` from the paired corpora with the rebuilt `scripts/build-evade-panels-a.js`. `node scripts/balance-panel.js compare` → decision **`review_required`** (exit code 2 is the tool's by-design signal for any decision other than `no_material_signal`; the depmat panel returned the same). 8 paired cases; village deaths per run 109.75 → 101 (−8.75, 95% exploratory interval −26.875 to 11.25, covering 0); community loss 0.375 → 0.125; national 0 → 0; wins 0 → 0; no material signal on any contract metric. The panel confirms the legs are different villages; the frozen bars are the judge. Full compare: `evidence/2026-11-20/evade-a-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`).

## Wall numbers (this band, per leg)

| | ctl | arm |
|---|---|---|
| National | 0/8 | 0/8 |
| Table | null (not instrumented by this driver — never faked) | null |
| Wins | 0/8 | 0/8 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 4/8 | 5/8 |
| Median survival | 150d | 150d |
| Community lost | 3/8 | 1/8 |
| Scale ranks | 8 regional | 8 regional |

The scale wall stands: no village on either leg reached national, the table, or a win. The arm's one extra wave-5 unlock (5/8 vs 4/8) is the 107055 flip running the other way on the arm leg, not a lever effect — the arm's 107055 survived to wave 5 while the ctl's 107055 was lost at day 138.

## What the village looked like (plain words)

Eight villages, 150 days each, all starting from the same competent hands. On the control leg, three villages were lost outright and five survived to day 150, all stuck at regional standing — strong enough to live, never strong enough to climb. People died in the hundreds per village (878 across the band), mostly to the fights they fled from: 19 of 25 pair meetings ended with the villagers running. On the arm leg the same eight villages lived a little longer in aggregate — fewer deaths (808), fewer villages lost (1) — but fought fewer of the big wave-4 fights (22 vs 25), and the ones they fought still mostly ended in flight (17 of 22). The bow program worked as a craft story: eight spear-carriers snapped a green branch and twisted a vine cord at the trailhead and walked away with a crude bow, and one of them — Ximena, served on day 4 — actually put arrows into a wave-4 beast a month later. But eight bows across eight villages is a trickle, and seventeen of the twenty-five engaged meetings walked in with empty quivers. The villages are not starving for courage or for knowledge anymore — the evade now teaches, and the village's shared trick-book grew from four species to seven. They are starving for arrows and for enough fights to use them in. Nobody reached national, nobody sat at the table, nobody won. The wall is still the wall.

## Sense-test notes (transcripts)

Read from the arm corpora (`perseed-evade-a-arm`, `v4encounters` logs + `vetSays`).

- **The volley join reads like a fight, not a table row.** Ximena "walks straight into The Influencer. No avoiding it", "sees The Influencer coming and nocks an arrow — the fight opens at range (2 shots)", both arrows land, "Ximena lowers the bow — The Influencer is on them now. (2/2 hit)". Then the fight turns the way these fights do: her eyes go red (Rage), her gear absorbs hits, she binds a wound mid-fight (+20 HP, field medicine), she shouts for help and Alma charges in, then Ella. She runs at the end, hurt but alive, having dealt 271 damage. That is a villager acting like a person under fire — calling for help, patching herself, leaving while leaving still works.
- **The trick-learning moments read right.** "Ming saw Big Loud in time and gave it room." / "Seymour saw The Eater in time and gave it room." / "Desmond saw Big-Eyes in time and gave it room." — the evade line is the same wording as before the fix (the learning itself is silent in the fight log; the proof test documents the say line on learning). The fiction holds: surviving a meeting teaches you the beast. One gap to name: nothing in the fight log marks the moment the trick is *learned* — a reader of the transcript alone cannot tell obs 1 from obs 2. The telemetry knows; the story does not say it. Minor, documented, not a lever.
- **The game voices the ammo wall itself.** "Sami has Crude bow but no arrows — the string stays drawn, useless." That line fired on a served bow the day after serving. When the game tells you the blank in its own words, the blank is real.
- **The villagers' other voices are coherent.** Vet lines report the door-fights plainly ("Alma, Ella, Ines and Luis met them at the door — 3 put down, 1 driven off. Alma, Ella, Ines, Luis are hurt.") and the alien audience lines keep their menace ("We've stopped pretending these are animals now. That was the FINAL DRAFT, folks — what comes out of the treeline next was never alive the way you mean it."). The Peacemaker moments land ("Sami walks in open-handed, talking — low, steady, unafraid. And impossibly, it listens. It stands down."). Nothing robotic, static, or repeated beyond the game's own stock phrasing — which is the game's voice, not a defect of this arm.
- **One repeated-log note:** "X is losing — shouts for help! Y charges in!" followed by "Y answered X's shout, but X is past holding — they run while running still works." recurs across meetings. It is the honest narration of the same real behavior (call for help, then flee), not copy-paste dialogue — the names, damage, and outcomes differ each time.

## What happened to the pilot

**NO-GO.** The mechanism is proven (bar 7), the serve is proven (bar 3), the volley join happened (bar 4), the gate replicates (bar 2), the pool is there (bar 1) — and the pilot still fails, on the two bars that measure whether the *comparison* held and whether the *cost* stayed flat. The consistency bar fails because a day-2 lever cascades the villages apart and serving eats its own spear pool; the guardrail ratio fails because the arm fought fewer meetings while total deaths fell. Per the frozen prereg and the task brief, the game code is REVERTED before the commit: EVADEOBS (`src/js/fieldFights.js`), the DEPMAT recovery and DEPMATSCOPE (`src/js/game.js`) leave no trace in the tree. What lands is instrument + evidence only: the driver, the analyzer, the (rebuilt) panel builder, the proof test, the per-seed corpora, the panel, and this file. The proven mechanism design stays in the branch history and in this evidence for the next arm to re-land under a within-run design — it is not lost, it is not live.

**Finding #2590 stays open.** The serve half is now confirmed (8 attributable served, 1 served-bow volley, mechanism proven live) but the pilot is NO-GO, so the finding is not closed. The next arm inherits: (1) a working evade-observation channel (proven 28/32 in live play — re-land it, do not re-prove it); (2) the ammo wall as the next binding constraint (17/25 engaged meetings enter with 0 ammo; a served bow volleyed 0 shots the day after serving for want of arrows); (3) the 35% roll as the cheapest volume lever (17/25 site servings fail it); (4) a within-run judging design, because the paired comparison cannot survive a day-2 lever.

## Metric review

- **The paired before/after design is fragile for day-2 levers** (depmat metric review, confirmed here, now twice): the consistency bar misfired on a corpus where the lever itself moves the measured pool — serving converts spear-holders into bow-holders, so spearSeen arm 37 vs ctl 104 is partly the mechanism working, not drift. The verdict does not get re-scored, but the next arm must judge within-run or measure the mechanism's own pool (e.g., spearSeen + bowHeld) instead of raw departure totals. Scoping sufficed for serve attribution; it did not suffice for the comparison.
- **The guardrail's ratio form misfires when the lever thins the denominator.** Absolute deaths fell (808 vs 878) and villages lost fell (3 → 1), yet deaths-per-engaged rose because engaged meetings fell faster (25 → 22). The review proposes binding absolute deaths (or deaths per departure) alongside the ratio for the next run — the ratio alone punishes a lever that reduces fighting overall. The verdict does not get re-scored.
- **evadeP is a floor, not the true probability** (prereg note, held): the godpath fieldEvade term is unmeasured in the recorder. The observed rate sits slightly *below* the recorded-evadeP mean on both legs (0.597 vs 0.611 ctl; 0.561 vs 0.593 arm) — the opposite sign from the expected direction, on small n. Per the prereg this is not re-litigated as a mechanism failure; the mechanism bar turns on obsDelta, which is unambiguous (ctl 0/46, arm 28/32).
- **Draw-neutrality is a property of the mechanism, not of the corpora** (prereg note, held): a learned trick opens seek where today the gate returns null, so the streams diverge by design once the fix fires — trick holds 37 → 15, trick-known species 4 → 7. The review does not re-litigate this divergence as a mechanism failure; it names it as the reason the paired comparison cannot hold.
- **The ctl "23" in the frozen mechanism bar is the settlement channel, not a leak.** All 23 ctl positives are vFlee/mFlee outcomes; 0 are outcome 'evade'. The bar as frozen counts them, and it passes on either counting — but the clean mechanism number is the evade-outcome split (ctl 0/46, arm 28/32), and a future prereg should freeze *that* as the mechanism bar.
- **Control identity:** 7/8 exact; the 107055 flip is a base move (`db6f4d7ce`, convo-wants.js), recorded above with its size. It does not touch the verdict: the failing bars are arm-leg effects measured against this run's own ctl leg, and the 107055 flip, if anything, *helped* the arm's guardrail (the ctl's lost village added deaths to the ctl side).

## Proofs (GREEN on the rebased base, before the pilot)

- `scripts/test-evade-a.js` — **37 passed, 0 failed** (flag-off = old behavior, 0 observations on two evades; flag-on = obs 1 then obs 2 + trick learned, evade still evades; vFlee still records exactly 1; scholar's evades take no villager observation; DEPMATSCOPE on = non-spear villager gathers nothing; draw counts equal flag-off vs flag-on).
- `scripts/test-depmat-a.js` — **43/43**; `test-spearstage-a.js` — 26/26; `test-speargate-a.js` — 31/31; `test-bowcraft-a.js` — 58/58; `test-bowknow-a.js` — 19/19.
- `scripts/analyze-evade-a.js --selftest` — **75 passed, 0 failed**.
- Panel builder rebuilt (0-byte flap truncation) and verified by a successful §15 build + compare.

**Post-revert test state (recorded, expected):** after the lever revert, `scripts/test-evade-a.js` reports **22 passed, 15 failed** (exit 1; log `evidence/2026-11-20/evade-a-test-postrevert.log`). The 15 failures are exactly the flag-on/presence checks (EVADEOBS gate read, observation call in the early return, DEPMATSCOPE gate, M2 mechanism, M3, M5 scope-off) — the lever is not live, so they cannot pass. All flag-off behavior checks still pass (M1 old behavior reproduced, M4 scholar exclusion, M6 draw counts). Same shape as `test-depmat-a.js` on master after its NO-GO revert: the proof test stays in the tree as the record of the proven mechanism, not on the green list, and it goes green again the moment the next arm re-lands the lever. The driver guards the same way: an arm-leg run without the lever code exits 2 (`EVADE STOP`).

**`check.js --quick` on the reverted tree: 336 passed, 8 failed in 1383s** (log `evidence/2026-11-20/evade-a-check-quick.log`, exit 1). The 8 failures are all godpath proof/attainment tests: 3× 120s timeouts (`test-living-garden-deed-attainment`, `test-one-person-army-deed-attainment`, `test-trust-observer-neutrality`) and 5 proof-freshness failures (`test-measurement-proof-update`, `test-measurement-workflow`, `test-measurement-cache-flags`, `test-phone-frame-proof` — retained neutrality/phone receipts vs current inputs). None touch this arm's files: src/ is byte-identical to master, and the failing proofs validate inputs this arm never changed (index.html, src/data/*, scripts/sim-harness.js, scripts/lib/*). The run took 23 minutes under load average ~21 with two sibling `check.js --quick` runs live at the same time — the timeouts and cache-identity failures read as load/concurrency artifacts and/or pre-existing staleness on master, not as this arm's doing. Recorded, not chased: re-running the full check or refreshing those proofs is outside this arm's scope, and the verdict does not depend on it. The coordinator can re-run `check.js --quick` on a quiet box if it wants a clean read.

## Files

- Prereg (frozen): `evidence/2026-11-20/sim-evade-a-prereg.md`
- Evidence (this file): `evidence/2026-11-20/sim-evade-a.md`
- Corpora: `evidence/2026-11-20/perseed-evade-a-ctl/` (8 JSONs), `evidence/2026-11-20/perseed-evade-a-arm/` (8 JSONs), `evidence/2026-11-20/perseed-evade-a-probe/` (2 JSONs, unjudged)
- Logs: `evidence/2026-11-20/evade-a-sweep-ctl.log/.err`, `evade-a-sweep-arm.log/.err`, `evade-a-analysis.log/.err`, `evade-a-panel.log/.err`, `evade-a-probe.log/.err`
- Analysis: `evidence/2026-11-20/evade-a-analysis.json` (verdict NO-GO)
- Panel: `evidence/2026-11-20/evade-a-panel.md`, `evade-a-panel.json`, `evade-a-panel-before.json.gz`, `evade-a-panel-after.json.gz`
- Instrument: `scripts/evade-driver-a.js`, `scripts/analyze-evade-a.js`, `scripts/build-evade-panels-a.js` (rebuilt — was 0 bytes), `scripts/test-evade-a.js`
- Lever code (REVERTED — no trace in the tree after the landing commit): EVADEOBS in `src/js/fieldFights.js` (+16), DEPMAT recovery + DEPMATSCOPE in `src/js/game.js` (+51). The design and the proof test remain in the branch history and in this evidence.
