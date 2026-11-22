# sim-launchfield-rejudge-b — re-judgment of the launchfield recorder on fresh bands (DIAG-NO-GO on completeness)

- **Arm:** sim-launchfield-rejudge-b, Loop B run `fleshout-loop-b-20261122T1630Z`, arm 2 of 2
- **Axis:** winnability chain. **Base:** master `1c11dbb14` (frozen — current tip at freeze, 2026-11-22 ~16:52 UTC)
- **Screen:** four candidate bands in order — B1 107399–107406, B2 107407–107414, B3 107415–107422 (**JUDGED**), B4 107423–107430 (never run — the screen stops at the first supplying band, per the frozen rule). All fresh, verified before freezing — zero namings in every scope.
- **Substrate:** competent verbatim, policy sha `1884c8852d38`; flags `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1 LAUNCHSURVIVE=1`; 150d death-aware, MODE vre.
- **Instrument only:** `scripts/` + `evidence/` only. No `src/js` change. The launch-engine lever (trusted villager at Haven as a wave-4+ companion) is NOT built here — it lives in `villager-brain.js`/`win-plan.js` and is blocked on the held `sim-pinquaddoor-b` branch.
- **Prereg:** `evidence/2026-11-22/sim-launchfield-rejudge-b-prereg.md` (frozen before any judged sim; this is a FRESH judgment on fresh bands — the §7 re-freeze rule governs re-running the same judgment, and no amendment applies).
- **Corpora:** `evidence/2026-11-22/perseed-launchfield-rejudge-b-107399-107406/` (B1), `...-107407-107414/` (B2), `...-107415-107422/` (B3, judged). Screen log: `evidence/2026-11-22/launchfield-rejudge-b-screen.log`. Analyses: `evidence/2026-11-22/launchfield-rejudge-b-analysis-107399-107406.json`, `...-107407-107414.json`, `...-107415-107422.json` (the judged copy is also `launchfield-rejudge-b-analysis.json`).
- **Proof:** `node scripts/test-launchfield-rejudge-b.js` **53 passed, 0 failed** on the frozen base. Analyzer selftest 71/71 green.

## Verdict: DIAG-NO-GO on completeness (NOT supply — the supply clause passes for the first time)

Frozen bar (a)+(b)+(c)+(d) — (a) fails by exactly one part. A miss is NO-GO, never re-scored.

| Clause | Result |
|---|---|
| (a) completeness — day-level unknown (B′ + H) | **PASS** — unknown = 0 (B-unknown 15, H-explained 15, H-skip 0) |
| (a) completeness — Leg S unexplained parts | **FAIL** — **1 unexplained part of 1424** (scored 292, explained 1131): seed 107420, `thabo_maseko` / `reunion`, day 150 part 3, `no-rows` |
| (b) Leg R reproduces the 10 launcheng unknown days exactly | **PASS** — exact, 10/10 |
| (c) instrument validity | **PASS** — 8/8 files, 0 instrument errors, substrate clean on all 8, 9898 holder-state rows, 275 holder-gate rows |
| (d) fresh-band supply — field-encounter fallback fires ≥ 1 fresh-band part | **PASS** — **2 field-encounter parts**, both seed 107419 day 150 part 3 (`visjoin_126`/`reunion` + `lena_ruiz`/`network_note`, one aid encounter vs the `influencer`, outcome `vFlee`) |

**SUPPLY, stated plainly (frozen supply rule):** the fallback fired **twice on fresh data — the first live fire on any fresh band** (held band 0, refreeze band 0, B1 0, B2 0). But both fires are day-150 part-3 — the last part of the horizon — and they share one encounter event. The supply clause passes by the frozen rule, but the fires are boundary parts, not mid-run not-bid days. The verdict's operative clause is completeness (a), which fails by exactly the horizon-edge `no-rows` part.

**Why the one unexplained part — verified from the ledger, not assumed.** The judged band's Leg S ledger contains exactly **three** day-150-part-3 parts: the 2 field-encounter parts and the 1 `no-rows` part. No other d150 p3 part exists anywhere in the ledger, and the `no-rows` part is the **only** `no-rows` part in the entire 1424-part ledger. Thabo's instance reads `scholar` for eleven consecutive parts (days 148–150, parts 0–2 — he spent his last three days with the scholar), then `no-rows` at d150 p3: the run halts at the 150d horizon before the final part's holder-state row is written. The two field-encounter parts show the same shape from the other side — their p3 also has no holder-state row, but the fallback finds the same-day encounter row and explains them. Thabo has no encounter row on day 150, so his p3 stays unexplained. **B2 carries the same shape:** its single unexplained part is seed 107411, `app_mgpspk4k253` / `eater`, day 150 part 3, `no-rows` — again the only `no-rows` part on its band. And the proof test's §3b old-band regression shows the same for the old band: its 2 field-encounter parts (107305 `devon_okafor`/`reunion` + `benoit_lambert`/`eulogy`, suburb/`vFlee`) are also d150 p3. **All four field-encounter fires ever observed are d150 p3, and every unexplained part on a re-judge band is d150 p3.** The completeness failure is a horizon-edge artifact, not a recorder miss mid-run.

