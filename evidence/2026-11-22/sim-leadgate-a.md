# sim-leadgate-a — WHO LEADS WAVE-4+ PARTIES (finding #2667 follow-up)

- Arm: sim-leadgate-a, Loop A run fleshout-20261122T1115Z, DIAG arm (no lever, no contrast leg).
- Axis: scale-onramp · Finding: #2667 follow-up (gunlife-a GO: the lead gate — the volley belongs to the LEAD fighter only, and in 4/8 traces the gun holder carries the gun equipped for 29–65 days with cells and never leads a wave-4+ fight while holding it).
- Base: worktree HEAD `7fe56628e` (master `87b2122f3` + prereg `88c9d12c3` + instrument `9325d2520` + volley-scope fix `7fe56628e`); branch `sim-leadgate-a`. REBASED before the prereg onto master `87b2122f3` (Loop B sim-hpgate-b merge) — see §6; no judged run before the rebase. No game-code change in this arm.
- Prereg: `evidence/2026-11-22/sim-leadgate-a-prereg.md` (content frozen ~06:15 UTC, committed `88c9d12c3` — before any judged run; the analyzer's wave-4-plan definition was corrected during analysis, §8, no bar re-scored).
- Instrument: `scripts/leadgate-driver-a.js` (copy of `scripts/killlootbundle-driver-a.js` + leadgate wraps) + `scripts/analyze-leadgate-a.js` + proof test `scripts/test-leadgate-a.js` (see §6 for the leg-1 volley-scope fix).
- Horizon: 150d death-aware. Seeds: 107359–107366 (8, fresh — zero hits in the prereg/evidence grep). Policy: competent (verbatim). Single ctl leg. Substrate: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`.

## Verdict: DIAG-GO — the lead rule is named, with numbers, and the next lever follows from it

There is no lead-selection rule — and that IS the answer. The "lead" of a wave-4+ party is the win-plan HOLDER by construction: `winPlanDepart` launches the holder's own plan, the holder is the lead, and companions are picked around them. A companion never becomes the lead, and nothing in the holder pick, the companion pick, or the companion ranking mentions the gun, ranged weapons, or combat skill. So a gun holder leads a wave-4+ party only by holding a wave-4+ plan of their own — and on this band they almost never do: **1 of 9 gun holders ever held a wave-4+ plan (katarina_novak, 24 days), and she launched once, on day 129, six days BEFORE the gun arrived (day 135)**. The other 8 holders held a wave-4+ plan on 0 of their 202 combined gun-days. The mechanism that keeps them out has three links, each measured:

1. **Plans seed only from a personal wave-3+ face** (`winPlanSeedFromFight`, wave ≥ 3) — and a plan in stage `hunt` or later can NEVER be retargeted (the seed early-returns). Two of the three villager gun holders (hannah_kim, zoe_adams) got their plans frozen targetless in `hunt` stage by riding as companions on sub-wave-4 launches on days ~12–14 — weeks before their first wave-3+ face and before either won a gun. All 8 of their later wave-3/4/5 seed events (including zoe fleeing a wave-5 Timeslot on day 108) hit the early return and changed nothing.
2. **The companion sync copies target but not needWave** (`launchParty`, win-plan.js:1313). A companion inherits the holder's target and stage `hunt` — and a plan carrying a wave-4 target with `needWave: null` is invisible to every `needWave >= 4` gate. On this band 22 of 33 launches (67%) were led by a holder whose plan had `needWave: null` — and **all 22 went out as pairs (mean party 1.95, 0 trios), while all 11 needWave-set launches went out as trios/quads (mean 3.82, 11/11 trio+)**. The null-needWave holder loses the 2nd/3rd companion pick (`extraCompanionScan` gates on `needWave >= 4`), and the departure beat stays silent on those launches too (`winPlanDepartLaunchBeat` gates on the same `needWave >= 4`).
3. **The gun never enters the pick.** `findCompanion` gates on alive / not-away / trust ≥ 15 / at Haven / not engaged / ranger profile, ranked by `companionScore` (errand +4, bold/warm +2, relationship > 40 +1, lonely +1). `extraCompanionScan` tiers (1) living wave-3+ killers, (2) armed villagers, (3) the rest. A gun holder is at best tier 2 (armed) — as a COMPANION. On this band gun holders rode as first companion on 7 launches (katarina twice, zoe five times) and led **0 of 33 launches** and **3 of 146 wave-4+ fights** — and in 2 of those 3 fights the gun DID fire (2 shots, 1 hit, 68 dmg; 2 shots, 1 hit, 65 dmg). The gun is not broken; the holder just almost never leads.

The next lever follows from link 2, not from the gun: **copy `needWave` in the companion plan sync** (and/or let a `hunt`-stage plan retarget on a higher-wave seed). It is a one-line-class fix with a directly measurable effect: null-needWave launches should fall to ~0, trio+ rates on those launches should rise to the needWave-set rate, and the departure beat should speak on them. The hunt-stage retarget lock is the deeper question — it also freezes hannah's and zoe's plans — and is the second lever in line. Both are named in §7 as findings; neither is built here (diag arm).

## Frozen-bar table (prereg §7)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Instrument validity (killlootbundle proof 12/12 + analyzer selftest 17/17 re-run on rebased tip; leadgate proof test 100% + analyzer selftest 100%; 0 instrument errors on all 8 files) | all must hold | proof 12/12, selftest 17/17, test-leadgate-a 33/33, analyzer selftest 21/21, all re-run on the rebased tip; 0 errors on 8/8 seed files (anchor `7fe56628e` on all 8) | ✅ |
| 2. Coverage (≥ 80% of wave-4+ launches AND ≥ 80% of wave-4+ fights carry a lead attribution with dated rows; 0 unaccounted contest searcaster grants) | all must hold | launches 33/33 (100%), fights 146/146 (100%); grants 5, unaccounted 0 | ✅ |
| 3. GO (diagnosis names the binding lead-selection rule WITH numbers AND names the next lever) | all must hold for GO | rule named (§3: holder-is-lead by construction; 1/9 holders ever held a w4+ plan; 22/33 launches needWave-null pairs; 0/33 gun-led launches); next lever named (needWave copy in the companion sync; hunt-stage retarget second) | ✅ |
| 4. NO-GO rule (coverage < 80% either leg, or recorder blind) | frozen | coverage 100% both legs; recorder sees lead/plan/gun state on all 8 seeds | ✅ (no NO-GO) |

Zero-launch rule not triggered: 33 wave-4+ launches on the band.

## 1. Per-seed table (analyzer + leg logs)

| Seed | Days | End | Wave | Standing | Grants | Launches | Fights | Holds | Deaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107359 | 148 | village-lost | 4 | 199 | 0 | 0 | 12 | 0 | 71 |
| 107360 | 150 | survived | 5 | 405 | 0 | 11 | 37 | 1 | 112 |
| 107361 | 150 | survived | 5 | 595 | 0 | 0 | 2 | 0 | 115 |
| 107362 | 150 | survived | 4 | 199 | 2 | 0 | 0 | 0 | 57 |
| 107363 | 126 | village-lost | 4 | 199 | 0 | 1 | 22 | 2 | 135 |
| 107364 | 150 | survived | 5 | 480 | 2 | 3 | 15 | 0 | 74 |
| 107365 | 107 | village-lost | 4 | 199 | 0 | 8 | 7 | 0 | 101 |
| 107366 | 150 | survived | 5 | 450 | 1 | 10 | 51 | 0 | 162 |

Totals: 5 grants, 33 launches, 146 fights, 3 holds, 827 deaths, 0 instrument errors. (Analyzer `days` reads 151 on survived seeds vs the driver's 150; same 1-day quirk as killloot16/gunlife. No bar turns on it.) Launches are lumpy: seeds 107359/107361/107362 launched nothing (107362 is hannah_kim's seed — both her guns, zero launches, zero fights on the whole seed); 107360 + 107366 carry 21 of 33 launches.

## 2. Per-launch lead table (the judged deliverable)

Columns: lead profile / veteran (V3 = wave-3+ kill, V4 = wave-4+ kill) / HP at launch / A = armed, a = armored / gun / party size / party (companions) / source. Every launch came from the brain path (`vbrainExecuteDepart` — the brain owns dawn, so `winPlanDepart` never fires on this substrate).

| Seed | Day | Lead | Profile | Vet | HP | Gear | Gun | Size | Companions | Src |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 107360 | 125 | visjoin_110 | forager | V3 | 48 | Aa | - | 4 | somchai_prasert, sofia_chen, visjoin_109 | brain |
| 107360 | 128 | sofia_chen | forager | - | 100 | Aa | - | 2 | somchai_prasert | brain |
| 107360 | 136 | sofia_chen | forager | - | 89 | Aa | - | 2 | visjoin_132 | brain |
| 107360 | 136 | visjoin_110 | forager | V3 | 68 | Aa | - | 4 | visjoin_132, visjoin_123, sofia_chen | brain |
| 107360 | 136 | visjoin_124 | forager | - | 68 | Aa | - | 4 | visjoin_132, visjoin_110, visjoin_123 | brain |
| 107360 | 138 | sofia_chen | forager | - | 95 | Aa | - | 2 | visjoin_132 | brain |
| 107360 | 140 | visjoin_110 | forager | V3 | 80 | Aa | - | 4 | visjoin_137, visjoin_123, visjoin_124 | brain |
| 107360 | 144 | visjoin_123 | forager | V3/V4 | 38 | Aa | - | 2 | visjoin_132 | brain |
| 107360 | 144 | visjoin_124 | forager | V3 | 51 | Aa | - | 4 | visjoin_132, visjoin_123, visjoin_137 | brain |
| 107360 | 146 | visjoin_123 | forager | V3/V4 | 64 | Aa | - | 2 | visjoin_132 | brain |
| 107360 | 146 | visjoin_137 | wanderer | - | 100 | Aa | - | 2 | visjoin_132 | brain |
| 107363 | 113 | aria_thompson | forager | V3 | 76 | Aa | - | 3 | visjoin_111, sofia_chen | brain |
| 107364 | 129 | katarina_novak | wanderer | - | 80 | Aa | - | 4 | liam_davis, benoit_lambert, gen_rjiwuam | brain |
| 107364 | 137 | benoit_lambert | forager | V3 | 70 | Aa | - | 2 | katarina_novak | brain |
| 107364 | 140 | gen_rjiwuam | forager | V3 | 85 | Aa | - | 2 | katarina_novak | brain |
| 107365 | 80 | ava_garcia | forager | V3 | 78 | Aa | - | 4 | desmond_clarke, gen_pi4h5vm, quinn_murphy | brain |
| 107365 | 83 | quinn_murphy | forager | - | 80 | Aa | - | 2 | desmond_clarke | brain |
| 107365 | 86 | gen_pi4h5vm | forager | V3 | 80 | Aa | - | 2 | desmond_clarke | brain |
| 107365 | 86 | quinn_murphy | forager | - | 79 | Aa | - | 2 | desmond_clarke | brain |
| 107365 | 86 | ava_garcia | forager | V3 | 89 | Aa | - | 4 | desmond_clarke, gen_pi4h5vm, quinn_murphy | brain |
| 107365 | 90 | gen_pi4h5vm | forager | V3 | 77 | Aa | - | 2 | desmond_clarke | brain |
| 107365 | 94 | gen_pi4h5vm | forager | V3 | 39 | Aa | - | 2 | desmond_clarke | brain |
| 107365 | 94 | quinn_murphy | forager | - | 88 | Aa | - | 2 | desmond_clarke | brain |
| 107366 | 88 | caleb_jones | forager | - | 39 | Aa | - | 4 | zoe_adams, gen_n1v1qsb, app_mgpsphsp217 | brain |
| 107366 | 91 | app_mgpsphsp217 | forager | - | 59 | Aa | - | 2 | ruby_callaghan | brain |
| 107366 | 92 | gen_n1v1qsb | forager | V3 | 100 | Aa | - | 2 | zoe_adams | brain |
| 107366 | 95 | app_mgpsphsp217 | forager | - | 60 | Aa | - | 1 | (solo) | brain |
| 107366 | 97 | gen_n1v1qsb | forager | V3 | 71 | Aa | - | 2 | zoe_adams | brain |
| 107366 | 105 | gen_n1v1qsb | forager | V3 | 92 | Aa | - | 2 | ruby_callaghan | brain |
| 107366 | 105 | app_mgpsphsp217 | forager | - | 92 | Aa | - | 2 | zoe_adams | brain |
| 107366 | 111 | app_mgpsphsp217 | forager | - | 55 | Aa | - | 2 | ruby_callaghan | brain |
| 107366 | 112 | app_mgpsphsp217 | forager | - | 32 | Aa | - | 2 | zoe_adams | brain |
| 107366 | 137 | aki_tanaka | forager | - | 42 | Aa | - | 3 | liam_davis, greta_hansen | brain |

Lead aggregates over the 33 launches: veteran3 60.6%, veteran4 6.1%, armed 100%, armored 100%, gun 0%, mean HP 71.6, mean wave-3+ kills 0.79. Profiles: forager 31, wanderer 2. Fight leads (146 wave-4+ fights): veteran3 55.5%, veteran4 11.0%, armed 97.3%, armored 97.3%, gun 2.1% (3 fights), mean HP 63.1; profiles forager 98, wanderer 41, explorer 4, homebody 3. One launch went out SOLO (107366 day 95, app_mgpsphsp217, party size 1) — recorded, not chased; the launch path allows it when the companion's expedition fails after the holder's starts.

## 3. The mechanism — why the armed holder never leads

**The rule, from code (prereg §2, re-verified on this base).** There is no lead-selection step. The lead IS the plan holder: `winPlanDepart` / `vbrainExecuteDepart` launch the holder's own plan, and the holder walks out first. Companions are picked around them by `findCompanion` (trust ≥ 15, at Haven, ranger profile, not engaged/away/on-expedition), ranked by `companionScore` (errand/temper/relationship/loneliness — no gun term, no ranged term, no combat-skill term; the code has no numeric combat-skill field at all). The 2nd/3rd picks tier on (1) living wave-3+ killers, (2) armed villagers, (3) the rest. A gun holder can only lead by holding a wave-4+ plan themselves — and the plan is the thing they (almost) never hold.

**The numbers.** 9 gun holders on the band (6 villagers + 3 scholar spells), 218 gun-days, 213 equipped-days. Only ONE ever held a wave-4+ plan:

| Holder | Seed | Gun days | W4-plan days | Gun+W4 days | Launches led | Fights led | Story |
| --- | --- | --- | --- | --- | --- | --- | --- |
| gen_bskcxwf | 107359 | 45 | 0 | 0 | 0 | 0 | no plan at all |
| __scholar__ | 107359 | 29 | 0 | 0 | 0 | 0 | scholar, not a villager lead |
| hannah_kim | 107362 | 47 | 0 | 0 | 0 | 0 | plan frozen targetless in `hunt` from day 14; 3 wave-3 seeds bounced |
| gen_zyyb5v9 | 107362 | 31 | 0 | 0 | 0 | 0 | no plan at all |
| gen_qw4cjxt | 107364 | 5 | 0 | 0 | 0 | 0 | no plan at all |
| __scholar__ | 107364 | 3 | 0 | 0 | 0 | 0 | scholar |
| katarina_novak | 107364 | 16 | 24 | 5 | 0 | 1 | the one w4 plan — held BEFORE the gun; launched day 129 WITHOUT it |
| zoe_adams | 107366 | 40 | 0 | 0 | 0 | 2 | plan frozen targetless in `hunt` from day 12; 5 seeds bounced, incl. a wave-5 |
| __scholar__ | 107366 | 2 | 0 | 0 | 0 | 0 | scholar |

Gun-holder vs lead comparison: launch leads are 60.6% veteran3 / 100% armed / 100% armored / 0% gun; gun holders are 44.4% ever-veteran3 / 66.7% ever-armed / 66.7% ever-armored — the holders are not obviously worse fighters, they are simply not plan holders. Only 1/9 holders ever held a wave-4+ plan (11.1%); across the band 25 villagers held a wave-4+ plan (corrected definition — needWave ≥ 4 OR target is a wave-4+ species), 16 of whom launched it.

**Link 1 — the hunt-stage lock.** Hannah's plan is `party`, target null, needWave null from day 10; on day 14 it goes `hunt` with party `[gen_gu5ah84]` — she rode a sub-wave-4 launch as a companion, and the companion sync set her plan to `hunt` with the holder's (targetless) target. Her three wave-3 seeds (Redactor day 26 evaded, Spool day 38 evaded, Ad Break day 43 fled) each returned the plan unchanged: `winPlanSeedFromFight` early-returns when the stage is not `gear`/`party`. Zoe's plan is `party` targetless day 11, `hunt` day 12 with `[gen_ouy4n0j]`; her five seeds (Gavel 31 evaded, Focus Group 57 evaded, Suburb 95 fled, Gavel 106 evaded, Timeslot 108 fled — a wave-5 face) all bounced the same way. A plan that reaches `hunt` as a companion can never become a wave-4 plan afterward, no matter what its holder faces.

**Link 2 — the needWave drop.** The companion sync (`launchParty`, win-plan.js:1313) copies `stage`, `party`, `target`, `node` — but NOT `needWave`. So a companion-inherited plan can carry a wave-4 target with `needWave: null`, and every `needWave >= 4` gate goes blind to it: `extraCompanionScan` (no 2nd/3rd companion), `winPlanDepartLaunchBeat` (no departure beat — 22 of 33 launches spoke no beat). Measured: needWave-set launches 11, mean party 3.82, trio+ 11/11; needWave-null launches 22, mean party 1.95, trio+ 0/22. The null-needWave holder still launches (the launch itself needs no needWave), but always as a pair into wave-4+ fights. The gun holders' rides confirm the companion side: 7 launches with a gun holder in party, all 7 as FIRST companion (slot 1 — the `findCompanion` pick, never the tiered 2nd/3rd pick).

**Link 3 — the gun never enters the pick.** Launch leads carry a gun in 0/33 launches; fight leads in 3/146 fights. The 3 gun-led fights: katarina day 140 vs a wave-5 Network Note — 2 shots, 1 hit, 68 damage, cells spent, she died in the fight (vDie, round 4); zoe day 95 vs a wave-4 Suburb — 2 shots, 1 hit, 65 damage, fled round 1; zoe day 108 vs a wave-5 Timeslot — dry, 0 shots, 0 cells, fled round 6. Two of three fired. The gun works when its holder leads; the holder just almost never leads.

**The profile flip (second-order, measured).** The skew is in who HOLDS wave-4 plans, not who launches them: 25 wave-4+ plan holders split forager 23 / wanderer 2, while launch leads split forager 31 / wanderer 2 — the launch faithfully launches whoever holds the plan. The flip appears at SEEDING: wave-3 plans seed onto rangers (wanderer 38 / explorer 21 / forager 15), wave-4 plans onto foragers (forager 22 / wanderer 11 / explorer 3). The seeding channel flips with it: wave-3 seeds are evade-dominated (evaded 55 / fled 19 — expedition encounters), wave-4 seeds flee-dominated (fled 24 / evaded 12 — field-fight flees). Leading hypothesis, NOT proven by this corpus: wave-4 facings are wild encounters at/near Haven (foragers are home; rangers are out ranging), while wave-3 facings are expedition evades (rangers out). Filed as an open finding (§7) for a follow-up with fight-origin rows; the lead question itself does not turn on it.

**Katarina, the control case.** She proves the rule by being the exception that follows it exactly. Days 116/121/125 she fled an Algorithm, an Audit, a Reunion — her plan was still in `party` stage, so each seed retargeted it (needWave 4 throughout). Day 117/118 launch attempts returned `normal` (no companion found); day 129 she launched a quad (liam_davis, benoit_lambert, gen_rjiwuam) — needWave set, so the trio+ picks worked. She won the gun on day 135 (moot contest, 2 cells) — six days AFTER her launch, carried but never equipped while the plan lived (days 135–136: gun carried, cells 2, equipped false). Day 140 she led a wave-5 fight against a Network Note as an expedition fighter, the gun fired (2 shots, 1 hit, 68 damage, cells 0), and she died in round 4; the gun stayed equipped on her corpse to the horizon. The only holder who ever held the plan AND the gun held them in the wrong order.

## 4. Wall numbers

| Metric | This band (8 seeds) |
| --- | --- |
| Wins | 0/8 |
| National | 0/8 |
| Table | not instrumented by this driver (recorded, never faked) |
| Wave 5 unlocks | 4/8 |
| Wave 4 unlocks | 8/8 |
| Median survival | 150d (analyzer gameDays; driver-days median 150d) |
| Max survival | 150d |
| Villages lost | 3/8 |

The scale wall still binds — regional is the ceiling on all 8 seeds (standing 199–595), no national, no wins — but the wall is not this arm's question; the numbers are reported because the standing directive requires them every run. Same shape as the gunlife band (0/8 wins, 0/8 national, 4/8 wave 5).

## 5. Sense-test — Katarina walks out, Zoe rides along

No `say` transcript is captured by this driver (same as gunlife) — the sense-test reads the launch rows against the departure-beat template the code pins (`departLaunchBeat`, win-plan.js:624: `"<name> sets out [with <party>] [after <monster>] — the fire marks the trail."`, SYSTEM-voiced once the System has arrived). Katarina's day-129 launch reads, instantiated: *"Katarina Novak sets out with Liam Davis, Benoit Lambert and Gen Rjiwuam after the Audit — the fire marks the trail."* It reads as people making a choice: she fled that Audit on day 121, spent eight days at Haven finding three companions, and walked back out after it. The record around it reads the same way — Hannah winning two pit/cache contests on days 105/120 and carrying both guns for 47 days while her plan sits targetless; Zoe riding out five times as the first companion a holder asks for, then facing a Suburb alone enough to fire the gun she won. What does NOT read as people: 22 of 33 launches spoke NO beat at all (needWave null — the beat gates on the same dropped field), so two-thirds of the village's most consequential departures pass in silence; and the companion-sync plan that freezes hannah's and zoe's ambitions has no voice anywhere — nobody ever says their plan went nowhere. The silence is the defect's fingerprint, not a separate bug.

## 6. Instrument notes and deviations

- **Pre-flight (NOT judged):** proof 12/12, selftest 17/17 (killlootbundle, re-run on the rebased tip), `test-leadgate-a.js` 33/33, analyzer selftest 21/21 — all on base `87b2122f3` before any judged run. Green.
- **Rebase before the prereg (coordinator heads-up).** Branch base was `d2aedf6e6`; master moved to `87b2122f3` (Loop B sim-hpgate-b merge). The branch fast-forward-rebased onto `87b2122f3` (exit 0, no conflicts, no stop-at-pick quirk — the branch tip was an ancestor of the new tip). Scope verified: the range is exactly one commit; its only game-code change is `src/js/villager-agency.js` +43, an HP-gate on pinned-quad DOOR parties env-gated `HPGATE=1` AND `_pinDoor` (PINQUAD). This substrate sets neither, so off-mode is byte-identical — it cannot affect lead selection or party formation on this band; it also gates at the door-open decision, not at launch or lead selection. Verified by reading the diff.
- **Heartbeat lock (NOT judged).** The worktree heartbeat failed once (`registry lock held > 120s`) — the lock was held by the LIVE coordinator registration process (pid 4237, registering the sibling arms sim-vanishtile-a + sim-cellcheck-a and heartbeating this tree). Not stale, not touched. Heartbeat re-established after the band (see run identity).
- **Leg-2 redirect failure (NOT judged).** The first leg-2 launch died instantly: the shell could not create its log file (`evidence/2026-11-22/leadgate-a-leg2.log: No such file or directory`) — a write-flap blip in the same minute leg 1 started cleanly. Leg 1 was unaffected. Leg 2 was relaunched with the log pre-created (`touch` first); no judged numbers came from the failed launch.
- **Volley-scope bug + killed legs + full re-run (BEFORE judgment).** The first band's first three seeds landed with `errors` 12/37/22 and `w4fights` 0: the v4fights push read the volley `v`, which was declared as a block-scoped `const` inside the volley try — every wave-4+ fight threw `v is not defined`. The departs/planSeeds/census rows in those files were valid, but the corpus failed bar 1, so BOTH legs were killed mid-run (pids 17009/17308, no judged analysis had run), the driver was fixed (`let v` at wrap scope), a regression check was added to the proof test (33/33), the three partial files + leg logs were deleted, the fix was committed (`7fe56628e`), and the FULL 8-seed band was re-run fresh on the fixed instrument. The judged band is the second run only; the first run's numbers appear nowhere in the verdict. The fix is a driver-only change — no game code, no trajectory effect (the wrap's throw happened AFTER the fight, in driver-local logging).
- **Analyzer fix during analysis (NOT a re-score).** The prereg's wave-4-plan definition (`needWave >= 4`) undercounts: the companion sync copies target but not needWave, so 11 of 25 wave-4+ plan holders carry a wave-4 target with `needWave: null` (14 by needWave alone vs 25 corrected). The analyzer was corrected to the OR definition (needWave ≥ 4 OR target is a wave-4+ species), a selftest fixture was added for it (fixture 9), and the analysis was re-run deterministically on the same corpus — no new band. The frozen bars do not depend on the w4-plan definition (coverage is launch/fight attribution; GO is the named rule + next lever), so no bar was re-scored; the correction is recorded here and in §8. A second analyzer bug caught by the same re-run: `w4HoldersEverLaunched` read the gun-gated led map instead of the all-leads map (read 0, true value 16/25) — fixed with a separate `ledCounts` map + selftest check (fixture 7).
- **RUN / OUTDIR:** `RUN=leadgate-a` (fresh) and fresh OUTDIR `perseed-leadgate-a-ctl`; corpus under `evidence/2026-11-22/` (the killlootbundle driver's hardcoded 2026-11-21 date dir was corrected in this copy).
- **Band launch (judged):** 2 detached processes, 4 seeds each, both exit 0; 8/8 files landed on disk, anchor `7fe56628e` on all 8; 0 instrument errors on all 8. Leg logs concatenated into `leadgate-a-legs-ctl.log`.
- **Index clobber check:** after each safe-commit the worktree index was verified (no clobber observed on this arm's commits).

## 7. Findings (for the coordinator to append to sim-findings.md)

- [answered] 2026-11-22 — parties / lead — WHY THE GUN'S HOLDER IS NEVER THE WAVE-4+ LEAD (finding #2667 follow-up, gunlife-a §3): ANSWERED by sim-leadgate-a (Loop A run fleshout-20261122T1115Z, evidence/2026-11-22/sim-leadgate-a.md, verdict DIAG-GO, 33 launches + 146 fights, 100% attributed): there is NO lead-selection rule — the lead IS the plan holder by construction, and a gun holder leads only by holding a wave-4+ plan of their own. 1 of 9 gun holders ever held one (katarina_novak, 24 days; launched once, 6 days BEFORE the gun arrived); the other 8 held one on 0 of 202 gun-days. The mechanism: (a) plans seed only from a personal wave-3+ face, and a `hunt`-stage plan can never retarget — hannah_kim and zoe_adams froze targetless in `hunt` by riding as companions on days ~12–14, and all 8 of their later wave-3/4/5 seeds bounced; (b) the companion sync copies target but NOT needWave — 22/33 launches were led by a null-needWave holder and ALL went out as pairs (0 trios) vs 11/11 trio+ for needWave-set holders, and the departure beat stays silent on the null half; (c) the gun never enters the pick (findCompanion / companionScore / extraCompanionScan tiers — a holder is at best tier-2 armed companion; 7 rides as first companion, 0 leads). The gun DOES fire when its holder leads (2 of 3 gun-led fights fired, 68 and 65 dmg). Next lever: copy `needWave` in the companion plan sync (one-line class); second: let a `hunt`-stage plan retarget on a higher-wave seed.
- [open] 2026-11-22 — parties / instrument — COMPANION SYNC DROPS needWave, SHRINKING PARTIES AND SILENCING BEATS (sim-leadgate-a §3/§6): `launchParty`'s companion sync (win-plan.js:1313) copies stage/party/target/node but NOT needWave, so a companion-inherited plan can carry a wave-4 target with `needWave: null`. Measured on band 107359–107366: 22/33 launches needWave-null, all pairs (mean 1.95, 0 trios) vs 11 needWave-set launches, all trio+ (mean 3.82); the departure beat gates on the same field, so 22/33 launches spoke no beat. This is the same defect as the lead finding's link 2, filed separately because its blast radius is party size + beat silence, not just lead attribution. Next step: the needWave-copy lever (named above); judge on null-launch rate, trio+ rate on those launches, and beat rate.
- [open] 2026-11-22 — parties / seeding — THE PROFILE FLIP: WAVE-3 PLANS SEED ONTO RANGERS, WAVE-4 ONTO FORAGERS (sim-leadgate-a §3): wave-3 plans seed wanderer 38 / explorer 21 / forager 15, wave-4 plans forager 22 / wanderer 11 / explorer 3; the channel flips with it (wave-3 evade-dominated 55/19, wave-4 flee-dominated 24/12). Leading hypothesis (NOT proven): wave-4 facings are wild encounters at/near Haven (foragers home) vs wave-3 expedition evades (rangers out). Next step: a follow-up arm recording fight origin on plan-seed rows (world-tick vs expedition vs patrol vs aid) before anyone tunes the seed channels.
- [open] 2026-11-22 — parties / launch — ONE SOLO WAVE-4+ LAUNCH (sim-leadgate-a §2): seed 107366 day 95, app_mgpsphsp217 launched a wave-4+ plan with party size 1 (no companions). Recorded, not chased — the launch path allows it when the companion's expedition fails after the holder's starts. Next step: check whether solo launches are a real path or a recorder edge (party recorded post-launch) before treating it as a defect.

## 8. Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged run** (prereg content ~06:15 UTC, committed `88c9d12c3`, judged band launched after): all four bars pass; bar 3 passes on the diagnosis + named next lever in §3/§7. No bar was re-scored. The zero-launch rule never fired (33 launches).
- **Wave-4-plan definition corrected during analysis (not a re-score).** The prereg defined "holds a wave-4+ plan" as `needWave >= 4`. The corpus proved that definition wrong: the companion sync drops `needWave`, so 11 of 25 wave-4+ plan holders carry a wave-4 target with `needWave: null` and are invisible to it. The analyzer was corrected to the OR definition (needWave ≥ 4 OR target is a wave-4+ species) with a new selftest fixture, and the analysis re-ran deterministically on the same corpus. The frozen bars do not use the w4-plan definition (bar 2 is launch/fight attribution; bar 3 is the named rule + next lever), so the verdict is unchanged by the correction — but the gun-holder numbers in §3 (1/9 ever held one) DO rest on the corrected definition, and the prereg's §6 definition should be read as superseded by it. Proposed revision for the next run: freeze the OR definition in the prereg.
- **The `w4HoldersEverLaunched` miscount.** The first analysis read 0/25 because the count reused the gun-gated led map; the true value is 16/25. Fixed with a separate all-leads map + selftest check; the re-run on the same corpus gives 16. Same class as the definition correction: an analyzer bug caught by cross-checking against ad-hoc queries, fixed before the evidence was written.
- **The band is launch-lumpy (3/8 seeds, 0 launches).** Seeds 107359/107361/107362 launched nothing; 107360 + 107366 carry 21 of 33 launches. The mechanism split (holder-is-lead; hunt-lock; needWave drop) rests on 33 launches + 146 fights; a wider band would firm the shares (e.g. the 22/33 null-needWave share), not the mechanism — the rule is code-derived (prereg §2) and the traces confirm it in every column. The gun-holder population (9 holders) is thin; the 1/9 figure should be read as "rare", not as a precise rate.
- **Launch attribution is complete but hold attribution is thin.** Only 3 holds on the band (vs 33 launches) — the hold path is barely exercised, so nothing is claimed about why launches fail to happen. The diagnosis is about who leads when a launch DOES happen, which the corpus covers at 100%.

## Files

- Prereg: `evidence/2026-11-22/sim-leadgate-a-prereg.md` (`88c9d12c3`)
- Evidence: `evidence/2026-11-22/sim-leadgate-a.md` (this file)
- Driver: `scripts/leadgate-driver-a.js` (`7fe56628e` — volley-scope fix)
- Analyzer: `scripts/analyze-leadgate-a.js` (selftest 21/21)
- Proof test: `scripts/test-leadgate-a.js` (33/33)
- Analysis: `evidence/2026-11-22/leadgate-a-analysis.json`
- Corpus: `evidence/2026-11-22/perseed-leadgate-a-ctl/` (8 files, anchor `7fe56628e`)
- Leg log: `evidence/2026-11-22/leadgate-a-legs-ctl.log` (8 judged summary lines, both legs, exit 0)

## Run identity

- **Base:** worktree HEAD `7fe56628e` (master `87b2122f3` + prereg `88c9d12c3` + instrument `9325d2520` + fix `7fe56628e`); branch `sim-leadgate-a`.
- **Pre-flight:** `node scripts/test-killlootbundle-a.js` → 12/12; `node scripts/analyze-killlootbundle-a.js --selftest` → 17/17; `node scripts/test-leadgate-a.js` → 33/33; `node scripts/analyze-leadgate-a.js --selftest` → 21/21 (all on `87b2122f3`, re-run after the fix on `7fe56628e`).
- **Band (judged):** 2 detached processes, 4 seeds each: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-leadgate-a-ctl SEEDS=107359,107360,107361,107362 | 107363,107364,107365,107366 RUN=leadgate-a node scripts/leadgate-driver-a.js`. 8/8 legs complete, 0 instrument errors, both processes exit 0.
- **Analysis (judged):** `node scripts/analyze-leadgate-a.js --dir evidence/2026-11-22/perseed-leadgate-a-ctl --out evidence/2026-11-22/leadgate-a-analysis.json` → exit 0, verdict DIAG-GO-PENDING (computed) / DIAG-GO (diagnosis in §3), 33 launches, 146 fights.
- **No [needs-eyes]:** diag arm, no game-code change, no feel/combat/UI change — nothing for Steve to playtest.
