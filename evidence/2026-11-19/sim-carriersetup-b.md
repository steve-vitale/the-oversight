# sim-carriersetup-b — Rage-carrier setup fixes: free action vs HP/armor floor (Loop B 0130Z run)

## Verdict: BOTH VARIANTS NO-GO, THIN-POOL — the pool missed its floor on the control leg, and neither variant would have passed on the bars anyway

**Frozen prereg:** `evidence/2026-11-18/sim-carriersetup-b-prereg.md` (this run, frozen 2026-11-18 ~20:00 CST, before any new sim).
**Base master:** `48c81dac6`. **Branch:** `sim-carriersetup-b`.
**Band:** fresh 104931–104938, 8 seeds/leg, 150d death-aware, competent policy.
**Substrate all legs:** `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + LAUNCHPARTY=1` (same as the confirm). PARTYSIZE4 NOT set. Legs differ ONLY by env — no code revert between legs.
**Analysis:** `evidence/2026-11-18/carriersetup-b-free-analysis.json` + `carriersetup-b-floor-analysis.json`.
**Panels:** `evidence/2026-11-18/carriersetup-b-panel-free.md` + `carriersetup-b-panel-floor.md` — both `review_required` (screen only; the frozen bars are the judge).
**Proofs:** `scripts/test-carriersetup-b.js` 52/52, `scripts/test-carriersetup-instr-a.js` 14/14, `scripts/analyze-fieldcarrier-a.js --selftest` 29/29.
**Build:** `57d54f00a` ([needs-eyes] — free-action variant FIELDCAPFREE + HP/armor-floor variant FIELDCAPFLOOR; HELD, do not land).

## The work, in plain words

The last measurement found the Rage carrier costs the fighter their first strike: round one goes to going red instead of hitting, and twice the fighter died where the same fight without the carrier ended with them walking away. This arm tests the finding's two named fixes, each against the same control, on the same fresh band:

- **free** — Rage as a free action that strikes the same round. The setup no longer eats the first strike: the Rage branch sets the multiplier and lets the caller proceed to the strike block, so the first doubled strike lands in the fire round. Total doubled strikes stay 3 — they start a round earlier, they are not a fourth.
- **floor** — the carrier does not fire when the holder is too hurt or too thinly armored to survive the setup round: holder HP ≥ 50% of max AND worn armor P ≥ 10. A floor-blocked carrier is never paid for (the 60-kcal Rage pay is refused before the check) and the fighter strikes instead that round.

## Verdicts (frozen ladder — no re-scoring)

| Bar | Control | Free | Floor |
| --- | --- | --- | --- |
| Pool floor (pair n) | **8 (< 10)** | 9 (≥ 6) | 7 (≥ 6) |
| Pair kill share (bar ≥ 0.25) | 0/8 = 0.000 | **0/9 = 0.000** | **0/7 = 0.000** |
| Kill-share ratio (bar ≥ 2× ctl, or > 0 kills if ctl 0) | — | FAIL (0 kills) | FAIL (0 kills) |
| Community loss (bar ≤ ctl + 0.125) | 4/8 | 4/8 PASS | 5/8 PASS (exactly at bar) |
| Starvation (bar ≤ ctl + 2) | 3 | 2 PASS | 2 PASS |
| Median survival (bar ≥ 0.8× ctl) | 132.5d | 149.5d PASS | 126.5d PASS |
| Instrument errors (bar 0) | 0 | 0 PASS | 0 PASS |
| Mechanism | ctl fires 0 | 5 fires, all 5 free-action | 4 judged fires, all meeting floor; 8 floor-block records |
| Paired setup-death (bar 0) | — | **0 PASS** | **1 FAIL** |
| **Verdict** | — | **NO-GO, THIN-POOL** | **NO-GO, THIN-POOL** |

The pool floor fails on the **control** leg (8 < 10), so by the frozen ladder the whole pilot is NO-GO THIN-POOL and the kill-share question stays inconclusive. But the thin pool is not hiding a passing arm — the same record the confirm made: had the pool been met, free would still be NO-GO on kill share (0/9) and floor would still be NO-GO on kill share (0/7) plus the paired-death bar.

## Free: the setup death is fixed, the kill is not

The mechanism works exactly as designed. The carrier fired 5 times in the judged population and **all 5 were free-action fires** — a doubled strike landed in the fire round every time:

| Seed/day | Holder | Monster | Outcome | Rounds | Dealt | HP at start | Armor |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 104933 d49 | gen_oucn30v | influencer | vFlee | 4 | 224 | 77% | 17 |
| 104934 d47 | gen_84omzrj | eulogy | mFlee | 1 | 0 | 89% | 7 |
| 104934 d77 | pavel_dubinin | congregation | vFlee | 3 | 157 | 97% | 11 |
| 104935 d126 | somchai_prasert | suburb | vFlee | 9 | 791 | 82% | 35 |
| 104938 d43 | zoe_adams | eulogy | vFlee | 4 | 212 | 84% | 16 |