**Consequence for the NEXT judgment (not a re-score here):** the frozen completeness bar (0 unexplained parts) cannot pass on a 150d horizon whenever an open not-bid window touches d150 p3 — the next judgment needs a horizon-exclusion clause for the final part, or a horizon that lets p3 complete, before the same judgment is re-run. Do not re-run the same judgment expecting a different result.

## The screen (all three bands run)

| | B1 107399–107406 | B2 107407–107414 | B3 107415–107422 (judged) |
|---|---|---|---|
| Instances opened | 17 (notBid 3, churn 7, unknown 50) | 19 (notBid 6, churn 4, unknown 0) | 33 (notBid 20, churn 5, unknown 0) |
| Leg S parts | 528 (scored 29, explained 499, unexplained 0) | 548 (scored 74, explained 473, unexplained 1) | 1424 (scored 292, explained 1131, unexplained 1) |
| Day-level unknown | **50** (B-unknown 1, H-explained 1) | 0 (B-unknown 11, H-explained 12) | 0 (B-unknown 15, H-explained 15) |
| Field-encounter parts | 0 | 0 | **2** |
| Completeness | FAIL (day-level churn) | FAIL (1 unexplained part) | FAIL (1 unexplained part) |
| Reproduction / instrument | PASS / PASS | PASS / PASS | PASS / PASS |
| Verdict | DIAG-NO-GO, NO-SUPPLY → continue | DIAG-NO-GO, NO-SUPPLY → continue | DIAG-NO-GO, SUPPLY → **judged** |
| Wall (wins / nationalRank / nationalStanding / table) | 0 / 0 / 3 / 0 | 0 / 0 / 4 / 0 | 0 / 0 / 3 / 0 |
| Wall (wave4 / wave5 / median / survived / deaths / starvation / standing-199) | 8 / 3 / 150.5d / 5 / 822 / 2 / 5 | 8 / 4 / 149.5d / 4 / 920 / 2 / 4 | 8 / 3 / 150d / 5 / 752 / 1 / 4 |

B1 ran in two parts (2 seeds, then a resume for the remaining 6). B4 107423–107430 was never run — the screen stopped at the first supplying band, per the frozen rule.

## Before / after (held band vs refreeze vs this re-judge)

| | launchfield-b (107321–107328) | launchfield-refreeze-b (107383–107390) | launchfield-rejudge-b B3 (107415–107422) |
|---|---|---|---|
| Leg S parts | 464 | 16 | 1424 |
| Unexplained parts | **0** | **0** | **1** (d150 p3) |
| Field-encounter parts (fresh band) | 0 | 0 | **2** (d150 p3) |
| Candidate-not-bid instances | 5 | 0 | 20 |
| Churn instances | 3 | 2 | 5 |
| Day-level unknown | 0 | 0 | 0 |
| Leg R reproduction | 10/10 exact | 10/10 exact | 10/10 exact |

## What the judged band shows

- **Instances opened: 33** — launched 6, target-killed 0, selected-blocked 2, bid-not-selected 0, plan-churned-before-dawn 5, candidate-not-bid 20, unknown 0. Funnel: launched-killed 0, launched-fought-no-kill 4, launched-no-meeting 2, target-killed 0, selected-blocked 2, bid-not-selected 0, churned 5, not-bid 20, unknown 0.
- **Instance-days 348; assessed days 288** (dawn 184, midday-only 104); assessed rows 290, midday rows 106, zero-row days 60, unknown zero-row days 15.
- **Leg S ledger: 1424 parts** — scored 292, explained 1131, unexplained 1. whyNot: seed-day 45, on-expedition 3, retargeted 34, scored 292, chore-live 694, gate-pick 154, refresh-blocked 42, away 77, engaged 9, dead 23, field-encounter 2, scholar 48, no-rows 1.
- **Binding gate (reported, not gating): PASS** — `party-no-companion` on 288/288 assessed days. Mechanism DENIED (the launch mechanism never fires: the eligible pool is 0 on all 184 pool snapshots).
- **Pool:** eligible pool size 0 on every snapshot; first-fail reasons: selfOrScholar 368, away 296, notRanger 662, engaged 4, eligible 0. Nobody was ever eligible to stand as companion — same shape as the held band, on a much larger ledger.
- **Launches (legacy sanity, reported):** counted 17, wave-4-target 41, uncounted 24, firstFights 9, noStartCall 0, noCopyLink 0.

