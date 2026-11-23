# sim-gatehorizon-b — the leader-projection gate over a 150-day horizon

**Verdict: DIAG-NO-GO — SUPPLY-THIN (pilot). No confirm spend.**
**Run:** fleshout-loop-b-20261123T1430Z, Loop B arm 2 of 2. Anchor commit `adfccecc3086f8665897309caef33639517fbf46` (prereg + spec). Base master `43ebee38c` (journey-establishment r274). Worktree `~/workspace/worktrees/sim-gatehorizon-b`, branch `sim-gatehorizon-b`. Zero `src/js` changes — the gate stays OFF by default; this arm judges only.

## 1. What was judged, in plain words

Doorstage-b proved the leader-projection gate works on a single staged fight: when a village leader walks into a wave-4 monster's door badly hurt, the gate says no, and the leader lives. What it did not show is whether that refusal matters over a whole run — whether it saves leaders, costs or keeps wave-4 kills, or changes who survives 150 days. This arm staged the same pool doors inside live 150-day village sims, gate off vs gate on, and measured what changed downstream.

**Answer in one paragraph:** it does not matter on this band, and not because the gate fails to fire — it fires 29 times and refuses all five staged doors. It does not matter because (a) only 5 of 8 pilot seeds ever presented a stageable door, below the 6 needed to judge; (b) every staged door the gate refused was a fight the village won on the control leg (5 of 5 killed, no leader lost), so the refusals cost wave-4 kills instead of saving leaders (14 vs 37 downstream); and (c) the leaders who actually die in wave-4 fights die on unpinned doors the gate never sees — all six armed-leg low-HP deaths were unpinned, none covered by a fire. The frozen primary metric reads 0 deaths on both legs, but that 0 is partly an instrument artifact (see §7): nine same-day monster deaths of leaders who entered wave-4 fights at 75 HP or less are in the death log while the frozen flag reads them all as survived.

## 2. Prereg summary (frozen before any judged run)

Prereg: `evidence/2026-11-23/sim-gatehorizon-b-prereg.md`. Spec: `evidence/2026-11-23/gatehorizon-b-spec.json` (the same 12 doorstage pool doors; door seeds 424200–424211 NOT reused).