- **Paired setup-deaths: 0.** The two deaths on the free leg are bit-identical to the control leg's two deaths (104936 d98 + d100, both Audit, both starving holders the carrier never fired on — tier-gated, see below). The free variant neither saved nor killed anyone extra on the judged pairs.
- **Damage moves, kills don't.** Damage/round on judged pairs: free mean 37.5 (max 87.9) vs ctl 24.9 (max 44.0) — about 50% more. But the best fire (Somchai, 791 damage over 9 rounds, ~88/round) still fled. The winning rung on the damage ladder is ~111/round; the free strike lifts the party from ~25 to ~38, still a third short. The setup turn was a cost, but removing it does not buy a kill on this band — the party's damage is the binding constraint, not the lost round.
- Pair outcomes: free vFlee 6 / mFlee 1 / vDie 2; ctl vFlee 5 / mFlee 1 / vDie 2. Zero kills on either leg.
- Non-fires on the free leg (5 rows): tier-gate 2 (both starving Audit holders above — the gate is the food tier, not the carrier), neither 3, hunger-gate 0, evade 0.
- Funnel: ctl encounters 20 → joined 20 → pairLaunch 16 → partyAbsent 0 → evadeExcluded 1; free encounters 26 → joined 26 → pairLaunch 20 → partyAbsent 0 → evadeExcluded 2. The sense substrate holds here too — the party is never absent.

## Floor: the floor gates fires, but the setup death happens anyway — on a healthy holder

- **The floor works as a gate.** 8 floor-block records in the corpus (7 non-fires: 2 armor, 5 hp; plus 1 row where the carrier fired and a floor-block was also recorded). All 4 judged fires met the floor at fight start. The mechanism check passes.
- **The paired setup-death bar FAILS — 1.** Seed 104934 day 77, Pavel Dubinin vs Congregation: on the floor leg Pavel fires (97% HP, armor 11 — comfortably above the floor), deals 197 damage in 4 rounds, and **dies**; on the control twin he fled after 3 rounds and 94 damage. This is the Carlos/Theo shape reproduced on a holder the floor explicitly approved. The setup turn's cost is not (only) holder fragility: a healthy, armored holder still dies paying a round of incoming damage with no outgoing strike. The floor cannot see the death coming, because the floor measures the holder and the killer is the lost round.
- The two control-leg audit deaths do not occur on the floor leg at all (trajectory divergence — the floor leg's villages walk different ground), so the floor's pair vDie count is 1 vs ctl 2 — but the paired comparison is what the bar judges, and it fails.
- Damage/round on judged pairs: floor mean 29.1 (max 49.2) vs ctl 24.9 — a small lift, far below the winning rung. Pair outcomes: floor vFlee 5 / mFlee 1 / vDie 1.
- Non-fires on the floor leg (12 rows): floor-blocked 7, tier-gate 1, neither 4, hunger-gate 0, evade 0.
- Funnel: floor encounters 22 → joined 22 → pairLaunch 17 → partyAbsent 1 → noLaunchPlan 1 → evadeExcluded 2.

## The pool miss, measured

The prereg floor was ctl pair n ≥ 10, derived from the confirm control leg's delivery of 14. This band's control delivered **8**. The confirm's §9 lesson was that a floor derived from control-leg behavior does not bind an arm that moves its own villages — here even the control under-delivered, so the miss is band thinness, not arm divergence: ctl encounters 20 (vs the confirm arm's 34 meetings), pair n 8 (vs 14). The floor derivation was honest and still missed; the next pool design needs a larger band or a floor judged on the control leg's delivery with the arm's pool reported beside it. No confirm band spent (104941–104956 stays fresh).

## Wall numbers (per leg, 8 seeds each)

| | Control | Free | Floor |
| --- | --- | --- | --- |
| Wins (full seat) | 0 | 0 | 0 |
| National scale | 0 | 0 | 0 |
| Wave 4 reached | 8/8 | 8/8 | 8/8 |
| Wave 5 reached | 3/8 | 2/8 | 2/8 |
| Median survival | 132.5d | 149.5d | 126.5d |
| Community lost | 4/8 | 4/8 | 5/8 |
| Starvation (total / villager) | 3 / 3 | 2 / 2 | 2 / 2 |

No village took the full seat on any leg; no village reached national.

## §15 panels (screen only)

- **Free:** `review_required`. Village deaths per run +4.5 (71.5 → 76, regression_watch, interval 0 to 10.625); community loss 0.000 (0.5 → 0.5); national 0 → 0; table win rate 0 → 0.
- **Floor:** `review_required`. Community loss +0.125 (0.5 → 0.625, regression_watch, interval 0 to 0.375); village deaths per run +2.5 (71.5 → 74); village deaths per 100 days +5.05 (regression_watch, interval crosses zero).

The panels corroborate the frozen cost bars from the other direction: the floor's community-loss watch is the same +1 village the frozen bar passes exactly at its limit.

## Sense-test (villagers acting like people)