### Per-seed (judged band)

| Seed | Days | End | Max wave | Standing | Holder-state rows | Notes |
|---|---|---|---|---|---|---|
| 107415 | 98 | village-lost | 4 | 199 | 83 | earliest loss; standing exactly 199 |
| 107416 | 123 | village-lost | 4 | 199 | 1931 | |
| 107417 | 100 | village-lost | 4 | 195 | 1495 | scored-day read below (amina d99) |
| 107418 | 151 | survived | 5 | 535 | 1963 | gameDays 151 — the known survived-run drift (driver days 150) |
| 107419 | 150 | survived | 5 | 560 | 1518 | both field-encounter parts live here (d150) |
| 107420 | 150 | survived | 4 | 199 | 1251 | the unexplained part lives here (thabo d150 p3) |
| 107421 | 151 | survived | 4 | 199 | 814 | gameDays 151, same drift |
| 107422 | 151 | survived | 5 | 365 | 843 | gameDays 151, same drift |

### Scale wall (judged band, reported every run)

Wins 0/8, national by scaleRank ≥ 2: 0/8, national by standing ≥ 200: 3/8 (107418 standing 535, 107419 standing 560, 107422 standing 365 — all still regional rank, so the rank definition stays 0), table 0/8, wave 4 unlocked 8/8, wave 5 unlocked 3/8, median survival 150 days, survived 5/8, deaths 752, starvation deaths 1, standing-199 stall 4/8. In plain words: every village reaches wave 4, three reach wave 5, three pile up standing past 200 without ever leaving regional rank, four end at exactly 199, none wins — the same wall as the held band, and on this band the launch gate was asked 288 times and answered `party-no-companion` every time.

## Sense-test: holder-days read as a person would

**1. Scored day — 107417 `amina_diallo`, `reunion`, day 99.** Her plan is seeded day 96 and retargeted day 100 (closeDay 100). Day 98: gate-pick, chore-live, refresh-blocked, refresh-blocked. Day 99 part 0 she is **scored**: `party-no-companion`, stage `party`, armed and armored, pool eligible 0 (selfOrScholar 2, away 4, notRanger 2) — the gate asked, and there was nobody to stand beside her. Parts 1–3: chore-live, gate-pick, gate-pick. Day 100: away, away, away, retargeted — the plan moves on the next day. The recorder's story — one scored look at dawn, an empty pool, chores, then gone — matches the rows exactly.

**2. The field-encounter fight — 107419 day 150, one encounter, two explained parts.** Rimay (`visjoin_126`, holder of a `reunion` plan since day 131) meets The Big Beast (the `influencer`, wave 4) in the field and calls for help; Lena (`lena_ruiz`, holder of a `network_note` plan since day 132) answers. Two rounds: Rimay takes 25, deals 63, and they flee at 18% HP. The encounter log reads like a fight, not a table: "Rimay sees The Big Beast coming and cranks a bolt into place — the fight opens at range (3 shots)", one bolt lands for 22, "Rimay's gear absorbs 29", "R1: Ratio hits Rimay for 12 (31 left)". Both holders spent day 150 part 3 in that fight — which is why neither has a Haven row for p3, and why the fallback explains both parts from the same encounter row. The fallback's trigger shape (Haven rows at other parts of the day + a same-day encounter consuming the missing part) is satisfied exactly, for both holders, from one real fight.

**3. The unexplained part — 107420 `thabo_maseko`, `reunion`, day 150 part 3.** His plan is seeded day 138 and still open. Days 148–150 part 2 read `scholar` eleven times running — he spent his last three days with the scholar, and every part has its row. Part 3 of day 150 has no row at all: the run ends at the horizon before the final part is recorded. There is nothing for the analyzer to read — no Haven row, no encounter row, no scholar row. The part is unexplained because the sim stopped, not because the recorder missed a live event.

## Metric review

Judged only against the frozen bar. Completeness fails on the frozen bar by exactly one horizon-edge part; reproduction passes (10/10 exact); instrument passes (proof 53/53, selftest 71/71, 8/8 files, 0 errors, substrate clean). **Clause (d) passes: the field-encounter fallback fired twice on a fresh band, so the verdict is DIAG-NO-GO on completeness, not on supply.** The fallback's trigger shape is real and now observed live — but its entire observed fire history (4 parts: old band 2 + this band 2) sits at d150 p3, so the next judgment should also ask whether the fallback ever fires mid-run, once the horizon edge is excluded. B1's day-level unknown 50 is a separate completeness shape (churn-instance day-level unknown, not parts) — it failed B1's completeness on its own clause and is not the judged band's story.