| Bar | Frozen rule |
|---|---|
| H1a (primary) | Attributed pool-door leader deaths, staged + organic: a `v4encounters` row, wave ≥ 4, `leaderEntryHp` ≤ 75, `leaderDied` true. GO: armed ≤ control − 1. |
| H1b (co-primary) | Downstream wave-4 kills (`waveKillLog` rows `w==4`, `d` > staging day, plus the staged-door kill). GO: armed ≥ control − 1. |
| Guardrails | Starvation deaths armed ≤ control + 2; village deaths armed ≤ control + 2; median survival armed ≥ 0.8× control; balanced panel M5 `review_required` with NO regression signal on village deaths. |
| Supply | Pilot judges only if scored ≥ 6 of 8; confirm (16 total) only if scored ≥ 12 of 16; otherwise DIAG-NO-GO SUPPLY-THIN. Control pool-door leader deaths = 0 on pilot → NO-GO METRIC-BROKEN. |
| Design | One 150-day `capable`-policy sim per seed per leg (control gate OFF, armed `LEADERPROJ=1`). One staged pool door at the first 10-day chunk boundary where the village is alive AND `unlockedWave() >= 4` AND a stageable quad exists (cap day 120); else unscored (`dead` / `no-unlock` / `no-quad` / `unstageable`). One staged door per scored seed, rotated over the 12 pool doors by band position. Door-10 fix: armor pre-check at the door (pack-staged kit, replacement from spares up to 3 tries); budget at most 1 unscored door per 12 staged. Death-aware: `runDays` stops at `Game.over`. |
| Seeds | Band 109101–109116, verified fresh across all `evidence/*/sim-*-prereg.md` (zero hits for the band and each pilot seed; bare `109105` appears in Oct-14 JSON artifacts only as metric values, not seed reservations). Pilot 109101–109108; confirm 109109–109116 only on pilot GO. |
| Policy | `capable` sha `4c4d1535d76c8327d40e746ede8f09d97ee26d7451b6daabb401d409e05443ff`; base `competent.js` sha `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`. Substrate both legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1`; armed adds `LEADERPROJ=1`; `LEADERHPGATE` unset both legs. |
| Instrument | `scripts/gatehorizon-driver-b.js` (chunked 10-day `runDays`, mid-run staged door, whole-run tele + fieldFight wraps, pack-armor door-10 fix), `scripts/analyze-gatehorizon-b.js` (frozen bars + verdict order: supply, D6, D5, H1a zero-control, H1a/H1b, guardrails). |

## 3. Proof battery (all green on this tree, this base)

| Proof | Result |
|---|---|
| M1 test-allyslot3-b | 18/18 |
| M2 test-pinquaddoor-b | 35/35 |
| M2w test-pinquaddoor-wide-b | 16/16 |
| M3 test-dmgpin-b | 29/29 |
| M3d test-doorflee2-b | 49/49 |
| M3e test-downedtwice-b | 25/25, exit 0 |
| M3f test-hypofloor-b | 48/48 |
| M3g test-hpgate-b | 43/43 |
| M3h test-leaderhpgate-b | 50/50 |
| M3i test-leaderproj-b | 55/55 (inside M3m §6) |
| M3j test-gateavoid-b | 36/36 (inside M3m §6) |
| M3k test-gateavoid-screen-b | 11/11 |
| M3m test-gatehorizon-b | **33/33, 0 failed** (judged post-freeze run) |
| Analyzer selftest | 14/14 (inside M3m §5) |

Run notes: the first M3m run was killed externally mid-§6 (~16:05 UTC — the whole detached tree died silently; no OOM, memory free, no EXIT line). It was re-run clean. Two test-only corrections were made before the judged run, neither touching the driver or the game: the §3 async structure was fixed (it raced `process.exit`), and the §4 horizon assertion was corrected for the harness's 1-based day count (30 loop-days from day 1 lands on day 31, not 30). The §6 spawn timeouts were raised 600s → 1800s after a nested suite timed out under shared-box load (load ~19) — a harness artifact, not a gameplay verdict.

## 4. Pilot legs — headline numbers

Analyzer: `scripts/analyze-gatehorizon-b.js --control …/perseed-gatehorizon-b-control --armed …/perseed-gatehorizon-b-armed --seeds 109101,…,109108`, output `evidence/2026-11-23/gatehorizon-b-analysis.json` (exit 1 = non-GO, as designed).

```
leg       n scored poolDeaths w4down w4tot w5tot starv vDeaths medSurv leadAlive stagedDeaths projFires
control   8  5      0          37     38    14    1     896     90      2         0            0
armed     8  5      0          14     14    1     6     774     90      2         0            29
wall: control won=6 national=7 table=2 entered=6 w4unlock=8 w5unlock=8
      armed   won=6 national=6 table=2 entered=6 w4unlock=8 w5unlock=6