Read from the fight rows. The Pavel story is the honest one: a healthy holder at 97% health, armored, fires Rage on a Congregation and dies in four rounds while dealing nearly 200 damage — his control twin, same fight, same ground, walks away after three. Nothing about the floor leg reads staged; the floor simply cannot tell a survivable setup from a fatal one, because it reads the holder's health and the fatal thing is the monster's turn. The Somchai story is the other honest one: nine rounds, 791 damage, the biggest free-action fire of the run — and the party still leaves the Suburb alive. The two starving Audit deaths are the same shape as the confirm's: holders too hungry for the tier gate to let the carrier fire at all, dying on 32 and 22 damage. No narration defect in this arm's corpora.

## What this means for finding #2568

Two of the finding's three questions are now answered, and the third is reframed:

1. **Does the free action remove the setup death? Yes.** 5 free fires, 0 paired deaths, the two leg deaths bit-identical to control. The setup turn as a death cause is fixed by striking in the fire round.
2. **Does the floor remove the setup death? No.** A healthy holder meeting the floor still died on the setup turn's cost. The floor gates fires (8 blocks) but the death it exists to prevent happened on a fire it approved. Holder fragility is not the (only) mechanism.
3. **Does either convert fights to kills? No — 0 kills on 16 judged variant meetings.** The free variant proves the strike alone doesn't convert: damage rises ~50% and still sits a third below the winning rung. The carrier's value is capped by party damage, not the setup turn. The next arm is a damage question (what lifts a launched party from ~38/round to ~111/round), not a setup question.

## Reconciliation with Loop A's sim-rage-setup-a (finding #2568, parallel arm)

Loop A built the same free-action idea in parallel on branch `sim-rage-setup-a` (tip `6198f7ea3`, RAGEFREE flag, `src/js/godpath.js` only — a different code path from this arm's FIELDCAPFREE in `fieldFights.js` + `godpath.js`). Its worker reported **NO-GO** (pilot, kill-share bars missed); its evidence was not yet written when this file was frozen and the Loop A 0115Z adoption is still in flight, so the final numbers await its evidence. Both free-action implementations lean NO-GO and both stay HELD; the floor variant is unique to this arm. No landing conflict: **nothing from either arm merges as game code** — this arm lands evidence only, and the lever commits (`57d54f00a` build, the held substrate `12051fed5` and carrier `403cf6b63` cherry-picks) stay on the branch. The driver/analyzer/panel adaptations (`a3fc095be`) also stay on the branch: they reference the held flags and would leave a broken driver if landed without the src.

## Metric review

- **No metric was re-scored.** The verdicts follow the frozen ladder: pool floor missed on the control leg (8 < 10) → NO-GO THIN-POOL for both variants. The kill-share and paired-death bars are reported beside the pool miss, not substituted for it — and they show the thin pool is not hiding a passing arm.
- **Pool derivation, disclosed (again):** the floor (ctl ≥ 10) sat below the confirm control's measured delivery (14) and still missed, because this band's control delivered 8. Same lesson as the confirm's §9, one step further: the derivation can miss on the control leg itself. Next prereg: larger band, or judge the pool on the control leg's delivery.
- **Floor-block counting, disclosed:** the analyzer records 8 floor-block rows; 7 are non-fires (2 armor, 5 hp) and 1 is a world-tick meeting where the carrier fired and a floor-block was also recorded (Aroha d61, outside the judged population — the judged fires are 4/4 floor-meeting). The mechanism check counts blocks + judged fires meeting the floor; the count is reported both ways so the 8 vs 7 cannot be misread.
- **Trajectory divergence, disclosed:** the floor leg's villages diverge from control (the two ctl audit deaths never occur there; Pavel's death occurs only there). The paired comparison isolates the carrier as the only difference per meeting, so the Pavel paired death stands as the setup cost reproduced; the divergence itself is a pool-design input, not a verdict input.
- **No fresh band was run beyond the pilot.** Neither variant passed the pilot sniff, so no confirm band (104941–104956) was spent.

## Proofs

- `node scripts/test-carriersetup-b.js`: 52 passed, 0 failed.
- `node scripts/test-carriersetup-instr-a.js`: 14 passed, 0 failed.
- `node scripts/analyze-fieldcarrier-a.js --selftest`: 29 passed, 0 failed.
- `node --check` clean on all touched scripts. Legs: ctl exit 0 (8/8 seeds), free exit 0 (8/8), floor exit 0 (8/8); instrument errors 0 on all 24 per-seed files.
- No `check.js` gate on this arm's branch (held lever; the round gate runs on the landed tip — see the round evidence).

## Landing

**Evidence only. Lever HELD.** Commit the evidence (prereg, this file, analysis JSONs, panels, logs, corpora, chain script) and land it by cherry-pick; the build commit `57d54f00a`, the tooling adaptation `a3fc095be`, and the held substrate/carrier cherry-picks stay on branch `sim-carriersetup-b`, never to merge. Finding #2568 updated in `hidden_files/sim-findings.md` with this run's outcome. Confirm band 104911–104926 (fieldcarrier-confirm) and 104941–104956 (this arm) both stay fresh.