## Blanks filled / documented

- The held DIAG-GO is now re-judged on fresh bands: the fallback **has** fired on fresh data (2 parts) — supply is no longer the open question; completeness at the horizon edge is.
- The field-encounter fallback's whole observed fire history is now 4 parts, all d150 p3 (old band 2 + B3 2). It has never fired mid-run.
- B2's single unexplained part is the same horizon shape as B3's — two consecutive screened bands each carry exactly one d150 p3 `no-rows` part.
- The `gameDays` 151 vs `days` 150 drift on survived runs persists (107418, 107421, 107422 read 151) — the wall's survived count uses the analyzer's definition, as frozen.
- B1's resume (2 seeds, then 6) is recorded in the screen log; the resumed seeds reproduce the same anchor and policy sha, and the band analysis is complete (8/8 files, 0 errors).

## Addendum — §6 anchor pin, pilot sequence, adoption note (coordinator, 2026-11-22 ~19:00 UTC)

### §6 before / after

**BEFORE (launchstate):** §6 compared the recorded anchor against the same run-time `git merge-base HEAD master` computation that produced it — a tautology. The anchor silently followed the landing rebase and the proof could not catch the move.

**AFTER (this arm, ported from the held arm, re-pointed):** the driver records `anchorCommit` as the FROZEN BASE literal `1c11dbb149a660b7946aaefb2e95c29c14bf5548` and `anchorHead` as run-time HEAD, and still refuses (exit 2) unless the run-time merge-base IS the frozen base (stale-base tripwire). §6 asserts the live run's `anchorCommit` EQUALS the frozen literal; §6b fires the tripwire live with a git shim that answers `merge-base` as `4266e6ccef2a` (a real base that differs) — the driver stops with `LAUNCHFIELD STOP: merge-base 4266e6ccef2a !== frozen base 1c11dbb149a6 — re-freeze, do not amend silently.` Proof on the frozen tip: **53 passed, 0 failed** (incl. §6b's checks; analyzer selftest 71/71; §3b old-band regression green — the 2 previously-unexplained parts close as `field-encounter`, 107305 `devon_okafor`/`reunion` + `benoit_lambert`/`eulogy`, d150 p3).

### Pilot sequence (worker)

- **Proof test:** 53/53 green on the frozen tip before the screen. §4 live 150d run on screening seed 107399 recorded 916 holder-state rows, 19 gate picks, 21 seed rows, 22 pool rows, 148 census rows. D1/D2 at 30d green (repeatability + recorder neutrality).
- **Screen (~17:12–18:27 UTC):** B1 driver 17:12:26–17:31:55Z (resume after 2 seeds), analyzer DIAG-NO-GO, fe 0, NO-SUPPLY → continue; B2 driver 17:32:06–17:56:09Z, analyzer DIAG-NO-GO, fe 0, NO-SUPPLY → continue; B3 driver 17:56:18–18:27:03Z, analyzer DIAG-NO-GO, fe 2, SUPPLY → judged. B4 never run. Screen end 18:27:23Z, JUDGED=107415–107422.
- **Worker timeout:** the run timed out at ~18:27+ before this evidence file was written. Nothing was committed by the worker. The adoption coordinator verified the verdict independently from the three analysis JSONs and the screen log (reconciling why three bands exist when the report names one: the screen runs bands in order and judges the first that supplies) and wrote this file.

### Adoption verification (coordinator, independent of the worker's word)

- Re-read the judged analysis JSON: verdict DIAG-NO-GO; completeness FAIL (unknown 0, sUnexplained 1 of 1424); reproduction PASS exact 10/10; instrument PASS (8 files, 0 errors, holder-state 9898, holder-gate 275). The single unexplained part re-found by direct search: `{seed: 107420, vid: thabo_maseko, target: reunion, day: 150, part: 3, whyNot: no-rows}` — the only `no-rows` part in the band.
- Re-read B1/B2 analyses: B1 fe absent (0), day-level unknown 50, unexplained 0; B2 fe absent (0), unexplained 1 (`107411 app_mgpspk4k253/eater d150 p3 no-rows`). Both passed over for no supply, per the frozen screen rule.
- Day-150-part-3 census over the judged band: exactly 3 parts — 2 `field-encounter`, 1 `no-rows`. The horizon-truncation attribution for the unexplained part is the data pattern, not an assumption.
- The two field-encounter parts re-found with their instances: `visjoin_126`/`reunion` (seedDay 131) and `lena_ruiz`/`network_note` (seedDay 132), both seed 107419 d150 p3, both carrying the same encounter `{mid: influencer, outcome: vFlee, origin: aid}` — confirmed against the raw 107419 corpus as one aid fight (Rimay called, Lena answered, 2 rounds, fled at 18% HP).