supply: FAIL (need 6, control 5, armed 5)
H1a: FAIL (control 0, armed 0, need armed <= control - 1)
H1b: FAIL (control 37, armed 14, delta -23, need armed >= control - 1)
D5: PASS (no instrument errors)   D6: PASS (no instrument errors)
guardStarvation: FAIL (control 1, armed 6, need armed <= control + 2)
guardVillageDeaths: PASS (896 vs 774)   guardSurvival: PASS (median 90 vs 90)
VERDICT: DIAG-NO-GO kind SUPPLY-THIN
```

### 4a. Staged-door table (paired — same day, door, leader HP, armor both legs)

| Seed | Day | Door | Leader HP → proj. HP in 2 rounds | Control | Armed |
|---|---|---|---|---|---|
| 109101 | 41 | 1 audit | 30 → −20 | FOUGHT, vKill, 6 rounds, 1284 dealt | FIRED (refused) |
| 109102 | 52 | 2 reunion | 40 → −10 | FOUGHT, vKill, 5 rounds, 1384 dealt | FIRED |
| 109103 | 71 | 3 eater | 50 → 0 | FOUGHT, vKill, 4 rounds, 1077 dealt | FIRED |
| 109105 | 41 | 5 suburb | 55 → 5 | FOUGHT, vKill, 5 rounds, 1472 dealt | FIRED |
| 109107 | 51 | 7 algorithm | 75 → 25 | FOUGHT, vKill, 4 rounds, 1024 dealt | FIRED |
| 109104 / 109106 / 109108 | — | — | — | unscored `dead` (see §6) | unscored `dead` |

Control staged doors: 5 fought, 5 killed, 0 leader deaths. Armed staged doors: 5 fired, 0 fought. The gate works exactly as designed at the door — and every door it refused was winnable. At-door armor on staged quads was 32–67 per member (door-10 fix held; zero unscored `unstageable` doors).

### 4b. Per-seed horizon table

| Seed | Leg | Scored | Stage | Proj fires | W4 tot / down | W5 tot | Won | Rank | Days | Deaths | Starv | Leader alive at end |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 109101 | ctl | Y | 41 audit | 0 | 6 / 6 | 4 | yes | global | 90 | 142 | 0 | no |
| 109101 | arm | Y | 41 audit | 3 | 1 / 1 | 0 | yes | global | 90 | 133 | 0 | yes |
| 109102 | ctl | Y | 52 reunion | 0 | 10 / 10 | 4 | yes | global | 90 | 123 | 0 | yes |
| 109102 | arm | Y | 52 reunion | 9 | 5 / 5 | 1 | yes | global | 92 | 122 | 0 | no |
| 109103 | ctl | Y | 71 eater | 0 | 2 / 1 | 0 | yes | global | 91 | 63 | 1 | no |
| 109103 | arm | Y | 71 eater | 2 | 2 / 2 | 0 | yes | global | 90 | 71 | 1 | yes |
| 109104 | ctl | dead | — | 0 | 4 / — | 1 | yes | global | 91 | 93 | 0 | — |
| 109104 | arm | dead | — | 0 | 4 / — | 1 | yes | global | 91 | 93 | 0 | — |
| 109105 | ctl | Y | 41 suburb | 0 | 3 / 3 | 1 | yes | global | 90 | 70 | 0 | no |
| 109105 | arm | Y | 41 suburb | 2 | 2 / 2 | 0 | no | regional | 76 | 77 | 4 | no |
| 109106 | ctl | dead | — | 0 | 4 / — | 0 | yes | global | 90 | 82 | 0 | — |
| 109106 | arm | dead | — | 6 | 4 / — | 0 | yes | regional | 90 | 86 | 0 | — |
| 109107 | ctl | Y | 51 algorithm | 0 | 17 / 17 | 5 | no | global | 152 | 229 | 0 | yes |
| 109107 | arm | Y | 51 algorithm | 1 | 4 / 4 | 0 | yes | global | 93 | 92 | 0 | no |
| 109108 | ctl | dead | — | 0 | 3 / — | 0 | no | regional | 59 | 94 | 0 | — |
| 109108 | arm | dead | — | 6 | 4 / — | 0 | no | global | 70 | 100 | 1 | — |

Notes: 109104 armed is byte-identical to its control (same kills, deaths, days) — the gate never fired there, so nothing diverged. 109105 is the one paired divergence in the wrong direction: control won at global on day 90; armed lost the village at regional on day 76 with 4 starvation deaths (control: 0). 109107 is the only seed to run the full horizon (152 days control; armed won day 93). Wave-5 kills collapse on armed (14 → 1 across scored seeds): refusing wave-4 doors cascades past wave 4.

### 4c. Wall numbers

Wins 6/8 both legs; national 7/8 control vs 6/8 armed; table entered 6/8 both; table waiting 2/8 both; wave-4 unlocked 8/8 both; wave-5 unlocked 8/8 control vs 6/8 armed; median survival 90 days both. Nothing about the win moved — the gate changes how villages fight wave 4, not whether they win.

### 4d. Death-cause shares (all 8 seeds per leg)

- Control, 896 deaths: expedition 508 (57%), villager combat 213 (24%), combat 115 (13%), monster-cause 15 (2%), starvation 1, thirst 6, sickness 7, wound-related 9, rest ~22. Monster-caused ≈ 95%.
- Armed, 774 deaths: expedition 379 (49%), villager combat 211 (27%), combat 123 (16%), monster-cause 11 (1%), starvation 6, thirst 6, sickness 6, wound-related 6. Monster-caused ≈ 94%.
- The armed leg has fewer deaths overall (774 vs 896) because its villages fight fewer monsters — but more starvation deaths (6 vs 1), which fails the starvation guardrail.

### 4e. Balanced panel (M5)

`scripts/build-pinquaddoor-b-panels.js` (`RUN=gatehorizon-b`, `CORPUS_PREFIX=gatehorizon-b`) + `node scripts/balance-panel.js compare` → `evidence/2026-11-23/gatehorizon-b-panel.md`. **Decision: `review_required`.** Village deaths per run 112 → 96.75, `no_material_signal` (interval −51.25 to 4.75); village deaths per 100 days likewise `no_material_signal`. The M5 condition (review_required, no regression signal on village deaths) is met. Two `regression_watch` flags, neither a regression signal: national scale access 0.875 → 0.75, community loss 0.125 → 0.25. Table win rate flat 0.75 → 0.75. (Builder note: the builder needs `--before-seeds` as well as `--seeds`; the before leg defaults to the old 106501 band otherwise. First run failed on that; re-ran with both flags.)

## 5. Sense test — do the refusals read as sensible decisions?

**The staged refusal reads sensibly.** Armed 109101, day 41, audit: *"gave audit room — Gina is too hurt to lead a door (projected 30 HP, -20 HP in two rounds)"*. A hurt leader stepping aside with the reason stated is believable fiction, and the note carries the numbers.

**But the refusal is wrong on the numbers.** The same door, same leader, same day on control: *"Gina walks straight into The Audit. No avoiding it."* Her quad charges in with her; six rounds; the monster takes 1284 damage; the whole party takes 41 HP total (armor absorbs heavily, Gina binds a wound mid-fight with field medicine); the monster dies. The projection says Gina would be at −20 HP in two rounds; the real fight never comes close. The projection doesn't account for the pinned quad fighting as one — coordinated ×2 strikes end the fight fast, and armor soaks the monster's hits. All five staged projections (30→−20, 40→−10, 50→0, 55→5, 75→25) describe doors the village then wins comfortably.

**The deaths the gate exists to prevent happen where it can't see them.** Control 109104, day 82: Amina fights an eater at 93 HP and flees at 5 HP — *"Amina sees how this ends — and runs while running still works."* Sensible. The same day she walks into a herald at 5 HP and dies in one round. That second door is unpinned (`pinned: false`, `gate: null`), so the gate never fires — on either leg. Armed 109104 is identical to control: Amina dies the same way, the gate silent (0 fires). Across the armed legs, six organic wave-4 deaths of leaders at 75 HP or less (19, 44, 2, 18, 31, 5 HP) were all on unpinned doors; zero were covered by a projection fire. The gate protects pinned doors; the dying happens on unpinned ones.

**Judgment:** the refusals are voiced well and read as real decisions, but they refuse winnable fights and miss the fights that actually kill leaders. The fiction is fine; the targeting and the math are not.

## 6. Diag table

| # | Finding | Evidence |
|---|---|---|
| 1 | Supply shortfall — 5/8 scored both legs (need 6) | 109104 + 109106 won at day 90–91 before any stageable 10-day boundary; 109108's village was wiped (day 59 control / 70 armed) before staging. No `no-unlock`, `no-quad`, or `unstageable` seeds. |
| 2 | `unscoredReason: dead` conflates won-before-staging with wiped | 109104/109106 record `dead` while `won=true` (global/regional, day 90–91). The driver marks any run that ends before staging as `dead`, whatever ended it. |
| 3 | No staging-attempt records in the corpus | For 109106 (first organic wave-4 fight day 52, won day 90) the corpus can't say which boundary checks failed — quad, standing, or timing. A follow-up instrument should log each boundary check. |
| 4 | Frozen H1a undercounts fight deaths (see §7) | 11 control organic vDie rows at ≤75 HP; 9 have a same-day `monster`-cause death logged for the same villager; all 11 read `leaderDied=false`. |
| 5 | Gate reach is pinned doors only | 6/6 armed-leg organic low-HP deaths unpinned, 0 fire-covered; armed 109104 identical to control. |
| 6 | Armed 109105 worse than its control | Control won global day 90, 0 starvation; armed lost the village regional day 76, 4 starvation. Paired divergence observed, not proven causation. |
| 7 | Starvation guardrail fails | Armed 6 vs control 1 (need ≤ 3). Small numbers, direction against armed. |
| 8 | Wave-5 kills collapse on armed | Scored w5tot 14 → 1; w5 unlocks 8 → 6. Refusals cascade past wave 4. |

## 7. Metric review

- **H1a as frozen measures the flag, not the death.** The fight wrap reads `p.dead` synchronously after `fieldFight` returns, but the game sets the death flag at settlement afterwards. A leader whose HP is driven to 0 in the fight (outcome `vDie`) and who dies of `monster` cause the same day still reads `leaderDied=false`. On control: 11 organic vDie rows at ≤75 HP, 9 confirmed by a same-day monster death in the log (seeds 109101, 109102 ×3, 109104, 109105, 109106 ×2, 109108; two rows — 109106 brian_otieno at 74 HP, 109107 jesse_cortez at 34 HP — have no same-day death logged and are not counted here). The frozen H1a reads 0 on control; the deaths log says the phenomenon is nonzero. This is a measurement defect in my instrument, recorded here, not re-scored: the prereg froze `leaderDied` as implemented, and the verdict follows the frozen bars. A follow-up arm should attribute via the deaths log (same-day monster death of the fight's villager) under a fresh prereg.
- **H1b fails on the merits, not just on supply.** Even if supply had passed, armed downstream kills (14) sit 23 below control (37) against a bar of ≥ 36. Refusing doors costs kills because the refused doors were winnable — 5/5 control staged kills.
- **The staged-door method doesn't reproduce doorstage's danger in live sims.** Doorstage's staged loads showed leaders dying at the pool HPs; in a live village at day 41–71 the same leaders arrive with armor 32–67, a full quad, and win 5/5. The danger doorstage measured (a fresh load, no village behind the leader) doesn't survive contact with a live village. The horizon question as designed can't bite here: there are no staged-door leader deaths to prevent.
- **Supply is a band property, not a fluke.** Two of three unscored seeds won before staging was possible — on this base, `capable` villages reach global and win around day 90, while wave 4 often unlocks late (first organic wave-4 fights day 41–82). The staging window between unlock and win is narrow or nonexistent. A follow-up would need earlier staging, a slower band, or organic-door attribution.
- **Prereg time-label slip (recorded, not silently fixed):** the prereg header says "Frozen: 2026-11-23 ~09:15 UTC" but the anchor commit is 15:17:37 UTC (09:17 CST) — the label should have read ~09:15 CST / ~15:15 UTC. Bars, band, and design are unaffected.
- **What the panel does and doesn't say:** M5 met (`review_required`, no village-death regression signal), but the panel is a screen on 8 paired cases, not a verdict — the verdict is the frozen bars, and they say supply-thin.

## 8. What this does NOT show, and what follows

- It does not show the gate is useless — doorstage-b already showed it saves leaders on staged loads. It shows the gate's horizon effect is unmeasurable on this band with this instrument: too few stageable doors, winnable doors, deaths out of reach, and a flag that misses the deaths that do happen.
- It does not show refusing doors is safe: armed loses 23 downstream wave-4 kills, 13 wave-5 kills, one seed's village (109105), and fails the starvation guardrail. On the evidence here, refusing is the costlier side.
- Follow-up (for the coordinator, not this arm): a re-prereg'd arm that (a) attributes leader deaths via the deaths log instead of the synchronous flag, (b) stages on organic unpinned doors or earlier in the run, and (c) logs every staging-boundary check so unscored reasons are exact. No confirm on this band — the pilot's supply rule forbids it.

## 9. Files

- Prereg: `evidence/2026-11-23/sim-gatehorizon-b-prereg.md` (+ `gatehorizon-b-spec.json`)
- Instrument: `scripts/gatehorizon-driver-b.js`, `scripts/analyze-gatehorizon-b.js`, `scripts/test-gatehorizon-b.js`
- Legs log: `evidence/2026-11-23/gatehorizon-b-legs.log`
- Corpora: `evidence/2026-11-23/perseed-gatehorizon-b-control/` (8), `evidence/2026-11-23/perseed-gatehorizon-b-armed/` (8)
- Analysis: `evidence/2026-11-23/gatehorizon-b-analysis.json`
- Panel: `evidence/2026-11-23/gatehorizon-b-panel.md` (+ `-before/-after.json.gz`, `.json`)
